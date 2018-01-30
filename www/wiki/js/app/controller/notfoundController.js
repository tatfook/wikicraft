/**
 * Created by wuxiangan on 2016/12/21.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'text!html/notfound.html'
], function (app, util, storage, htmlContent) {
    app.controller('notfoundController', ['$scope', '$rootScope', 'Account','Message', function ($scope, $rootScope, Account, Message) {
        $scope.showNewPageBtn = false;

        $scope.goBack = function () {
            history.back(-1);
        };

        $scope.newPage = function () {
            storage.sessionStorageSetItem("urlObj", util.parseUrl());
            // console.log(storage.sessionStorageGetItem("urlObj"));
            util.go("wikieditor");
        };

        function init() {
            if (Account.isAuthenticated()){
                var memberName = $scope.user.username;
                $scope.siteinfo = $rootScope.urlObj;
                var sitename = $rootScope.urlObj.sitename;
                var username = $rootScope.urlObj.username;

                if (memberName == username){//访问自己网站不存在的页面，且该网站存在，显示创建页面按钮
                    util.http('POST', config.apiUrlPrefix + 'website/getByName', {username: username, sitename: sitename}, function (data) {
                        if (data) {
                            $scope.showNewPageBtn = true;
                        }
                    });
                }else{ //访问他人网站且网站存在，有编辑权限，显示创建页面按钮
                    util.post(config.apiUrlPrefix + "site_user/getSiteByName", {
                        memberName: memberName,
                        username: username,
                        sitename: sitename
                    }, function(data){
                        // console.log(data);
                        $scope.showNewPageBtn = true;
                    }, function (err) {
                        // console.log(err);
                    });
                }
            }
        }
        $scope.$watch('$viewContentLoaded', init);
    }]);

    return htmlContent;
});
