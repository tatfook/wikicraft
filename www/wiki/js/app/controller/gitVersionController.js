/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app','util', 'storage'], function (app, util, storage) {
   return function ($scope, $state, Account) {
       const github = ProjectStorageProvider.getDataSource('github');
       console.log("gitVersionCtrl");
       $scope.dtStartOpened = false;
       $scope.dtEndOpened = false;
       $scope.filelist = [];
       $scope.commits = [];

       if (!Account.isAuthenticated()) {
           $state.go("login");
           return;
       }
       var user = Account.getUser();
       github.init({
           //username: '765485868@qq.com',
           //password: 'wxa765485868',
           token:user.githubToken,
       }, function (error) {
           init();
       });
       // 获得git文件列表
       function init() {
           github.getTree('master', true, function (error, result, request) {
               var filelist = []
               for(var i = 0; result && i < result.length; i++) {
                   filelist.push({path:result[i].path});
               }
               $scope.filelist = filelist;
           });
       }

       $scope.dtStartOpen = function () {
           $scope.dtStartOpened = !$scope.dtStartOpened;
       }
       $scope.dtEndOpen = function () {
           $scope.dtEndOpened = !$scope.dtEndOpened;
       }

       $scope.submit = function () {
           var params = {
               sha:$scope.sha,
               path:$scope.path,
               author:undefined,
               since:$scope.dtStart && ($scope.dtStart.toLocaleDateString().replace(/\//g,'-') +'T00:00:00Z'),
               until:$scope.dtEnd && ($scope.dtEnd.toLocaleDateString().replace(/\//g,'-') +'T23:59:59Z'),
           };
           console.log(params);
           github.listCommits(params, function (error, result, request) {
               result = result || [];
               var commits = [];
               for (var i = 0; i < result.length; i++) {
                   commits.push({sha:result[i].sha, message:result[i].commit.message, date:result[i].commit.committer.date, html_url:result[i].html_url});
               }
               console.log(commits);
               $scope.commits = commits;
               $scope.$apply();
           });
       }

       $scope.viewCommit = function (commit) {
           window.open(commit.html_url);
       }

       $scope.rollbackFile = function (commit) {
           github.getSingleCommit(commit.sha, function (error, result, request) {
               if (error) {
                   console.log(error);
                   return;
               }
               console.log(result);
               // 回滚文件
               for(var i = 0; i < result.files.length; i++) {
                   github.rollbackFile(commit.sha, result.files[i].filename, 'rollback file: ' + result.files[i].filename)
               }
           });
       }
       // 路径过滤
       $scope.pathSelected =function ($item, $model) {
           $scope.path = $item.path;
       }
   }
});