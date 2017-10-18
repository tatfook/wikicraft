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
    app.registerController('userProfileController', ['$scope', '$interval', 'Account', 'Message', function ($scope, $interval, Account, Message) {
        $scope.passwordObj = {};
        $scope.fansWebsiteId = "0";
        $scope.showItem = 'myProfile';
        $scope.totalItems = 0;
        $scope.currentPage = 1;
        $scope.pageSize = 5;
        $scope.userEmail="";
        $scope.userPhone="";
        $scope.myPays = [];// code为0表示成功，isConsume为true时表示为消费，否则为收入
        var sensitiveElems = [];

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
				console.log(defaultDataSource);
				
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

            $scope.defaultDataSourceName = $scope.user.defaultDataSourceName;
            $scope.newDataSource = {username:$scope.user.username};
            getUserDataSource();
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
            else if(item == 'myPay')
                $scope.showMyPay();
            else if(item == 'invite')
                $scope.clickInvite();
            else if(item == 'dataSource')
                $scope.clickDataSource();
        });

        // 文档加载完成
		$scope.$watch('$viewContentLoaded', function(){
			Account.ensureAuthenticated(function () {
				Account.getUser(function (userinfo) {
					init(userinfo);
				});
			});
		});

        // 保存用户信息
        $scope.saveProfile = function () {
            $scope.formErr = "";
            var user = angular.copy($scope.user);
            user.dataSource = undefined;
			user.defaultSiteDataSource = undefined;
			user.vipInfo = undefined;

			var checkSensitives = [user.displayName, user.location, user.introduce];
			var isSensitive = false;

			$.each(checkSensitives, function (index,word) {
                if (word == ""){
                    return true;
                }
                config.services.sensitiveTest.checkSensitiveWord(word, function (foundWords, replacedStr) {
                    if (foundWords.length > 0){
                        isSensitive = true;
                        console.log("包含敏感词:" + foundWords.join("|"));
                        console.log(replacedStr);
                        return false;
                    }
                });
            });

			if (isSensitive){
			    $scope.formErr = "对不起，您的输入内容有不符合互联网相关安全规范内容，暂不能保存";
			    return;
            }

            util.http("PUT", config.apiUrlPrefix + "user/updateUserInfo", user, function (data) {
				data.vipInfo = $scope.user.vipInfo;
				data.dataSource = $scope.user.dataSource;
				data.defaultSiteDataSource = $scope.user.defaultSiteDataSource;
                Account.setUser(data);
                Message.success("修改成功");
            });

			// 提交用户信息给搜索引擎
			util.post(config.apiUrlPrefix + "elastic_search/submitUserinfo", user);
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
        };

		$scope.isBind = function(type) {
			if (type == "email") {
				return $scope.user.email ? true : false;
			} else if (type == "phone") {
				return $scope.user.cellphone ? true :false;
			}

			return;
		};

		$scope.confirmEmailBind = function() {
			util.post(config.apiUrlPrefix + "user/verifyEmailTwo", {
				username:$scope.user.username,
				verifyCode:$scope.emailVerifyCode,
				bind:!$scope.isBind("email"),
				isApi:true,
			}, function(){
				if ($scope.isBind("email")) {
					$scope.user.email = undefined;
					$scope.userEmail = "";
				} else {
					$scope.user.email = $scope.userEmail;
				}
				Account.setUser($scope.user);
				$('#emailModal').modal("hide");
				$scope.emailWait = 0;
			}, function (err) {
                $scope.errorMsg = err.message;
            });
		};

        $scope.sendEmail = function(email) {
            util.post(config.apiUrlPrefix + 'user/verifyEmailOne', {
                email:email,
                bind:!$scope.isBind("email"),
            }, function (data) {
                $scope.emailWait = 60;
                var timePromise = $interval(function () {
                    if($scope.emailWait <= 0){
                        $interval.cancel(timePromise);
                        timePromise = undefined;
                    }else{
                        $scope.emailWait --;
                    }
                }, 1000, 100);
                //Message.info("邮件发送成功，请按邮件指引完成绑定");
            },function (err) {
                console.log(err);
                $scope.errorMsg = err.message;
            });
        };

        function showModalInit() {
            if ($scope.emailWait > 0){
                $scope.emailVerifyCode = "";
                $scope.errorMsg = "";
                $('#emailModal').modal("show");
                return;
            }
            $scope.emailVerifyCode = "";
            $scope.errorMsg = "";
            $scope.emailWait = 0;
            $('#emailModal').modal('show');
        }

		$scope.bindEmail = function () {
			$scope.emailErrMsg="";
			if ($scope.isBind("email")) {
				$scope.userEmail = $scope.user.email;
			}
			var email=$scope.userEmail? $scope.userEmail.trim() : "";
			if(!email){
				$scope.emailErrMsg="请输入需绑定的邮箱";
				return;
			}

			var reg=/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			if(!reg.test(email)){
				$scope.emailErrMsg="请输入正确的邮箱";
				return;
			}

			util.post(config.apiUrlPrefix + "user/getByEmail", {
			    "email": email
            }, function (result) {
                console.log(result);
                if (result && result.username != $scope.user.username){
                    $scope.emailErrMsg = "该邮箱已被绑定";
                    return;
                }
                showModalInit();
            }, function (err) {
                showModalInit();
            });
		};

		$scope.confirmPhoneBind = function() {
            $scope.errorMsg = "";
            if (!$scope.smsId){
                $scope.errorMsg = "请先发送验证码！";
                return;
            }
            if (!$scope.smsCode){
                $scope.errorMsg = "请填写验证码！";
                return;
            }
			util.post(config.apiUrlPrefix + "user/verifyCellphoneTwo", {
				smsId:$scope.smsId,
				smsCode:$scope.smsCode,
				bind:!$scope.isBind("phone"),
			}, function(){
				if ($scope.isBind("phone")) {
					$scope.user.cellphone = undefined;
					$scope.userPhone = "";
				} else {
					$scope.user.cellphone = $scope.userPhone;
				}
				Account.setUser($scope.user);
				$('#phoneModal').modal("hide");
				$scope.wait = 60;
			}, function (err) {
                $scope.errorMsg = err.message;
            });
		};

		$scope.refreshImageCode = function() {
			$scope.rightImageCode = "";
			for (var i = 0; i < 4; i++) {
				$scope.rightImageCode += Math.floor(Math.random() * 10);
			}
			$scope.imageCodeUrl = "http://keepwork.com/captcha/get?" + $scope.rightImageCode;
		}

		$scope.showBindPhone = function() {
			//console.log("手机绑定开发中");
			if ($scope.isBind("phone")) {
				$scope.userPhone = $scope.user.cellphone;
			}

			if (!/[0-9]{11}/.test($scope.userPhone)) {
				Message.info("手机格式错误");
				return;
			}

			$scope.refreshImageCode();
			$scope.wait = 0;
            $scope.smsCode = "";
            $scope.imageCode = "";
			$('#phoneModal').modal("show");//重新发送不弹窗
		}

        //安全验证
        $scope.bindPhone=function () {
            $scope.errorMsg = "";
			if ($scope.imageCode != $scope.rightImageCode) {
				$scope.imageCodeErrMsg = "图片验证码错误";
				return;
			} else {
				$scope.imageCodeErrMsg = "";
			}

			if ($scope.wait > 0){
                return;
            }

			util.post(config.apiUrlPrefix + 'user/verifyCellphoneOne', {
				cellphone:$scope.userPhone,
				bind:!$scope.isBind("phone"),
			},function(data){
				//Message.info("验证码已发送");
				$scope.smsId = data.smsId;
				$scope.wait = 60;
				var timePromise = $interval(function () {
                    if($scope.wait <= 0){
                        $interval.cancel(timePromise);
                        timePromise = undefined;
                    }else{
                        $scope.wait--;
                    }
                }, 1000, 100);
                $scope.smsCode = "";
			}, function (err) {
			    $scope.errorMsg = err.message;
            });
        }

        // 修改用户信息
        $scope.clickMyProfile = function () {
            $scope.showItem = 'myProfile';

        }

        // 账号安全
        $scope.clickAccountSafe = function () {
            $scope.showItem = 'accountSafe';

            var getUserThresServiceList = function () {
                util.post(config.apiUrlPrefix + 'user_three_service/getByUsername', {username:$scope.user.username}, function (serviceList) {
                    $scope.userThreeServiceList = serviceList || [];
                });
            }

			$scope.getServiceUsername = function(serviceName) {
                for (var i = 0; $scope.userThreeServiceList && i < $scope.userThreeServiceList.length; i++) {
                    if ($scope.userThreeServiceList[i].serviceName == serviceName) {
                        return $scope.userThreeServiceList[i].serviceUsername || "";
                    }
                }
				return "";
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

        // 我的关注
        $scope.clickMyCollection = function () {
            $scope.showItem = 'myCollection';
            var attentType = "user"; // or site
            $scope.clickCollectionUser = function () {
                console.log('clickCollectionUser');
                if (attentType != "user") {
                    attentType = "user";
                    $scope.currentPage = 1;
                }
                util.post(config.apiUrlPrefix + 'user_fans/getByFansUserId', {fansUserId:$scope.user._id, page:$scope.currentPage}, function (data) {
                    data = data || {};
                    $scope.userList = data.userList;
                });
            };

            $scope.clickCollectionWorks = function () {
                console.log('clickCollectionWorks');
                if (attentType != "work") {
                    attentType = "work";
                    $scope.currentPage = 1;
                }
                util.post(config.apiUrlPrefix + 'user_favorite/getByUserId', {userId:$scope.user._id, page:$scope.currentPage}, function (data) {
                    data = data ||{};
                    $scope.siteList = data.siteList;
                    console.log($scope.siteList);
                });
            };
            // 实现分页
            $scope.collectionPageChanged = function () {
                if (attentType == "user") {
                    $scope.clickCollectionUser();
                } else {
                    $scope.clickCollectionWorks();
                }
            };

            $scope.clickCollectionUser();
        };
		
		$scope.goUserPage = function (username) {
            util.go("/"+username, true);
        };

		$scope.goSitePage = function (username, sitename) {
            util.go("/" + username + "/"+ sitename, true);
        };

        // 我的历史
        $scope.clickMyHistory = function () {
            $scope.showItem = 'myHistory';
			$scope.pageSize = 10;
			$scope.currentPage = 1;
			$scope.totalItems = 0;

			$scope.getUserVisitHistory = function() {
				util.http("POST", config.apiUrlPrefix + 'user_visit_history/get', {
					username: $scope.user.username,
					pageSize:$scope.pageSize,
					page:$scope.currentPage,
				}, function (data) {
					data = data || {};
					$scope.visitHistoryList = data.visitList; // 用户的建站列表
					$scope.totalItems = data.total || 0;    // 
					for (var i =0; i < (data.visitList || []).length; i++) {
						var tmp = data.visitList[i];
						tmp.updateDate = tmp.updateDate.split(" ")[0];
					}
				});
			}

			$scope.getUserVisitHistory();
        }

        $scope.deleteHistory = function () {
            Message.info("删除历史功能开发中");
        };

        // 我的粉丝
        $scope.clickMyFans = function () {
            $scope.showItem = 'myFans';
            $scope.currentPage = 1;

            util.post(config.apiUrlPrefix + "website/getAllByUserId", {userId: $scope.user._id}, function (data) {
                $scope.siteList = data;
                $scope.totalFavoriteCount = 0;
                for (var i = 0; i < $scope.siteList.length; i++) {
                    $scope.totalFavoriteCount += ($scope.siteList[i].favoriteCount || 0);
                }
                if ($scope.siteList.length > 0) {
                    $scope.currentFansSite = $scope.siteList[0];
                    getFansList();
                }
            });

            function getFansList() {
                var params = {
                    siteId: $scope.currentFansSite._id,
                    page: $scope.currentPage,
                    pageSize: $scope.pageSize
                };
                util.http("POST", config.apiUrlPrefix + "user_favorite/getBySiteId", params, function (data) {
                    $scope.totalItems = data.total || 0;
                    $scope.fansUserList = data.userList || [];
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

        // 消费记录
        $scope.showMyPay = function () {
            $scope.showItem = 'myPay';
            $scope.payStatus = { "InProgress": "进行中", "Finish": "已完成", "Fail": "失败" };

            util.http("POST", config.apiUrlPrefix + "pay/getTrade", {}, function (data) {
                $scope.myPays = data;
            })

            util.http("GET", config.apiUrlPrefix + "wallet/getBalance", {}, function (data) {
                if (data) {
                    $scope.balance = data.balance;
                } else {
                    $scope.balance = 0;
                }
            })
        }

        // 邀请注册
        $scope.clickInvite = function () {
            $scope.showItem = 'invite';

            $scope.inviteFriend = function () {
                if (!$scope.friendMail) {
                    Message.info("请正确填写好友邮箱地址!!!");
                    return ;
                }
                util.post(config.apiUrlPrefix + 'user/inviteFriend',{username:$scope.user.username,friendMail:$scope.friendMail}, function () {
                    Message.info("邀请邮件已发送给" + $scope.friendMail);
                    $scope.friendMail = "";
                });
            }
        }

        $scope.clickDataSource = function () {
            $scope.showItem = 'dataSource';
            $scope.dataSourceTypeList = ["github", "gitlab"];

            // 更改默认数据源
            $scope.changeDefaultDataSource = function () {
                //console.log($scope.defaultDataSourceName);
                $scope.user.defaultDataSourceName = $scope.defaultDataSourceName;
                util.post(config.apiUrlPrefix + 'user/updateUserInfo', {
                    username:$scope.user.username,
                    defaultDataSourceName:$scope.defaultDataSourceName,
                });
            };

            // 添加新的数据源
            $scope.clickNewDataSource = function () {
                //console.log($scope.newDataSource);
                if (!$scope.newDataSource.type || !$scope.newDataSource.name || !$scope.newDataSource.apiBaseUrl || !$scope.newDataSource.dataSourceToken) {
                    $scope.errMsg = "表单相关字段不能为空!!!";
                    return ;
                }

                if ($scope.newDataSource.name == "内置gitlab" || $scope.newDataSource.name == "内置github") {
                    $scope.errMsg = "内置数据源不可更改!!!";
                    return;
                }

                var isModify = false;
                for (var i = 0; i < ($scope.dataSourceList || []).length; i++) {
                    var temp = $scope.dataSourceList[i];
                    if ($scope.newDataSource.name == temp.name) {
                        isModify = true;
                    }
                }

                $scope.errMsg = "";

                // 格式化根路径
                //if ($scope.newDataSource.rootPath) {
                //var rootPath = $scope.newDataSource.rootPath;
                //var paths = rootPath.split('/');
                //var path = "";
                //for (var i = 0; i < paths.length; i++) {
                //if (paths[i]) {
                //path += "/" + paths[i];
                //}
                //}
                //$scope.newDataSource.rootPath = path;
                //}

                util.post(config.apiUrlPrefix + 'data_source/setDataSource', $scope.newDataSource, function (data) {
                    Message.info("操作成功");
                    !isModify && $scope.dataSourceList.push(angular.copy(data));
                    $scope.newDataSource = {username:$scope.user.username};
                    //getUserDataSource();
                });
            }

            // 修改数据源
            $scope.clickModifyDataSource = function (x) {
                $scope.newDataSource = angular.copy(x);
            }

            // 删除数据源
            $scope.clickDeleteDataSource = function (x) {
                if (x.name == "内置gitlab" || x.name == "内置github") {
                    Message.info( "内置数据源不可删除!!!");
                    return;
                }

                util.post(config.apiUrlPrefix + 'data_source/deleteByName', {username:x.username, dataSourceName:x.name}, function () {
                    for (var i = 0; i < $scope.dataSourceList.length; i++) {
                        if (x.name == $scope.dataSourceList[i].name) {
                            $scope.dataSourceList.splice(i, 1);
                        }
                    }
                });
            }
        }

        function getUserDataSource() {
            util.post(config.apiUrlPrefix + 'data_source/getByUsername', {username:$scope.user.username}, function (data) {
                $scope.dataSourceList = data;
            });
        }
   }]);

    return htmlContent;
});
