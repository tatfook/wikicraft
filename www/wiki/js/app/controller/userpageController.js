/**
 * Created by wuxiangan on 2016/12/19.
 */

define(['require','jquery', 'app'], function (require, $, app) {
    console.log("userpageCtrl");
    return function ($scope, $compile) {
        /*
        $scope.name = "userpage";
        app.$controllerProvider.register("testCtrl", function ($scope) {
            $scope.message = "test";
        });
        var content =
            '<div ng-controller="testCtrl">' +
            '<div>test.html</div>' +
            '<div>{{message}}</div>' +
            '</div>';

        content = $compile(content)($scope);
        $('#userpageId').html(content);
        */
    };
    /*

     app.controller("userpageCtrl", function ($scope, $compile) {
        $scope.name = "userpage";
        app.$controllerProvider.register("testCtrl", function ($scope) {
           $scope.message = "test";
        });
        var content =
            '<div ng-controller="testCtrl">' +
            '<div>test.html</div>' +
            '<div>{{message}}</div>' +
            '</div>';

        content = $compile(content)($scope);
        $('#userpageId').html(content);
        require(['app/testCtrl'], function () {
            console.log("testCtrl load finished");
            var content =
                '<div ng-controller="testCtrl">' +
                '<div>test.html</div>' +
                '<div>{{message}}</div>' +
                '</div>';

            content = $compile(content)($scope);
            $('#userpageId').html(content);
        });
    });
     */
});