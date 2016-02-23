angular
	.module('AngularSelectorDemo', ['selector'])
	.controller('AngularSelectorDemoCtrl', ['$http', '$scope', function ($http, $scope) {
		$scope.examples = [];
		
		$http.jsonp('examples.json')
			.then(function (data) {
				$scope.examples = data.data;
			});
	}])
	.filter('highlight', ['$sce', function ($sce) {
		return function (input, lang) {
			return $sce.trustAsHtml(lang && input ? hljs.highlight(lang, input).value : input);
		};
	}])
	.directive('example', ['$compile', function ($compile) {
		return {
			restrict: 'C',
			link: function ($scope, $element) {
				if ($scope.example.service) return;
				$element.html($scope.example.html);
				$compile($element.contents())($scope);
				eval($scope.example.js);
			}
		};
	}])
	.directive('plunker', [function () {
		return {
			restrict: 'A',
			template: (
					'<form method="post" action="http://plnkr.co/edit/?p=preview" target="_blank" class="plunker">' +
						'<button type="submit">' +
							'<img src="https://plnkr.co/img/plunker.png" alt="Plunker">&nbsp; Plunker' +
						'</button>' +
					'</form>'
			),
			link: function ($scope, $element, $attrs) {
				var example  = $scope.example;
					form     = angular.element($element[0].querySelector('form')),
					desc     = angular.element('<input type="hidden" name="description">').val('Angular Selector example: ' + example.title),
					html     = angular.element('<input type="hidden" name="files[index.html]">'),
					css      = angular.element('<input type="hidden" name="files[style.css]">'),
					js       = angular.element('<input type="hidden" name="files[script.js]">'),
					services = '';
				
				// plunker settings
				form.append(angular.element('<input type="hidden" name="private" value="true">'));
				['select', 'angular', 'selector', 'directive', 'typeahead', 'tag'].concat(example.title.toLowerCase().split(' ')).forEach(function (tag, index) {
					var element = angular.element('<input type="hidden" name="tags[' + index + ']">').val(tag);
					form.append(element);
				});
				form.append(desc);
				
				html.val([
					'<!DOCTYPE html>',
					'<html ng-app="myApp" ng-controller="ExampleCtrl as ctrl">',
					'	<head>',
					'		<meta charset="utf-8">',
					'		<meta http-equiv="X-UA-Compatible" content="IE=edge">',
					'		<meta name="viewport" content="width=device-width, initial-scale=1">',
					'		<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">',
					'		<link rel="stylesheet" href="//cdn.rawgit.com/indrimuska/angular-selector/master/dist/angular-selector.css">',
					'		<link rel="stylesheet" href="style.css">',
					'	</head>',
					'	<body>',
					'		<h1 class="page-header">' + example.title + '</h1>',
					'		',
					'		' + example.html.replace(/\n/g, "\n\t\t"),
					'		',
					'		<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.1/angular.js"></script>',
					'		<script src="//cdn.rawgit.com/indrimuska/angular-selector/master/dist/angular-selector.js"></script>',
					'		<script src="script.js"></script>',
					'	</body>',
					'</html>'
				].join("\n"));
				form.append(html);
				
				css.val([
					'body { margin: 30px; }',
					'p { margin-top: 10px; }',
					'dl { margin-top: 15px; }',
					'.btn-group { margin-bottom: 15px; }',
					'.checkbox-inline { font-weight: bold; margin-bottom: 10px; }'
				].join("\n"));
				form.append(css);
				
				services = !example.service ? null : [
					'	.service(\'' + example.service.name + '\', [' +
							(example.service.deps || []).map(function (name) { return '\'' + name + '\''; }).join(', ') +
							((example.service.deps || []).length > 0 ? ', ' : '') +
						'function (' +
							(example.service.deps || []).join(', ') +
						') {',
					'		' + (example.service.js || '').replace(/\n/g, "\n\t\t"),
					'	}])'
				].join("\n");
				
				js.val([
					'angular',
					'	.module(\'myApp\', [\'selector\'])',
					services,
					'	.controller(\'ExampleCtrl\', [\'$scope\', ' +
							(example.service ? '\'' + example.service.name + '\', ' : '') +
						'function ($scope' +
							(example.service ? ', ' + example.service.name : '') +
						') {',
					'		' + (example.js || '').replace(/\n/g, "\n\t\t"),
					'	}]);'
				].filter(function (l) { return l; }).join("\n"));
				form.append(js);
			}
		};
	}]);