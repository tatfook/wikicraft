/**
 * Created by wuxiangan on 2016/9/26.
 */

var app = angular.module("MyApp",['ui.router', 'ui.bootstrap','satellizer','angularFileUpload', 'ui.select','ngSanitize']);

// 全局共享配置
var config = {
	apiUrlPrefix:'/api/wiki/models/',
	pageUrlPrefix:'/wiki/html/',
    
    modulePageUrlPrefix:'/wiki/mod',
};
