
define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/title.html',
], function (app, util, htmlContent) {

    function registerController(wikiblock) {
        app.registerController("titleController", ['$scope','$sce', function ($scope, $sce) {
			
			$scope.editorMode = wikiblock.editorMode;

			initObj = {
				scope  : $scope,
				styles : [
					{
						"design": {
                            "text":"style1",
                            "cover":"http://git.keepwork.com/gitlab_rls_official/keepworkimages/raw/master/official_images/img_1515414255990.jpeg"
						},
					},
					{
						"design": {
                            "text":"style2",
                            "cover":"http://git.keepwork.com/gitlab_rls_official/keepworkimages/raw/master/official_images/img_1515414270193.jpeg"
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
                        name         : "logo",   
                        text         : config.wikiModPath + 'adi/assets/imgs/titleMod.png', 
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
						text         : "YOUR HEAD LINE", 
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
						text         : "YOUR SUB LINE", 
						href         : "",
						require      : true, 
					},
				}
            }

			wikiblock.init(initObj);
			
			$scope.setImgBackground = util.setImgBackground;
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

