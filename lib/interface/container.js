(function(CbnForm) {
	
	/**
	 * A mixin used by control containers (cbn-form, cbn-dynamic-form etc.) to gain control over an input's model value.
	 * 
	 * @extends CbnForm.AbstractControl
	 */
	CbnForm.AbstractContainer = {
		
		publish: { // Published attributes:
			
			/**
			 * Dynamic form's data model to use for its inputs. 
			 * If not set, the parent container will manage the children's model.
			 * 
			 * @attribute model
			 * @type {Object}
			 * @default null
			 */
			model: CbnForm.NullObject
			
		},
		
		/**
		 * This property should be true only for the `cbn-form` element.
		 * 
		 * @type {Boolean}
		 * @default false
		 */
		isMasterContainer: false,
		
		/**
		 * A dynamic list that stores the input children of the container. 
		 * Accessible after the domReady callback.
		 * @type {CbnForm.AbstractControl[]}
		 * @default []
		 */
		childControls: null,
		
		/**
		 * Like {@link #childControls}, but only stores the input elements whose values are bound to the container's 
		 * model.
		 * @type {CbnForm.AbstractInput[]}
		 * @default []
		 */
		childInputs: [],
		
		
		/**
		 * Finds the input with the given name.
		 * If multiple inputs use the same name, the behavior is undefined (either one of them can be returned).
		 * 
		 * @param {String} name The name of the input to look for.
		 * @return {HTMLElement} Reference to the input element, if found.
		 */
		getInputByName: function (name) {
			var element = null;
			this.childInputs.some(function(input) {
				if (input.name == name) {
					element = input;
					return true;
				}
				return false;
			}, this);
			
			return element;
		},
		
		/**
		 * Element instance created callback.
		 */
		created: function(){
			this.childControls = [];
			this.childInputs = [];
		},
		
		/**
		 * Polymer element ready callback.
		 * 
		 * Binds to the form control attached / detached events, sets/unsets the parentForm property and the model 
		 * (value) bindings.
		 */
		ready: function() {
			var container = this;
			var containerHasModel = (this.model && this.model != CbnForm.NullObject);
			
			this.addEventListener('cbn-form-control-attached', function (event) {
				var element = event.detail.element;
				container.childControls.push(element);
				
				if (container.isMasterContainer && element.parentForm != container) 
					element.parentForm = container;
				
				// bind to the input's value in a first-come, first-served manner
				if (containerHasModel && (element.hasModelValue || element.isFileInput) && !element.modelContainer) {
					container.bindValue(element);
					container.childInputs.push(element);
				}
			});
			
			this.addEventListener('cbn-form-control-detached', function (event) {
				var element = event.detail.element;
				if (container.isMasterContainer && element.parentForm == container) 
					element.parentForm = null;
				
				var idx = container.childControls.indexOf(element);
				if (idx >= 0) container.childControls.splice(idx, 1);
				
				if (element.hasModelValue && element.modelContainer == container) {
					container.unbindValue(element);
					
					idx = container.childInputs.indexOf(element);
					if (idx >= 0) container.childInputs.splice(idx, 1);
				}
			});
		},
		
		/**
		 * Model property changed. Used to detect changes to the model and re-bind the input values.
		 * Resets input validation states.
		 */
		modelChanged: function() {
			if (!this.model)
				this.model = {};
			
			for (var i=0; i<this.childInputs.length; i++) {
				var input = this.childInputs[i];
				this.bindValue(input);
				input.notifyValueChanged(true);
			}
		},
		
		/**
		 * Resets the form, reading the input values from the specified model and resetting input validation states.
		 * 
		 * @param {Object} model The model with the default values to set. If not specified, all inputs are emptied.
		 */
		reset: function(model) {
			if (!model) model = {};
			if (this.model == model) {
				for (var i=0; i<this.childInputs.length; i++) {
					var input = this.childInputs[i];
					// reset all inputs
					Platform.flush();
					input.notifyValueChanged(true);
				}
				
			} else {
				this.model = model;
				Platform.flush();
			}
		},
		
		/**
		 * Requests the validation of all inputs and returns the boolean result.
		 * 
		 * @return {Boolean} The validation result (true if all child inputs passed validation).
		 */
		validate: function() {
			var i;
			var passed = true;
			var firstInput = null; // first invalid input
			
			for (i=0; i<this.childInputs.length; i++) {
				if (!this.childInputs[i].validate()) {
					if (!firstInput) {
						firstInput = this.childInputs[i];
					}
					passed = false;
				}
			}
			// focus the first invalid input
			if (firstInput) {
				firstInput.focus();
			}
			
			return passed;
		},
		
		/**
		 * Binds an observer to the given model to an input's value property.
		 * 
		 * @param {CbnForm.AbstractInput} input The target input to bind to.
		 */
		bindValue: function(input) {
			// HACK / workaround for a typo bug in the Node.bind() library 
			if (input['bindings_'] && input['bindings_']['value']) {
				input['bindings_']['value'].close();
				input['bindings_']['value'] = undefined;
			}
			if (input.defaultValue !== null && input.defaultValue !== undefined && 
					this.getModelValue(input['name']) === undefined) {
				this.setModelValue(input['name'], input.defaultValue);
			}
			input.bind('value', new PathObserver(this.model, input['name']));
			input.modelContainer = this;
		},
		
		/**
		 * Unbinds the observer for an input's value property.
		 * 
		 * @param {CbnForm.AbstractInput} input The target input to unbind.
		 * @param {Boolean}               [force=false] Set to true to force unbinding (even if the owner is not 'this').
		 */
		unbindValue: function(input, force) {
			if (force || input.modelContainer == this) {
				// the element will automatically be unbound by Polymer after being detached
				// so we only need to update the input's model container
				input.modelContainer = null;
			}
		},
		
		/**
		 * Returns the model value at the specified path.
		 * 
		 * @param {String} path The path to get the value at.
		 */
		getModelValue: function(path) {
			var components = path.split('.');
			var curModel = this.model;
			if (!curModel) return;
			for (var i=0; i<components.length-1; i++) {
				if (!curModel[components[i]]) {
					return curModel[components[i]];
				}
				curModel = curModel[components[i]];
			}
			return curModel[components[components.length-1]];
		},
		
		/**
		 * Sets the model value at the specified path.
		 * 
		 * @param {String} path The path to set the value at.
		 * @param {*} value The value to set.
		 */
		setModelValue: function(path, value) {
			var components = path.split('.');
			var curModel = this.model;
			if (!curModel) return;
			for (var i=0; i<components.length-1; i++) {
				if (!curModel[components[i]]) {
					curModel[components[i]] = {};
				}
				curModel = curModel[components[i]];
			}
			curModel[components[components.length-1]] = value;
		}
		
	};
	
})(CbnForm);
