/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app',
    'helper/util',
    'helper/storage',
    'text!html/userCenter.html',
    'controller/userProfileController',
    'controller/websiteController',
    'controller/editWebsiteController',
], function (app, util, storage, htmlContent, userProfileHtmlContent, websiteHtmlContent, editWebsiteHtmlContent) {
    app.registerController('userCenterController', ['$rootScope','$scope', 'Account', 'Message', function ($rootScope, $scope, Account, Message) {
        $scope.contentType = undefined;
        $scope.userProfileItemList = [
            {flag:'myProfile', name:'我的资料'},
            {flag:'accountSafe', name:'账户安全'},
            {flag:'myTrends', name:'我的动态'},
            {flag:'myCollection', name:'我的收藏'},
            {flag:'myHistory', name:'我的历史'},
            {flag:'myFans', name:'我的粉丝'},
            {flag:'realName', name:'实名认证'},
            {flag:'invite', name:'邀请注册'},
        ];

        $scope.websiteMangerItemList = [
            {flag:'myWebsite', name:'我的站点'},
        ];

        $scope.vipItemList = [
            {flag:'myVIP', name:'我的VIP'},
        ];

        $scope.dataSourceItemList = [
            {flag:'dataSource', name:'数据源配置'},
        ]

        function init() {
            $scope.contentType = storage.sessionStorageGetItem('userCenterContentType') || 'userProfile';
            storage.sessionStorageRemoveItem('userCenterContentType');
            console.log($scope.contentType);
            $scope.selectContentType($scope.contentType);
            //$scope.$apply();
        }

        // 文档加载完成
        $scope.$watch('$viewContentLoaded', init);
        
        $scope.selectContentType = function (contentType) {
            $scope.contentType = contentType;

            if (contentType == 'userProfile') {
                $scope.showItem = 'myProfile';
                util.html('#userCenterSubPage', userProfileHtmlContent, $scope);
            } else if (contentType == 'websiteManager') {
                $scope.showItem = 'myWebsite';
                util.html('#userCenterSubPage', websiteHtmlContent, $scope);
            } else if (contentType == 'myVIP') {
                $scope.showItem = 'myVIP';
            } else if (contentType == 'dataSource') {
                $scope.showItem = 'dataSource';
            }
        }

        $scope.getExpandClass = function (contentType) {
            return $scope.contentType == contentType ? "" : 'sr-only';
        }

        
        $scope.clickUserCenterItem = function (item) {
            $scope.showItem = item.flag;
            console.log(item);
            if (item.flag == 'myWebsite') {
                util.html('#userCenterSubPage', websiteHtmlContent, $scope);
            }
            $rootScope.$broadcast('userCenterItem', item.flag);
        }

        $scope.getActiveStyleClass = function (item) {
            return $scope.showItem == item.flag ? 'active' : '';
        }
    }]);

    return htmlContent;
});