/**
 * Created by wuxiangan on 2017/3/16.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'text!html/user.html',
    'echarts-radar',
    'contribution-calendar'
], function (app, util, storage, htmlContent, echartsRadar) {
    //console.log("load userController file");

    app.registerController('userController', ['$scope','Account','Message', 'modal', function ($scope, Account, Message, modal) {
        function init(userinfo) {
            var username = $scope.urlObj.username.toLowerCase();;
            if (!username && userinfo && userinfo.username) {
                username = userinfo.username;
            }
            if (!username) {
                console.error("用户名不存在");
                return;
            }

            util.post(config.apiUrlPrefix + 'user/getDetailByName', {username:username}, function (data) {
                if (!data) {
                    console.error("用户信息不存在");
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
                contributionCalendar("contributeCalendar",$scope.active);
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

    app.registerController('userMsgCtrl', ['$scope', 'Account', function($scope, Account) {
        // $scope.userinfo = {
        //     portrait: "http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1516090899563.png",
        //     displayName: "username",
        //     username:"username",
        //     joindate: "2016-09-12",
        //     location: "深圳",
        //     email:"8743927@outlook.com",
        //     worksCount: 4,
        //     favoriteCount: 12,
        //     fansCount: 35,
        // };
        
    }]);

    app.registerController('worksCtrl', ['$scope', function($scope){
        $scope.works = [
            {
                logoUrl:"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1516099391929.jpeg",
                title:"日常摄影作品",
                workLink:"/photograph/page01",
                desc:"介绍日常生活中容易拍摄的照片",
                tags:["摄影","任务","记录"],
                visitCount:253,
                favoriteCount:43
            },
            {
                logoUrl:"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1516099391929.jpeg",
                title:"code",
                workLink:"/photograph/page01",
                desc:"介绍日常生活中容易拍摄的照片",
                tags:["编程","ui"],
                visitCount:253,
                favoriteCount:43
            }
        ];
    }]);

    app.registerController('skillCtrl', ['$scope', function($scope){
        $scope.skills = [
            {
                title:"研发",
                desc: "",
                level: 5
            },
            {
                title:"团队领导力",
                desc: "",
                level: 5
            },
            {
                title:"顾客服务",
                desc: "",
                level: 3
            },
            {
                title:"项目管理",
                desc: "",
                level: 4
            },
            {
                title:"业务开发",
                desc: "",
                level: 2
            },
            {
                title:"测试",
                desc: "",
                level: 1
            },
            {
                title:"自动化",
                desc: "",
                level: 1
            },
            {
                title:"分布式系统",
                desc: "",
                level: 1
            }
        ];

        var initRadar = function(){
            var option = {
                tooltip: {},
                radar: {
                    // shape: 'circle',
                    name: {
                        textStyle: {
                            color: '#FFF',
                            backgroundColor: '#999',
                            borderRadius: 3,
                            padding: [3, 5],
                            fontSize:"20px" 
                       }
                    },
                    indicator: [
                       { name: '技能一', max: 5, color:"#666"},
                       { name: '技能二', max: 5, color:"#666"},
                       { name: '技能三', max: 5, color:"#666"},
                       { name: '技能四', max: 5, color:"#666"},
                       { name: '技能五', max: 5, color:"#666"}
                    ],
                    splitArea:{
                        areaStyle:{
                            color:["#66B8FF", "#7FC4FF", "#99D0FF", "#BBE0FF", "#E0F1FF"]
                        }
                    },
                    splitLine:{
                        lineStyle:{
                            color:["transparent"]
                        }
                    },
                    axisLine:{
                        lineStyle:{
                            color:"#FFF",
                            type: "dashed",
                        }
                    }
                },
                series: [{
                    name: '预算 vs 开销（Budget vs spending）',
                    type: 'radar',
                    // areaStyle: {normal: {}},
                    data : [
                        {
                            value : [5, 5, 2, 3, 4],
                            name : '预算分配（Allocated Budget）'
                        }
                    ]
                }]
            };

            var radarContainer = document.getElementById("skillRadar");
            var radarEchartsObj = echartsRadar.init(radarContainer);
            radarEchartsObj.setOption(option, true);

        }

        $scope.$watch('$viewContentLoaded', initRadar);
        
    }]);

    app.registerController('experienceCtrl', ['$scope', function($scope){
        $scope.experiences = [
            {
                title:"学习C语言",
                link:"http://www.baidu.com",
                startDate: "2017-06-09",
                endDate:"2017-11-06"
            },
            {
                title:"学习C语言学习C语言学习C语言",
                link:"http://www.baidu.comhttp://www.baidu.comhttp://www.baidu.comhttp://www.baidu.comhttp://www.baidu.com",
                startDate: "2017-06-09",
                endDate:"2017-11-06"
            }
        ];
    }]);

    app.registerController('certificationCtrl', ['$scope', function($scope){
        $scope.certifications = [
            {
                title:"初级计算机资格",
                link:"http://www.baidu.com",
                time:"2017-06-09"
            },
            {
                title:"初级计算机资格初级计算机资格",
                link:"http://www.baidu.comhttp://www.baidu.comhttp://www.baidu.comhttp://www.baidu.comhttp://www.baidu.com",
                time:"2017-06-09"
            }
        ];
    }]);

    app.registerController('activenessCtrl', ['$scope', function($scope){
        var initContributionCalendar = function(){
            // $scope.active = {
            //     year:'2018',
            //     username:'kaitlyn',
            //     active:{},
            // };
            // contributionCalendar("contributeCalendar",$scope.active);
        }
        $scope.$watch('$viewContentLoaded', function(){
            initContributionCalendar();
        })
    }]);

    app.registerController('activitiesCtrl', ['$scope', function($scope){
        // $scope.trendsList = [
        //     {
        //         desc:"你关注的网站#作品名#已经更新#",
        //         updateDate:"2017-06-09 11:12:13"
        //     },
        //     {
        //         desc:"你关注的作者#作者#名已经更新#",
        //         updateDate:"2017-06-08 11:12:13"
        //     },
        //     {
        //         desc:"你创建了网站#网站名#",
        //         updateDate:"2017-06-07 11:12:13"
        //     }
        // ];
        // $scope.trendsCount = 4;

        $scope.loadActivity = function(){
            console.log("加载更多活动。。。");
        }
    }]);

    return htmlContent;
});
