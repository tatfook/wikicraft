/**
 * Created by wuxiangan on 2017/3/24.
 */

define([
    'app',
    'helper/util',
    'helper/dataSource',
    'helper/storage',
    'js-base64',
], function (app, util, dataSource, storage) {
    function _encodeURIComponent(url) {
        return encodeURIComponent(url);
        //return encodeURIComponent(url).replace(/\./g,'%2E')
    }

    app.factory('gitlab', ['$http', function ($http) {
        var gitlab = {
            inited: false,                                          // is already init
            username: '',   // gitlab 用户名                        // gitlab username
            lastCommitId: "master",                                // 最新commitId  替代master  用于cdn加速
            projectId: undefined,                                  // project id
            projectName: 'keepwork_datasource',                   // repository name
            apiBaseUrl: 'http://git.keepwork.com/api/v4',     // api base url
            rawBaseUrl: 'http://git.keepwork.com',              // raw base url
            rootPath: '',                                           // 根路径
            httpHeader: {},
        };

        // http请求
        gitlab.httpRequest = function (method, url, data, cb, errcb) {
            //console.log(url);
            var config = {
                method: method,
                url: this.apiBaseUrl + url,
                headers: this.httpHeader,
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

        gitlab.getLongPath = function (params) {
            return gitlab.rootPath + (params.path || "");
        }

        gitlab.getCommitUrlPrefix = function (params) {
            params = params || {};
            return gitlab.rawBaseUrl + '/' + (params.username || gitlab.username) + '/' + (params.projectName || gitlab.projectName).toLowerCase() + gitlab.getLongPath(params);
        }

        gitlab.getRawContentUrlPrefix = function (params) {
            params = params || {};
            return gitlab.rawBaseUrl + '/' + (params.username || gitlab.username) + '/' + (params.projectName || gitlab.projectName).toLowerCase() + '/raw/' + (params.sha || gitlab.lastCommitId) + gitlab.getLongPath(params);
        }

        gitlab.getContentUrlPrefix = function (params) {
            params = params || {};
            return gitlab.rawBaseUrl + '/' + (params.username || gitlab.username) + '/' + (params.projectName || gitlab.projectName).toLowerCase() + '/blob/'+ (params.sha || gitlab.lastCommitId) + gitlab.getLongPath(params);
        }

        // 获得文件列表
        gitlab.getTree = function (params, cb, errcb) {
            var url = '/projects/' + gitlab.projectId + '/repository/tree';
            var path = gitlab.getLongPath(params);
            params.path = path.substring(1);
            params.recursive = params.recursive == undefined ? true : params.recursive;
            gitlab.httpRequest("GET", url, params, function (data) {
                var pagelist = [];
                for (var i = 0; i < data.length; i++) {
                    var path = '/' + data[i].path;
                    var page = {pagename: data[i].name};
                    var suffixIndex = path.lastIndexOf(".md");
                    // 不是md文件不编辑
                    if (suffixIndex < 0)
                        continue;

                    page.url = path.substring(gitlab.rootPath.length, path.lastIndexOf('.'));
                    var paths = page.url.split('/');
                    if (paths.length < 3)
                        continue;

                    page.username = paths[1];
                    page.sitename = paths[2];
                    page.pagename = paths[paths.length - 1];

                    pagelist.push(page);
                }
                cb && cb(pagelist);
            }, errcb);
        }

        // commit
        gitlab.listCommits = function (data, cb, errcb) {
            //data.ref_name = data.ref_name || 'master';
            var url = '/projects/' + gitlab.projectId + '/repository/commits';
            gitlab.httpRequest('GET', url, data, cb, errcb);
        };

        // 获取文件操作的url prefix
        gitlab.getFileUrlPrefix = function () {
            return '/projects/' + gitlab.projectId + '/repository/files/';
        }
        // 获取调教信息前缀 commit message prefix
        gitlab.getCommitMessagePrefix = function () {
            return "keepwork commit: ";
        }

        // 写文件
        gitlab.writeFile = function (params, cb, errcb) {
            params.path = gitlab.getLongPath(params).substring(1);
            var url = gitlab.getFileUrlPrefix() + _encodeURIComponent(params.path);
            params.commit_message = gitlab.getCommitMessagePrefix() + params.path;
            params.branch = params.branch || "master";
            gitlab.httpRequest("GET", url, {path: params.path, ref: params.branch}, function (data) {
                // 已存在
                gitlab.httpRequest("PUT", url, params, function (data) {
                    console.log(data);
                    cb && cb(data);
                }, errcb)
            }, function () {
                gitlab.httpRequest("POST", url, params, cb, errcb)
            });
        }

        // 获取文件
        gitlab.getContent = function (params, cb, errcb) {
            params.path = gitlab.getLongPath(params).substring(1);
            var url = gitlab.getFileUrlPrefix() + _encodeURIComponent(params.path);
            params.ref = params.ref || gitlab.lastCommitId;
            gitlab.httpRequest("GET", url, params, function (data) {
                data.content = data.content && Base64.decode(data.content);
                cb && cb(data.content);
            }, errcb);

            //gitlab.getRawContent(params, cb, errcb);
        }

        // 获取原始内容
        gitlab.getRawContent = function (params, cb, errcb) {
            var _getRawContent = function () {
                var url = gitlab.getRawContentUrlPrefix(params);
                $http({
                    method: 'GET',
                    url: url,
                    skipAuthorization: true, // this is added by our satellizer module, so disable it for cross site requests.
                }).then(function (response) {
                    cb && cb(response.data);
                }).catch(function (response) {
                    errcb && errcb(response);
                });
            }
            // _getRawContent();
            // return;
            var index = params.path.lastIndexOf('.');
            var url = index == -1 ? params.path : params.path.substring(0, index);
            storage.indexedDBGetItem(config.pageStoreName, url, function (page) {
                //console.log(page, url);
                if (page) {
                    cb && cb(page.content);
                } else {
                    _getRawContent();
                    //gitlab.getContent(params, cb, errcb);
                }
            }, function () {
                _getRawContent();
                //gitlab.getContent(params, cb, errcb);
            });
        }

        // 删除文件
        gitlab.deleteFile = function (params, cb, errcb) {
            params.path = gitlab.getLongPath(params).substring(1);
            var url = gitlab.getFileUrlPrefix() + _encodeURIComponent(params.path);
            params.commit_message = gitlab.getCommitMessagePrefix() + params.path;
            params.branch = params.branch || "master";
            gitlab.httpRequest("DELETE", url, params, cb, errcb)
        }

        // 上传图片
        gitlab.uploadImage = function (params, cb, errcb) {
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
                imgType = imgType.match(/image\/([\w]+)/);
                imgType = imgType && imgType[1];
                if (imgType) {
                    path = path + '.' + imgType;
                }
            } else {
                content = content[0];
            }
            //console.log(content);
            gitlab.writeFile({
                path: path,
                message: gitlab.getCommitMessagePrefix() + path,
                content: content,
                encoding: 'base64'
            }, function (data) {
                cb && cb(gitlab.getRawContentUrlPrefix({sha:"master"}) + "/" + data.file_path);
            }, errcb);
        }

        // 初始化
        gitlab.init = function (dataSource, cb, errcb) {
            if (gitlab.inited) {
                cb && cb();
                return;
            }

            gitlab.type = dataSource.type;
            gitlab.username = dataSource.dataSourceUsername;
            gitlab.httpHeader["PRIVATE-TOKEN"] = dataSource.dataSourceToken;
            gitlab.projectName = dataSource.projectName || gitlab.projectName;
            gitlab.apiBaseUrl = dataSource.apiBaseUrl;
            gitlab.rawBaseUrl = dataSource.rawBaseUrl || "http://git.keepwork.com";
            gitlab.rootPath = dataSource.rootPath || '';
            gitlab.lastCommitId = dataSource.lastCommitId || "master";

            if (!dataSource.dataSourceUsername || !dataSource.dataSourceToken || !dataSource.apiBaseUrl || !dataSource.rawBaseUrl) {
                console.log("gitlab data source init failed!!!");
                errcb && errcb();
                return;
            }

            // var _getLastCommitId = function (cb, errcb, finish) {
            //     gitlab.listCommits({}, function (data) {
            //         if (data && data.length > 0){
            //             gitlab.lastCommitId = data[0].id;
            //         }
            //         console.log(gitlab.lastCommitId);
            //         cb && cb();
            //         finish && finish();
            //     }, finish);
            // };

            var createWebhook = function () {
                var hookUrl = config.apiUrlPrefix + "data_source/gitlabWebhook";
                //var hookUrl = "http://dev.keepwork.com/api/wiki/models/data_source/gitlabWebhook";
                var isExist = false;
                gitlab.httpRequest("GET", "/projects/" + gitlab.projectId + "/hooks", {}, function (data) {
                    //console.log(data);
                    for (var i = 0; i < data.length; i++) {
                        //gitlab.httpRequest("DELETE", "/projects/" + gitlab.projectId + "/hooks/" + data[i].id, {});
                        if (data[i].url == hookUrl && data[i].push_events) {
                            isExist = true;
                        }
                    }
                    // return;
                    // 不存在创建
                    if (!isExist) {
                        gitlab.httpRequest("POST", "/projects/" + gitlab.projectId + "/hooks", {
                            url: hookUrl,
                            push_events: true,
                            enable_ssl_verification: false,
                        }, function () {
                            console.log("webhook create success");
                        }, function () {
                            console.log("webhook create failed");
                        });
                    }
                }, function () {

                });
            };

            var updateDataSource = function () {
                if (dataSource.projectName && dataSource.projectId) {
                    return;
                }
                dataSource.projectName = gitlab.projectName;
                dataSource.projectId = gitlab.projectId;
                util.post(config.apiUrlPrefix + 'data_source/upsert', dataSource);
            }

            var getLastCommitId = function (cb, errcb) {
                gitlab.listCommits({}, function (data) {
                    if (data && data.length > 0) {
                        gitlab.lastCommitId = data[0].id;
                    }
                    cb && cb();
                }, errcb)
            }

            var successCallback = function () {
                createWebhook();
                updateDataSource();
            }

            gitlab.httpRequest("GET", "/projects", {search: gitlab.projectName, owned: true}, function (projectList) {
                // 查找项目是否存在
                for (var i = 0; i < projectList.length; i++) {
                    if (projectList[i].name == gitlab.projectName) {
                        gitlab.projectId = projectList[i].id;
                        gitlab.inited = true;
                        successCallback();
                        getLastCommitId(cb, errcb);
                        return;
                    }
                }

                // 不存在则创建项目
                gitlab.httpRequest("POST", "/projects", {
                    name: gitlab.projectName,
                    visibility: 'public',
                    request_access_enabled: true,
                    //public_jobs:true,
                }, function (data) {
                    //console.log(data);
                    gitlab.projectId = data.id;
                    gitlab.inited = true;
                    successCallback();
                    getLastCommitId(cb, errcb);
                }, errcb)
            }, errcb);
        };

        // 是否已经初始化
        gitlab.isInited = function () {
            return gitlab.inited;
        };

        // 获取数据源类型：gitlab
        gitlab.getDataSourceType = function () {
            return gitlab.type;
        };

        // 数据源工厂
        var gitlabFactory = function () {
            return angular.copy(gitlab);
        };

        // 注册数据源构造器
        dataSource.registerDataSourceFactory("gitlab", gitlabFactory);

        return gitlabFactory;
    }]);
});