/**
 * Created by wuxiangan on 2016/12/15.
 */

define(['app', 'helper/util','text!html/home.html'], function (app, util, htmlContent) {
    // 动态加载
    app.registerController('homeController', ['$scope', '$rootScope', '$state', '$auth', 'Account', 'Message', function ($scope, $rootScope, $state, $auth, Account, Message) {
        $scope.siteParams = {page: 1, pageSize: 4};
        $scope.userParams = {page: 1, pageSize: 4};
        $scope.userObj = {};
        $scope.siteObj = {};
        $scope.isLogin = false; // false：注册  true：登录

        $scope.goUserSite = function (site) {
            window.location.href = '/' + site.username + '/' + site.name + '/index';
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
                $scope.wikicraft = data || {};
            });
            
            util.http("POST", config.apiUrlPrefix + 'website/getFavoriteSortList', {page:1, pageSize:4}, function (data) {
                $scope.siteObj = data;
            });

            util.http("POST", config.apiUrlPrefix + 'website/getSiteList', {page:1, pageSize:4, sortBy:'-favoriteCount', filterType:'personal'}, function (data) {
                $scope.personalSiteObj = data;
            });

            //$scope.getWorksList();
            //$scope.getUserList();
        }

        $scope.register = function () {
            $scope.errMsg = "";
            $("#mail-err").addClass("visible-hidden");
            $("#pwd-err").addClass("visible-hidden");
            $("#webname-err").addClass("visible-hidden");
            $("#total-err").addClass("visible-hidden");

            var params = {
                username: util.stringTrim($scope.username),
                email: util.stringTrim($scope.email),
                cellphone: util.stringTrim($scope.cellphone),
                password: util.stringTrim($scope.password),
            };

            if (!params.email) {
                $scope.errMsg = "邮箱格式错误";
                $("#mail-err").removeClass("visible-hidden");
                return;
            }
            if(!params.password || params.password.length == 0){
                $scope.errMsg = "密码为必填字段";
                $("#pwd-err").removeClass("visible-hidden");
                return;
            }
            if (params.password.length < 4 || params.password.length > 20) {
                $scope.errMsg = "密码长度为4-20之间"
                $("#pwd-err").removeClass("visible-hidden");
                return;
            }
            if(!params.username || params.username.length == 0){
                $scope.errMsg = "个人网站名为必填字段";
                $("#webname-err").removeClass("visible-hidden");
                return;
            }
            if (!params.username.match(/[\d\w_]{3,20}/)) {
                $scope.errMsg = "个人网站名格式错误";
                $("#webname-err").removeClass("visible-hidden");
                return;
            }

            util.http("POST", config.apiUrlPrefix + "user/register", params, function (data) {
                console.log("注册成功")
                $auth.setToken(data.token);
                Account.setUser(data.userInfo);
                //window.location.href = '/wiki/website';
                util.go('website');
            }, function (error) {
                $scope.errMsg = error.message;
                console.log($scope.errMsg );
                $("#total-err").removeClass("visible-hidden");
            });
        }

        $scope.worksFavorite=function (event, site) {
            //console.log(event, site);
            if (!Account.isAuthenticated()) {
                Message.info("登录后才能收藏!!!");
                return ;
            }

            if (site.userId == $scope.user._id) {
                Message.info("不能收藏自己作品!!!");
                return ;
            }
            var worksFavoriteRequest = function(isFavorite) {
                var params = {
                    userId: $scope.user._id,
                    favoriteUserId: site.userId,
                    favoriteWebsiteId: site._id,
                }

                var url = config.apiUrlPrefix + 'user_favorite/' + (isFavorite ? 'favoriteSite' : 'unfavoriteSite');
                util.post(url, params, function () {
                    Message.info(isFavorite ? '作品已收藏' : '作品已取消收藏');
                });
            };

            var obj=event.target;
            var loveIcon=$(obj);
            if (obj.outerHTML.indexOf('<span') > 0) {
                loveIcon=$(obj).find(".js-heart");
            }
            if (loveIcon.hasClass("glyphicon-star-empty")) {
                loveIcon.addClass("glyphicon-star");
                loveIcon.removeClass("glyphicon-star-empty");
                worksFavoriteRequest(true);
            }else{
                loveIcon.addClass("glyphicon-star-empty");
                loveIcon.removeClass("glyphicon-star");
                worksFavoriteRequest(false);
            }
        };

        $(document).keyup(function (event) {
            if(event.keyCode=="13"){
                $scope.register();
            }
        });

        init();
    }]);

    return htmlContent;
});
