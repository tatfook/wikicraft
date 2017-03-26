/**
 * Created by wuxiangan on 2017/1/9.
 */

define(['app', 'text!wikimod/example/page/example.page'], function (app, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("exampleController", function ($scope) {
            console.log(wikiBlock);
            // 模块参数初始化相关表单值
            var modParams = wikiBlock.modParams || {};
            $scope.title = modParams.title || "title";
            $scope.content = modParams.content || "hello wiki module!!!";
            $scope.isViewEdit = wikiBlock.viewEdit;  // viewEdit 是否点击编辑按钮 <==> 视图编辑模式

            // 模块参数表单配置提交函数
            $scope.ok = function () {
                modParams.title = $scope.title;
                modParams.content = $scope.content;
                wikiBlock.applyModParams(modParams);  // 应用模块参数
            }
        });
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});