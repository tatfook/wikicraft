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
                        cover: 'http://git.keepwork.com/gitlab_rls_official/keepworkimages/raw/master/official_images/img_1515414062976.jpeg'
                    }
                },
                {
                    design:{
                        text:'right',
                        cover: 'http://git.keepwork.com/gitlab_rls_official/keepworkimages/raw/master/official_images/img_1515414083068.jpeg'
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

            // console.log($scope.params);
            // $scope.$watch("$viewContentLoaded", function(){
            //     setTimeout(function(){
            //         let uls = document.querySelectorAll(".menuUl"); //获取所有的ul
            //         console.log(uls)
            //         console.log(document.querySelectorAll(".menuUl"))
            //         let lis = document.querySelectorAll(".menuLi"); //获取所有的li
            //         console.log(lis)
            //         console.log(document.querySelectorAll(".menuLi"))
            //         console.log(document.querySelector("#tanbingfeng"))
            //         let liWidth = document.querySelector("#tanbingfeng .menuUl").offsetWidth-2
            //         for (let i = uls.length - 1; i >= 0; i--) {
            //                 if(uls[i].parentNode.nodeName === "LI") {
            //                     uls[i].style.left = liWidth + "px"; 
            //                 }
            //             }
            //             for (var i = 0; i < lis.length; i++) {
            //                 if( lis[i].children.length === 1) { //没有下一级菜单直接删除
            //                     lis[i].children[0].outerHTML = "";
            //                 };
            //             }
            //         for (let i = 0; i < lis.length; i++) { // 控制每一个li
            //                 lis[i].onmouseover = function() {
            //                     if( lis[i].children.length === 2) {
            //                         this.children[1].classList.remove("hide");
            //                         this.children[1].classList.add("show");
            //                     } 
            //                 }
            //                 lis[i].onmouseout = function() {
            
            //                     if( lis[i].children.length === 2) {
            //                         this.children[1].classList.remove("show");
            //                         this.children[1].classList.add("hide");
            //                     }
            //                 }
            //             }			
            //     },0)
            // });			
        }]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});
