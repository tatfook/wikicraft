/**
 * Created by wuxiangan on 2017/1/6.
 */

define([
    'app',
    'helper/util',
    'text!html/test.html',
    'wangEditor',
    'to-markdown',
], function (app, util, htmlContent, wangEditor, toMarkdown) {
    console.log("testController");

    console.log("-------------------");
    console.log(toMarkdown('<div>hello world</div>', {
        converters:[
            {
                filter: 'div',
                replacement: function(content) {
                    console.log("================");
                    return '\n' + content + '\n';
                }
            },
        ]
    }));
    app.registerController("testController", ['$scope','modal', function ($scope, modal) {
        function init() {
            console.log("init testController");

        }
        //init();
        $scope.$watch("$viewContentLoaded", init);
    }]);


    return htmlContent;
});

