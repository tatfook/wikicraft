/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: none
 * @Last Modified time: 2018-01-25 21:45:40
 */
define([
    'app', 
    'text!wikimod/profile/html/skills.html',
    'text!wikimod/profile/html/modalTemplate/addSkillModal.html',
    'helper/mdconf',
    'echarts-radar',
], function (app, htmlContent, addSkillModalHtmlContent, mdconf, echartsRadar) {
    function registerController(wikiBlock) {
        app.registerController("skillCtrl", ['$rootScope', '$scope', '$uibModal', function ($rootScope, $scope, $uibModal) {
            const modCmd = "```@profile/js/skills";
            var thisInBlockIndex;
            var thisContainerId;
			wikiBlock.init({
				scope:$scope,
				params_template:{
                    skills:{
                        is_leaf: true,
                        require: false,
                        skills:[{
                            is_leaf: true,
                            title:"研发",
                            desc:"技能描述",
                            level:5,// 1-5
                        }]
                    }
                }
            });
            
            $scope.skills = Array.from($scope.params.skills);
            
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

            $scope.showSkillModal = function(){
                $uibModal.open({
                    template: addSkillModalHtmlContent,
                    controller: "addSkillModalCtrl",
                    appendTo: $(".user-skills .modal-parent"),
                    scope: $scope,
                    backdrop:'static'
                }).result.then(function(result){
                    $scope.skills.push(result);
                    initRadar();
                    var newItemObj = {
                        index: getBlockIndex(),
                        containerId: thisContainerId,
                        content: modCmd + "\n" + mdconf.jsonToMd({
                            "skills": $scope.skills
                        }) + "\n```\n"
                    }
                    console.log(newItemObj.content);
                    $rootScope.$broadcast("changeProfileMd", newItemObj);
                }, function(){
                });
            }

            var radarEchartsObj;

            var initRadar = function(){
                var indicator = [];
                var value = [];
                $scope.skills.map(function(skill){
                    indicator.push({
                        name: skill.title,
                        max: 5,
                        color: "#666"
                    });
                    value.push(skill.level);
                });
                console.log(indicator);
                console.log(value);
                if (indicator.length <= 0 && value.length <= 0) {
                    return;
                }
                var option = {
                    tooltip: {},
                    radar: {
                        // shape: 'circle',
                        name: {
                            textStyle: {
                                color: '#FFF',
                                backgroundColor: '#999',
                                borderRadius: 3,
                                padding: [3, 5],
                                fontSize:"20px" 
                           }
                        },
                        indicator: indicator,
                        splitArea:{
                            areaStyle:{
                                color:["#66B8FF", "#7FC4FF", "#99D0FF", "#BBE0FF", "#E0F1FF"]
                            }
                        },
                        splitLine:{
                            lineStyle:{
                                color:["transparent"]
                            }
                        },
                        axisLine:{
                            lineStyle:{
                                color:"#FFF",
                                type: "dashed",
                            }
                        }
                    },
                    series: [{
                        name: '预算 vs 开销（Budget vs spending）',
                        type: 'radar',
                        // areaStyle: {normal: {}},
                        data : [
                            {
                                value : value,
                                name : '预算分配（Allocated Budget）'
                            }
                        ]
                    }]
                };

                console.log(radarEchartsObj);
                // radarEchartsObj && radarEchartsObj.dispose && radarEchartsObj.dispose();
                console.log(radarEchartsObj);
    
                var radarContainer = document.getElementById("skillRadar");
                radarEchartsObj = echartsRadar.init(radarContainer);
                radarEchartsObj.setOption(option);
    
            }
    
            $scope.$watch('$viewContentLoaded', initRadar);
        }]);

        app.registerController("addSkillModalCtrl", ['$scope', '$uibModalInstance',function ($scope, $uibModalInstance) {
            $scope.addingSkill = {};
            $scope.cancel = function(){
                $uibModalInstance.dismiss("cancel");
            }
            var isRequiredEmptyAttr = function(attrNames){
                attrNames = attrNames || [];
                for(var i = 0;i < attrNames.length;i++){
                    if ($scope.addingSkill[attrNames[i].key] && $scope.addingSkill[attrNames[i].key].length > 0) {
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

            $scope.submitAddingSkill = function(){
                $scope.errMsg = "";
                var requiredAttrs = [{
                    'key': 'title',
                    'value': '技能名称'
                },
                {
                    'key': 'level',
                    'value': '熟练度'
                }];
                var requiredResult = isRequiredEmptyAttr(requiredAttrs); 
                if (requiredResult.boolResult) {
                    $scope.errMsg = requiredResult.attr + "不可为空";
                    return;
                }
                $uibModalInstance.close($scope.addingSkill);
            }

            $scope.selectLevel = function(level){
                $scope.addingSkill.level = level;
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