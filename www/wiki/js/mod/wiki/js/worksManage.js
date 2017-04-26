/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'text!wikimod/wiki/html/worksManage.html'
], function (app, util, storage, htmlContent) {

    function getModParams(wikiblock) {
        var modParams = wikiblock.modParams || storage.sessionStorageGetItem("wikiModParams") || {};
        modParams.sitename = "xiaoyao";
        return angular.copy(modParams);
    }

    function registerController(wikiblock) {
        app.registerController('worksManageController',['$scope','Account', function ($scope, Account) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            var modParams = getModParams(wikiblock);
            var siteinfo = undefined;
            function init() {
                // 获取作品列表
                util.post(config.apiUrlPrefix + 'website_works/getByWebsiteId', {websiteId: siteinfo._id}, function (data) {
                    data = data || {};
                    $scope.worksList = data.worksList;
                });

                // 获取审核列表
                util.post(config.apiUrlPrefix + "website_apply/getWorksByWebsiteId", {websiteId: siteinfo._id}, function (data) {
                    data = data || {};
                    $scope.applyList = data.applyList;
                });
            }

            $scope.$watch("$viewContentLoaded", function () {
                Account.getUser(function (userinfo) {
                    $scope.userinfo = userinfo;
                    if (modParams.sitename) {
                        util.post(config.apiUrlPrefix + "website/getByName", {username:$scope.userinfo.username, websiteName:modParams.sitename}, function (data) {
                            siteinfo = data;
                            siteinfo && init();
                        });
                    }
                });
            });
            // 同意作品申请
            $scope.agreeApply = function (apply) {
                util.post(config.apiUrlPrefix + 'website_apply/agreeWorks', {websiteId:siteinfo._id, applyId:apply.worksInfo._id}, function () {
                    console.log("作品审核通过");
                });
            }
            // 拒绝作品申请
            $scope.refuseApply = function (apply) {
                util.post(config.apiUrlPrefix + 'website_apply/refuseWorks', {websiteId:siteinfo._id, applyId:apply.worksInfo._id}, function () {
                    console.log("作品审核拒绝");
                });
            }
            // 移除作品
            $scope.removeWorks = function (works) {
                util.post(config.apiUrlPrefix + 'website_works/deleteById', {id:works._id}, function () {
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