/**
 * Created by wuxiangan on 2016/12/21.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'helper/dataSource',
	'helper/sensitiveWord',
    'text!html/editWebsite.html',
], function (app, util, storage,dataSource, sensitiveWord, htmlContent) {
    app.registerController('editWebsiteController', ['$rootScope', '$scope', '$translate', 'github', 'Message', 'Account',function ($rootScope, $scope, $translate, github, Message, Account) {
        $scope.classifyList = ["普通","入围","热门"];
        $scope.roleList = [{id:1, name:"普通"},{id:10, name:"评委"}];
        $scope.commonTags = ['旅游', '摄影', 'IT', '游戏', '生活'];
        $scope.domainList=[];
        $scope.groupUser="";
        $scope.nowGroup={"name":"","userList":[]};//当前编辑的分组
        $scope.groups= []; // [{"name":"全体","userList":["username","username1","username2"]}];
		$scope.groupUser = {};
        $scope.groupAuths =[];
        $scope.authorities=[{level: 20, name: "浏览"},{level:40, name: "编辑"},{level:10, name: "拒绝"}];

		var siteDataSource = undefined;
        var siteinfo = storage.sessionStorageGetItem("editWebsiteParams");
        var currentDomain = siteinfo.domain;
        var keepworkReg = new RegExp("(.keepwork.com|^keepwork.com)");
        var domainReg = new RegExp("^[\\d\\w][\\d\\w\\.]+$");
        //console.log(siteinfo);
        $scope.website = siteinfo;
        // $scope.tags=$scope.website.tags ? $scope.website.tags.split('|') : [];

        function sendModifyWebsiteRequest() {
			$scope.website.sitename = $scope.website.name;
            util.post(config.apiUrlPrefix + 'website/updateByName', $scope.website, function (data) {
                $scope.website = data;
                Message.info("站点配置修改成功!!!");
                // $rootScope.$broadcast('userCenterContentType', 'websiteManager');
            }, function () {
                Message.warning("站点配置修改失败!!!");
            });

			util.post(config.apiUrlPrefix + 'elastic_search/submitSiteinfo', $scope.website)
        }

        $scope.checkDomain = function () {
            if (currentDomain == $scope.website.domain)
                return;

            if (!/^[\d\w]+$/.test($scope.website.domain)) {
                $scope.errMsg = "独立域名格式错误, 域名只能为数字和字母组合";
                return;
            }

            var domain = $scope.website.username + '-' + $scope.website.domain;
            util.http('POST', config.apiUrlPrefix + 'website_domain/checkDomain', {domain: domain}, function (data) {
                if (data == 0) {
                    $scope.errMsg = $scope.website.domain + "已存在，请换个名字";
                    return;
                }
                //currentDomain = $scope.website.domain;
            });
        };

        $scope.addDomain=function(){
            $scope.domainErrMsg = "";
            if (!$scope.user.vipInfo.isValid){
                return;
            }
            $scope.domain = $scope.domain ? $scope.domain.trim():"";
            if (!$scope.domain){
                return;
            }

            if (!domainReg.test($scope.domain)){
                $scope.domain = "";
                $scope.domainErrMsg = "* 请输入合法的域名";
                return;
            }

            if (keepworkReg.test($scope.domain)){
                $scope.domain = "";
                $scope.domainErrMsg = "* keepwork短域名稍候开放";
                return;
            }

            util.http('POST', config.apiUrlPrefix + 'website_domain/insert', {username:$scope.website.username, sitename:$scope.website.name, domain: $scope.domain}, function (data) {
                $scope.domainList.push({domain:$scope.domain});
                $scope.domain = "";
			},function(data){
				if (data.id==7) {
					// console.log("域名已存在");
				}	
			});
        };

        $scope.removeDomain=function(domainObj){
            domainObj.isDelete = true;
            util.post(config.apiUrlPrefix + 'website_domain/deleteByDomain', {domain:domainObj.domain});
        };

        $scope.addTag = function (tagName) {
            tagName = util.stringTrim(tagName);
            if (!tagName){
                $scope.tagErrMsg="标签不能为空";
                $scope.tag="";
                return;
            }
            if ($scope.tags.indexOf(tagName) >= 0) {
                $scope.tagErrMsg="该标签已添加";
                $scope.tag="";
                return;
            }
            var isSensitive = false;
            if (($scope.website.sensitiveWordLevel & 2) <= 0){
                sensitiveWord.checkSensitiveWord(tagName, function (foundWords, replacedStr) {
                    if (foundWords.length > 0){
                        isSensitive = true;
                        // console.log("包含敏感词:" + foundWords.join("|"));
                        return false;
                    }
                });
            }
            if (isSensitive){
                $scope.nextStepDisabled = true;
                $scope.tagErrMsg="您输入的内容不符合互联网安全规范，请修改";
                return;
            }
            if (tagName.length>10){
                $scope.tagErrMsg="标签最长10个字";
                $scope.tag="";
                return;
            }
            $scope.tags.push(tagName);
            $scope.website.tags = $scope.tags.join('|');
            $scope.tag="";
            $scope.tagErrMsg="";
            $("#tagInput").focus();
        };

        $scope.removeTag = function (tagName) {
            var index = $scope.tags.indexOf(tagName);
            if (index >= 0) {
                $scope.tags.splice(index, 1);
            }
            $scope.website.tags = $scope.tags.join('|');
        };

        // 修改网站设置
        $scope.modifyWebsite = function () {
            $scope.websiteErr = "";
            // $scope.defaultPageErrMsg = "";
            var websiteParams = $scope.website;
            var checkSensitives = [websiteParams.displayName, websiteParams.desc];
            var isSensitive = false;

            if (($scope.website.sensitiveWordLevel & 2) <= 0){
                sensitiveWord.getAllSensitiveWords(checkSensitives).then(function(results) {
                    var isSensitive = results && results.length;
                    trySaveModify(isSensitive);
                });
            }

            var trySaveModify = function(isSensitive) {
                if (isSensitive){
                    $scope.websiteErr = "您输入的内容不符合互联网安全规范，请修改";
                    util.$apply();
                    return;
                }
                
                // if (!/^[\d\w-(\u4e00-\u9fff)]+$/.test($scope.website.defaultPage)) {
                //     $scope.defaultPageErrMsg = "域名格式错误";
                //     return;
                // }
                
                sendModifyWebsiteRequest();
            }
        };

		function initGroup() {
            $scope.changeType = siteinfo.visibility || "public";
			getGroupList();
		}

		function getLevelName(level) {
			if (level == 10) {
				return "拒绝";
			} else if (level == 20) {
				return "浏览";
			} else if (level == 40) {
				return "编辑";
			}
		}

		function getGroupList() {
			var siteDataSource = dataSource.getDataSource(siteinfo.username, siteinfo.name);
			if (!siteDataSource) {
				return;
			}
			
			$scope.shareGroups = [];
			util.post(config.apiUrlPrefix + 'group_user/getByMember', {memberName:siteinfo.username},function(data){
				data = data || [];
				for (var i = 0; i < data.length; i++){
					data[i].name = data[i].username + '/' + data[i].groupname;
					data[i].id = data[i].dataSourceGroupId;
					$scope.shareGroups.push(data[i]);
				}
			});
			siteDataSource.getGroupList({owned:true}, function(data){
				data = data || {};
				$scope.groups = data;	
				//console.log($scope.groups);
				for (var i = 0; i < data.length; i++) {
					$scope.shareGroups.push({
						username:data[i].groupUsername,
						groupname:data[i].name,
						name:data[i].groupUsername + '/' + data[i].name,
						id:data[i].id,
					});
					(function(index){
						var group = data[index];
						siteDataSource.getGroupMemberList(group, function(data){
							group.userList = (group.userList || []).concat(data || []);
							//console.log($scope.groups);
						});
					})(i);
				}
			});

			siteDataSource.getProjectGroupList({}, function(data){
				var data = data || [];
				for(var i = 0; i < data.length; i++) {
					var group = data[i];
					group.groupUsername = group.groupUsername;
					group.username = siteinfo.username;
					group.sitename = siteinfo.name;
					group.groupname = group.group_name;
					group.dataSourceGroupId = group.group_id;
					group.level = group.group_access_level;
					group.levelName = getLevelName(group.level);
				}
				$scope.groupAuths = data;
			});
		}
		
		// 设置可见性
		$scope.setVisibility = function(visibility) {
			if (!siteDataSource || siteDataSource.dataSource.sitename != siteinfo.name) {
				Message.info("非独立数据源不可设置可见性");
                $scope.changeType = $scope.changeType=="private" ? "public":"private";
				return;
			}
			if (visibility == siteinfo.visibility) {
				return;
			}
			siteDataSource.setProjectVisibility({visibility:visibility}, function(){
				$scope.website.visibility = visibility;
				util.post(config.apiUrlPrefix + 'website/setVisibility', {username:siteinfo.username, sitename:siteinfo.name, visibility:visibility});
			});
		}

		// 创建共享组 		
		$scope.createShareGroup = function(group, level) {
			//console.log(group);
			//console.log(level);
			if (!group || !level) {
				Message.info("请选择组和权限!!!");
				return;
			}

			for (var i = 0; i < ($scope.groupAuths || []).length; i++) {
				if (!$scope.groupAuths[i].isDelete && group.name == $scope.groupAuths[i].groupname) {
					//console.log($scope.groupAuths[i]);
					Message.info("组已存在");
					return;
				}
			}

			var params = {
				group_id: group.id,
				group_access: level.level,
			};
			//console.log(params);

			siteDataSource.addProjectGroup(params, function(){
				var params = {
					groupUsername: group.username,
					groupname: group.groupname,
					sitename: siteinfo.name,
				    username: siteinfo.username,
					level: level.level,
					levelName: level.name,
					dataSourceGroupId:group.id,
				};
				$scope.groupAuths.push(params);
				util.post(config.apiUrlPrefix + 'site_group/upsert', params);
			});
		}

		$scope.showDeleteModal = function (group, type) {
            $scope.deleting = group;
            $scope.deleting.type = type;
            $("#deleteModal").modal("show");
            // console.log($scope.deleting);
        };

		$scope.deleteShareGroup = function(group) {
		    config.services.confirmDialog({
                "title": $translate.instant("删除提醒"),
                "theme": "danger",
                "confirmBtnClass": "btn-danger",
                "content": $translate.instant('REMOVE_GROUP_AUTH_CONFIRM_MSG', {groupname: group.groupname})
            },function () {
                if (!siteDataSource || !group) {
                    $("#deleteModal").modal("hide");
                    Message.info("数据源不存在");
                    return;
                }

                siteDataSource.deleteProjectGroup({group_id:group.dataSourceGroupId}, function(){
                    group.isDelete = true;
                    util.post(config.apiUrlPrefix + "site_group/deleteByName", {username:group.username, sitename:group.sitename,groupUsername:group.groupUsername, groupname:group.groupname,level:group.level});
                });
            });
		};

		$scope.deleteGroup = function(group) {
		    config.services.confirmDialog({
                "title": $translate.instant("删除提醒"),
                "theme": "danger",
                "confirmBtnClass": "btn-danger",
                "content": $translate.instant('REMOVE_GROUP_CONFIRM_MSG', {groupname: group.name})
            },function () {
                var siteDataSource = dataSource.getDataSource(siteinfo.username, siteinfo.name);
                if (!siteDataSource) {
                    Message.info("数据源不存在");
                    return;
                }
                if (!group || !group.id) {
                    Message.info("删除失败，该分组已被删除");
                    return
                }

                // 检查是否存在组引用
                //console.log(group);
                util.post(config.apiUrlPrefix + "site_group/getByUserGroupName", {
                    username:siteinfo.username,
                    groupname:group.name,
                    pageSize:1,
                }, function(data){
                    if (data && data.total > 0) {
                        config.services.confirmDialog({title:"分组删除", content:"分组已被引用不能删除", cancelBtn:false});
                        return;
                    }

                    group.isDelete = true;
                    for (var i = 0; i < $scope.groups.length; i++) {
                        if (group.name == $scope.groups[i].name) {
                            $scope.groups.splice(i,1);
                            break;
                        }
                    }
                    for (var i = 0; i < $scope.shareGroups.length; i++) {
                        if (group.name == $scope.shareGroups[i].groupname && $scope.shareGroups[i].username == siteinfo.username) {
                            $scope.shareGroups.splice(i,1);
                            break;
                        }
                    }
                    siteDataSource.deleteGroup({id:group.id}, function(){
                        util.post(config.apiUrlPrefix + "group/deleteByName", {username:siteinfo.username, groupname:group.name});
                    });
                });
            });
		};

        $scope.createGroup = function () {
			var group = $scope.nowGroup;
            $scope.groupnameErr = false;
			if (!siteDataSource || !group.name) {
				return;
			}

			if (!/^[\d\w]+$/.test(group.name)){
			    $scope.groupnameErr = true;
			    return;
            }

			// 是否存在
			for (var i = 0; i < ($scope.groups || []).length; i++) {
				if (!$scope.groups[i].isDelete && $scope.groups[i].name == group.name) {
					Message.info("组已存在");
					return;
				}
			}
			// 创建组
			siteDataSource.upsertGroup({name:group.name, request_access_enabled:true}, function(data){
				util.post(config.apiUrlPrefix + 'group/upsert', {
					username:siteinfo.username,
					groupname:group.name,
					dataSourceGroupId:data.id, // 需不需要存
					visibility:"public",
				});
				$scope.groups.push(data);
				$scope.shareGroups.push({username:siteinfo.username, groupname:group.name, id:data.id,name:siteinfo.username+"/"+group.name});
				$scope.nowGroup = {};
				//console.log(data);
			}, function(){

			});
        };
        
        var saveUser = function (name, group, users) {
            for (var i = 0; i < (group.userList || []).length; i++) {
                var user = group.userList[i];
                if (name == user.name && !user.isDelete) {
                    if (users.length>0){
                        saveUser(users.shift(), group, users);
                    }else{
                        $scope.groupUser.name = "";
                    }
                    return;
                }
            }
            util.post(config.apiUrlPrefix + 'data_source/get', {username:name}, function(dataSourceUser) {
                if (!dataSourceUser || dataSourceUser.length == 0) {
                    Message.info("用户不在此站点的数据源中, 不可添加!!!");
                    // console.log("数据源用户不存在");
                    if (users.length>0){
                        saveUser(users.shift(), group, users);
                    }else{
                        $scope.groupUser.name = "";
                    }
                    return;
                }

                dataSourceUser = dataSourceUser[0];

                var params = {
                    id:group.id,
                    user_id:dataSourceUser.dataSourceUserId,
                    access_level:40
                };

                var newUser = {
                    name:name
                };
                newUser.id = params.user_id;
                siteDataSource.createGroupMember(params, function(){
                    newUser.isDelete = false;
                    $scope.nowGroup.userList = $scope.nowGroup.userList || [];
                    $scope.nowGroup.userList.push(newUser);

                    util.post(config.apiUrlPrefix + "group_user/upsert", {
                        username:siteinfo.username,
                        groupname:group.name,
                        memberName:name,
                        level:40
                    });

                    if (users.length>0){
                        saveUser(users.shift(), group, users);
                    }else{
                        $scope.groupUser.name = "";
                    }
                    return;
                }, function(){
                    Message.info("用户添加失败");
                    if (users.length>0){
                        saveUser(users.shift(), group, users);
                    }else{
                        $scope.groupUser.name = "";
                    }
                    return;
                });
            });
        };

        $scope.addUser = function () {
			var group = $scope.nowGroup;
			var groupUser = $scope.groupUser;
			var siteDataSource = dataSource.getDataSource(siteinfo.username, siteinfo.name);

			if (!siteDataSource || !group.id || !groupUser.name) {
				return;
			}

			var users = groupUser.name.split(",");
			saveUser(users.shift(), group, users);
        };

        $scope.removeUser = function (group, groupUser) {
			if (!siteDataSource || !group || !groupUser) {
				return;
			}
			//console.log(groupUser);
			siteDataSource.deleteGroupMember({id:group.id, user_id:groupUser.id}, function() {
				util.post(config.apiUrlPrefix + "group_user/deleteMember", {
					username:siteinfo.username,
					groupname:group.name,
					memberName:groupUser.name,
				});
			});
			groupUser.isDelete = true;
        }
        
        $scope.editGroup = function (group,finish) {
            if(!finish){
                $scope.nowGroup=group;
                $scope.editing=true;
            }else{
                $scope.nowGroup={userList:[]};
				$scope.groupUser={};
                $scope.editing=false;
            }
        }

        $scope.changeSiteType = function (finish) {
            if(finish){
                $('#ensureModal').modal("hide");
				$scope.setVisibility($scope.changeType);
            }else{
                $('#ensureModal').modal("show");
            }
        };

        $scope.cancelChange = function () {
          $scope.changeType = $scope.changeType=="private" ? "public":"private";
          $('#ensureModal').modal("hide");
        };

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
		
		$scope.changeDataSource = function() {
			// console.log($scope.dataSourceName);
		}

        function init() {
			siteDataSource = dataSource.getDataSource(siteinfo.username, siteinfo.name);
			initGroup();
			$scope.dataSourceName = siteDataSource.dataSource.dataSourceName;
			//console.log($scope.dataSourceName);
			util.post(config.apiUrlPrefix + "data_source/getByUsername", {username:siteinfo.username}, function(data){
				$scope.dataSourceList = data || [];
			});
            util.post(config.apiUrlPrefix + "website_domain/getByName", {username:$scope.website.username, sitename: $scope.website.name}, function (data) {
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
                    var options = { 
                        aspectRatio: 4 / 3,
                        viewMode: 1,
                        dragMode: 'move',
                        restore: false,
                        guides: false,
                        highlight: false,
                        cropBoxMovable: false,
                        cropBoxResizable: false,
                        minCropBoxWidth:280,
                        preview: ".preview", 
                        crop: function(e) {} 
                    };
                    $("#cropper > img")
                      .on({
                        ready: function(e) {},
                        cropstart: function(e) {},
                        cropmove: function(e) {},
                        cropend: function(e) {},
                        crop: function(e) {
                          croppedCanvas = $(this).cropper("getCroppedCanvas");
                          resultCanvas = getResultCanvas(croppedCanvas);
                          $scope.imgUrl = resultCanvas.toDataURL(); //产生裁剪后的图片的url
                        },
                        zoom: function(e) {}
                      })
                      .cropper(options);
                }
            };
            finishBtn.on("click", function () {
                changeBtn.removeClass("sr-only");
                cropper.html("");
                cropper.addClass("sr-only");
                finishBtn.addClass("sr-only");

                if (!siteDataSource || !siteDataSource.isInited()) {
                    Message.info("内部数据源失效");
                    return;
                }
                var imgUrl=$scope.imgUrl;
                siteDataSource.uploadImage({content:imgUrl, isShowLoading: true}, function (url) {
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

		$scope.$watch('$viewContentLoaded', function(){
			Account.getUser(function(userinfo){
				$scope.user = userinfo;
				dataSource.getUserDataSource(userinfo.username).registerInitFinishCallback(init);
			});
		});

        // 回车添加用户
        $(document).keyup(function (event) {
            if(event.keyCode=="13" && $("#groupUserName").is(":focus")){
                $scope.addUser();
            }else if(event.keyCode=="13" && $("#tagInput").is(":focus")){
                $scope.addTag($scope.tag);
            }
        });
    }]);

    return htmlContent;
});
