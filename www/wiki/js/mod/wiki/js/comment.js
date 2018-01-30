/**
 * Created by wuxiangan on 2017/2/6.
 */

define([
    'app',
    'helper/util',
    'helper/sensitiveWord',
    'text!wikimod/wiki/html/comment.html',
], function (app, util, sensitiveWord, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("commentController", ['$scope', '$rootScope', 'Account', 'Message', 'modal', function ($scope, $rootScope, Account, Message, modal) {
            $scope.user = Account.getUser();
            $scope.isAuthenticated = Account.isAuthenticated();
            $scope.dateToStandard = function(inputDate) {
                if (!inputDate) {
                    return "";
                }
                var outputDate = "";
                var arrs = inputDate.split(" ");
                outputDate+= arrs[0] + " " + arrs[1].split("-").join(":");
                return outputDate;
            }

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
                var goLogin = function() {
                    modal('controller/loginController', {
                        controller: 'loginController',
                        backdrop:"static"
                    }, function (result) {
                        $scope.isAuthenticated = true;
                        $scope.user = Account.getUser();
                        $scope.comment.userId = $scope.user && $scope.user._id;
                        $scope.submitComment();
                    }, function (result) {
                        // console.log(result);
                    });
                }
                $scope.comment = { 
                    url: util.parseUrl().pathname, 
                    websiteId: currentScope.siteinfo._id, 
                    userId: $scope.user && $scope.user._id 
                };

                $scope.submitComment = function () {
                    $scope.comment.content = util.stringTrim($scope.comment.content);
                    if (!$scope.comment.content || $scope.comment.content.length == 0) {
                        Message.danger("请填写评论内容！");
                        return;
                    }

                    //$scope.isAuthenticated = true;
                    $scope.tipInfo = "";
                    if (!$scope.isAuthenticated) {
                        // alert("登陆后才能评论!");
                        goLogin();
                        return;
                    }

                    // window.x = config.services.realnameVerifyModal();
                    
                    config.services.realnameVerifyModal().then(function() {
                        return sensitiveWord.getAllSensitiveWords($scope.comment.content);
                    }).then(function(results) {
                        var isSensitive = results && results.length;
                        // isSensitive && console.log("包含敏感词:" + results.join("|"));
                        trySaveComment(isSensitive);
                    }).catch(function(error) {
                        // console.log('error');
                    });

                    function trySaveComment(isSensitive) {
                        if (isSensitive) {
                            $scope.tipInfo="您输入的内容不符合互联网安全规范，请修改";
                            $scope.$apply();
                            return;
                        }
                        util.post(config.apiUrlPrefix + 'website_comment/create', $scope.comment, function (data) {
                            $scope.comment.content = "";
                            // console.log(data);
                            $scope.getCommentList();
                        });
                    }
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
