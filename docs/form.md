Cbn-Form
========

Use cases
---------

1. User enters something inside a text input. 
=> The input should fire a 'value-changed' event.

2. The developer wants to reset the form fields. He sets `model = {}`.
=> The input's value gets changed, then a 'value-changed' event will get fired (with an `indirect: true` detail).
