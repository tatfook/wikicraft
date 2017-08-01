/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app', 'helper/util', 'text!html/apps.html'], function (app, util, htmlContent) {
    app.controller('appsController', ['$scope', function ($scope) {
        $scope.recommentApps = [
            {
                "name":"Paracraft创意空间",
                "title":"创造3D交互动画，学习编程",
                "siteUrl":"http://keepwork.com/paracra/logitow",
                "logoUrl":"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501568724020.jpeg"
            },
            {
                "name":"3D 校园",
                "title":"3D虚拟校园",
                "siteUrl":"http://keepwork.com/paracra/logitow",
                "logoUrl":"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501568671970.png"
            },
            {
                "name":"3D打印",
                "title":"3D打印网络平台",
                "siteUrl":"http://keepwork.com/paracra/logitow",
                "logoUrl":"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501568685858.jpeg"
            },
            {
                "name":"NPL CAD",
                "title":"基于编程的计算机辅助设计",
                "siteUrl":"http://keepwork.com/paracra/logitow",
                "logoUrl":"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1501568699132.jpeg"
            }
        ];
        $scope.classApps = [
            {
                "classes":"创作工具",
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

        function init() {
            console.log("appsController");
        }

        $scope.$watch('$viewContentLoaded', init);
    }]);

    return htmlContent;
});