/**
 * Created by wuxiangan on 2016/12/20.
 */
define([
	'app',
	'angular',
	'renderer/page',
	'renderer/mdconf'
], function (
	app,
	angular,
	page,
	mdconf
) {
    app.directive('previewHtml', ['$compile', function ($compile) {
			return function(scope, element, attrs) {
				let item = angular.copy(scope.item);

				item.params.design.id = item.styleName;

				let mdParams = mdconf.jsonToMd(item.params);
				let template = "```@" + item.cmdName + mdParams + "\n```";
				let md       = page({use_template : true, mode : 'preview'});
				
				let previewHtml = md.render(template, undefined, false);

				previewHtml = $compile(previewHtml)(scope)[0];

				element.context.appendChild(previewHtml)
				

				// scope.$watch(function($scope){
				// 	return $scope.$eval(attrs.previewHtml);
				// }, function(block){

				// 	block = angular.copy(block);
				// 	block.params.design.id = block.styleName;

				// 	let mdParams = mdconf.jsonToMd(block.params);
				// 	let template = "```@" + block.cmdName + mdParams + "\n```";
				// 	let md       = page({use_template : true, mode : 'preview'});

				// 	let previewHtml = md.render(template, undefined, false);

				// 	// console.log(template);
				// 	$compile(previewHtml)(scope)
				// 	// let testEle = $compile(previewHtml)(scope);
				// 	// console.log(testEle);
				// 	// element.context.appendChild(testEle[0]);
				// 	// element.html(previewHtml);

				// 	// console.log(previewHtml);
				// 	// console.log(element.contents());

					
				// 	element.html(previewHtml);

				// 	// $compile(element.contents())(scope);
				// });
			}
    }]);
});
