/**
 * Created by wuxiangan on 2016/12/21.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'helper/dataSource',
    'text!html/join.html',
], function (app, util, storage, dataSource, htmlContent) {
    app.registerController('joinController', ['$scope', '$auth', 'Account','modal', 'Message', function ($scope, $auth, Account, modal, Message) {
        //$scope.errMsg = "用户名或密码错误";
        var userThreeService = undefined;
        $scope.isModal=false;
        $scope.step=1;
        $scope.agree=true;

        function init() {
            userThreeService = storage.sessionStorageGetItem('userThreeService');
            if (userThreeService) {
                $scope.step = 3;
            }
        }

        $scope.$watch('$viewContentLoaded', init);

        $scope.goBack = function () {
            history.back(-1);
        };

        // 检查账号名（不可为纯数字，不可包含@符号,最长30个字符，可为小写字母、数字、下划线）
        $scope.checkInput=function (checks, type) {
            $scope.errMsg = "";
            $scope.nameErrMsg = "";
            $scope.pwdErrMsg = "";
            var username=$scope.username?$scope.username : "";
            var pwd=$scope.password?$scope.password : "";
            if(type=="other"){
                username=$scope.otherUsername?$scope.otherUsername : "";
                pwd=$scope.otherPassword?$scope.otherPassword : "";
            }
            if (checks.username){
                var isSensitive = false;
                config.services.sensitiveTest.checkSensitiveWord(username, function (foundWords, replacedStr) {
                    if (foundWords.length > 0){
                        isSensitive = true;
                        console.log("包含敏感词:" + foundWords.join("|"));
                        return false;
                    }
                });
                if (isSensitive){
                    $scope.nameErrMsg="您输入的内容不符合互联网安全规范，请修改";
                    return;
                }
                if(username.length>30){
                    $scope.nameErrMsg="*账户名需小于30位";
                    return;
                }
                if(/^\d+$/.test(username)){
                    $scope.nameErrMsg="*账户名不可为纯数字";
                    return;
                }
                if(/@/.test(username)){
                    $scope.nameErrMsg="*账户名不可包含@符号";
                    return;
                }
                if (!/^[a-z_0-9]+$/.test(username)){
                    $scope.nameErrMsg="*账户名只能包含小写字母、数字";
                    return;
                }
            }
            if (checks.password){
                if(pwd.length<6){
                    $scope.pwdErrMsg="*密码最少6位";
                    return;
                }
            }
        };
        
        // 注册
        $scope.register = function (type) {
            // debugger;
            if(!$scope.agree){
                return;
            }
            $scope.errMsg = "";
            $scope.nameErrMsg = "";
            $scope.pwdErrMsg = "";

            var params = {
                username: $scope.username? $scope.username.trim():"",
                password: $scope.password? $scope.password.trim():"",
            };

            if(type=="other"){
                params = {
                    username: $scope.otherUsername? $scope.otherUsername.trim():"",
                    password: $scope.otherPassword? $scope.otherPassword.trim():"",
                    threeService:userThreeService,
                };
            }

            if(!params.username){
                $scope.nameErrMsg="*账户名为必填项";
                $scope.$apply();
                return;
            }
            var isSensitive = false;
            config.services.sensitiveTest.checkSensitiveWord(params.username, function (foundWords, replacedStr) {
                if (foundWords.length > 0){
                    isSensitive = true;
                    console.log("包含敏感词:" + foundWords.join("|"));
                }
            });
            if (isSensitive){
                $scope.nameErrMsg="您输入的内容不符合互联网安全规范，请修改";
                return;
            }
            if(params.username.length>30){
                $scope.nameErrMsg="*账户名需小于30位";
                $scope.$apply();
                return;
            }
            if(/^\d+$/.test(params.username)){
                $scope.nameErrMsg="*账户名不可为纯数字";
                $scope.$apply();
                return;
            }
            if(/@/.test(params.username)){
                $scope.nameErrMsg="*账户名不可包含@符号";
                $scope.$apply();
                return;
            }
            if (!/^[a-z_0-9]+$/.test(params.username)){
                $scope.nameErrMsg="*账户名只能包含小写字母、数字";
                $scope.$apply();
                return;
            }
            if(params.password.length<6){
                $scope.pwdErrMsg="*密码最少6位";
                $scope.$apply();
                return;
            }
            var imgUrl=$scope.getImageUrl("default_portrait.png", $scope.imgsPath);
            params.portrait = imgUrl;

            var url = type == "other" ? "user/bindThreeService" : "user/register";
            util.http("POST", config.apiUrlPrefix + url, params, function (data) {
                console.log("注册成功");
                $auth.setToken(data.token);
                Account.setUser(data.userinfo);
                var _go = function () {
                    if (type == "other") {
                        util.go('/'+params.username);
                    } else {
                        $scope.step++;
                    }
                };
                if (data.isNewUser) {
                    createTutorialSite(data.userinfo, _go, _go);
                } else {
                    _go();
                }
            }, function (error) {
                $scope.errMsg = error.message;
                console.log($scope.errMsg );
            });
        };

        // 创建新手引导站点及相关页面
        function createTutorialSite(userinfo, cb, errcb) {
			var _createTutorialSite = function() {
				util.post(config.apiUrlPrefix + 'website/create', {
					"userId": userinfo._id,
					"username": userinfo.username,
					"name": "tutorial",
					"displayName": "新手教程",
					"categoryName": "个人站点",
					"templateName": "教学模板",
					"styleName": "默认样式",
				}, function (siteinfo) {
					//var dataSourceInst = dataSource.getDataSourceInstance(siteinfo.dataSource.type);
					var userDataSource = dataSource.getUserDataSource(siteinfo.username);
					userDataSource.registerInitFinishCallback(function() {
						var dataSourceInst = userDataSource.getDataSourceBySitename(siteinfo.name);
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
								return function (cb, errcb) {
									require([tutorialPageList[index].contentUrl], function (content) {
										dataSourceInst.writeFile({
											path: tutorialPageList[index].pagepath,
											content: content
										}, cb, errcb);
									}, function () {
										errcb && errcb();
									});
								}
							})(i));
						}

						util.sequenceRun(fnList, undefined, cb, cb);
					});
				}, errcb);
			}
			var getDefaultDataSourceFailedCount = 0;
			var _getDefaultDataSource = function() {
				util.post(config.apiUrlPrefix + 'user/getDefaultSiteDataSource', {username:userinfo.username}, function(data){
					if (data) {
						userinfo.dataSource = [data];
						_createTutorialSite();
						return;
					} else {
						getDefaultDataSourceFailedCount++;
						if (getDefaultDataSourceFailedCount>3) {
							errcb && errcb();
							return;
						} else {
							_getDefaultDataSource();
						}
					}
				}, errcb);
			}
			if (!userinfo.dataSource || userinfo.dataSource.length == 0) {
				_getDefaultDataSource();
			} else {
				_createTutorialSite();
			}
        }

        $scope.goUserCenter=function () {
            util.go('userCenter',true);
        }

        $scope.goUserHome=function () {
            util.goUserSite('/'+$scope.username);
        }

        $scope.goLicense=function () {
            util.go('license',true);
        }

        $scope.qqLogin = function () {
            console.log("QQ登录");
            Authenticate("qq");
        }

        $scope.wechatLogin = function () {
            console.log("微信登录");
            Authenticate("weixin");
        }

        $scope.sinaWeiboLogin = function () {
            console.log("新浪微博登录");
            Authenticate("xinlangweibo");
        }

        $scope.githubLogin = function () {
            console.log("github登录");
            Authenticate("github");
        }

        function Authenticate(serviceName) {
            Account.authenticate(serviceName, function (data) {
                if ($auth.isAuthenticated()) {
                    Account.setUser(data.data);
                    if ($scope.isModal) {
                        $scope.$close(data.data);
                    } else {
                        util.go('/' + data.data.username);
                    }
                } else {
                    // 用户不存在 注册用户并携带data.data信息
                    userThreeService = data.data;
                    $scope.step = 3;
                }
            }, function (data) {

            });
        }

        //回车注册
        $(document).keyup(function (event) {
            if(event.keyCode=="13"){
                $scope.register();
            }
        });
    }]);
    return htmlContent;
});
