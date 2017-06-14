/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/resumeDetail.html'
], function (app, util, htmlContent) {
    function registerController(wikiblock) {
        app.registerController('resumeDetailController',['$scope', function ($scope) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            console.log(wikiblock.modParams);
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
```@wiki/js/resumeDetail
{
    "workList":[
        {
            "company":"xxx",
            "time":"2014-07-01 ~ 至今",
            "job":"Programer",
            "desc":"xxxxxx"
        }
    ],
    "educationList":[
        {
            "schoolName":"shen zhen da xue",
            "graduationDate":"2014-07-01",
            "desc":"xxxxxxx"
        }
    ],
    "expectWorkList":[
        {
            "job":"coder",
            "workType":"全职",
            "salary":"面议",
            "position":"深圳"
        }
    ]
}
```
*/