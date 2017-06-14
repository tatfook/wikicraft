/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/companyFooter.html'
], function (app, util, htmlContent) {
    function registerController(wikiblock) {
        app.registerController('companyFooterController',['$scope', function ($scope) {
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
 ```@wiki/js/companyFooter
 {
 "companyName":"TATFOOK",
 "companyInfo":"© 1993-2014 深圳市大富科技股份有限公司版权所有",
 "friendsLinks":[
 {
 "name":"配天集团",
 "url":"http://keepwork.com"
 },
 {
 "name":"华阳微电子",
 "url":"http://keepwork.com"
 },
 {
 "name":"大富精工",
 "url":"http://keepwork.com"
 }
 ]
 }
 ```
 */