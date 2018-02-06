/**
 * Created by wuxiangan on 2017/3/16.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'text!html/user.html',
    'contribution-calendar'
], function (app, util, storage, htmlContent) {
    //console.log("load userController file");

    app.registerController('userController', ['$scope','Account','Message', 'modal', function ($scope, Account, Message, modal) {
        function init(userinfo) {
            var username = $scope.urlObj.username;
            if (!username && userinfo && userinfo.username) {
                username = userinfo.username;
            }
            if (!username) {
				util.go("home");
                return;
            }
			username = username.toLowerCase();
            util.post(config.apiUrlPrefix + 'user/getDetailByName', {username:username}, function (data) {
                if (!data) {
					util.go("home");
                    return ;
                }
                // 用户信息
                $scope.userinfo = data.userinfo;
                $scope.selfOrganizationList = data.selfOrganizationObj.siteList;
                $scope.selfOrganizationCount = data.selfOrganizationObj.siteList.length;
                $scope.joinOrganizationList = data.joinOrganizationObj.siteList;
                $scope.joinOrganizationCount = data.joinOrganizationObj.siteList.length;
                $scope.hotSiteList = data.hotSiteObj.siteList;
                $scope.hotSiteTotal=data.hotSiteObj.siteList.length;
                $scope.allSiteList = data.allSiteList;
                $scope.allSiteTotal = data.allSiteList.length;
                // 粉丝
                $scope.fansList = data.fansObj.userList;
                $scope.fansCount = data.fansObj.total;
                // 关注的用户
                $scope.followUserList = data.followObj.followUserObj.userList;
                $scope.followUserTotal = data.followObj.followUserObj.total;
                // 关注的站点
                $scope.followSiteList = data.followObj.followSiteObj.siteList;
                $scope.followSiteTotal = data.followObj.followSiteObj.total;
                // 用户动态
                $scope.trendsList = data.trendsObj.trendsList;
                $scope.trendsCount = data.trendsObj.total;
                $scope.active = data.activeObj;
                if(data.activeObj){
                    data.activeObj.before="calendarSibling";//插入在某个子元素的前面，默认在子元素的尾部，
                    contributionCalendar("contributeCalendar",data.activeObj);
                }else{
                    contributionCalendar("contributeCalendar",{before:"calendarSibling"});
                }

                if ($scope.user && $scope.user._id) {
                    util.post(config.apiUrlPrefix + "user_fans/isAttented", {userId:$scope.userinfo._id, fansUserId:$scope.user._id}, function (data) {
                        $scope.concerned = data;
                        $scope.userinfo.concerned=data;
                    });
                }
            });

            // 获取参与的网站
            util.post(config.apiUrlPrefix + "site_user/getSiteListByMemberName", {
                memberName: username,
            }, function(data){
                $scope.joinSiteList = [];
                $scope.joinSiteTotal = 0;
                data = data || [];
                for (var i = data.length - 1; i>=0; i--){
                    if (data[i].siteinfo){
                        $scope.joinSiteList.push(data[i].siteinfo);
                        $scope.joinSiteTotal++;
                    }
                }
            }, function (err) {
                console.log(err);
            });
        }

        $scope.favoriteUser = function (fansUser, subInfo) {
            if (!$scope.userinfo) {
                $scope.concerned = !$scope.concerned;
                return;
            }

            if (!Account.isAuthenticated()) {
                Message.info("登录后才能关注");
                modal('controller/loginController', {
                    controller: 'loginController',
                    size: 'lg',
                    backdrop: true
                }, function (result) {
                    console.log(result);
                    // nowPage.replaceSelection(login.content);
                }, function (result) {
                    console.log(result);
                });
                return; // 登录后才能关注
            }

            fansUser = fansUser ? fansUser : $scope.userinfo;//关注该页面的用户，或者关注这个用户的粉丝

            if (!Account.isAuthenticated() || !$scope.user || $scope.user._id == fansUser._id) {
                Message.info("自己不关注自己");
                return; // 自己不关注自己
            }

            var ownUserFan = {
                "userId": fansUser._id,
                "fansUserId": $scope.user._id,
                "userinfo": $scope.user
            };

            if(fansUser.concerned){//取消关注
                util.post(config.apiUrlPrefix + 'user_fans/unattent', {userId:fansUser._id, fansUserId:$scope.user._id}, function () {
                    console.log("取消关注成功");
                    Message.info("取消关注成功");
                    fansUser.concerned=false;
                    if (subInfo && subInfo == "fansOpt"){
                        $.each($scope.fansList, function (index, fansItem) {
                            if (fansItem.fansUserId == $scope.user._id){
                                $scope.fansList[index].isDelete = true;
                            }
                        });
                        $scope.fansCount--;
                    }
                });
            }else{
                util.post(config.apiUrlPrefix + 'user_fans/attent', {userId:fansUser._id, fansUserId:$scope.user._id}, function () {
                    console.log("关注成功");
                    Message.info("关注成功");
                    fansUser.concerned=true;
                    if (subInfo && subInfo == "fansOpt"){
                        $scope.fansCount++;
                        $scope.fansList.push(ownUserFan);
                    }
                });
            }
        };
        
        $scope.isShowNavBar = function () {
            if ($scope.user && $scope.userinfo && $scope.user.username == $scope.userinfo.username) {
                return true;
            }
            return false;
        };

        $scope.loadActivity = function () {
            Message.info("暂无更多活动");
        };

        $scope.goUserSite = function (x) {
            util.goUserSite('/' + x.username + '/' + x.name, true);
        };

        $scope.goUserIndexPage = function (name) {
            util.go("/"+name);
        };
        $scope.goHelpPage = function () {
            util.go("knowledge");
        };

        $scope.goNewWebsitePage = function () {
            storage.sessionStorageSetItem('userCenterContentType', "newWebsite");
            util.go("userCenter");
        };
        
        $scope.goWebsitePage = function () {
            storage.sessionStorageSetItem('userCenterContentType', "websiteManager");
            util.go("userCenter");
        };
        
        $scope.goEditorPage = function () {
            util.go("wikieditor");
        };

        // 退出组织
        $scope.exitOrg = function (organization) {
            console.log(organization);
            config.services.confirmDialog({
                "title": "删除提醒",
                "theme": "danger",
                "confirmBtnClass": "btn-danger",
                "content": "确定退出 " + organization.siteinfo.name + " 组织？"
            },function () {
                util.post(config.apiUrlPrefix + 'website_member/deleteById', organization, function () {
                    organization.isDelete = true;
                    $scope.joinOrganizationCount--;
                });
            });
        };

        $scope.$watch('$viewContentLoaded', function () {
            //console.log("------------------init user controller----------------------");
            if ($scope.urlObj.username) {
                init();
            } else {
                if (Account.isAuthenticated()) {
                    Account.getUser(init);
                }
            }
        });
    }]);

    return htmlContent;
});
