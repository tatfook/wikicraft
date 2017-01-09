/**
 * Created by wuxiangan on 2016/12/29.
 */

define(['app','helper/storage', 'js-base64'], function (app, storage) {
    app.factory('github', ['$http', function ($http) {
        var github = {
            inited:false,
            githubName:'',
            defalultRepoName:'wikicraftDataSource',
            apiBase:'https://api.github.com',
            defaultHttpHeader:{
                'Accept': 'application/vnd.github.full+json',  // 这个必须有
            },
        };

        // http请求
        github.httpRequest =function(method, url, data, cb, errcb) {
            var config = {
                method:method,
                url:this.apiBase + url,
                headers:this.defaultHttpHeader,
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
            this.httpRequest('GET','/user', {}, cb, errcb);
        };

        // repos operation
        // listRepos
        github.listRepos = function (cb, errcb) {
            var url = '/user/repos';
            github.httpRequest("GET", url, {affiliation:'owner'}, cb, errcb);
        };

        github.getRepos = function (cb, errcb) {
            var url = '/repos/' + this.githubName + '/' + this.defalultRepoName;
            this.httpRequest('GET', url,{},cb, errcb);
        };

        // createRespo
        github.createRepos = function (cb, errcb) {
            github.httpRequest("POST", "/user/repos", {name:this.defalultRepoName}, cb, errcb);
        };
        // delete repos
        github.deleteRepos = function (repoName, cb, errcb) {
            var url = "/repos/" + this.githubName + '/' + this.defalultRepoName;
            github.httpRequest("DELETE", url, {}, cb, errcb);
        };

        // content operations
        // actions: CREATE UPDATE READ DELETE
        github.fileCURD = function (method, data, err, errcb) {
            var url = '/repos/' + this.githubName + '/' + this.defalultRepoName + '/contents/' + data.path;
            github.httpRequest(method, url, data, err, errcb);
        };
        // writeFile
        github.writeFile = function (data, err, errcb) {
            var self = this;
            self.getFile({path:data.path}, function (result) {
                //console.log(result);
                data.sha = result.sha;
                self.fileCURD('PUT',data,err, errcb);
            }, function () {
                self.fileCURD('PUT', data,err, errcb);
            });
        }
        // read file
        github.getFile = function (data, err, errcb) {
            this.fileCURD("GET", data, err, errcb);
        };
        // deleteFile
        github.deleteFile = function (data, err, errcb) {
            var self = this;
            self.getFile(data, function (result) {
                data.sha = result.sha;
                self.fileCURD("DELETE", data, err, errcb);
            });
        };
        // rollbackFile
        github.rollbackFile = function (ref, path, message, cb, errcb) {
            var self = this;
            var data={ref:ref, path:path}

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
            github.httpRequest('GET', url, {}, cb, errch);
        };

        // commit 
        github.listCommits = function (data, cb, errcb) {
            var url = '/repos/' + this.githubName + '/' + this.defalultRepoName + '/commits';
            github.httpRequest('GET', url, data, cb, errcb);
        };
        github.getSingleCommit = function (sha, cb, errcb) {
            var url = '/repos/' + this.githubName + '/' + this.defalultRepoName + '/commits/'+sha;
            github.httpRequest('GET', url, {}, cb, errcb);
        };

        return {
            github:github,
            init: function (githubToken, githubName, defaultRepoName, cb, errcb) {
                //console.log(githubToken);
                if (github.inited) {
                    cb && cb();
                    return;
                }

                github.githubToken = githubToken;
                github.githubName = githubName;
                github.defalultRepoName = defaultRepoName || 'wikicraftDataSource';
                github.defaultHttpHeader['Authorization'] = githubToken.token_type + ' ' + githubToken.access_token; // auth 或 使用 ?access_token= githubToken.access_token
                // 包装成功回调，用于获取用户名
                var getGithubName = function (data) {
                    if (!githubName) {
                        github.getUser(function (profile) {
                            github.githubName = profile.login;
                            github.inited = true;
                            cb && cb(data);
                        }, errcb);
                    } else {
                        github.inited = true;
                        cb && cb(data);
                    }
                };
                // 会话期记录是否已存在数据源库，避免重复请求
                if (!storage.sessionStorageGetItem('githubRepoExist')){
                    github.getRepos(getGithubName, function (response) {
                        console.log(response);
                        storage.sessionStorageSetItem('githubRepoExist', true);
                        github.createRepos(getGithubName, errcb);
                    });
                } else if (!github.githubName) {  // 库存在用户名没有获取到
                    getGithubName();
                } else {                            // 没有请求 直接回调
                    cb && cb();
                }
            },
            isInited: function () {
                return github.inited;
            },
            deleteRepos: function (cb, errcb) {
                github.deleteRepos(cb, errcb);
            },
            setDefaultRepo: function (repoName) {
                github.defalultRepoName = repoName;
            },
            writeFile: function (path, content, message, cb, errcb) {
                github.writeFile({path:path, message:message, content:Base64.encode(content)}, cb, errcb);
            },
            rollbackFile: function (ref, path, message, cb, errcb) {
                github.rollbackFile(ref, path, message, cb, errcb);
            },
            getContent: function (path, cb, errcb) {
                this.getFile(path, function (data) {   // this.getFile 已做 base64解码
                    cb && cb(data.content);
                }, errcb)
            },
            getFile: function (path, cb, errcb) {
                github.getFile({path:path}, function (data) {
                    data.content = data.content && Base64.decode(data.content);
                    cb && cb(data);
                }, errcb);
            },
            getSha:function (path, cb, errcb) {
                this.getFile(path, cb, errcb);
            },
            uploadImage: function (path, content, cb, errcb) {
                path = 'images/' + path;
                this.writeFile(path, content, 'upload image:'+ path, function(){
                    cb && cb('#'+path);
                }, errcb);
            },
            deleteFile: function (path, message, cb, errcb) {
                github.deleteFile({path:path, message:message}, cb , errcb);
            },
            getTree: function (bRecursive, cb, errcb) {
                github.getTree(cb, errcb)
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