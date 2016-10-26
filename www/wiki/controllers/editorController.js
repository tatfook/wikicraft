/**
 * Created by Karlwu on 2016-10-18.
 */

angular.module('MyApp')
.controller('editorController', function  ($scope, $state, $http, ctrlShareObj) {
    $scope.websites = [];
    $scope.websitePages = [];
    $scope.style = {}
    var website = ctrlShareObj.website;
    $scope.websitePage = {name:'pageName', url:'/'+ website.name + '/pageName', websiteName:website.name, websiteId:website._id, content: "<div>hello world</div>"};  // 从websitePages选择一页编辑，或新增， 注意新增或修改提交页时需这些信息

    init();

    function init() {
        // 获取用户站点列表
        /*
         $http.post('http://localhost:8099/api/wiki/models/website',{userid:1}).then(function (response) {
         $scope.websites = response.data;
         }).catch(function (response) {
         console.log(response.data);
         });
         */
        // 获取网站所有页面
        $http.post('http://localhost:8099/api/wiki/models/website_pages',{websiteName:website.name}).then(function (response) {
            $scope.websitePages = response.data;
        }).catch(function (response) {
            console.log(response.data);
        });
        // 获取网站模板样式  页面内容嵌套在模板内部 编辑不需模板吧？？ 预览时你也可以获取自行嵌套
        /*
         $http.post('http://localhost:8099/api/wiki/models/website_template_style', {_id:website.styleId}).then(function (response) {
         $scope.style = response.data;  // 模板代码style.content
         })
         */
    }

    $scope.submit = function () {
        var isEdit =false;
        console.log($scope.websitePage);
        if (isEdit == false) { // 新增
            $http.put('http://localhost:8099/api/wiki/models/website_pages/new',$scope.websitePage).then(function (response) {
                console.log(response.data);
            }).catch(function (response) {
                console.log(response.data);
            });
        } else {  // 修改
            $http.put('http://localhost:8099/api/wiki/models/website_pages',$scope.websitePage).then(function (response) {
                console.log(response.data);
            }).catch(function (response) {
                console.log(response.data);
            });
        }
    }
})