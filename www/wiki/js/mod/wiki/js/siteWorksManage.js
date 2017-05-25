/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'text!wikimod/wiki/html/siteWorksManage.html'
], function (app, util, storage, htmlContent) {

    function getModParams(wikiblock) {
        var modParams = wikiblock.modParams || storage.sessionStorageGetItem("wikiModParams") || {};
        return angular.copy(modParams);
    }

    function registerController(wikiblock) {
        app.registerController('siteWorksManageController',['$scope','Account', function ($scope, Account) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            var modParams = getModParams(wikiblock);
            var userinfo = undefined;
            var siteinfo = undefined;

            function init() {
                $scope.clickWorksList();
            }

            $scope.$watch("$viewContentLoaded", function () {
                if (modParams.username && modParams.sitename) {
                    util.post(config.apiUrlPrefix + "website/getUserSiteInfo", {username:modParams.username, sitename:modParams.sitename}, function (data) {
                        userinfo = data.userinfo;
                        siteinfo = data.siteinfo;
                        userinfo && siteinfo && init();
                    });
                }
            });

            // 作品列表
            $scope.clickWorksList = function () {
                // 获取作品列表
                util.post(config.apiUrlPrefix + 'website_works/getByWebsiteId', {websiteId: siteinfo._id}, function (data) {
                    data = data || {};
                    $scope.worksList = data.worksList;
                });
            }
            // 作品申请；列表
            $scope.clickWorksApply = function () {
                // 获取审核列表
                util.post(config.apiUrlPrefix + "website_works/getApplyByWebsiteId", {websiteId: siteinfo._id}, function (data) {
                    data = data || {};
                    $scope.applyList = data.worksList;
                });
            }

            // 跳作品页
            $scope.goApplyWorksPage = function (apply) {
                util.goUserSite(apply.worksInfo.worksUrl);
            }

            // 跳作品页
            $scope.goWorksPage = function (works) {
                util.goUserSite(works.worksInfo.worksUrl);
            }

            // 同意作品申请
            $scope.agreeApply = function (apply) {
                util.post(config.apiUrlPrefix + 'website_works/agreeWorksApply', apply, function () {
                    apply.isDeleted = true;
                    console.log("作品审核通过");
                });
            }
            // 拒绝作品申请
            $scope.refuseApply = function (apply) {
                util.post(config.apiUrlPrefix + 'website_works/deleteById', apply, function () {
                    apply.isDeleted = true;
                    console.log("作品审核拒绝");
                });
            }
            // 移除作品
            $scope.removeWorks = function (works) {
                util.post(config.apiUrlPrefix + 'website_works/deleteById', works, function () {
                    works.isDeleted = true;
                    console.log("成功移除作品")
                });
            }
        }]);
    }

    return {
        render: function(wikiblock){
            registerController(wikiblock);
            return htmlContent;
        }
    };
});

/*
 ```@wiki/js/worksManage
 {
    "sitename":"xiaoyao"
 }
 ```
 */