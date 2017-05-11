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
    app.registerController('joinController', ['$scope', '$auth', 'Account','modal', function ($scope, $auth, Account,modal) {
        //$scope.errMsg = "用户名或密码错误";
        var userThreeService = undefined;
        $scope.isModal=false;
        $scope.step=1;

        function init() {
            console.log("==================join controller init======================");
            userThreeService = storage.sessionStorageGetItem('userThreeService');
            if (userThreeService) {
                $scope.step = 3;
            }
        }

        $scope.$watch('$viewContentLoaded', init);

        // 检查账号名（不可为纯数字，不可包含@符号）
        $scope.checkInput=function (type) {
            $scope.errMsg = "";
            var username=$scope.username?$scope.username : "";
            var pwd=$scope.password?$scope.password : "";
            if(type=="other"){
                username=$scope.otherUsername?$scope.otherUsername : "";
                pwd=$scope.otherPassword?$scope.otherPassword : "";
            }
            if(username.length>30){
                $scope.errMsg="*账户名最长30个字符";
                return;
            }
            if (!/^[a-z_0-9]+$/.test(username)){
                $scope.errMsg="*账户名只允许包含小写字母、数字、下划线";
                return;
            }
            if(/^\d+$/.test(username)){
                $scope.errMsg="*账户名不可为纯数字";
                return;
            }
            if(/@/.test(username)){
                $scope.errMsg="*账户名不可包含@符号";
                return;
            }
            if(pwd.length<6){
                $scope.errMsg="*密码最少6位";
                return;
            }
        }
        
        // 注册
        $scope.register = function (type) {
            $scope.errMsg = "";

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
                $scope.errMsg="*账户名为必填字段";
                return;
            }
            if(params.username.length>30){
                $scope.errMsg="*账户名最长30个字符";
                return;
            }
            if (!/^[a-z_0-9]+$/.test(params.username)){
                $scope.errMsg="*账户名只允许包含小写字母、数字、下划线";
                return;
            }
            if(/^\d+$/.test(params.username)){
                $scope.errMsg="*账户名不可为纯数字";
                return;
            }
            if(/@/.test(params.username)){
                $scope.errMsg="*账户名不可包含@符号";
                return;
            }
            if(params.password.length<6){
                $scope.errMsg="*密码最少6位";
                return;
            }
            var url = type == "other" ? "user/bindThreeService" : "user/register";
            util.http("POST", config.apiUrlPrefix + url, params, function (data) {
                console.log("注册成功");
                $auth.setToken(data.token);
                Account.setUser(data.userinfo);
                var _go = function () {
                    if (type == "other") {
                        util.goUserSite('/'+params.username);
                    } else {
                        $scope.step++;
                    }
                }
                if (data.isNewUser) {
                    createTutorialSite(data.userinfo, _go, _go)
                } else {
                    _go();
                }
            }, function (error) {
                $scope.errMsg = error.message;
                console.log($scope.errMsg );
            });
        }

        // 创建新手引导站点及相关页面
        function createTutorialSite(userinfo, cb, errcb) {
            util.post(config.apiUrlPrefix + 'website/upsert', {
                "userId": userinfo._id,
                "username": userinfo.username,
                "name": "tutorial",
                "displayName": "新手教程",
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
                                    currentDataSource.writeFile({
                                        path: tutorialPageList[index].pagepath,
                                        content: content
                                    }, finish, finish);
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

        $scope.goUserCenter=function () {
            util.go('usercenter',true);
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
                        util.goUserSite('/' + data.data.username);
                    }
                } else {
                    // 用户不存在 注册用户并携带data.data信息
                    userThreeService = data.data;
                    $scope.step = 3;
                }
            }, function (data) {

            });
        }
    }]);
    return htmlContent;
});