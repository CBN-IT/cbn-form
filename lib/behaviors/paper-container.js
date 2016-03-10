(function(CbnForm) {
	
	/**
	 * The `CbnForm.PaperContainer` behavior is for elements that use `<paper-input-container>`.
	 * 
	 * It declares all common properties and `dynamicAttributes` that all other CbnForm's functional behaviors use and 
	 * implements custom validation / empty value logic.
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
			"autoValidate" : { type: 'property' }
			
			// also completed below
		},
		
		/**
		 * Returns reference to the internal `paper-input-container` element.
		 * 
		 * @returns {Element} The paper container element.
		 */
		get _container() {
			return this.$$('paper-input-container');
		},
		
		/**
		 * Extension point for returning whether the contained input is empty.
		 * 
		 * @param {Element} input The source input element.
		 * @param {*}       value The value to check.
		 * @returns {Boolean} True if the input's displayed value is empty.
		 */
		_isInputEmpty: function(input, value) {
			return !(value || value === 0);
		},
		
		/**
		 * When the element is ready, will enhance the internal `paper-input-container` element.
		 */
		ready: function() {
			var container = this._container;
			var self = this;
			var inputElement = this._container._inputElement;
			
			// override some of the container's input handlers for better validation / empty value handling
			container.addEventListener('input', function(event) {
				if (event.target === inputElement) return;
				this._handleValue(inputElement);
			}.bind(container));
			
			container.addEventListener('cbn-form-validate', function(event) {
				container.invalid = !event.detail.result;
				container._handleValue(event.target);
			}.bind(container));
			
			// rebind the value-changed event
			if (container.attrForValue) {
				container._inputElement.removeEventListener(container._valueChangedEvent, container._boundValueChanged);
				container._boundValueChanged = function (event) {
					if (event.detail && event.detail.indirect) {
						this._handleValue(inputElement);
						return;
					}
					this._handleValueAndAutoValidate(inputElement);
				}.bind(container);
				container._inputElement.addEventListener(container._valueChangedEvent, container._boundValueChanged);
			}
			
			container._handleValue = function(inputElement) {
				var value = this._inputElementValue;
				//noinspection JSUnusedGlobalSymbols
				this._inputHasContent = !self._isInputEmpty(inputElement, value);
				
				this.updateAddons({
					inputElement: inputElement,
					value: value,
					invalid: this.invalid
				});
			};
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
