(function(CbnForm) {
	
	/**
	 * Defines the abstract interface to be implemented by the custom form controls.
	 * 
	 * Note: you need to use the {@link CbnForm#mixin} method to implement this abstract interface (or any of the
	 * derived interfaces below) to a custom element!
	 * 
	 * Example:
	 *     Polymer('your-element', CbnForm.mixin({
	 *         // element's properties
	 *     }, CbnForm.AbstractInput));
	 * 
	 * @extends HTMLElement
	 */
	CbnForm.AbstractControl = {
		
		/**
		 * Publish additional element properties.
		 */
		publish: {
			isFormControl: {
				value: true,
				reflect: true // set as attribute
			}
		},
		
		/**
		 * Stores a reference to the element's parent container.
		 * Available just after the element's `attached` event is processed.
		 * @type {HTMLElement}
		 */
		parentContainer: null,
		
		/**
		 * Stores a reference to the element's parent `cbn-form` element.
		 * Available just after the element's `attached` event is processed.
		 * @type {HTMLElement}
		 */
		parentForm: null,
		
		// Fired events:
		
		/**
		 * Fired automatically when a form control attaches. Bubbles the DOM tree.
		 * The first container to capture it will register the element.
		 * 
		 * @event cbn-form-control-attached
		 */
		
		/**
		 * Fired automatically when a form control is detached from DOM.
		 * Note: the event will only be received by the container that registered it (because of limitations of the 
		 * custom elements' detachedCallback implementation).
		 * 
		 * @event cbn-form-control-detached
		 */
		
		/**
		 * Sends an event to notify the parent containers of the element's attachment.
		 */
		attached: function () {
			this.fire('cbn-form-control-attached', {
				element: this
			}, null, true, false);
		},
		
		/**
		 * Sends an event to notify the parent container of the element's detachment.
		 */
		detached: function () {
			this.fire('cbn-form-control-detached', {
				element: this
			}, this.parentContainer, true, false);
		}
		
	};
	
})(CbnForm);
