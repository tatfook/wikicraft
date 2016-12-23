/**
 * Created by wuxiangan on 2016/12/19.
 */

define(['jquery', 'app'], function ($, app) {
    console.log("testCtrl");

    return function ($scope) {
        console.log("testCtrl===");
        $scope.message = "hello test";
    };
});