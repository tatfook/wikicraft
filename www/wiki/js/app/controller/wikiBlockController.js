/**
 * Created by wuxiangan on 2017/2/24.
 */

define([
    'app',
    'text!html/wikiBlock.html',
], function (app, htmlContent) {

    app.registerController('wikiBlockController',['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
        $scope.wikiBlockList = [
            {_id: 1, name: 'personalHeader', type:'header', url:'@personal/js/personalHeader', desc:'个人网站头部', logo:'test.jpg'},
            {_id: 2, name: 'static', type:'header', url:'@personal/js/personalStatics', desc:'个人网站统计信息', logo:'test.jpg'},
            {_id: 3, name: 'test', url:'@personal/js/test', desc:'test', logo:'test.jpg'},
            {_id: 4, name: 'test1', url:'@personal/js/test1', desc:'test1', logo:'test.jpg'},
            {_id: 5, name: 'test2', url:'@personal/js/test2', desc:'test2', logo:'test.jpg'},
        ];
        
        $scope.yes = function () {
            $uibModalInstance.close('OK');
        }
        
        $scope.no = function () {
            $uibModalInstance.dismiss("CANCEL");
        }
        
        $scope.selectWikiBlock = function (wikiBlock) {
            console.log(wikiBlock);
            $uibModalInstance.close(wikiBlock);
        }
    }]);
    
    return htmlContent;
});