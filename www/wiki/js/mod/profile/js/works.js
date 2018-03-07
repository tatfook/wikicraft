/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: none
 * @Last Modified time: 2018-02-27 17:44:58
 */
define([
    'app', 
    'helper/util',
    'helper/mdconf',
    'text!wikimod/profile/html/works.html',
    'text!wikimod/profile/html/modalTemplate/addWorkModal.html',
    'cropper'
], function (app, util, mdconf, htmlContent, addWorkModalHtmlContent) {
    function registerController(wikiBlock) {
        app.registerController("worksCtrl", ['$rootScope', '$scope','$uibModal', '$translate', 'Account', 'modal', function ($rootScope, $scope, $uibModal, $translate, Account, modal) {
            const modCmd = "```@profile/js/works";
            const LocationOrigin = window.location.origin;
            const LocationReg = new RegExp(LocationOrigin);
            var thisInBlockIndex;
            var thisContainerId;
			wikiBlock.init({
				scope:$scope,
				params_template:{
                    works:{
                        is_leaf: true,
                        require: false,
                        works:[{
                            is_leaf: true,
                            logoUrl:"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1516099391929.jpeg",
                            title:"日常摄影作品",
                            workLink:"/photograph/page01",
                            desc:"介绍日常生活中容易拍摄的照片",
                            tags:["摄影","任务","记录"],
                            visitCount:253,
                            favoriteCount:43
                        }]
                    }
                }
            });

            var getWorksMsgByUrl = function(){
                $scope.works.map(function(work, index){
                    if (!work || !work.workLink) {
                        return;
                    }
                    var link = work.workLink;
                    var linkParams = link.split("/");
                    var startIndex = link.search(LocationReg);
                    if (startIndex >= 0 && linkParams.length >= 3) {
                        var urlStartIndex = startIndex + LocationOrigin.length;
                        var backUrl = link.substring(urlStartIndex);
                        var visitor = ($scope.user && $scope.user.username) || "";
                        util.get(config.apiUrlPrefix + 'pages/getDetail', {
                            url: backUrl,
                            visitor: visitor
                        }, function(data){
                            if (!data) {
                                return;
                            }
                            $scope.works[index].data = data
                        }, function(err){
                            console.log(err);
                        })
                    }else{
                        $scope.works[index].isThirdLink = true;
                    }
                });
            }
            
            $scope.works = util.arrayFrom($scope.params.works);
            $scope.userinfo.worksCount = $scope.works.length;
            $scope.editing = false;
            getWorksMsgByUrl();

            // 获取当前模块的index和containerId
            var getBlockIndex = function(){
                if (thisInBlockIndex >= 0) {
                    return thisInBlockIndex;
                }
                var blockList = wikiBlock.blockList;
                for(var i = 0; i<blockList.length; i++){
                    var modReg = new RegExp(modCmd);
                    if (modReg.test(blockList[i].content)) {
                        break;
                    }
                }
                thisInBlockIndex = i;
                thisContainerId = blockList[i].blockCache.containerId;
                return i;
            }

            var modifyWorksMd = function(){
                $scope.userinfo.worksCount = $scope.works.length;
                var newItemObj = {
                    index: getBlockIndex(),
                    containerId: thisContainerId,
                    content: modCmd + "\n" + mdconf.jsonToMd({
                        "works": $scope.works
                    }) + "\n```\n"
                }
                $rootScope.$broadcast("changeProfileMd", newItemObj);
            }

            $scope.showModal = function(index){
                if (!Account.isAuthenticated()) {
                    $rootScope.$broadcast("onLogout", "");
                    modal('controller/loginController', {
                        controller: 'loginController',
                        size: 'lg',
                        backdrop: true
                    });
                    return;
                }
                $scope.addingWork = angular.copy($scope.works[index]);
                $uibModal.open({
                    template: addWorkModalHtmlContent,
                    controller: "addWorkModalCtrl",
                    openedClass: "add-modal",
                    scope: $scope
                }).result.then(function(result){
                    console.log(index);
                    if (index >= 0) {    // 编辑作品
                        $scope.works[index] = result;
                    }else{          // 添加作品
                        $scope.works.push(result);
                    }
                    modifyWorksMd();
                }, function(){
                });
            }

            $scope.editWork = function(){
                $scope.editing = !$scope.editing;
            };

            $scope.setWork = function(index){
                $scope.showModal(index);
            };

            $scope.shiftUp = function(index){
                if (index < 1) {
                    return;
                }
                var prev = index - 1;
                $scope.works[prev] = $scope.works.splice((prev + 1), 1, $scope.works[prev])[0];
                modifyWorksMd();
            };

            $scope.shiftDown = function(index){
                if (index >= ($scope.works.length - 1)) {
                    return;
                }
                var prev = index;
                $scope.works[prev] = $scope.works.splice((prev + 1), 1, $scope.works[prev])[0];
                modifyWorksMd();
            };

            $scope.deleteWork = function(index){
                config.services.confirmDialog({
                    "title": $translate.instant("删除提醒"),
                    "theme": "danger",
                    "content": $translate.instant("Remove_Confirm_Msg", {deleteItemName: $scope.works[index].title})
                }, function(result){
                    $scope.works.splice(index, 1);
                    modifyWorksMd();
                }, function(cancel){
                    console.log("cancel delete");
                });
            };
        }]);

        app.registerController("addWorkModalCtrl", ['$rootScope', '$scope','$uibModal', '$uibModalInstance', '$translate', 'Account', 'modal', function ($rootScope, $scope, $uibModal, $uibModalInstance, $translate, Account, modal) {
            const LocationOrigin = window.location.origin;
            const UserInputFlag = -1;
            $scope.addingWork = $scope.addingWork || {};
            $scope.linkList = [];
            $scope.cancel = function(){
                $scope.addingWork = {};
                $uibModalInstance.dismiss("cancel");
            }

            var getResultCanvas = function (sourceCanvas) {
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

            var isRequiredEmptyAttr = function(attrNames){
                attrNames = attrNames || [];
                for(var i = 0;i < attrNames.length;i++){
                    if ($scope.addingWork[attrNames[i].key] && $scope.addingWork[attrNames[i].key].length > 0) {
                        continue;
                    }else{
                        break;
                    }
                }
                return {
                    'boolResult':(i < attrNames.length),
                    'attr': attrNames[i] && attrNames[i].value
                };
            }

            $scope.submitAddingWork = function(){
                if (!Account.isAuthenticated()) {
                    $rootScope.$broadcast("onLogout", "");
                    modal('controller/loginController', {
                        controller: 'loginController',
                        size: 'lg',
                        backdrop: true
                    });
                    return;
                }
                $scope.errMsg = "";
                var requiredAttrs = [{
                    'key': 'title',
                    'value': $translate.instant('作品名')
                },
                {
                    'key': 'workLink',
                    'value': $translate.instant('作品链接')
                }];
                var requiredResult = isRequiredEmptyAttr(requiredAttrs); 
                if (requiredResult.boolResult) {
                    $scope.errMsg = requiredResult.attr + $translate.instant("不可为空");
                    return;
                }
                $uibModalInstance.close($scope.addingWork);
            }

            $scope.cropperImage = function(e){
                $scope.addingWork.logoUrl = "";
                util.$apply();
                var file = e.target.files[0];
                var $preview = $(".preview");
                var controlBox = $("#control-box");
                var cropper = $("#cropper");
                var finishBtn = $("#finishCrop");
                // 只选择图片文件
                if (!file.type.match('image.*')) {
                    return;
                }

                var croppingUrl = "";
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function(arg){
                    controlBox.addClass("sr-only");
                    cropper.removeClass("sr-only");
                    finishBtn.removeClass("sr-only");
                    var img = "<img src='" + arg.target.result + "' alt='preview' />";
                    cropper.html(img);
                    $("#cropper > img").cropper({
                        aspectRatio: 4 / 3,
                        viewMode: 1,
                        dragMode: 'move',
                        restore: false,
                        guides: false,
                        highlight: false,
                        cropBoxMovable: false,
                        cropBoxResizable: false,
                        minContainerWidth: 160,
                        minContainerHeight: 120,
                        minCropBoxWidth:160,
                        ready: function(){
                            // $scope.cropping = true;
                            var $clone = $(this).clone().removeClass('cropper-hidden');
                            $clone.css({
                                display: 'block',
                                width:'160px',
                                height:'120px'
                            });

                            // $preview.css({
                            //     overflow: 'hidden'
                            // }).html($clone);
                        },
                        crop: function(e){
                            var croppedCanvas=$(this).cropper('getCroppedCanvas');
                            var resultCanvas=getResultCanvas(croppedCanvas);
                            croppingUrl=resultCanvas.toDataURL();
                            console.log($scope.imgUrl);
                        }
                    })
                }

                finishBtn.on("click", function(){
                    controlBox.removeClass("sr-only");
                    cropper.addClass("sr-only");
                    finishBtn.addClass("sr-only");
                    $scope.addingWork.logoUrl = croppingUrl;
                    util.$apply();
                });
            }

            $scope.userInputLink = function($select){
                var search = $select.search,
                   list = angular.copy($select.items);
               //remove last user input
               list = list.filter(function(item) {
                   return item.id !== UserInputFlag;
               });
               if (!search) {
                   $select.items = list;
               }
               else {
                   //manually add user input and set selection
                   var userInputItem = {
                       id: UserInputFlag,
                       url: search
                   };
                   $select.items = [userInputItem].concat(list);
                   $select.selected = userInputItem.url;
                   $scope.addingWork.workLink = userInputItem.url;
               }
           }

            $scope.urlSelected = function(item, uiSelectModal){
                $scope.addingWork.workLink = (item.id === UserInputFlag) ? item.url : (LocationOrigin + item.url);
                $scope.addingWork.isThirdLink = (item.id === UserInputFlag) ? true : false;
            }

            var getFileList = function(){
                var username = $scope.user.username;
                var dataSourceList = dataSource.getDataSourceList(username);
                for (var i = 0; i < (dataSourceList || []).length; i++) {
                    var siteDataSource = dataSourceList[i];
                    siteDataSource.getTree({path:'/'+ username}, function (data) {
                        for (var i = 0; i < (data || []).length; i++) {
                            if (data[i].pagename.indexOf(".gitignore") >= 0) {
                                continue;
                            }
                            $scope.linkList.push(data[i]);
                        }
                    });
                }
            }

            $scope.$watch("$viewContentLoaded", getFileList);
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});