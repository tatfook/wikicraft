/**
 * Created by wuxiangan on 2017/5/23.
 */

define([
    'app',
    'text!html/partial/confirm.html',
], function (app, htmlContent) {
    var confirmObj = {}
    app.factory('comfirm', ['$uibModal', function ($uibModal) {
        function confirm(params, cb, errcb) {
            if (!confirmObj.title || !confirmObj.content) {
                cb && cb();
                return;
            }
            confirmObj.title = params.title;
            confirmObj.content = params.content;
            app.registerController("confirmController",['$scope', function ($scope) {
                $scope.title = confirmObj.title;
                $scope.content = confirmObj.content;
            }]);

            $uibModal.open({
                template: htmlContent,
                size: confirmObj.size,
                controller: option.controller,
            }).result.then(cb, errcb);
        }

        return confirm;
    }]);
});
