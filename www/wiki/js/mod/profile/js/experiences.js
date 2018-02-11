/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: none
 * @Last Modified time: 2018-02-27 17:45:44
 */
define([
    'app', 
    'text!wikimod/profile/html/experiences.html',
    'text!wikimod/profile/html/modalTemplate/addExperienceModal.html',
    'helper/mdconf',
    'helper/util',
], function (app, htmlContent, addExperienceModalHtmlContent, mdconf, util) {
    function registerController(wikiBlock) {
        app.registerController("experienceCtrl", ['$rootScope', '$scope', '$uibModal', '$translate', 'Account', 'modal', function ($rootScope, $scope, $uibModal, $translate, Account, modal) {
            const modCmd = "```@profile/js/experiences";
            var thisInBlockIndex;
            var thisContainerId;
			wikiBlock.init({
				scope:$scope,
				params_template:{
                    experiences:{
                        is_leaf: true,
                        require: false,
                        experiences:[{
                            is_leaf: true,
                            logoUrl:"http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1516099391929.jpeg",
                            title:"学习C语言",
                            link:"/photograph/page01",
                            startDate:"2017-06-09",
                            endDate:"2017-11-06"
                        }]
                    }
                }
            });
            
            $scope.experiences = util.arrayFrom($scope.params.experiences);
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

            var modifyExperiencesMd = function(){
                var newItemObj = {
                    index: getBlockIndex(),
                    containerId: thisContainerId,
                    content: modCmd + "\n" + mdconf.jsonToMd({
                        "experiences": $scope.experiences
                    }) + "\n```\n"
                }
                console.log(newItemObj.content);
                $rootScope.$broadcast("changeProfileMd", newItemObj);
            }

            $scope.showExperienceModal = function(index){
                if (!Account.isAuthenticated()) {
                    $rootScope.$broadcast("onLogout", "");
                    modal('controller/loginController', {
                        controller: 'loginController',
                        size: 'lg',
                        backdrop: true
                    });
                    return;
                }
                $scope.addingExperience = angular.copy($scope.experiences[index]);
                $uibModal.open({
                    template: addExperienceModalHtmlContent,
                    controller: "addExperiencelModalCtrl",
                    openedClass: "add-experience-modal",
                    scope: $scope,
                    backdrop:'static'
                }).result.then(function(result){
                    if (index >= 0) {
                        $scope.experiences[index] = result;
                    }else{
                        $scope.experiences.push(result);
                    }
                    modifyExperiencesMd();
                }, function(){
                });
            }

            $scope.editExperience = function(){
                $scope.editing = !$scope.editing;
            };

            $scope.setExperience = function(index){
                $scope.showExperienceModal(index);
            };

            $scope.shiftUp = function(index){
                if (index < 1) {
                    return;
                }
                var prev = index - 1;
                $scope.experiences[prev] = $scope.experiences.splice((prev + 1), 1, $scope.experiences[prev])[0];
                modifyExperiencesMd();
            };

            $scope.shiftDown = function(index){
                if (index >= ($scope.experiences.length - 1)) {
                    return;
                }
                var prev = index;
                $scope.experiences[prev] = $scope.experiences.splice((prev + 1), 1, $scope.experiences[prev])[0];
                modifyExperiencesMd();
            };

            $scope.deleteExperience = function(index){
                config.services.confirmDialog({
                    "title": $translate.instant("删除提醒"),
                    "theme": "danger",
                    "content": $translate.instant("Remove_Confirm_Msg", {deleteItemName: $scope.experiences[index].title})
                }, function(result){
                    $scope.experiences.splice(index, 1);
                    modifyExperiencesMd();
                }, function(cancel){
                    console.log("cancel delete");
                });
            };
        }]);

        app.registerController("addExperiencelModalCtrl", ['$rootScope', '$scope', '$uibModalInstance', '$translate', 'Account', 'modal', function ($rootScope, $scope, $uibModalInstance, $translate, Account, modal) {
            $scope.addingExperience = $scope.addingExperience || {};
            $scope.cancel = function(){
                $uibModalInstance.dismiss("cancel");
            }
            
            var isRequiredEmptyAttr = function(attrNames){
                attrNames = attrNames || [];
                for(var i = 0;i < attrNames.length;i++){
                    if ($scope.addingExperience[attrNames[i].key] && $scope.addingExperience[attrNames[i].key].length > 0) {
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

            $scope.submitaddingExperience = function(){
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
                var result = $scope.addingExperience,
                    startTemp = result.startDate,
                    endTemp = result.endDate;
                result.startDate = startTemp ? util.formatDate(startTemp) : "";
                result.endDate = endTemp ? util.formatDate(endTemp) : "";
                var requiredAttrs = [{
                    'key': 'title',
                    'value': $translate.instant('简介')
                },
                {
                    'key': 'startDate',
                    'value': $translate.instant('开始时间')
                }];
                var requiredResult = isRequiredEmptyAttr(requiredAttrs); 
                if (requiredResult.boolResult) {
                    $scope.errMsg = requiredResult.attr + $translate.instant("不可为空");
                    result.startDate = startTemp;
                    result.endDate = endTemp;
                    return;
                }
                $uibModalInstance.close($scope.addingExperience);
            }

            $scope.setDatePickVissibility = function(key) {
                $scope.dateOptions = {
                    "minDate": $scope.addingExperience.startDate,
                    "maxDate": $scope.addingExperience.endDate
                }
                $scope[key] = true;
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