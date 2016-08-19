(function(CbnForm) {
	
	var InputElement = CbnForm.InputElementImpl; // alias
	
	/**
	 * Defines a `InputElement`-like behavior for use with native input elements (i.e. when your element directly 
	 * extends a native HTML element).
	 * 
	 * Note: modifying the native `value` property doesn't trigger the `_valueChanged` event automatically.
	 * You must instruct the users to either use a separate property for accessing/setting the value (e.g. `bindValue`) 
	 * or call a custom method after changing it in order to fire the `value-changed` event.
	 * 
	 * @polymerBehavior
	 */
	CbnForm.NativeInputElementImpl = {
		
		properties: {
			
			/* The following properties are already defined by the native input element: 
			 * - name 
			 * - value
			 * 
			 * Also, defaultValue is linked with the input's value attribute and needs special handling (see `defaultValue`).
			 */
			
			/**
			 * Whether the input provides a value.
			 */
			_hasModelValue: {
				type: Boolean,
				value: true
			},
			
			/**
			 * Stores the previous input value (used to prevent duplicate event thrashing).
			 */
			_fe_previousValue: {
				type: String,
				value: ''
			},
			
			/**
			 * The implementor can set this to true if he wants the `input` / `change` events to be exposed.
			 */
			_exposeInputEvents: {
				type: Boolean,
				value: false,
				readOnly: true
			}
			
		},
		
		listeners: {
			'input': '_fe_inputHandler',
			'change': '_fe_inputHandler'
		},
		
		set defaultValue(value) {
			this.setAttribute('default-value', (value ? value : ''));
		},
		get defaultValue() {
			return this.getAttribute('default-value');
		},
		
		
		/**
		 * Manually fires the `_valueChanged` event when the input changes.
		 * 
		 * @param {Event} event The DOM `input` / `change` event object.
		 * @private
		 */
		_fe_inputHandler: function(event) {
			if (!this._exposeInputEvents) {
				event.stopPropagation();
			}
			if (this._fe_previousValue !== this.value) {
				this._fe_previousValue = this.value;
				this._fe_valueChanged(this.value);
			} else {
				this._fe_previousValue = this.value;
			}
		},
		
		/**
		 * Used to change the input's value programmatically.
		 * Overridden to also emit a value change notification event.
		 * 
		 * @param value The value to set.
		 * @protected
		 */
		_setValue: function(value) {
			if (this._fe_previousValue !== value) {
				this.value = value;
				this._fe_previousValue = value;
				this._fe_valueChanged(this.value);
			}
		}
		
		// the rest of the properties/methods will be copied from FormElement
	};
	
	var NativeInputElement = CbnForm.NativeInputElementImpl;
	
	Object.getOwnPropertyNames(InputElement).forEach(function (n) {
		if (!NativeInputElement.hasOwnProperty(n))
			Polymer.Base.copyOwnProperty(n, InputElement, NativeInputElement);
	});
	
	CbnForm.NativeInputElement = [ CbnForm.FormElement, CbnForm.NativeInputElementImpl ];
	
})(window.Cbn.Form);
