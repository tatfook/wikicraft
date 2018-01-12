/**
 * Created by wuxiangan on 2017/2/24.
 */

define(['app'], function (app) {
    app.factory('modal', ['$uibModal', function ($uibModal) {
        //console.log("load modal!!!");
        function modal(path, option, cb, errcb) {
            option = option || {};
            require([path], function (htmlContent) {
                $uibModal.open({
                    template: htmlContent,
                    size: option.size,
                    controller: option.controller,
                    backdrop: option.backdrop,
                    scope: option.scope
                }).result.then(cb, errcb);
            });
        }

        return modal;
    }]);
});

/* 对话框示例
'<div>\
    <div class="modal-header">\
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true" ng-click="no()">&times;</button>\
        <h4 class="modal-title">Github认证</h4>\
    </div>\
    <div class="modal-body">\
        进行github授权认证\
    </div>\
    <div class="modal-footer">\
        <button type="button" class="btn btn-default" data-dismiss="modal" ng-click="no()">否</button>\
        <button type="button" class="btn btn-primary" data-dismiss="modal" ng-click="yes()">是</button>\
    </div>\
</div>'

 app.registerController("testController", ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
 console.log("init testController");
 $scope.yes = function () {
 console.log("OK");
 $uibModalInstance.close("ok");
 }

 $scope.no = function () {
 console.log('CANCEL');
 $uibModalInstance.dismiss("cancel");
 }
 }]);
 */
