/**
 * Created by wuxiangan on 2017/1/4.
 */

define([
    'app',
    'helper/util',
    'helper/dataSource',
    'helper/markdownwiki'
], function (app, util, dataSource, markdownwiki) {
	
    function render(wikiBlock) {
		var $scope = wikiBlock.$scope;
		var moduleParams = wikiBlock.modParams || {};
		//console.log(moduleParams);
		$scope.style = {
			'background-color': moduleParams.backgroundColor,
			'width':moduleParams.width,
			"height": moduleParams.height || "100%" ,
			'background-image': moduleParams.backgroundImage,
		};

		$scope.class = moduleParams.class;
		$scope.footerpage = moduleParams.footerpage;

		return '<div ng-class="class" ng-style="style">' + wikiBlock.templateContent + 
			'<wikipage data-content-type="md" data-content-url="footerpage"></wikipage></div>';
    }

    return {
        render: render,
	}
});

/*
```@template/js/default
{
    "class": "container",
    "footerpage":"_bottom"
}
```
*/
