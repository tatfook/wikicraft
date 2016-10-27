/**
 * Created by wuxiangan on 2016/10/24.
 */

app.controller('userCenterCtrl', function ($scope, $http, Account, FileUploader) {
    $scope.user = Account.getUser();
    $scope.passwordObj = {};
    $scope.tipInfo = "";
    $scope.modifyUserInfoOk = 0;
    $scope.modifyPasswordOk = 0;

    $('#uploadPortraitBtn').change(function (e) {
        var fileReader = new FileReader();
        fileReader.onload = function(){
            $('#portraitImg').attr('src',fileReader.result);
        };
        fileReader.readAsDataURL(e.target.files[0]);
    })
    
    // 获取用户信息
    util.http($http, "POST", config.apiUrlPrefix+'wxa_user',{_id:Account.getUser()._id}, function (data) {
        Account.setUser(data || {});
        $scope.user = Account.getUser();
    });

    $scope.modifyUserBaseInfo = function () {
        console.log($scope.user);
        util.http($http, "PUT", config.apiUrlPrefix+"wxa_user", $scope.user, function (data) {
            Account.setUser(data);
            $scope.tipInfo = "修改成功!!!";
            $scope.modifyUserInfoOk = true;
        })
    }
    
    $scope.modifyPassword = function () {
        if ($scope.passwordObj.newPassword1 != $scope.passwordObj.newPassword2) {
            $scope.tipInfo = "两次新密码不一致";
            $scope.modifyPasswordOk = false;
        }
    }
});