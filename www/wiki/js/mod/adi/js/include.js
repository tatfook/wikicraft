define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/include.html',
], function (app, util, htmlContent) {
	var initObj = {
		styles : [],
		params_template : {
			url_img:{
				is_leaf      : true, 
				type         : "url",   
				editable     : true, 
				is_mod_hide  : false,  
				is_card_show : true,
				name         : "引用",   
				label        : "选择或输入URL",
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
				modParams.design.text = modParams.design.text || params_template[key].text;
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


		
		$scope.setExternalIframeHeight = function(){
			setTimeout(function(){
				var iFrame = document.querySelector('#' + $scope.currentIframe);
				if (iFrame) {
					$http({
						method: 'POST',
						url: '/api/wiki/models/page_code/',
						params: {
							"url" : $scope.params.url_img.href,
						}
					}).then(function successCallback(response) {
							// 请求成功执行代码
							$scope.codesun=response.data;
							if($scope.codesun.data.code==200){
								iFrame.style.height = (window.screen.height - 210) + "px";
							}else{
								iFrame.style.height = 50 + "px";
							}
						}, function errorCallback(response) {
							// 请求失败执行代码
							
					});
				}
			}, 0);
		};
	
		$scope.setInnerIframeHeight = function(){
			setTimeout(function(){
				var iFrame = document.querySelector('#' + $scope.currentIframe);

				var setHeightInterval = setInterval(function(){
					setNow();
				}, 2000);

				var setTimes = 0;

				function setNow(){
					if(setTimes <= 3){
						if(iFrame.offsetHeight != iFrame.contentWindow.document.body.offsetHeight){
							iFrame.style.height = iFrame.contentWindow.document.body.offsetHeight + "px";
						}

						setTimes++
					}else{
						clearInterval(setHeightInterval);
					}
				}
			}, 0);
		}

		if($scope.params.url_img.href.length > 4){
			if($scope.params.url_img.href.indexOf(config.hostname) > 0){
				$scope.$watch("$viewContentLoaded", $scope.setInnerIframeHeight);
			}else if($scope.params.url_img.href.indexOf("http://")==-1 && $scope.params.url_img.href.indexOf("https://") ==-1){
				$scope.$watch("$viewContentLoaded", $scope.setInnerIframeHeight);
			}else{
				$scope.$watch("$viewContentLoaded", $scope.setExternalIframeHeight);
			}
		}

		$scope.currentIframe = "__INCLUDE__" + Date.now();

		$scope.pageUrl = $sce.trustAsResourceUrl($scope.params.url_img.href);

		return htmlContent;
    }

    return {
        render: render,
		getEditorParams: getEditorParams,
		getStyleList: getStyleList,
    }
});

