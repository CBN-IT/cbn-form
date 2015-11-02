(function(CbnForm) {
	
	if (!Polymer.reflect) return;
	
	/**
	 * The behavior to use for extending Polymer's `paper-input` element with `cbn-form` features.
	 */
	CbnForm.PolymerElements.PaperInputExtension = {
		
		/**
		 * Defines the common dynamic attributes for all form elements.
		 */
		dynamicAttributes: {
			"type" 		: { type: 'attribute' },
			"name" 		: { type: 'attribute' },
			"defaultValue" : { type: 'attribute' },
			"preview"	: { type: 'attribute' },
			"label" 	: { type: 'attribute' }
		}
		
	};
	
	Polymer.injectBehaviors('paper-input', [ CbnForm.DynamicElement,
			CbnForm.PolymerElements.PaperInputExtension ]);
	
	CbnForm.registerElement('paper-input', {
			types: [ 'text', 'number' ],
			priority: 5
		});
	
})(CbnForm);
