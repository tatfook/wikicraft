/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app',
    'helper/util',
    'helper/storage',
    'text!html/userCenter.html',
    'controller/userProfileController',
    'controller/websiteController',
    'controller/dataSourceController',
    'controller/myVIPController',
    'controller/editWebsiteController',
], function (app, util, storage, htmlContent, userProfileHtmlContent, websiteHtmlContent, dataSourceHtmlContent, myVIPHtmlContent, editWebsiteHtmlContent) {
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

        $scope.$on('userCenterContentType', function (event, contentType) {
            if (contentType != $scope.contentType || contentType == 'websiteManager') {
                $scope.selectContentType(contentType);
            }
        })
        $scope.$on('userCenterSubContentType', function (event, subContentType) {
            //$scope.selectContentType(contentType);
            //console.log(subContentType);
            $scope.showItem = subContentType;
        });

        function init() {
            $scope.contentType = storage.sessionStorageGetItem('userCenterContentType') || 'userProfile';
            storage.sessionStorageRemoveItem('userCenterContentType');
            $scope.showItem = storage.sessionStorageGetItem('userCenterSubContentType');
            storage.sessionStorageRemoveItem('userCenterSubContentType');

            //console.log($scope.contentType, $scope.showItem);
            $scope.selectContentType($scope.contentType, $scope.showItem);
            //$scope.$apply();
        }

        // 文档加载完成
        $scope.$watch('$viewContentLoaded', init);
        
        $scope.selectContentType = function (contentType, subContentType) {
            //console.log(contentType);
            $scope.contentType = contentType;

            if (contentType == 'userProfile') {
                $scope.showItem = subContentType || 'myProfile';
                util.html('#userCenterSubPage', userProfileHtmlContent, $scope);
            } else if (contentType == 'websiteManager' || contentType == "editWebsite") {
                $scope.showItem = subContentType || 'myWebsite';
                $scope.contentType = "websiteManager";
                if (contentType == "websiteManager")
                    util.html('#userCenterSubPage', websiteHtmlContent, $scope);
                else if (contentType == "editWebsite")
                    util.html('#userCenterSubPage', editWebsiteHtmlContent, $scope);
            } else if (contentType == 'VIP') {
                $scope.showItem = subContentType || 'myVIP';
                util.html('#userCenterSubPage', myVIPHtmlContent, $scope);
            } else if (contentType == 'dataSource') {
                $scope.showItem = subContentType || 'dataSource';
                util.html('#userCenterSubPage', dataSourceHtmlContent, $scope);
            }

            subContentType && $rootScope.$broadcast('userCenterSubContentType', subContentType);
        }

        $scope.getExpandClass = function (contentType) {
            return $scope.contentType == contentType ? "" : 'sr-only';
        }

        $scope.clickUserCenterItem = function (item) {
            $scope.showItem = item.flag;
            //console.log(item);
            if (item.flag == 'myWebsite') {
                util.html('#userCenterSubPage', websiteHtmlContent, $scope);
            }

            $rootScope.$broadcast('userCenterSubContentType', item.flag);
        }

        $scope.getActiveStyleClass = function (item) {
            return $scope.showItem == item.flag ? 'active' : '';
        }
    }]);

    return htmlContent;
});