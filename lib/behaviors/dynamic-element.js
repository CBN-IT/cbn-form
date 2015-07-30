(function(CbnForm) {
	
	/**
	 * The `CbnForm.DynamicElement` behavior is used to tell `cbn-dynamic-form` which attributes are configurable from 
	 * a template.
	 * 
	 * In order to do this, you must specify a `dynamicAttributes` property on the prototype where you enumerate all 
	 * properties that can be specified inside the dynamic config/template object. It has the following format:
	 * 
	 * - either a map with simple `'propertyName': true` pairs, which tells the dynamic component to allow attributes 
	 *   with that name (will be properly converted to dash-case);
	 * - or a more verbose map with object value: `'propertyName': { type: '(attribute|property)', name: 'attribute-name' }`, 
	 *   which you can use to customize whether to set a HTML attribute or a DOM property and its name.
	 * 
	 * For example, if you have `{ "exampleProp": { type: 'attribute', name: 'example-attr' } }` and the template object 
	 * contains `{ "exampleProp": "example-value" }`, the element will have the `example-attr="example-value"` HTML 
	 * attribute.
	 * 
	 * Most `cbn-form` behaviors already specify a list of `dynamicAttributes`. They will be automatically inherited when 
	 * you include the behavior in your element (at `create` callback, the dynamic component will scan all behaviors and 
	 * will merge them into the main `dynamicAttributes` map).
	 * 
	 * @polymerBehavior
	 */
	CbnForm.DynamicElement = {
		
		properties: {
			
			/**
			 * If the element was instantiated dynamically (using `cbn-dynamic-form`), this will return the source 
			 * configuration object used to generate the current instance.
			 */
			sourceConfig: {
				type: Object,
				readOnly: true
			}
			
		},
		
		/**
		 * Defines the common dynamic attributes for all form elements.
		 * 
		 * Those will be inherited by all elements that implement this behavior.
		 */
		dynamicAttributes: {
			"style": {type: "style"},
			"className": {type: "className"}
		},
		
		/**
		 * Merge the `dynamicAttributes` pairs from all included behaviors.
		 */
		created: function() {
			if (this.dynamicAttributes) {
				this.dynamicAttributes = this._normalizeDynAttributes(this.dynamicAttributes);
			}
			if (this.behaviors) {
				// iterate them in reverse order as an efficient attribute override mechanic
				for (var i=this.behaviors.length-1; i>=0; i--) {
					var behavior = this.behaviors[i];
					if (behavior.hasOwnProperty('dynamicAttributes') && behavior['dynamicAttributes']) {
						var normAttrs = this._normalizeDynAttributes(behavior['dynamicAttributes']);
						Object.getOwnPropertyNames(normAttrs).forEach(function(n) {
							if (!this.dynamicAttributes.hasOwnProperty(n)) {
								// add it to the prototype's dynamicAttributes map
								this.dynamicAttributes[n] = normAttrs[n];
							}
						}, this);
					}
				}
			}
		},
		
		/**
		 * Normalizes the specified dynamic attributes map to be objects with `type` and `name` members.
		 * 
		 * @param {Object<String,Object|Boolean>} dynAttrs The source dynamic attributes map.
		 * @returns {Object<String,Object>} The normalized map.
		 * @protected
		 */
		_normalizeDynAttributes: function(dynAttrs) {
			var normAttrs = {};
			for (var n in dynAttrs) {
				if (!dynAttrs.hasOwnProperty(n)) continue;
				var attr = (dynAttrs[n] === true ? {} : dynAttrs[n]);
				
				normAttrs[n] = {
					name: ( attr.name ? attr.name : n),
					type: ( attr.type ? attr.type : 'attribute')
				};
			}
			return normAttrs;
		}
		
	};
	
})(CbnForm);
