/**
 * Created by wuxiangan on 2017/1/5.
 */

({
    appDir:"server",
    dir:'server/build',
    baseUrl:'js',
    //name:'main',
    optimizeCss: 'standard',
    removeCombined:true,
    optimizeAllPluginResources: true,  // text 插件配置
    modules:[
        {
            name:'main'
        }, 
        /*
        {
            name:'controller/editorController'
        }
        */
    ],
    //out:'build/main.js',
    paths:{
        'jquery': 'lib/jquery/jquery.min',
        'angular': 'lib/angular/angular.min',
        'angular-ui-bootstrap': 'lib/angular-ui-bootstrap/ui-bootstrap-tpls',
        'angular-ui-router': 'lib/angular-ui-router/angular-ui-router.min',
        'angular-ui-select': 'lib/angular-ui-select/select.min',
        'angular-sanitize': 'lib/angular-sanitize/angular-sanitize.min',
        'bootstrap': "lib/bootstrap/js/bootstrap.min",
        'satellizer': 'lib/satellizer/satellizer.min',
        'bootstrap-treeview': 'lib/bootstrap-treeview/bootstrap-treeview.min',
        'github-api': 'lib/github-api/GitHub.bundle.min',
        'markdown-it':'lib/markdown-it/markdown-it.min',  // 已支持amd则不能喝<script>标签混合使用
        'highlight': 'lib/highlight/highlight.pack', //不支持amd规范可用标签引入 或配置shim
        'cropper': 'lib/cropper/cropper.min',
        'js-base64': 'lib/js-base64/base64.min',

        // 自定义模块
        'app': 'app',
        'router': 'router',
        'preload': 'app/preload',

        // dir map
        'controller': 'app/controller',
        'directive': 'app/directive',
        'factory': 'app/factory',
        'helper': 'app/helper',
    },
    shim: {
        'angular': {
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
    },
    packages: [
        {
            name: "codemirror",
            location: "lib/codemirror",
            main: "lib/codemirror"
        },
    ],
})