/**
 * Created by wuxiangan on 2017/5/23.
 */

define([
    'app',
    'markdown-it',
    'text!html/partial/confirmDialog.html',
], function (app, markdownit, htmlContent) {
    var confirmObj = {};
    app.factory('confirmDialog', ['$uibModal', function ($uibModal) {
        function confirmDialog(params, cb, errcb) {
            if (!params.title || (!params.content && !params.contentHtml)) {
                cb && cb();
                return;
            }
            confirmObj.title = params.title;
            confirmObj.content = params.content;
            confirmObj.contentHtml = markdownit({html: true}).render(params.contentHtml || "");
            confirmObj.confirmBtn = params.confirmBtn == undefined ? true : params.confirmBtn;
            confirmObj.cancelBtn = params.cancelBtn == undefined ? true : params.cancelBtn;
            confirmObj.confirmBtnClass = params.confirmBtnClass ? params.confirmBtnClass : false;
            confirmObj.theme = params.theme ? params.theme : false;
            confirmObj.titleInfo = params.titleInfo ? params.titleInfo : "";
            confirmObj.operationBtns = params.operationBtns || [];

            app.registerController("confirmDialogController",['$scope', function ($scope) {
                $scope.confirmObj = confirmObj;

                $scope.btnClickHandler = function(btnObj) {
                    btnObj.clickHandler($scope);
                }
            }]);

            var modal = $uibModal.open({
                template: htmlContent,
                size: confirmObj.size,
                backdrop: params.backdrop || true,
                controller: 'confirmDialogController',
            });
            modal.opened.then(params.openedCb, params.openedErrcb);
            modal.result.then(cb, errcb);
        }

        return confirmDialog;
    }]);
});
