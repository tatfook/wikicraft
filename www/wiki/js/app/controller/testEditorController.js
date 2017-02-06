/**
 * Created by wuxiangan on 2016/12/19.
 */

define([
    'jquery',
    'app',
    'codemirror',
    'helper/markdownwiki',
    'helper/util',
], function ($, app, CodeMirror, markdownwiki, util) {
    console.log("testCtrl");
    
    function test() {
        util.http('POST', config.apiUrlPrefix + 'website_pages/getByUserId',{userId:1}, function (data) {
            var pageList = data || [];
            var pageTree = {url:'', children:{}};

            for (var i = 0; i < pageList.length; i++) {
                var page = pageList[i];
                var url = page.url;
                url = url.trim();
                var paths = page.url.split('/');
                var treeNode = pageTree;
                for (var j = 0; j < paths.length; j++) {
                    var path = paths[j];
                    if (!path){
                        continue;
                    }
                    subTreeNode = treeNode.children[paths[j]] || {children:{}, url: treeNode.url + '/' + paths[j]};
                    treeNode.children[paths[j]] = subTreeNode;
                    treeNode.isLeaf = false;
                    if (j == paths.length - 1) {
                        subTreeNode.isLeaf = true;
                        subTreeNode.sha = page.sha;
                        //subTreeNode.content = page.content;
                    }
                    treeNode = subTreeNode;
                }
            }
            console.log(pageTree);
        });
    }

    return function ($scope, $rootScope, Account) {
        test();
        var editor = CodeMirror.fromTextArea(document.getElementById('sourceCodeId'),{
            lineNumbers: true,
            mode:'markdown',
            lineWrapping: true,
            theme: "default",
            viewportMargin: Infinity,
        });

        var mdwiki = markdownwiki({container_name:"#wikiblockId"});
        mdwiki.bindToCodeMirrorEditor(editor);
        var value = '```@template/grid\n{\n\t"class":"container_fluid"\n}\n```\n# test';
        editor.setValue(value);
        editor.focus();
    };
});