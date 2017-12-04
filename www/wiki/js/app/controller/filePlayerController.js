/**
 * Created by Rango Yuan on 2017/11/21.
 */

define([
    'app',
    'helper/util'
], function (app, util) {
    app.registerController('videoPlayerController', ['$scope', '$rootScope', '$location', '$http', '$element', function ($scope, $rootScope, $location, $http, $element) {
        $rootScope.frameFooterExist = false;
        $rootScope.frameHeaderExist = false;

        $scope.isVideo = false;
        $scope.isAudio = false;
        $scope.download = false;

        var locationSearch = $location.search();
        var fileId = locationSearch.file_id;
        var fileKey = locationSearch.file_key;

        // download_title=ClickToDownload&file_name=InterestingVideo.mp4

        $scope.$watch('$viewContentLoaded', function() {
            // play('http://foodsound.qiniudn.com/video/introducing_thinglist.mp4');
            // play('http://qiniuuwmp3.changba.com/719810514.mp3');
            var getDownloadUrlApi;

            if (!fileId && !fileKey) return;
            fileId && (getDownloadUrlApi = config.apiUrlPrefix + "bigfile/getDownloadUrlById");
            fileKey && (getDownloadUrlApi = config.apiUrlPrefix + "bigfile/getDownloadUrlByKey");

            util.get(getDownloadUrlApi, {
                _id: fileId,
                key: fileKey
            }, function(data){
                play(data);
            });
        });

        function play(url) {
            var fileInfo = getFileInfo(url);

            var fileName = locationSearch.file_name || fileInfo.name;
            var downloadTitle = locationSearch.download_title || fileName;
            var download = !!locationSearch.download || false;

            $scope.downloadFileName = fileName;
            $scope.downloadTitle = downloadTitle;
            $scope.downloadUrl = url + (locationSearch.file_name ? (';attname=' + fileName) : '');
            $scope.playUrl = url;

            if (download) return updateUIforDownload();

            if (['avi','rmvb','rm','asf','divx','mpg','mpeg','mpe','wmv','mp4','mkv','vob'].indexOf(fileInfo.type) > -1) {
                $scope.isVideo = true;
                setTimeout(function() {
                    $element.find('video').attr('src', url);
                });
            } else if(['mp3','wav','rm','asf','divx','mpg','mpeg','mpe','wmv','mp4','mkv','vob'].indexOf(fileInfo.type) > -1) {
                $scope.isAudio = true;
                setTimeout(function() {
                    $element.find('audio').attr('src', url);
                });
            } else {
                updateUIforDownload();
            }
        }

        function updateUIforDownload() {
            $scope.download = true;
            // __mainContent__.style.background = document.body.style.background = 'transparent';
        }

        function getFileInfo(url) {
            var filename = ((url || '').split(/\?|\&|\#/)[0] || '').split(/\//).pop();

            return {
                name: filename,
                type: (filename || '').split('.').pop()
            }
        }
    }]);

    return '\
        <style>\
            html{height: 100%;}\
            body{overflow-x: hidden;overflow-y: auto;}\
            html, body, #__mainContent__{background: transparent;display: flex;justify-content: center;align-items: center;width: 100%;height: 100%; min-height: auto !important;}\
        </style>\
        <div ng-controller="videoPlayerController" \
            style="width: 100vw; height: auto; max-height: 100vw;"\
        >\
            <div ng-if="isVideo">\
                <video \
                    style="display:block;width:100%;height:auto;max-width:100%;max-height:100%;" \
                    controls \
                    preload="auto" \
                    onclick="this.paused ? this.play() : this.pause();" \
                ></video> \
            </div>\
            <div ng-if="isAudio">\
                <audio \
                    style="display:block;width:100%;height:auto;max-width:100%;max-height:100%;" \
                    controls \
                    preload="auto" \
                ></audio> \
            </div>\
            <div ng-if="download">\
                <center><a ng-href="{{downloadUrl}}" download="{{downloadFileName}}">{{downloadTitle}}</a></center>\
            </div>\
        </div>\
    ';d
});