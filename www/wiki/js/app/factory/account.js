/**
 * Created by wuxiangan on 2016/12/20.
 */

define([
    'app',
    'helper/storage',
    'helper/util',
    'helper/dataSource',
], function (app, storage, util, dataSource) {
    app.factory('Account', ['$auth', '$rootScope', '$http', '$uibModal', 'Message',
        function ($auth, $rootScope, $http, $uibModal, Message) {
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
			//console.log($.cookie("token"));
			if (!$auth.isAuthenticated() && window.location.hostname != config.hostname && $.cookie('token')) {
				$auth.setToken($.cookie('token'));
			}

            // 初始化数据源
            function initDataSource(user) {
                dataSource.setDefaultUsername(user.username);
                var DataSource = dataSource.getUserDataSource(user.username);
				if (!user.dataSource || user.dataSource.length == 0) {
					util.post(config.apiUrlPrefix + 'site_data_source/getByUsername', {username: user.username}, function (data) {
                        user.dataSource = data || [];
                        //storage.localStorageSetItem("userinfo", user);
                        DataSource.init(user.dataSource, user.defaultDataSourceSitename);
                    });
                } else {
                    DataSource.init(user.dataSource, user.defaultDataSourceSitename);
                }
            }

            account = {
                user: undefined,
				
				//keepPassword: function(isKeep) {
					//if (isKeep) {
						//$auth.setStorageType("localStorage");
					//} else {
						//$auth.setStorageType("sessionStorage");
					//}
				//},

				initDataSource: function(cb, errcb) {
					var user = this.user;
					if (!user || !user.username) {
						errcb && errcb();
						return;
					}
					dataSource.setDefaultUsername(user.username);
					var DataSource = dataSource.getUserDataSource(user.username);
					util.post(config.apiUrlPrefix + 'site_data_source/getByUsername', {username: user.username}, function (data) {
						user.dataSource = data || [];
                        //storage.localStorageSetItem("userinfo", user);
						// console.log(user);
                        DataSource.init(user.dataSource, user.defaultDataSourceSitename);
						cb && cb();
                    }, errcb);
				},

				// 设置数据源
				setDataSourceToken:function(dataSourceCfg) {
					var dataSourceList = this.user.dataSource;
					for (var i = 0; i < dataSourceList.length; i++) {
						if (dataSourceList[i].apiBaseUrl == dataSourceCfg.apiBaseUrl) {
							dataSourceCfg.dataSourceToken = dataSourceList[i].dataSourceToken;
						}
					}
				},

				// 重新获取用户信息
				reloadUser: function(cb, errcb){
					storage.sessionStorageRemoveItem("userinfo");
					var self = this;

					util.post(config.apiUrlPrefix + 'user/getProfile', {}, function(data){
                        self.setUser(data);
						cb && cb(data);
					}, errcb);
				},

                // 获取用户信息
                getUser: function (cb, errcb) {
					if (!$auth.isAuthenticated()) {
						errcb && errcb();
						return;
					}

					var authUseinfo = $auth.getPayload();
					//console.log(authUseinfo);
                    var userinfo = this.user || storage.sessionStorageGetItem("userinfo");

                    if (userinfo && userinfo.username && authUseinfo && authUseinfo.username == userinfo.username) {
                        cb && cb(userinfo);
                        return userinfo;
                    }

					util.getByCache(config.apiUrlPrefix + 'user/getProfile', {}, function (data) {
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
                    this.initDataSource();

                    $rootScope.isLogin = $auth.isAuthenticated();
                    $rootScope.user = user;

                    if ($auth.isAuthenticated()) {
                        var token = $auth.getToken();
                        $.cookie('token', token, {path: '/', expires: 365});
                    }
                    this.send("onUserProfile", this.user);
                    storage.sessionStorageSetItem("userinfo", this.user);
                },

				isValidVip: function() {
					return this.user && this.user.vipInfo && this.user.vipInfo.isValid;
				},

                // 广播 TODO 需了解angualar 监听相关功能
                send: function (msg, data) {
                    $rootScope.$broadcast(msg, data);
                },

                // 是否认证
                isAuthenticated: function () {
                    return $auth.isAuthenticated();
                },

                authenticate: function (serviceName, cb, errcb) {
                    $auth.authenticate(serviceName).then(function (response) {
                        var data = response.data || {};
                        if (data.error) {
                            Message.info("认证失败:" + data.message);
                            errcb && errcb(data);
                            return;
                        } else {
                            cb && cb(data);
                        }
                    }, function (response) {
                        errcb && errcb(response.data);
                        console.log("认证失败!!!");
                    });
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
                    // remove all token forcely
                    $.removeCookie('token');
                    $.removeCookie('token', {path:'/'});
                    $.removeCookie('token', {domain: config.hostname});
                    $.removeCookie('token', {domain: '.' + config.hostname});
                    $.removeCookie('token', {path:'/', domain: config.hostname});
                    $.removeCookie('token', {path:'/', domain: '.' + config.hostname});
                    $auth.logout();
                    this.send("onLogout", "");
                },

                refuseUser: function () {
                    if ($rootScope.isLogin) {
                        this.logout();
                        $rootScope.isLogin = false;
                        alert("您的帐号已被封禁")
                        util.go("login")
                    }
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

			//console.log(config.wikiConfig.token);
			//if (config.wikiConfig.token) {
				//$auth.setToken(config.wikiConfig.token);
			//}
			//account.keepPassword(false);
            account.getUser(function (user) {
                //console.log(user);
                account.setUser(user);
            });

            return account;
        }]);
});
