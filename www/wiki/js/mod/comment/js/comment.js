/**
 * Created by wuxiangan on 2017/2/6.
 */

define(['app', 'helper/util','text!wikimod/comment/html/comment.html'], function (app, util, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("commentController", ['$scope', 'Account', function ($scope, Account) {
            $scope.user = Account.getUser();
            $scope.isAuthenticated = Account.isAuthenticated();
            //$scope.tipInfo = "登录后才能评论!!!";
            //$scope.comment = {pageId:$scope.pageinfo._id, websiteId:$scope.siteinfo._id, userId:$scope.user._id};
            $scope.comment = {pageId:1, websiteId:1, userId:1};

            $scope.submitComment = function () {
                $scope.isAuthenticated = true;
                if (!$scope.isAuthenticated) {
                    alert("登陆后才能评论!!!")
                    return ;
                }
                $scope.comment.content = util.stringTrim($scope.comment.content);
                if (!$scope.comment.content || $scope.comment.content.length == 0) {
                    return ;
                }
                util.post(config.apiUrlPrefix + 'website_comment/create', $scope.comment, function (data) {
                    console.log(data);
                    $scope.getCommentList();
                });
            }

            $scope.getCommentList = function () {
                util.post(config.apiUrlPrefix + 'website_comment/getByPageId',{pageId:1}, function (data) {
                    $scope.commentObj = data;
                });
            }

            $scope.deleteComment = function (comment) {
                util.post(config.apiUrlPrefix + 'website_comment/deleteById', comment, function (data) {
                    $scope.getCommentList();
                })
            }

            function init() {
                $scope.getCommentList();
            }

            init();
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});