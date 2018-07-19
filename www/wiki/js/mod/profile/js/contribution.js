/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-01-19 14:45:16
 */
define([
    'app', 
    'helper/util',
    'text!wikimod/profile/html/contribution.html'
], function (app, util, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("activenessCtrl", ['$scope', '$translate',function ($scope, $translate) {
            var init = function(userinfo){
                var username = $scope.urlObj.username.toLowerCase();;
                if (!username && userinfo && userinfo.username) {
                    username = userinfo.username;
                }
                if (!username) {
                    console.error("用户名不存在");
                    return;
                }

                util.post(config.apiUrlPrefix + 'user/getDetailByName', {username:username}, function (data) {
                    if (!data) {
                        console.error("用户信息不存在");
                        return ;
                    }

                    $scope.active = data.activeObj;
                    var payload = $scope.active || {};
                    payload.languageLocaleIsForGlobalUser = config.languageLocaleIsForGlobalUser;
                    contributionCalendar("contributeCalendar", payload);
                });
            }
            $scope.$watch('$viewContentLoaded', function () {
                //console.log("------------------init user controller----------------------");
                if ($scope.urlObj.username) {
                    init();
                } else {
                    if (Account.isAuthenticated()) {
                        Account.getUser(init);
                    }
                }
            });
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});