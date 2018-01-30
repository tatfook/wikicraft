/**
 * Created by wuxiangan on 2016/12/19.
 */

'use strict';

(function (win) {
	var pathPrefix = config.pathPrefix;
	var jsPathPrefix = pathPrefix + 'js/';
	var libPathPrefix = pathPrefix + 'js/lib/';
	var appPathPrefix = pathPrefix + 'js/app/';
	var helperPathPrefix = pathPrefix + 'js/app/helper/';

	define('THREE', [libPathPrefix + 'threejs/three.min.js'], function (THREE) {
		window.THREE = THREE;
		return THREE;
	});

	requirejs.config({
		baseUrl: '',
		paths: {
			// 框架库
			'jszip': libPathPrefix + 'jszip/jszip.min', // jszip
			'jszip-utils': libPathPrefix + 'jszip/jszip-utils', // jszip-utils
			'AxisMonitor': libPathPrefix + 'threejs/controls/AxisMonitor', // AxisMonitor
			'STLLoader': libPathPrefix + 'threejs/STLLoader', // STLLoader
			'weblua': jsPathPrefix + 'mod/model/weblua-0.1.5', // lua vm
			//'THREE':libPathPrefix + 'threejs/three.min.js',
			'THREE_OrbitControls': libPathPrefix + 'threejs/controls/OrbitControls', // OrbitControls
			'THREE_TransformControls': libPathPrefix + 'threejs/controls/TransformControls', // TransformControls
			'THREE_ThreeJsView': jsPathPrefix + 'mod/model/ThreeJsView', // threejs view for the mod of model

			'jquery': libPathPrefix + 'jquery/jquery.min',
			'jquery-cookie': libPathPrefix + 'jquery-cookie/jquery.cookie',
			'angular': libPathPrefix + 'angular/angular.min',
			'angular-ui-bootstrap': libPathPrefix + 'angular-ui-bootstrap/ui-bootstrap-tpls',
			'angular-toggle-switch': libPathPrefix + 'angular-toggle-switch/angular-toggle-switch.min',
			'angular-ui-select': libPathPrefix + 'angular-ui-select/select.min',
			'angular-sanitize': libPathPrefix + 'angular-sanitize/angular-sanitize.min',
			'angular-translate': libPathPrefix + 'angular-translate/angular-translate.min',
			'bootstrap': libPathPrefix + "bootstrap/js/bootstrap.min",
			'bluebird': libPathPrefix + "bluebird/bluebird.min",
			'satellizer': libPathPrefix + 'satellizer/satellizer.min',
			'bootstrap-treeview': libPathPrefix + 'bootstrap-treeview/bootstrap-treeview.min',
			//'github-api': libPathPrefix + 'github-api/GitHub.bundle.min',
			'cropper': libPathPrefix + 'cropper/cropper.min',
			'markdown-it': libPathPrefix + 'markdown-it/markdown-it.min', // 已支持amd则不能喝<script>标签混合使用
			'highlight': libPathPrefix + 'highlight/highlight.pack', //不支持amd规范可用标签引入 或配置shim
			'js-base64': libPathPrefix + 'js-base64/base64.min',
			'js-base32': libPathPrefix + 'js-base32/base32.min',
			'text': libPathPrefix + 'requirejs/text',
			'domReady': libPathPrefix + 'requirejs/domReady',
			'fabric': libPathPrefix + 'fabric.require',
			'jquery-sharejs': libPathPrefix + 'sharejs/js/jquery.share.min', // 社交分享
			//'social-sharejs': libPathPrefix + 'sharejs/js/social-share',// 社交分享
			'contribution-calendar': libPathPrefix + 'contribution-calendar/js/contribution-calendar.min', //类github活动记录
			'to-markdown': libPathPrefix + 'to-markdown/to-markdown',
			'wangEditor': libPathPrefix + 'wangEditor/js/wangEditor',
			'ace': libPathPrefix + 'ace/ace',
			'pingpp': libPathPrefix + 'pingpp-js/dist/pingpp',
			'plupload': libPathPrefix + "qiniu/plupload.full.min",
			'qiniu': libPathPrefix + "qiniu/qiniu.min",
			'Fuse': libPathPrefix + "fuse/fuse.min",
			'pako': libPathPrefix + "pako/pako.min",
			'js-aho-corasick': libPathPrefix + "js-aho-corasick/aho-corasick",
			'md5': libPathPrefix + "md5",
			'swiper': libPathPrefix + "swiper/swiper.min",
			'reveal': libPathPrefix + "reveal",
			// 'echarts-radar': libPathPrefix + "echarts/echarts-radar",
			'echarts-radar': libPathPrefix + "echarts/echarts-radar.min",
			//'html2canvas': libPathPrefix + 'html2canvas/html2canvas.min',

			'vue': libPathPrefix + 'vue/vue.min',
			'botui': libPathPrefix + 'botui/botui',

			// 自定义模块
			'app': jsPathPrefix + 'app',
			'router': jsPathPrefix + 'router',
			'preload': appPathPrefix + 'preload',

			// dir map
			'controller': config.jsAppControllerPath,
			'directive': config.jsAppDirectivePath,
			'factory': config.jsAppFactoryPath,
			'helper': config.jsAppHelperPath,
			// html dir
			'html': config.htmlPath,
			'css': config.cssPath,
			'wikimod': config.wikiModPath,

			// mod dir
			'mod': config.modPath
		},
		shim: {
			'angular': {
				deps: ['jquery'],
				exports: 'angular'
			},
			'angular-ui-bootstrap': {
				deps: ['angular']
			},
			'angular-toggle-switch': {
				deps: ['angular']
			},
			'angular-ui-select': {
				deps: ['angular']
			},
			'angular-sanitize': {
				deps: ['angular']
			},
			'angular-translate': {
				deps: ['angular']
			},
			'satellizer': {
				deps: ['angular']
			},
			'bootstrap': {
				deps: ['jquery']
			},
			'cropper': {
				deps: ['jquery']
			},
			'bootstrap-treeview': {
				deps: ['bootstrap', 'jquery']
			},
			'highlight': {
				exports: 'hljs'
			},
			'jquery-cookie': {
				deps: ['jquery']
			},
			'jquery-sharejs': {
				deps: ['jquery']
			},
			'wangEditor': {
				deps: ['jquery']
			},
			'plupload': {
				exports: 'plupload'
			},
			'qiniu': {
				deps: ['plupload'],
				exports: 'qiniu'
			},
			'js-base32': {
				exports: "base32",
			},
			'botui': {
				deps: ['vue'],
			}
		},
		packages: [{
			name: "codemirror",
			location: libPathPrefix + "codemirror",
			main: "lib/codemirror"
		}],
		deps: ['bootstrap'],
		waitSeconds: 10,
		// urlArgs: "bust=" + (new Date()).getTime()  //防止读取缓存，调试用
		//urlArgs: "bust=" + (config.isDebugEnv() ? ((new Date()).getTime()) : (config.bustVersion || ''))   //防止读取缓存，调试用
		urlArgs: function (id, url) {
			if (url.indexOf("?bust=") > 0 || url.indexOf("?ver=") > 0) {
				return "";
			}

			return "?bust=" + (config.isDebugEnv() ? ((new Date()).getTime()) : (config.bustVersion || '')) //防止读取缓存，调试用
		},
	});


	require(['domReady', 'helper/filter'], function (domReady) {
		domReady(function () {
			// 执行过滤函数， 若过滤函数返回false则停止框架
			var pathname = window.location.pathname;
			if (config.filterMap[pathname]) {
				var filterList = config.filterMap[pathname];
				for (var i = 0; i < filterList.length; i++) {
					if (!filterList[i]()) {
						return;
					}
				}
			}

			// ***在angular启动之前加载页面内容，目的是内容js完全兼容之前angular书写方式，否则angular启动后，之前书写方式很多功能失效***
			require(['angular', 'app', 'preload'], function (angular, app) {
				config.init(function () {
					// 加载页面主体内容
					config.loadMainContent(function () {
						angular.bootstrap(document, ['webapp']);
					}, function () {
						angular.bootstrap(document, ['webapp']);
					});
				});
			});
		});
	});
})(window);
