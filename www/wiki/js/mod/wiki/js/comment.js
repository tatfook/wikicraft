/**
 * Created by wuxiangan on 2017/2/6.
 */

define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/comment.html',
], function (app, util, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("commentController", ['$scope', '$rootScope', 'Account', function ($scope, $rootScope, Account) {
            $scope.user = Account.getUser();
            $scope.isAuthenticated = Account.isAuthenticated();

            var path = util.parseUrl().pathname;
            var params = path.split("/");
            var urlObj = $rootScope.urlObj;

            util.http("POST", config.apiUrlPrefix + "website/getDetailInfo", {
                username: params[1],
                sitename: params[2],
                pagename: params[3],
                userId: $rootScope.user && $rootScope.user._id,
            }, function (data) {
                var currentScope = [];
                data = data || {};
               
                currentScope.userinfo = data.userinfo;
                currentScope.siteinfo = data.siteinfo;

                render(currentScope);
            });

            function render(currentScope) {
                $scope.comment = { url: util.parseUrl().pathname, websiteId: currentScope.siteinfo._id, userId: $rootScope.user._id };

                $scope.submitComment = function () {
                    //$scope.isAuthenticated = true;
                    $scope.tipInfo = "";
                    if (!$scope.isAuthenticated) {
                        alert("登陆后才能评论!")
                        return;
                    }

                    $scope.comment.content = util.stringTrim($scope.comment.content);
                    if (!$scope.comment.content || $scope.comment.content.length == 0) {
                        return;
                    }
                    var isSensitive = false;
                    config.services.sensitiveTest.checkSensitiveWord($scope.comment.content, function (foundWords, replacedStr) {
                        if (foundWords.length > 0){
                            isSensitive = true;
                            console.log("包含敏感词:" + foundWords.join("|"));
                            return false;
                        }
                    });
                    if (isSensitive){
                        $scope.tipInfo="您输入的内容不符合互联网安全规范，请修改";
                        return;
                    }
                    util.post(config.apiUrlPrefix + 'website_comment/create', $scope.comment, function (data) {
                        $scope.comment.content = "";
                        console.log(data);
                        $scope.getCommentList();
                    });
                }

                $scope.getCommentList = function () {
                    util.post(config.apiUrlPrefix + 'website_comment/getByPageUrl', { url: util.parseUrl().pathname, pageSize:10000000 }, function (data) {
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
            }
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});
/*
 ```@wiki/js/comment
 ```
 */