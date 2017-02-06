/**
 * Created by wuxiangan on 2017/1/6.
 */

define(['helper/util'], function (util) {
    return function ($scope, $rootScope, Account) {
        
    };

    /*
    var defaultModParams = {
        rows:[
            {
                class:'row',
                style:{},
                content:'header',
            },
            {
                class:'row',
                style:{},
                cols:[
                    {
                        //class:"col-xs-2",
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
        content:'test',
        contentUrl:'',
        isMainContent: false,
        class:'container',
        style:{"background-color": "silver"},
        frameHeaderExist:true,
        frameFooterExist: false,
    };
    return function ($scope, $rootScope) {
        var content = "hello world";
        $scope.path = '/templates/test';
        $scope.modParams = defaultModParams;
        $rootScope.frameHeaderExist = defaultModParams.frameHeaderExist;
        $rootScope.frameFooterExist = defaultModParams.frameFooterExist;
        var htmlContent = '';
        // 最外层

        //defaultModParams.class = defaultModParams.class || "row";
        htmlContent += '<div ng-class="modParams.class" ng-style="modParams.style">';
        if (defaultModParams.isMainContent) {
            htmlContent+=content;
        }

        for (var i = 0; defaultModParams.rows && i < defaultModParams.rows.length; i++) {
            var row = defaultModParams.rows[i];
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
        util.html('#userpage', htmlContent, $scope);
    }
    */
});

