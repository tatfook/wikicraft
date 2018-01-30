/**
 * Created by wuxiangan on 2017/5/18.
 */

define([
    'app',
    'helper/util',
    'helper/dataSource',
    'text!html/testcdn.html'
], function (app, util, dataSource, htmlContent) {
    app.controller('testcdnController', ['$scope', '$http', 'Account', 'gitlab', function ($scope, $http, Account, gitlab) {
        var hostname = config.isLocal() ? "keepwork.com" : window.location.hostname;
        var domain = hostname.indexOf("keepwork.com") >= 0 ? "keepwork.com" : "qiankunew.com";
        var hostnameList = ['wxa.'+ domain, 'lxz.' + domain];
        var hostnameIndex = 0;
        $scope.defaultHostname = hostname;
        $scope.defaultGitHostname = "git." + domain;
        var urlPrefix = "http://" + (config.isLocal() ? "localhost:8900" : $scope.defaultHostname);
        var gitlabDataSource = undefined;

        var http = function(method, url, params, callback, errorCallback) {
            var httpRespone = undefined;
            // 在此带上认证参数
            if (method == 'POST') {
                httpRespone = $http({method:method,url:url,data:params}); //$http.post(url, params);
            } else {
                httpRespone = $http({method:method,url:url,params:params});
            }
            httpRespone.then(function (response) {
                var data = response.data;
                //console.log(response);
                callback && callback(data);
            }).catch(function (response) {
                errorCallback && errorCallback(response.data);
            });
        }

        $scope.getTestHostname = function () {
            return "TEST." + domain.toUpperCase();
        }
        $scope.getDevHostname = function () {
            return "DEV." + domain.toUpperCase();
        }
        $scope.getHostname = function () {
            return domain.toUpperCase();
        }
        // 更改域名
        $scope.changeHostname = function (hostname) {
            $scope.defaultHostname = hostname || hostnameList[hostnameIndex];
            hostnameIndex++;
            hostnameIndex %= hostnameList.length;
            urlPrefix = "http://" + (config.isLocal() ? "localhost:8900" : $scope.defaultHostname);
        }

        $scope.setTestHostname = function () {
            $scope.changeHostname("test." + domain);
        }
        $scope.setDevHostname = function () {
            $scope.changeHostname("dev." + domain);
        }

        $scope.setHostname = function () {
            $scope.changeHostname(domain);
        }

        $scope.testApi = function () {
            $scope.apiTime = (new Date()).toString();
            http('GET', urlPrefix + '/api/wiki/models/test/get', {},function (data) {
                // console.log("测试API接口请求成功 ", data);
            }, function () {
                // console.log("测试API接口请求失败");
            });
        }

        $scope.updateFileContent = function (filename) {
            http('POST', urlPrefix + '/api/wiki/models/test/updateFileContent', {filename:filename}, function (data) {
                // console.log("更新" + filename + "文件请求成功 ", data);
            }, function () {
                // console.log("更新" + filename + "文件请求失败");
            });
        }

        $scope.testFile = function (filename) {
            http("GET", urlPrefix + '/wiki/test/' + filename, {}, function (data) {
                // console.log("测试"+filename+"文件请求成功 ", data);
            }, function () {
                // console.log("测试"+filename+"文件请求失败");
            });
        }
        
        $scope.testFileWithBust = function (filename, bust) {
            bust = bust || (new Date()).getTime();
            http("GET", urlPrefix + '/wiki/test/'+ filename +'?bust=' + bust, {}, function (data) {
                // console.log("测试"+filename + "?bust=" + bust +"文件请求成功 ", data);
            }, function () {
                // console.log("测试"+filename + "?bust=" + bust +"文件请求失败");
            });
        }

        $scope.updateJsFileBust = function () {
            $scope.jsBust = (new Date()).getTime();
        }
        $scope.updateCssFileBust = function () {
            $scope.cssBust = (new Date()).getTime();
        }
        $scope.testJsFile = function () {
            $scope.jsTime = (new Date()).toString();
            $scope.testFile('cdntest.js');
        }
        $scope.testJsFileWithBust = function () {
            $scope.jsWithBustTime = (new Date()).toString();
            $scope.jsBust || $scope.updateJsFileBust();
            $scope.testFileWithBust('cdntest.js', $scope.jsBust);
        }
        $scope.testCssFile = function () {
            $scope.cssTime = (new Date()).toString();
            $scope.testFile('cdntest.css');
        }
        $scope.testCssFileWithBust = function () {
            $scope.cssWithBustTime = (new Date()).toString();
            $scope.cssBust || $scope.updateCssFileBust();
            $scope.testFileWithBust('cdntest.css', $scope.cssBust);
        }

        var gitFilePath = '/test/page.md';
        var gitFileConentIndex = 0;
        var gitFileContentList = [
            "git test file content 1",
            "git test file content 2",
            "git test file content 3",
        ];

        $scope.updateGitFile = function () {
            gitFileConentIndex++;
            gitFileConentIndex %= gitFileContentList.length;
            // console.log("当前git文件内容为:" + gitFileContentList[gitFileConentIndex]);
        };

        $scope.uploadFile = function () {
            if (!gitlabDataSource) {
                // console.log("数据源不可用");
                return;
            }
            $scope.gitUploadTime = (new Date()).toString();
            gitlabDataSource.writeFile({path:gitFilePath, content:gitFileContentList[gitFileConentIndex]}, function () {
                // console.log("上传git文件成功,文件内容:" + gitFileContentList[gitFileConentIndex]);
            }, function () {
                // console.log("上传git文件失败");
            })
        };

        $scope.downloadFile = function () {
            if (!gitlabDataSource) {
                // console.log("数据源不可用");
                return;
            }

            $scope.gitDownloadTime = (new Date()).toString();
            gitlabDataSource.setLastCommitId("master");
            gitlabDataSource.getRawContent({path:gitFilePath}, function (data) {
            //    console.log("master获取文件内容为:"+data);
            }, function () {
                // console.log("master获取文件失败");
            });
        }
        $scope.updateGitFileCommitId = function () {
            if (!gitlabDataSource) {
                // console.log("数据源不可用");
                return;
            }
            gitlabDataSource.getLastCommitId(function (data) {
                $scope.lastCommitId = data;
                // console.log("更新commitId成功:", $scope.lastCommitId);
            }, function () {
                // console.log("更新commitId失败");
            });
        }
        $scope.openGitFile = function () {
            if (!gitlabDataSource) {
                // console.log("数据源不可用");
                return;
            }
            //gitlabDataSource.setLastCommitId("master");
            window.open(gitlabDataSource.getContentUrlPrefix({path:gitFilePath}));
        }

        $scope.openGitFileWithCommitId = function () {
            if (!gitlabDataSource) {
                // console.log("数据源不可用");
                return;
            }
            window.open(gitlabDataSource.getContentUrlPrefix({path:gitFilePath}));
        }

        $scope.downloadFileWithCommitId = function () {
            if (!gitlabDataSource) {
                // console.log("数据源不可用");
                return;
            }
            $scope.gitDownloadWithShaTime = (new Date()).toString();
            gitlabDataSource.setLastCommitId($scope.lastCommitId || "master");
            gitlabDataSource.getRawContent({path:gitFilePath}, function (data) {
                // console.log("commitId("+ ($scope.lastCommitId || "master")+ ")获取文件内容为:"+data);
            }, function () {
                // console.log("commitId("+ ($scope.lastCommitId || "master") + ")获取文件失败");
            });
        }

        function init() {
            // console.log("contactController");
            
            Account.getUser(function (userinfo) {
                var DataSource = undefined;
                for (var i = 0; i < userinfo.dataSource.length; i++) {
                    if (userinfo.dataSource[i].name == "内置gitlab") {
                        DataSource = userinfo.dataSource[i];
                        break;
                    }
                }
                DataSource.rawBaseUrl = "http://" + $scope.defaultGitHostname;
                DataSource.apiBaseUrl = "http://" + $scope.defaultGitHostname + '/api/v4';

                gitlabDataSource = gitlab();
                gitlabDataSource.init(DataSource, function () {
                //    console.log("内置数据源初始化成功");
                }, function () {
                    // console.log("内置数据源初始化失败");
                });
            });

        }

        $scope.$watch('$viewContentLoaded', function () {
            Account.ensureAuthenticated(function () {
                init();
            });
        });
    }]);

    return htmlContent;
});