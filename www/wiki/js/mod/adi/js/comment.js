define([
    'app',
    'helper/util',
    'helper/sensitiveWord',
    'text!wikimod/adi/html/comment.html'
], function (app, util, sensitiveWord, htmlContent) {
    function registerController(wikiblock) {
        app.registerController("commentController", ['$scope', '$rootScope', 'Account', 'Message', 'modal', function ($scope, $rootScope, Account, Message, modal) {
            $scope.editorMode = wikiblock.editorMode;
            
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

            if($scope.editorMode) {
                var path = '/ukinll/first';
                var params = path.split("/");
                var urlObj = $rootScope.urlObj;
                console.log(params)

                util.http("POST", 'http://keepwork.com/api/wiki/models/website/getDetailInfo', {
                    username: params[1],
                    sitename: params[2]
                    // pagename: params[3],
                    // userId: $rootScope.user && $rootScope.user._id,
                }, function (data) {
                    var currentScope = [];
                    data = data || {};
                
                    currentScope.userinfo = data.userinfo;
                    currentScope.siteinfo = data.siteinfo;

                    console.log('*************************************')
                    console.log(currentScope)

                    render(currentScope);
                });

            } else {
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
            }

            function render(currentScope) {
                var goLogin = function() {
                    modal('controller/loginController', {
                        controller: 'loginController',
                        backdrop:"static"
                    }, function (result) {
                        $scope.isAuthenticated = true;
                        $scope.user = Account.getUser();
                        $scope.comment.userId = 18943;
                        $scope.submitComment();
                    }, function (result) {
                        console.log(result);
                    });
                }

                if($scope.editorMode) {
                    $scope.comment = { 
                        url: '/ukinll/first', 
                        websiteId: currentScope.siteinfo._id, 
                        userId: 18943 
                    };
                } else {
                    $scope.comment = { 
                        url: util.parseUrl().pathname, 
                        websiteId: currentScope.siteinfo._id, 
                        userId: $scope.user && $scope.user._id 
                    };
                }

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
                        isSensitive && console.log("包含敏感词:" + results.join("|"));
                        trySaveComment(isSensitive);
                    }).catch(function(error) {
                        console.log('error');
                    });

                    function trySaveComment(isSensitive) {
                        if (isSensitive) {
                            $scope.tipInfo="您输入的内容不符合互联网安全规范，请修改";
                            $scope.$apply();
                            return;
                        }
                        if($scope.editorMode){
                            util.post('http://keepwork.com/api/wiki/models/website_comment/create', $scope.comment, function (data) {
                                $scope.comment.content = "";
                                console.log(data);
                                $scope.getCommentList();
                            });

                        } else {
                            util.post(config.apiUrlPrefix + 'website_comment/create', $scope.comment, function (data) {
                                $scope.comment.content = "";
                                console.log(data);
                                $scope.getCommentList();
                            });
                        }
                    }
                }

                $scope.getCommentList = function () {
                    if($scope.editorMode) {
                        util.post('http://keepwork.com/api/wiki/models/website_comment/getByPageUrl', {
                            url: path,
                            pageSize:10000000
                        }, function (data) {
                            $scope.commentObj = data;
                        });

                    } else {
                        util.post(config.apiUrlPrefix + 'website_comment/getByPageUrl', { url: util.parseUrl().pathname, pageSize:10000000 }, function (data) {
                            $scope.commentObj = data;
                        });
                    }
                }

                $scope.deleteComment = function (comment) {
                    if($scope.editorMode) {
                        util.post('http://keepwork.com/api/wiki/models/website_comment/deleteById', 
                            comment,
                            function (data) {
                                $scope.getCommentList()
                            }
                        )
                    } else {
                        util.post(config.apiUrlPrefix + 'website_comment/deleteById', comment, function (data) {
                            $scope.getCommentList();
                        })
                    }
                }

                function init() {
                    $scope.getCommentList();
                }

                init();
            }
            
            wikiblock.init({
                scope: $scope,
                styles:[
                    {
                        design: {
                            text: 'style1',
                            cover: '/wiki/js/mod/adi/assets/images/comment.png'
                        }
                    }
                ],
                params_template: {
                    design: {
                        is_leaf: true,
                        require: true,
                        is_mod_hide: false,
                        name: '样式',
                        text: 'style1'
                    },
                    multiText_desc:{
                        is_leaf      : true,
                        type         : "none",
                        editable     : true,
                        is_card_show : false,
                        is_mod_hide  : 'none',
                        name         : "评论",
                        text         : '',
                        require      : true,
					}
                }
            })
        }])
    }
    
    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
        }
    }
});