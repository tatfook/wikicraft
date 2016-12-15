/**
 * Created by wuxiangan on 2016/10/10.
 */

app.factory('Account', function ($auth, $rootScope) {
    return {
        user:{
            //_id:1,
            //username:'逍遥',
            loaded:false,
        },
        getUser: function () {
            return this.user;
        },
        
        setUser: function (_user) {
            this.user = _user;
            if (this.user) {
                this.user.loaded = true;
            }
            this.send("onUserProfile", this.user);
			$rootScope.user = this.user; // 用户信息让每个控制都拥有
        },

        send: function(msg, data) {
            $rootScope.$broadcast(msg, data);
        },

        isLoaded: function () {
            if (this.user && this.user.loaded) {
                return true;
            }
            return false;
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
			$auth.authenticate("github").then(function (response) {
				$auth.setToken(response.data.token);
				self.setUser(response.data.userInfo);
				console.log("github认证成功!!!")
			}, function(){
				console.log("github认证失败!!!")
			});
		},

        getProfile: function (callback) {
            var self = this;
            util.http("POST", config.apiUrlPrefix + "user/getProfile",{}, function (data) {
				if (!data) {
					return 
				}

                self.setUser(data);
				if (!data.githubToken) {
					//self.githubAuthenticate();
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

app.factory('SelfData', function () {
    return {};
});

app.factory("Message", function () {
    var message={
        timeout:5000,
        slideDownTimeout:1000,
        slideUpTimeout:2000,
    };
    //$('#messageTipId').slideToggle();
    message.show = function (type, content) {
        if (type != "success" && type != "info" && type != "warning" && type !="danger") {
            type = "info";
        }
        $('#messageTipId').removeClass('alert alert-success alert-info alert-warning alert-danger');
        $('#messageTipId').addClass('alert alert-' + type);
        $('#messageTipConentId').html(content);
        $('#messageTipId').slideDown(message.slideDownTimeout);
        setTimeout(function () {
            $('#messageTipId').slideUp(message.slideUpTimeout);
        }, message.timeout);
    };
    message.success = function (content) {
        this.show('success', content);
    }
    message.info = function (content) {
        this.show('info', content);
    }
    message.warning = function (content) {
        this.show('warning', content);
    }
    message.danger = function (content) {
        this.show('danger', content);
    }
    message.hide = function () {
        $('#messageTipId').slideUp(message.slideUpTimeout);
    }

    return message;
});

app.factory('ProjectStorageProvider', function ($http, $state, $auth) {
    // github 数据源
    var github = {
        repoName:'wikicraftDataSource',
    };

    // 获得用户obj
    github.getUser = function(user) {
        return this.github.getUser(user);
    }

    // 获得用户profile  **用户登录执行**
    github.getProfile = function (cb) {
        this.user.getProfile(function (error, result, request) {
            if (!error) {
                github.profile = result;
                github.username = result.login;
                github.repo = github.github.getRepo(github.username, github.repoName);
                console.log(result);
            }

            if (cb) {
                cb(error, result, request);
            }
        });
    }
    // 获得原始github
    github.getGitHub = function () {
        return github.github;
    }

    // 初始化
    github.init = function (auth, cb) {
        github.github = new GitHub(auth); // 创建github对象
        github.user = this.github.getUser();
        github.user.createRepo({
            "name": github.repoName,
            "description": "wikicraft data source repository",
        });

        github.getProfile(cb);
    }

    // 获得库
    github.getRepo = function (repo) {
        return github.github.getRepo(github.username, repo);
    }

    // 上传图片 图片默认都放在根目录下的images目录下
    github.uploadImage = function (filename, content, cb) {
        var repo = github.getRepo("wikicraftDataSource");
        var date = new Date();

        if (filename && filename.length > 0 && filename[0] == '/') {
            filename = '.images' + filename;
        } else {
            filename = ".images/" + filename;
        }

        if (filename[filename.length-1] == '/') {
            filename += date.getTime();
        }

        repo.writeFile('master', filename, content, "upload image: " + filename, {}, function (error, result, request) {
            cb && cb(error, result, request);
        });
    }

    // 保存文件
    github.saveFile = function (path, content, message, cb) {
        //github.repo.writeFile('master', path, content, message, {}, cb);
        var repo = github.getRepo("wikicraftDataSource");
        repo.writeFile('master', path, content, message, {}, function (error, result, request) {
            if (error) {
                cb && cb(error, result, request);
                return ;
            }
            // 提交到内部服务器  这块可放到外面写
            var websiteName = result.content.path.match(/\/?([^\/]+)/);
            websiteName = websiteName && websiteName[1];
            var page = {
                sha:result.content.sha,
                path:result.content.path,
                name:result.content.name,
                content:content,
                contentType:'html',
                websiteName:websiteName,
            }
            console.log(page);
            util.http($http, 'PUT', config.apiUrlPrefix + 'website_pages/new', page, function (data) {
                console.log(data);
                cb && cb(error, data, request);
            })
        });
    };
    // 列出历史版本
    github.listCommits = function (options, cb) {
        var repo = github.getRepo("wikicraftDataSource");
        repo.listCommits(options, cb);
    }
    
    github.getSingleCommit = function (sha, cb) {
        var repo = github.getRepo("wikicraftDataSource");
        repo.getSingleCommit(sha, cb);
    }

    // 获得filelist   非递归可能有bug 取决js异步对统一变量访问是否是隔离的
    github.getTree = function (treeSha, recursive, cb, out, level, prefix) {
        var repo = github.getRepo("wikicraftDataSource");
        level = level || [];
        if (treeSha == undefined) {
            treeSha = 'master';
        }

        if (recursive == undefined) {
            recursive = true;
        }

        if (recursive) {
            treeSha += '?recursive=1';
        }

        repo.getTree(treeSha, function (error, result, request) {
            if (error) {
                console.log(error);
                cb(error, out, request);
                return ;
            }

            if (recursive &&  result.truncated) {   // 递归被截断  则手动递归获取
                github.getTree(treeSha, false, cb, out, level);
                return;
            }

            out = out || [];

            for(var i = 0 ; i < result.tree.length; i++) {
                if (prefix) {
                    result.tree[i].path = prefix + '/' + result.tree[i].path;
                }
                out.push(result.tree[i]);

                if (!recursive && result.tree[i].type == 'tree') {
                    level.push(1)
                    github.getTree(result.tree[i].sha, false, cb, out, level, result.tree[i].path)
                }
            }

            if (level.length == 0) {
                cb(error, out, request);
            } else {
                level.pop();
            }
        })
    }

    // 回滚文件
    github.rollbackFile = function (commitSha, path, message, cb) {
        var repo = github.getRepo("wikicraftDataSource");
        repo.getContents(commitSha, path, true, function (error, result, request) {
            if (error) {
                cb || cb(error, result, request);
                return;
            }
            console.log(result);
            github.saveFile(path, result, message, cb);
        });
    }

    // 删除文件
    github.deleteFile = function (path, cb) {
        var repo = github.getRepo("wikicraftDataSource");
        repo.deleteFile('master', path, function (error, result, request) {
           innerServer.deleteFile(path, function (data) {
               cb && cb(error, data, request);
           })
        });
    }

    // 内部服务器数据
    var innerServer = {};

    innerServer.saveFile = function(websiteName, pageName, path, sha, content, contentType, innerCB) {
        var page = {
            sha:sha,
            path:path,
            name:pageName,
            content:content,
            contentType:contentType,
            websiteName:websiteName,
        }
        util.http($http, 'PUT', config.apiUrlPrefix + 'website_pages/new', page, innerCB);
    }

    innerServer.deleteFile = function (path, innerCB) {
        util.http($http, 'DELETE', config.apiUrlPrefix + 'website_pages',{path:path}, innerCB);
    }

    innerServer.getWebsiteTree = function (websiteName, innerCB) {

    }

    innerServer.getAllWebsiteTree = function (innerCB) {

    }

    // 返回依赖注入
    return {
        storageProvider:{
            "innerServer":innerServer,
            "github":github,
        },

        getDataSource: function (name) {
            return this.storageProvider[name];
        }
    }
});
