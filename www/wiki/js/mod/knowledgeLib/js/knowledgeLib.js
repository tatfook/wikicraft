
define([
    'app',
    'helper/util',
    'text!wikimod/knowledgeLib/html/knowledgeLib.html',
], function (app, util, htmlContent) {

    // 使用闭包使模块重复独立使用 
    function registerController(wikiblock) {
        // 比赛类头部控制器        
        app.registerController("knowledgeModController", ['$scope', '$compile', function ($scope, $compile) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiblock.modParams || {});

            function init() {
                // console.log("----------init knowledge Mod---------");
            }
           
            var server = "121.14.117.220"; 
            var context = getContext();
            getKnowledgeList(context);
            
            function getContext() {
                var allDoms = $("div[id^='_mdwiki_content_container_mdwiki']").children();
                var context = "";

                for (var i = 0; i < allDoms.length; i++) {
                    var html = allDoms[i].innerHTML;
                    if (html) {
                        html = html.replace(/[^\u4e00-\u9fa5]/g,'');
                        if (html) {
                            context = context.concat(html);
                        }
                    }
                }
                return context;
            }
            
            function getKnowledgeList(context) {
                $.ajax({
                    url:"http://"+server+"/KnowledgeServer/api/knowledgeMod/getKnowledgeList",
                    type : "post",
                    data: {
                        "keywords": context,
                        "type": 2,  //keywords类型，1:词语，2:句子
                        "highlight": 1 
                    },
                    dataType: "json",
                    success:function(result){
                        $("#knowledge-list").empty();
                        $(result.data.list).each(function(i, val){
                            var index = "<div class='serial'>"+(i+1)+"</div>";
                            var content = "<div class='rule-content'><h2><a ng-click='getKnowledgeDetail(\""+val.id+"\")'>"+val.title+"</a></h2><p>"+val.content+"......</p></div>";
                            $("#knowledge-list").append($compile(index+content)($scope));
                        });
                    }
                });
            }
            
            var lastKnowledgeId;
            $scope.getKnowledgeDetail = (function(id){
                $("#knowledge-list").hide();
                $("#knowledge-detail").show();
                
                if (id == lastKnowledgeId)
                    return;
                
                $(".knowledge_title").empty();
                $(".knowledge_content").empty();
                
                $.ajax({
                    url:"http://"+server+"/KnowledgeServer/api/knowledgeMod/getKnowledgeDetail?jsonpcallback=?",
                    type : "get",
                    data: {
                        "id": id
                    },
                    dataType: "jsonp",
                    jsonp: "jsonpcallback",
                    success:function(result){
                        var title = result.data.list[0].title;
                        var content = result.data.list[0].content;
                        $(".knowledge_title").text(title);
                        $(".knowledge_content").html(content);
                        lastKnowledgeId = id;
                    }
                })
            });
            
            $scope.returnList = (function() {
                $("#knowledge-detail").hide();
                $("#knowledge-list").show();
            }); 
            
        }]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
        }
    }
});


/*
```@knowledgeLib/js/knowledgeLib
{
    "moduleKind":"game",
    "title":"ç¾ç§æ¨è",
    "rules":[
    ]
 }
```
*/
