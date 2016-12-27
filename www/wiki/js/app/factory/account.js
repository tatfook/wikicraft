/**
 * Created by wuxiangan on 2016/12/20.
 */

define(['app', 'storage', 'util'], function (app, storage, util) {
    console.log("accountFactory");

    app.factory('Account', function ($auth, $rootScope, $uibModal) {
        return {
            user:{
                //_id:1,
                //username:'逍遥',
                loaded:false,
            },
            getUser: function () {
                return this.user;
                //return this.user.loaded ? this.user : (storage.sessionStorageGetItem("userinfo") || {});
            },

            setUser: function (user) {
                if (!user) {
                    return ;
                }

                this.user = user;
                if (this.user) {
                    this.user.loaded = true;
                }
                //storage.sessionStorageSetItem("userinfo", this.user);
                $rootScope.user = this.user; // 用户信息让每个控制都拥有
                this.send("onUserProfile", this.user);
            },

            send: function(msg, data) {
                $rootScope.$broadcast(msg, data);
            },

            isLoaded: function () {
                return this.getUser().loaded ? true : false;
            },

            isAuthenticated: function () {
                return $auth.isAuthenticated();
            },

            ensureAuthenticated: function(callback) {
                if (!this.isAuthenticated()) {
                    window.location.href = "/#/login";
                    return;
                }
                if (!this.user || !this.user.loaded) {
                    this.getProfile(callback);
                } else {
                    callback && callback();
                }
            },

            githubAuthenticate: function() {
                self = this;
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
                    $auth.authenticate("github").then(function (response) {
                        $auth.setToken(response.data.token);
                        self.setUser(response.data.userInfo);
                        console.log("github认证成功!!!")
                    }, function(){
                        console.log("github认证失败!!!")
                    });
                }, function (text, error) {
                    //console.log('text:' + text);
                    //console.log('error:' + error);
                    return;
                });
                return ;
            },

            getProfile: function (callback) {
                var self = this;
                util.http("POST", config.apiUrlPrefix + "user/getProfile",{}, function (data) {
                    if (!data) {
                        return
                    }

                    self.setUser(data);
                    if (!data.githubToken) {
                        self.githubAuthenticate();
                    }

                    callback && callback();
                });
            },
            updateProfile: function (profileData) {
                var self = this;
                util.http('PUT', config.apiUrlPrefix + 'user', profileData, function (data) {
                    self.setUser(data);
                });
            },
            linkGithub: function () {
                if ($auth.isAuthenticated()) {
                    var self = this;
                    if (self.user) {
                        $auth.authenticate("github").then(function () {
                                self.getProfile();
                            })
                            .catch(function (error) {
                                alert(error.data && error.data.message);
                            });
                    }
                }
            },
            unlinkGithub: function () {
                if ($auth.isAuthenticated()) {
                    if (user && (user.github && user.github != 0)) {
                        var userData = angular.copy(user);
                        delete userData.github;
                        userData._unset = ["githubId"];
                        this.updateProfile(userData);
                    }
                }
            },
        }
    });
});