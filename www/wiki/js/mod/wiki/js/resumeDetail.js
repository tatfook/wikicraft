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
            // console.log(wikiblock.modParams);
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
/*
 ```@wiki/js/resumeDetail
 {
 "moduleKind":"flexible",
 "rows":[
 {
 "title":"工作经历",
 "details":[
 {
 "title":"公司名",
 "info":"工作时间",
 "subscribe":"工作职位",
 "detail":"职位描述"
 },
 {
 "title":"公司名",
 "info":"工作时间",
 "subscribe":"工作职位",
 "detail":"职位描述"
 }
 ]
 },
 {
 "title":"教育经历",
 "details":[
 {
 "title":"学校名",
 "info":"毕业时间",
 "subscribe":"教育经历描述",
 "detail":""
 }
 ]
 }
 ],
 "simpleRows":[
 {
 "title":"期望工作一",
 "details":[
 {
 "job":"期望职位",
 "workType":"工作时间",
 "salary":"工资",
 "position":"期望工作地点"
 }
 ]
 },
 {
 "title":"期望工作二",
 "details":[
 {
 "job":"期望职位",
 "workType":"工作时间",
 "salary":"工资",
 "position":"期望工作地点"
 }
 ]
 }
 ]
 }
 ```
 */