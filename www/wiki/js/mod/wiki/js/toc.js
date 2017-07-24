define([
		'app',
		'helper/util',
		'text!wikimod/wiki/html/toc.html',
], function(app, util, htmlContent){
	// 使用闭包使模块重复独立使用
	function registerController(wikiblock) {
		// 比赛类活动奖励控制器
		app.registerController("tocController", ['$scope', '$rootScope', function ($scope, $rootScope) {
			$scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
			$scope.containerId = wikiblock.containerId + "_toc";

			var modParams = angular.copy(wikiblock.modParams || {});
			var pageinfo = config.services.$rootScope.pageinfo;

			var startLevel = modParams.startLevel || 1;
			var endLevel = modParams.endLevel || 6;
			var startLine = modParams.startLine || 0;
			var endLine = modParams.endLine || 10000000;
            var tocTreeList, tocList;

			$scope.goPart = function (containerId) {
				document.getElementById(containerId).scrollIntoView();
				active(containerId);
            };

			function active(containerId) {
				$(".js-nav .active").removeClass("active");
				var targetSelect='[data-targetid="'+containerId+'"]';
				$(targetSelect).addClass("active");
            }

            function getOffsetTop(containerId) {
				return $("#"+containerId)[0].offsetTop;
            }

			function addTocItem(tocTreeList, tocList, block) {
				var tag = block.tag;
				var text = block.content.replace(/[\s#]/g,'');
				var hn = parseInt(tag[1]);
				var containerId = block.blockCache.containerId;
				var offsetTop = getOffsetTop(containerId);

				//console.log(tag, text, hn);
				if (hn < startLevel || hn > endLevel) {
					return;
				}

				// 标题h中过滤图片
				text = text.replace(/!\[[^\]]*]\((https|http):\/\/[^\)]*\.(png|jpg)(.*)\)/,"");

                tocTreeList = tocTreeList || [];
                tocList = tocList || [];
				var childs = tocTreeList;
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

				var tocObject = {
                    tag:tag,
                    text:text,
                    containerId:containerId,
					offsetTop: offsetTop,
                    childs:[],
                };
				childs.push(tocObject);
				tocList.push(tocObject);

				return tocTreeList;
			}

			function generateToc(){
				var blockList = [];
				tocTreeList = [];
				tocList = [];

				if (config.shareMap["mdwiki"] && config.shareMap["mdwiki"]["blockList"]) {
					var mdwiki = config.shareMap["mdwiki"];
                    var containerId = mdwiki.getMdWikiContentContainerId();
					blockList = mdwiki["blockList"];

					var scrollElement = $("#"+containerId);
                    setFullHeight(scrollElement);
                    scrollElement.on("scroll", function () {
                        scrollProccess(scrollElement);
                    });
				}
				for (var i = 0; i < blockList.length; i++) {
					var block = blockList[i];

					if (block.textPosition.from < startLine || block.textPosition.from > endLine) {
						continue;
					}

					if (block.tag[0] != "h" && block.tag[0] != "H") {
						continue;
					}

					addTocItem(tocTreeList, tocList, block);
				}
				//console.log(tocList);
                $scope.tocTreeList = tocTreeList;
			}

			var setFullHeight = function (scrollElement){
                var winH = $(window).height();
                var footerH = $rootScope.frameFooterExist ? 100 : 0;
                var headerH = $rootScope.frameHeaderExist ? 52 : 0;

                var fixedH = winH - footerH - headerH;
                scrollElement.css({
                	"height": fixedH,
					"overflow-y": "auto"
				});
                // setFullHeight.height(fixedH);
            };

			var scrollProccess = function (scrollElement) {
                scrollTimer && clearTimeout(scrollTimer);
                var scrollTimer = setTimeout(function () {
                    var scrollTop = scrollElement[0].scrollTop;
                    var nodeLen = tocList.length;
                    for (var i = 0; i< nodeLen; i++){
                        if (scrollTop <= tocList[i].offsetTop){
                            active(tocList[i].containerId);
                            break;
                        }
                    }
                }, 100);
            };

			function init() {
				generateToc();
				setFullHeight($(".js-nav"));
				//console.log($("#" + $scope.containerId));
				//setInterval(generateToc, 60000);
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
