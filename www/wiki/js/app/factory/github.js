/**
 * Created by wuxiangan on 2016/12/29.
 */

define([
    'app',
    'helper/storage',
    'js-base64'
], function (app, storage) {
    app.factory('github', ['$http', function ($http) {
        var github = {
            inited: false,
            githubName: '',
            defalultRepoName: 'keepworkDataSource',
            apiBase: 'https://api.github.com',
            defaultHttpHeader: {
                'Accept': 'application/vnd.github.full+json',  // 这个必须有
                //'User-Agent':'Satellizer',
            },
        };

        // http请求
        github.httpRequest = function (method, url, data, cb, errcb) {
            var config = {
                method: method,
                url: github.apiBase + url,
                headers: github.defaultHttpHeader,
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
            github.httpRequest('GET', '/user', {}, cb, errcb);
        };

        // repos operation
        // listRepos
        github.listRepos = function (cb, errcb) {
            var url = '/user/repos';
            github.httpRequest("GET", url, {affiliation: 'owner'}, cb, errcb);
        };

        github.getRepos = function (cb, errcb) {
            var url = '/repos/' + github.githubName + '/' + github.defalultRepoName;
            github.httpRequest('GET', url, {}, cb, errcb);
        };

        // createRespo
        github.createRepos = function (cb, errcb) {
            github.httpRequest("POST", "/user/repos", {name: github.defalultRepoName}, cb, errcb);
        };

        // delete repos
        github.deleteRepos = function (cb, errcb) {
            var url = "/repos/" + github.githubName + '/' + github.defalultRepoName;
            github.httpRequest("DELETE", url, {}, cb, errcb);
        };

        // 设置默认库
        github.setDefaultRepo = function (repoName, cb, errcb) {
            github.defalultRepoName = repoName || 'keepworkDataSource';
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
        }

        // content operations
        // actions: CREATE UPDATE READ DELETE
        github.fileCURD = function (method, data, cb, errcb) {
            var url = '/repos/' + github.githubName + '/' + github.defalultRepoName + '/contents/' + data.path;
            github.httpRequest(method, url, data, cb, errcb);
        };

        // rollbackFile
        github.rollbackFile = function (ref, path, message, cb, errcb) {
            var self = github;
            var data = {ref: ref, path: path}

            self.getFile(data, function (file) {
                data.ref = undefined;
                data.content = file.content;
                data.message = message;
                self.writeFile(data, cb, errcb);
            }, errcb)
        };

        // tree
        github.getTree = function (bRecursive, cb, errch) {
            var url = '/repos/' + github.githubName + '/' + github.defalultRepoName + '/git/trees/master' + (bRecursive ? '?recursive=1' : '');
            github.httpRequest('GET', url, {}, function(data) {
                cb && cb(data.tree);
            }, errch);
        };

        // commit 
        github.listCommits = function (data, cb, errcb) {
            var url = '/repos/' + github.githubName + '/' + github.defalultRepoName + '/commits';
            github.httpRequest('GET', url, data, cb, errcb);
        };

        github.getSingleCommit = function (sha, cb, errcb) {
            var url = '/repos/' + github.githubName + '/' + github.defalultRepoName + '/commits/' + sha;
            github.httpRequest('GET', url, {}, cb, errcb);
        };



        github.init = function (dataSource, cb, errcb) {
            var self = github;
            if (github.inited) {
                cb && cb();
                return;
            }

            if (!dataSource.dataSourceUsername || !dataSource.dataSourceToken || !dataSource.apiBaseUrl) {
                errcb && errcb()
                return;
            }

            github.type = dataSource.type;
            github.githubToken = dataSource.dataSourceToken;
            github.githubName = dataSource.dataSourceUsername;
            github.defalultRepoName = dataSource.projectName || 'keepworkDataSource';
            github.defaultHttpHeader['Authorization'] = ' token ' + github.githubToken;
            github.apiBase = dataSource.apiBaseUrl;

            self.setDefaultRepo(github.defalultRepoName, function (data) {
                github.inited = true;
                cb && cb(data);
            }, errcb);
        }

        github.isInited = function () {
            return github.inited;
        }

        github.getDataSourceType = function () {
            return github.type;
        }
        github.getContentUrlPrefix = function (params) {
            return github.apiBase + '/' + github.githubName + '/' + github.defalultRepoName + '/blob/master/' + params.path;
        }

        github.getRawContentUrlPrefix = function (params) {
            return 'https://raw.githubusercontent.com/' + github.githubName + '/' + github.defalultRepoName + '/master/' + params.path;
        }

        // writeFile
        github.writeFile = function (data, cb, errcb) {
            data.content = Base64.encode(data.content);
            data.message = data.message || "keepwork commit";
            var self = github;
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
            github.fileCURD("GET", data, function (data) {
                //console.log(data)
                data.content = data.content && Base64.decode(data.content);
                cb && cb(data);
            }, errcb);
        };
        // deleteFile
        github.deleteFile = function (data, cb, errcb) {
            var self = github;
            self.getFile(data, function (result) {
                data.sha = result.sha;
                self.fileCURD("DELETE", data, cb, errcb);
            });
        };

        // params: path
        github.getContent = function (params, cb, errcb) {
            github.getFile(params, function (data) {   // github.getFile 已做 base64解码
                cb && cb(data.content);
            }, errcb)
        }
        
        github.getRawContent = function () {
            
        }

        github.uploadImage = function (params, cb, errcb) {
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
            var data = {path: path, message: 'upload image:' + path, content: content};
            github.getFile({path: data.path}, function (result) {
                data.sha = result.sha;
                github.fileCURD('PUT', data, function(data){
                    cb && cb(data.content.download_url);
                }, errcb);
            }, function () {
                github.fileCURD('PUT', data, function(data){
                    cb && cb(data.content.download_url);
                }, errcb);
            });
        }

        return function() {
            return angular.copy(github);
        }
    }]);
});