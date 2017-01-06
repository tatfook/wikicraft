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
        var editor = CodeMirror.fromTextArea(document.getElementById('sourceCodeId'),{
            lineNumbers: true,
            mode:'markdown',
            lineWrapping: true,
            theme: "default",
            viewportMargin: Infinity,
        });
        /*

         var mdwiki = markdownwiki({container_name:"#wikiblockId"});
        mdwiki.bindToCodeMirrorEditor(editor);

         editor.on('change', function () {
         var result = editor.getValue();
         console.log(result);
         result = mdwiki.render(result);
         console.log(result);
         util.html('#wikiblockId', result, $scope);
         });
         $('#resultOperEditBtnId').on('click', function () {
         $('#resultEditId').fadeIn();
         $('#resultOperId').fadeOut();
         });

         $('#resultContainer').on('mouseenter mouseleave', function (e) {
         if (e.type == 'mouseenter') {
         console.log("mouseenter");
         $('#resultOperId').fadeIn();
         } else if (e.type == 'mouseleave') {
         console.log("mouseleave");
         $('#resultOperId').fadeOut();
         }
         });

         $scope.ok = function () {
         console.log($scope.title);
         editor.setValue('# ' + $scope.title);
         $('#resultEditId').fadeOut();
         }
         */
        //editor.setValue('```@header/js/personalHeader\n{\n\t"key":"hello world", \n\t"value":"test"\n}\n```');
        editor.setSelection({line:2,ch:'\n'},{line:3,ch:'\n'});
        var value = editor.getRange({line:2,ch:'\n'},{line:4,ch:"\n"});
        value = value.split('\n');
        console.log(value);
        editor.focus();
    };
});