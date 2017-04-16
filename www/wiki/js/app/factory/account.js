/**
 * Created by wuxiangan on 2016/12/20.
 */

define([
    'app',
    'helper/storage',
    'helper/util',
    'helper/dataSource'
], function (app, storage, util, dataSource) {
    app.factory('Account', ['$auth', '$rootScope', '$http', '$uibModal', 'github', 'Message',
        function ($auth, $rootScope, $http, $uibModal, github, Message) {
            var account = undefined;
            var angularService = util.getAngularServices();
            if (!angularService || !angularService.$http) {
                util.setAngularServices({$http: $http});
            }
            /*
             var hostname = window.location.hostname;
             if (hostname != config.officialDomain) {
             $auth.setStorageType('sessionStorage');
             } else {
             $auth.setStorageType("localStorage");
             }
             */
            
            // 为认证且域名为子域名
            if (!$auth.isAuthenticated() && window.location.hostname != config.hostname && $.cookie('token')) {
                $auth.setToken($.cookie('token'));
            }

            // 初始化数据源
            function initDataSource(user) {
                dataSource.setDefaultUsername(user.username);
                var DataSource = dataSource.getUserDataSource(user.username);
                if (!user.dataSource || user.dataSource.length == 0) {
                    util.post(config.apiUrlPrefix + 'data_source/getByUserId', {userId: user._id}, function (data) {
                        user.dataSource = data || [];
                        storage.localStorageSetItem("userinfo", user);
                        DataSource.init(user.dataSource, user.dataSourceId);
                    });
                } else {
                    DataSource.init(user.dataSource, user.dataSourceId);
                }
            }

            account = {
                user: {},
                // 获取用户信息
                getUser: function (cb, errcb) {
                    var userinfo = this.user || storage.localStorageGetItem("userinfo");

                    //console.log(userinfo);

                    if (userinfo && userinfo._id && userinfo.username) {
                        cb && cb(userinfo);
                        return userinfo;
                    }
                    if ($auth.isAuthenticated()) {
                        util.post(config.apiUrlPrefix + 'user/getProfile', {}, function (data) {
                            //console.log(data);
                            cb && cb(data);
                        }, function () {
                            errcb && errcb();
                        });
                    }

                    return userinfo;
                },

                // 设置用户信息
                setUser: function (user) {
                    if (!user) {
                        return;
                    }
                    this.user = user;
                    //console.log(user);
                    initDataSource(user);

                    $rootScope.isLogin = $auth.isAuthenticated();
                    $rootScope.user = user;

                    if ($auth.isAuthenticated()) {
                        var token = $auth.getToken();
                        $.cookie('token', token, {path: '/', expires: 365, domain: '.' + config.hostname});
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
                        util.go('login');
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