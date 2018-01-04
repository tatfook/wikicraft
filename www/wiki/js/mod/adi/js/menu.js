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
                    }
                },
                {
                    design:{
                        text:'right',
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
                                id: 1,
                                name : '菜单1',
                                url  : '#',
                                note : '#',
                                children: [
                                    {
                                        id   : 1,
                                        name : '菜单1.1',
                                        url  : '#',
                                        note : '#',
                                        children: []
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
