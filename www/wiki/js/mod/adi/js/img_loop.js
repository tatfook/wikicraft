define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/img_loop.html',
],function (app, util, htmlContent) {
	var initObj = {
		styles : [
			{
				"design": {
					"text":"style1",
					"cover": "/wiki/js/mod/adi/assets/images/thumbnail.png"
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
	};

	function getEditorParams(modParams) {
		modParams = modParams || {};

		var params_template = initObj.params_template;
		for (var key in params_template) {
			if (key == "design") {
				modParams.design = modParams.design || {};
				modParams.design.text = params_template[key].text;
			} else {
				modParams[key] = modParams[key] || {};
				modParams[key]["$data"] = params_template[key];
				modParams[key]["text"] = modParams[key]["text"] || params_template[key]["text"];
			}
		}

		return modParams;
	}

	function getStyleList() {
		return initObj.styles;
	}

    function render(wikiblock) {
		var $scope = wikiblock.$scope;
		var $http = app.ng_objects.$http;
		var $sce = app.ng_objects.$sce;

		$scope.params = getEditorParams(wikiblock.modParams);
		$scope.mode = wikiblock.mode;
		$scope.imgs       = [];
		$scope.displayBar = {};

	
		$scope.imgInterval   = 3000;
		$scope.noWrapSlides = false;
		$scope.active       = 0;

		if(!$scope.params.media_img_one.is_mod_hide){
			$scope.imgs.push($scope.params.media_img_one);
		}

		if(!$scope.params.media_img_two.is_mod_hide){
			$scope.imgs.push($scope.params.media_img_two);
		}

		if(!$scope.params.media_img_three.is_mod_hide){
			$scope.imgs.push($scope.params.media_img_three);
		}

		if(!$scope.params.media_img_four.is_mod_hide){
			$scope.imgs.push($scope.params.media_img_four);
		}

		if(!$scope.params.media_img_five.is_mod_hide){
			$scope.imgs.push($scope.params.media_img_five);
		}

		if($scope.imgs.length==1){
			$scope.displayBar = {"display":"none"};
		}else{
			$scope.displayBar = {"display":"block"};
		}

		return htmlContent;
    }

    return {
        render: render,
		getEditorParams: getEditorParams,
		getStyleList: getStyleList,
    }
});

