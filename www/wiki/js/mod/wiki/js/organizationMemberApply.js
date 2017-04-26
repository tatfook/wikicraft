/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'text!wikimod/wiki/html/organizationMemberApply.html'
], function (app, util, storage, htmlContent) {

    function getModParams(wikiblock) {
        var modParams = wikiblock.modParams || storage.sessionStorageGetItem("wikiModParams") || {};
        modParams.sitename = "xiaoyao";
        return angular.copy(modParams);
    }

    function registerController(wikiblock) {
        app.registerController('organizationMemberApplyController',['$scope', 'Account', function ($scope, Account) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            var modParams = getModParams(wikiblock);

            var siteinfo = undefined;

            function init() {

            }

            $scope.clickMemberApply = function () {
                console.log($scope.desc);
            }

            $scope.clickMemberCancel = function () {
                history.back();
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
        }]);
    }
    return {
        render: function(wikiblock){
            registerController(wikiblock);
            return htmlContent;
        }
    };
})

/*
 ```@wiki/js/organizationMemberApply
 ```
 */