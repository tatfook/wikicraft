/**
 * Created by wuxiangan on 2017/1/6.
 */

define([
    'app',
    'helper/util',
    'helper/markdownwiki',
    'helper/htmlmd',
    'text!html/test.html',
], function (app, util, markdownwiki, htmlmd, htmlContent) {
    console.log("testController");
    app.registerController("testController", ['$scope', function ($scope) {
        function init() {
            console.log("init testController");
            $scope.message = "hello world";
        }

        $('body').on('focus', '[contenteditable]', function() {
            var $this = $(this);
            console.log($this, $this.html());
            $this.data('before', $this.html());
            return $this;
        }).on('blur keyup paste input', '[contenteditable]', function() {
            console.log("------------------------");
            var $this = $(this);
            console.log($this, $this.html());

            if ($this.data('before') !== $this.html()) {
                $this.data('before', $this.html());
                $this.trigger('change');
            }
            return $this;
        }).on('blur', '[contenteditable]', function () {
            var $this = $(this);
        });
        init();
        //$scope.$watch("$viewContentLoaded", init);
    }]);


    return htmlContent;
});

