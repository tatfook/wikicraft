define([
    'app',
], function(app) {
    'use strict';
    
    app.registerController("selfDefinedModalController",["$scope", function($scope){

    }]);

    app.factory("selfDefinedModal", ["$uibModal", function($uibModal){
        function selfDefinedModal(options, successCallback, errorCallback){
            return new Promise(function(resolve, reject) {
                $uibModal.open(options).result.then(function(res) {
                    if(typeof(successCallback) == "function"){
                        successCallback(res);
                    }

                    resolve(res);
                }, function(error) {
                    if(typeof(errorCallback) == "function"){
                        errorCallback(res);
                    }

                    reject(error);
                });
            });
        }

        return selfDefinedModal;
    }]);
});