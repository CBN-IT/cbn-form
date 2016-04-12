(function(CbnForm) {
	
	//noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
	/**
	 * Addon behavior for input elements that maintains a two-way binding between the input's `value` and a custom 
	 * internal value property (`_internalValue`) using custom transformation callbacks (`_fromInternalValue` and 
	 * `_toInternalValue`) to convert between them.
	 * 
	 * This is useful for extending (via decoration) other form inputs or if the current input needs to do some 
	 * processing in order to normalize the displayed value.
	 * 
	 * @polymerBehavior
	 */
	CbnForm.InputValueTransformer = {
		
		properties: {
			
			/**
			 * File input's value is an object that contains file data & metadata.
			 * 
			 * If the `multiple` property is true, this value will be an array of objects.
			 */
			value: {
				type: Object,
				observer: '_valueChanged'
			},
			
			/**
			 * The internal (transformed) value.
			 */
			_internalValue: {
				type: Object,
				observer: '_internalValueChanged'
			}
			
		},
		
		/**
		 * Whether the value is currently being transformed to the internal value.
		 */
		_transformingModelValue: false,
		
		/**
		 * Whether the internal value is currently being transformed back to value.
		 */
		_transformingInternalValue: false,
		
		/**
		 * Whether to set the newly-transformed internal to model value directly (`null`) or indirectly 
		 * (true / a notification object).
		 */
		_transformValueMode: null,
		
		// Protected API:
		
		/**
		 * Method used for setting the transformed internal value from model.
		 * 
		 * You can override this to define custom indirect notification logic to the target element.
		 * 
		 * @param {*} internalValue The new internal value to set / transform.
		 * @param {Boolean|Object} [indirect] Whether to change it directly or indirectly (accepts a notification object).
		 */
		_setInternalValue: function(internalValue, indirect) {
			this._internalValue = internalValue;
		},
		
		/**
		 * A helper event handler that can be used when the internal value is linked to another `CbnForm.InputElement`.
		 * 
		 * It will automatically propagate it to the model value using the same mode (direct / indirect) and 
		 * notifications as the source event.
		 * Additionally, it hides the event (stops its propagation). Useful when decorating other input elements.
		 *
		 * @param {Object} event The event object.
		 */
		_handleInternalValueChanged: function(event) {
			event.stopPropagation();
			
			if (!event.detail) return; // invalid event?
			
			var isDirect = true;
			var notification = {};
			Object.getOwnPropertyNames(event.detail).forEach(function(n) {
				if (n === 'value') return; // ignore the value
				isDirect = false;
				notification[n] = event.detail[n];
			});
			
			if (isDirect)
				notification = null;
			
			this._transformValueMode = notification;
			this._internalValue = event.detail.value;
		},
		
		// Implementation:
		
		/**
		 * Override the FormElement's value observer to prevent firing multiple `value-changed` events.
		 * We use our own model handling.
		 */
		_fe_valueChanged: function() {
		},
		
		/**
		 * Called when the input's value property is changed.
		 */
		_valueChanged: function() {
			if (!this._convertingInternalValue) {
				try {
					this._convertingModelValue = true;
					var notification = null;
					if (this._inputValueIndirectlyChanged) {
						notification = this._inputValueIndirectNotification;
						if (notification === null || notification === undefined)
							notification = true;
					}
					var internalValue = this._toInternalValue(this.value);
					this._setInternalValue(internalValue, notification);
					this._convertingModelValue = false;
					
				} finally {
					this._convertingModelValue = false;
				}
			}
			
			if (this._inputValueIndirectlyChanged) {
				// the `_setIndirectValue` input method will emit notifications
			} else {
				this.fire('value-changed', {
					value: this.value
				});
			}
		},
		
		/**
		 * Called when the internal value is changed.
		 */
		_internalValueChanged: function() {
			if (this._convertingModelValue)
				return;
			try {
				this._convertingInternalValue = true;
				var newValue = this._fromInternalValue(this._internalValue);
				
				if (this._transformValueMode !== undefined && this._transformValueMode !== null) {
					// set it indirectly
					this._setIndirectValue(newValue, this._transformValueMode);
					
				} else {
					// set it directly
					this._setValue(newValue);
				}
				
			} finally {
				this._convertingInternalValue = false;
				this._transformValueMode = null;
			}
		},
		
		// Callback methods:
		
		/**
		 * Callback responsible for converting the internal value to the model value of the element.
		 * 
		 * @param {*} internalValue The internal value to transform back to a model value.
		 * @return {*} The resulting model value.
		 */
		_fromInternalValue: function(internalValue) {
			return internalValue;
		},
		
		/**
		 * Callback responsible for converting the input's model value to the internal format.
		 *
		 * @param {*} value The model value to transform.
		 * @return {*} The resulting internal value to set.
		 */
		_toInternalValue: function(value) {
			return value;
		}
		
	};
	
})(window.Cbn.Form);
