/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: none
 * @Last Modified time: 2018-01-31 10:50:51
 */
define([
    'app', 
    'text!wikimod/profile/html/skills.html',
    'text!wikimod/profile/html/modalTemplate/addSkillModal.html',
    'helper/mdconf',
    'helper/util',
    'echarts-radar',
], function (app, htmlContent, addSkillModalHtmlContent, mdconf, util, echartsRadar) {
    function registerController(wikiBlock) {
        app.registerController("skillCtrl", ['$rootScope', '$scope', '$uibModal', 'Message', function ($rootScope, $scope, $uibModal, Message) {
            const modCmd = "```@profile/js/skills";
            var thisInBlockIndex;
            var thisContainerId;
            $scope.skillsDetail = [];
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
            
            var getSkillLikeStatus = function(){
                $scope.skills.map(function(skill, index){
                    var visitor = ($scope.user && $scope.user.username) || "";
                    util.get(config.apiUrlPrefix + 'skills/getDetail', {
                        title: skill.title,
                        visitor: visitor,
                        username: $scope.userinfo.username
                    }, function(data){
                        if (!data) {
                            return;
                        }
                        $scope.skillsDetail[skill.title] = data;
                    }, function(err){
                        console.log(err);
                    })
                })
            }
            $scope.skills = Array.from($scope.params.skills);
            getSkillLikeStatus();
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

            var modifySkillsMd = function(){
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
            }

            var updateSkill = function(skill, type){
                type = (type == 'update') ? type : 'insert'; 
                util.post(config.apiUrlPrefix + 'skills/' + type, {
                    username: $scope.userinfo.username,
                    title: skill.title,
                    level: parseInt(skill.level)
                }, function(){}, function(){})
            }

            $scope.showSkillModal = function(index){
                $scope.addingSkill = angular.copy($scope.skills[index]);
                $uibModal.open({
                    template: addSkillModalHtmlContent,
                    controller: "addSkillModalCtrl",
                    appendTo: $(".user-skills .modal-parent"),
                    scope: $scope,
                    backdrop:'static'
                }).result.then(function(result){
                    console.log(index);
                    if (index >= 0) {
                        $scope.skills[index] = result;
                        updateSkill(result, "update");
                    }else{
                        $scope.skills.push(result);
                        updateSkill(result, "insert");
                    }
                    modifySkillsMd();
                }, function(){
                });
            }

            $scope.likeSkill = function(skill){
                var visitor = ($scope.user && $scope.user.username) || "";
                util.post(config.apiUrlPrefix + 'skills/like', {
                    title: skill.title,
                    visitor: visitor,
                    username: $scope.userinfo.username
                }, function(data){
                    if (!data) {
                        var act = (data && !data.liked) ? "取消点赞" : "点赞";
                        Message.danger(act + "失败，请稍后重试");
                        return;
                    }
                    $scope.skillsDetail[skill.title] = data; 
                    var act = data.liked ? "点赞" : "取消点赞";
                    Message.info(act + "成功！");
                })
            }

            $scope.editSkill = function(){
                $scope.editing = !$scope.editing;
            };

            $scope.setSkill = function(index){
                $scope.showSkillModal(index);
            };

            $scope.shiftUp = function(index){
                var prev = index - 1;
                $scope.skills[prev] = $scope.skills.splice((prev + 1), 1, $scope.skills[prev])[0];
                modifySkillsMd();
            };

            $scope.shiftDown = function(index){
                var prev = index;
                $scope.skills[prev] = $scope.skills.splice((prev + 1), 1, $scope.skills[prev])[0];
                modifySkillsMd();
            };

            $scope.deleteSkill = function(index){
                config.services.confirmDialog({
                    "title": "删除提示",
                    "theme": "danger",
                    "content": "确定删除 " + $scope.skills[index].title + "?"
                }, function(result){
                    util.http("DELETE", config.apiUrlPrefix + "skills/delete", {
                        title: $scope.skills[index].title,
                        username: $scope.userinfo.username
                    }, function(){}, function(err){
                        console.log(err);
                    })
                    $scope.skills.splice(index, 1);
                    modifySkillsMd();
                }, function(cancel){
                    console.log("cancel delete");
                });
            };

            var radarEchartsObj;

            var initRadar = function(){
                var indicator = [];
                var value = [];
                var end = ($scope.skills.length > 5) ? 5 : ($scope.skills.length);
                for(var i = 0;i < end;i++){
                    var skill = $scope.skills[i];
                    indicator.push({
                        name: skill.title,
                        max: 5,
                        color: "#666"
                    });
                    value.push(skill.level);
                }
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

                radarEchartsObj && radarEchartsObj.dispose && radarEchartsObj.dispose();
    
                var radarContainer = document.getElementById("skillRadar");
                radarEchartsObj = echartsRadar.init(radarContainer);
                radarEchartsObj.setOption(option);
    
            }
    
            $scope.$watch('$viewContentLoaded', initRadar);
        }]);

        app.registerController("addSkillModalCtrl", ['$scope', '$uibModalInstance',function ($scope, $uibModalInstance) {
            $scope.addingSkill = $scope.addingSkill || {};
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

                if ($scope.editing) {
                    $uibModalInstance.close($scope.addingSkill);
                    return;
                }

                util.get(config.apiUrlPrefix + "skills/checkExistence", {
                    title: $scope.addingSkill.title,
                    username: $scope.userinfo.username
                }, function(data){
                    console.log(data);
                }, function(err){
                    if (err.status == '404') {
                        $scope.errMsg = "该技能已存在";
                        return;
                    }
                    
                    $uibModalInstance.close($scope.addingSkill);
                });
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