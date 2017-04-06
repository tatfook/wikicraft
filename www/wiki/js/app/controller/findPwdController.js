/**
 * Created by wuxiangan on 2017/3/9.
 */


define(['app',
    'helper/util',
    'helper/storage',
    'text!html/findPwd.html',
], function (app, util, storage, htmlContent) {
    app.registerController('findPwdController', ['$scope', 'Account', 'Message','modal', function ($scope, Account, Message,modal) {
        $scope.step = 1;
        $scope.isModal=false;
        function init() {
            // $scope
            // .githubDS = $scope.user.githubDS;
        }

        $scope.$watch('viewContentLoaded', init);
        $scope.sendEmail=function () {
            console.log("给邮箱发送邮件");
        }

        $scope.nextStep=function () {
            $scope.errorMsg="";
            if($scope.step==1){
                if(!$scope.email){
                    $scope.errorMsg="请输入您的邮箱";
                    return;
                }
                var email=$scope.email.trim();
                var reg=/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                if(!reg.test(email)){
                    $scope.errorMsg="请输入正确的邮箱";
                }else{
                    console.log("给邮箱发送邮件");
                    $scope.step++;
                }
            }else if($scope.step==2){
                if (!$scope.pwd || !$scope.pwd1){
                    $scope.errorMsg="密码为必填项";
                    return;
                }
                var pwd=$scope.pwd.trim();
                var pwd1=$scope.pwd1.trim();
                if(pwd!==pwd1){
                    $scope.errorMsg="两次输入的密码不相同";
                    return;
                }
                if(pwd.length<6 || pwd.length>20){
                    $scope.errorMsg="6-20位密码";
                    return;
                }
                console.log("保存密码");
                $scope.step++;
            }else if($scope.step==3){
                $scope.goLogin();
                return;
            }
        }

        $scope.goLogin=function () {
            if ($scope.isModal){
                $scope.$close("findPwd");
                modal('controller/loginController', {
                    controller: 'loginController',
                }, function (result) {
                    console.log(result);
                    // nowPage.replaceSelection(login.content);
                }, function (result) {
                    console.log(result);
                });
            }else{
                util.go("login");
            }
        }
        $scope.$watch('$viewContentLoaded', init);
    }]);

    return htmlContent;
});
