/**
 * Created by wuxiangan on 2016/10/28.
 */

app.controller('editorCtrl', function ($scope, $http, Account, projectStorageProvider) {
    console.log("editorCtrl");
    const github = projectStorageProvider.getDataSource('github');
    $scope.isEditorShow = true;
    $scope.isDesignShow = false;
    $scope.currentPage = undefined;

    init();

    function init() {
        // 初始化编辑器
        var editor = ace.edit("pageEditor");
        $scope.pageEditor = editor;
        editor.setTheme("ace/theme/github");
        editor.session.setMode("ace/mode/markdown");
        editor.setOption("showLineNumbers", true);
        editor.setOption("minLines",30);
        editor.setOption("maxLines",10000);
        editor.setAutoScrollEditorIntoView(true);

        // 初始化pageTree
        util.http($http, "POST", config.apiUrlPrefix+'website_pages/getAllPageByUid', {userid:Account.getUser()._id}, function (data) {
            var getTree = function(data) {
                var tree = [];
                for(var i = 0; i < data.length; i++) {
                    tree.push({
                        text:data[i].name,
                        extraInfo:data[i],
                        nodes:data[i].pages ? getTree(data[i].pages) : undefined,
                    });
                }
                return tree;
            };
            var tree = data ? getTree(data) : undefined;
            console.log(tree);
            $('#pageTree').treeview({data: tree,showBorder:false});
            $('#pageTree').on('nodeSelected', function(event, data) {
                if (!data.extraInfo._isLeaf) {
                    return;
                }
                console.log(data.extraInfo.content);
                $scope.currentPage = data.extraInfo;
                $scope.pageEditor.setValue(data.extraInfo.content);
                $('#pageUrlBtn').val('http:wikicraft.cn/'+data.extraInfo.path);
            });
        });
    }

    $scope.savePage = function () {
        if (!$scope.currentPage) {
            return;
        }
        $scope.currentPage.content = $scope.pageEditor.getValue();

        github.saveFile($scope.currentPage.path, $scope.currentPage.content, 'edit commit', function (error, result, request) {
            // 回调处理
        });
    }

    $scope.showCode = function () {
        $scope.isEditorShow = true;
        $scope.isDesignShow = false;
    }
    $scope.showDesgin = function () {
        $scope.isEditorShow = false;
        $scope.isDesignShow = true;
    }
    $scope.showCodeAndDesgin = function () {
        $scope.isEditorShow = true;
        $scope.isDesignShow = true;
    }
});