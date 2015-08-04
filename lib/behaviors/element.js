(function(CbnForm) {
	
	/**
	 * Defines an active element that can interact with `cbn-form` containers.
	 * 
	 * Upon attaching to the DOM, the form element sends a `cbn-form-register` event, which is captured by the first 
	 * ancestor which implements the {@link FormContainer} interface and automatically sets the {@link #parentForm} 
	 * property to that ancestor.
	 * 
	 * If you want the element to act as an input, see `CbnInput.InputElement`.
	 * 
	 * @polymerBehavior
	 */
	CbnForm.FormElement = {
		
		properties: {
			
			/**
			 * An unique identifier for this form element (optional).
			 */
			name: {
				type: String,
				value: ''
			},
			
			/**
			 * The parent form/container of the element.
			 * 
			 * Will automatically be set when the element is attached to a form.
			 */
			parentForm: {
				type: Object,
				readOnly: true,
				value: null
			},
			
			/**
			 * By default, form elements don't act as inputs.
			 * This will be overridden by the {@link CbnForm.InputElement} behavior.
			 */
			_hasModelValue: {
				type: Boolean,
				value: false
			}
			
		},
		
		/**
		 * Defines the common dynamic attributes for all form elements.
		 */
		dynamicAttributes: {
			"name" 		: { type: 'attribute' }
		},
		
		// Events
		
		/**
		 * Automatically sent when the element is attached to the document in order to register with the parent form container.
		 * 
		 * Bubbles up the DOM tree and will be stopped by a capturing form container.
		 * 
		 * @event cbn-form-register
		 * @detail {HTMLElement} element The actual element to register (if hidden inside shadow DOM).
		 */
		
		/**
		 * Automatically when the element is detached from the DOM tree to its parent container that previously 
		 * registered it (if any).
		 * 
		 * @event cbn-form-unregister
		 */
		
		
		// Observers / Event handlers
		
		/**
		 * Sends the `cbn-form-register` event bubbling up the DOM tree.
		 */
		attached: function () {
			this.fire('cbn-form-register', {
				element: this
			});
		},
		
		/**
		 * Sends an event to notify the parent container of the element's detachment.
		 */
		detached: function () {
			if (this.parentForm) {
				this.fire('cbn-form-unregister', {
					element: this
				}, {
					node: this.parentForm,
					bubbles: false
				});
			}
		}
		
	};
	
	/**
	 * The FormElement interface declaration (for JSDoc purposes).
	 *
	 * @typedef {Object} CbnForm.FormElement
	 * 
	 * @property {String} name Form element's name.
	 * @property {Boolean} _hasModelValue Whether the input has a value.
	 * @property {HTMLElement} parentForm The element's parent form container.
	 * @property {Function} _setParentForm Set the parentForm property.
	 */
	
})(CbnForm);
