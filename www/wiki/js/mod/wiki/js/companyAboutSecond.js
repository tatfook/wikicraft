/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/companyAboutSecond.html'
], function (app, util, htmlContent) {
    function registerController(wikiblock) {
        app.registerController('companyAboutSecondController',['$scope', function ($scope) {
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
 ```@wiki/js/companyAboutSecond
 {
 "columnName":"关于我们",
 "columnInfo":"ABOUT",
 "moreNewsLink":"http://www.tatfook.com/?cat=10",
 "paragraphs":[
 "深圳市大富科技股份有限公司成立于2001年，是一家集产品研发、生产和销售为一体的国家级高新技术企业，2010年10月26日于深圳市证券交易所挂牌上市（股票代码300134）。",
 "公司致力于成为全球领先的射频解决方案提供商，通过不断完善横向通用技术的综合融通能力，强化自主创新的研究开发和纵向一体化精密制造的能力，最终成为端到端网络工业技术提供商。公司总部位于深圳市宝安区，在国内外大中型城市设有十余处研发中心及生产基地，与华为、爱立信、阿尔卡特-朗讯、博世、康普等全球知名企业建立了稳定的合作关系。"
 ],
 "companyImg":"http://www.tatfook.com/wp-content/uploads/2011/04/%E5%85%AC%E5%8F%B8%E6%AD%A3%E9%97%A8_%E5%89%AF%E6%9C%AC.jpg"
 }
 ```
 */