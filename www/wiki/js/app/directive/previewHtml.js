/**
 * Created by wuxiangan on 2016/12/20.
 */
define([
	'app',
	'renderer/page',
	'renderer/mdconf'
], function (
	app,
	page,
	mdconf
) {
    app.directive('previewHtml', ['$compile', '$rootScope', function ($compile, $rootScope) {
			return function(scope, element, attrs) {
				scope.$watch(function($scope){
					return $scope.$eval(attrs.previewHtml);
				}, function(block){

					block.params.design.id = block.stylesName;

					let mdParams = mdconf.jsonToMd(block.params);
					let template = "```@" + block.cmdName + mdParams + "\n```";
					let md       = page({use_template : true, mode : 'preview'});

					md.render(template, undefined, true, function(previewHtml){
						element.html(previewHtml);

						$compile(element.contents())($rootScope);
					});

					
					// element.html(value);

					// $compile(element.contents())(scope);
				});
			}
    }]);
});
