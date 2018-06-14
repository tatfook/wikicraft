/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: none
 * @Last Modified time: 2018-01-31 20:34:39
 */
define([
    'app',
    'helper/util',
    'text!wikimod/profile/html/followUser.html'
], function (app, util, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("followsUserCtrl", ['$scope', '$translate', 'Message', function ($scope, $translate, Message) {
            $scope.toggleFollowUser = function (fansUser, subInfo) {
                fansUser.concerned  = (fansUser.concerned == undefined) ? true: fansUser.concerned;
                if(fansUser.concerned){//取消关注
                    util.post(config.apiUrlPrefix + 'user_fans/unattent', {
                        userId:fansUser.userinfo._id,        // 被关注者id
                        fansUserId:$scope.user._id  // 关注者id
                    }, function () {
                        Message.info($translate.instant("取消关注成功"));
                        fansUser.concerned=false;
                    });
                }else{
                    util.post(config.apiUrlPrefix + 'user_fans/attent', {userId:fansUser.userinfo._id, fansUserId:$scope.user._id}, function () {
                        Message.info($translate.instant("关注成功"));
                        fansUser.concerned=true;
                    });
                }
            };
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});