define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/img_loop.html',
],function (app, util, htmlContent) {
    function registerController(wikiblock) {
        app.registerController("carouselController", ['$scope','$sce', function ($scope, $sce) {
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
                    media_img_one:{
                        is_leaf      : true, 
                        type         : "media",   
                        mediaType    : "image",
                        editable     : true, 
                        is_mod_hide  : false,  
                        is_card_show : true,
                        name         : "图像",   
                        text         : config.wikiModPath + 'adi/assets/images/imgCarouselOne.jpg', 
                        href         : "", 
                        require      : true, 
                    },
                    media_img_two:{
                        is_leaf      : true, 
                        type         : "media",   
                        mediaType    : "image",
                        editable     : true, 
                        is_mod_hide  : false,  
                        is_card_show : true,
                        name         : "图像",   
                        text         : config.wikiModPath + 'adi/assets/images/imgCarouselTo.jpg', 
                        href         : "", 
                        require      : true, 
                    },
                    media_img_three:{
                        is_leaf      : true, 
                        type         : "media",   
                        mediaType    : "image",
                        editable     : true, 
                        is_mod_hide  : false,  
                        is_card_show : true,
                        name         : "图像",   
                        text         : config.wikiModPath + 'adi/assets/images/imgCarouselThree.jpg', 
                        href         : "", 
                        require      : true, 
                    },
                    media_img_four:{
                        is_leaf      : true, 
                        type         : "media",   
                        mediaType    : "image",
                        editable     : true, 
                        is_mod_hide  : false,  
                        is_card_show : true,
                        name         : "图像",   
                        text         : config.wikiModPath + 'adi/assets/images/imgCarouselFour.jpg', 
                        href         : "", 
                        require      : true, 
                    },
                    media_img_five:{
                        is_leaf      : true, 
                        type         : "media",   
                        mediaType    : "image",
                        editable     : true, 
                        is_mod_hide  : false,  
                        is_card_show : true,
                        name         : "图像",   
                        text         : config.wikiModPath + 'adi/assets/images/imgCarouselFive.jpg', 
                        href         : "", 
                        require      : true, 
                    },
                }
            }

            wikiblock.init(initObj);
        
            $scope.imgInterval   = 5000;
            $scope.noWrapSlides = false;
            $scope.active       = 0;
        }]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
        }
    }
});

