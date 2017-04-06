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
                $scope.fansList = data.fansObj.userList;
                $scope.fansCount = data.fansObj.total;
                $scope.trendsCount = data.trendsObj.total;
                $scope.trendsList = data.trendsObj.trendsList;
            });
            //调用
            var options={
                year: "2016",//展示的年份，可不传，默认为今年
                dateCount: {//日期的活动次数，不传的默认次数是1
                    "2016-1-1": 1,
                    "2016-2-1": 2,
                    "2016-3-1": 3,
                    "2016-4-1": 4,
                    "2016-5-1": 5,
                    "2016-6-1": 6,
                    "2016-7-1": 5,
                    "2016-8-1": 4,
                    "2016-9-1": 3,
                    "2016-10-1": 2,
                    "2016-11-1": 1,
                    "2016-12-1": 0,
                },
                before:"calendarSibling"//插入在某个子元素的前面，默认在子元素的尾部，
            };
            contributionCalendar("contributeCalendar",options);
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