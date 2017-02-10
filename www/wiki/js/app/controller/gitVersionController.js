/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app','helper/util','text!html/gitVersion.html'], function (app, util, htmlContent) {
   app.registerController('gitVersionController', ['$scope', '$state', 'Account', 'github', function ($scope, $state, Account,github) {
       $scope.dtStartOpened = false;
       $scope.dtEndOpened = false;
       $scope.filelist = [];
       $scope.commits = [];

       Account.ensureAuthenticated();

       var user = Account.getUser();
       github.init(user.githubToken, user.githubName, undefined, function () {
           init();
       }, function (response) {
           console.log(response);
           console.log("github init failed!!!");
       });

       // 获得git文件列表
       function init() {
           github.getTree(true, function (data) {
               var filelist = []
               for(var i = 0; i < data.tree.length; i++) {
                   if (data.tree[i].type == "tree" || data.tree[i].path.indexOf('images/') == 0) {
                       continue;
                   }
                   filelist.push({path:data.tree[i].path});
               }
               $scope.filelist = filelist;
           });
       }

       $scope.dtStartOpen = function () {
           $scope.dtStartOpened = !$scope.dtStartOpened;
       };
       $scope.dtEndOpen = function () {
           $scope.dtEndOpened = !$scope.dtEndOpened;
       };

       $scope.submit = function () {
           if (!$scope.path || $scope.path.length == 0) {
               return ;
           }
           var params = {
               sha:$scope.sha,
               path:$scope.path,
               author:undefined,
               since:$scope.dtStart && ($scope.dtStart.toLocaleDateString().replace(/\//g,'-') +'T00:00:00Z'),
               until:$scope.dtEnd && ($scope.dtEnd.toLocaleDateString().replace(/\//g,'-') +'T23:59:59Z'),
           };
           console.log(params);
           github.listCommits(params, function (result) {
               result = result || [];
               var commits = [];
               for (var i = 0; i < result.length; i++) {
                   commits.push({sha:result[i].sha, message:result[i].commit.message, date:result[i].commit.committer.date, html_url:result[i].html_url});
               }
               console.log(commits);
               $scope.commits = commits;
               //$scope.$apply();
           });
       }

       $scope.viewCommit = function (commit) {
           window.open(commit.html_url);
       }
       
       $scope.rollbackFile = function (commit) {
           github.getSingleCommit(commit.sha, function (result) {
               console.log(result.files);
               for(var i = 0; i < result.files.length; i++) {
                   (function (sha, filename) {
                       github.rollbackFile(sha, filename, 'rollback file:' + filename, function () {
                           console.log("rollback success");
                           github.getFile(filename, function (data) {
                              util.http('POST', config.apiUrlPrefix + 'website_pages/updateContentAndShaByUrl', {url:filename, content:data.content, sha:data.sha});
                           });
                       }, function () {
                           console.log("rollback failed");
                       });   
                   })(commit.sha, result.files[i].filename)
               }
           });
       }
       // 路径过滤
       $scope.pathSelected =function ($item, $model) {
           $scope.path = $item.path;
       }
   }]);

    return htmlContent;
});