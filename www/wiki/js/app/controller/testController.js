/**
 * Created by wuxiangan on 2017/1/6.
 */

define(['app',
    'codemirror',
    'text!html/test.html',
], function (app,CodeMirror, htmlContent) {
    /*
     app.controller("testController", ['$scope', function ($scope) {
        jQuery(document).ready(function($) {
            console.log("===========");
        });
    }]);
     */
    app.registerController("testController", ['$scope', function ($scope) {
    }]);
    
    function domReady() {
    }
    return {htmlContent:htmlContent,domReady:domReady};
});

