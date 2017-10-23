/**
 * Created by 18730 on 2017/9/25.
 */
define([
    "app",
    "qiniu",
    "helper/util",
    "text!html/bigfile.html"
], function (app, qiniu, util, htmlContent) {
    app.registerController("bigfileController", ["$scope", function ($scope) {
        var qiniuBack;
        const biteToG = 1024*1024*1024;
        $scope.selectedType = "图片";
        if((util.getPathname() !="/wiki/user_center")){
            $scope.isModal=true;
        }
        $scope.cancel = function () {
            if ($scope.uploadingFiles && $scope.uploadingFiles.length > 0 && !$scope.finishUploading){
                console.log("正在上传");
                config.services.confirmDialog({
                    "title": "关闭提示",
                    "confirmBtnClass": "btn-danger",
                    "theme": "danger",
                    "content": "还有文件正在上传，确定关闭窗口？"
                }, function () {
                    $scope.$dismiss();
                });
            }else{
                $scope.$dismiss();
            }

        };

        var getFileByUsername = function () {
            util.post(config.apiUrlPrefix + "bigfile/getByUsername",{}, function(data){
                data = data || {};
                $scope.filelist = data.filelist;
            });
        };

        var getUserStoreInfo = function () {
            util.get(config.apiUrlPrefix+"bigfile/getUserStoreInfo", {}, function (result) {
                if (!result){
                    return;
                }
                $scope.storeInfo = {
                    "used": result.used / biteToG || 0,
                    "total": result.total / biteToG || 0,
                    "unUsed": (result.total - result.used) / biteToG
                };
            }, function (err) {
                console.log(err);
            }, false);
        };

        var isExceed = function (unUsed, uploadingSize) {
            if (unUsed > uploadingSize){
                return false;
            } else {
                config.services.confirmDialog({
                    "title": "空间不足",
                    "content": "网盘可用空间不足，无法上传！",
                    "cancelBtn": false
                }, function () {
                    return true;
                });
                return true;
            }
        };

        $scope.initQiniu = function(){
            if ($scope.finishUploading){
                $scope.uploadingFiles = [];
            }else if ($scope.finishUploading === false){
                return;
            }
            var qiniu = new QiniuJsSDK();
            var option = {
                "browse_button":"selectFileInput",
                "drop_element":"dropFile",
                "unique_names": true,
                "auto_start": false,
                "uptoken_url": '/api/wiki/models/qiniu/uploadToken',
                "domain": 'ov62qege8.bkt.clouddn.com',
                "init": {
                    'FilesAdded': function(up, files) {
                        var self = this;
                        var filelist = [];
                        var filesSize = 0;
                        var conflictSize = 0;
                        for (var i = 0; i < files.length; i++) {
                            filelist.push(files[i].name);
                            filesSize += files[i].size;
                        }
                        if ($scope.updatingFile && $scope.updatingFile._id){
                            if (isExceed($scope.storeInfo.unUsed * biteToG, (filesSize - $scope.updatingFile.file.size))){
                                return;
                            }
                            $scope.uploadingFiles = files;
                            self.start();
                            return;
                        }
                        util.post(config.apiUrlPrefix + "bigfile/getByFilenameList", {filelist:filelist}, function(data){
                        	if (data.length > 0) {
                        	    var conflictFileName = [];
                        	    var contentHtml = '<p class="dialog-info-title">网盘中已存在以下文件，是否覆盖？</p>';
                        	    data.map(function (file) {
                                    conflictFileName.push(file.filename);
                                    contentHtml+='<p class="dialog-info"><span class="text-success glyphicon glyphicon-ok"></span> '+ file.filename +'</p>';
                                    conflictSize += file.size;
                                });

                        	    if (isExceed($scope.storeInfo.unUsed * biteToG, (filesSize - conflictSize))){
                                    return;
                                }

                                config.services.confirmDialog({
                                    "title": "上传提醒",
                                    "contentHtml": contentHtml
                                }, function () {
                                    if (isExceed($scope.storeInfo.unUsed * biteToG, filesSize)){
                                        return;
                                    }
                                    $scope.storeInfo.unUsed -= filesSize/biteToG;
                                    $scope.uploadingFiles = $scope.uploadingFiles || [];
                                    $scope.uploadingFiles = $scope.uploadingFiles.concat(files);
                                    $scope.finishUploading = false;
                                    self.start();
                                }, function () {
                                    $scope.storeInfo.unUsed -= (filesSize - conflictSize)/biteToG;
                                    files = files.filter(function (file) {
                                        return conflictFileName.indexOf(file.name) < 0;
                                    });
                                    if(files.length > 0){
                                        $scope.uploadingFiles = $scope.uploadingFiles || [];
                                        $scope.uploadingFiles = $scope.uploadingFiles.concat(files);
                                        $scope.finishUploading = false;
                                        self.start();
                                    }
                                });
                        		return ;
                        	}
                            if (isExceed($scope.storeInfo.unUsed * biteToG, filesSize)){
                                return;
                            }
                            $scope.storeInfo.unUsed -= filesSize/biteToG;
                            $scope.uploadingFiles = $scope.uploadingFiles || [];
                            $scope.uploadingFiles = $scope.uploadingFiles.concat(files);
                            $scope.finishUploading = false;
                        	self.start();
                        });
                    },
                    'BeforeUpload': function(up, file) {
                        $scope.uploadingFiles[file.id] = file;
                        util.$apply();
                        console.log(file);
                        // 每个文件上传前，处理相关的事情
                    },
                    'UploadProgress': function(up, file) {
                        $scope.uploadingFiles[file.id] = file;
                        util.$apply();
                    },
                    'FileUploaded': function(up, file, response) {
                        var domain = up.getOption('domain');
                        var info = JSON.parse(response.response);
                        var hash = info.hash;

                        var params = {
                            filename:file.name,
                            domain:domain,
                            key:file.target_name,
                            size:file.size,
                            type:file.type,
                            hash:info.hash,
                            channel:"qiniu"
                        };

                        if ($scope.updatingFile && $scope.updatingFile._id){
                            params._id = $scope.updatingFile._id;
                            util.post(config.apiUrlPrefix + 'bigfile/updateById', params, function(data){
                                console.log(data);
                                data = data || {};
                                data.filename = params.filename;
                                $scope.uploadingFiles[file.id].status = "success";
                                getFileByUsername();
                            }, function(err){
                                console.log(err);
                            });
                            return;
                        }

                        util.post(config.apiUrlPrefix + 'bigfile/upload', params, function(data){
                            data = data || {};
                            data.filename = params.filename;
                            $scope.uploadingFiles[file.id].status = "success";
                        }, function(){
                            util.post(config.apiUrlPrefix + "qiniu/deleteFile", {
                                key:params.key,
                            }, function (result) {
                                console.log(result);
                            }, function (err) {
                                console.log(err);
                            });
                        });
                    },
                    'Error': function(up, err, errTip) {
                        //上传出错时，处理相关的事情
                        $scope.uploadingFiles = [];
                        $scope.updatingFile = [];
                        $scope.finishUploading = true;
                    },
                    'UploadComplete': function() {
                        //队列文件处理完毕后，处理相关的事情
                        getFileByUsername();
                        getUserStoreInfo();
                        $scope.finishUploading = true;
                        $scope.updatingFile = {};
                    },
                }
            };

            if ($scope.updatingFile && $scope.updatingFile._id){// 更新文件
                var type = $scope.updatingFile.file.type;
                var filenameSplit = $scope.updatingFile.filename.split(".");
                var fileExt = filenameSplit[filenameSplit.length - 1];
                var minTypes = [];
                minTypes.push({
                    "title": type,
                    "extensions": fileExt
                });

                option.multi_selection = false;
                option.filters = {
                    "prevent_duplicates": true,
                    "mime_types": minTypes
                };
            }
            if (qiniuBack){
                qiniuBack.destroy();
            }
            qiniuBack = qiniu.uploader(option);
        };

        var init = function () {
            if (!$scope.filelist){
                getFileByUsername();
            }
            if (!$scope.storeInfo){
                getUserStoreInfo();
            }
            // initQiniu();
        };
        $scope.$watch("$viewContentLoaded", init);

        $scope.stopUpload = function (file) {
            qiniuBack.stop();
            config.services.confirmDialog({
                "title": "取消上传",
                "confirmBtnClass": "btn-danger",
                "theme": "danger",
                "content": "确定取消该文件上传吗？"
            }, function () {
                $scope.storeInfo.unUsed += file.size/biteToG;
                qiniuBack.removeFile(file);
                file.isDelete = true;
            });
            qiniuBack.start();
        };

        $scope.deleteFile = function(files, index) {
            config.services.confirmDialog({
                "title":"删除文件",
                "confirmBtnClass":"btn-danger",
                "theme":"danger",
                "content":"确定删除文件吗？"
            },function(){
                if (index && !Array.isArray(files)){
                    var file = files;
                    file.index = index;
                    files = [];
                    files.push(file);
                }
                var fnList = [];
                for (var i=files.length -1; i >= 0;i--){
                    fnList.push((function (index) {
                        return function (finish) {
                            util.post(config.apiUrlPrefix + 'bigfile/deleteById', {_id:files[index]._id}, function (data) {
                                $scope.filelist[files[index].index].isDelete = true;
                            }, function (err) {
                                console.log(err);
                            });
                        }
                    })(i));
                    util.batchRun(fnList);
                }
            });
        };

        $scope.deleteFiles = function () {
            var deletingArr = $scope.filelist.filter(function (file) {
                return file.index >= 0;
            });
            $scope.deleteFile(deletingArr);
        };

        var changeFileName = function (file, filename, targetElem) {
            targetElem.attr("contenteditable", "false");
            $scope.nameErr="";
            // filename = filename.trim();

            var newFileSplit = filename.split(".");
            var newExt = newFileSplit[newFileSplit.length-1];
            var oldFileSplit = file.filename.split(".");
            var oldExt = oldFileSplit[oldFileSplit.length-1];
            oldExt = oldExt.trim();
            if (newFileSplit.length <= 1){// 文件扩展名被删，补扩展名
                filename+="."+oldExt;
                newFileSplit.push(oldExt);
                newExt = oldExt;
            }
            if (file.filename == filename){
                targetElem.html(filename);
                return;
            }
            if (oldExt != newExt){// 文件扩展名被修改
                filename+="." + oldExt;
                newFileSplit.push(oldExt);
                targetElem.html(filename);
                newExt = oldExt;
            }

            util.post(config.apiUrlPrefix+"bigfile/changeFilename",{
                "_id": file._id,
                "filename": filename
            }, function (result) {
                console.log(result);
            }, function (err) {
                console.log(err);
            });
        };

        $scope.updateFile = function (file) {
            // console.log("更新功能开发中。。。");
            $scope.updatingFile = file;
            $("#activeUpload").tab("show");
            $scope.initQiniu();
            // Message.info("更新功能开发中。。。");
        };
        
        var removeAllTags = function (str) {
            return str.replace(/<\/?(\w+)\s*[\w\W]*?>/g, '').replace(/^&nbsp;|&nbsp;$/g, '');
        };

        $scope.renameFile = function (file) {
            var targetFileId = file.file_id;
            var targetElem = $("#"+targetFileId);
            if (!targetElem){
                return;
            }
            targetElem.attr("contenteditable", "true");
            targetElem.focus();
            targetElem.bind("blur", function () {
                var filename = targetElem.html();
                filename = filename.replace(/[\n|<br>]/g, "").trim();
                targetElem.html(filename);
                changeFileName(file, filename, targetElem);
            });
            targetElem.on("paste", function () { // contenteditable中粘贴会包含html结构
                setTimeout(function () {
                    console.log(targetElem.html());
                    targetElem.html(removeAllTags(targetElem.html()));
                });
            })
        };

        $scope.downloadFile = function (file) {
            util.get(config.apiUrlPrefix + "bigfile/getDownloadUrlById", {
                _id:file._id,
            }, function(data){
                if (data) {
                    console.log(data);
                    var a = document.createElement('a');
                    var url = data;
                    a.href = url;
                    a.target = "_blank";
                    a.click();
                }
            });
        };

        $scope.insertFile = function (file) {
            var insertingFiles = [];
            insertingFiles.push(file);
            $scope.insertFiles(insertingFiles);
        };

        $scope.insertFiles = function (files) {
            if (!files){
                files = $scope.filelist.filter(function (file) {
                    return file.checkedIndex >= 0;
                });
            }

            $scope.$dismiss(files);
        };

        $scope.insertFilesUrl = function () {
            $scope.insertFileUrlErr = "";
            var type = "";
            var url = $scope.insertUrl;
            var urlReg= /^(http|https):\/\//;
            if (!url){
                $scope.insertFileUrlErr = "请输入要插入的url地址！";
                return;
            }
            if (!urlReg.test(url)){
                $scope.insertFileUrlErr = "请输入正确的url地址！";
                return;
            }
            switch ($scope.selectedType){
                case "图片":
                    type = "image";
                    break;
                case "视频":
                    type = "video";
                    break;
                default:
                    break;
            }
            $scope.$dismiss({
                "type": type,
                "url": url
            });
        }
    }]);
    return htmlContent;
});