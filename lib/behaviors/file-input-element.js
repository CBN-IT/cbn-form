(function(CbnForm) {
	
	/**
	 * The interface that file inputs must implement.
	 * 
	 * @polymerBehavior
	 */
	CbnForm.FileInputElementImpl = {
		
		properties: {
			
			/**
			 * File input's value is an object that contains file data & metadata.
			 * 
			 * If the `multiple` property is true, this value will be an array of objects.
			 */
			value: {
				type: Object,
				value: null
			},
			
			/**
			 * This input is a file input.
			 */
			isFileInput: {
				type: Boolean,
				value: true,
				readOnly: true
			},
			
			/**
			 * Whether the input accepts multiple files.
			 * 
			 * If true, the `value` will be an array of file/metadata objects.
			 */
			multiple: {
				type: Boolean,
				value: false,
				reflectToAttribute: true,
				observer: '_multipleChanged'
			}
			
		},
		
		/**
		 * Defines the common dynamic attributes for all form elements.
		 */
		dynamicAttributes: {
			"multiple": { "type": "attribute" }
		},
		
		/**
		 * When the multiple property is changed.
		 */
		_multipleChanged: function() {
			if (this.multiple) {
				this.value = [];
			} else {
				this.value = null;
			}
		}
		
	};
	
	CbnForm.FileInputElement = [ CbnForm.FormElement, CbnForm.InputElementImpl, CbnForm.FileInputElementImpl ];
	
})(CbnForm);
