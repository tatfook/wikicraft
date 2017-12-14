define([
    'app',
    'helper/util',
    'text!wikimod/kwContextLib/html/kwContextLib.html',
], function (app, util, htmlContent) {

    // 使用闭包使模块重复独立使用
    function registerController(wikiblock) {
        // 比赛类头部控制器
        app.registerController("keepworkLibController", ['$scope', '$compile', function ($scope, $compile) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiblock.modParams || {});

            function init() {
                console.log("----------init Keepwork context Mod---------");
            }
            var context = getContext();
            getResult(context);

            function getContext() {
                var allDoms = $("div[id^='_mdwiki_content_container_mdwiki']").children();
                var context = "";

                for (var i = 0; i < allDoms.length; i++) {
                    //console.log(allDoms[i]);
                    if (allDoms[i].hasAttribute('contenteditable')) {
                        var html = allDoms[i].innerHTML;
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
                    url:"http://221.0.111.131:19001/Application/kwfulltext_search",
                    type : "post",
                    data: {
                        "keyword": word,
                        "page": 1,
                        "highlight": 1,
                        "size": 10
                    },
                    dataType: "json",
                    success:function(result){
                        $("#keepwork-list").empty();
                        $(result.data.list).each(function(i, val){
                            var index = "<div class='serial'>"+(i+1)+"</div>";
                            var content = "<div class='rule-content'><h2><a target=_blank href="+val.access_url+">"+val.content+"</a></h2><p>" + val.url + "</p></div>";
                            $("#keepwork-list").append($compile(index+content)($scope));
                            //$(".link").attr("href",val.url);
                        });
                    }
                })
            }
            
            $(document).on('click','.link',function(){
                var url = $(this).html();
                $(".link").attr("href",url);
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


