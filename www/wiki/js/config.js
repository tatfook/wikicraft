/**
 * Created by wuxiangan on 2016/9/28.
 */

app.config(function ($stateProvider, $urlRouterProvider) {
    //$urlRouterProvider.otherwise('/');
    var templatePath = config.pageUrlPrefix;
    $stateProvider.state('index', {
        url: '/index',
        templateUrl: templatePath + 'index.html',
    }).state('login', {
        url: '/login',
        templateUrl: templatePath + 'login.html',
    }).state('register', {
        url: '/register',
        templateUrl: templatePath + 'register.html',
    }).state('test', {
        url: '/test',
        templateUrl: templatePath + 'test.html',
    }).state('website', {
        url: '/website',
        templateUrl: templatePath + 'website.html',
    }).state('createWebsite', {
        url: '/createWebsite',
        templateUrl: templatePath + 'createWebsite.html',
    }).state('preview', {
        url:'/preview',
        templateUrl:templatePath + 'preview.html',
    }).state('editWebsite', {
        url:'/editWebsite',
        templateUrl:templatePath + 'editWebsite.html',
    }).state('userCenter', {
        url:'/userCenter',
        templateUrl:templatePath + 'userCenter.html',
    }).state('gitVersion', {
        url:'/gitVersion',
        templateUrl:templatePath + 'gitVersion.html',
    }).state('editor', {
        url:'/editor',
        templateUrl:templatePath + 'editor.html',
    }).state('userpage', {
        url:'/userpage',
        templateUrl:templatePath + 'userpage.html',
    }).state('siteshow', {
        url:"/siteshow",
        templateUrl:templatePath + 'siteshow.html',
    }).state('worksApply', {
        url:"/worksApply",
        templateUrl:templatePath + 'worksApply.html',
    }).state('home', {
        url:"/home",
        templateUrl:templatePath + 'home.html'
    });
});



