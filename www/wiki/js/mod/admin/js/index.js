/**
 * Created by wuxiangan on 2016/12/21.
 */

define([
    'app',
    'helper/util',
    'text!wikimod/admin/html/index.html',
], function (app, util, htmlContent) {
    app.registerController('indexController', ['$scope', '$auth', 'Account','modal', function ($scope, $auth, Account,modal) {
		var urlPrefix = "/wiki/js/mod/admin/js/";
		$scope.selectMenuItem = "user";
		$scope.pageSize = 5;
		$scope.currentPage = 1;
		$scope.totalItems = 0;

        function init() {
        	$scope.clickMenuItem($scope.selectMenuItem);
        }

        $scope.$watch('$viewContentLoaded', init);

		$scope.getStyleClass = function (item) {
			if ($scope.selectMenuItem == item) {
				return "panel-primary";
			}
			return;
        }
		$scope.clickMenuItem = function(menuItem) {
			$scope.selectMenuItem = menuItem;

			if ($scope.selectMenuItem == "user") {
                $scope.getUserList();
            } else if ($scope.selectMenuItem == "site") {
                $scope.getSiteList();
            }
		}

		// 获取用户列表
		$scope.getUserList = function (){
			util.post(config.apiUrlPrefix + "admin/getUserList", {
				page:$scope.currentPage,
				pageSize:$scope.pageSize,
			}, function (data) {
                data = data || {};
				$scope.userList = data.userList || [];
                $scope.totalItems = data.total || 0;
            });
		}

		// 获取站点列表
		$scope.getSiteList = function () {
			util.post(config.apiUrlPrefix + "admin/getSiteList", {
				page:$scope.currentPage,
				pageSize: $scope.pageSize,
			}, function (data) {
				data = data || {};
				$scope.siteList = data.siteList || [];
				$scope.totalItems = data.total || 0;
            });
        }


    }]);

    return htmlContent;
});












