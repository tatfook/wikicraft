define([
    'app',
    'text!wikimod/adi/html/comment.html'
], function(app, htmlContent) {
    function registerController (wikiblock) {
        app.registerController("commentController", ['$scope','$sce', function ($scope,$sce) {
            $scope.editorMode = wikiblock.editorMode;

            wikiblock.init({
                scope: $scope,
                styles:[
                    {
                        design: {
                            text: 'style1'
                        }
                    }
                ],
                params_template: {
                    design: {
                        is_leaf: true,
                        require: true,
                        is_mod_hide: true,
                        name: '样式',
                        text: 'style1'
                    },
                    title:{
                        is_leaf: true, // 叶子对象默认填true
                        type:"text",   // 地段类型
                        editable:true, // 是否可以编辑
                        is_card_show:true,  // 是否在adi中显示编辑
                        is_mod_hide:false,  // 在模块中是否隐藏
                        name:"标题",   // 表单显示名
                        text:"卢布尔雅那", // 默认值
                        require: true, // 必填字段 没有使用默认值(默认值得有)
                    }
                }
            })
        }])
    }
    
    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
        }
    }
});