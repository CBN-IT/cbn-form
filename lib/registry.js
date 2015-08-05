/**
 * Implements the `cbn-form` element registry (which stores all compatible form elements together with a descriptor 
 * object that can be used by different components: the most notable being `cbn-dynamic-form`).
 */

(function(CbnForm) {
	
	//noinspection JSUnusedGlobalSymbols
	Polymer.Base.extend(CbnForm, {
		
		/**
		 * Stores the registered elements (where the key is the element's name, and the value is a configuration 
		 * descriptor for the element).
		 * 
		 * @private
		 * @type { Object.<String, Object> }
		 */
		_registeredElements: {},
		
		/**
		 * Groups the registered form elements by type.
		 * The key is the input's type, the value is an array of elements (sorted by their priorities in descending 
		 * order - the first element is the one with the highest priority).
		 * 
		 * @private
		 * @type { Object.<String, [String]> }
		 */
		_elementsByType: {},
		
		
		// Element registry API:
		
		/**
		 * @typedef  {Object}   FormElementDescriptor
		 * @property {[String]} types         The input types handled by the element.
		 * @property {int}      [priority=0] The priority of choosing this element over others of the same type.
		 * @property {String}   [extends]     If the element extends another one, set this to the extended element
		 *                      (e.g.: 'input')
		 */
		
		/**
		 * Registers a new element to be usable with the `cbn-form` suite of components.
		 * 
		 * @param {String} name The name of the element to register.
		 * @param {FormElementDescriptor} options Element's descriptor object.
		 * @return {Boolean} True if the registration succeeded.
		 */
		registerElement: function (name, options) {
			if (this._registeredElements[name] != undefined) {
				console.error("`cbn-form`: element '" + name + "' was already registered");
				return false;
			}
			
			// infer defaults to the supplied options
			if (options.priority === undefined) 
				options.priority = 0;
			
			this._registeredElements[name] = options;
			
			if (options.types && options.types.length) {
				for (var i = 0; i < options.types.length; i++) {
					var t = options.types[i];
					if (!this._elementsByType[t]) 
						this._elementsByType[t] = [];
					if (this._elementsByType[t].indexOf(name) == -1) {
						this._elementsByType[t].push(name);
						this._sortByPriority(this._elementsByType[t]);
					}
				}
			}
			
			return true;
		},
		
		/**
		 * Returns a registered element's descriptor object.
		 * 
		 * @param  {String} name The element's name.
		 * @return {FormElementDescriptor} Element's descriptor object.
		 */
		getElementDescriptor: function (name) {
			return this._registeredElements[name];
		},
		
		/**
		 * Returns the name of an element that has the highest priority for the requested type.
		 * 
		 * @param  {String} type The input type.
		 * @param  {Object} [override] Optional, a priority override map.
		 * @return {String} The element's name.
		 */
		getElementForType: function (type, override) {
			if (override && override.hasOwnProperty(type))
				return override[type];
			var elements = this._elementsByType[type];
			return ( elements && elements.length ? elements[0] : null );
		},
		
		// Private methods:
		
		/**
		 * Sorts the specified element list by priority.
		 * 
		 * @private
		 * @param {[String]} elementsByType The list of elements to sort.
		 */
		_sortByPriority: function(elementsByType) {
			var obj = this;
			elementsByType.sort(function (a, b) {
				return (obj._registeredElements[b].priority) -
					(obj._registeredElements[a].priority);
			});
		}
		
	});
	
	
})(window.CbnForm);
