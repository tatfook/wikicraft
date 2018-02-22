
define([
	'app',
	"helper/md/mdconf",
	"text!html/directive/wikiBlockContainer.html",
	'directive/wikiBlock',
], function(app, mdconf, wikiBlockContainerHtml){
    function getMd(mdName) {
		return app.objects.mds[mdName];
    }

    function extendBlock($scope, mdName, index) {
		var md    = getMd(mdName);
		var block = undefined;

		if (!md) {
			return;
		}

		if (index == undefined) {
			block = md.template;
		} else {
			block = md.template.blockList[index];
		}

		if(!block) {
            return;
		}
		
		$scope.$kp_block = block;
		
		return block;
    }

	// 定义模块编辑器
	app.directive("wikiBlockContainer", ["$compile", function($compile){
		return {
			restrict:'E',
			//scope: true,
			//template: '<div><wiki-block data-params="$kp_block"></wiki-block></div>',
			template: wikiBlockContainerHtml,
			controller:['$scope', '$attrs', '$element', function($scope, $attrs, $element) {
				var index      = $scope.$eval("$index");
				var mdName     = decodeURI($attrs.params);
				var isTemplate = $attrs.template;
				var $rootScope = app.ng_objects.$rootScope;
				var block      = extendBlock($scope, mdName, index);
				var md         = getMd(mdName);
				
				if (block) {
					block.$element = $element; // 双向滚动时会用到
				}

				if (!block || !md || md.mode != "editor") {
					return;
				}

				$element.addClass("mod-container");
				$scope.insertMod     = $rootScope.insertMod;
				$scope.isShowAddIcon = true;

				$scope.clickContainer = function($event) {
					if ($event) {
						$event.stopPropagation();
					}
					if (!block.isWikiBlock) {
						return;
					}

					var moduleEditorParams = config.shareMap.moduleEditorParams;
					
					if (!moduleEditorParams) {
						return;
					}
					
					if (block.isWikiBlock && !block.isTemplate) {
						$(".mod-container.active").removeClass("active");
						$element.addClass("active");
					}

					moduleEditorParams.setBlock(block);
					//$rootScope.$broadcast("moduleEditor", block);
				}
			}],
		}
	}]);
});
