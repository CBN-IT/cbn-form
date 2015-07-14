(function(CbnForm) {
	
	/**
	 * Defines the abstract interface to be implemented by the custom input decorators.
	 * 
	 * An input decorator is an element that wraps the actual input inside (via light DOM) and can show several other UI 
	 * elements around it (such as labels, validation errors etc.).
	 * 
	 * @extends CbnForm.AbstractControl
	 */
	CbnForm.AbstractInputDecorator = [CbnForm.AbstractControl, {
		
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
		
		
		// Element lifecycle methods:
		
		/**
		 * Element instance created callback.
		 */
		created: function () {
			if (this.setDynamicAttributesList)
				this.setDynamicAttributesList({
					"label"  : { type: 'attribute' },
					"preview": { type: 'attribute' }
				});
		}, 
		
		/**
		 * Polymer element ready callback.
		 */
		ready: function () {
			// nothing yet
		}
		
	} ];
	
})(CbnForm);
