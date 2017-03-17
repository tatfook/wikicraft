/**
 * Created by wuxiangan on 2016/12/19.
 */
///wiki/js/lib/angular-ui-select/select.min.js
define([
    'angular',
    'angular-ui-bootstrap',
    'angular-ui-select',
    'angular-sanitize',
    'satellizer',
    'angular-toggle-switch',
], function (angular) {
    console.log("app");
    var app = angular.module('webapp', ['ui.bootstrap', 'ui.select', 'satellizer', 'ngSanitize', 'toggle-switch']);
    
    app.config(['$controllerProvider', '$authProvider',function ($controllerProvider, $authProvider) {
        // 提供动态注册控制器接口
        app.registerController = function (name, constructor) {
            $controllerProvider.register(name, constructor);
        };

        // github 认证配置
        $authProvider.github({
            url: "/api/wiki/auth/github",
            clientId: '7ca5d2185ce6d6f5be69',
            redirectUri: window.location.origin + '/wiki/login',
            // scope: ["public_repo", "delete_repo"],
            scope: ["public_repo"],
        });
    }]);

    window.app = app;
    return app;
});