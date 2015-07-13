/**
 * CbnForm uses a interface-based component extension library that emulates Polymer 1.0 behaviors.
 */

(function(CbnForm) {
	
	/**
	 * Method used for implementing control abstract interfaces (like AbstractInput, AbstractContainer etc.) for a 
	 * polymer object.
	 * 
	 * A Polymer.mixin implementation that extends published properties, event handlers etc.
	 * Inspired from https://github.com/Polymer/polymer/issues/846.
	 * 
	 * @param {Object} obj The target object to extend.
	 */
	CbnForm.implement = function (obj/*, mixin1 ...*/) {
		var i, p, n, m, match; // iterators / auxiliary variables
		
		var overrideMethod = function(method) {
			var f = function() {
				var i;
				if (!this['_overriddenMethods'] || !this['_overriddenMethods'][method])
					return;
				
				if (this['_overriddenMethods'][method].before) 
					for (i=0; i<this['_overriddenMethods'][method].before.length; i++ ) {
						this['_overriddenMethods'][method].before[i].apply(this, arguments);
					}
				if (this['_overriddenMethods'][method].orig) {
					this['_overriddenMethods'][method].orig.apply(this, arguments);
				}
				if (this['_overriddenMethods'][method].after) 
					for (i=0; i<obj['_overriddenMethods'][method].after.length; i++ ) {
						this['_overriddenMethods'][method].after[i].apply(this, arguments);
					}
			};
			f._overriddenMethodDecorator = true;
			return f;
		};
		
		var initOverride = function(obj, method) {
			if (!obj._overriddenMethods[method]) 
				obj._overriddenMethods[method] = {
					before: [],
					orig: null,
					after: []
				};
		};
		
		// copies a property from a source object to a target object
		function copyProperty(name, source, target) {
			if (target.hasOwnProperty(name)) return; // skip if the property already exists
			var pd = getPropertyDescriptor(source, name);
			Object.defineProperty(target, name, pd);
		}
		// returns the property descriptor of an object; searches the object's prototype chain
		function getPropertyDescriptor(obj, name) {
			if (obj) {
				var pd = Object.getOwnPropertyDescriptor(obj, name);
				return pd || getPropertyDescriptor(Object.getPrototypeOf(obj), name);
			}
		}
		
		// internally used properties
		obj = obj || {};
		
		/**
		 * Stores the references of all mixins implemented so far.
		 * @private
		 * @property _implementedMixins
		 * @type {Object[]}
		 */
		if (!obj._implementedMixins) obj._implementedMixins = [];
		
		/**
		 * A map with the overridden methods.
		 * The key is the method name.
		 * 
		 * @private
		 * @property _overriddenMethods
		 * @type {Object<String,{before:Function[], , after:Function[]}>}
		 */
		if (!obj._overriddenMethods) obj._overriddenMethods = {};
		
		var lifecycleMethods = ["created", "ready", "attached", "domReady", "detached", "attributeChanged"];
		var doNotCopyProps = ["_extendProperties", "_implementedMixins", "_overriddenMethods"];
		var alwaysExtendProps = ["publish"];
		
		var methodsMap = {};
		lifecycleMethods.forEach(function (key) {
			methodsMap[key + '_'] = key;
			methodsMap['_' + key] = key;
		});
		for (i = 1; i < arguments.length; i++) {
			p = arguments[i];
			for (n in p) {
				if (!p.hasOwnProperty(n)) continue;
				if ( (match = /^([a-zA-Z0-9_]+Changed)_$/.exec(n)) || (match = /^_([a-zA-Z0-9_]+Changed)$/.exec(n)) ) {
					methodsMap[n] = match[1];
				}
			}
		}
		
		for (i = 1; i < arguments.length; i++) {
			p = arguments[i];
			
			// inherit the overridden methods
			if (p._overriddenMethods) {
				for (m in p._overriddenMethods) {
					if (!p._overriddenMethods.hasOwnProperty(m)) continue;
					initOverride(obj, m);
					if (p._overriddenMethods[m].before) 
						obj._overriddenMethods[m].before = obj._overriddenMethods[m].before.concat(p._overriddenMethods[m].before);
					if (p._overriddenMethods[m].after)
						obj._overriddenMethods[m].after = obj._overriddenMethods[m].after.concat(p._overriddenMethods[m].after);
					if (p._overriddenMethods[m].orig && !obj._overriddenMethods[m].orig)
						obj._overriddenMethods[m].orig = p._overriddenMethods[m].orig;
				}
			}
			// copy properties from mixin
			for (n in p) {
				if (!p.hasOwnProperty(n)) continue;
				
				if (methodsMap.hasOwnProperty(n)) {
					// special case: lifecycle/observer methods
					var method = methodsMap[n];
					initOverride(obj, method);
					
					if (n.indexOf('_') == 0) {
						obj._overriddenMethods[method].before.push(p[n]);
					} else {
						obj._overriddenMethods[method].after.push(p[n]);
					}
					
				} else if (doNotCopyProps.indexOf(n) != -1) {
					// special mixin property, do not copy
					
				} else {
					// custom property
					if ( (alwaysExtendProps.indexOf(n) != -1) ||
							(p.hasOwnProperty('_extendProperties') && p['_extendProperties'].indexOf(n) != -1)) {
						
						// extend the property (if it is an array or an object)
						if (p[n] instanceof Array) {
							if (!obj[n]) obj[n] = [];
							obj[n] = p[n].concat(obj[n]);
						} else if (typeof p[n] == 'object') {
							if (!obj[n]) obj[n] = {};
							for (var nk in p[n]) {
								if (!p[n].hasOwnProperty(nk)) continue;
								copyProperty(nk, p[n], obj[n]);
							}
						}
						
					} else {
						// just copy it (if it doesn't override)
						try {
							copyProperty(n, p, obj);
						} catch (e) {
							console.error("CbnForm.define: unable to copy object property '" + n + "'!",
								obj, e);
						}
					}
				}
				
				// nice to have: also extend eventDelegates handlers, property observers etc.
			}
			
			// insert the current interface to the implemented mixins list
			if (obj._implementedMixins.indexOf(p) == -1)
				obj._implementedMixins.push(p);
			if (p._implementedMixins) {
				for (var j=0; j < p._implementedMixins.length; j++) {
					if (obj._implementedMixins.indexOf(p._implementedMixins[j]) == -1)
						obj._implementedMixins.push(p._implementedMixins[j]);
				}
			}
			
			for (m in obj._overriddenMethods) {
				if (!obj._overriddenMethods.hasOwnProperty(m)) continue;
				if (!obj[m] || !obj[m]._overriddenMethodDecorator) {
					if (obj[m]) {
						// save the original method
						obj._overriddenMethods[m].orig = obj[m];
					}
					obj[m] = overrideMethod(m);
				}
			}
		}
		return obj;
	};
	
	/**
	 * Checks whether an object implements the specified mixin.
	 * Only usable with {@link #implement}.
	 * 
	 * @param  {Object}  obj The object to check.
	 * @param  {Object}  mixin The mixin to check if it is implemented by the object.
	 * @return {Boolean} True if the object implements the mixin. 
	 */
	CbnForm.implements = function (obj, mixin) {
		if (!obj._implementedMixins || !obj._implementedMixins.length) 
			return false;
		return (obj._implementedMixins.indexOf(mixin) != -1);
	};
	
})(window.CbnForm);
