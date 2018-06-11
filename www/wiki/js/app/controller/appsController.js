/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app', 'helper/util', 'text!html/apps.html'], function (app, util, htmlContent) {
    app.controller('appsController', ['$scope', '$location', '$anchorScroll', '$timeout', '$translate', 'Message', function ($scope, $location, $anchorScroll, $timeout, $translate, Message) {
        $scope.developingLogo = config.keepworkOfficialGitHost + "/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1504863330607.png";
        $scope.isGlobalVersion = config.isGlobalVersion;
        $scope.recommentApps = [
            {
                "name": $translate.instant("Paracraft创意空间"),
                "title": $translate.instant("创造3D交互动画，学习编程"),
                "siteUrl":"http://www.paracraft.cn/",
                "bgColor":"#62A1E1",
                "globalVisible": true,
                "logoUrl":config.keepworkOfficialGitHost + "/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501572349355.png",
            },
            {
                "name": $translate.instant("3D校园"),
                "title": $translate.instant("3D虚拟校园"),
                "siteUrl":config.httpProto+"://keepwork.com/paracra/3dcampus",
                "bgColor":"#F5926E",
                "logoUrl":config.keepworkOfficialGitHost + "/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501664783232.png",
            },
            {
                "name": $translate.instant("3D打印"),
                "title": $translate.instant("3D打印网络平台"),
                "siteUrl":config.httpProto+"://keepwork.com/idreamtech/3dprint",
                "bgColor":"#91C3FF",
                "logoUrl":config.keepworkOfficialGitHost + "/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501664852120.png",
            },
            {
                "name": "NPL CAD",
                "title": $translate.instant("基于编程的计算机辅助设计"),
                "siteUrl":config.httpProto+"://keepwork.com/intro/keepwork/NPLCAD",
                "bgColor":"#7CCDF7",
                "globalVisible": true,
                "logoUrl":config.keepworkOfficialGitHost + "/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501664890190.png",
            }
        ];
        $scope.classApps = [
            {
                "classes": $translate.instant("创作工具"),
                "targetId":"chuangzuogongju",
                "info": $translate.instant("让你的网站更加生动的创作工具"),
                "globalVisible": true,
                "apps":[
                    {
                        "name": $translate.instant("Paracraft创意空间"),
                        "details": $translate.instant("创造3D交互动画，学习计算机编程..."),
                        "siteUrl":"http://www.paracraft.cn",
                        "globalVisible": true,
                        "logoUrl":config.keepworkOfficialGitHost + "/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501572349355.png"
                    },
                    {
                        "name": $translate.instant("3D打印"),
                        "details": $translate.instant("用户可以上传创作的3D模型，由云端进行3D打印变成实物并邮寄给用户"),
                        "siteUrl":config.httpProto+"://keepwork.com/idreamtech/3dprint",
                        "logoUrl":config.keepworkOfficialGitHost + "/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501664852120.png"
                    },
                    {
                        "name": $translate.instant("Mod 扩展"),
                        "details": $translate.instant("Paracraft Mod扩展包管理器"),
                        "globalVisible": true,
                        "siteUrl":config.httpProto+"://keepwork.com/wiki/mod/packages/index/paracraft",
                        "logoUrl":config.keepworkOfficialGitHost + "/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1503915567396.png"
                    }
                ]
            },
            {
                "classes": $translate.instant("教育平台"),
                "targetId":"jiaoyu",
                "info": $translate.instant("终身学习，有教无类，人人可为师"),
                "apps":[
                    {
                        "name": $translate.instant("道峰教育"),
                        "details": $translate.instant("创造3D交互动画，学习计算机编程..."),
                        "siteUrl":"#",
                        "logoUrl":config.keepworkOfficialGitHost + "/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501572342939.png"
                    },
                    {
                        "name": $translate.instant("PAC 3D创意大赛"),
                        "details": $translate.instant("参加比赛，交流分享，制作出有意义的个人电脑作品..."),
                        "siteUrl":config.httpProto+"://keepwork.com/official/pac2017",
                        "logoUrl":config.keepworkOfficialGitHost + "/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501572329890.png"
                    }
                ]
            },
            {
                "classes": $translate.instant("百科和知识库"),
                "targetId":"baikehezhishiku",
                "info": $translate.instant("大数据与个人百科平台"),
                "apps":[
                    {
                        "name": $translate.instant("十方百科"),
                        "details":"",
                        "siteUrl":config.httpProto+"://baike.keepwork.com/",
                        "logoUrl":config.keepworkOfficialGitHost + "/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1509613900057.png"
                    }
                ]
            },
            {
                "classes": $translate.instant("编程"),
                "targetId":"biancheng",
                "globalVisible": true,
                "info": $translate.instant("自学计算机编程语言，辅助设计"),
                "apps":[
                    {
                        "name": "NPL CAD",
                        "globalVisible": true,
                        "details": $translate.instant("基于编程的计算机辅助设计"),
                        "siteUrl":config.httpProto+"://keepwork.com/intro/keepwork/NPLCAD",
                        "logoUrl":config.keepworkOfficialGitHost + "/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501664890190.png"
                    }
                ]
            },
            {
                "classes": $translate.instant("社区"),
                "targetId":"shequ",
                "info": $translate.instant("多人在线虚拟社区，作品交流与分享平台"),
                "apps":[
                    {
                        "name": $translate.instant("3D校园"),
                        "details": $translate.instant("3D虚拟校园"),
                        "siteUrl":config.httpProto+"://keepwork.com/paracra/3dcampus",
                        "logoUrl":config.keepworkOfficialGitHost + "/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501664783232.png"
                    },
                    {
                        "name": $translate.instant("魔法哈奇3D社区"),
                        "details": $translate.instant("魔法哈奇3D社区"),
                        "siteUrl":config.httpProto+"://keepwork.com/official/haqi/",
                        "logoUrl":config.keepworkOfficialGitHost + "/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1502247463705.png"
                    }
                ]
            },
            {
                "classes": $translate.instant("健康"),
                "targetId": "jiankang",
                "globalVisible": true,
                "info": $translate.instant("学习医学知识， 每个人都是自己的医生"),
                "apps":[
                    {
                        "name": $translate.instant("中药溯源"),
                        "details": $translate.instant("提供中药溯源系统的公共查询服务"),
                        "siteUrl":config.httpProto+"://keepwork.com/idreamtech/zysy",
                        "logoUrl":config.keepworkOfficialGitHost + "/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1502249323964.png"
                    },
                    {
                        "name": $translate.instant("电子铜人"),
                        "globalVisible": true,
                        "details": $translate.instant("利用3D计算机技术展示人体内部结构"),
                        "siteUrl":config.httpProto+"://keepwork.com/idreamtech/dztr",
                        "logoUrl":config.keepworkOfficialGitHost + "/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1502248544807.png"
                    },
                    {
                        "name": $translate.instant("医时空"),
                        "details": $translate.instant("更懂中医馆的SaaS服务平台"),
                        "siteUrl":config.httpProto+"://www.sktcm.com",
                        "logoUrl":config.keepworkOfficialGitHost + "/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1509096193919.jpeg"
                    }
                ]
            },
            {
                "classes": $translate.instant("其它"),
                "targetId":"qita",
                "globalVisible": true,
                "info":"",
                "apps":[
                    {
                        "name": $translate.instant("逻辑塔线下积木"),
                        "globalVisible": true,
                        "details": $translate.instant("逻辑塔线下积木"),
                        "siteUrl":config.httpProto+"://keepwork.com/paracra/logitow",
                        "logoUrl":config.keepworkOfficialGitHost + "/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1502250031130.png"
                    }
                ]
            }
        ];

        var filterDataForGlobalVersion = function(list) {
          let result = list.filter(function(item) {
            return item.globalVisible
          }).map(function(item) {
            if (item.apps && item.apps.length) {
              item.apps = filterDataForGlobalVersion(item.apps)
            }
            return item;
          })
          return result
        }

        if ($scope.isGlobalVersion) {
          $scope.recommentApps = filterDataForGlobalVersion($scope.recommentApps)
          $scope.classApps = filterDataForGlobalVersion($scope.classApps)
        }

        var targets = {};

        $scope.goPart = function (event, app) {
            $location.hash(app.targetId);
            $anchorScroll();
            active($(event.target));
        };

        function active(targetObj) {
            $(".affix-ctrl .active").removeClass("active");
            targetObj.addClass("active");
        }

        function checkPosition(affix) {
            var affixTop = affix[0].offsetTop;
            var affixHeight = affix[0].offsetHeight;
            var documentHeight = Math.max($(document).height(), $(document.body).height());
            var winHeight = $(window).height();
            var affixBottom = documentHeight - affixTop - affixHeight;
            var scrollTop = $(window).scrollTop();
            var scrollBottom = documentHeight - scrollTop - winHeight;
            var affixCtrl = affix.find(".affix-ctrl");
            var affixCtrlHeight = affix.find(".affix-ctrl").height();
            if (affixCtrlHeight < (winHeight - affixBottom)){
                if (scrollTop >= affixTop){
                    affix.addClass("active");
                    affix.removeClass("bottom");
                    affixCtrl.css({"top":""});
                }else{
                    affix.removeClass("active");
                    affix.removeClass("bottom");
                    affixCtrl.css({"top":""});
                }
            }else{
                if ((scrollTop >= affixTop && scrollBottom > affixBottom)){
                    affix.addClass("active");
                    affix.removeClass("bottom");
                    affixCtrl.css({"top":""});
                }else if (scrollBottom < affixBottom){
                    affix.addClass("bottom");
                    affix.removeClass("active");
                    var offsetTop = documentHeight - affixBottom - affixCtrlHeight - affixTop - 52;
                    affixCtrl.css({"top":offsetTop+"px"});
                }else{
                    affix.removeClass("active");
                    affix.removeClass("bottom");
                    affixCtrl.css({"top":""});
                }
            }
        }

        function scrollProcess(scrollElement) {
            scrollTimer && clearTimeout(scrollTimer);
            var scrollTimer = setTimeout(function () {
                checkPosition($scope.affix);
                var scrollTop = scrollElement.scrollTop();
                var classApps = $scope.classApps;
                var classAppsLen = classApps.length;
                for (var i=0; i<classAppsLen; i++ ){
                    var tempTargetId = classApps[i].targetId;
                    if (targets[tempTargetId]){
                        if (!targets[tempTargetId].offsetTop){
                            targets[tempTargetId].offsetTop = $("#"+tempTargetId)[0].offsetTop + $scope.affix[0].offsetTop;
                        }
                        if (scrollTop <= targets[tempTargetId].offsetTop){
                            $scope.activeItemId = tempTargetId;
                            util.$apply();
                            break;
                        }
                    }else{
                        targets[classApps[i].targetId] = classApps[i];
                    }
                }
            }, 100);
        }

        function init() {
            // console.log("appsController");
            $scope.affix = $("#affix");
            $timeout(function () {
                $anchorScroll.yOffset = 60;
                $anchorScroll();
                $scope.activeItemId = $location.hash() || $scope.classApps[0].targetId;
                checkPosition($scope.affix);
            });
        }

        $(window).on("scroll", function () {
            scrollProcess($(window));
        });

        $(document).keyup(function (event) {
            if(event.keyCode=="13" && $("#searchBox").is(":focus")){
                Message.info("搜索功能开发中！");
                $scope.searchText = "";
            }
        });

        $scope.$watch('$viewContentLoaded', init);
    }]);

    return htmlContent;
});
