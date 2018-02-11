/**
 * Created by wuxiangan on 2017/3/20.
 */

define([
    'app',
    'text!wikimod/template/html/wiki.html'
], function (app, htmlContent) {
    function registerController(wikiBlock) {
		var $scope = wikiBlock.$scope;
		var modParams = wikiBlock.modParams || {};

		$scope.headerContent = modParams.headerContent;
		$scope.sidebarContent = modParams.sidebarContent;
		$scope.footerContent = modParams.footerContent;

		return htmlContent.replace('TemplateContent', wikiBlock.templateContent);
    }
    return {
        render: render,
});

/*
```@template/js/wiki
{
    "headerContent":"# header",
    "sidebarContent":"# sidebar",
    "footerContent":"# footer"
}
```
*/
