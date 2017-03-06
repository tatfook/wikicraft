/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app',
    'helper/util',
    'helper/storage',
    'text!html/userCenter.html',
    'cropper',
], function (app, util, storage, htmlContent) {
    app.registerController('userCenterController', ['$scope', '$state', 'Account', 'Message', 'github', function ($scope, $state, Account, Message, github) {
        $scope.passwordObj = {};
        $scope.fansWebsiteId = "0";
        $scope.showItem = 'myProfile';
        $scope.totalItems = 0;
        $scope.currentPage = 1;
        $scope.pageSize = 5;

        function init() {
            $('#cropper > img').cropper({
                aspectRatio: 1 / 1,
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 0.65,
                restore: false,
                guides: false,
                highlight: false,
                cropBoxMovable: false,
                cropBoxResizable: false,
                ready: function () {
                    console.log("dfg");
                    var $clone = $(this).clone().removeClass('cropper-hidden');
                    console.log($(this));
                    $clone.css({
                        display: 'block',
                        width: "100%",
                        minWidth: 0,
                        minHeight: 0,
                        maxWidth: 'none',
                        maxHeight: 'none'
                    });

                    $previews.css({
                        overflow: 'hidden'
                    }).html($clone);
                },
                crop: function (e) {
                    var imageData = $(this).cropper('getImageData');
                    var previewAspectRatio = e.width / e.height;

                    $previews.each(function () {
                        var $preview = $(this);
                        var previewWidth = $preview.width();
                        var previewHeight = previewWidth / previewAspectRatio;
                        var imageScaledRatio = e.width / previewWidth;

                        $preview.height(previewHeight).find('img').css({
                            width: imageData.naturalWidth / imageScaledRatio,
                            height: imageData.naturalHeight / imageScaledRatio,
                            marginLeft: -e.x / imageScaledRatio,
                            marginTop: -e.y / imageScaledRatio
                        });
                    });
                }
            });

            var changeBtn = $("#change-profile");
            var finishBtn = $("#finish");
            var cropper = $("#cropper");
            var dataForm = $("#data-form");

            $scope.fileUpload = function (e) {
                var file = e.target.files[0];
                // 只选择图片文件
                if (!file.type.match('image.*')) {
                    return false;
                }
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function (arg) {
                    if (!github.isInited()) {
                        Message.info("图片上传工能需要绑定github数据源!!!");
                        return;
                    }

                    github.uploadImage(undefined, arg.target.result, function (url) {
                        $scope.user.portrait = url;
                        $('#userPortraitId').attr('src', arg.target.result);
                        Message.info("图片上传成功")
                    }, function () {
                        Message.info("图片上传失败");
                    });
                    finishBtn.removeClass("sr-only");
                    cropper.removeClass("sr-only");
                    changeBtn.addClass("sr-only");
                    dataForm.addClass("sr-only")
                    var img = "<h4>修改头像</h4><img src='" + arg.target.result + "' alt='preview' />";
                    cropper.html(img);
                    var $previews = $('.preview');
                }
            };
            finishBtn.on("click", function () {
                changeBtn.removeClass("sr-only");
                cropper.html("");
                cropper.addClass("sr-only");
                finishBtn.addClass("sr-only");
                dataForm.removeClass("sr-only");
            });
        }

        // 文档加载完成
        $scope.$watch('$viewContentLoaded', init());

        // 保存用户信息
        $scope.saveProfile = function () {
            util.http("PUT", config.apiUrlPrefix + "user/updateUserInfo", $scope.user, function (data) {
                Account.setUser(data);
                Message.success("修改成功");
            });
        }

        // 修改密码
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

        // 获取激活样式
        $scope.getActiveStyleClass = function (showItem) {
            return $scope.showItem == showItem ? 'active' : '';
        }
        // 修改用户信息
        $scope.clickMyProfile = function () {
            $scope.showItem = 'myProfile';

        }

        // 账号安全
        $scope.clickAccountSafe = function () {
            $scope.showItem = 'accountSafe';
        }

        // 我的动态
        $scope.clickMyTrends = function () {
            $scope.showItem = 'myTrends';
        }

        // 我的收藏
        $scope.clickMyCollection = function () {
            $scope.showItem = 'myCollection';
            var isPersonalSite = true;

            function getSiteList(isPersonalSite, page) {
                var url = config.apiUrlPrefix + "user_favorite/getFavoriteUserListByUserId";
                var params = {userId: $scope.user._id, page: $scope.currentPage, pageSize: $scope.pageSize};
                if (!isPersonalSite) {
                    url = config.apiUrlPrefix + "user_favorite/getFavoriteWebsiteListByUserId";
                }

                util.post(url, params, function (data) {
                    $scope.totalItems = data.total;
                    $scope.favoriteList = data.favoriteList;
                });
            };

            $scope.clickCollectionUser = function () {
                console.log('clickCollectionUser');
                $scope.currentPage = 1;
                isPersonalSite = true;
                getSiteList(isPersonalSite, $scope.currentPage);
            };

            $scope.clickCollectionWorks = function () {
                console.log('clickCollectionWorks');
                $scope.currentPage = 1;
                isPersonalSite = false;
                getSiteList(isPersonalSite, $scope.currentPage);
            };

            $scope.pageChanged = function () {
                getSiteList(isPersonalSite, $scope.currentPage);
            };

            $scope.clickCollectionUser();
        }

        // 我的历史
        $scope.clickMyHistory = function () {
            $scope.showItem = 'myHistory';
            util.http("POST", config.apiUrlPrefix + 'website/getHistoryListByUserId', {userId: $scope.user._id}, function (data) {
                $scope.siteList = data; // 用户的建站列表
            });
        }

        // 我的粉丝
        $scope.clickMyFans = function () {
            $scope.showItem = 'myFans';

            util.post(config.apiUrlPrefix + "website/getWebsiteListByUserId", {userId: $scope.user._id}, function (data) {
                $scope.siteList = data;
                $scope.totalFavoriteCount = 0;
                for (var i = 0; i < $scope.siteList.length; i++) {
                    $scope.totalFavoriteCount += $scope.siteList[i].favoriteCount;
                }
                if ($scope.siteList.length > 0)
                    $scope.currentFansSite = $scope.siteList[0];
            });

            $scope.selectFansSite = function (fansSiteId) {
                var params = {userId: $scope.user._id}
                params.websiteId = fansSiteId == "0" ? undefined : parseInt(fansSiteId);
                util.http("POST", config.apiUrlPrefix + "user_favorite/getFansListByUserId", params, function (data) {
                    $scope.totalItems = data.total;
                    $scope.fansList = data.fansList || [];
                });
            }
            $scope.selectFansSite($scope.currentFansSite._id);
        }

        // 实名认证
        $scope.clickRealName = function () {
            $scope.showItem = 'realName';
        }

        // 邀请注册
        $scope.clickInvite = function () {
            $scope.showItem = 'invite';
        }

        // data source
        $scope.clickMyDataSource = function () {
            $scope.githubDS = $scope.user.githubDS;
        }

        $scope.githubDSChange = function () {
            if ($scope.githubDS) {
                Account.linkGithub();
            } else {
                Account.unlinkGithub();
            }
        }
    }]);

    return htmlContent;
});