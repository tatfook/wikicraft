define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/mix_layer.html',
], function (app, util, htmlContent) {

    function registerController(wikiblock) {
        app.registerController("mix_layerController", ['$scope','$sce', function ($scope, $sce) {
            $scope.editorMode = wikiblock.editorMode;

            wikiblock.init({
                scope  : $scope,
                styles : [
                    {
                        "design": {
                            "text":"style1",
                            "cover":""                         
                        },                        
                    },
                    {
                        "design": {
                            "text":"style2",
                            "cover":"/wiki/js/mod/adi/assets/images/qqTwo.png"
                        },
                    },
                   
                ],
                params_template : {
                    design:{
                        is_leaf      : true, 
                        type         : "text",   
                        editable     : false, 
                        is_mod_hide  : false,  
                        is_card_show : true,
                        name         : "样式",   
                        text         : "style1", 
                        require      : true, 
                    },
                    media_img:{
                        is_leaf      : true, 
						type         : "media",   
						mediaType    : "image",
                        editable     : true, 
						is_mod_hide  : false,  
						is_card_show : true,
                        name         : "图像",   
                        text         : "", 
                        href         : "", 
                    	require      : true, 
                    },
				   	link_title:{
						is_leaf      : true, 
						type         : "link",   
						editable     : true, 
						is_mod_hide  : false,  
						is_card_show : true,
						name         : "标题",   
						text         : "加利福尼亚大学", 
						href         : "",
						require      : true, 
                    },
                    link_subtitle:{
						is_leaf      : true, 
						type         : "link",   
						editable     : true, 
						is_mod_hide  : false,  
						is_card_show : true,
						name         : "子标题",   
						text         : "顶尖研究型大学", 
						href         : "",
						require      : true, 
                    },
                    multiText_content:{
						is_leaf      : true, 
						type         : "text",   
						editable     : true, 
						is_mod_hide  : false,  
						is_card_show : true,
						name         : "内容文字",   
						text         : "加利福尼亚大学伯克利分校是美国最负盛名且是最顶尖的一所公立研究型大学，位于旧金山东湾伯克利市的山丘上。1868年由加利福尼亚学院以及农业、矿业和机械学院合并而成，1873年迁至圣弗朗西斯科（旧金山）附近的伯克利市。伯克利加大是加利福尼亚大学中最老的一所。它也是美国大学协会（Association of American Universities）创始会员之一。其吉祥物蜕变自加州徽号，故其学生亦常自称“金色小熊”。加州大学伯克利分校与斯坦福大学、麻省理工学院等一同被誉为美国工程科技界的学术领袖。", 
						require      : true, 
					},
                }
            }); 
            
           



        }]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
        },
        initObj: function(){
            return initObj;
        }
    }
});

