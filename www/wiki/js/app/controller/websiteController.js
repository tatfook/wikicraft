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
            util.post(config.apiUrlPrefix + 'website/getAllByUsername', {username: $scope.user.username}, function (data) {
                $scope.websites = data;
                $scope.websites.count = $scope.websites.length;
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
        $scope.goWebsiteIndexPage = function (sitename) {
            util.goUserSite('/' + $scope.user.username + '/' + sitename, true);
        }

        // 编辑网站页面
        $scope.goEditWebsitePagePage = function (website) {
            //window.location.href="/wiki/wikiEditor";
            storage.sessionStorageSetItem("urlObj",{username:website.username, sitename:website.name});
            util.go('wikieditor');
        }

        //删除网站
        $scope.deleteWebsite = function (site) {
            console.log(site);
            config.services.confirmDialog({
                "title":"删除提醒",
                "confirmBtnClass":"btn-danger",
                "theme":"danger",
                "content":"确定删除 " + (site.displayName || site.name) + " 网站？"
            },function(){
                util.post(config.apiUrlPrefix + 'website/deleteById', {websiteId: site._id}, function (data) {
                    site.isDelete = true;
                    $('#deleteModal').modal("hide");
                    $scope.deletingWebsite="";
                    $scope.websites.count --;
                });
            });
        };

        Account.ensureAuthenticated(function () {
            Account.getUser(function (userinfo) {
                init(userinfo);
            });
        });
    }]);

    return htmlContent;
});
