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
                $scope.modParams.memberApply = false;
                $scope.modParams.worksApply = false;
                $scope.modParams.memberManage = false;
                $scope.modParams.worksManage = false;

                if ($scope.modParams.moduleKind == "siteManageDemo") {
                    $scope.modParams.worksApply = true;
                    $scope.modParams.tutorialVideo = true;
                } else if ($scope.modParams.moduleKind == "siteManagePreview") {
                    $scope.modParams.memberApply = true;
                    $scope.modParams.worksApply = true;
                    $scope.modParams.memberManage = true;
                    $scope.modParams.worksManage = true;
                } else {
                    if ($scope.user && $scope.user._id) {
                        util.post(config.apiUrlPrefix + 'website_member/getBySiteUsername', {websiteId:siteinfo._id, username: $scope.user.username}, function (data) {
                            visitorInfo = data;

                            if (siteinfo.username == $scope.user.username || (visitorInfo && visitorInfo.roleName == "管理员")) { // 管理员
                                //$scope.modParams.memberApply = true;
                                $scope.modParams.worksApply = true;
                                $scope.modParams.memberManage = true;
                                $scope.modParams.worksManage = true;
                            } else if (!visitorInfo) {  // 访客
                                $scope.modParams.memberApply = true;
                            } else if (visitorInfo.roleName == "成员") { // 成员
                                //$scope.modParams.memberApply = true;
                                $scope.modParams.worksApply = true;
                            } else {
                                //$scope.modParams.memberApply = true;
                            }
                        });
                    }
                }
            }

            $scope.$watch("$viewContentLoaded", function () {
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

            $scope.goMemberManagePage = function () {
                storage.sessionStorageSetItem("wikiModParams", {username:modParams.username, sitename:modParams.sitename});
                util.go('/wiki/js/mod/wiki/js/siteMemberManage');
            }

            $scope.goWorksManagePage = function () {
                storage.sessionStorageSetItem("wikiModParams", {username:modParams.username, sitename:modParams.sitename});
                util.go('/wiki/js/mod/wiki/js/siteWorksManage');
            }

            $scope.goSubmitWorksPage = function () {
                storage.sessionStorageSetItem("wikiModParams", {username:modParams.username, sitename:modParams.sitename});
                if ($scope.modParams.worksApplyUrl) {
                    util.go($scope.modParams.worksApplyUrl)
                } else {
                    util.go('/wiki/js/mod/wiki/js/siteSubmitWorks');
                }
            }

            $scope.goMemberApplyPage = function () {
                storage.sessionStorageSetItem("wikiModParams", {username:modParams.username, sitename:modParams.sitename});
                util.go( '/wiki/js/mod/wiki/js/siteMemberApply');
            }

            $scope.goTutorialVideoPage = function () {
                if ($scope.modParams.tutorialVideoUrl) {
                    util.go($scope.modParams.tutorialVideoUrl, true);
                }
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
 "memberManageText":"成员管理",
 "worksManageText":"作品管理",
 "worksApplyText":"提交作品",
 "memberApplyText":"申请加入"
 }
 ```
 */
/*
 ```@wiki/js/siteManage
 {
 "moduleKind":"siteManagePreview",
 "memberManageText":"成员管理",
 "worksManageText":"作品管理",
 "worksApplyText":"提交作品",
 "memberApplyText":"申请加入"
 }
 ```
 */
/*
 ```@wiki/js/siteManage
 {
 "moduleKind":"siteManageDemo",
 "tutorialVideoText":"教学视频",
 "worksApplyText":"提交作品"
 }
 ```
*/