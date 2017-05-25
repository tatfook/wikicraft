/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'text!wikimod/wiki/html/siteMemberManage.html'
], function (app, util, storage, htmlContent) {

    function getModParams(wikiblock) {
        var modParams = wikiblock.modParams || storage.sessionStorageGetItem("wikiModParams") || {};
        return angular.copy(modParams);
    }


    function registerController(wikiblock) {
        app.registerController('siteMemberManageController',['$scope', function ($scope) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            var modParams = getModParams(wikiblock);
            var userinfo = undefined;
            var siteinfo = undefined;

            function init() {
                $scope.clickMember();
            }

            // 获取组织成员
            $scope.clickMember = function () {
                util.post(config.apiUrlPrefix + 'website_member/getByWebsiteId', {websiteId:siteinfo._id}, function (data) {
                    data = data || {};
                    $scope.memberList = data.memberList;
                });
            }

            // 获取组织申请成员
            $scope.clickApply = function () {
                util.post(config.apiUrlPrefix + 'website_member/getApplyByWebsiteId', {websiteId:siteinfo._id}, function (data) {
                    data = data || {};
                    $scope.applyList = data.memberList;
                });
            }

            // 移除成员
            $scope.removeMember = function (member) {
                util.post(config.apiUrlPrefix + 'website_member/deleteById', member, function () {
                   member.isDelete = true;
                });
            }

            // 设置或取消管理员
            $scope.setManager = function (member) {
                if (member.roleId == 1) {
                    util.post(config.apiUrlPrefix + 'website_member/unsetManager', member, function () {
                        member.roleId = 2;  // 普通用户角色ID为1
                    });
                } else {
                    util.post(config.apiUrlPrefix + 'website_member/setManager', member, function () {
                        member.roleId = 1;  // 管理员角色ID为1
                    });
                }
            }

            // 同意成员加入
            $scope.clickAgreeMemeber = function (apply) {
                util.post(config.apiUrlPrefix + 'website_member/agreeMemberApply', apply, function () {
                    apply.isDelete = true;
                    console.log("同意成员加入");
                });
            }

            // 拒绝成员加入
            $scope.clickRefuseMember = function (apply) {
                util.post(config.apiUrlPrefix + 'website_member/deleteById', apply, function () {
                    apply.isDelete = true;
                    console.log("拒绝成员加入");
                });
            }

            $scope.$watch('$viewContentLoaded', function () {
                if (modParams.username && modParams.sitename) {
                    util.post(config.apiUrlPrefix + "website/getUserSiteInfo", {username:modParams.username, sitename:modParams.sitename}, function (data) {
                        userinfo = data.userinfo;
                        siteinfo = data.siteinfo;
                        userinfo && siteinfo && init();
                    });
                }
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
 ```@wiki/js/orgManage
 ```
 */