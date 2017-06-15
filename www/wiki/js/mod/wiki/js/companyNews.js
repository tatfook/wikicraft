/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/companyNews.html'
], function (app, util, htmlContent) {
    function registerController(wikiblock) {
        app.registerController('companyNewsController',['$scope', function ($scope) {
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
 ```@wiki/js/companyNews
 {
 "columnName":"NEWS",
 "columnInfo":"新闻资讯",
 "moreNewsLink":"http://www.tatfook.com/?cat=24",
 "topNewsTitle":"大富科技：获第二届特许公认会计师公会(ACCA)评选并向全球发布的“中国企业未来100强”第21名",
 "topNewsContent":"2016年11月11日，全球最权威的专业会计师协会——特许公认会计师公会(ACCA)评选并向全球发布的“中国企业未来100强”(China’s next 100 global giants)峰会在深圳中洲万豪酒店举行，全球最权威的专业会计师协会——特许公认会计师公会(ACCA)评选并向全球发布的“中国企业未来100强”(China’s next 100 global giants)峰会在深圳中洲万豪酒店举行",
 "topNewsImg":"http://keepwork.com/wiki/assets/imgs/wiki_works.jpg",
 "topNewsLink":"http://www.tatfook.com/?p=5077",
 "news":[
 {
 "title":"大富科技卡拉OK大赛圆满落幕。",
 "content":"经过一个多月的精心筹备和组织，2016年9月22日，大富科技“音为有你而精彩”卡拉OK大赛顺利落下帷幕。选手们经过层层海选,大富科技“音为有你而精彩”卡拉OK大赛顺利落下帷幕。",
 "yearMonth":"2016-11",
 "day":"11",
 "newsLink":"http://www.tatfook.com/?p=5052"
 },
 {
 "title":"2016年大富科技羽毛球比赛圆满结束！",
 "content":"9月20日晚， 经过6场精彩激烈的比赛角逐后，羽毛球男子单打项目决出了最终前六名，至此，双打、混双和单打的所有项目均决，羽毛球男子单打项目决出了最终前六名，羽毛球男子单打项目决出了最终前六名",
 "yearMonth":"2016-10",
 "day":"09",
 "newsLink":"http://www.tatfook.com/?p=5038"
 }
 ]
 }
 ```
 */