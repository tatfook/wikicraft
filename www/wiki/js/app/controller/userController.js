/**
 * Created by wuxiangan on 2017/3/16.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'text!html/user.html'
], function (app, util, storage, htmlContent) {
    //console.log("load userController file");

    app.registerController('userController', ['$scope','Account', function ($scope, Account) {

        function init(userinfo) {
            var username = $scope.urlObj.username;
            if (!username && userinfo && userinfo.username) {
                username = userinfo.username;
            }
            if (!username) {
                return;
            }
            util.post(config.apiUrlPrefix + 'user/getDetailByName', {username:username}, function (data) {
                if (!data) {
                    return ;
                }
                // 用户信息
                $scope.userinfo = data.userinfo;
                $scope.selfOrganizationList = data.selfOrganizationObj.siteList;
                $scope.joinOrganizationList = data.joinOrganizationObj.siteList;
                $scope.hotSiteList = data.hotSiteObj.siteList;
                $scope.allSiteList = data.allSiteList;
                //$scope.allSiteTotal = data.allSiteObj.total;
                $scope.fansList = data.fansObj.userList;
                $scope.fansCount = data.fansObj.total;
                $scope.trendsCount = data.trendsObj.total;
                $scope.trendsList = data.trendsObj.trendsList;
            });
        }

        $scope.goUserSite = function (x) {
            util.goUserSite('/' + x.username + '/' + x.name, true);
        }

        $scope.$watch('$viewContentLoaded', function () {
            if ($scope.urlObj.username) {
                init();
            } else {
                if (Account.isAuthenticated()) {
                    Account.getUser(init);
                }
            }
        });
    }]);

    return htmlContent;
});