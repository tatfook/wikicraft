define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/include.html',
], function (app, util, htmlContent) {
    function registerController(wikiblock) {
        app.registerController("includeController", ['$scope','$sce', '$http', function ($scope, $sce, $http) {
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
		}]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
		}
    }
});

