/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app', 'helper/util', 'helper/storage', 'text!html/userCenter.html'], function (app, util, storage, htmlContent) {
    app.registerController('userCenterController', ['$scope', '$state', 'Account', 'Message', function ($scope, $state, Account, Message) {
        //const github = ProjectStorageProvider.getDataSource('github');
        $scope.user = Account.getUser() || {};
        $scope.passwordObj = {};
        $scope.fansWebsiteId = "0";
        var userId = $scope.user._id;

        function init() {
            $('#uploadPortraitBtn').change(function (e) {
                var fileReader = new FileReader();
                fileReader.onload = function () {
                    $('#portraitImg').attr('src', fileReader.result);
                    /*
                    github.uploadImage("portrait", fileReader.reault, function (error, result, request) {
                        if (error) {
                            console.log("上传失败");
                        }
                        $scope.user.portrait = result.content.download_url;
                    });
                    */
                };
                fileReader.readAsDataURL(e.target.files[0]);
            });

            util.http("POST", config.apiUrlPrefix + "user_favorite/getFavoriteUserListByUserId", {}, function (data) {
                $scope.favoriteUserList = data || [];
            });
            util.http("POST", config.apiUrlPrefix + "user_favorite/getFavoriteWebsiteListByUserId", {}, function (data) {
                $scope.favoriteWebsiteList = data || [];
            });

        }

        // 修改用户信息
        $scope.modifyUserBaseInfo = function () {
            console.log($scope.user);
            util.http("PUT", config.apiUrlPrefix + "user", $scope.user, function (data) {
                Account.setUser(data);
                Message.success("修改成功");
            });
        }

        $scope.modifyPassword = function () {
            console.log($scope.passwordObj);
            if ($scope.passwordObj.newPassword1 != $scope.passwordObj.newPassword2) {
                Message.info("两次新密码不一致!!!");
                return;
            }
            var params = {oldpassword: $scope.passwordObj.oldPassword, newpassword: $scope.passwordObj.newPassword1};
            util.http("POST", config.apiUrlPrefix + "user/changepw", params, function (data) {
                Message.success("密码修改成功");
            }, function (error) {
                Message.info(error.message);
            });
        }

        $scope.clickBaseInfo = function () {
        }
        $scope.clickAccountSafe = function () {
        }

        // 获取用户收藏信息
        $scope.clickMyFavorite = function () {
            util.http("POST", config.apiUrlPrefix + 'user_favorite/getFavoriteUserListByUserId', {}, function (data) {
                $scope.favoriteUserList = data;
            });

            util.http("POST", config.apiUrlPrefix + "user_favorite/getFavoriteWebsiteListByUserId", {}, function (data) {
                $scope.favoriteWebsiteList = data;
            });
        }

        // 我的建站历史
        $scope.clickMyHistory = function () {
            util.http("POST", config.apiUrlPrefix + 'website/getHistoryListByUserId', {userId: userId}, function (data) {
                $scope.websiteList = data; // 用户的建站列表
            });
        }

        // 我的粉丝
        $scope.clickMyFans = function () {
            util.http("POST", config.apiUrlPrefix + "website/getWebsiteListByUserId", {userId: userId}, function (data) {
                $scope.websiteList = data;
            });

            util.http("POST", config.apiUrlPrefix + "user_favorite/getFansListByUserId", {userId: userId}, function (data) {
                $scope.fans = data || {};
            });
        }

        $scope.selectFansWebsite = function (fansWebsiteId) {
            var params = {userId: userId}
            params.websiteId = fansWebsiteId == "0" ? undefined : parseInt(fansWebsiteId);
            util.http("POST", config.apiUrlPrefix + "user_favorite/getFansListByUserId", params, function (data) {
                $scope.fans = data || {};
            });
        }
    }]);

    return htmlContent;
});