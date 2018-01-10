define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/img.html',
], function (app, util, htmlContent) {

    function registerController(wikiblock) {
        app.registerController("photoController", ['$scope','$sce', function ($scope, $sce) {
            $scope.editorMode = wikiblock.editorMode;

            initObj = {
                scope  : $scope,
                styles : [
                    {
                        "design": {
                            "text":"style1",
                            "cover": "/wiki/js/mod/adi/assets/images/imgOne.png"
                        },
                    },
                    {
                        "design": {
                            "text":"style2",
                            "cover": "/wiki/js/mod/adi/assets/images/imgTwo.png"
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
                    media_imgOne:{
                        is_leaf      : true, 
                        type         : "media",   
                        mediaType    : "image",
                        editable     : true, 
                        is_mod_hide  : false,  
                        is_card_show : true,
                        name         : "图片",   
                        text         : config.wikiModPath + 'adi/assets/imgs/imgOne.png', 
                        href         : "", 
                        require      : true, 
                        },
                    media_imgTwo:{
                        is_leaf      : true, 
                        type         : "media",   
                        mediaType    : "image",
                        editable     : true, 
                        is_mod_hide  : false,  
                        is_card_show : true,
                        name         : "图片",   
                        text         : config.wikiModPath + 'adi/assets/imgs/imgTwo.png', 
                        href         : "", 
                        require      : true, 
                        },
                }
            }

            wikiblock.init(initObj);
            $scope.imgOneStyle = {
                "background-image" : 'url('+ $scope.params.media_imgOne.text +')',
                "background-size"  : "cover",
            }
            $scope.imgTwoStyle = {
                "background-image" : 'url('+ $scope.params.media_imgTwo.text +')',
                "background-size"  : "cover",
            }
            
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

