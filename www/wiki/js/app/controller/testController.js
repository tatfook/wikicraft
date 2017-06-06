/**
 * Created by wuxiangan on 2017/1/6.
 */

define([
    'app',
    'helper/util',
	'helper/dataSource',
    'text!html/test.html',
], function (app, util, dataSource,  htmlContent) {
    console.log("testController");
    app.registerController("testController", ['$scope','confirmDialog', function ($scope, confirmDialog) {
        console.log($scope.imgsPath);
        //$scope.imgsPath = "/test/";

        function init() {
            console.log("init testController");
			var userDataSource = dataSource.getUserDataSource("xiaoyao");
			userDataSource.registerInitFinishCallback(function(){
				var defaultDataSource = userDataSource.getDefaultDataSource();
				defaultDataSource.setDefaultProject({projectName:"keepworkdatasource", isPrivate:true});
			});
            // confirmDialog({title:"test", content:"hello world", cancelBtn:false}, function () {
            //     console.log("click confirm");
            // }, function () {
            //     console.log("click cancel");
            // });
        }
        //init();
        $scope.$watch("$viewContentLoaded", init);
    }]);
    
    return htmlContent;
});

