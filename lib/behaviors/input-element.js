(function(CbnForm) {
	
	/**
	 * Defines a form input element for use with `cbn-form` components suite.
	 * 
	 * This behavior provides normalized form input semantics:
	 * 
	 * - the {@link #value} property provides read/write access to the input's value;
	 * - fires custom `value-changed` events (direct / indirect + custom tags) for advanced input elements;
	 * - can integrate with the `CbnForm.FormContainer` elements (which provide model value binding, object mapping 
	 *   etc.);
	 * 
	 * There are two value setting modes: 'direct' and 'indirect'.
	 * By default, changing the input's value property (either by user interaction with the input or programmatically) 
	 * fires a 'direct' change event.
	 * 
	 * The input element can specifically tag value changes as 'indirect' and include custom values inside the 
	 * notification event. This is desirable to implement some advanced features: e.g. inputs that may modify their 
	 * values after the user sets them (reformatting), multiple form elements that need to interoperate etc.
	 * This mechanism was also used to implement the `CbnForm.FormContainer` model value binding, to differentiate 
	 * between the two value propagation directions: inward (from model to input) and outward (input to form model).
	 * 
	 * You can see whether the input's value was changed directly or indirectly by checking the event's 
	 * `event.detail.indirect` property (boolean).
	 * 
	 * You should include this behavior after `CbnForm.FormElement`.
	 * 
	 * @polymerBehavior
	 */
	CbnForm.InputElementImpl = {
		
		properties: {
			
			/**
			 * Input's name.
			 * 
			 * It is used as form model binding path by `CbnForm.FormContainer`.
			 * For example, if the name is 'name.first_name' will bind to `model['name']['first_name']`.
			 * 
			 * Note that it must be set at creation time (before the input element is ready)!
			 */
			name: {
				type: String,
				value: ''
			},
			
			/**
			 * Input's value attribute.
			 * 
			 * Should be String for most of the cases, Array for inputs with multiple values and Object for
			 * special input types (e.g. file).
			 * 
			 * @type {String|Number|Array|Object}
			 */
			value: {
				type: String,
				value: '',
				notify: false, /** event is manually fired, see {@link #_fe_valueChanged} */
				observer: '_fe_valueChanged'
			},
			
			/**
			 * Input's default value.
			 * Will be automatically set if the model value is empty.
			 * 
			 * @type {String|Number|Array|Object}
			 */
			defaultValue: {
				type: String,
				value: ''
			},
			
			/**
			 * If the input's value is an object to map its properties directly to the form's model.
			 * 
			 * It must be map of value property name to model names to be used by the form 
			 * containers.
			 * 
			 * E.g.
			 * ```
			 *     input.value = { country: "...", county: "...", city: "..." }
			 *     input.mapToModel = { "country": "addr_country", "county": "addr_county", "city": "addr_city" };
			 *     // resulting model:
			 *     form.model = { "addr_country": "...", "addr_county": "...", "addr_city": "..." }
			 * ```
			 * 
			 * Note that it must be set at creation time (before the input element is ready)!
			 * 
			 * WARNING: not implemented yet!
			 */
			mapToModel: {
				type: Object,
				value: null
			},
			
			// protected properties:
			
			/**
			 * This input provides a model value.
			 */
			_hasModelValue: {
				type: Boolean,
				value: true
			}
			
		},
		
		/**
		 * Defines the common dynamic attributes for all form elements.
		 */
		dynamicAttributes: {
			"type" 		: { type: 'attribute' },
			"name" 		: { type: 'attribute' },
			"disabled" 	: { type: 'attribute' },
			"defaultValue" : { type: 'property' },
			"autocomplete": { type: 'attribute' },
			"autofocus": { type: 'attribute' },
			"inputmode": { type: 'attribute' },
			"readonly": { type: 'attribute' },
			"size": { type: 'attribute' },
			"preview"	: { type: 'attribute' }
		},
		
		/**
		 * Will automatically be set to true if the {@link #value} property is indirectly changed (i.e. from the form's 
		 * model).
		 * 
		 * Only available inside the `value` observer methods.
		 * 
		 * @type {Boolean}
		 */
		_inputValueIndirectlyChanged: false,
		
		/**
		 * Stores the notification object while the `value` property is being changed indirectly (available through its
		 * observers' execution context).
		 * 
		 * @type {Object|Boolean}
		 */
		_inputValueIndirectNotification: null,
		
		
		// Events
		
		/**
		 * Notifies the other components that the input's value is changed.
		 * 
		 * If you want to customize / avoid firing this event while changing the input's value, see {@link #_setIndirectValue}.
		 * 
		 * @event value-changed
		 * @detail {mixed}   value The new value of the input.
		 * @detail {Boolean} indirect If the value was indirectly changed (e.g. by modifying the form model)
		 */
		
		
		// Observers / Event handlers
		
		/**
		 * Observer for the form element's {@link #value} property.
		 * 
		 * It manually fires the 'value-changed' event conditionally if {@link #_inputValueIndirectlyChanged} is false.
		 * 
		 * @param {mixed} newValue The new value that was set.
		 */
		_fe_valueChanged: function(newValue) {
			if (this._inputValueIndirectlyChanged) return;
			
			this.fire('value-changed', {
				value: newValue
			});
		},
		
		
		// Protected Methods: (to be used by `cbn-form` components / behavior users)
		
		/**
		 * Changes the input's value programmatically.
		 * 
		 * Should fire notification events (if {@link #_inputValueIndirectlyChanged} is not true).
		 * 
		 * @param value The value to set.
		 * @protected
		 */
		_setValue: function (value) {
			// let the _fe_valueChanged observer handle notifications
			this.value = value;
		},
		
		/**
		 * Changes the input's value indirectly (fires a custom tagged `value-changed` event).
		 * 
		 * @param {*}              value The value to set.
		 * @param {object|Boolean} [notification] Notification details to include. Defaults to `{indirect: true}`. 
		 *                         Set to false to avoid firing the `value-changed` event.
		 * @protected
		 */
		_setIndirectValue: function(value, notification) {
			if (notification === undefined || notification === null)
				notification = true;
			this._inputValueIndirectlyChanged = true;
			this._inputValueIndirectNotification = notification;
			// the value observers will synchronously fire and avoid firing `value-changed` themselves
			try {
				this._setValue(value);
				
			} finally {
				this._inputValueIndirectlyChanged = false;
				// allow the observers to modify the notification object 
				// (e.g. set it to false to disable firing the event)
				notification = this._inputValueIndirectNotification;
				if (notification !== false) {
					if (notification === true)
						notification = { indirect: true };
					this.fire('value-changed', this.extend({
						value: value
					}, notification));
				}
			}
		}
		
	};
	
	CbnForm.InputElement = [ CbnForm.FormElement, CbnForm.InputElementImpl ];
	
	/**
	 * The InputElement interface declaration (for JSDoc purposes).
	 * 
	 * @typedef {Object} CbnForm.InputElement
	 * 
	 * @property {String} name Form element's name.
	 * @property {*} value Input value.
	 * @property {*} defaultValue Input's default value.
	 * @property {Object} mapToModel If the value is an object, maps them to the model.
	 * @property {Boolean} _hasModelValue Whether the input has a value.
	 * @property {Boolean} _inputValueIndirectlyChanged Whether the current change event is indirect.
	 * @property {HTMLElement} parentForm The element's parent form container.
	 * 
	 * Methods:
	 * @property {Function} _setValue Programmatically set the input's value.
	 * @property {Function} _setIndirectValue Set the input's value indirectly.
	 */
	
})(CbnForm);
