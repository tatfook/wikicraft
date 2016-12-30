/**
 * Created by wuxiangan on 2016/12/19.
 */

'use strict';

(function (win) {
    var pathPrefix = '/wiki/';
    var jsPathPrefix = pathPrefix + 'js/';
    var libPathPrefix = pathPrefix + 'js/lib/';
    var appPathPrefix = pathPrefix + 'js/app/';
    var helperPathPrefix = pathPrefix + 'js/app/helper/';
    requirejs.config({
        baseUrl:'',
        paths: {
            // 框架库
            'jquery': libPathPrefix + 'jquery/jquery.min',
            'angular': libPathPrefix + 'angular/angular.min',
            'angular-ui-bootstrap': libPathPrefix + 'angular-ui-bootstrap/ui-bootstrap-tpls',
            'angular-ui-router': libPathPrefix + 'angular-ui-router/angular-ui-router.min',
            'angular-ui-select': libPathPrefix + 'angular-ui-select/select.min',
            'angular-sanitize': libPathPrefix + 'angular-sanitize/angular-sanitize.min',
            'bootstrap': libPathPrefix + "bootstrap/js/bootstrap.min",
            'satellizer': libPathPrefix + 'satellizer/satellizer.min',
            'bootstrap-treeview': libPathPrefix + 'bootstrap-treeview/bootstrap-treeview.min',
            'github-api': libPathPrefix + 'github-api/GitHub.bundle.min',
            'markdown-it':libPathPrefix + 'markdown-it/markdown-it.min',  // 已支持amd则不能喝<script>标签混合使用
            'highlight': libPathPrefix + 'highlight/highlight.pack', //不支持amd规范可用标签引入 或配置shim
            'cropper': libPathPrefix + 'cropper/cropper.min',
            'js-base64': libPathPrefix + 'js-base64/base64.min',

            // 自定义模块
            'app': jsPathPrefix + 'app',
            'router':jsPathPrefix + 'router',
            'preload': appPathPrefix + 'preload',

            // 辅助模块
            'storage': helperPathPrefix + 'storage',
            'util': helperPathPrefix + 'util',
            'markdownwiki': helperPathPrefix + 'markdownwiki',
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
            /*
            'js-base64':{
                exports:'base64',
            }*/
        },
        packages: [
            {
                name: "codemirror",
                location: libPathPrefix +"codemirror",
                main: "lib/codemirror"
            },
        ],
        deps:['bootstrap'],
        urlArgs: "bust=" + (new Date()).getTime()  //防止读取缓存，调试用
    });

    require(['angular', 'router', 'preload'], function (angular) {
        angular.bootstrap(document, ['webapp']);
    });
})(window);



