/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: none
 * @Last Modified time: 2018-01-24 19:31:45
 */
define([
    'app', 
    'helper/util',
    'text!wikimod/profile/html/works.html',
    'text!wikimod/profile/html/modalTemplate/addWorkModal.html',
    'cropper'
], function (app, util, htmlContent, addWorkModalHtmlContent) {
    function registerController(wikiBlock) {
        app.registerController("worksCtrl", ['$scope','$uibModal', function ($scope, $uibModal) {
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

            $scope.works = $scope.params.works;

            $scope.showModal = function(){
                $uibModal.open({
                    template: addWorkModalHtmlContent,
                    controller: "addWorkModalCtrl",
                    appendTo: $(".user-works .modal-parent"),
                    scope: $scope
                }).result.then(function(result){
                    console.log(result);
                }, function(){
                    console.log("22222");
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