/**
 * Created by wuxiangan on 2017/3/16.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'text!html/user.html',
    'contribution-calendar'
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
                // 粉丝
                $scope.fansList = data.fansObj.userList;
                $scope.fansCount = data.fansObj.total;
                // 关注的用户
                $scope.followUserList = data.followObj.followUserObj.userList;
                $scope.followUserTotal = data.followObj.followUserObj.total;
                // 关注的站点
                $scope.followSiteList = data.followObj.followSiteObj.favoriteList;
                $scope.followSiteTotal = data.followObj.followSiteObj.total;
                // 用户动态
                $scope.trendsList = data.trendsObj.trendsList;
                $scope.trendsCount = data.trendsObj.total;
                $scope.active = data.activeObj;
                if(data.activeObj){
                    data.activeObj.before="calendarSibling";//插入在某个子元素的前面，默认在子元素的尾部，
                    contributionCalendar("contributeCalendar",data.activeObj);
                }else{
                    contributionCalendar("contributeCalendar",{before:"calendarSibling"});
                }
            });
        }

        $scope.favoriteUser = function () {
            if (!Account.isAuthenticated() || !$scope.user || $scope.user._id == $scope.userinfo._id) {
                return; // 自己不关注自己
            }

            util.post(config.apiUrlPrefix + 'user_fans/upsert', {userId:$scope.userinfo._id, fansUserId:$scope.user._id}, function () {
               console.log("关注成功");
            });
        }
        
        $scope.isShowNavBar = function () {
            if ($scope.user && $scope.userinfo && $scope.user.username == $scope.userinfo.username) {
                return true;
            }
            return false;
        }

        $scope.goUserSite = function (x) {
            util.goUserSite('/' + x.username + '/' + x.name, true);
        }

        $scope.goHelpPage = function () {
            util.go("knowledge");
        }

        $scope.goNewWebsitePage = function () {
            storage.sessionStorageSetItem('userCenterContentType', "newWebsite");
            util.go("userCenter");
        }
        
        $scope.goWebsitePage = function () {
            storage.sessionStorageSetItem('userCenterContentType', "websiteManager");
            util.go("userCenter");
        }
        
        $scope.goEditorPage = function () {
            util.go("wikiEditor");
        }

        $scope.$watch('$viewContentLoaded', function () {
            console.log("------------------init user controller----------------------");
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