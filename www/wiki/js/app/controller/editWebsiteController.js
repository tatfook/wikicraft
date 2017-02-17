/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app', 'helper/util', 'helper/storage', 'text!html/editWebsite.html'], function (app, util, storage, htmlContent) {
    app.registerController('editWebsiteController', ['$scope','github','Message',function ($scope, github, Message) {
        //const github = ProjectStorageProvider.getDataSource('github');
        $scope.tags=["tag1","tag2"];
        $scope.classifyList = ["普通","入围","热门"];
        $scope.roleList = [{id:1, name:"普通"},{id:10, name:"评委"}];

        var siteinfo = storage.sessionStorageGetItem("editWebsiteParams");
        $scope.website = siteinfo;

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

        $scope.addTag = function (tagName) {
            tagName = util.stringTrim(tagName);
            if (!tagName || $scope.tags.indexOf(tagName) >= 0) {
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

        $scope.modifyWebsite = function () {
            util.post(config.apiUrlPrefix + 'website/updateWebsite', $scope.website, function (data) {
                $scope.website = data;
                Message.info("站点配置修改成功!!!");
            }, function () {
                Message.warning("站点配置修改失败!!!");
            });
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

        function init() {
        }
    }]);

    return htmlContent;
});