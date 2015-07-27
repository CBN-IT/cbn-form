(function(CbnForm) {
	
	/**
	 * Defines the abstract interface to be implemented by the custom input elements.
	 * 
	 * @extends CbnForm.AbstractControl
	 */
	CbnForm.AbstractInput = [CbnForm.AbstractControl, {
		
		publish: { // Published attributes:
			
			/**
			 * Input's name. 
			 * 
			 * It is used as model binding path 
			 * For example, the value 'name.first_name' will bind to the model path `model.name.first_name`.
			 * 
			 * @attribute name
			 * @type {String}
			 */
			
			/**
			 * Input's value attribute.
			 * Should be String for most of the cases, Array if the input supports multiple values and Object for
			 * special input types (e.g. file). And array of objects for special types with multiple values, ofc. ;)
			 * 
			 * Note: the input's value can change in two ways: 
			 * 
			 * - by modifying the model / by programmatically setting the input value => input should fire a 
			 *   value-change event (which bubbles upwards the tree for its parents to also know it);
			 * - when the user manipulates the input => input fires input / change events (should also bubble).
			 * 
			 * @attribute value
			 * @type { Array | Object | [String] | [Object]}
			 */
			
			/**
			 * Input's default value.
			 * Will be automatically set if no model value is specified.
			 * 
			 * @attribute defaultValue
			 * @type {*}
			 */
			defaultValue: null,
			
			/**
			 * Is the input currently in a preview state?
			 * 
			 * Automatically bound by the `cbn-form-group` component if the {@link #preview} property is true.
			 * 
			 * @attribute previewState
			 * @type {Boolean}
			 */
			previewState: false
			
		},
		
		// Events
		
		/**
		 * Custom inputs should fire `input` and `changed` events just like their native counterparts: whenever the value 
		 * is changed as a result of user's interaction with the element.
		 * 
		 * The `input` event is fired every time the input's value changes (e.g. for every character typed).
		 * This event bubbles. If your input's shadow dom contains other custom/native inputs (which also fires those 
		 * events), it should stop their hide them and fire their own targeted events.
		 *
		 * @event input
		 */
		
		/**
		 * The `change` event should be fired when the input value is committed (e.g. the element loses focus).
		 * The event bubbles.
		 * 
		 * @event change
		 */
		
		/**
		 * Should be fired when the input's value is programmatically changed (i.e. the form's model is changed).
		 * You can use the {@link #notifyValueChanged} method to do it.
		 * 
		 * Event details:
		 * 
		 * - reset: will be set to true if the input validation state needs to be reset.
		 * 
		 * @event value-change
		 */
		
		// DOM Properties:
		
		/**
		 * Should be false if the element doesn't need to bind to the form's model. 
		 * @type {Boolean}
		 */
		hasModelValue: true, 
		
		/**
		 * Optional properties to pass to the parent decorator element (if any).
		 * 
		 * Use if you require special treatment from the decorator. Only used by the dynamic form.
		 * 
		 * @type {Object}
		 */
		decoratorConfig: null,
		
		/**
		 * Stores the parent container element bound to the input's model object.
		 * Available just after the element's `attached` event is processed (the element's `attached` callback is fine).
		 * @type {HTMLElement}
		 */
		modelContainer: null,
		
		
		// Callback methods
		
		/**
		 * Element instance created callback.
		 */
		created: function () {
			if (!this.decoratorConfig)
				this.decoratorConfig = {};
			if (this.setDynamicAttributesList)
				this.setDynamicAttributesList({
					"type" 		: { type: 'attribute' },
					"name" 		: { type: 'attribute' },
					"defaultValue" : { type: 'attribute' },
					"preview"	: { type: 'attribute' }
				});
		},
		
		/**
		 * Called when the value is programmatically changed in order to emit a 'model-value-changed' event.
		 * 
		 * @param {Boolean} [reset] Set to true to reset input's validation state.
		 */
		notifyValueChanged: function(reset) {
			if (reset && this.resetValidation) {
				this.resetValidation();
			}
			this.fire('value-changed', { reset: reset });
		}
		
		
	}];
	
})(CbnForm);
