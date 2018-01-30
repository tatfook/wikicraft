/**
 * Created by 18730 on 2017/2/21.
 */

/**
 * Created by wuxiangan on 2017/1/6.
 */

define([
    'app',
    'helper/markdownwiki',
    'helper/util',
    'helper/storage',
    'text!html/knowledge.html',
    'bootstrap-treeview',
], function (app, markdownwiki, util, storage,  htmlContent) {
    var md = markdownwiki({"use_template":false});

    app.registerController("knowledgeController", ['$scope','$rootScope', '$http', function ($scope, $rootScope, $http) {
        function getTreeData() {
            return [
                {
                    text: "wikiEditor使用简介",
                    state:{
                        selected:true,
                    },
                    data:{
                        articleTitle:"wiki markdown 教程",
                        articleUrl:config.articlePath + 'wikiEditor.md',
                    }
                },
            ];
        }

        function setArticle(data) {
            article = data.data || {};
            $scope.articleTitle = article.articleTitle || data.text;
            if (article.articleUrl) {
                // console.log(article);
                $http.get(article.articleUrl).then(function (response) {
                    //console.log(response.data);
                    util.html("#articleContent", md.render(response.data), $scope);
                });
            }
        }

        function init() {
            // console.log("test init");

            $rootScope.frameHeaderExist = false;
            $rootScope.frameFooterExist = false;

            var data = getTreeData();
            $('#treeview').treeview({
                data: data,
                levels: 3,
                showBorder:false,
                onNodeSelected: function (event, data) {
                    // console.log("onNodeSelected");
                    //console.log(data);
                    storage.sessionStorageSetItem('articleObj', data)
                    setArticle(data);
                }
            });

            var defaultArticle = storage.sessionStorageGetItem('articleObj') || data[0];
            setArticle(defaultArticle);
        }


        $scope.$watch('$viewContentLoaded', init);
    }]);

    return htmlContent;
});

