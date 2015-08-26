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
				$element.html($scope.example.html);
				$compile($element.contents())($scope);
				eval($scope.example.js);
			}
		};
	}])