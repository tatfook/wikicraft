define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/imgCarousel.html',
],function (app, util, htmlContent) {
    function registerController(wikiblock) {
        app.registerController("carouselController", ['$scope','$sce', function ($scope, $sce) {
            $scope.editorMode = wikiblock.editorMode;
            $scope.myInterval = 2000;
            $scope.noWrapSlides = false;
            $scope.active = 0;
            var slides = $scope.slides = [];
            var addSlide = function () {
            slides.push({ image: '/wiki/js/mod/adi/assets/images/imgTwo.png',id: 0});
            slides.push({ image: '/wiki/js/mod/adi/assets/images/imgThree.png',id: 1});
            slides.push({ image: '/wiki/js/mod/adi/assets/images/imgFour.png',id: 2});
            slides.push({ image: '/wiki/js/mod/adi/assets/images/imgFive.png',id: 3});
            slides.push({ image: '/wiki/js/mod/adi/assets/images/imgSix.png',id: 4});
            }
            addSlide();
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
                    carousel_img_Two:{
                        is_leaf      : true, 
                        type         : "media",   
                        mediaType    : "image",
                        editable     : true, 
                        is_mod_hide  : false,  
                        is_card_show : true,
                        name         : "图像",   
                        text         : config.wikiModPath + 'adi/assets/imgs/imgTwo.png', 
                        href         : "", 
                        require      : true, 
                    },
                    carousel_img_Three:{
                        is_leaf      : true, 
                        type         : "media",   
                        mediaType    : "image",
                        editable     : true, 
                        is_mod_hide  : false,  
                        is_card_show : true,
                        name         : "图像",   
                        text         : config.wikiModPath + 'adi/assets/imgs/imgTwo.png', 
                        href         : "", 
                        require      : true, 
                    },
                    carousel_img_Four:{
                        is_leaf      : true, 
                        type         : "media",   
                        mediaType    : "image",
                        editable     : true, 
                        is_mod_hide  : false,  
                        is_card_show : true,
                        name         : "图像",   
                        text         : config.wikiModPath + 'adi/assets/imgs/imgTwo.png', 
                        href         : "", 
                        require      : true, 
                    },
                    carousel_img_Five:{
                        is_leaf      : true, 
                        type         : "media",   
                        mediaType    : "image",
                        editable     : true, 
                        is_mod_hide  : false,  
                        is_card_show : true,
                        name         : "图像",   
                        text         : config.wikiModPath + 'adi/assets/imgs/imgTwo.png', 
                        href         : "", 
                        require      : true, 
                    },
                    carousel_img_Six:{
                        is_leaf      : true, 
                        type         : "media",   
                        mediaType    : "image",
                        editable     : true, 
                        is_mod_hide  : false,  
                        is_card_show : true,
                        name         : "图像",   
                        text         : config.wikiModPath + 'adi/assets/imgs/imgTwo.png', 
                        href         : "", 
                        require      : true, 
                    },
                }
            }

            wikiblock.init(initObj);
            
            
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

