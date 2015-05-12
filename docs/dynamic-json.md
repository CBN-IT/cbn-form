CBN Forms
=========

Dynamic forms documentation
---------------------------

The dynamic form configuration object has the following format: 

```javascript
config = {
	"fieldDefaults": {
		"preview": true, 
		"decorator": "cbn-basic-decorator"
	},
	"groups": [{
		"caption": "Group Caption", 
		"fields": [
			{
				"name": "example",
				"type": "text",
				"label": "Example Field",
				"preview": true, 
				"format": "capitalize"
			}, // etc.
		]
	}]
}
```

Alternatively, you can specify a `fields` key directly if you want to have a flat structure: 
```javascript
config = {
	"flatFields": [
		{
			"name": "example",
			"type": "text",
			"label": "Example Field"
		}, // etc.
	]
}
```

<br>
### Available config object properties:
- `groups` (*FormGroupConfig[]*): form groups to render;
- `flatFields` (*FormFieldConfig[]*): if you want to directly print form fields (outside any group), use this instead 
   of specifying the fields inside `groups`;
- `flatFlexGrid` (*Boolean*): set to true to activate flexbox grid for `flatFields`;
- `fieldDefaults` (*FormFieldConfig*): use this to specify the default field properties that will be applied for all 
   `FormFieldConfig` objects (for fields inside `groups` or `flatFields`).

<br>
### Available `cbn-form-group` properties: 

- `caption` (*String*): the caption (text) of the form;
- `toggleable` (*Boolean*): whether the form group is toggleable (has two states: preview / editable) or all inputs are 
   editable by default;
- `className` (*String|String[]*): the HTML classes to add to the group element;
- `style` (*String|Object*): the CSS to add to the group element;
- `fields` (*FormFieldConfig[]*): the list of form field elements contained by the group.

<br>
### Available `FormFieldConfig` properties:

#### Attributes required / implemented by the abstract interface: 

- `name` (*String*): input's unique identifier / name;
- `type` (*String*): the type of the form field to render;
- `element` (*String*): override the name of the HTML input element to render; the element must implement   
   the `CbnAbstractInputMixin` mixin / interface; optional: usually, the element is autodetected from the input type;
- `decorator` (*String*): the name of the decorator (HTML element) to use for decorating the input; the element must 
   implement the `CbnAbstractInputDecoratorMixin` interface; set to false (default) if no decorator is desired; 
- `preview` (*Boolean*): for use with toggleable groups, specified whether the input is visible initially;
- `className` (*String|String[]*): the HTML classes to add to the group element;
- `style` (*String|Object*): the CSS to add to the group element.
- `flexGrid` (*Boolean*): Set to true to activate the flexboxgrid row class for the contained inputs, 
   see http://flexboxgrid.com for documentation;

<br>
**There are several other recommended attributes:**

#### 1. For all input types:

- `label` (*String*): caption text to show next to the field;
- `tooltip` (*String*): a tooltip to show to the user (i.e. if the user hovers over a help icon);
- `format` (*String*): a formatting method to pass the input's value through before returning it;
- `validate` (*Object*): an object with validation methods to apply to the input;
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

- [HTML5 constraint validation attributes](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation);
- `minlength`, `maxlength` for text/textarea fields;
- `minfilesize`, `maxfilesize` for file inputs;

