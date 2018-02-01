/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: none
 * @Last Modified time: 2018-01-31 14:56:31
 */
define([
    'app',
    'helper/util',
    'helper/markdownwiki',
    'text!wikimod/profile/html/controls.html'
], function (app, util, markdownwiki, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("profileControlCtrl", ['$scope','$rootScope', '$timeout', function ($scope, $rootScope, $timeout) {
            var md = markdownwiki({breaks: true});
            var userDataSource = $rootScope.userDataSource;
            var mdContent = {
                "profile":"",
                "site":"",
                "contact":""
            };
            $scope.showType = "profile";

            var getMdContent = function(type){
                if (mdContent[type] && mdContent[type].length > 0) {
                    return mdContent[type];
                }
                var path = '/'+ userDataSource.keepwrokUsername +'_datas/' + type + ".md";
                userDataSource.getFile({
                    path: path,
                    ref: 'master'
                }, function (data) {
                    var content = data.content || "";
                    mdContent[type] = content;
                    initView(type);
                }, function(err){
                    console.log(err);
                    if (err.status == "404") {
                        console.log("新建页面"+"type");
                    }
                });
            }

            $scope.tabTo = function(type){
                type = (type === "profile" || type === "site" || type === "contact") ? type : "profile";
                initView(type);
                $scope.showType = type;
            };

            var getSubContent = function(type){
                var subMdContent;
                if (type === "site" || type === "contact") {
                    subMdContent = getMdContent(type);
                }else{
                    subMdContent = $rootScope.subMdContent;
                }

                return subMdContent;
            }

            var initView = function(type){
                type = (type === "profile" || type === "site" || type === "contact") ? type : "profile";
                var subContent = getSubContent(type);
                if (subContent && subContent.length > 0) {
                    $timeout(function(){
                        var subHtml = md.render(subContent);
                        util.html("#profileMain", subHtml);
                    }, 0);
                    return;
                }
            }
            $scope.$watch('$viewContentLoaded', initView($scope.showType));
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});