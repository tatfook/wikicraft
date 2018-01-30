
/**
 * Created by wuxiangan on 2017/1/6.
 */

define([
		'app',
		'helper/util',
		"helper/qiniu",
		'text!html/temp.html',
], function (app, util, qiniu, htmlContent) {
	app.registerController("tempController", ['$scope','$http','$auth', function ($scope, $http, $auth ) {
		function init() {
			$scope.getFileList();

			qiniu.upload({
				browse_button:"uploadFileId",
				drop_element:"dropAreaId",
				auto_start:false,
			});
		}

		$scope.getFileList = function() {
			util.post(config.apiUrlPrefix + "bigfile/getByUsername",{}, function(data){
				data = data || {};
				$scope.filelist = data.filelist;
				for (var i = 0; i < (data.filelist || []).length; i++) {
					var file = data.filelist[i].file;

					if (file && file.size)  {
						file.size = Math.floor(file.size / 1024 / 1024 * 100) / 100;
					}
				}
				// console.log(data)
			});
		}

		$scope.deleteFile = function(x) {
			util.post(config.apiUrlPrefix + "bigfile/deleteById", {_id:x._id}, function() {

			}, function() {
				// console.log("删除失败");
			});
		}

		$scope.$watch("$viewContentLoaded", init);

	}]);

	return htmlContent;
});

