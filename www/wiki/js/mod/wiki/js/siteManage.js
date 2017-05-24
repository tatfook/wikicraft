/**
 * Created by wuxiangan on 2017/5/24.
 */


/**
 * Created by wuxiangan on 2016/12/12.
 */
define([
    'app',
    'helper/util',
    'helper/storage',
    'text!wikimod/wiki/html/siteManage.html',
], function (app, util, storage, htmlContent) {

    function getModParams(wikiblock) {
        var modParams = wikiblock.modParams || storage.sessionStorageGetItem("wikiModParams") || {};
        return angular.copy(modParams);
    }

    function registerController(wikiBlock) {
        // 组织信息统计
        app.registerController("siteManageController", ['$scope', '$rootScope', 'Account','Message', function ($scope, $rootScope, Account, Message) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            var modParams = getModParams(wikiBlock);
            var siteinfo = $rootScope.siteinfo;
            var userinfo = $rootScope.userinfo;
            var visitorInfo = undefined;
            $scope.modParams = modParams;

            function init() {
                // $scope.user 为当前使用用户也是当前访问者
                if ($scope.user && $scope.user._id) {
                    util.post(config.apiUrlPrefix + 'website_member/getBySiteUserId', {websiteId:siteinfo._id, userId: $scope.user._id}, function (data) {
                        visitorInfo = data;
                    });
                }
            }

            $scope.$watch("$viewContentLoaded", function () {
                modParams.username = "xiaoyao";
                modParams.sitename = "xiaoyao";

                if (userinfo && siteinfo) {
                    modParams.username = userinfo.username;
                    modParams.sitename = siteinfo.name;
                    init();
                } else {
                    if (!modParams.username ||  !modParams.sitename) {
                        var urlObj = util.parseUrl();
                        modParams.username = urlObj.username;
                        modParams.sitename = urlObj.sitename;
                    }
                    util.post(config.apiUrlPrefix + "website/getUserSiteInfo", {username:modParams.username, sitename:modParams.sitename}, function (data) {
                        userinfo = data.userinfo;
                        siteinfo = data.siteinfo;
                        userinfo && siteinfo && init();
                    });
                }
            });

            $scope.isVisitor = function () {
                return true;
                if (!visitorInfo) {
                    return true;
                }

                return false;
            }

            $scope.isMember = function () {
                return true;
                if (visitorInfo && visitorInfo.roleId <= 2) {
                    return true;
                }

                return false;
            }

            $scope.isManager = function () {
                return true;
                if (visitorInfo && visitorInfo.roleId <= 1) {
                    return true;
                }

                return false;
            }

            $scope.goOrganizationManagePage = function () {
                storage.sessionStorageSetItem("wikiModParams", {username:modParams.username, sitename:modParams.sitename});
                util.go('/wiki/js/mod/wiki/js/siteMemberManage');
            }

            $scope.goWorksManagePage = function () {
                storage.sessionStorageSetItem("wikiModParams", {username:modParams.username, sitename:modParams.sitename});
                util.go('/wiki/js/mod/wiki/js/siteWorksManage');
            }

            $scope.goSubmitWorksPage = function () {
                storage.sessionStorageSetItem("wikiModParams", {username:modParams.username, sitename:modParams.sitename});
                util.go('/wiki/js/mod/wiki/js/siteSubmitWorks');
            }

            $scope.goMemberApplyPage = function () {
                storage.sessionStorageSetItem("wikiModParams", {username:modParams.username, sitename:modParams.sitename});
                util.go( '/wiki/js/mod/wiki/js/siteMemberApply');
            }
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock)
            return htmlContent;
        }
    }
});

/*
```@wiki/js/siteManage
{
}
```
*/