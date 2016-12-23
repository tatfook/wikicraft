define(['jquery','app', 'util', 'config', 'storage'], function ($, app, util, config, storage) {
    app.registerController("defaultBackgroundController", function ($scope, $auth, $interval, Account, Message) {
        function init() {
            var moduleParams = $scope.wikiBlockParams;
            console.log(moduleParams);
            $scope.style = {
                'background-color': moduleParams.backgroundColor,
                'width':moduleParams.width,
                "height": moduleParams.height || (document.body.scrollHeight + "px"),
                'background-image': moduleParams.backgroundImage,
            };
            if (!moduleParams.height) {
                $interval(function () {
                    //console.log(document.body.scrollHeight);
                    //$scope.style.height = document.body.scrollHeight + "px";
                },100);
            }

            $scope.$on("http", function () {
                $scope.style.height = document.body.scrollHeight + "px";
            })
        }


        init();
    });

    return {
        render: function () {
            return '<div ng-controller="defaultBackgroundController" style="position: absolute; left: 0px; right: 0px; z-index: -1;">' +
                '<div class="container"><div ng-style="style"></div></div></div>';
        }
    };
});