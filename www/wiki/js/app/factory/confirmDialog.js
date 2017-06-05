/**
 * Created by wuxiangan on 2017/5/23.
 */

define([
    'app',
    'text!html/partial/confirmDialog.html',
], function (app, htmlContent) {
    var confirmObj = {};
    app.factory('confirmDialog', ['$uibModal', function ($uibModal) {
        function confirmDialog(params, cb, errcb) {
            if (!params.title || !params.content) {
                cb && cb();
                return;
            }
            confirmObj.title = params.title;
            confirmObj.content = params.content;
            confirmObj.confirmBtn = params.confirmBtn == undefined ? true : params.confirmBtn;
            confirmObj.cancelBtn = params.cancelBtn == undefined ? true : params.cancelBtn;
            app.registerController("confirmDialogController",['$scope', function ($scope) {
                $scope.confirmObj = confirmObj;
            }]);

            $uibModal.open({
                template: htmlContent,
                size: confirmObj.size,
                controller: 'confirmDialogController',
            }).result.then(cb, errcb);
        }

        return confirmDialog;
    }]);
});
