/**
 * Declares the main `CbnForm` namespace used for all `cbn-form`-related API interfaces / methods.
 * 
 * Each form element must implement at least one the interfaces defined below, depending on the desired functionality:
 * - `AbstractControl`: the common interface that all form controls must implement;
 * - `AbstractInput`: the interface that form input fields must implement;
 * - `AbstractFileInput`: a special interface to use for file inputs;
 * - `AbstractContainer`: a special form control that can contain other controls/fields;
 * 
 * A custom form element must implement one of these interfaces, depending on its desired form behavior.
 * Also, the element must register its type[s] via the {@link CbnForm#registerElement} (used for dynamic form input
 * type discovery).
 * 
 */

var CbnForm = (function() {
	
	var CbnForm = {
		
		/**
		 * Stores the registered inputs by type.
		 * The key is the input/control type and the value is the element's name.
		 *
		 * @private
		 * @type { Object.<String, String> }
		 */
		_registeredTypes: {},
		
		/**
		 * Stores the registered elements as a Boolean map.
		 *
		 * @private
		 * @type { Object.<String, Object> }
		 */
		_registeredElements: {},
		
		// Element registration methods:
		
		/**
		 * @typedef  {Object}   RegisterElementOptions
		 * @property {String[]} [types] The input types handled by the element.
		 * @property {String}   [extends] If the element extends another one, set this to the extended element
		 *                      (e.g.: 'input')
		 */
		
		/**
		 * Registers a new form control element to be usable within `cbn-form` and `cbn-dynamic-form`.
		 *
		 * @param {String} name The name of the custom input element.
		 * @param {RegisterElementOptions} options Element's definition object.
		 */
		registerElement: function (name, options) {
			if (this._registeredElements[name] != undefined) {
				console.error("\"cbn-form-abstract.html\": element '" + name + "' is already registered");
				return false;
			}
			
			if (options.types && options.types.length) {
				for (var i = 0; i < options.types.length; i++) {
					this._registeredTypes[options.types[i]] = name;
				}
			}
			
			this._registeredElements[name] = options;
			
			return true;
		},
		
		/**
		 * Returns a registered element's definition object.
		 *
		 * @param  {String} name The element's name.
		 * @return {RegisterElementOptions} Element's registration options.
		 */
		getRegisteredElement: function (name) {
			return this._registeredElements[name];
		},
		
		/**
		 * Returns the name of an element that was last registered for the requested type.
		 *
		 * @param  {String} type The input type.
		 * @param  {Object} [overrideTypes=null] Optional, types override map.
		 * @return {String} The element's name.
		 */
		getElementForType: function (type, overrideTypes) {
			if (overrideTypes && overrideTypes.hasOwnProperty(type))
				return overrideTypes[type];
			return this._registeredTypes[type];
		}
		
	};
	
	
	/**
	 * An empty object with "null" meaning.
	 * 
	 * Used as hack to be able to have null-able object properties and still let Polymer know the type of the expected 
	 * value. See {@link CbnForm.AbstractContainer#model} for an example.
	 */
	CbnForm.NullObject = {};
	
	
	// return the public object
	return CbnForm;
	
})();
