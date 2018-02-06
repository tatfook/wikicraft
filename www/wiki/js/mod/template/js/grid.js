/**
 * Created by wuxiangan on 2017/1/11.
 */

define([
    'app',
    'helper/util',
    'helper/markdownwiki',
    'helper/dataSource',
], function (app, util, markdownwiki, dataSource) {
    var defaultModParams = {
        /*
        rows:[
            {
                style:{},
                content:'header',
            },
            {
                style:{},
                cols:[
                    {
                        class:"col-xs-2",
                        style:{},
                        content:"left",
                    },
                    {
                        class:"col-xs-8",
                        style:{},
                        isMainContent: false,
                        content:'middle',
                        //contentUrl:"/templates/test",
                    },
                    {
                        class:"col-xs-2",
                        style:{},
                        content:"right",
                    },
                ],
            },
            {
                style:{},
                content:'footer',
            }
        ],
        */
        content:'',
        contentUrl:'',
        isMainContent: true,
		isStylePreview: false,
		//class:'container-fluid',
        //style:{"background-color": "silver"},
        //frameHeaderExist: false,
        //frameFooterExist: false,
    };

    function registerController(wikiBlock) {
        app.registerController("gridTemplateController", ['$rootScope', '$scope', function ($rootScope, $scope) {
            $scope.modParams = wikiBlock.modParams;
            //$rootScope.frameHeaderExist = wikiBlock.modParams.frameHeaderExist;
            //$rootScope.frameFooterExist = wikiBlock.modParams.frameFooterExist;
        }]);
    }

	var dataShareMap = {};

    return {
        render: function (wikiBlock) {
            //console.log(wikiBlock.modParams);
            //console.log(wikiBlock.modParams.substring(60));
            //console.log(angular.fromJson(wikiBlock.modParams));
            wikiBlock.modParams = wikiBlock.modParams ? angular.merge(defaultModParams, wikiBlock.modParams) : defaultModParams;
            registerController(wikiBlock);
			
            var content = wikiBlock.content, htmlContent = '', modParams = wikiBlock.modParams;
			var containerId = wikiBlock.containerId + "_";
			var idx = 0;
			var renderAfterCallbackList = [];
			dataShareMap[wikiBlock.containerId] = {
				renderAfterCallbackList:renderAfterCallbackList,
			};
            //console.log(wikiBlock);
            //modParams.class = modParams.class || "row";
            htmlContent += '<div ng-controller="gridTemplateController" ng-class="modParams.class" ng-style="modParams.style">';
            if (modParams.isMainContent) {
                htmlContent+=content;
            }

			var getRenderFunc = function(id, content, contentUrl) {
				return function() {
					if (!content && !contentUrl) {
						return;
					}
					var md = markdownwiki({use_template:false});
					//console.log($("#"+id));
					if (content) {
						util.html("#" + id, md.render(content));
					} else {
						var pageinfo = util.getAngularServices().$rootScope.pageinfo;
						var currentDataSource = dataSource.getDataSource(pageinfo.username,pageinfo.sitename);
						if (contentUrl && currentDataSource){
							currentDataSource.getRawContent({
								path:contentUrl+config.pageSuffixName, 
								isShowLoading:false
							}, function(content){
								content = content || "";
								util.html("#" + id, md.render(content));
							});
						}	
					}
				}
			}
            for (var i = 0; modParams.rows && i < modParams.rows.length; i++) {
                var row = modParams.rows[i];
                //console.log(row);
                var style = "modParams.rows[" + i + "].style";
                var _class ="modParams.rows[" + i + "].class";
                //row.class = row.class || 'col-xs-12';
                htmlContent += '<div ng-class="' + _class  + '" ng-style="' + style +'">';
                if (row.isMainContent) {
                    htmlContent += content;
                } else if (typeof row.cols == "object" && row.cols.length > 0) {
                    //htmlContent += '<div class="row">';
                    for (var j = 0; j < row.cols.length; j++) {
                        var col = row.cols[j];
                        style = "modParams.rows[" + i + "].cols[" + j + "].style";
                        _class = "modParams.rows[" + i + "].cols[" + j + "].class";
                        //col.class = col.class || 'col-xs-1';
                        if (col.isMainContent) {
                            htmlContent += '<div ng-class="'+ _class + '" ng-style="'+style+'">' + content + "</div>";
						} else {
							var id = containerId + idx;
                            htmlContent += '<div ng-class="'+ _class + '" ng-style="'+style+'">' + '<div id="' + id + '"></div>' + "</div>";
							renderAfterCallbackList.push(getRenderFunc(id, col.content, col.contentUrl));
							idx++;
							//if (col.content) {
								//htmlContent += '<div ng-class="'+ _class + '" ng-style="'+style+'">' + col.content + "</div>";
							//} else if (col.contentUrl){
								//htmlContent += '<div ng-class="'+ _class + '" ng-style="'+style+'">' +  '<userpage url="'+ col.contentUrl + '"></userpage>' + "</div>";
							//}else {
							//}
						}
                    }
                    //htmlContent += '</div>';
                } else {
					var id = containerId + idx;
					htmlContent += '<div id="' + id + '"></div>';
					renderAfterCallbackList.push(getRenderFunc(id, row.content, row.contentUrl));
					idx++;
					//if (row.content) {
						//htmlContent += row.content;
					//} else if (row.contentUrl) {
						//htmlContent += '<userpage url="'+ row.contentUrl + '"></userpage>';
					//}
                }
                htmlContent += '</div>'
            }
            htmlContent += '</div>';
            //console.log(htmlContent);
            return htmlContent;
        },

		renderAfter: function(wikiBlock) {
			var renderAfterCallbackList = dataShareMap[wikiBlock.containerId].renderAfterCallbackList || [];
			//console.log(renderAfterCallbackList);
			for (var i = 0; i < renderAfterCallbackList.length; i++){
				var callback = renderAfterCallbackList[i];
				callback();
			}
		}
    }
});
