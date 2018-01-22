/**
 * Created by wuxiangan on 2017/3/16.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'helper/datasource',
    'helper/markdownwiki',
    'markdown-it',
    'text!html/user.html',
    'echarts-radar',
    'contribution-calendar'
], function (app, util, storage, datasource, markdownwiki, markdownit, htmlContent, echartsRadar) {
    //console.log("load userController file");

    app.registerController('userController', ['$rootScope', '$scope','Account','Message', 'modal', function ($rootScope, $scope, Account, Message, modal) {
        const UserSystemProjectName = "keepworkdatasource";
        const ProfileDataFileName = "profile.md";
        var splitMainContent = function(origionContent){
            console.log(origionContent);
            origionContent = origionContent.split("```");
            var topContent= [],subContent = [];
            var topContentReg = /^@profile\/js\/(headerinfo|controls)/i;
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

        var getUserProfileData = function(userDataSource){
            var profileDataPath = '/'+ userDataSource.keepwrokUsername +'_datas/' + ProfileDataFileName;
            console.log(profileDataPath);
            userDataSource.getFile({path: profileDataPath}, function (data) {
                var content = data.content || "";
                var mdContent = splitMainContent(content);
                console.log(mdContent);
                var md = markdownwiki({breaks: true, isMainMd:true});
                var topHtml = md.render(mdContent.topContent);
                util.html("#user-maincontent", topHtml);
            
                $rootScope.subMdContent = mdContent.subContent;
                
            }, function(err){
                console.log(err);
            });
        }
        var getProfileData = function(username){
            util.post(config.apiUrlPrefix + 'site_data_source/getByUsername', {username: username}, function (data) {
                var sources = data || [];
                var systemSource = sources.filter(function(source){
                    return source.projectName === UserSystemProjectName;
                });
                var DataSource = dataSource.getUserDataSource(username);
                DataSource.init(systemSource);
                var userSystemDataSource = DataSource.getDefaultDataSource();
                console.log(userSystemDataSource);
                getUserProfileData(userSystemDataSource);
            });
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
            console.log(username);
            getProfileData(username);

            util.post(config.apiUrlPrefix + 'user/getDetailByName', {username:username}, function (data) {
                if (!data) {
                    console.error("用户信息不存在");
                    return ;
                }
                // 用户信息
                $scope.userinfo = data.userinfo;
                // $scope.selfOrganizationList = data.selfOrganizationObj.siteList;
                // $scope.selfOrganizationCount = data.selfOrganizationObj.siteList.length;
                // $scope.joinOrganizationList = data.joinOrganizationObj.siteList;
                // $scope.joinOrganizationCount = data.joinOrganizationObj.siteList.length;
                // $scope.hotSiteList = data.hotSiteObj.siteList;
                // $scope.hotSiteTotal=data.hotSiteObj.siteList.length;
                // $scope.allSiteList = data.allSiteList;
                // $scope.allSiteTotal = data.allSiteList.length;
                // // 粉丝
                // $scope.fansList = data.fansObj.userList;
                // $scope.fansCount = data.fansObj.total;
                // // 关注的用户
                // $scope.followUserList = data.followObj.followUserObj.userList;
                // $scope.followUserTotal = data.followObj.followUserObj.total;
                // // 关注的站点
                // $scope.followSiteList = data.followObj.followSiteObj.siteList;
                // $scope.followSiteTotal = data.followObj.followSiteObj.total;
                // // 用户动态
                // $scope.trendsList = data.trendsObj.trendsList;
                // $scope.trendsCount = data.trendsObj.total;
                // $scope.active = data.activeObj;
                // contributionCalendar("contributeCalendar",$scope.active);
            });
        }
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
