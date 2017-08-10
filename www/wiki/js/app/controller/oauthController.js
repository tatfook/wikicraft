/**
 * Created by wuxiangan on 2017/1/6.
 */

define([
    'app',
    'helper/util',
    'text!html/oauth.html',
], function (app, util, htmlContent) {
    app.registerController("oauthController", ['$scope', "Account", 'modal', function ($scope, Account, modal) {
    	$scope.checkAll = true;
        function init() {
			$scope.logined = Account.isAuthenticated();
			if (!$scope.logined){
				return;
			}
			var queryArgs = util.getQueryObject();

			//console.log(queryArgs);

			// keepwork 登录 keepwork 测试
			//if (queryArgs.code) {
				//util.post(config.apiUrlPrefix + "oauth_app/getTokenByCode", {code:queryArgs.code}, function(data){
					//$scope.isAuth = true;
					//data = data || {};
					//console.log(data);
					//$scope.message = "token:" + data.token;
				//});
				//return;
			//}

			util.post(config.apiUrlPrefix + "oauth_app/getByClientId", {clientId:queryArgs.client_id}, function(data){
				$scope.oauthApp = data || {};
			});

			$scope.agree = function(){
				console.log("user agree auth");
				util.post(config.apiUrlPrefix + "oauth_app/agreeOauth", {
					client_id:queryArgs.client_id,
					redirectUri:queryArgs.redirect_uri,
					username:$scope.user.username,
				}, function(data){
					data = data || {};
					data.client_id = queryArgs.client_id;
					data.redirect_uri = queryArgs.redirect_uri;
					var searchStr = util.getQueryString(data);
					console.log(queryArgs, data);
					// 重定向到client home page
					window.location.href = queryArgs.redirect_uri + "?" + searchStr;
				});
				
				return ;
			}

			$scope.refuse = function(){
				console.log("user refuse auth");
				util.go("home");
				return ;
			}
        }
		$scope.$watch("$viewContentLoaded", function(){
			if (!Account.isAuthenticated()){
                modal('controller/loginController', {
                    controller: 'loginController',
                    size: 'lg',
                    backdrop: true
                }, function (result) {
					$scope.userinfo = result;
                    init();
                }, function (result) {
                    return;
                });
			} else {
				// Account.ensureAuthenticated();
				Account.getUser(function(userinfo){
					$scope.user = userinfo;
					init();
				});
			}
		});
    }]);
    
    return htmlContent;
});

