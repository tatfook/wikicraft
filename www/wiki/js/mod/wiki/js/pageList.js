/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/pageList.html'
], function (app, util, htmlContent) {
    //console.log("load pageListController");
    function registerController(wikiblock) {
        app.registerController('pageListController',['$rootScope','$scope', function ($rootScope, $scope) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            //console.log(wikiblock.modParams);
            $scope.modParams = angular.copy(wikiblock.modParams || {});

            //console.log("init pageListController");

            function init() {
                var site = $rootScope.siteinfo;
                if (!site)
                    return;

                util.post(config.apiUrlPrefix + 'website_pages/getByWebsiteId', {websiteId:site._id}, function (data) {
                   $scope.pageList = data || [];
                   $scope.pageTotal = $scope.pageList.length;
                });
            }

            $scope.$watch("$viewContentLoaded", init);
        }]);
    }
    return {
        render: function(wikiblock){
            registerController(wikiblock);
            return htmlContent;
        }
    };
});

/*
```@wiki/js/pageList
```
 */