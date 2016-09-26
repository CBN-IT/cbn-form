(function(Validator) {
	
	/**
	 * Validates whether the input value is not empty (or false-y).
	 * 
	 * @param {Boolean} settings
	 */
	Validator.register({
		name: 'required',
		types: ['*'],
		message: 'This field is mandatory!',
		validate: function(value, settings, input, stop) {
			settings = Validator.normalizeSettings(settings);
			var required = settings.validate;
			if (required) // if required=true, validate the input
				return !!value;
			
			if (!required && !value) // stop the rest of the validation if the value is not specified
				stop();
			return true;
		}
	});
	
	/**
	 * Implements common pattern-based validators.
	 */
	var PatternValidator = {
		_patterns: {
			email: { validate: '^((([a-z]|\\d|[!#\\$%&\'\\*\\+\\-\\/=\\?\\^_`{\\|}~]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])+' +
				'(\\.([a-z]|\\d|[!#\\$%&\'\\*\\+\\-\\/=\\?\\^_`{\\|}~]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])+)*)|' +
				'((\\x22)((((\\x20|\\x09)*(\\x0d\\x0a))?(\\x20|\\x09)+)?(([\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x7f]|\\x21|[\\x23-\\x5b]|' +
				'[\\x5d-\\x7e]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])|(\\\\([\\x01-\\x09\\x0b\\x0c\\x0d-\\x7f]|' +
				'[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]))))*(((\\x20|\\x09)*(\\x0d\\x0a))?(\\x20|\\x09)+)?(\\x22)))@' +
				'((([a-z]|\\d|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])|(([a-z]|\\d|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])' +
				'([a-z]|\\d|-|\\.|_|~|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])*([a-z]|\\d|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])))\\.)+' +
				'(([a-z]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])|(([a-z]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])' +
				'([a-z]|\\d|-|\\.|_|~|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])*([a-z]|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])))\\.?$', 
				modifiers: 'i' }
		},
		validate: function(value, settings/*, input, stop */) {
			// 'this' is the registered validator
			settings = Validator.normalizeSettings(settings);
			var pattern = settings.validate;
			var modifiers = (settings.modifiers ? settings.modifiers : '');
			if (!pattern) return true; // validator is disabled
			
			try {
				pattern = new RegExp(pattern, modifiers);
				if (!pattern) { //noinspection ExceptionCaughtLocallyJS
					throw settings.validate+'';
				}
				if(value instanceof Array){
					var result = true;
					for (var i = 0; i < value.length; i++) {
						result = result && pattern.test(value[i] + '');
					}
					return result;
				}
				return pattern.test(value+'');
				
			} catch (e) {
				console.error('CbnFrom.Validator(\'pattern\'): invalid pattern!', e);
				return false;
			}
		},
		
		validateWithPattern: function(value, settings) {
			// 'this' is the registered validator
			settings = Validator.normalizeSettings(settings);
			if (!settings.validate) 
				return true;
			return PatternValidator.validate.call(this, value, PatternValidator._patterns[this.name]);
		}
	};
	
	/**
	 * Validates whether the value matches the specified pattern.
	 */
	Validator.register({
		name: 'pattern',
		types: ['text'],
		message: 'Invalid value!',
		validate: PatternValidator.validate
	});
	
	/**
	 * Validates whether the value is a (hopefully) valid email.
	 */
	Validator.register({
		name: 'email',
		types: ['text', 'multiple'],
		message: 'Invalid email!',
		validate: PatternValidator.validateWithPattern
	});
	
	/**
	 * Validates whether the value has a length greater or equal than a reference value.
	 */
	Validator.register({
		name: 'minlength',
		types: ['text'],
		message: 'The value is too short!',
		validate: function(value, settings/*, input, stop */) {
			settings = Validator.normalizeSettings(settings);
			value = value+'';
			if (!settings.validate)
				return true;
			
			return (value.length >= settings.validate);
		}
	});
	
	/**
	 * Validates whether the value has a length lesser or equal than a reference value.
	 */
	Validator.register({
		name: 'maxlength',
		types: ['text'],
		message: 'The text is too large!',
		validate: function(value, settings/*, input, stop */) {
			settings = Validator.normalizeSettings(settings);
			value = value+'';
			if (!settings.validate)
				return true;
			
			return (value.length <= settings.validate);
		}
	});
	
})(window.Cbn.Form.Validator);
