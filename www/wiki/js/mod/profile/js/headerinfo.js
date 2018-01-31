/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: none
 * @Last Modified time: 2018-01-31 14:57:25
 */
define([
    'app', 
    'helper/util',
    'text!wikimod/profile/html/headerinfo.html'
], function (app, util, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("userMsgCtrl", ['$scope', 'Message', 'Account', function ($scope, Message, Account) {
			wikiBlock.init({
				scope:$scope,
				params_template:{
                    is_leaf: true,
					desc:"个人简介内容"
				}
			});

            $scope.isFold = true;

            $scope.toggleFold = function(){
                $scope.isFold = !$scope.isFold;
            }

            $scope.favoriteUser = function (fansUser, subInfo) {
                if (!$scope.userinfo) {
                    $scope.concerned = !$scope.concerned;
                    return;
                }
    
                if (!Account.isAuthenticated()) {
                    Message.info("登录后才能关注");
                    modal('controller/loginController', {
                        controller: 'loginController',
                        size: 'lg',
                        backdrop: true
                    }, function (result) {
                        console.log(result);
                        // nowPage.replaceSelection(login.content);
                    }, function (result) {
                        console.log(result);
                    });
                    return; // 登录后才能关注
                }
    
                fansUser = fansUser ? fansUser : $scope.userinfo;//关注该页面的用户，或者关注这个用户的粉丝
    
                if (!Account.isAuthenticated() || !$scope.user || $scope.user._id == fansUser._id) {
                    Message.info("自己不关注自己");
                    return; // 自己不关注自己
                }
    
                var ownUserFan = {
                    "userId": fansUser._id,
                    "fansUserId": $scope.user._id,
                    "userinfo": $scope.user
                };
    
                if(fansUser.concerned){//取消关注
                    util.post(config.apiUrlPrefix + 'user_fans/unattent', {userId:fansUser._id, fansUserId:$scope.user._id}, function () {
                        console.log("取消关注成功");
                        Message.info("取消关注成功");
                        fansUser.concerned=false;
                        if (subInfo && subInfo == "fansOpt"){
                            for(var i = 0;i<$scope.fansList.length;i++){
                                var fansItem = $scope.fansList[i];
                                if (fansItem.fansUserId == $scope.user._id){
                                    $scope.fansList.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    });
                }else{
                    util.post(config.apiUrlPrefix + 'user_fans/attent', {userId:fansUser._id, fansUserId:$scope.user._id}, function () {
                        console.log("关注成功");
                        Message.info("关注成功");
                        fansUser.concerned=true;
                        if (subInfo && subInfo == "fansOpt"){
                            $scope.fansList.push(ownUserFan);
                        }
                    });
                }
            };

            var initMoreIsShow = function(){
                setTimeout(function(){
                    var toggleContent = $("#show-content");
                    var fakeContent = $("#fake-content");
                    var toggleHeight = toggleContent.height();
                    var fakeHeight = fakeContent.height();
                    $scope.isExceed = (fakeHeight > toggleHeight) ? true : false;
                    util.$apply();
                });
                
            }

            $scope.$watch("$viewContentLoaded", initMoreIsShow);
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});