define([
    'app',
    'markdown-it',
    'helper/util',
    'text!wikimod/adi/html/text.html'
], function(app, markdown_it, util, htmlContent) {
    function registerController (wikiblock) {
        app.registerController("textController", ['$scope','$sce', function ($scope,$sce) {
            $scope.editorMode = wikiblock.editorMode;

            wikiblock.init({
                scope: $scope,
                styles:[
                    {
                        design: {
                            text: 'left',
                            cover: '/wiki/js/mod/adi/assets/images/textLeft.png'
                        }
                    },
                    {
                        design: {
                            text: 'center',
                            cover: '/wiki/js/mod/adi/assets/images/textCenter.png'
                        }
                    }
                ],
                params_template: {
                    design: {
                        is_leaf: true,
                        require: true,
                        is_mod_hide: true,
                        name: '样式',
                        text: 'left'
                    },
                    title:{
                        target: false,
                        is_leaf: true, // 叶子对象默认填true
                        type:"text",   // 地段类型
                        editable:true, // 是否可以编辑
                        is_card_show:true,  // 是否在adi中显示编辑
                        is_mod_hide:false,  // 在模块中是否隐藏
                        name:"标题",   // 表单显示名
                        text:"卢布尔雅那", // 默认值
                        require: true, // 必填字段 没有使用默认值(默认值得有)
                        href: ''
                        },
                    multiText_desc:{
                        is_leaf      : true,
                        type         : "multiText",
                        editable     : true,
                        is_card_show : true,
                        is_mod_hide  : false,
                        name         : "文字说明",
                        text         : '一个人去旅行，而且是去故乡的山水间徜徉。临行之前，面对太多的疑问和不解：为何是一个人？也有善意的提醒：何不去远方！昆明呀——赶一个花海；三亚呀——赴一个蓝天碧海。只是微笑地固执自己的坚持，不做任何解释。没有人明白，这一次是一个告别，或者一个永远的告别，以后我会去到很多很繁华或苍凉，辽远或偏僻的地方，而会常常想起这一次的旅行，想起那座山，那个城，那些人……',
                        require      : true,
                        href: '',
                        target:'_blank'
					}
                }
            })
            var md = new markdown_it({
                html: true,
                langPrefix: 'code-',
            })

            $scope.subMarkdownRender = util.subMarkdownRender;

            $scope.targetIf = $scope.params.multiText_desc.href.length == 0
        }])
    }
    
    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
        }
    }
});