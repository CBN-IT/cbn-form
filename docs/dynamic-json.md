CBN Forms
=========

Dynamic forms documentation
---------------------------

The dynamic form configuration object has the following format (example): 

```javascript
config = {
	"types": {
		"group": "cbn-form-group", 
		"text": "cbn-basic-input", 
	},
	"defaults": {
		"*": { "inherit": "input" }, 
		"input": {
			"decorator": "cbn-basic-decorator",
			"preview": true
		}
	},
	"elements": [{
		"type": "group",
		"caption": "Group Caption", 
		"children": [
			{
				"inherit": "input",
				"type": "text",
				"name": "example",
				"label": "Example Field"
			}, // etc.
		]
	}]
}
```

The `cbn-dynamic-form` element receives a config template and creates the elements inside its shadow DOM.

The form elements are specified as objects inside the `elements` array.

There are several types of form elements available:

- *input elements*, which provide the user with entering input values;
- *container elements*, which define a container that manages several other elements (via the `children` config 
  property);

All usable elements must implement the `CbnForm.DynamicControl` interface, which tells `cbn-dynamic-form` that the 
element supports dynamic instantiation and provides a map of configurable properties (`dynamicAttributes`).

### Template (config) object

The template object, at the root level, can have 3 basic properties:
 
- `types`: a &lt;String, String&gt; map with elements to use for each types; overrides the declared type of the elements;
- `defaults`: an object with default templates applied to the objects or that can be inherited by the elements (see below);
- `elements`: the main template array with the elements to render.

Each element's template object is a map of properties, some with special meaning:
 
- `inherit`: optional, specifies the name of a default template object to inherit;
- `type`: required, the type of the element (decides what form element should be created);
- `element`: optional, overrides the HTML element to instantiate;
- `children`: for container elements only, specify the list of children to render inside the target element;
- `wrapChildren`: optional, a HTML element to wrap children inside (see below); 
- `style`: the CSS attributes of the element; can be a Object or a CSS text (String);
- `className`: the CSS classes of the element; can be a Array or a space-separated String;
- some properties are defined inside the element interfaces and/or by the elements themselves and have special meaning;
- all other properties will be set as HTML attributes.

The template rendering process is recursive: for container elements, the list of `children` can contain other container 
elements that can have their own children and so on (i.e. the template system is hierarchic).

If you want to wrap the children elements of a form container element (e.g. to set a "row" class and have the child 
inputs aligned in a CSS grid), you can use the `wrapChildren` property to wrap them inside a basic HTML element. 
It accepts a standard template object, where you specify the element to be created by the `element` property, and 
accepts any other HTML attributes.

For example:
```javascript
{
	"elements": [ {
		"type": "group",
		"caption": "A Group", 
		"wrapChildren": {
			"element": "div", 
			"className": "row group-inner"
		}, 
		"children": [ /*...*/ ]
	} ]
}
```

<br>
### Cbn-Form-Group: 

Is a container element that groups together several other input elements, with preview/edit toggleable states (edit on 
focus).

Configurable properties:

- `caption` (*String*): the caption (text) of the form;
- `toggleable` (*Boolean*): whether the form group is toggleable (has two states: preview / editable) or all inputs are 
   editable by default;


<br>
### Input and decorator elements:



#### Attributes required / implemented by the `AbstractInput` interface: 

- `name` (*String*): input's name (model path);
- `decorator` (*String*): the name of the decorator (HTML element) to use for decorating the input; the element must 
   implement the `AbstractInputDecorator` interface; set to false (default) if no decorator is desired; 
- `preview` (*Boolean*): for use with toggleable groups, specified whether the input is visible initially;

#### Attributes for the `ValidatableInput` interface:

- `validation` (*Object*): an object with validation methods to apply to the input;
- `validationType` (*String*): the type of the validators to apply (usually, 'text');
- `validationOrder` (*[String]*): optional, an array with the order in which to run the validators;
- `validationMessage` (*String*): the error to display if the validation failed;

<br>
**There are several other recommended attributes:**

#### 1. For all input types:

- `label` (*String*): caption text to show next to the field;
- `tooltip` (*String*): a tooltip to show to the user (i.e. if the user hovers over a help icon);
- `format` (*String*): a formatting method to pass the input's value through before returning it;
- `error` (*String*): standard error message override to show if the validation failed.

#### 2. For multiple-valued (select) / autocompleted inputs: 

- `options`: a static array with values to show;
- `datasource`: the ID of a dynamic datasource element attached to the form that supplies the options;

The `options` array should be a string values list or an Object array (format: `{key: String, value: String}`).

#### 3. Other attributes used by some inputs: 

- `multiple`: specifies whether the input accepts more than one value and will output an array (instead of a scalar);

#### 4. Inert attributes (to be used by server-side / utility / other scripts): 

- `datatype`: specifies the datatype of the field;
- `defaultValue`: the default value to initialize new models with;

<br>
### Validators: 

The built-in validators were inspired from the 
[HTML5 constraint validation attributes](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation);

Available validators for `validationType: 'text'`: 

- `required`: validates that the input was not left empty;
- `minlength`, `maxlength`: verifies the length of the input string;
- `pattern`: validates using a RegExp pattern (+ some predefined pattern validators such as `email`);
- `number`, `min`, `max`: validates numeric values and their bounds;

For more information, please check `cbn-form-validator.html` (source).
