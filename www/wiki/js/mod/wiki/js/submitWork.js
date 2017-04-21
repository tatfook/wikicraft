/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/submitWork.html',
    'cropper'
], function (app, util, htmlContent) {
    function registerController(wikiblock) {
        app.registerController('submitWorkController',['$scope','Message', function ($scope,Message) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiblock.modParams || {});

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
                    console.log(imgUrl);
                    // innerGitlab.uploadImage({content:imgUrl}, function (url) {
                    //     $scope.website.logoUrl = url;
                    //     util.post(config.apiUrlPrefix + 'website/updateWebsite', $scope.website, function (data) {
                    //         $scope.website = data;
                    //         Message.info("站点图片上传成功!!!");
                    //     });
                    // }, function () {
                    //     Message.info("站点图片上传失败!!!");
                    // });
                });
            }
            $scope.$watch('$viewContentLoaded',init);
        }]);
    }
    return {
        render: function(wikiblock){
            registerController(wikiblock);
            return htmlContent;
        }
    };
})

/*
 ```@wiki/js/submitWork
 ```
 */