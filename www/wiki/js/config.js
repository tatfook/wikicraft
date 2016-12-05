/**
 * Created by wuxiangan on 2016/9/28.
 */

app.config(function ($stateProvider, $urlRouterProvider) {
    //$urlRouterProvider.otherwise('/');
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
    }).state('index.test', {
        url: 'test',
        templateUrl: templatePath + 'test.html',
    }).state('index.website', {
        url: 'website',
        templateUrl: templatePath + 'website.html',
    }).state('index.createWebsite', {
        url: 'createWebsite',
        templateUrl: templatePath + 'createWebsite.html',
    }).state('index.preview', {
        url:'preview',
        templateUrl:templatePath + 'preview.html',
    }).state('index.editWebsite', {
        url:'editWebsite',
        templateUrl:templatePath + 'editWebsite.html',
    }).state('index.userCenter', {
        url:'userCenter',
        templateUrl:templatePath + 'userCenter.html',
    }).state('index.gitVersion', {
        url:'gitVersion',
        templateUrl:templatePath + 'gitVersion.html',
    }).state('index.editor', {
        url:'editor',
        templateUrl:templatePath + 'editor.html',
    }).state('index.userpage', {
        url:'userpage',
        templateUrl:templatePath + 'userpage.html',
    }).state('index.home', {
        url:"home",
        templateUrl:templatePath + 'home.html'
    }).state('index.siteshow', {
        url:"siteshow",
        templateUrl:templatePath + 'siteshow.html',
    }).state('index.worksApply', {
        url:"worksApply",
        templateUrl:templatePath + 'worksApply.html',
    });
});



