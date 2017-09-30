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
        $scope.cancel = function () {
            $scope.$dismiss();
        };

        var getFileByUsername = function () {
            util.post(config.apiUrlPrefix + "bigfile/getByUsername",{}, function(data){
                data = data || {};
                $scope.filelist = data.filelist;
                console.log($scope.filelist);
            });
        };

        var getUserStoreInfo = function () {
            util.get(config.apiUrlPrefix+"bigfile/getUserStoreInfo", {}, function (result) {
                if (!result){
                    return;
                }
                $scope.storeInfo = {
                    "used": result.used / 1024 / 1024 / 1024 || 0,
                    "total": result.total / 1024 / 1024 / 1024 || 0,
                    "unUsed": (result.total - result.used) / 1024 / 1024 / 1024
                };
                console.log($scope.storeInfo);
            }, function (err) {
                console.log(err);
            }, false);
        };

        $scope.initQiniu = function(){
            if (qiniuBack){
                return;
            }
            var option = {
                "browse_button":"selectFileInput",
                "drop_element":"dropFile",
                "unique_name": true,
                "auto_start": false,
                "uptoken_url": '/api/wiki/models/qiniu/uploadToken',
                "domain": 'ov62qege8.bkt.clouddn.com',
                "init": {
                    'FilesAdded': function(up, files) {
                        var self = this;
                        var filelist = [];
                        for (var i = 0; i < files.length; i++) {
                            filelist.push(files[i].name)
                        }
                        util.post(config.apiUrlPrefix + "bigfile/getByFilenameList", {filelist:filelist}, function(data){
                        	console.log(data);
                        	if (data.length > 0) {
                        	    var conflictFileName = [];
                        	    var contentHtml = '<p class="dialog-info-title">网盘中已存在以下文件，是否覆盖？</p>';
                        	    data.map(function (file) {
                                    conflictFileName.push(file.filename);
                                    contentHtml+='<p class="dialog-info"><span class="text-success glyphicon glyphicon-ok"></span> '+ file.filename +'</p>';
                                });

                                config.services.confirmDialog({
                                    "title": "上传提醒",
                                    "contentHtml": contentHtml
                                }, function () {
                                    $scope.uploadingFiles = files;
                                    self.start();
                                }, function () {
                                    files = files.filter(function (file) {
                                        return conflictFileName.indexOf(file.name) < 0;
                                    });
                                    if(files.length > 0){
                                        $scope.uploadingFiles = files;
                                        self.start();
                                    }
                                });
                        		return ;
                        	}
                            $scope.uploadingFiles = files;
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
                            key:file.name,
                            size:file.size,
                            type:file.type,
                            hash:info.hash,
                            channel:"qiniu",
                        };
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
                    },
                    'UploadComplete': function() {
                        //队列文件处理完毕后，处理相关的事情
                        getFileByUsername();
                        getUserStoreInfo();
                    },
                }
            };
            if ($scope.updatingFile){// 更新文件
                var type = $scope.updatingFile.file.type;
                var filenameSplit = $scope.updatingFile.filename.split(".");
                var fileExt = filenameSplit[filenameSplit.length - 1];
                var minTypes = [];
                minTypes.push({
                    "title": type,
                    "extensions": "'"+fileExt+"'"
                });

                option.multi_selection = false;
                option.filters = {
                    "prevent_duplicates": true,
                    "mine_types": minTypes
                }
                console.log(option.filters);
            }
            qiniuBack= Qiniu.uploader(option);
            console.log(qiniuBack);
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

        $scope.stopUpload = function () {
            console.log("stoping");
        };

        $scope.deleteFile = function(files, index) {
            console.log(files);
            config.services.confirmDialog({
                "title":"删除文件",
                "confirmBtnClass":"btn-danger",
                "theme":"danger",
                "content":"确定删除所选文件吗？"
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
            console.log(deletingArr);
        }

        var changeFileName = function (file, filename, targetElem) {
            targetElem.attr("contenteditable", "false");
            $scope.nameErr="";
            // filename = filename.trim();
            console.log(file);
            console.log(filename);

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
        };

        $scope.insertFile = function (file) {
            var insertingFiles = [];
            insertingFiles.push(file);
            $scope.insertFiles(insertingFiles);
        };

        function getFileType(file) {
            if (!file.file || !file.file.type){
                return;
            }
            var fileType = file.file.type;
            if (/image\/\w+/.test(fileType)){
                return "image";
            }else {
                return;
            }
        }

        $scope.insertFiles = function (files) {
            if (!files){
                files = $scope.filelist.filter(function (file) {
                    return file.checkedIndex >= 0;
                });
            }

            $scope.$dismiss(files);
        }
    }]);
    return htmlContent;
});