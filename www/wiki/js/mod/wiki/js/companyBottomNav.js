/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/companyBottomNav.html'
], function (app, util, htmlContent) {
    function registerController(wikiblock) {
        app.registerController('companybottomNavController',['$scope', function ($scope) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiblock.modParams || {});
        }]);
    }
    return {
        render: function(wikiblock){
            registerController(wikiblock);
            return htmlContent;
        }
    };
})

/*
 ```@wiki/js/companyBottomNav
 {
 "companyName":"TATFOOK",
 "companyInfo":"端到端网络工业技术提供商",
 "navItems":[
 {
 "name":"首页",
 "url":"http://keepwork.com"
 },
 {
 "name":"新闻资讯",
 "subUrl":[
 {
 "name":"公司新闻",
 "url":"http://keepwork.com"
 },
 {
 "name":"行业新闻",
 "url":"http://keepwork.com"
 }
 ]
 },
 {
 "name":"产品与服务",
 "subUrl":[
 {
 "name":"产品目录",
 "url":"http://keepwork.com"
 },
 {
 "name":"产品展示",
 "url":"http://keepwork.com"
 },
 {
 "name":"一站式服务",
 "url":"http://keepwork.com"
 },
 {
 "name":"品质保证",
 "url":"http://keepwork.com"
 }
 ]
 },
 {
 "name":"人力资源",
 "subUrl":[
 {
 "name":"社会招聘",
 "url":"http://keepwork.com"
 },
 {
 "name":"校园招聘",
 "url":"http://keepwork.com"
 },
 {
 "name":"内部招聘",
 "url":"http://keepwork.com"
 },
 {
 "name":"有奖荐才",
 "url":"http://keepwork.com"
 }
 ]
 },
 {
 "name":"投资者关系",
 "subUrl":[
 {
 "name":"投资者关系",
 "url":"http://keepwork.com"
 }
 ]
 },
 {
 "name":"关于大富",
 "url":"http://keepwork.com"
 },
 {
 "name":"联系我们",
 "url":"http://keepwork.com"
 }
 ]
 }
 ```
 */