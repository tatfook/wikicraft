/**
 * Created by wuxiangan on 2016/12/19.
 */

define(['jquery', 'app'], function ($, app) {
    console.log("testCtrl");

    return function ($scope, ProjectStorageProvider) {
        const github = ProjectStorageProvider.getDataSource('github');
        console.log("testCtrl===");
        $scope.message = "hello test";

        github.init(undefined, function () {
           init();
        });

        function init() {
            $('#uploadPortraitBtn').change(function (e) {
                var fileReader = new FileReader();
                fileReader.onload = function () {
                    $('#portraitImg').attr('src', fileReader.result);
                    console.log(fileReader.result);
                     github.uploadImage("portrait", fileReader.result, function (error, result, request) {
                     if (error) {
                        console.log("上传失败");
                     }
                     $scope.user.portrait = result.content.download_url;
                     });
                     
                };
                //fileReader.readAsDataURL(e.target.files[0]);
                fileReader.readAsBinaryString(e.target.files[0]);
            });
        }
    };
});