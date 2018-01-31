define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/qq.html',
], function (app, util, htmlContent) {

    function registerController(wikiblock) {
        app.registerController("qqController", ['$scope', '$rootScope', '$sce', function ($scope, $rootScope, $sce) {
            $scope.editorMode = wikiblock.editorMode;
            $scope.topStyle   = {};

            if($scope.editorMode){
                $scope.topStyle = {top: 'unset'};
            }else{
                if($rootScope.qqArray){
                    $scope.topStyle.top = (($rootScope.qqArray.length + 1) * 15) + "%";

                    $rootScope.qqArray.push('qq-mod');
                }else{
                    $rootScope.qqArray = ['qq-mod'];
                }
            }

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
                    input_qq: {
                        is_leaf      : true, 
						type         : "input",   
                        editable     : true, 
                        is_card_show : true,
                        is_mod_hide  : false,  
                        name         : "QQ调用",   
                        label        : "QQ号", 
                        text         : "", 

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
                return $scope.params.input_qq.text == null ? "" : $scope.qqUrl;
            }

            var imgOne = config.wikiModPath + 'adi/assets/imgs/qqMod.png';
            var imgTwo = config.wikiModPath + 'adi/assets/imgs/qqModTwo.png';

            var defaultImgs = [imgOne, imgTwo];

            $scope.getImagePictureText = function(currentImgText) {
                var media_img_text = '';
                var usingDefault = !currentImgText || defaultImgs.indexOf(currentImgText) >= 0;

                if(/^style1$/.test($scope.params.design.text)){
                    currentImgText = usingDefault ? imgOne : $scope.params.media_img.text;
                }

				if(/^style2$/.test($scope.params.design.text)){
                    currentImgText = usingDefault ? imgTwo : $scope.params.media_img.text;
                }

                if ($scope.params.media_img.text != currentImgText) {
                    $scope.params.media_img.text = currentImgText;
                }

                return currentImgText;
            }
        }]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
        }
    }
});

