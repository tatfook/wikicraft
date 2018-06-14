/**
 * Created by wuxiangan on 2016/12/15.
 */

define([
    'app',
    'helper/util',
    'helper/markdownwiki',
    'helper/storage',
    'helper/dataSource',
    'text!html/home.html',
    'text!html/articles/featurelist.md',
], function (app, util, markdownwiki, storage, dataSource, htmlContent, featureListContent) {
    // 动态加载
    app.controller('homeController', ['$scope', '$rootScope', '$auth', '$sce', '$translate', 'Account', 'Message', function ($scope, $rootScope, $auth, $sce, $translate, Account, Message) {
		$scope.keepPassword = storage.localStorageGetItem("keepPassword");
        $scope.isGlobalVersion = config.isGlobalVersion;
        $scope.goUserSite = function (site) {
            util.goUserSite('/' + site.username + '/' + site.name + '/index');
        }

        // 更多我的收藏
        $scope.goAllWorksList = function () {
            storage.sessionStorageSetItem("siteshowParams", {siteshowType:'all'});
            util.go("siteshow");
        }

        // 更多收藏
        $scope.goAllPersonalList = function () {
            storage.sessionStorageSetItem("siteshowParams", {siteshowType:'personal'});
            util.go("siteshow");
        }
        
        function init() {
            // 获得网站统计信息
            // util.http("POST", config.apiUrlPrefix + "wikicraft/getStatics", {}, function (data) {
            //     $scope.wikicraft = data || {};
            // });
            //
            // util.http("POST", config.apiUrlPrefix + 'website/getSiteList', {page:1, pageSize:4, sortBy:'-favoriteCount'}, function (data) {
            //     $scope.siteObj = data;
            // });
            //
            // util.http("POST", config.apiUrlPrefix + 'website/getSiteList', {page:1, pageSize:4, sortBy:'-favoriteCount'}, function (data) {
            //     $scope.personalSiteObj = data;
            // });

            $scope.isFeature = storage.sessionStorageGetItem("isFeature") || false;
            storage.sessionStorageRemoveItem('isFeature');
            var md = markdownwiki({breaks: true, isMainMd:true});
            // var featureListContent = featureListContent;
            var mdContent = md.render(featureListContent);
            util.onViewContentLoadedByContainerId("#__UserSitePageContent__", function (params) {
                util.html('#_featureList_', mdContent, $scope);
            }, $scope);

            // Account.getUser(function (userinfo) {
            //    createTutorialSite(userinfo, function () {
            //        console.log("-------finish-----------");
            //    });
            // });
			//Authenticate("facebook"); 
        };

        $scope.goRegisterPage = function () {
            storage.sessionStorageRemoveItem('userThreeService');
            util.go('join');
        };

        $scope.goUserIndexPage=function(username){
            util.goUserSite('/'+username,true);
        };

        // 注册
        $scope.register = function () {
            $scope.errMsg = "";
            $("#mail-err").addClass("visible-hidden");
            $("#pwd-err").addClass("visible-hidden");
            $("#webname-err").addClass("visible-hidden");
            $("#total-err").addClass("visible-hidden");

            var params = {
                username: $scope.username? $scope.username.trim():"",
                email: $scope.email? $scope.email.trim():"",
                cellphone: $scope.cellphone? $scope.cellphone.trim():"",
                password: $scope.password? $scope.password.trim():"",
            };

            if (!/[\d\w]+/.test(params.username)) {
                $scope.errMsg = "用户名格式错误, 用户名由字母和数字组成";
                return ;
            }

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
                // console.log("注册成功")
                $auth.setToken(data.token);
                Account.setUser(data.userinfo);
                createTutorialSite(data.userinfo, function () {
                    util.go('home');
                }, function () {
                });

            }, function (error) {
                $scope.errMsg = error.message;
                // console.log($scope.errMsg );
                $("#total-err").removeClass("visible-hidden");
            });
        };

        // 创建新手引导站点及相关页面
        function createTutorialSite(userinfo, cb, errcb) {
            util.post(config.apiUrlPrefix + 'website/upsert', {
                "userId": userinfo._id,
                "username": userinfo.username,
                "name":"tutorial",
                "displayName":"新手教程",
                "dataSourceId": userinfo.dataSourceId,
                "categoryName": "个人站点",
                "templateName": "教学模板",
                "styleName": "默认样式",
            }, function (siteinfo) {
                var userDataSource = dataSource.getUserDataSource(siteinfo.username);
                userDataSource.registerInitFinishCallback(function () {
                    var currentDataSource = userDataSource.getDataSourceById(siteinfo.dataSourceId);
                    //console.log(currentDataSource, siteinfo);
                    var pagepathPrefix = "/" + siteinfo.username + "/" + siteinfo.name + "/";
                    var tutorialPageList = [
                        {
                            "pagepath": pagepathPrefix + "index" + config.pageSuffixName,
                            "contentUrl": "text!html/tutorial/index.md",
                        }
                    ];
                    var fnList = [];

                    for (var i = 0; i < tutorialPageList.length; i++) {
                        fnList.push((function (index) {
                            return function (finish) {
                                require([tutorialPageList[index].contentUrl], function (content) {
                                    currentDataSource.writeFile({path:tutorialPageList[index].pagepath, content:content}, finish, finish);
                                }, function () {
                                    finish && finish();
                                });
                            }
                        })(i));
                    }

                    util.batchRun(fnList, cb);
                });
            }, errcb);
        }

        //判断账号是否已存在（登录还是注册）
        $scope.checkUser=function () {
            var params = {
                email: $scope.email.trim(),
            };
            // console.log(params.email);
            if(params.email){
                util.http("POST", config.apiUrlPrefix + "user/getByEmail", params, function (data) {
                    $("#webName").attr("disabled","disabled");
                    $scope.logining=true;
                }, function (error) {
                    // console.log(error );
                    $scope.logining=false;
                    $("#webName").removeAttr("disabled");
                });
            }
        }

		$scope.changeKeepPassword = function() {
			//Account.keepPassword($scope.keepPassword);
			storage.localStorageSetItem("keepPassword", $scope.keepPassword);
		};

        $scope.login = function () {
			//console.log($scope.keepPassword);
            $scope.errMsg = "";
            var params = {
                username: $scope.username? $scope.username.trim() : "",
                password: $scope.password? $scope.password.trim():"",
            };
            if (!params.username || !params.password) {
                $scope.errMsg = "用户名或密码错误";
                $("#total-err").removeClass("visible-hidden");
                return;
            }
            util.http("POST", config.apiUrlPrefix + 'user/login', params, function (data) {
				//storage.sessionStorageSetItem("satellizer_token", data.token);
                $auth.setToken(data.token);
                Account.setUser(data.userinfo);
                // console.log("登录成功");
                /*
                 if (!data.userInfo.githubToken) {
                 Account.githubAuthenticate();
                 }
                 */
                if ($scope.isModal) {
                    $scope.$close(data.userinfo);
                } else {
                    util.goUserSite('/' + data.userinfo.username);
                }

            }, function (error) {
                $scope.errMsg = error.message;
                $("#total-err").removeClass("visible-hidden");
            });
        };

        function Authenticate(serviceName) {
            Account.authenticate(serviceName, function (data) {
				//console.log(data);
                if ($auth.isAuthenticated()) {
                    Account.setUser(data.data);
                    if ($scope.isModal) {
                        $scope.$close(data.data);
                    } else {
                        util.goUserSite('/' + data.data.username);
                    }
                } else {
                    // 用户不存在 注册用户并携带data.data信息
                    // TODO
                    storage.sessionStorageSetItem("userThreeService", data.data);
                    util.go("join");
                }
            }, function (data) {

            });
        }
        $scope.qqLogin = function () {
            // console.log("QQ登录");
            Authenticate("qq");
        }

        $scope.wechatLogin = function () {
            // console.log("微信登录");
            Authenticate("weixin");
        }

        $scope.sinaWeiboLogin = function () {
            // console.log("新浪微博登录");
            Authenticate("xinlangweibo");
        }

        $scope.githubLogin = function () {
            // console.log("github登录");
            Authenticate("github");
        }

        $scope.findPwd=function () {
            util.go("findPwd");
        }

        // 收藏作品
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
                    siteId: site._id,
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
                site.favoriteCount++;
            }else{
                loveIcon.addClass("glyphicon-star-empty");
                loveIcon.removeClass("glyphicon-star");
                worksFavoriteRequest(false);
                site.favoriteCount--;
            }
        };

        $scope.playVideo = function (videoUrl) {
            $scope.videoUrl = $sce.trustAsResourceUrl(videoUrl);
            $("#videoModal").modal("show");
        };

        // 回车提交注册
        $(document).keyup(function (event) {
            if(event.keyCode=="13"){
                $scope.login();
            }
        });

        init();
    }]);

    return htmlContent;
});
