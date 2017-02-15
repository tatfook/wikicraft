/**
 * Created by wuxiangan on 2017/1/6.
 */

define(['app',
    'codemirror',
    'text!html/test.html'], function (app,CodeMirror, htmlContent) {

    app.registerController("testController", ['$scope', function ($scope) {
        $scope.change = function () {
            console.log($scope.switchStatus);
        }
    }]);
    
    function domReady() {
    }
    return {htmlContent:htmlContent,domReady:domReady};
});

