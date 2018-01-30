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

		var currentDataSource = undefined;

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
            $scope.selected = $scope.currentPage;
            $scope.selectItem = $scope.currentPage;
            $scope.dtEnd = new Date();
            $scope.submit();
			var username = $scope.user.username;
			var dataSourceList = dataSource.getDataSourceList($scope.user.username);
			$scope.filelist = [];
			for (var i = 0; i < (dataSourceList || []).length; i++) {
				var siteDataSource = dataSourceList[i];
				siteDataSource.getTree({path:'/'+ username}, function (data) {
					for (var i = 0; i < (data || []).length; i++) {
						if (data[i].pagename.indexOf(".gitignore") >= 0) {
							continue;
						}
						$scope.filelist.push(data[i]);
                    }
					//$scope.filelist = $scope.filelist.concat(data || []);
				});
			}
			//util.post(config.apiUrlPrefix + "website/getAllByUserId", {userId:$scope.user._id}, function(data){
				//$scope.siteList = data || [];	
			//});
        }

        $scope.dtStartOpen = function () {
            $scope.dtStartOpened = !$scope.dtStartOpened;
        };
        $scope.dtEndOpen = function () {
            $scope.dtEndOpened = !$scope.dtEndOpened;
        };

        $scope.submit = function () {
			if (!$scope.selectItem) {
				return;
			}

			currentDataSource = dataSource.getDataSource($scope.selectItem.username, $scope.selectItem.sitename);
            //if (!$scope.selectSitename) {
                //return;
            //}
			//var currentDataSource = dataSource.getDataSource($scope.user.username, $scope.selectSitename);
			if (!currentDataSource) {
				return;
			}
            var params = {
                //path: $scope.selectItem.url + config.pageSuffixName,
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
                    if (currentDataSource.getDataSourceType() == "gitlab") {
						if (commit.message.indexOf($scope.selectItem.url.substring(1) + config.pageSuffixName) >= 0) {
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
			if (!currentDataSource) 
				return;

			if (currentDataSource.getDataSourceType() == "gitlab") {
				window.open(currentDataSource.getCommitUrlPrefix({sha:commit.sha}));
            } else {
                window.open(commit.html_url);
            }
        }

        $scope.rollbackFile = function (commit) {
			if (!currentDataSource) 
				return;
			var path = $scope.selectItem.url + config.pageSuffixName;
			if (currentDataSource.getDataSourceType() == "gitlab") {
                currentDataSource.getContent({path:path, ref:commit.sha}, function (data) {
                    currentDataSource.writeFile({path:path, content:data}, function () {
						Message.info("文件回滚成功!!!");
                    }, function () {
						Message.info("文件回滚失败!!!");
                    });
                }, function () {
					Message.info("文件回滚失败!!!");
                });
            } else {
                currentDataSource.getSingleCommit(commit.sha, function (result) {
                    for (var i = 0; i < result.files.length; i++) {
                        (function (sha, filename) {
                            currentDataSource.rollbackFile(sha, filename, 'rollback file:' + filename, function () {
                                // console.log("rollback success");
                                currentDataSource.getFile({path: filename}, function (data) {
                                    util.http('POST', config.apiUrlPrefix + 'website_pages/updateContentAndShaByUrl', {
                                        url: filename,
                                        content: data.content,
                                        sha: data.sha
                                    });
                                });
                            }, function () {
                                // console.log("rollback failed");
                            });
                        })(commit.sha, result.files[i].filename)
                    }
                });
            }
        }

        // 路径过滤
        $scope.pathSelected = function ($item, $model) {
            $scope.selectItem = $item;
        }
    }]);

    return htmlContent;
});
