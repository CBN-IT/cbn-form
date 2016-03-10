(function(Validator) {
	
	/**
	 * Implements common routines to use by all number validators.
	 */
	var NumberValidator = {
		isInteger: function(value) {
			return !!/^[+-]?[0-9]+$/.test(value+'');
		},
		
		isFloat: function(value) {
			return !!/^[+-]?[0-9]+(\.[0-9]*)?$/.test(value+'');
		},
		
		validateNumber: function(value, settings) {
			// 'this' is the actual validator instance
			settings = Validator.normalizeSettings(settings);
			if (!settings.validate)
				return true;
			
			value = 1*value;
			if (isNaN(value)) 
				return false;
			
			switch (this.name) {
				case 'min': 
					return (value >= settings.validate);
				case 'max': 
					return (value <= settings.validate);
			}
		}
	};
	
	/**
	 * Validates whether the value is a valid number.
	 * 
	 * Additional settings arguments:
	 * - 'type': the type of numeric values allowed ('integer' - default, 'float' available);
	 */
	Validator.register({
		name: 'number',
		types: ['text'],
		message: 'The value needs to be a number!',
		validate: function(value, settings/*, input, stop */) {
			settings = Validator.normalizeSettings(settings);
			if (!settings.validate)
				return true;
			
			if (settings.type == 'float' || settings.type == 'double') {
				return NumberValidator.isFloat(value);
				
			} else {
				return NumberValidator.isInteger(value);
			}
		}
	});
	
	/**
	 * Validates whether the input's value (which must be a number) is greater or equal than a reference value.
	 */
	Validator.register({
		name: 'min',
		types: ['text'],
		message: 'The number is too small!',
		validate: NumberValidator.validateNumber
	});
	
	/**
	 * Validates whether the input's value (which must be a number) is greater or equal than a reference value.
	 */
	Validator.register({
		name: 'max',
		types: ['text'],
		message: 'The number is too large!',
		validate: NumberValidator.validateNumber
	});
	
	
})(CbnForm.Validator);
