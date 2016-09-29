(function(CbnForm) {
	
	if (!Polymer.reflect) return;
	
	/**
	 * The behavior to use for extending Polymer's `paper-textarea` element with `cbn-form` features.
	 */
	var ext = CbnForm.PolymerElements.PaperTextareaExtension = {
		
		dynamicAttributes: {
			"rows": { "type": "attribute" },
			"maxRows": { "type": "attribute" }
		}
		
	};
	
	Polymer.injectBehaviors('iron-autogrow-textarea', [
			CbnForm.FormElement, CbnForm.InputElementImpl,
			CbnForm.Validatable, CbnForm.DynamicElement, ext ]);
	
	CbnForm.registerElement('iron-autogrow-textarea', {
			types: [ 'textarea' ],
			priority: 1
		});
	
})(window.Cbn.Form);
