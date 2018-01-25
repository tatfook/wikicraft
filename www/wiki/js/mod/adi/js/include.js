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
			});
			
			$scope.setExternalIframeHeight = function(){
				setTimeout(function(){
				  	var iFrame = document.querySelector('#' + $scope.currentIframe);
				  	if (iFrame) {
					var load_finished = false;
					iFrame.onload = function(){
					  	if(!load_finished){
							if($scope.editorMode){
						  		var preview = document.querySelector("#preview");
								if(preview){
									iFrame.style.height = (parseInt(preview.style.height) + 100) + "px";
						  		}
							}else{
						  		iFrame.style.height = (window.screen.height - 310) + "px";
							}
					  	}
					}; 
					
					setTimeout(function(){
						  load_finished = true;
						  iFrame.style.height = "50px";
					}, 20000)
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

			if($scope.params.url_img.href.length > 4){
				if($scope.params.url_img.href.indexOf(config.hostname) > 0){
					$scope.$watch("$viewContentLoaded", $scope.setInnerIframeHeight);
				}else{
					$scope.$watch("$viewContentLoaded", $scope.setExternalIframeHeight);
				}
			}

			$scope.currentIframe = "__INCLUDE__" + Date.now();

			$scope.pageUrl = $sce.trustAsResourceUrl($scope.params.url_img.href);
		}]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
		}
    }
});

