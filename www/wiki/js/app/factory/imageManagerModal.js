/**
 * Created by Rango Yuan on 2017/12/20.
 * 
 */

// how to use
// config.services.imageManagerModal({
//    title: '选择图片',
//    modalPositionCenter: true,
//    nav: 'myImages'
// }, function(url) {
//    //handle url
// });

define([
    'app',
    'angular',
    'helper/util',
    'helper/dataSource',
    'bluebird',
    'text!html/partial/imageManagerModal.html',
], function (app, angular, util, dataSource, Promise, htmlContent) {
    app.registerController("imageManagerModalController", ['$scope', 'options', 'gitlab', function ($scope, options, gitlab) {
        var toggleNavCount = 0;
        $scope.currentNav = options.nav || 'myImages';
        $scope.title = options.title || '选择图片';
        $scope.currentPage = options.currentPage;
        $scope.xiuxiuIsReady = false;
        console.log('$scope.user', $scope.user);
        $scope.internetImageUrl = '';

        $scope.imgContent = null;
        $scope.imageList = [];
        $scope.choosedItems = [];

        openMyImages();

        $scope.toggleNav = function(nav, params) {
            if (toggleNavCount && nav === $scope.currentNav) return;
            toggleNavCount ++;
            $scope.currentNav = nav;
            nav === 'myImages' && openMyImages(params);
            nav === 'internetImage' && openInternetImage(params);
            nav === 'beautifyImage' && openBeautifyImage(params);
        }

        $scope.toggleChooseItem = function(item) {
            var isItemChoosed = $scope.isItemChoosed(item);
            if (!isItemChoosed) {
                $scope.choosedItems[0] = item;
            } else {
                $scope.choosedItems = [];
            }
        }

        $scope.isItemChoosed = function(item) {
            return $scope.choosedItems.indexOf(item) > -1;
        }

        function openMyImages() {
            getAllImageList();
        }

        function getAllImageList() {
            if ($scope.imageList.length) return;

            var currentDataSource = getCurrentDataSource();
            currentDataSource && currentDataSource.getImageList(function (data){
                $scope.imageList = data;
            }, function(err) {
                console.error(err);
            });
        }

        function openInternetImage() {
            $scope.internetImageUrl = '';
        }

        function openBeautifyImage(url) {
            if (window.xiuxiu && url) window.xiuxiu.loadPhoto(url);
            if ($scope.xiuxiuIsReady) return;
            config.loading.show();
            xiuxiuReady(function(xiuxiu) {
                $scope.xiuxiuIsReady = true;
                xiuxiu.embedSWF("imageManagerXiuxiuContainer", 3, "100%", "100%");
                xiuxiu.onInit = function() {
                    config.loading.hide();
                    xiuxiu.setUploadType(3);
                    xiuxiu.loadPhoto(url);
                }
                xiuxiu.onSaveBase64Image = function(data, fileName, fileType, id) {
                    // alert("保存为base64图片,大小:" + data.length + ",文件名:" + fileName + ",类型:" + fileType);
                    data = 'data:image/' + fileType + ';base64,' + data;
                    uploadImg(data, function(url) {
                        console.log(url);
                        myImagesAddImages([url]);
                        $scope.toggleNav('myImages');
                    }, function(err) {
                        console.error(err);
                    });
                }
                xiuxiu.onDebug = function(data) {
                    alert("错误响应" + data);
                }
                xiuxiu.onClose = function(id) {
                    clearFlash();
                }
            });

            function xiuxiuReady(callback) {
                if (window.xiuxiu) return callback && callback(window.xiuxiu);
                var script = document.createElement('script');
                script.src = "http://open.web.meitu.com/sources/xiuxiu.js";
                script.onload = function() {
                    callback && callback(window.xiuxiu);
                };
                document.body.appendChild(script);
            }
        }

        $scope.beautifyImage = function(img) {
            $scope.toggleNav('beautifyImage', img.url);
        }

        $scope.removeImage = function(img) {
            var currentDataSource = getCurrentDataSource();
            currentDataSource.removeImage(img.url, function () {
                $scope.imageList.splice($scope.imageList.indexOf(img), 1);
            }, function (err) {
                console.error(err);
            });
        }

        $scope.onInputFileChange = function(e) {
            var files = e && e.target && e.target.files;
            uploadImageFiles(files);
        }

        $scope.onDropFiles = function(e) {
            $scope.preventDefault(e);
            var files = e.originalEvent && e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files;
            uploadImageFiles(files);
        }

        $scope.preventDefault = function(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        $scope.getSubmittable = function() {
            switch($scope.currentNav) {
                case 'myImages':
                    return !!$scope.choosedItems.length;
                break;
                case 'internetImage':
                    return util.urlRegex.test($scope.internetImageUrl);
                break;
                case 'beautifyImage':
                break;
            }
            return false;
        }

        $scope.submit = function() {
            var img;
            var url;

            switch($scope.currentNav) {
                case 'myImages':
                    img = $scope.choosedItems && $scope.choosedItems[0];
                    url = img && img.url;
                break;
                case 'internetImage':
                    url = $scope.internetImageUrl;
                break;
                case 'beautifyImage':

                break;
            }
            $scope.$close(url);
        }

        $scope.cancel = function() {
            $scope.$dismiss('Canceled')
        }

        
        function uploadImageFiles(files) {
            var files = files && files.length && Array.prototype.filter.call(files, function(file) {
                return /^image/.test(file.type);
            });

            if (!(files && files.length)) return Promise.reject('No files to upload!');

            var urls = [];
            return Promise.each(files, function(file) {
                return new Promise(function(resolve, reject) {
                    uploadImageFile(file, function(url){
                        urls.push(url);
                        resolve(url);
                    }, function(err) {
                        $scope.imgErr = "图片上传失败，请稍后重试";
                        reject(err);
                    })
                })
            }).then(function() {
                resetFilePickerInput();
                myImagesAddImages(urls);
                return urls;
            }).catch(function(e) {
                resetFilePickerInput();
                $scope.imageFilesPickerInput = "";
                throw e;
            })
        }

        function myImagesAddImages(urls) {
            for(var key in urls) $scope.imageList.push({url: urls[key]});
        }

        function resetFilePickerInput() {
            var imageFilesPickerInput = angular.element('#image-files-picker-input');
            imageFilesPickerInput.val('');
        }

        function uploadImageFile(file, successCallback, errorCallback) {
            var fileReader = new FileReader();
            fileReader.onload = function () {
                var imgContent = fileReader.result;
                uploadImg(imgContent, successCallback, errorCallback);
            };
            fileReader.readAsDataURL(file);
        }

        function uploadImg(imgContent, successCallback, errorCallback) {
            var currentDataSource = getCurrentDataSource();
            currentDataSource && currentDataSource.uploadImage({ content: imgContent, isShowLoading: true }, function(url) {
                successCallback && successCallback(url);
            }, function(err) {
                errorCallback && errorCallback(err);
            });
        }

        function clearFlash() {
            var flashDom = document.getElementById("flashEditorOut");
            flashDom && (flashDom.innerHTML = '');
        }

        function getCurrentDataSource() {
            return $scope.currentPage && $scope.currentPage.username
                ? dataSource.getDataSource($scope.currentPage.username, $scope.currentPage.sitename)
                : dataSource.getDefaultDataSource()
        }
    }]);

    app.factory('imageManagerModal', ['$uibModal', function ($uibModal) {
        function imageManagerModal(options, successCallback, errorCallback) {
            return new Promise(function(resolve, reject) {
                $uibModal.open({
                    template: htmlContent,
                    controller: 'imageManagerModalController',
                    size: 'lg',
                    windowClass: 'image-manager-popup' + ((options && options.modalPositionCenter) ? ' modal-position-center' : ''),
                    resolve: {
                        options: options
                    }
                }).result.then(function(res) {
                    successCallback && successCallback(res);
                    resolve(res);
                }, function(error) {
                    errorCallback && errorCallback(error);
                    reject(error);
                });
            });
        }
        return imageManagerModal;
    }]);
});
