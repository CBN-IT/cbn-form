(function(Validator) {
	
	/**
	 * Validates whether the input array is not empty.
	 * 
	 * @param {Boolean} settings
	 */
	Validator.register({
		name: 'required',
		types: ['multiple'],
		message: 'This field is mandatory!',
		validate: function(value, settings, input, stop) {
			settings = Validator.normalizeSettings(settings);
			var required = settings.validate;
			if (!Array.isArray(value))
				return false;
			if (required)  // if required=true, validate the input
				return value.length > 0;
			
			if (!required && !value.length) // stop the rest of the validation if the value is not specified
				stop();
			return true;
		}
	});
	
	/**
	 * Validates whether the input array has a length greater or equal than the reference value.
	 */
	Validator.register({
		name: 'minlength',
		types: ['multiple'],
		message: 'Too few items selected!',
		validate: function(value, settings/*, input, stop */) {
			settings = Validator.normalizeSettings(settings);
			if (!settings.validate)
				return true;
			if (!Array.isArray(value))
				return false;
			
			return (value.length >= settings.validate);
		}
	});
	
	/**
	 * Validates whether the value has a length lesser or equal than the reference value.
	 */
	Validator.register({
		name: 'maxlength',
		types: ['multiple'],
		message: 'Too many items selected!',
		validate: function(value, settings/*, input, stop */) {
			settings = Validator.normalizeSettings(settings);
			if (!settings.validate)
				return true;
			if (!Array.isArray(value))
				return false;
			
			return (value.length <= settings.validate);
		}
	});
	
	
})(CbnForm.Validator);
