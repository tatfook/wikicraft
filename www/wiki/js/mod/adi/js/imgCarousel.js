define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/imgCarousel.html',
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
                    carousel_img_Two:{
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
                    carousel_img_Three:{
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
                    carousel_img_Four:{
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
                    carousel_img_Five:{
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
                    carousel_img_Six:{
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
        
            $scope.myInterval = 2000;
            $scope.noWrapSlides = false;
            $scope.active = 0;
            var slides = $scope.slides = [];
            var addSlide = function () {
            slides.push({ image:$scope.params.carousel_img_Two.text,id: 0});
            slides.push({ image:$scope.params.carousel_img_Three.text,id: 1});
            slides.push({ image:$scope.params.carousel_img_Four.text,id: 2});
            slides.push({ image:$scope.params.carousel_img_Five.text,id: 3});
            slides.push({ image:$scope.params.carousel_img_Six.text,id: 4});
            }
            addSlide();
            
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

