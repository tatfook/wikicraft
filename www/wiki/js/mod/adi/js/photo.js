define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/photo.html',
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
                        },
                    },
                ],
                params_template : {
                    design:{
                        is_leaf      : true, 
                        type         : "text",   
                        editable     : false, 
                        is_mod_hide  : true,  
                        is_card_show : true,
                        name         : "样式",   
                        text         : "style1", 
                        require      : true, 
                    },
                    media_photo:{
                        is_leaf      : true, 
                        type         : "media",   
                        mediaType    : "image",
                        editable     : true, 
                        is_mod_hide  : true,  
                        is_card_show : true,
                        name         : "photo",   
                        text         : config.wikiModPath + 'adi/assets/imgs/photo.png', 
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

