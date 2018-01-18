
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
                console.log("----------init knowledge Mod---------");
            }

            var context = getContext();
            getResult(context);
            
            function getContext() {
                var wikiblocks = $("div[id^='_mdwiki_content_container_mdwiki']").children();
                var context = "";

                for (var i=0; i<wikiblocks.length; i++) {
                    var wikiblock = wikiblocks[i];
                    var blockchildren = wikiblock.children;
                    var isMod = false;
                    for (var j=0; j<blockchildren.length; j++) {
                        if (blockchildren[j].hasAttribute('ng-controller')) {
                            isMod = true;
                            break;
                        }
                    }
                    if (!isMod) {
                        var html = wikiblock.innerHTML;
                        if (html) {
                            html = html.replace(/[^\u4e00-\u9fa5]/g,'');
                            if (html) {
                                context = context.concat(html);
                            }
                        }
                    }
                }
                return context;
            }
            
            function getResult(context) {
                $.ajax({
                    url:"http://221.0.111.131:19001/Application/kwsegwords",
                    type: "post",
                    data: {
                        "context": context
                    },
                    dataType: "json",
                    success:function(result) {
                        var word = result.msg;
                        getList(word);
                    }
                });
            }
            
            function getList(word) {
                $.ajax({
                    url:"http://221.0.111.131:19001/Application/baikesearchv3",
                    type : "post",
                    data: {
                        "keyword": word,
                        "page": 1,
                        "highlight": 0,
                        "flag": 1
                    },
                    dataType: "json",
                    success:function(result){
                        $("#knowledge-list").empty();
                        $(result.data.list).each(function(i, val){
                            var index = "<div class='serial'>"+(i+1)+"</div>";
                            var content = "<div class='rule-content'><h2><a target=_blank href="+val.keepwork_url+">"+val.title+"</a></h2><p>" + val.content + "......</p></div>";
                            $("#knowledge-list").append($compile(index+content)($scope));
                        });
                    }
                })
            }
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
    "title":"百科推荐",
    "rules":[
    ]
}
```
*/
