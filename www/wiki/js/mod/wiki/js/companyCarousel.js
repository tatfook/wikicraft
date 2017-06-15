/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/companyCarousel.html'
], function (app, util, htmlContent) {
    function registerController(wikiblock) {
        app.registerController('companyCarouselController',['$scope', function ($scope) {
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
 ```@wiki/js/companyCarousel
 {
 "carouselImg":[
 "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1491977168649&di=a6bc50097f28c0508e046746d7da29a0&imgtype=0&src=http%3A%2F%2Fpic.90sjimg.com%2Fback_pic%2Fqk%2Fback_origin_pic%2F00%2F01%2F86%2Ff548129ce938a644a245f19d67d032c7.jpg",
 "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1491977186450&di=32ac5744e99460e3d3525052e2bde53f&imgtype=0&src=http%3A%2F%2Fwww.goto307.com.tw%2Fupload%2Fbanner_ins_list%2Fb0c218ed21c3916d4531f182e9712115.jpg"
 ]
 }
 ```
 */