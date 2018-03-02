/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: none
 * @Last Modified time: 2018-02-27 17:40:45
 */
define([
    'app',
    'helper/mdconf', 
    'text!wikimod/profile/html/certifications.html',
    'text!wikimod/profile/html/modalTemplate/addCertificationsModal.html',
    'helper/util',
], function (app, mdconf, htmlContent, addCertificationModalHtmlContent, util) {
    function registerController(wikiBlock) {
        app.registerController("certificationCtrl", ['$rootScope', '$scope', '$uibModal', '$translate', 'Account', 'modal', function ($rootScope, $scope, $uibModal, $translate, Account, modal) {
            const modCmd = "```@profile/js/certifications";
            var thisInBlockIndex;
            var thisContainerId;
			wikiBlock.init({
				scope:$scope,
				params_template:{
                    certifications:{
                        is_leaf: true,
                        require: false,
                        certifications:[{
                            is_leaf: true,
                            title:"初级计算机资格",
                            link:"http://www.baidu.com",
                            getDate:"2017-11-06"
                        }]
                    }
                }
            });
            
            $scope.certifications = util.arrayFrom($scope.params.certifications);
            $scope.editing = false;

            // 获取当前模块的index和containerId
            var getBlockIndex = function(){
                if (thisInBlockIndex >= 0) {
                    return thisInBlockIndex;
                }
                var blockList = wikiBlock.blockList;
                for(var i = 0; i<blockList.length; i++){
                    var modReg = new RegExp(modCmd);
                    if (modReg.test(blockList[i].content)) {
                        break;
                    }
                }
                thisInBlockIndex = i;
                thisContainerId = blockList[i].blockCache.containerId;
                return i;
            }

            var modifyCertificationsMd = function(){
                var newItemObj = {
                    index: getBlockIndex(),
                    containerId: thisContainerId,
                    content: modCmd + "\n" + mdconf.jsonToMd({
                        "certifications": $scope.certifications
                    }) + "\n```\n"
                }
                console.log(newItemObj.content);
                $rootScope.$broadcast("changeProfileMd", newItemObj);
            }

            $scope.showCertificationModal = function(index){
                if (!Account.isAuthenticated()) {
                    $rootScope.$broadcast("onLogout", "");
                    modal('controller/loginController', {
                        controller: 'loginController',
                        size: 'lg',
                        backdrop: true
                    });
                    return;
                }
                $scope.addingCertification = angular.copy($scope.certifications[index]);
                $uibModal.open({
                    template: addCertificationModalHtmlContent,
                    controller: "addCertificationModalCtrl",
                    openedClass: "add-certification-modal",
                    scope: $scope,
                    backdrop:'static'
                }).result.then(function(result){
                    if (index >= 0) {
                        $scope.certifications[index] = result;
                    }else{
                        $scope.certifications.push(result);
                    }
                    modifyCertificationsMd();
                }, function(){
                });
            }

            $scope.editCertification = function(){
                $scope.editing = !$scope.editing;
            };

            $scope.setCertification = function(index){
                $scope.showCertificationModal(index);
            };

            $scope.shiftUp = function(index){
                if (index < 1) {
                    return;
                }
                var prev = index - 1;
                $scope.certifications[prev] = $scope.certifications.splice((prev + 1), 1, $scope.certifications[prev])[0];
                modifyCertificationsMd();
            };

            $scope.shiftDown = function(index){
                if (index >= ($scope.certifications.length - 1)) {
                    return;
                }
                var prev = index;
                $scope.certifications[prev] = $scope.certifications.splice((prev + 1), 1, $scope.certifications[prev])[0];
                modifyCertificationsMd();
            };

            $scope.deleteCertification = function(index){
                config.services.confirmDialog({
                    "title": $translate.instant("删除提醒"),
                    "theme": "danger",
                    "content": $translate.instant("Remove_Confirm_Msg", {deleteItemName: $scope.certifications[index].title})
                }, function(result){
                    $scope.certifications.splice(index, 1);
                    modifyCertificationsMd();
                }, function(cancel){
                    console.log("cancel delete");
                });
            };
        }]);

        app.registerController("addCertificationModalCtrl", ['$rootScope', '$scope', '$uibModalInstance', '$translate', 'Account', 'modal', function ($rootScope, $scope, $uibModalInstance, $translate, Account, modal) {
            $scope.addingCertification = $scope.addingCertification || {};
            $scope.isGetDatePickerShow = false;
            $scope.cancel = function(){
                $uibModalInstance.dismiss("cancel");
            }
            var isRequiredEmptyAttr = function(attrNames){
                attrNames = attrNames || [];
                for(var i = 0;i < attrNames.length;i++){
                    if ($scope.addingCertification[attrNames[i].key] && $scope.addingCertification[attrNames[i].key].length > 0) {
                        continue;
                    }else{
                        break;
                    }
                }
                return {
                    'boolResult':(i < attrNames.length),
                    'attr': attrNames[i] && attrNames[i].value
                };
            }

            $scope.submitaddingCertification = function(){
                if (!Account.isAuthenticated()) {
                    $rootScope.$broadcast("onLogout", "");
                    modal('controller/loginController', {
                        controller: 'loginController',
                        size: 'lg',
                        backdrop: true
                    });
                    return;
                }
                $scope.errMsg = "";
                var result = $scope.addingCertification,
                    getDateTemp = result.getDate;
                result.getDate = getDateTemp ? util.formatDate(getDateTemp) : "";
                var requiredAttrs = [{
                    'key': 'title',
                    'value': $translate.instant('简介')
                },
                {
                    'key': 'getDate',
                    'value': $translate.instant('获得时间')
                }];
                var requiredResult = isRequiredEmptyAttr(requiredAttrs); 
                if (requiredResult.boolResult) {
                    $scope.errMsg = requiredResult.attr + $translate.instant("不可为空");
                    result.getDate = getDateTemp;
                    return;
                }
                $uibModalInstance.close($scope.addingCertification);
            }

            $scope.setDatePickVissibility = function(key) {
                $scope.isGetDatePickerShow = true;
            }
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});