# Angular Selector [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/indrimuska/angular-selector?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Angular Selector is a native AngularJS directive that transform a simple `<select>` box into a full html select with typeahead. 

### Features

* **No-jQuery Required**<br>
  Angular Selector is a full native Angular directive, so you can use it without have to include any other library (except Angular.js, of course!).
* **Skinnable**<br>
  You can define a template for the items in the dropdown list and a template for selected items.
* **RTL Support**<br>
  To use it in with any kind of text direction.
* **Remote Resource Loading**<br>
  Fetch your data from an external source and use it in your application.
* **From HTML `<option>` to JS `object`**<br>
  Fill your `<select>` from server-side ad use data-attributes for every option you have, then Angular Selector performs for you the conversion to a simple array of objects.
* **Keyboard support**<br>
  Move up and down the dropdown list using keyboard arrows. Select highlighted item pressing Enter.
* **Responsive**<br>
  Perfect for use in mobile environments.

### Dependencies

* Just [AngularJS](https://angularjs.org/)!

### Installation

Load stylesheet and scripts into your app:

```html
<link href="angular-selector/dist/angular-selector.css" rel="stylesheet">
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.3/angular.min.js"></script>
<script src="angular-selector/dist/angular-selector.js"></script>
```

Add the dependency to your module:
```javascript
var app = angular.module('MyApp', ['selector']);
```

### Examples

Look at [these](http://indrimuska.github.io/angular-selector/).

### Options

Parameter | Type | Default | Description
---|---|---|---
model | `Property` | | Two-way binding property that models the `select` view.
multi | `Boolean` | `false` | Allows to select more than one value. Note the name is `multi` not `multiple` to avoid collisions with the HTML5 multiple attribute.
placeholder | `String` | | Optional placeholder text to display if input is empty.
options | `Array` | `[]` | Set of options to display.<br><br>If you don't use a custom template (`viewItemTemplate` and `dropdownItemTemplate`) and you don't change the default values of `valueAttr` and `labelAttr`, each option in this array must contain a `label` key and a `value` key.
valueAttr | `String` | `"value"` | Name of the value key in options array.
labelAttr | `String` | `"label"` | Name of the label key in options array.
rtl | `Boolean` | `false` | 2-way bindable attribute to set a Right-To-Left text direction.
api | `Object` | `{}` | This object is equipped with the methods for interacting with the selector.
remote | `Object` | <pre>{<br>  method: 'GET',<br>  cache: true,<br>  params: {}<br>}</pre> | Configuration object to pass to the native `$http` service ([docs](https://docs.angularjs.org/api/ng/service/$http#usage)).
remoteParam | `String` | `"q"` | Name of the query key in the remote parameter object. You should use this parameter to perform server-side filtering.
viewItemTemplate | `String` | `"selector/selector.html"` | Template URL of selected items(s).
dropdownItemTemplate | `String` | `"selector/selector.html"` | Template URL of each item in the dropdown list.

### Contributions

For personal support requests, please use [Gitter](https://gitter.im/indrimuska/angular-selector), otherwise create first a live example (with [Plunker](http://plnkr.co/)) then describe your problem using [GitHub issue tracker](https://github.com/indrimuska/angular-selector/issues/new).

### License

Copyright (c) 2015 Indri Muska. Licensed under the MIT license.
