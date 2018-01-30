/**
 * Created by wuxiangan on 2017/1/9.
 */

define([
		'app',
		'helper/dataSource',
		'js-base64',
], function (app, dataSource) {
    function registerController(wikiBlock) {
        app.registerController("fileuploadController", ['$scope',function ($scope) {
            //console.log(wikiBlock);
            // 模块参数初始化相关表单值
            var modParams = wikiBlock.modParams || {};

			function init() {
				// console.log("-------------------");
				if (!$scope.user.username) {
					// console.log("用户信息不存在,不支持上传");
					return; 
				}

				var filecontent = modParams || "hello world"; // 文件内容
				var filename = "test/test.md"   // 文件名  可包含路径 不需要/开头
				var dsInst = dataSource.getDataSource($scope.user.username); // sitename 留null 用默认是数据源


				filecontent = Base64.encode(filecontent); // 默认都是编码内容
				dsInst.uploadFile({
					path:filename,
					content:filecontent,
				}, function(download_url){
					// console.log("文件的下载地址:", download_url);
					$scope.download_url = download_url;
				},function() {
					// console.log("上传失败");
				});
			}

			$scope.$watch("$viewContentLoaded", init);
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  '<div ng-controller="fileuploadController">{{download_url}}</div>';       // 返回模块标签内容
        }
    }
});

/*
 ```@example/js/fileupload
 file content...
 ```
 */
