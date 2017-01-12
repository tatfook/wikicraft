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
    return function ($scope, $rootScope, Account) {
        $scope.workslistHeight = '280px';
        $scope.workslistNavHeight = '200px';
        $scope.siteObj = {siteList:[{},{},{}]};
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