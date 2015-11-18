(function(CbnForm) {
	
	/**
	 * The `CbnForm.PaperContainer` behavior is for elements that use `<paper-input-container>`.
	 * 
	 * It declares all common properties and `dynamicAttributes` that all other CbnForm's functional behaviors use.
	 * 
	 * @polymerBehavior
	 */
	CbnForm.PaperContainer = {
		
		properties: {
			// will be filled in the code below
		},
		
		/**
		 * Defines the dynamic attributes of paper input elements.
		 */
		dynamicAttributes: {
			"type" 		: { type: 'attribute' },
			"preview"	: { type: 'attribute' },
			"label" 	: { type: 'attribute' },
			"placeholder" : { type: 'attribute' },
			"allowedPattern": { type: 'property' },
			"charCounter" : { type: 'property' },
			"noLabelFloat" : { type: 'property' },
			"alwaysFloatLabel" : { type: 'property' },
			"autoValidate" : { type: 'property' },
			
			// also completed below
		}
		
	};
	
	// build the effective dynamic attributes object to set to the paper-container
	[ CbnForm.FormElement, CbnForm.InputElementImpl, CbnForm.Validatable, CbnForm.DynamicElement ]
		.forEach(function(bhv) {
			if (bhv.properties) {
				Object.getOwnPropertyNames(bhv.properties).forEach(function (n) {
					if (n.slice(0,1) !== '_' && !CbnForm.PaperContainer.properties[n]) {
						CbnForm.PaperContainer.properties[n] = clonePropertyObj(bhv.properties[n]);
					}
				});
			}
			if (bhv.dynamicAttributes) {
				Object.getOwnPropertyNames(bhv.dynamicAttributes).forEach(function (n) {
					if (!CbnForm.PaperContainer.dynamicAttributes[n]) {
						CbnForm.PaperContainer.dynamicAttributes[n] = bhv.dynamicAttributes[n];
					}
				});
			}
		});
	
	/**
	 * Clones a property object.
	 * 
	 * @param source The source property object to clone.
	 */
	function clonePropertyObj(source) {
		var obj = {};
		Object.getOwnPropertyNames(source).forEach(function (n) {
			if (n == 'observer') return;
			obj[n] = source[n];
		});
		return obj;
	}
	
})(CbnForm);
