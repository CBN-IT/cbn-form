/**
 * A library that implements form serialization.
 */

(function(CbnForm) {
	
	/**
	 * An utility object that implements several form / model serialization methods.
	 */
	CbnForm.Serialization = {
		
		/**
		 * Receives a list of form elements and returns the list of serialized key-value pairs.
		 * 
		 * Use this if you don't use CbnForm's automatic value to form model mapping.
		 * 
		 * @param {Array|NodeList} elements The list of input elements to serialize.
		 * @return {[KVPair]} The key-value pairs list containing the form values found.
		 */
		serializeFormElements: function (elements) {
			var pairs = [];
			for (var i=0; i<elements.length; i++) {
				var el = /**@type {HTMLElement}*/elements[i];
				if (CbnForm.Serialization._useInputValue(el)) {
					pairs.push( { key: el.name, value: el.value } );
				}
			}
			return pairs;
		},
		
		
		/**
		 * Swiss-army-serialization-method.
		 * 
		 * The serialization process is split in two:
		 * 
		 * 1. The complex model object is converted into a intermediate representation that is a key-value pairs array 
		 * (which represents HTTP parameters). Multiple serialization modes are available (see `serializationModes`).
		 * 
		 * 2. The intermediate representation is optionally encoded to a format that can be sent over the network 
		 * (e.g. to String using urlencoded, or as multipart/form-data). See `encodingFormats`.
		 * 
		 * Furthermore, each serialization mode accepts a list of options that control the serialization process, which 
		 * can be supplied using the `options` parameter.
		 * 
		 * You can control the serialization using the following options:
		 * 
		 * - `mode`: specify the serialization mode (how to serialize the model object to a pairs list); available modes: 
		 *           'plain', 'deep', 'json'; you can skip this phase if you give it an array of already-serialized 
		 *           key-value pairs to use;
		 * - `as`: defines the output encoding format ('urlencoded', 'FormData', 'json', 'pairs', 'map'); if not specified, 
		 *           the default is to return the array of serialized pairs.
		 * 
		 * A special consideration for the 'json' output format: if the function is given a list of key-value pairs, it 
		 * will be converted to the 'map'-like format before returning it as stringified JSON data.
		 * 
		 * Warning: if the form contains any Blob/File objects, the encoding format will be forced to `FormData`.
		 * If you want to prevent this from happening, specify the `skipFiles` option.
		 * 
		 * @param {Object|Array} model The data to serialize / The list of already-serialized key-value pairs.
		 * @param {CbnForm.SerializationOptions} options An object with serialization settings.
		 * @return {String|FormData|Object<String,String>} The serialized/encoded object.
		 */
		serialize: function (model, options) {
			var mode = options.mode || 'plain', encodeAs = options.as;
			
			/**
			 * Stores the intermediate K-V pairs.
			 * @type {[KVPair]}
			 */
			var pairs;
			
			if (Array.isArray(model)) {
				// hope the user gave us a KVPair array
				pairs = /**@type {[KVPair]}*/(model);
				
				if (encodeAs == 'json') {
					// we can't send the intermediate representation as JSON to the server, it's too ugly...
					// so serialize it to a JS key-value map
					pairs = this.encodingFormats['map'](pairs);
				}
				
			} else if (encodeAs == 'json') {
				pairs = model; // special encoding: receives the model object, not the pairs list
				
			} else {
				// pass it through phase 1 serialization
				if (!mode || !this.serializationModes[mode]) {
					return null; // invalid options
				}
				pairs = this.serializationModes[mode](model, options);
			}
			
			// check if the pairs contain any Blob/File objects
			var hasFiles = false;
			if (pairs && Array.isArray(pairs)) {
				hasFiles = pairs.some(function(pair) {
					if (pair.value && pair.value instanceof Blob) {
						return true;
					}
					return false;
				});
			}
			
			// encode the data in the requested format (phase 2)
			if (!encodeAs) {
				return pairs;
			} else if (hasFiles) {
				return this.encodingFormats['FormData'](pairs);
			} else if (this.encodingFormats[encodeAs]) {
				return this.encodingFormats[encodeAs](pairs);
			}
			// something is wrong, just return null
			return null;
		},
		
		/**
		 * Stores the available serialization modes.
		 * 
		 * All methods must output the serialized data in the following intermediate format: 
		 * `[ { key: String, value: String } ]` (i.e. a list of key-value pairs). 
		 * 
		 * This format can then be converted by `serialize` to the form's output format (e.g. FormData, 
		 * urlencoded string etc.).
		 */
		serializationModes: {
			
			/**
			 * Serializes the model object as a plain key-value list using the following rules: 
			 * 
			 * - simple/primitive types (strings, numbers, booleans) will be directly converted to strings;
			 * - null/undefined values are added as empty strings (e.g. `undefined` will be set as '');
			 * - if `booleans` is specified, boolean false means don't add the parameter, true means add it with the value 
			 *   specified inside the `booleans` setting;
			 * - arrays are unpacked by default (a parameter is added for each value); if you want to serialize them, 
			 *   see the `jsonArrays` option;
			 * - object values will be serialized to JSON using `JSON.stringify`;
			 * - of the value is a File/Blob object, the reference is set but the encoding format must be 'FormData'.
			 * 
			 * Configurable options:
			 * 
			 * - `useBrackets`: if true, brackets will be added to the parameters with array values;
			 * - `booleans`: if true, the boolean values have HTML checkbox behavior (true means include the value);
			 * - `jsonArrays`: if true, will not unpack array values but serialize them to JSON right away;
			 * - `jsonAll`: if true, will serialize every value (including primitive types) to JSON.
			 * 
			 * Example:
			 * ```
			 *     plain({ one: 1, two: 'two2', 'list': [ 'one', 'two' ] }, { useBrackets: true })
			 *     // => one=1, two=two2, list[]=one, list[]=two
			 *     // (example uses a readable POST representation of the serialized key-value pairs)
			 *     // another one:
			 *     plain({ someObject: { another: 'object', with: 'values' }, ... })
			 *     // => someObject={"another":"object","with":"values"}, ...
			 * ```
			 * 
			 * @param {Object} model The input form model to serialize.
			 * @param {CbnForm.SerializationOptions} options The `serializationOptions` object that may contain extra 
			 *                                               settings for the serialization.
			 * @returns {[KVPair]} The resulting intermediate representation of the model (K-V pairs).
			 */
			'plain': function(model, options) {
				var pairs = [];
				
				// consider it an empty model
				if (!model) return pairs;
				
				/**
				 * Serializes a single value using the rules defined for this serialization mode.
				 * 
				 * @param {*} value The value to serialize.
				 * @return {String|Blob} The serialized value.
				 */
				function serializeValue(value) {
					// serialize the value as JSON?
					var asJson = options.jsonAll || (value && typeof value == 'object'); // includes arrays
					if (value && value instanceof Blob) {
						if (options.skipFiles)
							return undefined;
						return value;
					} if (asJson) {
						return JSON.stringify(value);
					} else if (typeof value == 'boolean' && options.booleans) {
						return ( value ? options.booleans + '' : undefined ); // undefined skips this value
					} else if (value === null || value === undefined) { // empty value
						return '';
					} else {
						return (value.toString ? value.toString() : value+'');
					}
				}
				
				// flatten the model object
				for (var n in model) {
					if (!model.hasOwnProperty(n)) continue;
					
					if (Array.isArray(model[n]) && !options.jsonArrays && !options.jsonAll) {
						model[n].forEach(function(value) {
							value = serializeValue(value);
							if (value === undefined) return; // undefined means do not include
							pairs.push({ key: n + (options.useBrackets ? "[]" : ""), value: value });
						});
					} else {
						var value = serializeValue(model[n]);
						if (value === undefined) continue; // undefined means do not include
						pairs.push({ key: n, value: value });
					}
				}
				return pairs;
			},
			
			/**
			 * A convenient serialization mode that passes the whole model as a JSON-serialized parameter.
			 * 
			 * Uses the `paramName` setting to specify the name of the parameter which will contain the serialized value.
			 * If not specified, defaults to 'data'.
			 * 
			 * If any Blob/File objects are present as model values (and unless options.skipFiles is set), those objects 
			 * will be returned as separate pairs (for use with the 'FormData' encoding).
			 * 
			 * No other options have effect on the serialization.
			 * 
			 * @param {Object} model The input form model to serialize.
			 * @param {CbnForm.SerializationOptions} options The `serializationOptions` object that may contain extra
			 *                                               settings for the serialization.
			 * @returns {[KVPair]} The resulting intermediate representation of the model (K-V pairs).
			 */
			'json': function(model, options) {
				var jsonModel = {};
				var files = [];
				Object.getOwnPropertyNames(model).forEach(function(k){
					if (model[k] && model[k] instanceof Blob) {
						files.push({
							key: k,
							value: model[k]
						});
					} else {
						jsonModel[k] = model[k];
					}
				}, this);
				
				var pairs = [ { 
					key: (options.paramName ? options.paramName : 'data'), 
					value: JSON.stringify(jsonModel) 
				} ];
				if (files.length && !options.skipFiles) {
					pairs = pairs.concat(files);
				}
				return pairs;
			},
			
			/**
			 * Serializes the module by recursively iterating over all its values and adding parameters with full object 
			 * paths as name and scalar values.
			 * 
			 * The serialization has the following behavior / rules:
			 * 
			 * - simple property types (strings, numbers) will appended to the parameters map;
			 * - null/undefined values are set as empty strings (e.g. `undefined` will be set as '');
			 * - if `booleans` is specified, boolean false means don't add the parameter, true means add it with the value 
			 *   specified inside the `booleans` setting;
			 * - arrays an objects will be recursively iterated through and their values will be added to the parameters 
			 *   list, paired with their path along the model object;
			 * - File/Blob objects will be appended by reference (for use with the 'FormData' encoding), unless 
			 *   `options.skipFiles` is true.
			 * 
			 * Accepted options:
			 * 
			 * - `prefix`: An optional path prefix to start from;
			 * - `booleans`: if true, the boolean values have HTML checkbox behavior (true means include the value);
			 * - `useBrackets`: use brackets around array indices (e.g. 'array[0].value' vs 'array.0.value');
			 * - `concatArrIndex`: concatenates the index to the array's name instead (e.g. 'array0.value', 'array1.value' etc.)
			 * 
			 * Example: 
			 * ```
			 *    deep( { a: { very: ['deep', 'object'] }, t: {should: 'be fine'}, simple: true } )
			 *    // => a.very.0=deep, a.very.1=object, t.should="be fine", simple=true
			 * ```
			 * 
			 * @param {Object} model The input form model to serialize.
			 * @param {CbnForm.SerializationOptions} options The `serializationOptions` object that may contain extra
			 *                                               settings for the serialization.
			 * @returns {[KVPair]} The resulting intermediate representation of the model (K-V pairs).
			 */
			'deep': function(model, options) {
				var pairs = [];
				
				// empty model => empty pairs list
				if (!model) return pairs;
				
				// the recursive function
				function deepSerializeObject(prefix, value) {
					var i, n;
					
					if (Array.isArray(value)) {
						for (i = 0; i < value.length; i++) {
							n = (options.useBrackets ? "[" + i + "]" : (options.concatArrIndex ? i : '.' + i ));
							deepSerializeObject(prefix + n, value[i]);
						}
					} else if (value && value instanceof Blob) {
						if (!options.skipFiles)
							pairs.push({key: prefix, value: value });
						
					} else if (value && typeof value == 'object') {
						for (n in value) {
							if (!value.hasOwnProperty(n)) continue;
							deepSerializeObject((prefix ? prefix + '.' : '') + n, value[n]);
						}
						
					} else if (typeof value == 'boolean' && options.booleans) {
						if (value) pairs.push({key: prefix, value: options.booleans });
						
					} else if (value === null || value === undefined) { // empty value
						pairs.push({key: prefix, value: ""});
						
					} else {
						pairs.push({key: prefix, value: (value.toString ? value.toString() : value + '')});
					}
				}
				
				// start the deserialization!
				deepSerializeObject((options.prefix ? options.prefix : ''), model);
				
				return pairs;
			}
		},
		
		/**
		 * Defines the formats that can be used to encode an array of serialized key-value pairs to a representation 
		 * well-suited for network transmission (usually via HTTP).
		 */
		encodingFormats: {
			
			/**
			 * Encodes the given key-value pairs list into a FormData object (which is best used for transferring data 
			 * that contains files).
			 * 
			 * @param {[KVPair]} pairs The pairs list to encode.
			 * @returns {FormData|Window.FormData} The FormData object filled with the parameters.
			 */
			'FormData': function(pairs) {
				var data = new FormData();
				for (var i=0; i < pairs.length; i++) {
					data.append(pairs[i].key, pairs[i].value);
				}
				return data;
			},
			
			/**
			 * Encodes the given key-value pairs list into a string using the 'x-www-form-urlencoded' format.
			 * 
			 * @param {[KVPair]} pairs The pairs list to encode.
			 * @returns {String} The urlencoded string.
			 */
			'urlencoded': function(pairs) {
				var data = [];
				for (var i=0; i < pairs.length; i++) {
					data.push(encodeURIComponent(pairs[i].key) + '=' +
						encodeURIComponent(pairs[i].value));
				}
				return data.join('&');
			},
			
			/**
			 * A special encoder to use with 'application/json'. Returns the stringified data (to be inserted as body).
			 * 
			 * @param {Object} model The object to encode.
			 * @returns {String} The resulting JSON string.
			 */
			'json': function(model) {
				return JSON.stringify(model);
			},
			
			/**
			 * Doesn't encode anything, simply returns the key-value pairs list (`f(x)=x`).
			 * 
			 * @param {[KVPair]} pairs The pairs list to encode.
			 * @returns {[KVPair]} The unaltered pairs list.
			 */
			'pairs': function(pairs) {
				return pairs;
			},
			
			/**
			 * Returns pairs list as a flat JSON map.
			 * 
			 * If multiple values exist with the same key, the map will contain an array of values for that key.
			 * 
			 * Example: 
			 * ```
			 *    // for [ key1=val1, key2=val2, key2=val3 ] it outputs:
			 *    { "key1": "val1", "key2": [ "val2", "val3" ] }
			 * ```
			 * 
			 * @param {[KVPair]} pairs The pairs list to encode.
			 * @returns {Object<String,String|[String]>} The FormData object filled with the parameters.
			 */
			'jsonMap': function(pairs) {
				var data = {};
				for (var i=0; i < pairs.length; i++) {
					if (data[pairs[i].key]) {
						if (!Array.isArray(data[pairs[i].key]))
							data[pairs[i].key] = [ data[pairs[i].key] ];
						data[pairs[i].key].push(pairs[i].value);
					} else {
						data[pairs[i].key] = pairs[i].value;
					}
				}
				return data;
			}
		},
		
		// Utility methods:
		
		_serializeSingleValue: function (value) {
			
		},
		
		/**
		 * Returns whether the given input's value should be used (included in the serialized form data).
		 *
		 * @param {HTMLElement} formElement The HTML form element to verify.
		 * @returns {Boolean}
		 */
		_useInputValue: function (formElement) {
			var el = /**@type {Object}*/(formElement);
			// skip disabled elements or elements that don't have a `name` attribute.
			if (el.disabled || !el.name) {
				return false;
			}
			
			// Checkboxes and radio buttons should only use their value if they're
			// checked. Custom paper-checkbox and paper-radio-button elements
			// don't have a type, but they have the correct role set.
			if (el.type == 'checkbox' ||
				el.type == 'radio' ||
				el.getAttribute('role') == 'checkbox' ||
				el.getAttribute('role') == 'radio') {
				return el.checked;
			}
			return true;
		}
		
	};
	
	/**
	 * Describes the format of the `serializationOptions` property.
	 * 
	 * @typedef {Object} CbnForm.SerializationOptions
	 * @property {String} [mode] The conversion method to use for complex model objects (plain / json / deep).
	 * @property {String} [as] The output encoding format ('urlencoded' / 'FormData' / 'pairs' / 'jsonMap').
	 * @property {Boolean} [useBrackets] Whether to add brackets when serializing arrays (plain/deep modes).
	 * @property {Boolean} [concatArrIndex] Concatenates the index to the array name (deep mode).
	 * @property {Boolean|String} [booleans] Activate special handling for booleans (for plain mode).
	 * @property {Boolean} [skipFiles] What to do with File/Blob objects (whether to skip them from serialization).
	 * @property {Boolean} [jsonArrays] Whether to also serialize Array values as JSON (for plain mode).
	 * @property {Boolean} [jsonAll] Whether to serialize all value types as JSON (for plain mode).
	 * @property {String} [paramName] The name of the parameter to use for storing the serialized value (json mode).
	 * @property {String} [prefix] A prefix to append to all resulting paths (deep mode).
	 */
	
	/**
	 * A simple key-value entry.
	 * 
	 * @typedef {Object} KVPair
	 * @property {String} key The key.
	 * @property {String} value The value.
	 */
	
})(window.Cbn.Form);
