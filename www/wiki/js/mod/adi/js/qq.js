define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/qq.html',
], function (app, util, htmlContent) {

    function registerController(wikiblock) {
        app.registerController("qqController", ['$scope','$sce', function ($scope, $sce) {
            $scope.editorMode = wikiblock.editorMode;

            wikiblock.init({
                scope  : $scope,
                styles : [
                    {
                        "design": {
                            "text":"style1",
                            "cover":"/wiki/js/mod/adi/assets/images/qqOne.png"                         
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
                    // text_qq:{
					// 	is_leaf      : true, 
					// 	type         : "text",   
					// 	editable     : true, 
					// 	is_mod_hide  : false,  
					// 	is_card_show : true,
					// 	name         : "QQ调用",   
					// 	text         : "", 
					// 	require      : true, 
                    // },
                    input_qq: {
                        is_leaf      : true, 
						type         : "input",   
                        editable     : true, 
                        is_card_show : true,
                        is_mod_hide  : false,  
                        name         : "QQ调用",   
                        label        : "QQ号", 
                        text         : "232222332", 

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
						name         : "文本：标题",   
						text         : "客服中心", 
						href         : "",
						require      : true, 
                    },
                }
            });

            $scope.qqUrl = "http://wpa.qq.com/msgrd?v=3&uin=" + $scope.params.input_qq.text + "&site=qq&menu=yes";

            $scope.getQQUrl = function(){
                return $scope.params.input_qq.text.length == 0 ? "" : $scope.qqUrl;
            }

            $scope.$watch("params", function(){
                var imgOne = config.wikiModPath + 'adi/assets/imgs/qqMod.png';
                var imgTwo = config.wikiModPath + 'adi/assets/imgs/qqModTwo.png'

                var defaultImgs = [imgOne, imgTwo];

                var currentImgText = $scope.params.media_img.text;

                for(var x in defaultImgs){
                    if(currentImgText == defaultImgs[x]){
                        currentImgText = "";
                        break;
                    }
                }

                if($scope.params.design.text == "style1"){
                    $scope.params.media_img.text = currentImgText.length == 0 ? imgOne : $scope.params.media_img.text;
                    console.log($scope.params.media_img.text);
                }

                if($scope.params.design.text == "style2"){
                    $scope.params.media_img.text = currentImgText.length == 0 ? imgTwo : $scope.params.media_img.text;
                    console.log($scope.params.media_img.text);
                }
            })

                     
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

