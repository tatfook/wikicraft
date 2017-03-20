/**
 * Created by wuxiangan on 2017/1/11.
 */

define([
    'app',
    'helper/util'
], function (app, util) {
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
        class:'container-fluid',
        style:{"background-color": "silver"},
        frameHeaderExist:true,
        frameFooterExist: false,
    };

    function registerController(wikiBlock) {
        app.registerController("gridTemplateController", function ($rootScope, $scope, $rootScope) {
            $scope.modParams = wikiBlock.modParams;
            $rootScope.frameHeaderExist = wikiBlock.modParams.frameHeaderExist;
            $rootScope.frameFooterExist = wikiBlock.modParams.frameFooterExist;

            //$scope.urlPrefix = '/' + $rootScope.siteinfo.username + '/' + $rootScope.siteinfo.name + '/';
            $scope.urlPrefix = '/test/';
            $scope.clickSelfPage = function (pageId) {
                console.log("------------", pageId);
            }
        });
    }

    return {
        render: function (wikiBlock) {
            console.log(wikiBlock.modParams);
            //console.log(wikiBlock.modParams.substring(60));
            //console.log(angular.fromJson(wikiBlock.modParams));
            wikiBlock.modParams = wikiBlock.modParams ? Object.assign(defaultModParams, wikiBlock.modParams) : defaultModParams;
            registerController(wikiBlock);
            var content = wikiBlock.content, htmlContent = '', modParams = wikiBlock.modParams;
            //console.log(wikiBlock);
            //modParams.class = modParams.class || "row";
            htmlContent += '<div ng-controller="gridTemplateController" ng-class="modParams.class" ng-style="modParams.style">';
            if (modParams.isMainContent) {
                htmlContent+=content;
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
                        } else if (col.content) {
                            htmlContent += '<div ng-class="'+ _class + '" ng-style="'+style+'">' + col.content + "</div>";
                        } else if (col.contentUrl){
                            htmlContent += '<div ng-class="'+ _class + '" ng-style="'+style+'">' +  '<userpage url="'+ col.contentUrl + '"></userpage>' + "</div>";
                        }else {
                            var selfPageId = "selfPage_" + i + '_' + j;
                            htmlContent += '<div ng-class="'+ _class + '" ng-style="' + style +'">' + '<div ng-click="clickSelfPage(\''+selfPageId +'\')" id="'+
                                selfPageId+'"><div>+Editor</div><userpage url="{{urlPrefix + \'_sidebar\'}}"></userpage></div>' +'</div>';
                        }
                    }
                    //htmlContent += '</div>';
                } else {
                    if (row.content) {
                        htmlContent += row.content;
                    } else if (row.contentUrl) {
                        htmlContent += '<userpage url="'+ row.contentUrl + '"></userpage>';
                    }
                }
                htmlContent += '</div>'
            }
            htmlContent += '</div>';
            console.log(htmlContent);
            return htmlContent;
        }
    }
});