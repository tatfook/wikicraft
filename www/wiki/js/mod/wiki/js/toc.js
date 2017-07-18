define([
		'app',
		'helper/util',
		'text!wikimod/wiki/html/toc.html',
], function(app, util, htmlContent){
	// 使用闭包使模块重复独立使用
	function registerController(wikiblock) {
		// 比赛类活动奖励控制器
		app.registerController("tocController", ['$scope', function ($scope) {
			$scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
			$scope.containerId = wikiblock.containerId + "_toc";

			var modParams = angular.copy(wikiblock.modParams || {});
			var pageinfo = config.services.$rootScope.pageinfo;
			
			var blockList = wikiblock.blockList || [];
			var startLevel = modParams.startLevel || 1;
			var endLevel = modParams.endLevel || 6;
			var startLine = modParams.startLine || 0;
			var endLine = modParams.endLine || blockList[blockList.length-1].textPosition.to;
			var tocList = [];


			function addTocItem(block) {
				var tag = block.tag;
				var text = block.content.replace(/[\s#]/g,'');
				var hn = parseInt(tag[1]);
				var containerId = block.blockCache.containerId;
				
				if (hn < startLevel || hn > endLevel) {
					return;
				}

				if (hn == startLevel) {
					return;
				}
				
				var childs = tocList;
				for (var i = startLevel; i < hn; i++) {
					if (!childs || childs.length == 0) {
						childs.push({
							tag:'h' + i,
							text:"", 
							childs:[],
						});
					}
					childs = childs[childs.length-1].childs;
				}

				childs.push({
					tag:tag,
					text:text,
					containerId:containerId,
					childs:[],
				});
			}

			function generateToc(){
				tocList = [];
				for (var i = 0; i < blockList.length; i++) {
					var block = blockList[i];

					if (block.textPosition.from< startLine || block.textPosition.from > endLine) {
						continue;
					}

					if (block.tag[0] != "h" && block.tag[0] != "H") {
						continue;
					}
					
					addTocItem(block);
				}
				//console.log(wikiblock.blockList);
				//console.log(tocList);
			}

			function init() {
				generateToc();
				console.log(tocList);
				//console.log($("#" + $scope.containerId));
				setInterval(generateToc, 60000);
			}

			$scope.$watch("$viewContentLoaded", init);
		}]);
	}

	return {
		render: function (wikiblock) {
			registerController(wikiblock);
			return htmlContent;
		}
	}
});
