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
                util.post(config.apiUrlPrefix + 'website_apply/memberApply', {websiteId:siteinfo._id, applyId:$scope.user._id}, function () {
                    console.log("成员申请成功");
                    history.back();
                });
            }

            $scope.clickMemberCancel = function () {
                history.back();
            }

            $scope.$watch("$viewContentLoaded", function () {
                Account.getUser(function (userinfo) {
                    $scope.user = userinfo;
                    if (modParams.username && modParams.sitename) {
                        util.post(config.apiUrlPrefix + "website/getUserSiteInfo", {username:modParams.username, sitename:modParams.sitename}, function (data) {
                            userinfo = data.userinfo;
                            siteinfo = data.siteinfo;
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