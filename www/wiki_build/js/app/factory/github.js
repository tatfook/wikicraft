/**
 * Created by wuxiangan on 2016/12/29.
 */

define(['app', 'helper/storage', 'js-base64'], function (app, storage) {
    app.factory('github', ['$http', function ($http) {
        var github = {
            inited: false,
            githubName: '',
            defalultRepoName: 'wikicraftDataSource',
            apiBase: 'https://api.github.com',
            defaultHttpHeader: {
                'Accept': 'application/vnd.github.full+json',  // 这个必须有
            },
        };

        // http请求
        github.httpRequest = function (method, url, data, cb, errcb) {
            var config = {
                method: method,
                url: this.apiBase + url,
                headers: this.defaultHttpHeader,
                skipAuthorization: true,  // 跳过插件satellizer认证
            };
            if (method == "POST" || method == "PUT") {
                config.data = data;
            } else {
                config.params = data;
            }

            $http(config).then(function (response) {
                //console.log(response);
                typeof cb == 'function' && cb(response.data);
            }).catch(function (response) {
                console.log(response);
                typeof errcb == 'function' && errcb(response);
            });
        }
        // user operation
        github.getUser = function (cb, errcb) {
            this.httpRequest('GET', '/user', {}, cb, errcb);
        };

        // repos operation
        // listRepos
        github.listRepos = function (cb, errcb) {
            var url = '/user/repos';
            github.httpRequest("GET", url, {affiliation: 'owner'}, cb, errcb);
        };

        github.getRepos = function (cb, errcb) {
            var url = '/repos/' + this.githubName + '/' + this.defalultRepoName;
            this.httpRequest('GET', url, {}, cb, errcb);
        };

        // createRespo
        github.createRepos = function (cb, errcb) {
            github.httpRequest("POST", "/user/repos", {name: this.defalultRepoName}, cb, errcb);
        };

        // delete repos
        github.deleteRepos = function (cb, errcb) {
            var url = "/repos/" + this.githubName + '/' + this.defalultRepoName;
            github.httpRequest("DELETE", url, {}, cb, errcb);
        };

        // content operations
        // actions: CREATE UPDATE READ DELETE
        github.fileCURD = function (method, data, cb, errcb) {
            var url = '/repos/' + this.githubName + '/' + this.defalultRepoName + '/contents/' + data.path;
            github.httpRequest(method, url, data, cb, errcb);
        };
        // writeFile
        github.writeFile = function (data, cb, errcb) {
            var self = this;
            self.getFile({path: data.path}, function (result) {
                //console.log(result);
                data.sha = result.sha;
                self.fileCURD('PUT', data, cb, errcb);
            }, function () {
                self.fileCURD('PUT', data, cb, errcb);
            });
        }
        // read file
        github.getFile = function (data, cb, errcb) {
            this.fileCURD("GET", data, cb, errcb);
        };
        // deleteFile
        github.deleteFile = function (data, cb, errcb) {
            var self = this;
            self.getFile(data, function (result) {
                data.sha = result.sha;
                self.fileCURD("DELETE", data, cb, errcb);
            });
        };
        // rollbackFile
        github.rollbackFile = function (ref, path, message, cb, errcb) {
            var self = this;
            var data = {ref: ref, path: path}

            self.getFile(data, function (file) {
                data.ref = undefined;
                data.content = file.content;
                data.message = message;
                self.writeFile(data, cb, errcb);
            }, errcb)
        };

        // tree  TODO:文件过多会获取不全
        github.getTree = function (bRecursive, cb, errch) {
            var url = '/repos/' + this.githubName + '/' + this.defalultRepoName + '/git/trees/master' + (bRecursive ? '?recursive=1' : '');
            github.httpRequest('GET', url, {}, function(data) {
                cb && cb(data.tree);
            }, errch);
        };

        // commit 
        github.listCommits = function (data, cb, errcb) {
            var url = '/repos/' + this.githubName + '/' + this.defalultRepoName + '/commits';
            github.httpRequest('GET', url, data, cb, errcb);
        };
        github.getSingleCommit = function (sha, cb, errcb) {
            var url = '/repos/' + this.githubName + '/' + this.defalultRepoName + '/commits/' + sha;
            github.httpRequest('GET', url, {}, cb, errcb);
        };

        return {
            github: github,
            init: function (githubToken, githubName, defaultRepoName, cb, errcb) {
                var self = this;
                //console.log(githubToken);
                if (github.inited) {
                    cb && cb();
                    return;
                }

                github.githubToken = githubToken;
                github.githubName = githubName;
                github.defalultRepoName = defaultRepoName || 'wikicraftDataSource';
                github.defaultHttpHeader['Authorization'] = githubToken.token_type + ' ' + githubToken.access_token; // auth 或 使用 ?access_token= githubToken.access_token

                function setDefaultRepo(repoName, cb, errcb) {
                    self.setDefaultRepo(repoName, function (data) {
                        github.inited = true;
                        cb && cb(data);
                    }, errcb);
                }

                if (!githubName) {
                    github.getUser(function (profile) {
                        github.githubName = profile.login;
                        setDefaultRepo(defaultRepoName, cb, errcb);
                    }, errcb);
                } else {
                    setDefaultRepo(defaultRepoName, cb, errcb);
                }
            },
            isInited: function () {
                return github.inited;
            },
            getContentUrl: function (params) {
                return 'https://github.com/' + github.githubName + '/' + github.defalultRepoName + '/blob/master/' + params.path;
            },
            getRawContentUrl: function (params) {
                return 'https://raw.githubusercontent.com/' + github.githubName + '/' + github.defalultRepoName + '/master/' + params.path;
            },
            deleteRepos: function (cb, errcb) {
                github.deleteRepos(cb, errcb);
            },
            setDefaultRepo: function (repoName, cb, errcb) {
                github.defalultRepoName = repoName || 'wikicraftDataSource';
                //console.log(storage.sessionStorageGetItem('githubRepoExist'));
                // 会话期记录是否已存在数据源库，避免重复请求
                var repoKey = 'githubRepoExist_' + github.defalultRepoName;
                if (!storage.sessionStorageGetItem(repoKey)) {
                    github.getRepos(function (data) {
                        storage.sessionStorageSetItem(repoKey, true);
                        cb && cb(data);
                    }, function (response) {
                        if (response.status == 401) {
                            errcb && errcb(response);
                            return;
                        }
                        github.createRepos(function (data) {
                            storage.sessionStorageSetItem(repoKey, true);
                            cb && cb(data);
                        }, errcb);
                    });
                } else {
                    cb && cb();
                }
            },
            writeFile: function (params, cb, errcb) {
                //params: path, content, message,
                params.content = Base64.encode(params.content);
                github.writeFile(params, cb, errcb);
            },
            rollbackFile: function (ref, path, message, cb, errcb) {
                github.rollbackFile(ref, path, message, cb, errcb);
            },
            getContent: function (params, cb, errcb) {
                // params: path
                this.getFile(params, function (data) {   // this.getFile 已做 base64解码
                    cb && cb(data.content);
                }, errcb)
            },
            getFile: function (params, cb, errcb) {
                // params: path
                github.getFile(params, function (data) {
                    data.content = data.content && Base64.decode(data.content);
                    cb && cb(data);
                }, errcb);
            },
            getSha: function (path, cb, errcb) {
                this.getFile(path, cb, errcb);
            },
            uploadImage: function (params, cb, errcb) {
                //params path, content
                var path = params.path;
                var content = params.content;
                if (!path) {
                    path = 'img_' + (new Date()).getTime();
                }
                path = 'images/' + path;
                /*data:image/png;base64,iVBORw0KGgoAAAANS*/
                content = content.split(',');
                if (content.length > 1) {
                    var imgType = content[0];
                    content = content[1];

                    imgType = imgType.match(/image\/([\w]+)/)
                    imgType = imgType && imgType[1];
                    if (imgType) {
                        path = path + '.' + imgType;
                    }
                } else {
                    content = content[0];
                }

                github.writeFile({path: path, message: 'upload image:' + path, content: content}, function (data) {
                    console.log(data.content);
                    cb && cb(data.content.download_url);
                }, errcb);
            },
            deleteFile: function (params, cb, errcb) {
                // params: path, message,
                github.deleteFile(params, cb, errcb);
            },
            getTree: function (bRecursive, cb, errcb) {
                github.getTree(bRecursive, cb, errcb)
            },
            listCommits: function (data, cb, errcb) {
                github.listCommits(data, cb, errcb);
            },
            getSingleCommit: function (sha, cb, errcb) {
                github.getSingleCommit(sha, cb, errcb);
            },
        };
    }]);
});