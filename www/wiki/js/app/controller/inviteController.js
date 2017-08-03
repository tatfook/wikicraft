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
        function init() {
        }

		$scope.$watch('viewContentLoaded', function(){
            init();
		});

    }]);

    return htmlContent;
});
