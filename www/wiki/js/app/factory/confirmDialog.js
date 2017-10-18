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
