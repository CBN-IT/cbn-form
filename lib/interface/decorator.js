(function(CbnForm) {
	
	/**
	 * Defines the abstract interface to be implemented by the custom input decorators.
	 * 
	 * An input decorator is an element that wraps the actual input inside (via light DOM) and can show several other UI 
	 * elements around it (such as labels, validation errors etc.).
	 * 
	 * @extends CbnForm.AbstractControl
	 */
	CbnForm.AbstractInputDecorator = CbnForm.implement({
		
		publish: { // Published attributes:

			/**
			 * Whether the current instance should be shown as preview in form groups.
			 *
			 * @attribute preview
			 * @type {Boolean}
			 */
			preview: false,

			/**
			 * Is the input container currently in a preview state?
			 *
			 * Automatically bound by the `cbn-form-group` component if the {@link #preview} property is true.
			 *
			 * @attribute previewstate
			 * @type {Boolean}
			 */
			previewState: false
		},
		
		/**
		 * Standard input decorator dynamically-configurable attributes.
		 */
		dynamicAttributes: {
			"label"  : { type: 'attribute' }, 
			"preview": { type: 'attribute' }
		}, 
		
		
		// Element lifecycle methods:
		
		/**
		 * Element instance created callback.
		 */
		_created: function () {
			// nothing yet
		}, 
		
		/**
		 * Polymer element ready callback.
		 */
		_ready: function () {
			// nothing yet
		}
		
	}, CbnForm.AbstractControl);
	
})(CbnForm);
