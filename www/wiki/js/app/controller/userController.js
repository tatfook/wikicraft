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
        
    }]);

    app.registerController('userMsgCtrl', ['$scope', 'Account', function($scope, Account) {
        $scope.userinfo = {
            portrait: "http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1516090899563.png",
            displayName: "username",
            username:"username",
            joindate: "2016-09-12",
            location: "深圳",
            email:"8743927@outlook.com",
            worksCount: 4,
            favoriteCount: 12,
            fansCount: 35,
        };
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
                // $scope.userinfo = data.userinfo;
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

    return htmlContent;
});
