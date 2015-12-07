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
	 * The input can also have an internal validation state via the `_internallyValid` property. 
	 * See the {@link #_setInternalValidationState} API method for usage details.
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
			},
			
			/**
			 * Stores the internal validation state of the input.
			 */
			_internallyValid: {
				type: Boolean,
				value: true
			}
			
		},
		
		/**
		 * Defines the common dynamic attributes for all form elements.
		 */
		dynamicAttributes: {
			"validation" : { type: 'property'},
			"validationOrder": {type: 'property'},
			"validationType": {type: 'property'},
			"defaultValidationMessage": {type: 'property'}
		},
		
		
		/**
		 * Requests validation of the input.
		 * 
		 * It is usually called by the form element before submit or by the paper-input-container (if `autoValidate` is true).
		 * 
		 * @return {Boolean} True if the input validates, false otherwise.
		 */
		validate: function () {
			return this._cbn_validate();
		},
		
		/**
		 * Resets the input's validation state.
		 */
		resetValidation: function() {
			//noinspection JSUnresolvedFunction
			this._internallyValid = true;
			this._setValidationState({
				valid: true,
				message: ''
			});
			if (this.setCustomValidity)
				this.setCustomValidity("");
		},
		
		/**
		 * Changes the input's internal validation state.
		 * 
		 * Use this if you want to change the internal validation state of the input. 
		 * It emits a variant of the `cbn-form-validate` event that allows distinguishing between internal and user 
		 * validation (via the `detail.indirect` property).
		 * 
		 * @param {Boolean} valid Whether the input's state is valid.
		 * @return {Boolean} The input's resulting validation state (i.e. true if valid).
		 */
		_setInternalValidationState: function(valid) {
			this._internallyValid = valid;
			return this._cbn_validate(true);
		},
		
		/**
		 * Private method that checks whether the input is valid or not.
		 * 
		 * @param {Boolean} [indirect] Whether the validation is indirect (internal) or user-triggered.
		 * @return {Boolean} True if validation was passed.
		 */
		_cbn_validate: function(indirect) {
			var obj = {};
			if (indirect) obj.indirect = true;
			
			obj.result = this._internallyValid && CbnForm.Validator.validateInput(this);
			this.fire('cbn-form-validate', obj);
			
			return obj.result;
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
