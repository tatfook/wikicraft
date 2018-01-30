/**
 * Created by 18730 on 2017/4/18.
 */

define([
    'app',
    'helper/util',
    'helper/storage'
], function (app, util, storage, htmlContent) {
    app.controller('headerController', ['$rootScope', '$scope', 'Account', 'Message', function ($rootScope, $scope, Account, Message) {
        var isLogin=Account.isAuthenticated();
        if(isLogin){
            util.post(config.apiUrlPrefix + 'user/verifyEmailTwo', {}, function (data) {
                Message.info("邮箱绑定成功");
            },function (err) {
                // console.log(err);
                Message.info(err.message);
            });
        }else{
            Message.info("还未登录，请先登录");
        }
    }]);

    return htmlContent;
});
