(function(CbnForm) {
	
	/**
	 * The validation state object of a validatable input.
	 * 
	 * @typedef {Object} InputValidationState
	 * @property {Boolean} valid Whether the input is valid or not.
	 * @property {String}  message The validation message (if valid is false).
	 * 
	 * The validators may set any other property which may be used for debugging purposes, displaying a more 
	 * detailed error message to the user etc.
	 */
	
	/**
	 * Adds validation capabilities to a custom input element.
	 * 
	 * @extends HTMLElement
	 */
	CbnForm.ValidatableInput = {
		
		// Interface settings
		_extendProperties: [ 'dynamicAttributes' ],
		
		publish: { // Published attributes:
			
			/**
			 * The input's validation settings, a map where the key is the validator name and the value represents the 
			 * settings parameter to pass to the validator (which depends on the validator used).
			 * 
			 * @attribute validation
			 * @type {Object<String,*>}
			 */
			validation: null,
			
			/**
			 * An array with the order in which the validators should be executed.
			 * Any validators not specified here will be ran after every other validators entered here.
			 * 
			 * @attribute validationOrder
			 * @type {[String]}
			 */
			validationOrder: null,
			
			/**
			 * Describes the validator category to use, which is used by {@link CbnForm.Validator} to automatically choose a 
			 * validator to validate the input.
			 * 
			 * The predefined types are:
			 * - 'text': an input whose value is entered as string and validated as such; includes most of the definable 
			 *   input types (including numeric and date inputs);
			 * - 'file': for file inputs, where the input value is a file metadata object (see {@link CbnForm.AbstractFileInput});
			 * - 'multiple': for validating an array of values.
			 * 
			 * @attribute validationType
			 * @type {String}
			 */
			validationType: 'text',
			
			/**
			 * The validation message to display to the user if the validation failed.
			 * 
			 * @attribute validationMessage
			 * @type {String}
			 */
			validationMessage: '',
			
			/**
			 * This attribute will be automatically set when the validation fails.
			 * Can be used as CSS selector (reflection is enabled).
			 * 
			 * @attribute invalid
			 * @type {Boolean}
			 */
			invalid: {
				value: false,
				reflect: true
			}
			
		},
		
		// Events
		
		/**
		 * Fired after the input is validated.
		 * 
		 * @event cbn-form-validate
		 */
		
		// DOM Properties: 
		
		/**
		 * Stores the validation state of the input element.
		 * 
		 * @type {InputValidationState}
		 */
		_validationState: null,
		
		/**
		 * Validation dynamically-configurable attributes.
		 */
		dynamicAttributes: {
			"validation" : { type: 'property' }, 
			"validationOrder" : { type: 'property' }, 
			"validationType" : { type: 'attribute' },
			"validationMessage" : { type: 'attribute' }
		},
		
		/**
		 * Returns the validation state of the input.
		 * 
		 * @property validationState
		 * @type {InputValidationState}
		 */
		get validationState() {
			return this._validationState;
		},
		
		
		// Methods
		
		/**
		 * Element instance created callback.
		 */
		_created: function () {
			if (!this.validation) this.validation = {};
			if (!this.validationOrder) {
				this.validationOrder = [ 'required' ];
			}
			this.resetValidation();
		},
		
		
		/**
		 * Requests validation of the input (called by the form element before submit).
		 * 
		 * @return {Boolean} True if the input validates, false otherwise.
		 */
		validate: function () {
			var result = CbnForm.Validator.validateInput(this);
			this.fire('cbn-form-validate', { result: result });
			return result;
		},
		
		/**
		 * Resets the input's validation state.
		 */
		resetValidation: function() {
			this._validationState = {
				valid: true,
				message: ''
			};
		}
		
	};
	
})(CbnForm);
