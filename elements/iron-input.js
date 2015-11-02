(function(CbnForm) {
	
	if (!Polymer.reflect) return;
	
	/**
	 * The behavior to use for extending Polymer's `iron-input` element with `cbn-form` features.
	 */
	CbnForm.PolymerElements.IronInputExtension = {
		
		properties: {
			
			/**
			 * Use this property instead of `value` for two-way data binding.
			 */
			bindValue: {
				observer: '_fe_bindValueChanged',
				type: String
			},
			
			/**
			 * Do not break non-cbn-form usage.
			 */
			_exposeInputEvents: {
				type: Boolean,
				value: true,
				readOnly: true
			}
			
		},
		
		ready: function() {
			
		},
		
		/**
		 * Observes when the bindValue changes and sets the value.
		 */
		_fe_bindValueChanged: function(newValue) {
			this._setValue(newValue);
		},
		
		/**
		 * Overridden to also change the {@link #bindValue} property. 
		 * 
		 * @param value The value to set.
		 * @protected
		 */
		_setValue: function (value) {
			if (this._fe_previousValue !== value) {
				this.value = value;
				this.bindValue = value;
				this._fe_previousValue = value;
				this._fe_valueChanged(value);
			}
		}
		
	};
	
	Polymer.injectBehaviors('iron-input', [ CbnForm.FormElement, CbnForm.NativeInputElementImpl, 
			CbnForm.Validatable, CbnForm.DynamicElement,
			CbnForm.PolymerElements.IronInputExtension ]);
	
	CbnForm.registerElement('iron-input', {
			types: [ 'text', 'number' ],
			extends: 'input',
			priority: 1
		});
	
})(CbnForm);
