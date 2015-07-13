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
		 * Stores reference to the element's parent `cbn-form` element.
		 * Available just after the element's `attached` event is processed (the element's `attached` callback is fine).
		 * @type {HTMLElement}
		 */
		parentForm: null,
		
		// Fired events:
		
		/**
		 * Fired automatically when a form control attaches. Bubbles up the DOM tree.
		 * @event cbn-form-control-attached
		 */
		
		/**
		 * Fired automatically when a form control is detached from DOM. Bubbles up the DOM tree.
		 * @event cbn-form-control-detached
		 */
		
		/**
		 * Sends an event to notify the parent containers of the element's attachment.
		 */
		_attached: function () {
			var element = this;
			this.fire('cbn-form-control-attached', {
				element: element
			}, null, true, false);
		},
		
		/**
		 * Sends an event to notify the parent containers of the element's detachment.
		 */
		_detached: function () {
			var element = this;
			this.fire('cbn-form-control-detached', {
				element: element
			}, null, true, false);
		}
		
	};
	
})(CbnForm);
