(function(CbnForm) {
	
	//noinspection JSUnusedGlobalSymbols
	/**
	 * A behavior that can be implemented by form containers to capture form elements. 
	 * 
	 * A form container is a special type of form element that contains other form elements. 
	 * It provides specific features:
	 * 
	 * - maintains a list of contained form elements: {@link #formElements};
	 * - it hides the contained elements so that the it can be used to create a standalone element from multiple using 
	 *   elements as children.
	 * - if the {@link model} property is non-null, binds the inputs to a user-supplied model object which (two-way: 
	 *   when the input is changed, the model changes and vice-versa);
	 * - automatically detects when the model is changed and sets the {@link #isDirty} attribute; the dirty flag is 
	 *   removed when the model reverts to its initial values (for which you can use {@link #reset}).
	 * 
	 * In order for the model binding to work, all model changes must be done using Polymer's property notification 
	 * system (aka use the {@link Polymer.Base#set} method):
	 * ```javascript
	 *    // changes form.model['personal'].['email']
	 *    // in turn, updates the input with [name="personal.email"] that is bound to the form.
	 *    form.set('model.personal.email');
	 * ```
	 * 
	 * The `cbn-form` element itself uses this behavior.
	 * 
	 * @polymerBehavior
	 */
	CbnForm.FormContainer = {
		
		properties: {
			
			/**
			 * The form's data model which contains the values for all it inputs.
			 */
			model: {
				type: Object,
				notify: true
			},
			
			/**
			 * Stores the form's active children.
			 * Maintained by capturing `cbn-form-input-attached` and `cbn-form-input-detached` events.
			 */
			formElements: {
				type: Array,
				value: function() { return []; },
				readOnly: true
			},
			
			/**
			 * Tells whether the model is different from initial model / the model passed at reset.
			 */
			isDirty: {
				type: Boolean,
				value: false,
				reflect: true,
				readOnly: true
			},
			
			/**
			 * Maps the registered elements to model paths in order for them to be correctly notified when the model 
			 * changes.
			 * 
			 * For all path sub-prefixes of a registered element, the map will hold the reference of the elements that 
			 * have that name prefix.
			 * Because multiple elements might use the same path prefix, the map will store an Array of elements instead 
			 * of a plain HTMLElement map.
			 * 
			 * Example: for `<input name="my.data.name">`, the map will have the following keys set to a reference of 
			 * the element: `[ 'my', 'my.data', 'my.data.name' ]`.
			 * 
			 * @protected
			 */
			_modelPathPrefixMap: {
				type: Object,
				value: function() { return {}; },
				readOnly: true
			},
			
			/**
			 * Stores the dirty elements' names. 
			 * If this list is non-empty, it means that the model is dirty.
			 */
			_dirtyModelPaths: {
				type: Array,
				value: function() { return []; },
				readOnly: true
			},
			
			/**
			 * By default, the child elements inside a form container element are completely hidden from the outside (i.e. 
			 * the input / register events' propagation is stopped).
			 * 
			 * Set this to true to prevent this behavior.
			 * 
			 * @protected
			 */
			_exposeFormElements: {
				type: Boolean,
				value: false
			}
			
		},
		
		/**
		 * The event listeners:
		 */
		listeners: {
			'cbn-form-register': '_registerFormElement',
			'cbn-form-unregister': '_unregisterFormElement',
			'input': '_formElementValueChanged',
			'change': '_formElementValueChanged',
			'value-changed': '_formElementValueChanged'
		},
		
		/**
		 * Property observers:
		 */
		observers: [
			'_formModelChanged(model.*)'
		],
		
		/**
		 * This is used to prevent an `value-changed` event from being fired when the model changes.
		 * A value of false prevents input value change. If a function is provided, it will be called for each changed 
		 * input (with the element as parameter) and needs to change the value / notify the input of an indirect change.
		 * 
		 * @type {Boolean|Function}
		 */
		_modelChangeEffects: true,
		
		
		// Public API:
		
		/**
		 * Returns a form element with the given name.
		 * If multiple elements are registered with the same name, the behavior is undefined (either one of them can be 
		 * returned).
		 * 
		 * @param {String} name The name of the form element to look for.
		 * @return {HTMLElement|null} Reference to the input element, if found.
		 */
		getElementByName: function (name) {
			if (!this._modelPathPrefixMap[name]) return null;
			
			for (var i=0; i<this._modelPathPrefixMap[name].length; i++) {
				var el = /** @type {FormElement} */this._modelPathPrefixMap[name][i];
				if (el.name == name) {
					return /** @type HTMLElement */(el);
				}
			}
			
			return null;
		},
		
		/**
		 * Requests the validation of all children and returns the boolean result.
		 * 
		 * Automatically focuses the first invalid input (if found and `noFocus == false`).
		 * 
		 * @param {Boolean} [noFocus] Prevents focusing the first invalid input if the validation fails.
		 * @return {Boolean} True only if all child inputs are valid.
		 */
		validate: function(noFocus) {
			var passed = true;
			var firstInput = null; // first invalid input
			
			this.formElements.forEach(function(el){
				var input = /** @type CbnForm.Validatable */(el);
				if (!input.validate) return;
				if (!input.validate()) {
					if (!firstInput) {
						firstInput = input;
					}
					passed = false;
				}
			});
			
			// focus the first invalid input
			if (firstInput && !noFocus) {
				firstInput.focus();
			}
			
			return passed;
		},
		
		
		/**
		 * Resets the form, optionally setting the values from the specified model/value as default values.
		 * 
		 * Notifies the inputs with a custom `value-changed` event with the `indirect: true, reset: true` detail 
		 * properties.
		 * 
		 * Example: if you want to only reset a part of the form, you can specify a path: 
		 * ```
		 *     form.reset('personal'); // will reset only the inputs with the names 'personal.*'
		 *     form.reset('model.personal'); // same thing, for consistency with Polymer's set() and get()
		 * ```
		 * 
		 * @param {String} path The path to reset. Set to empty to replace the whole model.
		 * @param {Object} value The value to set at the specified model path.
		 */
		reset: function(path, value) {
			if (!path) path = '';
			if (!value && path == '') value = {};
			// if a non-final path, we need to set the empty object
			if (!value && !this.getElementByName(path)) value = {};
			
			this._modelChangeEffects = function (input) {
				input._setIndirectValue(this.get('model.' + input.name));
			}.bind(this);
			
			// the _modelChanged function will call the _modelChangeEffects from above for each changed input
			if (path) {
				path = (path.indexOf('model.') !== 0 ? "model." + path : path)
			} else { path = 'model'; }
			this.set(path, value);
			
			this._modelChangeEffects = true;
		},
		
		
		// Event handlers
		
		/**
		 * Handles the `cbn-form-register` event, adding it to the internal registry structures and setting up the 
		 * element's model.
		 * 
		 * @param event The `cbn-form-register` event object.
		 * @private
		 */
		_registerFormElement: function(event) {
			var domEvent = Polymer.dom(event);
			var element = event.detail.element || domEvent.localTarget;
			element._parentForm = this;
			
			if (!element.name) {
				console.warn('`cbn-form`: WARNING: form element attached without a name!', element);
			}
			
			// store the element inside container's structures
			this.formElements.push(element);
			
			if (element._hasModelValue) {
				var map = this._modelPathPrefixMap;
				var pathPrefixes = this._getModelPathPrefixes(element.name);
				pathPrefixes.forEach(function (path) {
					if (!map[path]) map[path] = [];
					map[path].push(element);
				});
				
				// initialize the model
				this._updateModelValue(element);
			}
			
			if (!this._exposeFormElements)
				event.stopPropagation();
		},
		
		/**
		 * Handles the `cbn-form-unregister` event (removes the element from the internal registry). 
		 * 
		 * As the input might fire several events for a value modification, this function must only process the change 
		 * once, so protections are in place.
		 * 
		 * @param event The `cbn-form-unregister` event object.
		 * @private
		 */
		_unregisterFormElement: function (event) {
			var domEvent = Polymer.dom(event);
			var element = event.detail.element || domEvent.localTarget;
			
			// remove it from the formElements array
			var idx = this.formElements.indexOf(element);
			if (idx >= 0) {
				this.formElements.splice(idx, 1);
				element._parentForm = null;
			}
			
			// remove it from the model path prefixes map
			var map = this._modelPathPrefixMap;
			var pathPrefixes = this._getModelPathPrefixes(element.name);
			pathPrefixes.forEach(function (path) {
				var idx = map[path].indexOf(element);
				if (idx >= 0) map[path].splice(idx, 1);
			});
			
			if (!this._exposeFormElements)
				event.stopPropagation();
		},
		
		/**
		 * Captures all input value change events and modifies the underlying model.
		 * 
		 * @param event A `input` / `change` / `value-changed` event object.
		 * @private
		 */
		_formElementValueChanged: function(event) {
			var domEvent = Polymer.dom(event);
			var element = event.detail.element || domEvent.localTarget;
			if (element._parentForm != this) return; // doesn't belong to this container
			if (!element.name) return; // no name?
			
			if (event.detail && event.detail.indirect) return; // skip indirect changes
			
			this._modelChangeEffects = false;
			this.set('model.' + element.name, element.value);
			this._modelChangeEffects = true;
			
			if (!this._exposeFormElements)
				event.stopPropagation();
		},
		
		/**
		 * A model value has been changed.
		 * 
		 * Notifies all inputs with the same path prefix of the changes made to their values.
		 * 
		 * @param {Object} changes The observed changes object.
		 */
		_formModelChanged: function(changes) {
			var components = changes.path.split('.');
			if (components.length < 1 || components[0] != 'model')
				return;
			
			if ((this.model || this.model === '') && typeof this.model != 'object') {
				this.model = {}; // anonymous model (for when the `model` attribute is set to an empty/true value)
			}
			
			var elements; // the elements to notify
			if (components.length == 1) { // model changed
				// notify all elements
				elements = this.formElements;
				
			} else { // a model path changed
				var modelPath = components.splice(1).join('.');
				elements = this._modelPathPrefixMap[modelPath];
			}
			
			if (elements) {
				if (!this._modelChangeEffects) return;
				
				// make sure that all model paths are defined
				elements.forEach(function (input) {
					this._updateModelValue(input);
				}, this);
				
				if (typeof this._modelChangeEffects == 'function') {
					// apply the function for each of the changed elements
					elements.forEach(function (input) {
						this._modelChangeEffects(input);
					}, this);
					
				} else {
					// apply the default effect
					elements.forEach(function (input) {
						input._setIndirectValue(this.get(input.name, this.model));
					}, this);
				}
			}
		},
		
		
		/**
		 * Builds the list of model path prefixes for the specified name.
		 * 
		 * For example: if name is 'my.data.name', the method will return `[ 'my', 'my.data', 'my.data.name' ]`.
		 * 
		 * @param {String} name The name to get the path prefixes for.
		 * @return {[String]} The prefixes for the requested path.
		 * @protected
		 */
		_getModelPathPrefixes: function(name) {
			if (!name) return [];
			
			var prefixes = [];
			var curPrefix = '';
			var components = name.split('.');
			for (var i = 0; i < components.length; i++) {
				curPrefix += (curPrefix? '.' : '') + components[i];
				prefixes.push(curPrefix);
			}
			return prefixes;
		},
		
		/**
		 * Called when a model path needs to be modified. 
		 * 
		 * Creates all parent model paths if undefined and checks if the default value needs to be set.
		 * Also maintains the {@link #_dirtyModelPaths} list and the {@link #isDirty} flag.
		 * 
		 * @param {CbnForm.FormElement} element The updated element.
		 * @protected
		 */
		_updateModelValue: function (element) {
			if (!this.model) return;
			
			function isValueSet(value) {
				return value || value === false /* unchecked checkbox, maybe? */;
			}
			
			var components = element.name.split('.');
			var obj = this.model;
			for (var i = 0; i < components.length - 1; i++) {
				if (!obj[components[i]]) {
					obj[components[i]] = {};
				}
				obj = obj[components[i]];
			}
			var value = obj[components[components.length - 1]];
			if (!isValueSet(value)) 
				obj[components[components.length - 1]] = element.defaultValue;
			
			// update the dirty flag
			var drtIdx = this._dirtyModelPaths.indexOf(element.name);
			var pathIsDirty = (isValueSet(value) && 
					(!isValueSet(element.defaultValue) || value != element.defaultValue));
			if (drtIdx >= 0 && !pathIsDirty) {
				// we need to remove it
				this._dirtyModelPaths.splice(drtIdx, 1);
			} else if (drtIdx == -1 && pathIsDirty) {
				// we need to add it
				this._dirtyModelPaths.push(element.name);
			}
			//noinspection JSUnresolvedFunction
			this._setIsDirty(this._dirtyModelPaths.length > 0);
		}
		
	};
	
	/**
	 * The FormElement interface declaration (for JSDoc purposes).
	 * 
	 * @typedef {Object} CbnForm.FormContainer
	 * 
	 * @property {Object|null} model The form's data model.
	 * @property {[CbnForm.FormElement|HTMLElement]} formElements The list of registered form elements.
	 * @property {Boolean} isDirty Whether the model is dirty (differs from the defaults).
	 * 
	 * Methods:
	 * @property {Function} getElementByName Finds a form element by name.
	 * @property {Function} _setIsDirty Changes the dirty status of the model.
	 * @property {Function} _updateModelValue Updates the model at the specified path.
	 */
	
})(CbnForm);
