/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: none
 * @Last Modified time: 2018-01-25 22:17:37
 */
define([
    'app', 
    'text!wikimod/profile/html/experiences.html',
    'text!wikimod/profile/html/modalTemplate/addExperienceModal.html',
    'helper/mdconf',
], function (app, htmlContent, addExperienceModalHtmlContent, mdconf) {
    function registerController(wikiBlock) {
        app.registerController("experienceCtrl", ['$rootScope', '$scope', '$uibModal', function ($rootScope, $scope, $uibModal) {
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
            
            $scope.experiences = Array.from($scope.params.experiences);

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

            $scope.showExperienceModal = function(){
                $uibModal.open({
                    template: addExperienceModalHtmlContent,
                    controller: "addExperiencelModalCtrl",
                    appendTo: $(".user-experience .modal-parent"),
                    scope: $scope,
                    backdrop:'static'
                }).result.then(function(result){
                    $scope.experiences.push(result);
                    var newItemObj = {
                        index: getBlockIndex(),
                        containerId: thisContainerId,
                        content: modCmd + "\n" + mdconf.jsonToMd({
                            "experiences": $scope.experiences
                        }) + "\n```\n"
                    }
                    console.log(newItemObj.content);
                    $rootScope.$broadcast("changeProfileMd", newItemObj);
                }, function(){
                });
            }
        }]);

        app.registerController("addExperiencelModalCtrl", ['$scope', '$uibModalInstance',function ($scope, $uibModalInstance) {
            $scope.addingExperience = {};
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
                $scope.errMsg = "";
                var requiredAttrs = [{
                    'key': 'title',
                    'value': '简介'
                },
                {
                    'key': 'startDate',
                    'value': '开始时间'
                }];
                var requiredResult = isRequiredEmptyAttr(requiredAttrs); 
                if (requiredResult.boolResult) {
                    $scope.errMsg = requiredResult.attr + "不可为空";
                    return;
                }
                $uibModalInstance.close($scope.addingExperience);
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