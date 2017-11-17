/**
 * Created by wuxiangan on 2017/1/10.
 */

define([
    'app',
    'helper/util'
], function (app, util) {
    app.registerController('videoPlayerController', ['$scope', '$rootScope', '$location', '$http', '$element', function ($scope, $rootScope, $location, $http, $element) {
        $rootScope.frameFooterExist = false;
        $rootScope.frameHeaderExist = false;
        var video_id = $location.search().video_id
        $scope.$watch('$viewContentLoaded', function() {
            util.get(config.apiUrlPrefix + "bigfile/getDownloadUrlById", {
                _id: video_id,
            }, function(data){
                // $element.find('video').attr('src', 'http://foodsound.qiniudn.com/video/introducing_thinglist.mp4');
                $element.find('video').attr('src', data);
            });
        });
    }]);

    return '\
        <style>\
            html{height: 100%;}\
            body{overflow-x: hidden;overflow-y: auto;}\
            body, #__mainContent__{background:black;display: flex;justify-content: center;align-items: center;width: 100%;height: 100%; min-height: auto !important;}\
        </style>\
        <div ng-controller="videoPlayerController" \
            style="width: 100vw; height: auto; max-height: 100vw;"\
        >\
            <video \
                style="display:block;width:100%;height:auto;max-width:100%;max-height:100%;" \
                controls \
                preload="auto" \
            ></video> \
        </div>\
    ';d
});