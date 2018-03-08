/**
 * Created by wuxiangan on 2017/3/16.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'helper/markdownwiki',
    'markdown-it',
    'text!html/user.html',
    'controller/notfoundController',
    'echarts-radar',
    'contribution-calendar'
], function (app, util, storage, markdownwiki, markdownit, htmlContent, notFoundHtmlContent, echartsRadar) {
    //console.log("load userController file");

    app.registerController('userController', ['$rootScope', '$scope', '$timeout', 'Account','Message', 'modal', function ($rootScope, $scope, $timeout, Account, Message, modal) {
        const UserSystemProjectName = "keepworkdatasource";
        const ProfileDataFileName = "profile.md";
        var topBlockList = [], subBlockList = [];
        var topMdContent;
        var userDataSource;
        var splitMainContent = function(origionContent){
            origionContent = origionContent.split("```");
            var topContent= [],subContent = [];
            var topContentReg = /^@(profile|page)\/js\/(headerinfo|controls|tags)/i;
            var subContentReg = /^@profile\/js\/(works|skills|experiences|certifications|contribution|activities)/i;
            origionContent.forEach(function(content){
                if (topContentReg.test(content)) {
                    topContent.push(content,"\n");
                } else if(subContentReg.test(content)){
                    subContent.push(content,"\n");
                }
            });
            return {
                'topContent': "```" + topContent.join('```'),
                'subContent': "```" + subContent.join('```'),
            }
        };

        // 新注册用户及老用户（个人信息md文件不存在处理）
        var createProfilePages = function(cb, errcb){
            var pagePrefix = '/'+ userDataSource.keepwrokUsername +'_datas/';
            var profilePagesList = [
                {
                    pagepath: pagePrefix + "profile.md",
                    contentUrl: "text!html/profiles/profile.md"
                },
                {
                    pagepath: pagePrefix + "site.md",
                    contentUrl: "text!html/profiles/site.md"
                },
                {
                    pagepath: pagePrefix + "contact.md",
                    contentUrl: "text!html/profiles/contact.md"
                }
            ];
            var fnList = [];
            profilePagesList.forEach(function(page){
                fnList.push(function(userDataSource, page){
                    return function(cb, errcb){
                        require([page.contentUrl], function(content){
                            userDataSource.writeFile({
                                path: page.pagepath,
                                content: content
                            }, function(){
                                cb && cb();
                            }, function(){
                            });
                        }, function(){
                            errcb && errcb();
                        })
                    }
                }(userDataSource, page));
            });
            util.sequenceRun(fnList, undefined, function(){
                cb && cb();
            }, function(){
                cb && cb();
            });
        }

        var getUserProfileData = function(){
            var profileDataPath = '/'+ userDataSource.keepwrokUsername +'_datas/' + ProfileDataFileName;
            userDataSource.getFile({path: profileDataPath, ref: 'master'}, function (data) {
                var md = markdownwiki({breaks: true, isMainMd:true});
                var content = data.content || "";
                var mdContent = splitMainContent(content);

                var mdSub = markdownwiki({breaks: true});
                topBlockList = mdSub.parse(mdContent.topContent);
                subBlockList = mdSub.parse(mdContent.subContent);

                topMdContent = mdContent.topContent;
                var topHtml = md.render(mdContent.topContent);
                util.html("#user-maincontent", topHtml);

                $rootScope.subMdContent = mdContent.subContent;
            }, function(err){
                console.log(err);
                util.html("#user-maincontent", notFoundHtmlContent);
                createProfilePages(function(){
                    getUserProfileData();
                });
            });
        }
        var getProfileData = function(username){
            util.post(config.apiUrlPrefix + 'site_data_source/getDefaultSiteDataSource', {username: username}, function (data) {
                var DataSource = dataSource.getUserDataSource(username);
                DataSource.init([data]); 
                // var userSystemDataSource = DataSource.getDefaultDataSource();
                var userSystemDataSource = DataSource.getDataSourceBySitename(username);

                $rootScope.userDataSource = userSystemDataSource;
                userDataSource = userSystemDataSource;
                getUserProfileData();
            });
        }

        var initState = function() {
            // isSelf: 自己
            $rootScope.isSelf = ($scope.user && $scope.userinfo && ($scope.user._id == $scope.userinfo._id));
            // isOthers: 他人(不包括自己和未登录)
            $rootScope.isOthers = ($scope.user && $scope.userinfo && ($scope.user._id != $scope.userinfo._id));
        }

        function init(userinfo) {
            var username = $scope.urlObj.username.toLowerCase();;
            if (!username && userinfo && userinfo.username) {
                username = userinfo.username;
            }
            if (!username) {
                console.error("用户名不存在");
                return;
            }
            getProfileData(username);

            util.post(config.apiUrlPrefix + 'user/getDetailByName', {username:username}, function (data) {
                if (!data) {
                    console.error("用户信息不存在");
                    return ;
                }
                // 用户信息
                $rootScope.userinfo = data.userinfo;
                // $scope.selfOrganizationList = data.selfOrganizationObj.siteList;
                // $scope.selfOrganizationCount = data.selfOrganizationObj.siteList.length;
                // $scope.joinOrganizationList = data.joinOrganizationObj.siteList;
                // $scope.joinOrganizationCount = data.joinOrganizationObj.siteList.length;
                // $scope.hotSiteList = data.hotSiteObj.siteList;
                // $scope.hotSiteTotal=data.hotSiteObj.siteList.length;
                $rootScope.allSiteList = data.allSiteList;
                // $scope.allSiteTotal = data.allSiteList.length;
                // // 粉丝
                $rootScope.fansList = data.fansObj.userList;
                $rootScope.fansCount = data.fansObj.total;
                // // 关注的用户
                $rootScope.followUserList = data.followObj.followUserObj.userList;
                $rootScope.followUserTotal = data.followObj.followUserObj.total;
                // // 关注的网页
                $rootScope.starredPages = data.starred_pages;
                // $scope.followSiteTotal = data.followObj.followSiteObj.total;
                // // 用户动态
                // $scope.trendsList = data.trendsObj.trendsList;
                // $scope.trendsCount = data.trendsObj.total;
                // $scope.active = data.activeObj;
                // contributionCalendar("contributeCalendar",$scope.active);
                initState();
                if ($scope.user && $scope.user._id) {
                    util.post(config.apiUrlPrefix + "user_fans/isAttented", {userId:$scope.userinfo._id, fansUserId:$scope.user._id}, function (data) {
                        $scope.userinfo.concerned=data;
                    });
                }
            });

            util.get(config.apiUrlPrefix + 'pages/updateVisitCount', {
                url: '/' + username
            });
        }

        var errorCount = 0;
        var saveNewProfileToGit = function(){
            var content = "";
            var subPartContent = "";
            topBlockList.map(function(block){
                content += block.content;
            });
            subBlockList.map(function(block){
                subPartContent += block.content;
            });
            $rootScope.subMdContent = subPartContent;
            content += subPartContent;
            var profileDataPath = '/'+ userDataSource.keepwrokUsername +'_datas/' + ProfileDataFileName;
            userDataSource.writeFile({
                path: profileDataPath,
                content: content
            }, function(){
                errorCount = 0;
                Message.info("修改成功");
            }, function(){
                errorCount ++;
                if (errorCount > 3) {
                    Message.danger("修改失败");
                    return;
                }
                saveNewProfileToGit();
                console.log("修改失败");
            });
        }

        $rootScope.$on("changeProfileMd", function(e, newBlockItem){
            var blockList = newBlockItem.isTopContent ? topBlockList : subBlockList;
            if (blockList.length <= 0) {
                return;
            }

            var blockIndex = newBlockItem.index;
            var newContent = newBlockItem.content;
            if (newBlockItem.isTopContent) {
                topBlockList[blockIndex].content = newContent;
            }else{
                subBlockList[blockIndex].content = newContent;
            }
            saveNewProfileToGit();
        });

        $scope.$on("onLogout", function(e) {
            $rootScope.isSelf = false;
            $rootScope.isOthers = false;
        });

        $scope.$on("onUserProfile", function(e) {
            initState();
        })

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
