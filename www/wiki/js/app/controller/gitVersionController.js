/**
 * Created by wuxiangan on 2016/12/21.
 */

define([
	'app',
   	'helper/util', 
    'helper/dataSource',
	'text!html/gitVersion.html'
], function (app, util, dataSource, htmlContent) {
    app.registerController('gitVersionController', ['$scope', 'Account', 'Message', function ($scope, Account, Message) {
        $scope.dtStartOpened = false;
        $scope.dtEndOpened = false;
        $scope.filelist = [];
        $scope.commits = [];
        $scope.isModal=true;

        $scope.cancel = function () {
            $scope.$dismiss();
        }

		$scope.$watch('$viewContentLoaded', function(){
			Account.getUser(function(userinfo){
				$scope.user = userinfo;
				var userDataSource = dataSource.getUserDataSource(userinfo.username);
				userDataSource.registerInitFinishCallback(function(){
					init();
				});
			});
		});

        // 获得git文件列表
        function init() {
			var username = $scope.user.username;
			var dataSourceList = dataSource.getDataSourceList($scope.user.username);
			$scope.filelist = [];
			for (var i = 0; i < (dataSourceList || []).length; i++) {
				var siteDataSource = dataSourceList[i];
				siteDataSource.getTree({path:'/'+ username}, function (data) {
					$scope.filelist = $scope.filelist.concat(data || []);
				});
			}
        }

        $scope.dtStartOpen = function () {
            $scope.dtStartOpened = !$scope.dtStartOpened;
        };
        $scope.dtEndOpen = function () {
            $scope.dtEndOpened = !$scope.dtEndOpened;
        };

        $scope.submit = function () {
            if (!$scope.path || $scope.path.length == 0) {
                return;
            }
            var params = {
                path: $scope.path,
                since: $scope.dtStart && ($scope.dtStart.toLocaleDateString().replace(/\//g, '-') + 'T00:00:00Z'),
                until: $scope.dtEnd && ($scope.dtEnd.toLocaleDateString().replace(/\//g, '-') + 'T23:59:59Z'),
            };
            //console.log(params);
            var messagePrefix = $scope.isGitlabType ? currentDataSource.getCommitMessagePrefix() : '';
            currentDataSource.listCommits(params, function (data) {
                //console.log(data);
                data = data || [];
                var commits = [];
                for (var i = 0; i < data.length; i++) {
                    var commit = data[i];
                    if ($scope.isGitlabType) {
                        if (commit.message == (messagePrefix + $scope.path)) {
                            commits.push({
                                sha: commit.id,
                                message: commit.message,
                                date: commit.committed_date,
                            });
                        }
                    } else {
                        //. github
                        commits.push({
                            sha: commit.sha,
                            message: commit.commit.message,
                            date: commit.commit.committer.date,
                            html_url: commit.html_url
                        });
                    }
                }
                //console.log(commits);
                $scope.commits = commits;
                //$scope.$apply();
            });
        }

        $scope.viewCommit = function (commit) {
            if ($scope.isGitlabType) {
                window.open(currentDataSource.getCommitUrlPrefix() + 'commit/' +commit.sha)
            } else {
                window.open(commit.html_url);
            }
        }

        $scope.rollbackFile = function (commit) {
            if ($scope.isGitlabType) {
                currentDataSource.getContent({path:$scope.path, ref:commit.sha}, function (data) {
                    currentDataSource.writeFile({path:$scope.path, content:data}, function () {
                        util.http('POST', config.apiUrlPrefix + 'website_pages/updateContentAndShaByUrl', {
                            url: '/' + $scope.path,
                            content: data,
                        }, function () {
                            console.log("rollback success");
                            Message.info("文件回滚成功!!!");
                        });
                    }, function () {
                        console.log("rollback failed");
                    });
                }, function () {
                    console.log("rollback failed");
                });
            } else {
                currentDataSource.getSingleCommit(commit.sha, function (result) {
                    for (var i = 0; i < result.files.length; i++) {
                        (function (sha, filename) {
                            currentDataSource.rollbackFile(sha, filename, 'rollback file:' + filename, function () {
                                console.log("rollback success");
                                currentDataSource.getFile({path: filename}, function (data) {
                                    util.http('POST', config.apiUrlPrefix + 'website_pages/updateContentAndShaByUrl', {
                                        url: filename,
                                        content: data.content,
                                        sha: data.sha
                                    });
                                });
                            }, function () {
                                console.log("rollback failed");
                            });
                        })(commit.sha, result.files[i].filename)
                    }
                });
            }
        }
        // 路径过滤
        $scope.pathSelected = function ($item, $model) {
            $scope.url = $item.url;
        }
    }]);

    return htmlContent;
});
