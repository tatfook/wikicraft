/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: none
 * @Last Modified time: 2018-01-25 21:52:26
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
        app.registerController("worksCtrl", ['$rootScope', '$scope','$uibModal', function ($rootScope, $scope, $uibModal) {
            const modCmd = "```@profile/js/works";
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

            $scope.works = Array.from($scope.params.works);

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

            $scope.showModal = function(){
                $uibModal.open({
                    template: addWorkModalHtmlContent,
                    controller: "addWorkModalCtrl",
                    appendTo: $(".user-works .modal-parent"),
                    scope: $scope
                }).result.then(function(result){
                    $scope.works.push(result);
                    var newItemObj = {
                        index: getBlockIndex(),
                        containerId: thisContainerId,
                        content: modCmd + "\n" + mdconf.jsonToMd({
                            "works": $scope.works
                        }) + "\n```\n"
                    }
                    console.log(newItemObj.content);
                    $rootScope.$broadcast("changeProfileMd", newItemObj);
                }, function(){
                });
            }
        }]);

        app.registerController("addWorkModalCtrl", ['$scope','$uibModal', '$uibModalInstance',function ($scope, $uibModal, $uibModalInstance) {
            $scope.addingWork = {};
            $scope.cancel = function(){
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
                $scope.errMsg = "";
                var requiredAttrs = [{
                    'key': 'title',
                    'value': '作品名'
                },
                {
                    'key': 'workLink',
                    'value': '作品链接'
                }];
                var requiredResult = isRequiredEmptyAttr(requiredAttrs); 
                if (requiredResult.boolResult) {
                    $scope.errMsg = requiredResult.attr + "不可为空";
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
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});