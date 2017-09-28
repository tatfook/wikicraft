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
                        	if (data.length) {
                        		console.log("存在同名文件是否覆盖");
                        		return ;
                        	}
                        	// self.start();
                        });

                        // $scope.uploadingFiles = files;
                        // self.start();
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
                            getUserStoreInfo();
                            $scope.filelist.push({file: params});
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
                    },
                }
            };
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
    }]);
    return htmlContent;
});