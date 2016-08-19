(function(CbnForm) {
	
	/**
	 * The `CbnForm.DynamicElement` behavior is used to tell `cbn-dynamic-form` which attributes are configurable from 
	 * a template.
	 * 
	 * In order to do this, you must specify a `dynamicAttributes` property on the prototype where you enumerate all 
	 * properties that can be specified inside the dynamic config/template object. It has the following format:
	 * 
	 * - either a map with simple `'propertyName': true` pairs, which tells the dynamic component to allow attributes 
	 *   with that name (will be properly converted to dash-case);
	 * - or a more verbose map with object value: `'propertyName': { type: '(attribute|property)', name: 'attribute-name' }`, 
	 *   which you can use to customize whether to set a HTML attribute or a DOM property and its name.
	 * 
	 * For example, if you have `{ "exampleProp": { type: 'attribute', name: 'example-attr' } }` and the template object 
	 * contains `{ "exampleProp": "example-value" }`, the element will have the `example-attr="example-value"` HTML 
	 * attribute.
	 * 
	 * Most `cbn-form` behaviors already specify a list of `dynamicAttributes`. They will be automatically inherited when 
	 * you include the behavior in your element (at `create` callback, the dynamic component will scan all behaviors and 
	 * will merge them into the main `dynamicAttributes` map).
	 * 
	 * @polymerBehavior
	 */
	CbnForm.DynamicElement = {
		
		properties: {
			
			/**
			 * If the element was instantiated dynamically (using `cbn-dynamic-form`), this will return the source 
			 * configuration object used to generate the current instance.
			 */
			sourceDynamicConfig: {
				type: Object,
				readOnly: true
			},
			
			/**
			 * Identifies whether an element was dynamically created.
			 */
			_isDynamicElement: {
				type: Boolean,
				value: false
			}
			
		},
		
		/**
		 * Defines the common dynamic attributes for all form elements.
		 * 
		 * Those will be inherited by all elements that implement this behavior.
		 */
		dynamicAttributes: {
			"style": {type: "style"},
			"className": {type: "className"}
		},
		
		
		/**
		 * Returns the attribute descriptor of a dynamic attribute, if any.
		 * 
		 * @param {String}  name The name of the attribute.
		 * @param {Boolean} [useDefault] If no descriptor exists, infer its defaults. 
		 */
		getDynamicAttributeDescriptor: function(name, useDefault) {
			var attribute = this.dynamicAttributes[name];
			if (!attribute && useDefault) 
				attribute = { type: 'attribute', name: name };
			
			return attribute;
		},
		
		/**
		 * Sets a dynamic attribute to the specified value.
		 * 
		 * If the attribute descriptor isn't defined, it is assumed to be `{ type: 'attribute', name: name }`.
		 * 
		 * @extends HTMLElement
		 * @param {String} name The name of the dynamic attribute to set.
		 * @param {*}      value The attribute value to set.
		 */
		setDynamicAttribute: function(name, value) {
			var attribute = this.getDynamicAttributeDescriptor(name, true);
			
			if (attribute.type == 'style') {
				if (typeof value == 'object') {
					for (var s in value) {
						if (value.hasOwnProperty(s))
							this.style[s] = value[s];
					}
					
				} else {
					this.style.cssText = value;
				}
				
			} else if (attribute.type == 'className') {
				if (typeof value == 'object' && value.length) {
					this.className = value.join(' ');
				} else {
					this.className = value.toString();
				}
				
			} else if (attribute.type == "attribute") {
				if (value === false) 
					this.removeAttribute(attribute.name);
				else
					this.setAttribute(attribute.name, value);
				
			} else if (attribute.type == 'property') {
				this[attribute.name] = value;
			}
		},
		
		/**
		 * Merge the `dynamicAttributes` pairs from all included behaviors.
		 */
		created: function() {
			if (this.dynamicAttributes) {
				this.dynamicAttributes = this._normalizeDynAttributes(this.dynamicAttributes);
			}
			if (this.behaviors) {
				// iterate them in reverse order as an efficient attribute override mechanic
				for (var i=this.behaviors.length-1; i>=0; i--) {
					var behavior = this.behaviors[i];
					if (behavior.hasOwnProperty('dynamicAttributes') && behavior['dynamicAttributes']) {
						var normAttrs = this._normalizeDynAttributes(behavior['dynamicAttributes']);
						Object.getOwnPropertyNames(normAttrs).forEach(function(n) {
							if (!this.dynamicAttributes.hasOwnProperty(n)) {
								// add it to the prototype's dynamicAttributes map
								this.dynamicAttributes[n] = normAttrs[n];
							}
						}, this);
					}
				}
			}
		},
		
		/**
		 * Normalizes the specified dynamic attributes map to be objects with `type` and `name` members.
		 * 
		 * @param {Object<String,Object|Boolean>} dynAttrs The source dynamic attributes map.
		 * @returns {Object<String,Object>} The normalized map.
		 * @protected
		 */
		_normalizeDynAttributes: function(dynAttrs) {
			var normAttrs = {};
			for (var n in dynAttrs) {
				if (!dynAttrs.hasOwnProperty(n)) continue;
				var attr = (dynAttrs[n] === true ? {} : dynAttrs[n]);
				
				normAttrs[n] = {
					name: ( attr.name ? attr.name : n),
					type: ( attr.type ? attr.type : 'attribute')
				};
			}
			return normAttrs;
		}
		
	};
	
	/**
	 * JSDoc type definition for the DynamicElement behavior.
	 * 
	 * @typedef {Element} CbnForm.DynamicElement
	 * 
	 * @property {Object} dynamicAttributes     The element's dynamic attributes.
	 * @property {CbnForm.DynamicElementConfig} sourceDynamicConfig The source dynamic config used to instantiate the element.
	 * @property {Boolean}  _isDynamicElement   Whether the element was instantiated dynamically.
	 * @property {Function} setDynamicAttribute Sets the specified attribute template value.
	 * @property {Function} getDynamicAttributeDescriptor Returns a dynamic attribute descriptor for a given attribute name.
	 * @property {Function} _setSourceDynamicConfig Sets the `sourceDynamicConfig` property.
	 */
	
	/**
	 * The dynamic form template object.
	 * 
	 * @typedef  {Object} CbnForm.DynamicConfig
	 * @property {Object} [types] Used to override the default type-to-element mapping.
	 * @property {Object} [defaults] Default configuration object, applied to all objects that have an 
	 *                    inherit property. There also is a special wildcard ('*') key that applies the 
	 *                    defaults to every `FormElementConfig` template.
	 * @property {[CbnForm.DynamicElementConfig]} controls The form controls to render.
	 * 
	 * // Inherited (for JSDoc validation purposes / IntelliJ workaround)
	 * @property {Function} hasOwnProperty
	 */
	
	/**
	 * The dynamic template object for a single form element.
	 * 
	 * @typedef {Object} CbnForm.DynamicElementConfig
	 * 
	 * @property {String} 	[inherit] The default config key to inherit (see `defaults`). Optional.
	 * @property {String} 	[type]    The element's type (used to instantiate an element based on type).
	 * @property {String} 	[element] The name of the element to instantiate (optional, overrides the type).
	 * 
	 * // input-specific properties
	 * @property {String} 	[decorator] The name of the decorator element that wraps the element (optional).
	 * @property {String}	[name]	  The input name / model value path (that describes where in the model the 
	 * 								  data should be read from / written to).
	 * @property {String}	[preview] Whether the element is visible in a preview-state form group.
	 * 
	 * // container-specific properties: 
	 * @property {CbnForm.DynamicElementConfig[]} [children] The list of container children to render (recursively).
	 * @property {Object|{ element: String }}     [wrapChildren] A plain object that contains the template to use for 
	 *                                rendering a standard HTML element that wraps the children. Optional.
	 * 
	 * @property {Function} hasOwnProperty
	 * 
	 * All other properties are directly passed as attributes to the instantiated element only if they were specified 
	 * inside the `dynamicAttributes` array.
	 */
	
})(window.Cbn.Form);
