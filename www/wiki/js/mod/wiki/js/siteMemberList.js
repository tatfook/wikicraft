/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'text!wikimod/wiki/html/siteMemberList.html'
], function (app, util, storage, htmlContent) {

    function getModParams(wikiblock) {
        var modParams = wikiblock.modParams || storage.sessionStorageGetItem("wikiModParams") || {};
        return angular.copy(modParams);
    }

    function registerController(wikiblock) {
        app.registerController('siteMemberListController', ['$scope', '$rootScope', function ($scope, $rootScope) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            var modParams = getModParams(wikiblock);
            var userinfo = $rootScope.userinfo;
            var siteinfo = $rootScope.siteinfo;
            $scope.start=0;
            $scope.modParams=modParams;

            // 初始化信息
            function init() {
                $scope.memberList = $scope.modParams.memberList || [];
                util.post(config.apiUrlPrefix + 'website_member/getByWebsiteId', {
                    page: 1,
                    pageSize: 8,
                    websiteId: siteinfo._id
                }, function (data) {
                    data = data || {};
                    $scope.memberList = $scope.memberList.concat(data.memberList);
                });
            }

            // 跳至用户页
            $scope.goUserPage = function (member) {
                util.go('/' + member.username);
            }

            $scope.$watch('$viewContentLoaded', function () {
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

            if($scope.modParams.moduleKind=="gameDemo"){
                $scope.modParams.nowPage=1;
                $scope.modParams.step=8;
                $scope.modParams.paging=getPaging($scope.modParams.step,$scope.modParams.memberList.length);

                $scope.modParams.changePage=function (page) {
                    if(page <= $scope.modParams.paging.length){
                        $scope.modParams.nowPage=page;
                    }
                }
            }

            function getPaging (step,objLen) {
                var result=[];
                var index=1;
                while(index<=(Math.ceil(objLen/step))){
                    result.push(index);
                    index++;
                }
                return result;
            }
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
 ```@wiki/js/siteMemberList
 {
    "username": "xiaoyao",
    "sitename": "xiaoyao"
 }
 ```
 */
/*
 ```@wiki/js/siteMemberList
 {
 "moduleKind":"game",
 "title":"比赛评委成员"
 }
 ```
 */
/*
 ```@wiki/js/siteMemberList
 {
 "moduleKind":"gameDemo",
 "title":"评委成员（手动配置）",
 "memberList":[
 {
 "imgUrl":"",
 "username":"用户名1",
 "roleName":"创建者"
 },
 {
 "imgUrl":"",
 "username":"用户名2",
 "roleName":"创建者"
 },
 {
 "imgUrl":"",
 "username":"用户名3",
 "roleName":"创建者"
 },
 {
 "imgUrl":"",
 "username":"用户名4",
 "roleName":"创建者"
 },
 {
 "imgUrl":"",
 "username":"用户名5",
 "roleName":"创建者"
 },
 {
 "imgUrl":"",
 "username":"用户名6",
 "roleName":"创建者"
 },
 {
 "imgUrl":"",
 "username":"用户名7",
 "roleName":"创建者"
 },
 {
 "imgUrl":"",
 "username":"用户名8",
 "roleName":"创建者"
 },
 {
 "imgUrl":"",
 "username":"用户名9",
 "roleName":"创建者"
 },
 {
 "imgUrl":"",
 "username":"用户名10",
 "roleName":"成员"
 }
 ]
 }
 ```
 */