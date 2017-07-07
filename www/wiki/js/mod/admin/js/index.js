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
		// 点击编辑用户
		$scope.clickEditUser = function (user) {

        }
        // 点击禁用用户
		$scope.clickEnableUser = function (user) {
			user.roleId = user.roleId == -1 ? 0 : -1;
			util.post(config.apiUrlPrefix + "user/updateByName", {username:user.username, roleId:user.roleId}, function () {
            });
        }
        // 点击删除用户
		$scope.clickDeleteUser = function (user) {
			util.post(config.apiUrlPrefix + "user/deleteByName", user, function () {
				user.isDelete = true;
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

        // 点击编辑站点
		$scope.clickEditSite = function () {

        }
        // 点击禁用的站点
		$scope.clickEnableSite = function () {
			site.state = site.state == -1 ? 0 :  -1;
            util.post(config.apiUrlPrefix + "website/updateByName", {username:site.username, sitename:site.name, state:site.state}, function () {
            });
        }
        // 点击删除站点
		$scope.clickDeleteSite = function (site) {
			util.post(config.apiUrlPrefix + "website/deleteById", {websiteId:site._id}, function () {
				site.isDelete = true;
            });
        }
    }]);

    return htmlContent;
});












