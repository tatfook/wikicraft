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
	//console.log("app");
	var app = angular.module('webapp', ['ui.bootstrap', 'ui.select', 'satellizer', 'ngSanitize', 'toggle-switch']).run(function () {
		config.angularBootstrap = true;
	});

	app.registerController = app.controller;

	app.config(['$controllerProvider', '$httpProvider', '$authProvider','$locationProvider', function ($controllerProvider, $httpProvider, $authProvider, $locationProvider) {
		//$locationProvider.hashPrefix('!');
		//$locationProvider.html5Mode({enabled:true});
		// 提供动态注册控制接口
		app.registerController = function (name, constructor) {
			if (config.angularBootstrap) {
				$controllerProvider.register(name, constructor);
			} else {
				app.controller(name, constructor);
			}
		};

		// 注册loading拦截器
		$httpProvider.interceptors.push("loadingInterceptor");

		//$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
		//{{{
		// github 认证配置
		$authProvider.github({
			url: "/api/wiki/auth/github",
			clientId: '2219fe9cb6d105dd30fb',
			redirectUri:window.location.origin +  '/wiki/login',
			// scope: ["public_repo", "delete_repo"],
			scope: ["public_repo"],
		});

		$authProvider.oauth2({
			name: 'qq',
			url: '/api/wiki/auth/qq',
			clientId: '101403344',
			//redirectUri: window.location.origin + '/api/wiki/auth/qq',//window.location.origin,
			redirectUri: window.location.origin  +  '/wiki/login',
			authorizationEndpoint: 'https://graph.qq.com/oauth2.0/authorize',
			oauthType: '2.0',
			scope:'get_user_info',
		});

		$authProvider.oauth2({
			name: 'weixin',
			url: '/api/wiki/auth/weixin',
			clientId: 'wxc97e44ce7c18725e',
			appid: 'wxc97e44ce7c18725e',
			//redirectUri: window.location.origin + '/api/wiki/auth/weixin',//window.location.origin,
			redirectUri: window.location.origin  +  '/wiki/login',
			authorizationEndpoint: 'https://open.weixin.qq.com/connect/qrconnect',
			oauthType: '2.0',
			scope:'snsapi_login',
			requiredUrlParams: ['scope', "appid"],
		});
		// 新浪微博
		$authProvider.oauth2({
			name: 'xinlangweibo',
			url: '/api/wiki/auth/xinlangweibo',
			clientId: '2411934420',
			//redirectUri: window.location.origin + '/api/wiki/auth/xinlangweibo',//window.location.origin,
			redirectUri: window.location.origin  +  '/wiki/login',
			authorizationEndpoint: 'https://api.weibo.com/oauth2/authorize',
			oauthType: '2.0',
		});
		// keepwork微博
		$authProvider.oauth2({
			name: 'keepwork',
			url: '/api/wiki/models/oauth_app/callback',
			clientId: '1000000',
			//redirectUri: window.location.origin + '/api/wiki/auth/xinlangweibo',//window.location.origin,
			redirectUri: window.location.origin  +  '/wiki/login',
			authorizationEndpoint: 'http://localhost:8900/wiki/oauth',
			oauthType: '2.0',
		}); //}}}
	}]);

	window.app = app;//{{{
	return app;//}}}
});
