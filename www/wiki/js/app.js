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
    var app = angular.module('webapp', ['ui.bootstrap', 'ui.select', 'satellizer', 'ngSanitize', 'toggle-switch']).run(function () {
        config.angularBootstrap = true;
    });

    app.registerController = app.controller;

    app.config(['$controllerProvider', '$authProvider', function ($controllerProvider, $authProvider) {
        // 提供动态注册控制器接口
        app.registerController = function (name, constructor) {
            if (config.angularBootstrap) {
                $controllerProvider.register(name, constructor);
            } else {
                app.controller(name, constructor);
            }
        };

        // github 认证配置
        $authProvider.github({
            url: "/api/wiki/auth/github",
            clientId: '2219fe9cb6d105dd30fb',
            redirectUri: window.location.origin + '/wiki/login',
            // scope: ["public_repo", "delete_repo"],
            scope: ["public_repo"],
        });
    }]);

    window.app = app;
    return app;
});