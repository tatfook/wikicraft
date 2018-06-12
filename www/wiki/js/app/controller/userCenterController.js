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
    'controller/newWebsiteController',
    'controller/inviteController',
    'controller/servicesController',
], function (app, util, storage, htmlContent, userProfileHtmlContent, websiteHtmlContent, dataSourceHtmlContent, myVIPHtmlContent, editWebsiteHtmlContent, newWebsiteHtmlContent, inviteHtmlContent, servicesHtmlContent) {
    app.registerController('userCenterController', ['$rootScope','$scope', '$translate', 'Account', 'Message', function ($rootScope, $scope, $translate, Account, Message) {
        $scope.contentType = undefined;
        $scope.isGlobalVersion = config.isGlobalVersion;
        $scope.userProfileItemList = [
            {contentType:"userProfile", subContentType:"myProfile", flag:'myProfile', name:'我的资料'},
            {contentType:"userProfile", subContentType:"accountSafe", flag:'accountSafe', name:'账户安全'},
            {contentType:"userProfile", subContentType:"myTrends", flag:'myTrends', name:'我的动态'},
            {contentType:"userProfile", subContentType:"myCollection", flag:'myCollection', name:'我的关注'},
            {contentType:"userProfile", subContentType:"myHistory", flag:'myHistory', name:'我的历史'},
            {contentType:"userProfile", subContentType:"myFans", flag:'myFans', name:'我的粉丝'},
            !$scope.isGlobalVersion && {contentType:"userProfile", subContentType:"realName", flag:'realName', name:'实名认证'},
            // {contentType:"userProfile", subContentType:"myPay", flag:'myPay', name:'消费记录'},
            {contentType:"userProfile", subContentType:"dataSource", flag:'dataSource', name:'数据源'},
            // {contentType:"userProfile", subContentType:"invite", flag:'invite', name:'邀请注册'},
        ].filter(function(x) {return x});

        $scope.websiteMangerItemList = [
            {contentType:"websiteManager", subContentType:"myWebsite", flag:'myWebsite', name:'我的站点'},
        ];

        // $scope.vipItemList = [
        //     {contentType:"vip", subContentType:"myVIP", flag:'myVIP', name:'我的VIP'},
        // ];

        $scope.invitesItemList = [
            {contentType:"invite", subContentType:"addFriend", flag:'addFriend', name:'邀请注册'},
        ];

        $scope.servicesItemList = [
            !$scope.isGlobalVersion && {contentType:"services", subContentType:"myVIP", flag:'myVIP', name:'我的VIP'},
            {contentType:"services", subContentType:"orders", flag:'orders', name:'订单中心'},
            {contentType:"services", subContentType:"myPay", flag:'myPay', name:'消费记录'},
            {contentType:"services", subContentType:"qiniuPan", flag:'qiniuPan', name:'我的网盘'},
        ].filter(function(x) {return x});

        // $scope.dataSourceItemList = [
        //     {contentType:"dataSource", subContentType:"dataSource", flag:'dataSource', name:'数据源配置'},
        // ]

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
			var urlArgs = util.getQueryObject();

            $scope.contentType = urlArgs.userCenterContentType || storage.sessionStorageGetItem('userCenterContentType') || 'userProfile';
            storage.sessionStorageRemoveItem('userCenterContentType');
            $scope.showItem = urlArgs.userCenterSubContentType || storage.sessionStorageGetItem('userCenterSubContentType');
            storage.sessionStorageRemoveItem('userCenterSubContentType');

            //console.log($scope.contentType, $scope.showItem);
            $scope.selectContentType($scope.contentType, $scope.showItem);
            //$scope.$apply();
        }

        // 文档加载完成
        $scope.$watch('$viewContentLoaded', init);
        
        $scope.selectContentType = function (contentType, subContentType) {
            if ($rootScope.isBigfileUploading){
                config.services.confirmDialog({
                    "title": $translate.instant("提示"),
                    "content": $translate.instant("还有文件正在上传，请完成后重试，或者打开新窗口操作！"),
                    "cancelBtn": false
                }, function () {
                    return;
                });
                return;
            }
            //console.log(contentType);
            $scope.contentType = contentType;
            //console.log($('#userCenterSubPage'));
            if (contentType == 'userProfile') {
                $scope.showItem = subContentType || 'myProfile';
                util.html('#userCenterSubPage', userProfileHtmlContent, $scope);
            } else if (contentType == 'websiteManager' || contentType == "editWebsite" || contentType == "newWebsite") {
                $scope.showItem = subContentType || 'myWebsite';
                $scope.contentType = "websiteManager";
                if (contentType == "websiteManager")
                    util.html('#userCenterSubPage', websiteHtmlContent, $scope);
                else if (contentType == "editWebsite")
                    util.html('#userCenterSubPage', editWebsiteHtmlContent, $scope);
                else if (contentType == "newWebsite")
                    util.html("#userCenterSubPage", newWebsiteHtmlContent, $scope);
            } else if (contentType == 'services') {
                $scope.showItem = subContentType || 'myVIP';
                util.html('#userCenterSubPage', servicesHtmlContent, $scope);
            } else if (contentType == 'invite') {
                $scope.showItem = subContentType || 'addFriend';
                util.html('#userCenterSubPage', inviteHtmlContent, $scope);
            }
            // else if (contentType == 'VIP') {
            //     $scope.showItem = subContentType || 'myVIP';
            //     util.html('#userCenterSubPage', myVIPHtmlContent, $scope);
            // } else if (contentType == 'dataSource') {
            //     $scope.showItem = subContentType || 'dataSource';
            //     util.html('#userCenterSubPage', dataSourceHtmlContent, $scope);
            // }

            subContentType && $rootScope.$broadcast('userCenterSubContentType', subContentType);
        }

        $scope.getExpandClass = function (contentType) {
            return $scope.contentType == contentType ? "" : 'sr-only';
        }

        $scope.clickUserCenterItem = function (item) {
            if ($rootScope.isBigfileUploading){
                config.services.confirmDialog({
                    "title": $translate.instant("提示"),
                    "content": $translate.instant("还有文件正在上传，请完成后重试，或者打开新窗口操作！"),
                    "cancelBtn": false
                }, function () {
                    return;
                });
                return;
            }
            $scope.showItem = item.subContentType;
            //console.log(item);
			// 网站管理比较特殊 这里需特殊处理, 一个子项多个页面
            if (item.subContentType == 'myWebsite') {
                util.html('#userCenterSubPage', websiteHtmlContent, $scope);
            }

            $rootScope.$broadcast('userCenterSubContentType', item.subContentType);
        };

        $scope.getActiveStyleClass = function (item) {
            return $scope.showItem == item.subContentType ? 'active' : '';
        }

        $scope.goUserSite = function (x) {
            util.goUserSite('/' + x.username + '/' + x.name, true);
        }
    }]);

    return htmlContent;
});
