/**
 * Created by wuxiangan on 2016/12/15.
 */

define(['app', 'helper/util'], function (app, util) {
    // 动态加载
    return ['$scope', '$rootScope', '$state', '$auth', 'Account', function ($scope, $rootScope, $state, $auth, Account) {
        $scope.siteParams = {page: 1, pageSize: 3};
        $scope.userParams = {page: 1, pageSize: 3};
        $scope.userObj = {};
        $scope.siteObj = {};

        $scope.getRandomColor = function (index) {
            return util.getRandomColor(index);
        }

        // 更多我的收藏
        $scope.goAllWorksList = function () {
            var siteshowObj = {};
            siteshowObj.requestUrl = config.apiUrlPrefix + "website/getFavoriteSortList";
            siteshowObj.requestParams = $scope.siteParams;
            siteshowObj.title = "作品长廊"
            sessionStorage.setItem("siteshow", util.objectToJsonString(siteshowObj));
            $state.go("siteshow");
        }

        // 更多我的收藏
        $scope.goAllUserList = function () {
            var usershowObj = {};
            usershowObj.requestUrl = config.apiUrlPrefix + "user/getFavoriteSortList";
            usershowObj.requestParams = $scope.userParams;
            usershowObj.title = "名人堂";
            sessionStorage.setItem("usershow", util.objectToJsonString(usershowObj));
            $state.go("usershow");
        }

        $scope.getWorksList = function (page) {
            $scope.siteParams.page = page ? (page > 0 ? page : 1) : $scope.siteParams.page;

            if ($scope.siteObj.pageCount && $scope.siteParams.page > $scope.siteObj.pageCount) {
                $scope.siteParams.page = $scope.siteObj.pageCount
            }
            var url = $scope.siteParams.url || config.apiUrlPrefix + "website/getFavoriteSortList"; // 获得最近更新

            util.http("POST", url, $scope.siteParams, function (data) {
                $scope.siteObj = data;
            });
        }

        $scope.getUserList = function (page) {
            $scope.userParams.page = page ? (page > 0 ? page : 1) : $scope.userParams.page;

            if ($scope.userObj.pageCount && $scope.userParams.page > $scope.userObj.pageCount) {
                $scope.userParams.page = $scope.userObj.pageCount
            }

            var url = $scope.userParams.url || config.apiUrlPrefix + "user/getFavoriteSortList"; // 获得最近更新

            util.http("POST", url, $scope.userParams, function (data) {
                $scope.userObj = data;
            });
        }

        function init() {
            // 获得网站统计信息
            util.http("POST", config.apiUrlPrefix + "wikicraft/getStatics", {}, function (data) {
                $scope.wikicraft = data || {}
            });

            $scope.getWorksList();
            $scope.getUserList();
        }

        $scope.register = function () {
            $scope.errMsg = "";
            var params = {
                username: util.stringTrim($scope.username),
                email: util.stringTrim($scope.email),
                cellphone: util.stringTrim($scope.cellphone),
                password: util.stringTrim($scope.password),
            };
            console.log(params);
            if (!params.username || params.username.length == 0 || !params.password || params.password == 0) {
                $scope.errMsg = "用户名，密码为必填字段";
                return;
            }
            if (!params.username.match(/[\d\w_]{3,20}/)) {
                $scope.errMsg = "用户名格式错误，应由3-20数字或字母或下划线组成";
                return;
            }
            if (!params.email) {
                $scope.errMsg = "邮箱格式错误"
                return;
            }
            if (params.password.length < 4 || params.password.length > 20) {
                $scope.errMsg = "密码格式错误"
            }
            util.http("POST", config.apiUrlPrefix + "user/register", params, function (data) {
                console.log("注册成功")
                $auth.setToken(data.token);
                Account.setUser(data.userInfo);
                if (!data.userInfo.githubToken) {
                    Account.githubAuthenticate();
                } else {
                    window.location.href ='/#/home';
                }
            }, function (error) {
                $scope.errMsg = error.message;
            });
        }

        init();
    }];
});
