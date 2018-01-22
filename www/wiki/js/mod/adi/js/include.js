define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/include.html',
], function (app, util, htmlContent) {
    function registerController(wikiblock) {
        app.registerController("includeController", ['$scope','$sce', function ($scope, $sce) {
			$scope.editorMode = wikiblock.editorMode;

			wikiblock.init({
				scope  : $scope,
				styles : [
					{
						"design": {
                            "text":"style1",
                            "cover":""
						},
					}
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
					url:{
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
			});
			
			$scope.setExternalIframeHeight = function(){
				setTimeout(function(){
					var iFrame = document.querySelector('#' + $scope.currentIframe);

					if (iFrame) {
						if($scope.editorMode){
							var preview = document.querySelector("#preview");

							if(preview){
								iFrame.style.height = (parseInt(preview.style.height) + 100) + "px";
							}
						}else{
							iFrame.style.height = (window.screen.height - 310) + "px";
						}
					}
				}, 0);
			};

			$scope.setInnerIframeHeight = function(){
				setTimeout(function(){
					var iFrame = document.querySelector('#' + $scope.currentIframe);

					var setHeightInterval = setInterval(function(){
						setNow();
					}, 100);

					var setTimes = 0;

					function setNow(){
						if(iFrame.offsetHeight != iFrame.contentWindow.document.body.offsetHeight){
							iFrame.style.height = iFrame.contentWindow.document.body.offsetHeight + "px";
						}else{
							if(setTimes <= 50){
								setTimes++
							}else{
								clearInterval(setHeightInterval);
							}
						}
					}
				}, 0);
			}

			if($scope.params.url.href.length > 4){
				if($scope.params.url.href.indexOf(config.hostname) > 0){
					$scope.$watch("$viewContentLoaded", $scope.setInnerIframeHeight);
				}else{
					$scope.$watch("$viewContentLoaded", $scope.setExternalIframeHeight);
				}
			}

			$scope.currentIframe = "__INCLUDE__" + Date.now();

			$scope.pageUrl = $sce.trustAsResourceUrl($scope.params.url.href);
		}]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
		}
    }
});

