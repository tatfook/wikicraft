/**
 * Created by Rango Yuan on 2017/12/20.
 * 
 */

// how to use
// config.services.assetsManagerModal({
//    title: '选择图片',
//    modalPositionCenter: true,
//    nav: 'myImages'
// }, function(url) {
//    console.log(url); //handle url
// });

define([
    'app',
    // 'qiniu',
    'angular',
    'helper/util',
    'helper/dataSource',
    'bluebird',
    'text!html/partial/assetsManagerModal.html',
], function (app, angular, util, dataSource, Promise, htmlContent) {
    app.registerController("assetsManagerModalController", ['$scope', '$sce', 'options', 'gitlab', function ($scope, $sce, options, gitlab) {
        var toggleNavCount = 0;
        var qiniuFileUploadedCallbacks = [];

        $scope.currentNav = options.nav || 'myImages';
        $scope.title = options.title || '选择图片';
        $scope.currentPage = options.currentPage;
        $scope.xiuxiuIsReady = false;
        console.log('$scope.user', $scope.user);
        $scope.internetImageUrl = '';

        $scope.imgContent = null;
        $scope.imageList = [];
        $scope.choosedItems = [];

        $scope.$watch('$viewContentLoaded', function() {
            getQiniuUploader();
        });

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

        function getNakedUrlWithoutQueryAndHash(url) {
            return (url && url.split && url.split(/\?|\#/)[0] || '');
        }

        $scope.isUrlVideo = function(url) {
            var result = /(mp4|mov|amv|avi)$/.test(getNakedUrlWithoutQueryAndHash(url));
            return false; //result; //disable video, enable it when adi is ready for video
        }

        $scope.isUrlImage = function(url) {
            var result = /(jpe?g|png|svg|gif|bmp)$/.test(getNakedUrlWithoutQueryAndHash(url));
            return result;
        }

        $scope.isValidUrl = function(url) {
            return $scope.isUrlImage(url) || $scope.isUrlVideo(url);
        }

        $scope.getUrlPreviewDOM = function(url) {
            if ( $scope.isUrlVideo(url) )
                return $sce.trustAsHtml('<video src="' + url + '"></video>');

            if ( $scope.isUrlImage(url) )
                return $sce.trustAsHtml('<img src="' + url + '" />');

            return '';
        }

        function openMyImages() {
            getAllImageList();
        }

        function getAllImageList() {
            if ($scope.imageList.length) return;

            var currentDataSource = getCurrentDataSource();
            currentDataSource && currentDataSource.getImageList(function (data){
                myImagesAddImages(data);
                getAllVideoAndImageBigFiles();
            }, function(err) {
                console.error(err);
                getAllVideoAndImageBigFiles();
            });
        }

        function getAllVideoAndImageBigFiles() {
            util.post(config.apiUrlPrefix + "bigfile/getByUsername",{pageSize:100000}, function(data){
                data = data || {};
                var mediaUrlList = (data.filelist || []).filter(function(item) {
                    return item && item.file && item.file.download_url && $scope.isValidUrl(item.file.download_url);
                }).map(function(item) {
                    return item.file.download_url;
                });
                myImagesAddImages(mediaUrlList);
            });
        }

        function openInternetImage() {
            $scope.internetImageUrl = '';
        }

        function openBeautifyImage(url) {
            var base64Regex = /^data:image\/(png|jpg|gif);base64,/;
            var isBase64 = false;
            if (url) {
                isBase64 = base64Regex.test(url);
                isBase64 && (url = url.replace(base64Regex, ''));
            }

            if (window.xiuxiu && url) window.xiuxiu.loadPhoto(url, isBase64);
            if ($scope.xiuxiuIsReady) return;
            config.loading.show();
            xiuxiuReady(function(xiuxiu) {
                $scope.xiuxiuIsReady = true;
                xiuxiu.embedSWF("imageManagerXiuxiuContainer", 1, "100%", "100%");
                var loadingAutoHideTimer = setTimeout(function() {
                    config.loading.hide();
                }, 2000);
                xiuxiu.onInit = function() {
                    xiuxiu.setUploadType(3);
                    url && xiuxiu.loadPhoto(url, isBase64);
                    clearTimeout(loadingAutoHideTimer);
                    config.loading.hide();
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
            if (urlFromQiniu(img.url)) {
                getBase64ContentFromImage(img.url, function(base64Url) {
                    $scope.toggleNav('beautifyImage', base64Url);
                    util.$apply();
                })
            } else {
                $scope.toggleNav('beautifyImage', img.url);
            }

            function urlFromQiniu(url) {
                return /^https?\:\/\/[a-z0-9]+\.bkt\.clouddn\.com\//.test(url)
            }

            function getBase64ContentFromImage(url, cb) {
                var img = new Image();
                img.setAttribute('crossOrigin', 'anonymous');
                img.onload = function () {
                    var canvas = document.createElement("canvas");
                    canvas.width =this.width;
                    canvas.height =this.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(this, 0, 0);
                    var dataURL = canvas.toDataURL("image/png");
                    cb(dataURL);
                };
                img.src = url;
            }
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

        function getQiniuUploader(cb, errcb) {
            if ($scope.qiniuUploader) {
                cb($scope.qiniuUploader);
            } else {
                getNewQiniuUploader(function(uploader) {
                    $scope.qiniuUploader = uploader;
                    cb && cb(uploader);
                }, errcb);
            }
        }

        function getNewQiniuUploader(cb, errcb) {
            var option = {
                browse_button: "qiniuUploadAssetsBtn",
                unique_names: true,
                auto_start: false,
                get_new_uptoken: false,
                // uptoken: 'LYZsjH0681n9sWZqCM4E2KmU6DsJOE7CAM4O3eJq:jlDU6EFiXBAcVYCH-rGtuAIqmWo=:eyJzY29wZSI6ImtlZXB3b3JrLWRldiIsImNhbGxiYWNrVXJsIjoiaHR0cDovLzEyMS4xNC4xMTcuMjUyOjg5MDAvYXBpL3dpa2kvbW9kZWxzL3Fpbml1L2NhbGxiYWNrIiwiY2FsbGJhY2tCb2R5IjoidWlkPSQoeDp1aWQpJnNpemU9JChmc2l6ZSkmYnVja2V0PSQoYnVja2V0KSZrZXk9JChrZXkpIiwiZGVhZGxpbmUiOjE1MTU2NjY2NDJ9',
                uptoken_url: '/api/wiki/models/qiniu/uploadToken',
                domain: 'ov62qege8.bkt.clouddn.com',
                chunk_size: "4mb",
                filters:{},
                x_vars: {
                    uid: ''
                },
                init: {
                    FilesAdded: function(up, files) {
                        var self = this;
                        console.log('FilesAdded: ', up, files);
                        self.start();
                    },
                    BeforeUpload: function(up, file) {
                        console.log('qiniuUploader BeforeUpload: ', up, file);
                    },
                    UploadProgress: function(up, file) {
                        console.log('qiniuUploader UploadProgress: ', up, file);
                    },
                    FileUploaded: function(up, file, response) {
                        console.log('qiniuUploader FileUploaded: ', up, file, response);
                        qiniuFileUploadedCallbacks.forEach(function(callback) {
                            callback(up, file, response);
                        });
                    },
                    Error: function(up, err, errTip) {
                        console.log('qiniuUploader Error: ', up, err, errTip);
                    },
                    UploadComplete: function() {
                        console.log('qiniuUploader UploadComplete');
                    }
                }
            };

            getQiniuUid(function(uid) {
                option.x_vars.uid = uid;
                var uploader = Qiniu.uploader(option);
                cb && cb(uploader);
            }, errcb);
        }

        function getQiniuUid(cb, errcb) {
            // return cb('b3affaa33c31b997cb7902809ef194da'); //for test
            util.get(config.apiUrlPrefix + 'qiniu/getUid',{}, function(data){
                (data && data.uid)
                    ? (cb && cb(data.uid)) 
                    : (errcb && errcb());
            }, errcb);
        }

        function uploadImageFiles(files) {
            var files = files && files.length && Array.prototype.filter.call(files, function(file) {
                return /^(image|video)/.test(file.type);
            });

            if (!(files && files.length)) return Promise.reject('No files to upload!');

            var urls = [];

            config.loading.show();

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
                config.loading.hide();
                return urls;
            }).catch(function(e) {
                resetFilePickerInput();
                $scope.imageFilesPickerInput = "";
                config.loading.hide();
                throw e;
            })
        }

        function myImagesAddImages(urls) {
            for(var key in urls) {
                var url = urls[key];
                (url.url && (url = url.url));
                typeof url === 'string' && $scope.imageList.push({url: url});
            }
            util.$apply($scope);
        }

        function resetFilePickerInput() {
            var imageFilesPickerInput = angular.element('#image-files-picker-input');
            imageFilesPickerInput.val('');
        }

        function uploadImageFile(file, successCallback, errorCallback) {
            console.log('uploadImageFile: ', file);
            var size10M = 10 * 1024 * 1024;

            file.size < size10M
                ? uploadFileThroughGit(file, successCallback, errorCallback)
                : uploadFileThroughQiniu(file, successCallback, errorCallback);
        }

        function uploadFileThroughQiniu(file, successCallback, errorCallback) {
            getQiniuUploader(function(uploader) {
                var callbackFn = function(up, uploadedFile, res) {
                    var uploadedOriginalFile = uploadedFile.getNative();
                    if (file === uploadedOriginalFile) {
                        var info = JSON.parse(res.response);
                        logBigfileIntoDatabaseAfterUploadFileThroughQiniu({
                            filename: uploadedFile.name,
                            domain: up.getOption('domain'),
                            key: info.key,
                            size: uploadedFile.size,
                            type: uploadedFile.type,
                            hash: info.hash, //useless? what's this!
                            channel: "qiniu"
                        }, function() {
                            getDownloadUrlByKey(info.key, successCallback, errorCallback);
                        }, errorCallback);
                        qiniuFileUploadedCallbacks.splice(qiniuFileUploadedCallbacks.indexOf(callbackFn), 1);
                    }
                };
                qiniuFileUploadedCallbacks.push(callbackFn);
                uploader.addFile(file);
            });
        }

        function getDownloadUrlByKey(fileKey, successCallback, errorCallback) {
            util.get(config.apiUrlPrefix + "bigfile/getDownloadUrlByKey", {
                key: fileKey
            }, successCallback, errorCallback);
        }

        function logBigfileIntoDatabaseAfterUploadFileThroughQiniu(params, successCallback, errorCallback) {
            // var params = {
            //     filename:file.name,
            //     domain:domain,
            //     key:info.key || file.target_name,
            //     size:file.size,
            //     type:file.type,
            //     hash:info.hash, //useless? what's this!
            //     channel:"qiniu"
            // };
            util.post(config.apiUrlPrefix + 'bigfile/upload', params, function(data){
                successCallback && successCallback(data);
            }, function(){
                deleteFileOnQiniuByKey(params.key, errorCallback, errorCallback);
            });
        }

        function deleteFileOnQiniuByKey(key, successCallback, errorCallback) {
            util.post(config.apiUrlPrefix + "qiniu/deleteFile", {
                key: key
            }, successCallback, errorCallback);
        }

        function uploadFileThroughGit(file, successCallback, errorCallback) {
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

    app.factory('assetsManagerModal', ['$uibModal', function ($uibModal) {
        function assetsManagerModal(options, successCallback, errorCallback) {
            return new Promise(function(resolve, reject) {
                $uibModal.open({
                    template: htmlContent,
                    controller: 'assetsManagerModalController',
                    size: 'lg',
                    backdrop: 'static',
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
        return assetsManagerModal;
    }]);
});
