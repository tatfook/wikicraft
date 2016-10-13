var app = angular.module('MyApp', ['satellizer', 'ui.bootstrap', 'ui.router']);

// 创建控制器间共享对象 或用全局对象替代实现
app.factory('ctrlShareObj', function(){
	return {}
});

// 全局共享配置
var config = {
	apiUrlPrefix:'/api/wiki/models/',
	pageUrlPrefix:'/wiki/partials/',
	previewUrl:'http://localhost:8099/wiki/container#/preview', // 模板预览URL
}

// 前端路由  可以单独放在一个文件
app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    var templatePath = config.pageUrlPrefix;
    $stateProvider.state('index', {
        url: '/',
        views: {
            'default': {
                templateUrl: templatePath + 'index.html',
            },
            'header@index': {
                templateUrl: templatePath + 'indexHeader.html',
            },
            'footer@index': {
                templateUrl: templatePath + 'indexFooter.html',
            },
        }
    }).state('index.login', {
        url: 'login',
        templateUrl: templatePath + 'login.html',
    }).state('index.register', {
        url: 'register',
        templateUrl: templatePath + 'register.html',
    }).state('index.index', {
        url: 'index',
        templateUrl: templatePath + 'main.html',
    }).state('index.website', {
        url: 'website',
        templateUrl: templatePath + 'website.html',
    }).state('index.createWebsite', {
        url: 'createWebsite',
        templateUrl: templatePath + 'create_website.html',
    }).state('index.preview', {
        url:'preview',
        templateUrl:templatePath + 'preview.html',
    }).state('index.editWebsitePage', {
        url:'editWebsitePage',
        templateUrl:templatePath + 'editWebsitePage.html',
    });


	$stateProvider.state('custom', {
        url:'/custom',
        views:{
            'default':{
                templateUrl:templatePath + 'custom.html'
            },
        },
    });
});
