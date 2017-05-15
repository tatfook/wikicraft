/**
 * Created by wuxiangan on 2017/3/7.
 */

define(['app',
    'helper/util',
    'helper/storage',
    'helper/dataSource',
    'text!html/userProfile.html',
    'cropper',
], function (app, util, storage,dataSource, htmlContent) {
    app.registerController('userProfileController', ['$scope', 'Account', 'Message', function ($scope, Account, Message) {
        $scope.passwordObj = {};
        $scope.fansWebsiteId = "0";
        $scope.showItem = 'myProfile';
        $scope.totalItems = 0;
        $scope.currentPage = 1;
        $scope.pageSize = 5;
        $scope.userEmail="";
        $scope.userPhone="";

        function getResultCanvas(sourceCanvas) {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            var width = sourceCanvas.width;
            var height = sourceCanvas.height;

            canvas.width = width;
            canvas.height = height;
            context.beginPath();
            context.rect(0,0,width,height);
            context.strokeStyle = 'rgba(0,0,0,0)';
            context.stroke();
            context.clip();
            context.drawImage(sourceCanvas, 0, 0, width, height);

            return canvas;
        }

        function init(userinfo) {
            $scope.user = userinfo || $scope.user;
            var changeBtn = $("#change-profile");
            var finishBtn = $("#finish");
            var cropper = $("#cropper");
            var dataForm = $("#data-form");

            if($scope.user.email){
                $scope.bindedEmail=true;
            }else{
                $scope.bindedEmail=false;
            }

            $scope.fileUpload = function (e) {
                var file = e.target.files[0];
                // 只选择图片文件
                if (!file.type.match('image.*')) {
                    return false;
                }
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function (arg) {
                    var croppedCanvas;
                    var resultCanvas;
                    $scope.arg=arg;
                    finishBtn.removeClass("sr-only");
                    cropper.removeClass("sr-only");
                    changeBtn.addClass("sr-only");
                    dataForm.addClass("sr-only")
                    var img = "<h4>修改头像</h4><img src='" + arg.target.result + "' alt='preview' />";
                    cropper.html(img);
                    var $previews = $('.preview');
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
                        build:function(){
                            var $clone = $(this).clone().removeClass('cropper-hidden');
                            $clone.css({
                                display: 'block',
                                width:"100%",
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

                            croppedCanvas=$(this).cropper('getCroppedCanvas');
                            resultCanvas=getResultCanvas(croppedCanvas);
                            $scope.imgUrl=resultCanvas.toDataURL();//产生裁剪后的图片的url
                        }
                    });
                }
            };
            finishBtn.on("click", function () {
                changeBtn.removeClass("sr-only");
                cropper.html("");
                cropper.addClass("sr-only");
                finishBtn.addClass("sr-only");
                dataForm.removeClass("sr-only");

                var defaultDataSource = dataSource.getDefaultDataSource();
                if (!defaultDataSource || !defaultDataSource.isInited()) {
                    Message.info("默认数据源失效");
                    return;
                }

                var imgUrl=$scope.imgUrl;
                defaultDataSource.uploadImage({content:imgUrl}, function (url) {
                    $scope.user.portrait = url;
                    $('#userPortraitId').attr('src', imgUrl);
                    // util.http("PUT", config.apiUrlPrefix + "user/updateUserInfo", $scope.user, function () {
                    //     Message.info("图片上传成功");
                    // });
                }, function () {
                    Message.info("图片上传失败");
                });
            });
        }

        $scope.$on('userCenterSubContentType', function (event, item) {
            //console.log(item);
            if (item == 'myProfile')
                $scope.clickMyProfile();
            else if(item == 'accountSafe')
                $scope.clickAccountSafe();
            else if(item == 'myTrends')
                $scope.clickMyTrends();
            else if(item == 'myCollection')
                $scope.clickMyCollection();
            else if(item == 'myHistory')
                $scope.clickMyHistory();
            else if(item == 'myFans')
                $scope.clickMyFans();
            else if(item == 'realName')
                $scope.clickRealName();
            else if(item == 'invite')
                $scope.clickInvite();
        });

        // 文档加载完成
        $scope.$watch('$viewContentLoaded', init);

        // 保存用户信息
        $scope.saveProfile = function () {
            var user = angular.copy($scope.user);
            user.dataSource = undefined;
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

        var sendEmail=function (email) {
            util.post(config.apiUrlPrefix + 'user/verifyEmailOne', {email:email}, function (data) {
                Message.info("邮件发送成功，请按邮件指引完成绑定");
            },function (err) {
                console.log(err);
                Message.info(err.message);
            });
        }

        //安全验证
        $scope.bind=function (type) {
            if(type=="email"){
                $scope.emailErrMsg="";
                var email=$scope.userEmail? $scope.userEmail.trim() : "";
                if(!email){
                    $scope.emailErrMsg="请输入需绑定的邮箱";
                    return;
                }

                var reg=/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                if(!reg.test(email)){
                    $scope.emailErrMsg="请输入正确的邮箱";
                }else{
                    sendEmail(email);
                }
                return;
            }
            if(type=="phone"){
                console.log("手机绑定开发中");
                $('#phoneModal').modal({})
                return;
            }
        }

        // 修改用户信息
        $scope.clickMyProfile = function () {
            $scope.showItem = 'myProfile';

        }

        // 账号安全
        $scope.clickAccountSafe = function () {
            $scope.showItem = 'accountSafe';

            var getUserThresServiceList = function () {
                util.post(config.apiUrlPrefix + 'user_three_service/getByUserId', {userId:$scope.user._id}, function (serviceList) {
                    $scope.userThreeServiceList = serviceList || [];
                });
            }

            $scope.isBindThreeService = function (serviceName) {
                //console.log($scope.userThreeServiceList, serviceName);
                for (var i = 0; $scope.userThreeServiceList && i < $scope.userThreeServiceList.length; i++) {
                    if ($scope.userThreeServiceList[i].serviceName == serviceName) {
                        return true;
                    }
                }
                return false;
            };

            $scope.bindThreeService = function(serviceName) {
                var serviceIndex = undefined;
                for (var i = 0; $scope.userThreeServiceList && i < $scope.userThreeServiceList.length; i++) {
                    if ($scope.userThreeServiceList[i].serviceName == serviceName) {
                        serviceIndex = i;
                    }
                }
                // 已存在则解绑
                if (serviceIndex >= 0) {
                    util.post(config.apiUrlPrefix + 'user_three_service/deleteById', {id:$scope.userThreeServiceList[serviceIndex]._id}, function () {
                       $scope.userThreeServiceList.splice(serviceIndex,1);
                    });
                } else {
                    Account.authenticate(serviceName, function () {
                        getUserThresServiceList();
                    });
                }
            };

            $scope.getBindServiceClass = function (serviceName) {
                return $scope.isBindThreeService(serviceName) ? "btn-outline" : "btn-primary";
            }

            getUserThresServiceList();
        }

        // 我的动态
        $scope.clickMyTrends = function () {
            $scope.showItem = 'myTrends';
            $scope.trendsType = "organization";
            getUserTrends();

            $scope.selectTrendsType = function (trendsType) {
                $scope.trendsType = trendsType;
            }

            function getUserTrends() {
                util.post(config.apiUrlPrefix + 'user_trends/get', {userId:$scope.user._id}, function (data) {
                    $scope.trendsList = data.trendsList;
                });
            }

            $scope.isShowTrend = function (trends) {
                var trendsTypeList = ["organization","favorite","works"];
                return  $scope.trendsType == trendsTypeList[trends.trendsType];
            }
        }

        // 我的收藏
        $scope.clickMyCollection = function () {
            $scope.showItem = 'myCollection';
            $scope.currentPage = 1;
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

            $scope.collectionPageChanged = function () {
                getSiteList(isPersonalSite, $scope.currentPage);
            };

            $scope.clickCollectionUser();
        }

        // 我的历史
        $scope.clickMyHistory = function () {
            $scope.showItem = 'myHistory';
            util.http("POST", config.apiUrlPrefix + 'user_visit_history/get', {userId: $scope.user._id}, function (data) {
                data = data || {};
                $scope.visitHistoryList = data.visitList; // 用户的建站列表
            });
        }

        // 我的粉丝
        $scope.clickMyFans = function () {
            $scope.showItem = 'myFans';
            $scope.currentPage = 1;

            util.post(config.apiUrlPrefix + "website/getAllByUserId", {userId: $scope.user._id}, function (data) {
                $scope.siteList = data;
                $scope.totalFavoriteCount = 0;
                for (var i = 0; i < $scope.siteList.length; i++) {
                    $scope.totalFavoriteCount += $scope.siteList[i].favoriteCount;
                }
                if ($scope.siteList.length > 0) {
                    $scope.currentFansSite = $scope.siteList[0];
                    getFansList();
                }
            });

            function getFansList() {
                var params = {
                    userId: $scope.user._id,
                    websiteId: $scope.currentFansSite._id,
                    page: $scope.currentPage,
                    pageSize: $scope.pageSize
                };
                util.http("POST", config.apiUrlPrefix + "user_favorite/getFansListByUserId", params, function (data) {
                    $scope.totalItems = data.total;
                    $scope.fansList = data.fansList || [];
                });
            }

            $scope.selectFansSite = function (site) {
                $scope.currentFansSite = site;
                getFansList();
            }

            $scope.fansPageChanged = function () {
                getFansList();
            }
        }

        // 实名认证
        $scope.clickRealName = function () {
            $scope.showItem = 'realName';
        }

        // 邀请注册
        $scope.clickInvite = function () {
            $scope.showItem = 'invite';

            $scope.inviteFriend = function () {
                if (!$scope.friendMail) {
                    Message.info("请正确填写好友邮箱地址!!!");
                    return ;
                }
                util.post(config.apiUrlPrefix + 'user/inviteFriend',{userId:$scope.user._id,username:$scope.user.username,friendMail:$scope.friendMail}, function () {
                   Message.info("邀请好友邮件已发送^-^");
                });
            }
        }

        Account.ensureAuthenticated(function () {
            Account.getUser(function (userinfo) {
                init(userinfo);
            });
        });
   }]);

    return htmlContent;
});