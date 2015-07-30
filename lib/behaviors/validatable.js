(function(CbnForm) {
	
	/**
	 * You can use `CbnForm.Validatable` behavior to provide automatic validation features for a form element.
	 * 
	 * It is the user-oriented facade to the `CbnForm.Validator` library, which provides an API for creating validators 
	 * that can be used here.
	 * 
	 * In order to enable input validation for an element, you must specify the `validation` configuration object, which 
	 * is a JSON map whose key is the name of the validator, and the value is a validator-dependent settings object with 
	 * the following format:
	 * 
	 * - a scalar value, if the validator only has a mandatory parameter (for ease of use); a false-y value disables the 
	 *   validation;
	 * - an object with extended settings; the following keys are always available:
	 *    > validate: should store the reference value used by the validators; false disables the validator;
	 *    > message: a custom validation message to display to the user if validation failed;
	 * 
	 * The validation process runs for each entry in the `validation` property (in the order of their declaration or, if 
	 * specified, uses `validationOrder`). If you supply an invalid/unregistered validator name, that entry will simply 
	 * be ignored.
	 * 
	 * Example: 
	 * ```html
	 *     <input is="iron-input" validation='{
	 *         "required": true,
	 *         "minlength": { "validate": 5, "message": "Please enter at least 5 characters!" }
	 *     }'>
	 * ```
	 * 
	 * Will first run the 'required' validator (which checks if the value is not false / empty); if this passes, then 
	 * asserts the length of the text to be greater-or-equal than 5. If the validation fails here, a custom message wil 
	 * replace the validator-provided one.
	 * 
	 * For a list of available validators or how to create a validator, read the [docs/validation.md] documentation.
	 * 
	 * @polymerBehavior
	 */
	CbnForm.Validatable = {
		
		properties: {
			
			/**
			 * The validation configuration object, a map where the key is the validator name and the value represents the
			 * settings parameter to pass to the validator (see {@link CbnForm.Validator} for a list).
			 */
			validation: {
				type: Object,
				value: function() { return {}; }
			},
			
			/**
			 * An array with the order in which the validators should be executed.
			 * Any validators not specified here will be ran after every other validators entered here.
			 */
			validationOrder: {
				type: Array
			},
			
			/**
			 * Describes the validator category which can be used to validate the input's value.
			 * 
			 * The predefined types are:
			 * - 'text': an input whose value is entered as string and validated as such; includes most of the definable
			 *   input types (including numeric and date inputs);
			 * - 'file': for file inputs, where the input value is a file metadata object;
			 * - 'multiple': for validating an array of values.
			 * 
			 * An input element should override this 
			 */
			validationType: {
				type: String,
				value: 'text'
			},
			
			/**
			 * The default validation message to display to the user if the validation failed.
			 */
			defaultValidationMessage: {
				type: String,
				value: ''
			},
			
			/**
			 * This attribute will be automatically set when the validation fails.
			 * Can be used as CSS selector (reflection is enabled).
			 */
			invalid: {
				type: Boolean,
				value: false,
				notify: true,
				reflectToAttribute: true
			},
			
			/**
			 * The validation state object of a validatable input.
			 * 
			 * Has the following properties:
			 * 
			 * - {Boolean} valid Whether the input is valid or not;
			 * - {String}  message The validation message (if valid is false).
			 * 
			 * Each validator may set any other property which may be used for debugging purposes, displaying a more
			 * detailed error message to the user etc.
			 */
			validationState: {
				type: Object,
				readOnly: true,
				notify: true
			}
			
		},
		
		/**
		 * Defines the common dynamic attributes for all form elements.
		 */
		dynamicAttributes: {
			"validation" : { type: 'property'},
			"validationOrder": {type: 'property'},
			"validationType": {type: 'attribute'},
			"defaultValidationMessage": {type: 'attribute'}
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
			//noinspection JSUnresolvedFunction
			this._setValidationState({
				valid: true,
				message: ''
			});
		}
		
	};
	
	/**
	 * The Validatable input interface declaration (for JSDoc purposes).
	 * 
	 * @typedef {Object} CbnForm.Validatable
	 * 
	 * @property {Object<String,Object|String>} validation Validation settings.
	 * @property {[String]} validationOrder Validation order array.
	 * @property {String} validationType Validation category.
	 * @property {String} defaultValidationMessage Default validation message.
	 * @property {Object} validationState Validation's results object.
	 * @property {Boolean} invalid Input's invalid flag.
	 * 
	 * Methods: 
	 * @property {Function} validate Validates a user input.
	 * @property {Function} resetValidation
	 * 
	 * Native input validation interface:
	 * @property {Object} validity Native input validity object. 
	 * @property {Function} checkValidity Native input validation method.
	 * @property {Function} setCustomValidity Native input method to set a custom validation message.
	 */
	
})(CbnForm);
