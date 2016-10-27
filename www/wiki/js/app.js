var app = angular.module('MyApp', ['satellizer', 'ui.bootstrap', 'angularFileUpload','ui.router','ui.select','ngSanitize']);

// 全局共享配置
var config = {
	apiUrlPrefix:'/api/wiki/models/',
	pageUrlPrefix:'/wiki/html/',
}

