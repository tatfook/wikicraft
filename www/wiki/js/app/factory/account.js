/**
 * Created by wuxiangan on 2016/12/20.
 */

define(['app', 'helper/storage', 'helper/util', 'helper/dataSource'], function (app, storage, util, dataSource) {
    console.log("accountFactory");
    app.factory('Account', ['$auth', '$rootScope', '$http','$uibModal', 'github', 'Message', function ($auth, $rootScope, $http, $uibModal, github, Message) {
        var angularService = util.getAngularServices();
        if (!angularService || !angularService.$http) {
            util.setAngularServices({$http:$http});
        }
        /*
        var hostname = window.location.hostname;
        if (hostname != config.hostname) {
            $auth.setStorageType('sessionStorage');
        } else {
            $auth.setStorageType("localStorage");
        }
        */
        // 为认证且域名为子域名
        if (!$auth.isAuthenticated() && window.location.hostname != config.hostname && $.cookie('token')) {
            $auth.setToken($.cookie('token'));
        }

        // 初始化github
        function initGithub(user) {
            /*
            user.githubToken = {
                token_type: 'bearer',
                access_token: 'c4b9a75d8c6c9fd1db081319723d1713f70f6f74'
            };
            user.githubName = 'wxaxiaoyao';
             */
            if (user && user.githubToken && !github.isInited()) {
                github.init(user.githubToken, user.githubName, user.githubRepoName, function () {
                    dataSource.registerDataSource('github', github);
                    $rootScope.$broadcast("onDataSource", github);
                    console.log("github init success");
                }, function (response) {
                    //console.log(response);
                    if (response.status == 401) {  // Token失效
                        Message.info('GITHUB授权过期，请重新认证!!!');
                        console.log('GITHUB授权过期，请重新认证!!!');
                        user.githubToken = undefined;
                        account.setUser(user);
                    }
                    console.log("github init failed");
                });
            }
        }

        var account = {
            user: {},
            // 获取用户信息
            getUser: function (cb, errcb) {
                var userinfo = this.user || storage.localStorageGetItem("userinfo");

                //console.log(userinfo);

                if (userinfo && userinfo._id && userinfo.username) {
                    cb && cb(userinfo);
                    return userinfo;
                }
                console.log(config.apiUrlPrefix);
                util.post(config.apiUrlPrefix + 'user/getProfile',{}, function (data) {
                    //console.log(data);
                    cb && cb(data);
                }, function () {
                    errcb && errcb();
                });
                return userinfo;
            },

            // 设置用户信息
            setUser: function (user) {
                if (!user) {
                    return;
                }
                this.user = user;
                //console.log(user);
                initGithub(user);

                $rootScope.isLogin = $auth.isAuthenticated();
                $rootScope.user = user;

                if ($auth.isAuthenticated()) {
                    var token = $auth.getToken();
                    $.cookie('token',token,{path:'/', expires:365, domain:'.'+config.hostname});
                }
                this.send("onUserProfile", this.user);
                storage.localStorageSetItem("userinfo", this.user);
            },
            // 广播 TODO 需了解angualar 监听相关功能
            send: function (msg, data) {
                $rootScope.$broadcast(msg, data);
            },

            // 是否认证
            isAuthenticated: function () {
                return $auth.isAuthenticated();
            },

            // 确保认证，未认证跳转登录页
            ensureAuthenticated: function (cb) {
                if (!this.isAuthenticated()) {
                    window.location.href = "/wiki/login";
                    return;
                }
                cb && cb();
                return true;
            },

            // logout
            logout: function () {
                $auth.logout();
            },

            // github s授权认证
            githubAuthenticate: function (cb, errcb) {
                self = this;

                var githubAuth = function () {
                    $auth.authenticate("github").then(function (response) {
                        $auth.setToken(response.data.token);
                        console.log(response.data.userInfo);
                        self.setUser(response.data.userInfo);
                        cb && cb();
                        Message.info("github认证成功!!!");
                        console.log("github认证成功!!!")
                    }, function () {
                        errcb && errcb();
                        Message.warning("github认证失败!!!");
                        console.log("github认证失败!!!")
                    });
                }
                // 如果已经认证就不再提示认证
                if (self.getUser().githubToken) {
                    githubAuth();
                    return;
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
                return;
            },

            /*
             isRequireSignin: function () {
             return this.requireSignin;
             },

             setRequireSignin: function (bNeedSignin) {
             this.requireSignin = bNeedSignin;
             },
             */

            linkGithub: function () {
                if (this.isAuthenticated()) {
                    this.user.githubDS = 1;
                    this.updateProfile(this.user, function () {
                        account.githubAuthenticate();
                    });
                }
            },
            unlinkGithub: function () {
                if (this.isAuthenticated()) {
                    this.user.githubDS = 0;
                    this.updateProfile(this.user);
                }
            },
            updateProfile: function (userinfo, cb, errcb) {
                var self = this;
                util.http("PUT", config.apiUrlPrefix + "user/updateUserInfo", userinfo, function (data) {
                    self.setUser(data);
                    Message.success("用户信息修改成功");
                    cb && cb(data);
                }, function () {
                    Message.success("用户信息修改失败");
                    errcb && errcb();
                });
            }
        }

        account.getUser(function (user) {
            console.log(user);
            account.setUser(user);
        });

        return account;
    }]);
});