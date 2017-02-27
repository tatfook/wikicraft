/**
 * Created by wuxiangan on 2017/2/24.
 */

define(['app'], function (app) {
    app.factory('modal', ['$uibModal', function ($uibModal) {
        console.log("load modal!!!");
        function modal(path, option, cb, errcb) {
            require([path], function (htmlContent) {
                $uibModal.open({
                    template:htmlContent,
                }).result.then(cb, errcb);
            });
        }
        return modal;
    }]);
});