/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'text!wikimod/wiki/html/siteMemberApply.html'
], function (app, util, storage, htmlContent) {

    function getModParams(wikiblock) {
        var modParams = wikiblock.modParams || storage.sessionStorageGetItem("wikiModParams") || {};
        return angular.copy(modParams);
    }

    function registerController(wikiblock) {
        app.registerController('siteMemberApplyController',['$scope', 'Account', function ($scope, Account) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            var modParams = getModParams(wikiblock);
            console.log(modParams);
            var userinfo = undefined;
            var siteinfo = undefined;

            function init() {

            }

            $scope.clickMemberApply = function () {
                var finish = function () {
                    history.back();
                };
                var apply = {
                    websiteId: siteinfo._id,
                    websiteType: siteinfo.type,
                    username: $scope.user.username,
                    location: $scope.user.location,
                    userDesc: $scope.userDesc,
                };

                util.post(config.apiUrlPrefix + 'website_member/submitMemberApply', apply, function () {
                    config.services.confirmDialog({title:"成员申请", content:"成员申请成功", cancelBtn:false}, finish);
                }, function () {
                    config.services.confirmDialog({title:"成员申请", content:"成员申请失败", cancelBtn:false}, finish);
                });
            }

            $scope.clickMemberCancel = function () {
                history.back();
            }

            $scope.goHomePage = function () {
                util.go("/"+siteinfo.username+"/"+siteinfo.name);
            }

            $scope.$watch("$viewContentLoaded", function () {
                Account.getUser(function (userinfo) {
                    $scope.user = userinfo;
                    if (modParams.username && modParams.sitename) {
                        util.post(config.apiUrlPrefix + "website/getUserSiteInfo", {username:modParams.username, sitename:modParams.sitename}, function (data) {
                            userinfo = data.userinfo;
                            siteinfo = data.siteinfo;
                            $scope.siteinfo=siteinfo;
                            userinfo && siteinfo && init();
                        });
                    }
                });
            });
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
 ```@wiki/js/organizationMemberApply
 ```
 */