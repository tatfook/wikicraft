/**
 * Created by big on 2017/12/19.
 */

define(['app', 'text!wikimod/adi/html/menu.html'], function (app, htmlContent) {
    function registerController(wikiblock) {
        app.registerController("menuController", ['$scope',function ($scope) {

			$scope.editorMode = wikiblock.editorMode;

            wikiblock.init({
                scope:$scope,
                styles:[
                {
                    design:{
                        text:'left',
                        cover: '/wiki/js/mod/adi/assets/images/menuLeft.png'
                    }
                },
                {
                    design:{
                        text:'right',
                        cover: '/wiki/js/mod/adi/assets/images/menuRight.png'
                    }
                }
                ],
                params_template:{
                    design:{
                        is_leaf: true,
                        require: true,
                        text:"left", // 默认值
                    },
                    menu_menu:{
                        is_leaf: true,
                        type: "menu",
                        editable: true,
                        is_mod_hide: false,
                        name: "菜单",
                        require: true,
                        text: [
                            {
                                name : '菜单1',
                                url  : '',
                                children: [
                                    {
                                        name : '菜单1.1',
                                        url  : ''
                                    }
                                ]
                            }
                        ]
                    },
                }
            });

            console.log($scope.params);			
        }]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});
