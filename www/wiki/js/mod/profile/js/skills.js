/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: none
 * @Last Modified time: 2018-03-08 16:49:13
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
        app.registerController("skillCtrl", ['$rootScope', '$scope', '$uibModal', '$translate', 'Message', 'Account', 'modal', function ($rootScope, $scope, $uibModal, $translate, Message, Account, modal) {
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
            $scope.skills = util.arrayFrom($scope.params.skills);
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
                var newItemObj = {
                    index: getBlockIndex(),
                    containerId: thisContainerId,
                    content: modCmd + "\n" + mdconf.jsonToMd({
                        "skills": $scope.skills
                    }) + "\n```\n"
                }
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
                if (!Account.isAuthenticated()) {
                    $rootScope.$broadcast("onLogout", "");
                    modal('controller/loginController', {
                        controller: 'loginController',
                        size: 'lg',
                        backdrop: true
                    });
                    return;
                }
                $scope.addingSkill = angular.copy($scope.skills[index]);
                $uibModal.open({
                    template: addSkillModalHtmlContent,
                    controller: "addSkillModalCtrl",
                    openedClass: "add-skill-modal",
                    scope: $scope,
                    backdrop:'static'
                }).result.then(function(result){
                    if (index >= 0) {
                        $scope.skills[index] = result;
                        updateSkill(result, "update");
                    }else{
                        $scope.skills.push(result);
                        updateSkill(result, "insert");
                    }
                    modifySkillsMd();
                    initRadar();
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
                setTimeout(function(){
                    initRadar();
                });
            };

            $scope.setSkill = function(index){
                $scope.showSkillModal(index);
            };

            $scope.shiftUp = function(index){
                if (index < 1) {
                    return;
                }
                var prev = index - 1;
                $scope.skills[prev] = $scope.skills.splice((prev + 1), 1, $scope.skills[prev])[0];
                modifySkillsMd();
            };

            $scope.shiftDown = function(index){
                if (index >= ($scope.skills.length - 1)) {
                    return;
                }
                var prev = index;
                $scope.skills[prev] = $scope.skills.splice((prev + 1), 1, $scope.skills[prev])[0];
                modifySkillsMd();
            };

            $scope.deleteSkill = function(index){
                config.services.confirmDialog({
                    "title": $translate.instant("删除提醒"),
                    "theme": "danger",
                    "content": $translate.instant("Remove_Confirm_Msg", {deleteItemName: $scope.skills[index].title})
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

            $rootScope.$on("onLogout", function(e) {
                if ($scope.editing) {
                    setTimeout(function(){
                        initRadar();
                    });
                }
            })
    
            $scope.$watch('$viewContentLoaded', initRadar);
        }]);

        app.registerController("addSkillModalCtrl", ['$rootScope', '$scope', '$uibModalInstance', '$translate', 'Account', 'modal', function ($rootScope, $scope, $uibModalInstance, $translate, Account, modal) {
            const SkillNameMaxLen = 10;
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
                var requiredAttrs = [{
                    'key': 'title',
                    'value': $translate.instant('技能名称')
                },
                {
                    'key': 'level',
                    'value': $translate.instant('熟练度')
                }];
                var requiredResult = isRequiredEmptyAttr(requiredAttrs); 
                if (requiredResult.boolResult) {
                    $scope.errMsg = requiredResult.attr + $translate.instant("不可为空");
                    return;
                }

                var skillName = $scope.addingSkill.title;
                if (skillName.length > SkillNameMaxLen) {
                    $scope.errMsg = $translate.instant("技能名称需小于10位");
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
                        $scope.errMsg = $translate.instant("该技能已存在");
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