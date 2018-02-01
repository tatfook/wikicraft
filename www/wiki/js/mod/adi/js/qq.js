define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/qq.html',
], function (app, util, htmlContent) {

	function getStyleList() {
		return [
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
		   
		];
	}

	function getEditorParams(modParams){
		modParams = modParams || {};

		modParams.design = modParams.design || {};
		modParams.design.text = modParams.design.text || "style1";

		modParams.input_qq = modParams.input_qq || {};
		modParams.input_qq.$data = {
			is_leaf      : true, 
			type         : "text",   
			editable     : false, 
			is_mod_hide  : false,  
			is_card_show : true,
			name         : "样式",   
			text         : "", 
			require      : true, 
		}
		modParams.input_qq.text = modParams.input_qq.text || modParams.input_qq.$data.text;

		modParams.media_img = modParams.media_img || {};
		modParams.media_img.$data = {
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
		}
		modParams.media_img.text = modParams.media_img.text || modParams.media_img.$data.text;
		
		modParams.link_title = modParams.link_title || {};
		modParams.link_title.$data = {
			is_leaf      : true, 
			type         : "link",   
			editable     : true, 
			is_mod_hide  : false,  
			is_card_show : true,
			name         : "文本：标题",   
			text         : "客服中心", 
			href         : "",
			require      : true, 
		}
		modParams.link_title.text = modParams.link_title.text || modParams.link_title.$data.text;
		modParams.link_title.href = modParams.link_title.href || modParams.link_title.$data.href;

		console.log(modParams);
		return modParams;
	}

    function render(wikiblock) {
		var $scope = wikiblock.$scope;
		var $rootScope = app.ng_objects.$rootScope;
		$scope.params = getEditorParams(wikiblock.modParams);
		$scope.mode = wikiblock.mode;
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

		$scope.qqUrl = "http://wpa.qq.com/msgrd?v=3&uin=" + $scope.params.input_qq.text + "&site=qq&menu=yes";
		$scope.getQQUrl = function(){
			return $scope.params.input_qq.text.length == 0 ? "" : $scope.qqUrl;
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
		return htmlContent;
    }

    return {
        render: render,
		getStyleList: getStyleList,
		getEditorParams: getEditorParams,
    }
});

