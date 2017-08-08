/**
 * Created by wuxiangan on 2017/3/9.
 */


define(['app',
    'helper/util',
    'helper/storage',
    'text!html/invite.html',
], function (app, util, storage, htmlContent) {
    app.registerController('inviteController', ['$scope', 'Account', 'Message', 'github', function ($scope, Account, Message) {
        $scope.showItem = "addFriend";

        $scope.inviteFriend = function () {
            if (!$scope.friendMail) {
                Message.info("请正确填写好友邮箱地址!!!");
                return ;
            }
            util.post(config.apiUrlPrefix + 'user/inviteFriend',{username:$scope.user.username,friendMail:$scope.friendMail}, function () {
                Message.info("邀请邮件已发送给" + $scope.friendMail);
                $scope.friendMail = "";
            });
        };

        function init() {
        }

		$scope.$watch('viewContentLoaded', function(){
            init();
		});

    }]);

    return htmlContent;
});
