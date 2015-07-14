(function(CbnForm) {
	
	/**
	 * The dynamic form template object.
	 * 
	 * @typedef  {Object} 				FormConfig
	 * @property {Object}				[types] Used to override the default type-to-element mapping.
	 * @property {Object}				[defaults] Default configuration object, applied to all objects that have an 
	 *                                  inherit property. There also is a special wildcard ('*') key that applies the 
	 *                                  defaults to every `FormElementConfig` template.
	 * @property {FormElementConfig[]} 	controls The form controls to render.
	 */
	
	/**
	 * The dynamic template object for a single form control.
	 * 
	 * @typedef  {Object}	FormElementConfig
	 * 
	 * @property {String} 	[inherit] The default config key to inherit (see {@link FormConfig#defaults}). Optional.
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
	 * @property {FormElementConfig[]}  [children] The list of container children to render (recursively).
	 * @property {Object|{ element: String }} [wrapChildren] A plain object that contains the template to use for 
	 *                                rendering a standard HTML element that wraps the children. Optional.
	 * 
	 * All other properties are directly passed as attributes to the instantiated element only if they were specified 
	 * inside the {@link CbnForm.AbstractControl#dynamicAttributes} array.
	 */
	
	/**
	 * Defines the abstract interface of form controls that support dynamic element creation.
	 * 
	 * Each element must specify the list of accepted template properties using the {@link #dynamicAttributes} object.
	 */
	CbnForm.DynamicControl = {
		
		/**
		 * Defines the element's dynamically-configurable attributes. 
		 * 
		 * @type {Object<String,Object> | Object<String,String> | Object<String,Boolean>}
		 * @default { style, className }
		 */
		dynamicAttributes: null,
		
		/**
		 * Stores the source object used to generate the current instance. 
		 * Filled by `cbn-dynamic-form` at element creation time.
		 * @type {FormElementConfig}
		 */
		sourceTemplate: null,
		
		/**
		 * Will be true after {@link #dynamicAttributes} is normalized.
		 * @private
		 * @type {Boolean}
		 */
		_dynamicAttributesInitialized: false,
		
		/**
		 * Polymer element created callback.
		 * 
		 * Normalizes the {@link #dynamicAttributes} property.
		 */
		created: function() {
			this.setDynamicAttributesList({
				"style"     : { type: "style" },
				"className" : { type: "className" }
			});
		},
		
		/**
		 * Sets/appends the specified list to ({@link #dynamicAttributes}).
		 * 
		 * @param {Object} attrs The list of dynamic attributes to add.
		 */
		setDynamicAttributesList: function(attrs) {
			if (!this._dynamicAttributesInitialized) {
				if (!this.dynamicAttributes)
					this.dynamicAttributes = {};
				this._dynamicAttributesInitialized = true;
				this.setDynamicAttributesList(this.dynamicAttributes);
			}
			if (!attrs) return;
			for (var i in attrs) {
				if (!attrs.hasOwnProperty(i)) continue;
				
				// normalize the attribute
				var attr = attrs[i];
				if (attrs === true) attr = {};
				if (!attr.name) attr.name = i;
				if (!attr.type) attr.type = 'attribute';
				
				// add it!
				this.dynamicAttributes[i] = attr;
			}
		},
		
		/**
		 * Returns the attribute descriptor of a dynamic attribute, if any.
		 * 
		 * @param {String}  name The name of the attribute.
		 * @param {Boolean} [inferDefault=false] If no descriptor exists, infer its defaults. 
		 */
		getDynamicAttributeDescriptor: function(name, inferDefault) {
			var attribute = this.dynamicAttributes[name];
			if (!attribute && inferDefault) 
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
		}
		
	};
	
})(CbnForm);
