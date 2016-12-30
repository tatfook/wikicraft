/**
 * Created by wuxiangan on 2016/12/19.
 */

define(['jquery', 'app',''], function ($, app) {
    console.log("testCtrl");
    return function ($scope, $compile, Account, github) {
        $scope.src = '/wiki/imgs/ManPortrait.jpg';
        setTimeout(function () {
            console.log('============');
            $scope.src = '#images/test/test';
            $scope.$apply();
        },2000);
        $('#uploadPortraitBtn').change(function (e) {
            var fileReader = new FileReader();
            fileReader.onload = function () {
                github.uploadImage('test/test', fileReader.result,  function (data) {
                    
                });
                /*
                 github.uploadImage("portrait", fileReader.reault, function (error, result, request) {
                 if (error) {
                 console.log("上传失败");
                 }
                 $scope.user.portrait = result.content.download_url;
                 });
                 */
            };
            fileReader.readAsDataURL(e.target.files[0]);
        });
    };
});