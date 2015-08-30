(function (angular) {
	
	// Key codes
	var KEYS = { up: 38, down: 40, left: 37, right: 39, escape: 27, enter: 13, backspace: 8, delete: 46, shift: 16, leftCmd: 91, rightCmd: 93, ctrl: 17, alt: 18, tab: 9 };
	
	var Selector = (function () {
		
		function getStyles(element) {
			return !(element instanceof HTMLElement) ? {} :
				element.ownerDocument && element.ownerDocument.defaultView.opener
					? element.ownerDocument.defaultView.getComputedStyle(element)
					: window.getComputedStyle(element);
		}
		
		// Selector directive
		function Selector(filter, timeout, window, http, q) {
			this.restrict   = 'EA';
			this.replace    = true;
			this.transclude = true;
			this.scope      = {
				value:                '=model',
				multiple:             '=?multi',
				placeholder:          '@?',
				valueAttr:            '@',
				labelAttr:            '@?',
				options:              '=?',
				rtl:                  '=?',
				api:                  '=?',
				remote:               '=?',
				remoteParam:          '@?',
				viewItemTemplate:     '=?',
				dropdownItemTemplate: '=?'
			};
			this.templateUrl = 'selector/selector.html';
			$filter  = filter;
			$timeout = timeout;
			$window  = window;
			$http    = http;
			$q       = q;
		}
		Selector.prototype.$inject = ['$filter', '$timeout', '$window', '$http', '$q'];
		Selector.prototype.link = function (scope, element, attrs, controller, transclude) {
			transclude(scope, function (clone, scope) {
				var input        = angular.element(element[0].querySelector('.selector-input input')),
					dropdown     = angular.element(element[0].querySelector('.selector-dropdown')),
					initDeferred = $q.defer(),
					defaults     = {
						api:                  {},
						selector:             [],
						selected:             0,
						showPlaceholder:      true,
						valueAttr:            'value',
						labelAttr:            'label',
						options:              [],
						remoteParam:          'q',
						viewItemTemplate:     'selector/item-default.html',
						dropdownItemTemplate: 'selector/item-default.html'
					};
				
				// Default attributes
				if (!angular.isDefined(scope.value))
					scope.value = scope.multiple ? [] : '';
				angular.forEach(defaults, function (value, key) {
					if (!angular.isDefined(scope[key])) scope[key] = value;
				});
				angular.forEach(['valueAttr', 'labelAttr'], function (attr) {
					if (!attrs[attr]) attrs[attr] = scope[attr];
				});
				
				// Remote fetching
				scope.fetch = function () {
					var settings = { method: 'GET', cache: true, params: {} };
					if (!angular.isDefined(scope.remote) || !angular.isObject(scope.remote))
						throw 'Remote attribute is not an object';
					angular.extend(settings, scope.remote);
					angular.extend(settings.params, scope.remote.params);
					settings.params[scope.remoteParam] = scope.search || '';
					scope.loading = true;
					scope.options = [];
					$http(settings)
						.then(function (data) {
							scope.options = data.data;
							scope.filterSelected();
							scope.loading = false;
							initDeferred.resolve();
						}, function () {
							scope.loading = false;
							initDeferred.reject();
							throw 'Error while fetching data';
						});
				};
				if (!angular.isDefined(scope.remote) || !angular.isObject(scope.remote)) {
					scope.remote = false;
					initDeferred.resolve();
				}
				if (scope.remote)
					scope.$watch('search', scope.fetch);
				
				// Fill with options in the select
				scope.fillWithHtml = function () {
					var hasValue = scope.hasValue();
					scope.options = [];
					angular.forEach(clone, function (option) {
						var object  = {},
							element = angular.element(option),
							tagName = (option.tagName || '').toLowerCase();
						
						if (tagName != 'option') return;
						
						angular.forEach(option.dataset, function (value, key) {
							if (!key.match(/^\$/)) object[key] = value;
						});
						if (option.value)
							object[scope.valueAttr] = option.value;
						if (element.text())
							object[scope.labelAttr] = element.text();
						scope.options.push(object);
						
						if (!hasValue && element.attr('selected') && (scope.multiple || !scope.value))
							if (!scope.multiple) {
								if (!scope.value) scope.value = object[scope.valueAttr];
							} else {
								if (!scope.value) scope.value = [];
								scope.value.push(object[scope.valueAttr]);
							}
					});
					scope.updateSelector();
				}
				
				// Initialization
				scope.hasValue = function () {
					return !scope.multiple ? scope.value : (scope.value || []).length > 0;
				};
				scope.initialize = function () {
					if (!scope.remote && (!angular.isArray(scope.options) || !scope.options.length))
						scope.fillWithHtml();
					if (scope.hasValue()) {
						if (!scope.multiple) {
							if (angular.isArray(scope.value)) scope.value = scope.value[0];
						} else {
							if (!angular.isArray(scope.value)) scope.value = [scope.value];
						}
						scope.updateSelector();
						scope.filterSelected();
						scope.updateValue();
					}
				};
				scope.$watch('multiple', function () {
					$timeout(scope.setInputWidth);
					initDeferred.promise.then(scope.initialize, scope.initialize);
				});
				
				// Dropdown utilities
				scope.dropdownPosition = function () {
					var label       = input.parent()[0],
						styles      = getStyles(label),
						marginTop   = parseFloat(styles.marginTop || 0),
						marginLeft  = parseFloat(styles.marginLeft || 0),
						marginRight = parseFloat(styles.marginRight || 0);
					
					dropdown.css({
						top:   (label.offsetTop + label.offsetHeight + marginTop) + 'px',
						left:  (label.offsetLeft + marginLeft) + 'px',
						width: label.offsetWidth + 'px'
					});
				};
				scope.open = function () {
					scope.isOpen = true;
					scope.dropdownPosition();
				};
				scope.close = function () {
					scope.isOpen = false;
					scope.resetInput();
				};
				scope.decrementSelected = function () {
					scope.select(scope.selected - 1);
				};
				scope.incrementSelected = function () {
					scope.select(scope.selected + 1);
				};
				scope.select = function (index) {
					if (scope.filteredOptions.length)
						scope.selected = (scope.filteredOptions.length + index) % scope.filteredOptions.length;
				};
				scope.$watch('selected', function (actual, previous) {
					var dp           = dropdown[0],
						option       = dropdown.find('li')[scope.selected],
						styles       = getStyles(option),
						marginTop    = parseFloat(styles.marginTop || 0),
						marginBottom = parseFloat(styles.marginBottom || 0);
					
					if (actual == previous || !scope.filteredOptions.length) return;
					
					if (option.offsetTop + option.offsetHeight + marginBottom > dp.scrollTop + dp.offsetHeight)
						$timeout(function () {
							dp.scrollTop = option.offsetTop + option.offsetHeight + marginBottom - dp.offsetHeight;
						});
					
					if (option.offsetTop - marginTop < dp.scrollTop)
						$timeout(function () {
							dp.scrollTop = option.offsetTop - marginTop;
						});
				});
				scope.set = function (option) {
					if (!angular.isDefined(option))
						option = scope.filteredOptions[scope.selected];
					
					if (!scope.multiple) scope.selector = [option];
					else {
						if (scope.selector.indexOf(option) < 0)
							scope.selector.push(option);
					}
					if (!scope.multiple) scope.close();
					scope.resetInput();
				};
				scope.unset = function (index) {
					if (!scope.multiple) scope.selector = [];
					else scope.selector.splice(angular.isDefined(index) ? index : scope.selector.length - 1, 1);
					scope.resetInput();
				};
				scope.keydown = function (e) {
					switch (e.keyCode) {
						case KEYS.up:
							if (!scope.isOpen) break;
							scope.decrementSelected();
							e.preventDefault();
							break;
						case KEYS.down:
							if (!scope.isOpen) scope.open();
							else scope.incrementSelected();
							e.preventDefault();
							break;
						case KEYS.escape:
							scope.select(0);
							scope.close();
							break;
						case KEYS.enter:
							if (scope.isOpen) {
								if (scope.filteredOptions.length)
									scope.set();
								e.preventDefault();
							}
							break;
						case KEYS.backspace:
							if (!input.val()) {
								scope.unset();
								scope.open();
							}
							break;
						case KEYS.left:
						case KEYS.right:
						case KEYS.shift:
						case KEYS.ctrl:
						case KEYS.alt:
						case KEYS.tab:
						case KEYS.leftCmd:
						case KEYS.rightCmd:
							break;
						default:
							if (!scope.multiple && scope.hasValue()) {
								e.preventDefault();
							} else {
								scope.open();
								scope.select(0);
							}
							break;
					}
				};
				
				// Filtered options
				scope.inOptions = function (options, value) {
					// if options are fetched from a remote source, it's not possibile to use
					// the simplest check with native `indexOf` function, beacause every object
					// in the results array has it own new address
					if (scope.remote)
						return options.filter(function (option) { return angular.equals(value, option); }).length > 0;
					else
						return options.indexOf(value) >= 0;
				};
				scope.filterSelected = function () {
					scope.filteredOptions = $filter('filter')(scope.options || [], scope.search);
					if (scope.multiple)
						scope.filteredOptions = scope.filteredOptions.filter(function (option) {
							var selector = angular.isArray(scope.selector) ? scope.selector : [scope.selector];
							return !scope.inOptions(selector, option);
						});
					if (scope.selected >= scope.filteredOptions.length)
						scope.select(scope.filteredOptions.length - 1);
				};
				
				// Input width utilities
				scope.measureWidth = function () {
					var width,
						styles = getStyles(input[0]),
						shadow = angular.element('<span class="selector-shadow"></span>');
					shadow.text(input.val() || (scope.showPlaceholder ? scope.placeholder : '') || '');
					input.parent().append(shadow);
					angular.forEach(['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'textTransform', 'wordSpacing', 'textIndent'], function (style) {
						shadow.css(style, styles[style]);
					});
					width = shadow[0].offsetWidth;
					shadow.remove();
					return width;
				};
				scope.setInputWidth = function () {
					var width = scope.measureWidth() + 1;
					input.css('width', width + 'px');
				};
				scope.resetInput = function () {
					input.val('');
					scope.search = '';
					scope.setInputWidth();
				};
				
				scope.$watch('[search, options, value]', function () {
					scope.setInputWidth();
					// Remove selected items
					scope.filterSelected();
					// Repositionate dropdown
					if (scope.isOpen) $timeout(scope.dropdownPosition);
				}, true);
				
				// Update value
				scope.updateValue = function (origin) {
					if (!angular.isDefined(origin)) origin = scope.selector;
					if (!scope.multiple) scope.value = (origin[0] || {})[scope.valueAttr];
					else scope.value = (origin || []).map(function (option) { return option[scope.valueAttr]; });
				};
				scope.$watch('selector', function (newValue, oldValue) {
					if (angular.equals(newValue, oldValue)) return;
					scope.updateValue();
				}, true);
				scope.$watch('options', function (newValue, oldValue) {
					if (angular.equals(newValue, oldValue) || scope.remote) return;
					scope.updateSelector();
				});
				
				// Update selector
				scope.updateSelector = function () {
					if (!scope.multiple) scope.selector = (scope.options || []).filter(function (option) { return option[scope.valueAttr] == scope.value; }).slice(0, 1);
					else
						scope.selector = (scope.value || []).map(function (value) {
							return $filter('filter')(scope.options, function (option) {
								return option[scope.valueAttr] == value;
							})[0];
						}).filter(function (value) { return angular.isDefined(value); });
				};
				scope.$watch('value', function (newValue, oldValue) {
					scope.showPlaceholder = angular.isArray(newValue) ? !newValue.length : !newValue;
					if (angular.equals(newValue, oldValue) || scope.remote) return;
					scope.updateSelector();
				}, true);
				
				// DOM event listeners
				input
					.on('focus', function () {
						$timeout(function () {
							scope.$apply(scope.open);
						});
					})
					.on('blur', function () {
						scope.$apply(scope.close);
					})
					.on('keydown', function (e) {
						scope.$apply(function () {
							scope.keydown(e);
						});
					})
					.on('input', function () {
						scope.setInputWidth();
					});
				dropdown
					.on('mousedown', function (e) {
						e.preventDefault();
					});
				angular.element($window)
					.on('resize', function () {
						scope.dropdownPosition();
					});
				
				// Expose APIs
				angular.forEach(['open', 'close', 'fetch'], function (api) {
					scope.api[api] = scope[api];
				});
				scope.api.focus = function () {
					input[0].focus();
				};
				scope.api.set = function (value) {
					var search = (scope.filteredOptions || []).filter(function (option) { return option[scope.valueAttr] == value; });
					
					angular.forEach(search, function (option) {
						scope.set(option);
					});
				};
				scope.api.unset = function (value) {
					var values  = !value ? scope.selector : (scope.selector || []).filter(function (option) { return option[scope.valueAttr] == value; });
						indexes =
							scope.selector.map(function (option, index) {
								return scope.inOptions(values, option) ? index : -1;
							}).filter(function (index) { return index >= 0; });
					
					angular.forEach(indexes, function (index, i) {
						scope.unset(index - i);
					});
				};
			});
		};
		
		return Selector;
	})();
	
	angular
		.module('selector', [])
		.run(['$templateCache', function ($templateCache) {
			$templateCache.put('selector/selector.html',
				'<div class="selector" ng-attr-dir="{{rtl ? \'rtl\' : \'ltr\'}}" ' +
					'ng-class="{open: isOpen, empty: !filteredOptions.length, multiple: multiple, \'has-value\': hasValue(), rtl: rtl, loading: loading}">' +
					'<label class="selector-input">' +
						'<ul class="selector-values">' +
							'<li ng-repeat="(index, option) in selector track by index">' +
								'<div ng-include="viewItemTemplate"></div>' +
								'<div ng-if="multiple" class="selector-helper" ng-click="unset(index)">' +
									'<span class="selector-icon"></span>' +
								'</div>' +
							'</li>' +
						'</ul>' +
						'<input class="selector" ng-model="search" placeholder="{{showPlaceholder ? placeholder : \'\'}}">' +
						'<div ng-if="!multiple || loading" class="selector-helper selector-global-helper" ng-click="unset()">' +
							'<span class="selector-icon"></span>' +
						'</div>' +
					'</label>' +
					'<ul class="selector-dropdown" ng-show="filteredOptions.length > 0">' +
						'<li ng-repeat="(index, option) in filteredOptions track by index" ng-class="{active: selected == index}" ng-include="dropdownItemTemplate" ' +
							'ng-mouseover="select(index)" ng-click="set()"></li>' +
					'</ul>' +
				'</div>'
			);
			$templateCache.put('selector/item-default.html', '<span ng-bind="option[labelAttr]"></span>');
		}])
		.directive('selector', ['$filter', '$timeout', '$window', '$http', '$q', function ($filter, $timeout, $window, $http, $q) {
			return new Selector($filter, $timeout, $window, $http, $q);
		}]);
	
})(window.angular);