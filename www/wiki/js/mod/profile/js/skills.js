/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-01-19 14:32:07
 */
define([
    'app', 
    'text!wikimod/profile/html/skills.html',
    'echarts-radar',
], function (app, htmlContent, echartsRadar) {
    function registerController(wikiBlock) {
        app.registerController("skillCtrl", ['$scope',function ($scope) {
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
            
            $scope.skills = $scope.params.skills;

            var initRadar = function(){
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
                        indicator: [
                           { name: '技能一', max: 5, color:"#666"},
                           { name: '技能二', max: 5, color:"#666"},
                           { name: '技能三', max: 5, color:"#666"},
                           { name: '技能四', max: 5, color:"#666"},
                           { name: '技能五', max: 5, color:"#666"}
                        ],
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
                                value : [5, 5, 2, 3, 4],
                                name : '预算分配（Allocated Budget）'
                            }
                        ]
                    }]
                };
    
                var radarContainer = document.getElementById("skillRadar");
                var radarEchartsObj = echartsRadar.init(radarContainer);
                radarEchartsObj.setOption(option, true);
    
            }
    
            $scope.$watch('$viewContentLoaded', initRadar);
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});