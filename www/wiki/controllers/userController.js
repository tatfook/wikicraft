/**
Author: LiXizhi@yeah.net
Date: 2016.8.22
*/
angular.module('MyApp')
/** signal: "onUserProfile" */
.factory('Account', function ($http, $auth, $rootScope) {
    var user;
    var requireSignin = false;
    return {
        setUser: function (user_) {
            user = user_;
            if (user) {
                user.loaded = true;
            }
            this.send("onUserProfile", user);
        },
        getUser: function () {
            return user;
        },
        send: function(msg, data) {
            $rootScope.$broadcast(msg, data);
        },
        isAuthenticated: function () {
            return $auth.isAuthenticated();
        },
        isRequireSignin: function() {
            return requireSignin;
        },
        // call this function if a page requires signin. 
        setRequireSignin: function (bNeedSignin) {
            requireSignin = bNeedSignin;
        },
        getProfile: function () {
            var self = this;
            $http.get('/api/wiki/models/user').then(function (response) {
                self.setUser(response.data);
            })
			.catch(function (response) {
			    user = null;
			});
        },
        updateProfile: function (profileData) {
            var self = this;
            $http.put('/api/wiki/models/user', profileData).then(function (response) {
                if (response.data) {
                    self.setUser(response.data);
                    self.send("actiontip", "保存完毕!", null, "success");
                } else {
                    self.send("actiontip", "保存出错了", -1, "error");
                }
            }).catch(function (response) {
                self.send("actiontip", "保存出错了", -1, "error");
            });;
        },
        linkGithub: function () {
            if ($auth.isAuthenticated()) {
                var self = this;
                if (user) {
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
                    userData._unset = ["github"];
                    this.updateProfile(userData);
                }
            }
        },
    };
})
.controller('ModalLoginCtrl', function ($scope, $http, $auth, Account, $uibModalInstance) {
    $scope.isAuthenticating = false;
    $scope.cancel = function () {
        if (!Account.isRequireSignin())
            $uibModalInstance.dismiss('cancel');
        else
            alert("这个网页需要你登陆后才能访问");
    };
    $scope.register = function() {
        $uibModalInstance.close("login");
    }
	$scope.authenticate = function (provider) {
	    $scope.isAuthenticating = true;
	    $auth.authenticate(provider)
			.then(function () {
				$uibModalInstance.close(provider);
			})
			.catch(function (error) {
			    if (!Account.isRequireSignin())
			        $uibModalInstance.dismiss("error", error);
                else
			        alert(JSON.stringify(error));
			});
	};
	$scope.loginUser = function (email, password) {
	    $http.post("/api/wiki/models/user/login", { email: email, password: password, })
            .then(function (response) {
                var token = response.data.token;
                if (token) {
                    $auth.setToken(token);
                    $uibModalInstance.close();
                }
            }).catch(function (response) {
                if (response.data.message == "Email or password wrong") {
                    alert("Email不存在或密码错误");
                }
                else {
                    alert("出错了：" + JSON.stringify(response));
                }
            });
	};
})
.controller('ModalRegisterCtrl', function ($scope, $http, $auth, Account, $uibModalInstance) {
    $scope.cancel = function () {
        if (!Account.isRequireSignin())
            $uibModalInstance.dismiss('cancel');
        else
            alert("这个网页需要你注册后才能访问");
    };
    $scope.login = function () {
        $uibModalInstance.close('login');
    };
    $scope.registerUser = function () {
        $http.post("/api/wiki/models/user/register", { email: $scope.email, password: $scope.password, displayName: $scope.username })
            .then(function (response) {
                var token = response.data.token;
                if (token) {
                    $auth.setToken(token);
                    $uibModalInstance.close();
                }
            }).catch(function (response) {
                if (response.data.message == "Email is already taken") {
                    alert("Email已经存在了");
                }
                else {
                    alert("出错了：" + JSON.stringify(response));
                }
            });
    };
})
.controller('UserCtrl', function ($scope, $http, $auth, $uibModal, Account, WikiPage) {
	$scope.user = {};
	$scope.bShowIndexBar = false;
	$scope.GetWikiPage = function () {
	    return WikiPage;
	};
	$scope.logout = function () {
	    if (!$auth.isAuthenticated()) { return; }
	    $auth.logout().then(function () {
	        // $scope.actiontip("你已经退出登录!")
	    });
	};
	$scope.isAuthenticated = function () {
	    return $auth.isAuthenticated();
	};
	$scope.notifications = [];
    // @param type: "success", "info", "warning", "danger"
	$scope.addNotice = function (notification, type, duration) {
	    $scope.notifications.push({ text: notification, type: type || "success" });
	    duration = duration || 3000;
	    if (duration > 0) {
	        window.setTimeout(function () {
	            $scope.notifications.splice(0, 1);
	            $scope.$apply();
	        }, duration || 3000);
	    }
	};
	$scope.actiontip = function (text, timeout, type) {
	    $scope.addNotice(text, type || "info", timeout);
	};
	$scope.$on('actiontip', function (event, text, duration, type) {
	    $scope.actiontip(text, duration, type);
	});
	$scope.showSiteInfo = function () {
        // TODO: 
	}
	$scope.showPageInfo = function () {
	    // TODO: 
	}
	WikiPage.login = function () {
	    $scope.login();
	}
	WikiPage.register = function () {
	    $scope.register();
	}
	WikiPage.isAuthenticated = function () {
	    return $scope.isAuthenticated();
	}
    // star the current project
    $scope.starProject = function () {
	    var wiki = this.GetWikiPage();
	    var proj_name = wiki.getSiteName();
	    if (proj_name) {
	        $http.post("/api/wiki/models/user_stars/starproject", {name:proj_name})
                .then(function(response){
                    if (response && response.data.success) {
                        if (response.data.stars != null) {
                            wiki.project_stars = response.data.stars;
                            wiki.is_stared = true;
                            //$scope.actiontip(proj_name + " 订阅成功, 点击右上角头像可查看你订阅过的作品", 10000, "success");
                        }
                    }
                })
	    }
    }
    // unstar the current project
	$scope.unstarProject = function () {
	    var wiki = this.GetWikiPage();
	    var proj_name = wiki.getSiteName();
	    if (proj_name) {
	        $http.post("/api/wiki/models/user_stars/unstarproject", { name: proj_name })
                .then(function (response) {
                    if (response && response.data.success) {
                        if (response.data.stars!=null) {
                            wiki.project_stars = response.data.stars;
                            wiki.is_stared = false;
                            //$scope.actiontip(proj_name + " 的订阅已经取消", null, "success");
                        }
                    }
                })
	    }
	}
	$scope.showSubscribers = function () {
	    var wiki = this.GetWikiPage();
	    var proj_name = wiki.getSiteName();
	    window.location.href = ("/" + proj_name + "/_subscribers");
	}
	$scope.login = function () {
	    $uibModal.open({
	        templateUrl: WIKI_WEBROOT+ "auth/login.html",
	        controller: "ModalLoginCtrl",
	    }).result.then(function (provider) {
	        if (provider == "login") {
	            $scope.register();
	        }
	        else {
	            // $scope.actiontip('登录成功:' + provider + '!', null, "success");
	        }
	    }, function (text, error) {
	        if (error && error.error) {
	            // Popup error - invalid redirect_uri, pressed cancel button, etc.
	            $scope.actiontip(error.error, -1, "error");
	        } else if (error && error.data) {
	            // HTTP response error from server
	            $scope.actiontip(error.data.message || "some error!", -1, "error");
	        }
	        else
	            $scope.actiontip("登录失败了, 请重新尝试", 5, "error");
	    });
	};
	$scope.register = function () {
	    $uibModal.open({
	        templateUrl: WIKI_WEBROOT + "auth/register.html",
	        controller: "ModalRegisterCtrl",
	    }).result.then(function (text) {
	        if (text == "login")
	            $scope.login();
	    });
	};
	$scope.showIndexBar = function (bShow) {
	    if (bShow == null)
	        bShow = !$scope.bShowIndexBar;
	    $scope.bShowIndexBar = bShow;
	    WikiPage.ShowIndexBar(bShow);
	};
	$scope.$on('login', function (event, args) {
	    $scope.login();
	});
	$scope.$on('register', function (event, args) {
	    $scope.register();
	});
	$scope.$watch(Account.getUser, function (newValue, oldValue) {
	    if (newValue != oldValue) {
	        $scope.user = newValue;
	        if (!newValue) {
	            $scope.logout();
	        }
	    }
	});
	$scope.$watch(Account.isRequireSignin, function (newValue, oldValue) {
	    if (newValue != oldValue && !$auth.isAuthenticated())
	        $scope.register();
	});
	$scope.$watch(Account.isAuthenticated, function (bAuthenticated) {
	    if (bAuthenticated) {
	        Account.getProfile();
	        Account.send("authenticated");
	        WikiPage.refreshIsStared();
	    } else {
	        if (Account.isRequireSignin())
	            $scope.register();
	    }
	});
});