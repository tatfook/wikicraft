/**
 * Created by wuxiangan on 2017/3/9.
 */


define(['app',
    'helper/util',
    'helper/storage',
    'text!html/findPwd.html',
], function (app, util, storage, htmlContent) {
    app.registerController('findPwdController', ['$scope', '$location', 'Account', 'Message','modal', function ($scope, $location, Account, Message,modal) {
        var getUrlParam=function (param) {
            var reg = new RegExp("(^|&)" + param + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
            var r = window.location.search.substr(1).match(reg);  //匹配目标参数
            if (r != null) return r[2]; //返回参数值
        }
        $scope.step = getUrlParam("step") || 1;
        $scope.isModal=false;
        function init() {
            // $scope
            // .githubDS = $scope.user.githubDS;
        }

        $scope.$watch('viewContentLoaded', init);
        var sendEmail=function (email) {
            util.post(config.apiUrlPrefix + 'user/findPwdOne', {email:email}, function (data) {
                Message.info("邮件发送成功，请查收。3s后该页面自动返回登录页");
                setTimeout(function () {
                    history.back();
                },3000);
            },function (err) {
                // console.log(err);
                Message.info(err.message);
            });
        }

        var savePwd=function (pwd) {
            var key=getUrlParam("key");
            var email=getUrlParam("email");
            if(!key || !email || !pwd){
                return ;
            }
            util.post(config.apiUrlPrefix + 'user/findPwdTwo', {email:email,key:key,password:pwd}, function (data) {
                $scope.step++;
            },function (err) {
                // console.log(err);
                Message.info(err.message);
            });
        }

        $scope.nextStep=function () {
            $scope.errorMsg="";
            if($scope.step==1){
                var email=$scope.email? $scope.email.trim():"";
                if(!email){
                    $scope.errorMsg="请输入您的邮箱";
                    return;
                }
                var reg=/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                if(!reg.test(email)){
                    $scope.errorMsg="请输入正确的邮箱";
                }else{
                    sendEmail(email);
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
                savePwd(pwd);
                // console.log("保存密码");
                // $scope.step++;
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
                    // console.log(result);
                    // nowPage.replaceSelection(login.content);
                }, function (result) {
                    // console.log(result);
                });
            }else{
                util.go("home");
            }
        }
        $scope.$watch('$viewContentLoaded', init);
    }]);

    return htmlContent;
});
