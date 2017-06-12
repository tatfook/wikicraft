/**
 * Created by wuxiangan on 2016/12/21.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'helper/dataSource',
    'text!html/editWebsite.html',
], function (app, util, storage,dataSource, htmlContent) {
    app.registerController('editWebsiteController', ['$rootScope', '$scope','github','Message', 'Account',function ($rootScope, $scope, github, Message, Account) {
        $scope.classifyList = ["普通","入围","热门"];
        $scope.roleList = [{id:1, name:"普通"},{id:10, name:"评委"}];
        $scope.commonTags = ['旅游', '摄影', 'IT', '游戏', '生活'];
        $scope.domainList=[];
        $scope.groupUser="";
        $scope.nowGroup={"name":"","userList":[]};//当前编辑的分组
        $scope.groups= []; // [{"name":"全体","userList":["username","username1","username2"]}];
		$scope.groupUser = {};
        $scope.groupAuths =[{"groupName":"全体","auth":"浏览"}];
        $scope.authorities=["浏览","编辑","拒绝"];
        var innerGitlab = undefined;

        var siteinfo = storage.sessionStorageGetItem("editWebsiteParams");
        var currentDomain = siteinfo.domain;
        //console.log(siteinfo);
        $scope.website = siteinfo;
        $scope.tags=$scope.website.tags ? $scope.website.tags.split('|') : [];

        $scope.changeDataSource = function () {
            $scope.website.dataSourceId = parseInt($scope.dataSourceId);
        }
        
        function sendModifyWebsiteRequest() {
            util.post(config.apiUrlPrefix + 'website/updateWebsite', $scope.website, function (data) {
                $scope.website = data;
                Message.info("站点配置修改成功!!!");
                $rootScope.$broadcast('userCenterContentType', 'websiteManager');
            }, function () {
                Message.warning("站点配置修改失败!!!");
            });
        }

        $scope.checkDomain = function () {
            if (currentDomain == $scope.website.domain)
                return;

            if (!/[\d\w]+/.test($scope.website.domain)) {
                $scope.errMsg = "独立域名格式错误, 域名只能为数字和字母组合";
                return;
            }

            var domain =$scope.website.username + '-' + $scope.website.domain;
            util.http('POST', config.apiUrlPrefix + 'website_domain/checkDomain', {domain: domain}, function (data) {
                if (data == 0) {
                    $scope.errMsg = $scope.website.domain + "已存在，请换个名字";
                    return;
                }
                //currentDomain = $scope.website.domain;
            });
        }

        $scope.addDomain=function(){
            if (!/[\d\w]+/.test($scope.domain)) {
                $scope.errMsg = "CName域名格式错误, 域名只能为数字和字母组合";
                return;
            }

            util.http('POST', config.apiUrlPrefix + 'website_domain/upsert', {userId:$scope.website.userId, websiteId:$scope.website._id, domain: $scope.domain}, function (data) {
                $scope.domainList.push({domain:$scope.domain});
                $scope.domain = "";
            });
        }

        $scope.removeDomain=function(domainObj){
            domainObj.isDelete = true;
            util.post(config.apiUrlPrefix + 'website_domain/deleteByDomain', {domain:domainObj.domain});
        }

        $scope.addTag = function (tagName) {
            tagName = util.stringTrim(tagName);
            if (!tagName || $scope.tags.indexOf(tagName) >= 0) {
                return;
            }
            if (tagName.length>30){
                $scope.errMsg="标签最长30个字符";
                return;
            }
            $scope.tags.push(tagName);
            $scope.website.tags = $scope.tags.join('|');
        }

        $scope.removeTag = function (tagName) {
            var index = $scope.tags.indexOf(tagName);
            if (index >= 0) {
                $scope.tags.splice(index, 1);
            }
            $scope.website.tags = $scope.tags.join('|');
        }

        // 修改网站设置
        $scope.modifyWebsite = function () {
            sendModifyWebsiteRequest();
        }

		function initGroup() {
			getGroupList();
		}

		function getGroupList() {
			var siteDataSource = dataSource.getDataSource(siteinfo.username, siteinfo.name);
			if (!siteDataSource) {
				return;
			}
			
			siteDataSource.getGroupList({owned:true}, function(data){
				$scope.groups = data;	
			});
		}
        $scope.createGroup = function () {
			var siteDataSource = dataSource.getDataSource(siteinfo.username, siteinfo.name);
			if (!siteDataSource) {
				return;
			}
			var group = $scope.nowGroup;

			siteDataSource.upsertGroup({name:group.name, request_access_enabled:true}, function(data){
				$scope.groups.push($scope.nowGroup);
				console.log(data);
			}, function(){

			});
            console.log("写入数据库");
            $scope.nowGroup={"groupName":"","userList":[]};
        }

        $scope.addUser = function () {
			var group = $scope.nowGroup;
			var groupUser = $scope.groupUser;
			var siteDataSource = dataSource.getDataSource(siteinfo.username, siteinfo.name);

			if (!siteDataSource || !group.id || !groupUser.name) {
				return;
			}

			util.post(config.apiUrlPrefix + 'dataSource/get', {username:groupUser.name, apiBaseUrl:siteDataSource.apiUrlPrefix}, function(dataSourceUser) {
				if (!dataSourceUser) {
					console.log("数据源用户不存在");
					return;
				}

				var params = {
					id:group.id,
					user_id:dataSourceUser.dataSourceUserId,
					access_level:30,
				}
				siteDataSource.upsertGroupMember(params, function(){
					
				}, function(){

				});
			});

            if (true){
                $scope.nowGroup.userList.push($scope.groupUser);
            }else{//用户不存在，报错

            }
            $scope.groupUser="";
            console.log($scope.nowGroup.userList);
        }

        $scope.removeUser = function (username) {
            var index=$scope.nowGroup.userList.indexOf(username);
            if(index>=0){
                $scope.nowGroup.userList.splice(index,1);
            }
        }
        
        $scope.editGroup = function (group,finish) {
            if(!finish){
                $scope.nowGroup=group;
                $scope.editing=true;
                console.log("1");
            }else{
                $scope.nowGroup={"groupName":"","userList":[]};
                $scope.editing=false;
                console.log("2");
            }
        }

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

		
        function init() {
			initGroup();
            util.post(config.apiUrlPrefix + "website_domain/getByWebsiteId", {websiteId:$scope.website._id}, function (data) {
               $scope.domainList = data;
               for (var i = 0; i < data.length; i++) {
                   if (data[i].domain == ($scope.website.username + "-" + $scope.website.domain)) {
                       data[i].isDelete = true; // 隐藏系统提供的独立域名
                   }
               }
            });
            var finishBtn = $("#finish");
            var cropper = $("#cropper");
            var changeBtn=$(".change-btn");

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
                    finishBtn.removeClass("sr-only");
                    cropper.removeClass("sr-only");
                    changeBtn.addClass("sr-only");
                    var img = "<img src='" + arg.target.result + "' alt='preview' />";
                    cropper.html(img);
                    var $previews = $('.preview');
                    $('#cropper > img').cropper({
                        aspectRatio: 4 / 3,
                        viewMode: 1,
                        dragMode: 'move',
                        restore: false,
                        guides: false,
                        highlight: false,
                        cropBoxMovable: false,
                        cropBoxResizable: false,
                        minCropBoxWidth:280,
                        build:function(){
                            var $clone = $(this).clone().removeClass('cropper-hidden');
                            $clone.css({
                                display: 'block',
                                width:'320px',
                                height:'240px'
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

                innerGitlab = dataSource.getDefaultDataSource();
                if (!innerGitlab || !innerGitlab.isInited()) {
                    Message.info("内部数据源失效");
                    return;
                }
                var imgUrl=$scope.imgUrl;
                innerGitlab.uploadImage({content:imgUrl}, function (url) {
                    $scope.website.logoUrl = url;
                    // util.post(config.apiUrlPrefix + 'website/updateWebsite', $scope.website, function (data) {
                    //     $scope.website = data;
                    //     Message.info("站点图片上传成功!!!");
                    // });
                }, function () {
                    Message.info("站点图片上传失败!!!");
                });
            });
            /*
            $('#uploadPictureBtn').change(function (e) {
                if (!github.isInited()) {
                    //alert("图片上传功能需要绑定数据源!!!");
                    Message.info("图片上传功能需要绑定数据源!!!");
                    return ;
                }
                var fileReader = new FileReader();
                fileReader.onload = function(){
                    $('#websiteLogo').attr('src',fileReader.result);
                    github.uploadImage("websiteLogo", fileReader.result, function (url) {
                        $scope.website.logoUrl = url;
                    });
                };
                fileReader.readAsDataURL(e.target.files[0]);
            });
            */

        }

        $scope.$watch('$viewContentLoaded',init);
        /*
        $scope.roleSelect = function (userinfo) {
            userinfo.roleInfo.roleId = parseInt(userinfo.roleInfo.roleUIIndex);
            userinfo.roleInfo.roleId = $scope.roleList[userinfo.roleInfo.roleId].id;
            var role = angular.copy(userinfo.roleInfo);
            role.roleUIIndex = undefined;
            util.post(config.apiUrlPrefix + 'website_member/updateById', {_id:role._id, roleId:role.roleId}, function (data) {
                console.log(data);
            });
        }

        $scope.getRoleName = function (roleId) {
            for (i = 0; i < $scope.roleList.length; i++) {
                if ($scope.roleList[i].id == roleId) {
                    return $scope.roleList[i].name;
                }
            }
            return "";
        }
        $scope.classifySelect = function (site) {
            site.classifyInfo.worksFlag = parseInt(site.classifyInfo.worksFlag);
            util.post(config.apiUrlPrefix + 'website_works/updateById', {_id:site.classifyInfo._id, worksFlag:site.classifyInfo.worksFlag}, function (data) {
                console.log(data);
            });
        }

        $scope.getClassifyName = function (worksFlag) {
            return $scope.classifyList[worksFlag];
        }


        $scope.advanceSetup = function () {

        }

        $scope.setGithubRepoName = function () {
            console.log($scope.website);
            if ($scope.user.githubToken) {
                sendModifyWebsiteRequest();
            } else {
                Account.githubAuthenticate(sendModifyWebsiteRequest);
            }
        }

        $scope.agreeMember = function (applyId) {
            util.post(config.apiUrlPrefix + 'website_apply/agreeMember',{applyId:applyId, websiteId:siteinfo._id}, function (data) {
                $scope.userObj = data;
                $scope.memberManager();
            });
        }

        $scope.refuseMember = function (applyId) {
            util.post(config.apiUrlPrefix + 'website_apply/refuseMember',{applyId:applyId, websiteId:siteinfo._id}, function (data) {
                $scope.userObj = data;
                $scope.memberManager();
            })
        }

        $scope.memberManager = function () {
            util.post(config.apiUrlPrefix + 'website_apply/getMember', {websiteId:siteinfo._id}, function (data) {
                $scope.userObj = data;
            });

            util.post(config.apiUrlPrefix + 'website_member/getByWebsiteId', {websiteId:siteinfo._id}, function (data) {
                $scope.userRoleObj = data;
            });
        }

        $scope.worksManager = function () {
            util.post(config.apiUrlPrefix + 'website_apply/getWorks', {websiteId:siteinfo._id}, function (data) {
                $scope.siteObj = data;
            });

            util.post(config.apiUrlPrefix + 'website_works/getByWebsiteId', {websiteId:siteinfo._id}, function (data) {
                $scope.worksObj = data;
            });
        }

        $scope.agreeWorks = function (applyId) {
            util.post(config.apiUrlPrefix + 'website_apply/agreeWorks',{applyId:applyId, websiteId:siteinfo._id}, function (data) {
                $scope.siteObj = data;
                $scope.worksManager();
            });
        }

        $scope.refuseWorks = function (applyId) {
            util.post(config.apiUrlPrefix + 'website_apply/refuseWorks',{applyId:applyId, websiteId:siteinfo._id}, function (data) {
                $scope.siteObj = data;
                $scope.worksManager();

            });
        }
        */
    }]);

    return htmlContent;
});
