var app = angular.module('MyApp', ['satellizer', 'ui.bootstrap', 'ui.router']);

// 创建控制器间共享对象 或用全局对象替代实现
app.factory('ctrlShareObj', function(){
	return {}
});

// 全局共享配置
var config = {
	apiUrlPrefix:'/api/wiki/models/',
	pageUrlPrefix:'/wiki/partials/',
}

