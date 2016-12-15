/**
 * Created by wuxiangan on 2016/9/26.
 */

var app = angular.module("MyApp",['ui.router', 'ui.bootstrap','satellizer','angularFileUpload', 'ui.select','ngSanitize']);

// 授权认证配置
app.config(function ($authProvider) {
    $authProvider.github({
        url: "/api/wiki/auth/github",
        clientId:'44ed8acc9b71e36f47d8',
        redirectUri: window.location.origin + '/wiki/login',
        scope:["public_repo"],
    });
});
// 全局共享配置
var config = {
	apiUrlPrefix:'/api/wiki/models/',
	pageUrlPrefix:'/wiki/html/',
    
    modulePageUrlPrefix:'/wiki/module',
    moduleApiUrlPrefix:'http://localhost:8099/api/module/',  // + moduleName + "/models/" + modelName + '[apiName]'
};
