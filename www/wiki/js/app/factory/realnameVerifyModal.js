/**
 * Created by Rango Yuan on 2017/11/13.
 * 
 * //How to use?
 * config.services.realnameVerifyModal(
 *      res => console.log(res), 
 *      err => console.log(err)
 * );
 * 
 */

define([
    'app',
    'helper/util',
    'bluebird',
    'markdown-it',
    'text!html/partial/realnameVerifyModal.html',
], function (app, util, Promise, markdownit, htmlContent) {
    app.registerController("realnameVerifyModalController", ['$scope', '$interval', 'Account', 'Message', function ($scope, $interval, Account, Message) {
        $scope.realNameInfo = {};
        $scope.realNameCellPhoneSMSId = '';
        $scope.realNameCellPhoneSMSCodeWait = 0;
        $scope.realNameCellPhoneSMSCodeIsSending = false;
        $scope.realNameCellPhoneSMSCodeTimePromise && $interval.cancel($scope.realNameCellPhoneSMSCodeTimePromise);

        //安全验证
        $scope.sendRealNameCellPhoneSMSCode = function () {
            var cellphone = ($scope.realNameInfo.cellphone || '').replace(/\s/g,'');
            $scope.realNameInfo.cellphone = cellphone;

            if ( !/^[0-9]{11}$/.test($scope.realNameInfo.cellphone) ) {
                $scope.errorMsg = "请先填写正确的手机号码";
                return;
            }
            $scope.errorMsg = "";
            if ($scope.realNameCellPhoneSMSCodeWait > 0){
                return;
            }
            $scope.realNameCellPhoneSMSCodeIsSending = true;
            util.post(config.apiUrlPrefix + 'user/verifyCellphoneOne', {
                cellphone: $scope.realNameInfo.cellphone,
                setRealNameInfo: true,
            },function(data){
                $scope.realNameCellPhoneSMSCodeIsSending = false;
                $scope.realNameCellPhoneSMSId = data.smsId;

                $scope.realNameCellPhoneSMSCodeWait = 60;
                $scope.realNameCellPhoneSMSCodeTimePromise = $interval(function () {
                    if($scope.realNameCellPhoneSMSCodeWait <= 0){
                        $interval.cancel($scope.realNameCellPhoneSMSCodeTimePromise);
                        $scope.realNameCellPhoneSMSCodeTimePromise = null;
                    }else{
                        $scope.realNameCellPhoneSMSCodeWait --;
                    }
                }, 1000, 100);
                $scope.realNameInfo.SMSCode = "";
            }, function (err) {
                $scope.realNameCellPhoneSMSCodeIsSending = false;
                $scope.errorMsg = err.message;
            });
        };

        $scope.cellphone2UI = function (cellphone) {
            return (cellphone||'').replace(/\s/g,'').replace(/(\d{3})\d{4}(\d{4})/,'$1****$2');
        }

        $scope.submitRealnameInfo = function () {
            $scope.errorMsg = "";
            if (!$scope.realNameCellPhoneSMSId){
                $scope.errorMsg = "请先发送验证码！";
                return;
            }
            if (!$scope.realNameInfo.SMSCode){
                $scope.errorMsg = "请填写验证码！";
                return;
            }
            util.post(config.apiUrlPrefix + "user/verifyCellphoneTwo", {
                smsId: $scope.realNameCellPhoneSMSId,
                smsCode: $scope.realNameInfo.SMSCode,
                setRealNameInfo: true
            }, function(res) {
                $scope.user.realNameInfo = {
                    cellphone: $scope.realNameInfo.cellphone,
                    verified: true
                }
                Account.setUser($scope.user);
                $scope.$close($scope.user.realNameInfo);
            }, function (err) {
                $scope.errorMsg = err.message;
            });
        }

        $scope.cancel = function() {
            $scope.$dismiss('Canceled')
        }

        $scope.user && $scope.user.realNameInfo && $scope.user.realNameInfo.verified && $scope.user.realNameInfo.cellphone && $scope.$watch("$viewContentLoaded", function() {
            $scope.$close($scope.user.realNameInfo)
        });
    }]);

    app.factory('realnameVerifyModal', ['$uibModal', function ($uibModal) {
        function realnameVerifyModal(successCallback, errorCallback) {
			if (config.isLocal() || config.isGlobalVersion) {
				return Promise.resolve();
			}
            return new Promise(function(resolve, reject) {
                $uibModal.open({
                    template: htmlContent,
                    controller: 'realnameVerifyModalController',
                }).result.then(function(res) {
                    successCallback && successCallback(res);
                    resolve(res);
                }, function(error) {
                    errorCallback && errorCallback(error);
                    reject(error);
                });
            });
        }
        return realnameVerifyModal;
    }]);
});
