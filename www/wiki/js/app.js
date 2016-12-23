/**
 * Created by wuxiangan on 2016/12/19.
 */

define(['angular', 'angular-ui-router', 'angular-ui-bootstrap', 'satellizer'], function (angular) {
    console.log("app");
    var app = angular.module('webapp',['ui.router', 'ui.bootstrap', 'satellizer']);
    
    app.config(function ($controllerProvider) {
        app.registerController = function (name, constructor) {
            $controllerProvider.register(name, constructor);
        };
    });
    
    return app;
});