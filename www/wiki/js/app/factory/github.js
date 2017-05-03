/**
 * Created by wuxiangan on 2016/12/29.
 */

define([
    'app',
    'helper/dataSource',
    'helper/storage',
    'js-base64'
], function (app, dataSource, storage) {
    app.factory('github', ['$http', function ($http) {
        var github = {
            inited: false,
            githubName: '',
            defaultRepoName: 'keepworkDataSource',
            apiBaseUrl: 'https://api.github.com',
            rawBaseUrl:'',
            rootPath:'',
            defaultHttpHeader: {
                'Accept': 'application/vnd.github.full+json',  // 这个必须有
            },
        };

        // http请求
        github.httpRequest = function (method, url, data, cb, errcb) {
            var config = {
                method: method,
                url: github.apiBaseUrl + url,
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
            var url = '/repos/' + github.githubName + '/' + github.defaultRepoName;
            github.httpRequest('GET', url, {}, cb, errcb);
        };

        // createRespo
        github.createRepos = function (cb, errcb) {
            github.httpRequest("POST", "/user/repos", {name: github.defaultRepoName}, cb, errcb);
        };

        // delete repos
        github.deleteRepos = function (cb, errcb) {
            var url = "/repos/" + github.githubName + '/' + github.defaultRepoName;
            github.httpRequest("DELETE", url, {}, cb, errcb);
        };

        // 设置默认库
        github.setDefaultRepo = function (repoName, cb, errcb) {
            github.defaultRepoName = repoName || 'keepworkDataSource';
            //console.log(storage.sessionStorageGetItem('githubRepoExist'));
            // 会话期记录是否已存在数据源库，避免重复请求
            var repoKey = 'githubRepoExist_' + github.defaultRepoName;
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
            var url = '/repos/' + github.githubName + '/' + github.defaultRepoName + '/contents/' + data.path;
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
        github.getTree = function (params, cb, errch) {
            var path = github.getLongPath(params);
            var recursive = params.recursive == undefined ? true : params.recursive;
            var sitename = path.substring(path.lastIndexOf('/') + 1);
            var sha = undefined;

            //console.log(path, sitename, path.substring(0, path.lastIndexOf('/')));
            github.getFile({path:path.substring(0, path.lastIndexOf('/'))}, function (data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].type == "dir" && data[i].name == sitename){
                        sha = data[i].sha;
                    }
                }

                if (!sha) {
                    errch && errch();
                    return;
                }

                var url = '/repos/' + github.githubName + '/' + github.defaultRepoName + '/git/trees/'+ sha + (recursive ? '?recursive=1' : '');
                github.httpRequest('GET', url, {}, function(data) {
                    data = data.tree;
                    var pagelist = [];
                    for (var i = 0; i < data.length; i++) {
                        var path = params.path + '/' + data[i].path;
                        var page = {};
                        var suffixIndex = path.lastIndexOf(".md");
                        // 不是md文件不编辑
                        if (suffixIndex < 0)
                            continue;

                        page.url = path.substring(github.rootPath.length, path.lastIndexOf('.'));
                        var paths = page.url.split('/');
                        if (paths.length < 3)
                            continue;

                        page.username = paths[1];
                        page.sitename = paths[2];
                        page.pagename = paths[paths.length-1];

                        pagelist.push(page);
                    }
                    cb && cb(pagelist);
                }, errch);
            }, errch)
        };

        // commit 
        github.listCommits = function (data, cb, errcb) {
            var url = '/repos/' + github.githubName + '/' + github.defaultRepoName + '/commits';
            github.httpRequest('GET', url, data, cb, errcb);
        };

        github.getSingleCommit = function (sha, cb, errcb) {
            var url = '/repos/' + github.githubName + '/' + github.defaultRepoName + '/commits/' + sha;
            github.httpRequest('GET', url, {}, cb, errcb);
        };

        github.getLongPath = function (params) {
            return github.rootPath + (params.path || "");
        }

        github.init = function (dataSource, cb, errcb) {
            var self = github;
            if (github.inited) {
                cb && cb();
                return;
            }

            if (!dataSource.dataSourceUsername || !dataSource.dataSourceToken || !dataSource.apiBaseUrl || !dataSource.rawBaseUrl) {
                console.log("data source init failed!!![params errors]");
                errcb && errcb();
                return;
            }

            github.type = dataSource.type || "github";
            github.githubToken = dataSource.dataSourceToken;
            github.githubName = dataSource.dataSourceUsername;
            github.defaultRepoName = dataSource.projectName || github.defaultRepoName;
            github.defaultHttpHeader['Authorization'] = ' token ' + github.githubToken;
            github.apiBaseUrl = dataSource.apiBaseUrl;
            github.rawBaseUrl = dataSource.rawBaseUrl || 'https://raw.githubusercontent.com';
            github.rootPath = dataSource.rootPath || '';

            self.setDefaultRepo(github.defaultRepoName, function (data) {
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
            return github.apiBaseUrl + '/' + github.githubName + '/' + github.defaultRepoName + '/blob/master' + github.getLongPath(params);
        }

        github.getRawContentUrlPrefix = function (params) {
            return github.rawBaseUrl + '/' + github.githubName + '/' + github.defaultRepoName + '/master' + github.getLongPath(params);
        }

        // writeFile
        github.writeFile = function (params, cb, errcb) {
            params.content = Base64.encode(params.content);
            params.message = params.message || "keepwork commit";
            params.path = github.getLongPath(params).substring(1);
            github.fileCURD("GET",{path: params.path}, function (result) {
                //console.log(result);
                params.sha = result.sha;
                github.fileCURD('PUT', params, cb, errcb);
            }, function () {
                github.fileCURD('PUT', params, cb, errcb);
            });
        }
        // read file
        github.getFile = function (params, cb, errcb) {
            params.path = github.getLongPath(params).substring(1);
            github.fileCURD("GET", {path:params.path}, function (data) {
                //console.log(data)
                data.content = data.content && Base64.decode(data.content);
                cb && cb(data);
            }, errcb);
        };
        // deleteFile
        github.deleteFile = function (params, cb, errcb) {
            params.message = params.message || "keepwork commit";
            params.path = github.getLongPath(params).substring(1);
            github.fileCURD("GET", {path:params.path}, function (result) {
                data.sha = result.sha;
                github.fileCURD("DELETE", data, cb, errcb);
            });
        };

        // params: path
        github.getContent = function (params, cb, errcb) {
            github.getFile(params, function (data) {   // github.getFile 已做 base64解码
                cb && cb(data.content);
            }, errcb)
        }
        
        github.getRawContent = function (params, cb, errcb) {
            var url = github.getRawContentUrlPrefix(params);
            $http({
                method: 'GET',
                url: url,
                headers:{
                    //'pragma':'no-cache',
                    //'cache-control': 'no-cache',
                },
                skipAuthorization: true, // this is added by our satellizer module, so disable it for cross site requests.
            }).then(function (response) {
                console.log(response);
                cb && cb(response.data);
            }).catch(function (response) {
                console.log(response);
                errcb && errcb(response);
            });
        }

        github.uploadImage = function (params, cb, errcb) {
            //params path, content
            var path = params.path;
            var content = params.content;
            if (!path) {
                path = 'img_' + (new Date()).getTime();
            }
            path = '/images/' + path;
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

            var data = {
                path: github.getLongPath({path:path}).substring(1),
                message:"keepwork upload image:" + path,
                content: content
            };
            github.fileCURD("GET", {path:data.path}, function (result) {
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

        var githubFactory = function() {
            return angular.copy(github);
        }

        dataSource.registerDataSourceFactory("github", githubFactory);
        
        return githubFactory;
    }]);
});