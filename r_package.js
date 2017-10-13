/**
 * Created by wuxiangan on 2017/1/5.
 */

({
    appDir:"temp_www_build",
    dir:'www_build',
    baseUrl:'wiki/js',
    //name:'main',
    optimizeCss: 'standard',
    removeCombined:true,
    optimizeAllPluginResources: true,  // text 插件配置
    modules:[
        {
            name:'main',
			include:[
				'angular',
				'app',
				'preload',
				'bootstrap'
			]
        },
		{
			name:"controller/wikiEditorController",
			exclude:[
				'app'
			]
		},
		{
			name:"controller/websiteController",
			exclude:[
				'app'
			]
		},
		{
			name:"controller/userCenterController",
			exclude:[
				'app'
			]
		},
		{
			name:"controller/knowledgeController",
			exclude:[
				'app'
			]
		},
    ],
    //out:'build/main.js',
    paths:{
        'jquery': 'lib/jquery/jquery.min',
        'jquery-cookie': 'lib/jquery-cookie/jquery.cookie',
        'angular': 'lib/angular/angular.min',
        'angular-ui-bootstrap': 'lib/angular-ui-bootstrap/ui-bootstrap-tpls',
        'angular-toggle-switch': 'lib/angular-toggle-switch/angular-toggle-switch.min',
        'angular-ui-select': 'lib/angular-ui-select/select.min',
        'angular-sanitize': 'lib/angular-sanitize/angular-sanitize.min',
        'bootstrap': "lib/bootstrap/js/bootstrap.min",
        'satellizer': 'lib/satellizer/satellizer.min',
        'bootstrap-treeview': 'lib/bootstrap-treeview/bootstrap-treeview.min',
        //'github-api': 'lib/github-api/GitHub.bundle.min',
        'cropper': 'lib/cropper/cropper.min',
        'markdown-it':'lib/markdown-it/markdown-it.min',
        'highlight': 'lib/highlight/highlight.pack', 
        'js-base64': 'lib/js-base64/base64.min',
		'js-base32': 'lib/js-base32/base32.min',
        'text': 'lib/requirejs/text',
        'domReady': 'lib/requirejs/domReady',
		'jquery-sharejs': 'lib/sharejs/js/jquery.share.min',// 社交分享
		'contribution-calendar': 'lib/contribution-calendar/js/contribution-calendar.min',//类github活动记录
		'to-markdown': 'lib/to-markdown/to-markdown',
		'wangEditor': 'lib/wangEditor/js/wangEditor',
		'pingpp': 'lib/pingpp-js/dist/pingpp',
		'plupload': "lib/qiniu/plupload.full.min",
		'qiniu': "lib/qiniu/qiniu.min",

        // 自定义模块
        'app': 'app',
        'router': 'router',
        'preload': 'app/preload',

        // dir map
        'controller': 'app/controller',
        'directive': 'app/directive',
        'factory': 'app/factory',
        'helper': 'app/helper',
        // html dir
        'html': '../html',
		'css': '../assets/css'
    },
    shim: {
        'angular': {
            deps:['jquery'],
            exports: 'angular',
        },
        'angular-ui-router':{
            deps:['angular'],
        },
        'angular-ui-bootstrap':{
            deps:['angular'],
        },
        'angular-ui-select':{
            deps:['angular'],
        },
        'angular-sanitize':{
            deps:['angular'],
        },
        'satellizer':{
            deps:['angular'],
        },
        'bootstrap':{
            deps:['jquery'],
        },
        'cropper':{
            deps:['jquery'],
        },
        'bootstrap-treeview': {
            deps:['bootstrap', 'jquery'],
        },
        'highlight':{
            exports: 'hljs',
        },
		'jquery-cookie': {
			deps:['jquery'],
		},
		'jquery-sharejs':{
			deps:['jquery'],
		},
		'wangEditor': {
			deps:['jquery'],
		},
		'plupload':{
			exports:'plupload'
		},
		'qiniu': {
			deps:['plupload'],
			exports:'qiniu'
		}
    },
    packages: [
        {
            name: "codemirror",
            location: "lib/codemirror",
            main: "lib/codemirror"
        },
    ]
})
