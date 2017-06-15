/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/companyWorksListSecond.html'
], function (app, util, htmlContent) {
    function registerController(wikiblock) {
        app.registerController('companyWorksListSecondController',['$scope', function ($scope) {
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
 ```@wiki/js/companyWorksListSecond
 {
 "columnName":"产品与服务",
 "columnInfo":"PRODUCT AND SERVICE",
 "moreNewsLink":"http://www.tatfook.com/?page_id=43",
 "works":[
 {
 "workImg":"http://www.tatfook.com/wp-content/uploads/2011/08/TD268B-600x424.jpg",
 "workTitle":"基站配套器件",
 "workLink":"http://www.tatfook.com/?cat=4"
 },
 {
 "workImg":"http://www.tatfook.com/wp-content/uploads/2011/06/100w-200w-3db%E7%94%B5%E6%A1%A5-600x424.jpg",
 "workTitle":"网络优化系统器件",
 "workLink":"http://www.tatfook.com/?cat=28"
 },
 {
 "workImg":"http://www.tatfook.com/wp-content/uploads/2011/09/%E7%9B%96%E5%AD%90-600x395.png",
 "workTitle":"通信金属结构件",
 "workLink":"http://www.tatfook.com/?cat=29"
 }
 ]
 }
 ```
 */