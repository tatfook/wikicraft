/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app', 'helper/util', 'text!html/apps.html'], function (app, util, htmlContent) {
    app.controller('appsController', ['$scope', '$location', '$anchorScroll', '$timeout', function ($scope, $location, $anchorScroll, $timeout) {
        $scope.recommentApps = [
            {
                "name":"Paracraft创意空间",
                "title":"创造3D交互动画，学习编程",
                "siteUrl":"http://keepwork.com/paracra/logitow",
                "logoUrl":"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501572349355.png",
                "bgUrl":"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501568724020.jpeg"
            },
            {
                "name":"3D 校园",
                "title":"3D虚拟校园",
                "siteUrl":"http://keepwork.com/paracra/logitow",
                "logoUrl":"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501664783232.png",
                "bgUrl":"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501568671970.png"
            },
            {
                "name":"3D打印",
                "title":"3D打印网络平台",
                "siteUrl":"http://keepwork.com/paracra/logitow",
                "logoUrl":"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501664852120.png",
                "bgUrl":"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501664952194.png"
            },
            {
                "name":"NPL CAD",
                "title":"基于编程的计算机辅助设计",
                "siteUrl":"http://keepwork.com/paracra/logitow",
                "logoUrl":"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501664890190.png",
                "bgUrl":"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501568699132.jpeg"
            }
        ];
        $scope.classApps = [
            {
                "classes":"创作工具",
                "targetId":"chuangzuogongju",
                "info":"让你的网站更加生动的创作工具",
                "apps":[
                    {
                        "name":"Paracraft创意空间",
                        "details":"创造3D交互动画，学习计算机编程...",
                        "siteUrl":"#",
                        "logoUrl":"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501572349355.png"
                    },
                    {
                        "name":"PAC 3D创意大赛",
                        "details":"参加比赛，交流分享，制作出有意义的个人电脑作品...",
                        "siteUrl":"#",
                        "logoUrl":"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501572329890.png"
                    }
                ]
            },
            {
                "classes":"教育平台",
                "targetId":"jiaoyupingtai",
                "info":"终身学习，有教无类，人人可为师",
                "apps":[
                    {
                        "name":"道峰教育",
                        "details":"创造3D交互动画，学习计算机编程...",
                        "siteUrl":"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501572342939.png",
                        "logoUrl":""
                    }
                ]
            },
            {
                "classes":"百科和知识库",
                "targetId":"baikehezhishiku",
                "info":"终身学习，有教无类，人人可为师",
                "apps":[
                    {
                        "name":"道峰教育",
                        "details":"创造3D交互动画，学习计算机编程...",
                        "siteUrl":"#",
                        "logoUrl":""
                    }
                ]
            },
            {
                "classes":"编程",
                "targetId":"biancheng",
                "info":"终身学习，有教无类，人人可为师",
                "apps":[
                    {
                        "name":"NPL CAD",
                        "details":"基于编程的计算机辅助设计",
                        "siteUrl":"#",
                        "logoUrl":""
                    }
                ]
            },
            {
                "classes":"个人医生",
                "targetId":"gerenyisheng",
                "info":"终身学习，有教无类，人人可为师",
                "apps":[
                    {
                        "name":"道峰教育",
                        "details":"创造3D交互动画，学习计算机编程...",
                        "siteUrl":"#",
                        "logoUrl":""
                    }
                ]
            }
        ];
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
            var scrollTop = $(window).scrollTop();
            if (scrollTop >= affixTop){
                affix.addClass("active");
            }else{
                affix.removeClass("active");
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
            console.log("appsController");
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

        $scope.$watch('$viewContentLoaded', init);
    }]);

    return htmlContent;
});