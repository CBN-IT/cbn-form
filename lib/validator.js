/**
 * A library that implements extensible form element validation.
 * 
 * Provides an API to use for creating validators which can be used with `cbn-form` input elements.
 */

(function(CbnForm) {
	
	//noinspection JSUnusedGlobalSymbols
	CbnForm.Validator = {
		
		/**
		 * A map with the registered validators.
		 * The key is a special value composed of the validator name and its input value type.
		 * 
		 * @type {Object<String,ValidatorInterface>}
		 */
		_validators: {},
		
		/**
		 * Internationalized validation messages.
		 * First key is the language ID, next one is the validator name.
		 * 
		 * @type {Object<String,Object<String,String>>}
		 */
		_messages: {},
		
		/**
		 * Specifies the default language for the validation messages.
		 * @type {String}
		 */
		language: '',
		
		/**
		 * Registers a new validator routine.
		 * 
		 * @param {ValidatorInterface} obj The validator object to register.
		 */
		register: function(obj) {
			if (!obj.name || !obj.types) return false;
			if (!obj.types.length) return false;
			
			for (var i=0; i<obj.types.length; i++) {
				var key = obj.name + ">" + obj.types[i];
				this._validators[key] = obj;
			}
			
			return true;
		},
		
		/**
		 * Registers the validation messages.
		 * FIXME: use a proper i18n library?
		 * 
		 * @param {String} lng The language to register.
		 * @param {Object<String,String>} messages the translated validation messages.
		 */
		registerMessages: function (lng, messages) {
			this._messages[lng] = messages;
			if (!this.language) this.language = lng;
		},
		
		/**
		 * Validates an input element.
		 * 
		 * Check both native browser validation and custom validators and sets the appropriate validity state objects.
		 * 
		 * @param {CbnForm.Validatable} input The input element to validate.
		 * @return {Boolean} True if all validations passed.
		 */
		validateInput: function(input) {
			if (!input.validation) return true;
			var i, v, settings; // iterators / auxiliary variables
			
			var valid = true;
			var failedValidator = '';
			var needToStop = false;
			var stop = function() { needToStop = true; };
			
			// reset validation state
			input.resetValidation();
			this._setInputValidity(input, '');
			
			// if the input supports native validation, check it first
			if (input.checkValidity && input.validity) {
				valid = input.checkValidity();
				if (!valid) {
					this._setInputValidity(input, this._getValidationMessage(input), true);
					return false;
				}
			}
			
			// built the list of validators to run
			var validatorsList = [];
			var validatorsSelected = {};
			if (!input.validationOrder) {
				input.validationOrder = ["required"];
			}
			for (i=0; i<input.validationOrder.length; i++) {
				validatorsList.push(input.validationOrder[i]);
				validatorsSelected[input.validationOrder[i]] = true;
			}
			if (input.validation) 
				for (v in input.validation) {
					if (!input.validation.hasOwnProperty(v)) continue;
					if (!validatorsSelected[v]) {
						validatorsList.push(v);
						validatorsSelected[v] = true;
					}
				}
			
			for (i=0; i<validatorsList.length; i++) {
				if (!input.validation.hasOwnProperty(validatorsList[i])) continue;
				
				var validatorObj = this._getValidatorObject(input.validationType, validatorsList[i]);
				if (!validatorObj) {
					continue;
				}
				
				settings = input.validation[validatorsList[i]];
				if (!validatorObj.validate(input.value, input.validation[validatorsList[i]], input, stop)) {
					valid = false;
					failedValidator = validatorsList[i];
					break;
				}
				if (needToStop) break;
			}
			
			if (!valid) {
				this._setInputValidity(input, this._getValidationMessage(input, failedValidator));
			} else {
				this._setInputValidity(input, '');
			}
			
			return valid;
		},
		
		// private methods
		
		/**
		 * Returns the requested InputValidator object.
		 * 
		 * @param {String} type The validator type.
		 * @param {String} validator Validator's name.
		 * @return {ValidatorInterface} Validator's object / null if not registered.
		 */
		_getValidatorObject: function(type, validator) {
			var vk = null;
			if (validator) {
				vk = validator + ">" + type;
				if (!this._validators[vk]) {
					vk = validator + ">" + "*";
				}
			}
			if (!vk) return null;
			return (this._validators[vk] ? this._validators[vk] : null );
		},
		
		/**
		 * Returns the validation message to display when input validation fails.
		 * 
		 * @param {CbnForm.Validatable} input The target input element.
		 * @param {String} [validator] The failed validator (false for built-in validation).
		 * @param {Object} [settings] The validator settings used (optional, auto-set).
		 * @return {String} The validation message to set.
		 */
		_getValidationMessage: function(input, validator, settings) {
			if (validator && !settings) {
				settings = input.validation[validator];
			}
			if (validator && (typeof settings == 'object') && settings.message) 
				return settings.message;
			if (input.defaultValidationMessage) 
				return input.defaultValidationMessage;
			
			var validatorObj = null;
			if (validator) 
				validatorObj = this._getValidatorObject(input.validationType, validator);
			
			// i18n default message
			if (this._messages[this.language] && this._messages[this.language][validator]) 
				return this._messages[this.language][validator];
			if (this._messages[this.language] && this._messages[this.language]['_default'])
				return this._messages[this.language]['_default'];
			
			// fallback messages
			if (validatorObj && validatorObj.message) 
				return validatorObj.message;
			return 'Invalid value!';
		},
		
		/**
		 * Sets the input's validity state.
		 * 
		 * @param {CbnForm.Validatable} input The input to set the validation state to.
		 * @param {String}      message The validation message (empty if the input validated successfully).
		 * @param {Boolean}     [native] True if the input was validated using native validation (and failed).
		 */
		_setInputValidity: function(input, message, native) {
			input.validationState.valid = (message == '');
			input.validationState.message = message;
			input.invalid = !input.validationState.valid;
		}
		
	};
	
	/**
	 * The object interface that needs to be implemented by the form validators.
	 * 
	 * @typedef  {Object}   ValidatorInterface
	 * @property {String}   name The name of the validator / the validation attribute used to invoke this validator.
	 * @property {String[]} types The validator types handled (see {@link CbnForm.Validatable#validatorType}).
	 *                            There is a special type available: ['*'], which binds to all validator types.
	 * @property {String}   [message] The default validation message to display when the input is invalid.
	 * @property {Function} validate The validation function (that receives 4 parameters: the value to validate,
	 *                               validator settings and, optionally, a reference to the input element and a stop
	 *                               method to use to force stopping the validation process).
	 * 
	 * The settings property can be either:
	 * - a scalar value, if the validator only has a mandatory parameter (recommended for ease of use);
	 * - an object with validator settings; the following keys are reserved:
	 *    > validate: should store the reference value used by the validators;
	 *    > message: a validation message to display to the user if validation failed;
	 * 
	 * The validator should support both styles, the second style being required for custom validation message to work
	 * (and the first is for convenience).
	 * You should also be able to disable a validator by giving it a false-y value to the settings parameter.
	 */
	
	/**
	 * Normalizes a validator settings value to an object.
	 * 
	 * @param {*} settings The input settings value / object.
	 * @returns {Object} The normalized settings object.
	 */
	CbnForm.Validator.normalizeSettings = function (settings) {
		if (typeof settings == 'object')
			return settings;
		return {
			validate: settings,
			message: null
		};
	}
	
	
})(window.Cbn.Form);
