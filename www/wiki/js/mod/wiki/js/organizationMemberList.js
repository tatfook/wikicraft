/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'text!wikimod/wiki/html/organizationMemberList.html'
], function (app, util, storage, htmlContent) {

    function getModParams(wikiblock) {
        var modParams = wikiblock.modParams || storage.sessionStorageGetItem("wikiModParams") || {};
        return angular.copy(modParams);
    }

    function registerController(wikiblock) {
        app.registerController('organizationMemberListController', ['$scope', '$rootScope', function ($scope, $rootScope) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            var modParams = getModParams(wikiblock);
            var userinfo = $rootScope.userinfo;
            var siteinfo = $rootScope.siteinfo;
            $scope.modParams=modParams;

            // 初始化信息
            function init() {
                util.post(config.apiUrlPrefix + 'website_member/getByWebsiteId', {
                    page: 1,
                    pageSize: 8,
                    websiteId: siteinfo._id
                }, function (data) {
                    data = data || {};
                    $scope.memberList = data.memberList;
                });
            }

            // 获得角色名
            $scope.getRoleName = function (member) {
                if (member.roleId == 0) {
                    return "创建者";
                } else if (member.roleId == 1) {
                    return "管理员";
                } else if (member.roleId == 2) {
                    return "成员";
                }

                return "未知";
            }

            // 跳至用户页
            $scope.goUserPage = function (member) {
                util.goUserSite('/' + member.userInfo.username);
            }

            $scope.$watch('$viewContentLoaded', function () {
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
            });
        }]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
        }
    };
})

/*
 ```@wiki/js/organizationMemberList
 {
    "username": "xiaoyao",
    "sitename": "xiaoyao"
 }
 ```
 */