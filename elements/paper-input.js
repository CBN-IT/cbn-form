(function(CbnForm) {
	
	if (!Polymer.reflect) return;
	
	/**
	 * The behavior to use for extending Polymer's `paper-input` element with `cbn-form` features.
	 */
	var ext = CbnForm.PolymerElements.PaperInputExtension = {
		
		/**
		 * Additional input properties that should be copied by paper-input.
		 */
		_customInputProperties: [
			"defaultValue", "preview",
			"validation", "validationOrder", "validationType", "defaultValidationMessage"
		],
		
		observers: [],
		
		listeners: {
			'cbn-form-register': '_cbnInputElementRegistered'
		},
		
		ready: function() {
			this._cbnResetInputAttributes();
		},
		
		/**
		 * Captures the `cbn-form-register` event to set the correct defaultValue property on it.
		 * 
		 * @param event The event object.
		 */
		_cbnInputElementRegistered: function(event) {
			if (this.defaultValue !== undefined)
				event.target.defaultValue = this.defaultValue;
		},
		
		/**
		 * Re-sets (copies) the custom properties to the child iron-input element.
		 */
		_cbnResetInputAttributes: function() {
			if (!this.$.input) return;
			this._customInputProperties.forEach(function(prop) {
				this.$.input[prop] = this[prop];
			}, this);
		}
		
	};
	
	ext._customInputProperties.forEach(function(prop) {
		ext.observers.push('_cbnResetInputAttributes(' + prop + ')');
	});
	
	Polymer.injectBehaviors('paper-input', [ CbnForm.DynamicElement,
		CbnForm.PaperContainer, CbnForm.PolymerElements.PaperInputExtension ]);
	
	CbnForm.registerElement('paper-input', {
			types: [ 'text', 'number' ],
			priority: 5
		});
	
})(window.Cbn.Form);
