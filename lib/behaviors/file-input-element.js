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
				value: null,
				observer: '_recalculateUploadSize'
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
			},
			
			/**
			 * Whether the file(s) is/are currently being uploaded.
			 */
			uploading: {
				type: Boolean,
				notify: true,
				readOnly: true,
				value: false
			},
			
			/**
			 * Whether the upload progress is currently indeterminate.
			 */
			uploadIndeterminate: {
				type: Boolean,
				notify: true,
				readOnly: true,
				value: false
			},
			
			/**
			 * The total size (bytes) of the files to be uploaded. Used for progress events.
			 * 
			 * Automatically calculated when the value objects are set.
			 */
			totalUploadSize: {
				type: Number,
				notify: true,
				readOnly: true,
				value: 0
			},
			
			/**
			 * The amount of bytes currently uploaded. 
			 * 
			 * Automatically calculated during `cbn-form`'s progress events.
			 */
			uploadedSize: {
				type: Number,
				notify: true,
				readOnly: true,
				value: 0
			},
			
			/**
			 * The element's parent form (as defined in `FormElement` behavior). 
			 * 
			 * Here it is used for observing purposes.
			 */
			parentForm: {
				type: Object,
				observer: '_initializeProgressHandlers'
			},
			
			/**
			 * Binds the progress handler function to `this`.
			 */
			_boundUploadProgressHandler: {
				type: Function,
				value: function() {
					return this._uploadProgressHandler.bind(this);
				}
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
		},
		
		/**
		 * Initializes the progress event handlers on the new parent form.
		 * 
		 * @param {Element} parentForm The parent `cbn-form` object.
		 * @param {Element} oldParentForm The old parent form object.
		 */
		_initializeProgressHandlers: function(parentForm, oldParentForm) {
			if (oldParentForm) {
				oldParentForm.removeEventListener('cbn-form-upload-progress', 
					/**@type {Function}*/(this._boundUploadProgressHandler));
			}
			if (parentForm) {
				parentForm.addEventListener('cbn-form-upload-progress',
					/**@type {Function}*/(this._boundUploadProgressHandler));
			}
		},
		
		/**
		 * Recalculates the total size of the files to be uploaded from the current value.
		 * 
		 * Used for calculating the progress.
		 */
		_recalculateUploadSize: function () {
			var totalSize = 0;
			if (this.multiple && Array.isArray(this.value)) {
				this.value.forEach(function(val) {
					if (val && val instanceof Blob) {
						totalSize += val.size;
					}
				});
			} else if (!this.multiple) {
				if (this.value && this.value instanceof Blob) {
					totalSize = this.value.size;
				}
			}
			//noinspection JSUnresolvedFunction
			this._setTotalUploadSize(totalSize);
		},
		
		/**
		 * Handles form upload progress events.
		 * 
		 * @param {Object} event The progress event's object.
		 */
		_uploadProgressHandler: function(event) {
			if (!event.detail.running) {
				//noinspection JSUnresolvedFunction
				this._setUploading(false);
				//noinspection JSUnresolvedFunction
				this._setUploadIndeterminate(false);
				return;
			}
			//noinspection JSUnresolvedFunction
			this._setUploading(true);
			var uploaded = 0;
			if (event.detail.lengthComputable && event.detail.total > 0) {
				//noinspection JSUnresolvedFunction
				this._setUploadIndeterminate(false);
				uploaded = event.detail.loaded;
				if (event.detail.loaded > this.totalUploadSize) {
					uploaded = this.totalUploadSize;
				}
				event.detail.loaded -= uploaded;
				event.detail.total -= this.totalUploadSize;
			} else if (!event.detail.lengthComputable) {
				//noinspection JSUnresolvedFunction
				this._setUploadIndeterminate(true);
			}
			//noinspection JSUnresolvedFunction
			this._setUploadedSize(uploaded);
		}
		
	};
	
	CbnForm.FileInputElement = [ CbnForm.FormElement, CbnForm.InputElementImpl, CbnForm.FileInputElementImpl ];
	
})(window.Cbn.Form);
