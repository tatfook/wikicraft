/**
 * Created by wuxiangan on 2016/12/21.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'helper/dataSource',
    'text!html/website.html',
    'controller/newWebsiteController',
    'controller/editWebsiteController',
], function (app, util, storage, dataSource, htmlContent, newWebsiteHtmlContent, editWebsiteHtmlContent) {
    app.registerController('websiteController', ['$rootScope', '$scope', 'Account', function ($rootScope, $scope, Account) {
        console.log("websiteController");
        $scope.websites = [];

        function getUserSiteList() {
            util.post(config.apiUrlPrefix + 'website/getAllByUserId', {userId: $scope.user._id || -1}, function (data) {
                $scope.websites = data;
            });
        }

        function init(userinfo) {
            $scope.user = userinfo || $scope.user;
            // 获取项目列表
            getUserSiteList();

            $scope.$on('userCenterItem', function (event, item) {
            });
        }

        //  创建网站
        $scope.goNewWebsitePage = function () {
            util.html('#userCenterSubPage', newWebsiteHtmlContent);
        }

        // 编辑网站
        $scope.goEditWebsitePage = function (website) {
            storage.sessionStorageSetItem("editWebsiteParams", website);
            //storage.sessionStorageSetItem("userCenterContentType", "editWebsite");
            //window.open(window.location.href);
            util.html('#userCenterSubPage', editWebsiteHtmlContent);
        }

        // 访问网站
        $scope.goWebsiteIndexPage = function (websiteName) {
            util.goUserSite('/' + $scope.user.username + '/' + websiteName, true);
        }

        // 编辑网站页面
        $scope.goEditWebsitePagePage = function (website) {
            //window.location.href="/wiki/wikiEditor";
            util.go('wikiEditor');
        }

        // 删除网站
        $scope.deleteWebsite = function (site) {
            var DataSource = dataSource.getUserDataSource($scope.user.username);
            DataSource.registerInitFinishCallback(function () {
                util.post(config.apiUrlPrefix + 'website_pageinfo/get', {username:site.username, websiteName:site.name, dataSourceId:site.dataSourceId}, function (data) {
                    var pageList = angular.fromJson(data ? (data.pageinfo || '[]') : '[]');
                    var ds = DataSource.getDataSourceById(site.dataSourceId);
                    console.log(pageList, ds);
                    for (var i = 0; ds && i < pageList.length; i++) {
                        // ds.deleteFile({path:pageList[i].url.substring(1) + config.pageSuffixName});                  // 避免误删除造成错误
                        util.post(config.apiUrlPrefix + 'website_page/deleteByUrl', {url:pageList[i].url});
                    };
                    util.post(config.apiUrlPrefix + 'website/deleteById', {websiteId: site._id}, function (data) {
                        getUserSiteList();
                    });
                });
            });
        }

        Account.ensureAuthenticated(function () {
            Account.getUser(function (userinfo) {
                init(userinfo);
            });
        });
    }]);

    return htmlContent;
});