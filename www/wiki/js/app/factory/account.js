/**
 * Created by wuxiangan on 2016/12/20.
 */

define(['app', 'storage', 'util'], function (app, storage) {
    console.log("accountFactory");
    app.factory('Account', function ($auth, $rootScope, $uibModal, github) {
        var account = {
            user:undefined,
            // 获取用户信息
            getUser: function () {
                return this.user || storage.localStorageGetItem("userinfo");
            },
            // 设置用户信息
            setUser: function (user) {
                this.user = user;

                init(user);

                storage.localStorageSetItem("userinfo", this.user);
                this.send("onUserProfile", this.user);
            },
            // 广播 TODO 需了解angualar 监听相关功能
            send: function(msg, data) {
                $rootScope.$broadcast(msg, data);
            },

            // 是否认证
            isAuthenticated: function () {
                return $auth.isAuthenticated();
            },

            // 确保认证，未认证跳转登录页
            ensureAuthenticated: function() {
                if (!this.isAuthenticated()) {
                    window.location.href = "/#/login";
                    return;
                }
                return true;
            },

            // github s授权认证
            githubAuthenticate: function() {
                self = this;

                var githubAuth = function () {
                    $auth.authenticate("github").then(function (response) {
                        $auth.setToken(response.data.token);
                        self.setUser(response.data.userInfo);
                        console.log("github认证成功!!!");
                    }, function(){
                        console.log("github认证失败!!!")
                    });
                }
                // 如果已经认证就不再提示认证
                if (self.getUser().githubToken) {
                    githubAuth();
                    return ;
                }

                app.registerController('modalGithubAuthCtrl', function ($scope, $uibModalInstance) {
                    $scope.yes = function () {
                        //console.log("yes");
                        $uibModalInstance.close('yes');
                    };
                    $scope.no = function () {
                        //console.log("no");
                        $uibModalInstance.dismiss('no');
                    }
                });
                $uibModal.open({
                    templateUrl: config.htmlPath + 'githubAuth.html',
                    controller: 'modalGithubAuthCtrl',
                }).result.then(function (result) {
                    //console.log(result);
                    githubAuth();
                }, function (text, error) {
                    //console.log('text:' + text);
                    //console.log('error:' + error);
                    return;
                });
                return ;
            },
        }

        // 初始化github
        function initGithub(user) {
            if (user.githubToken && !github.isInited()) {
                github.init(user.githubToken, user.githubName, undefined);
            }
        }

        function init(user) {
            initGithub(user)
        }

        init(account.getUser());
        return account;
    });
});