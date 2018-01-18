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
					link_include:{
						is_leaf      : true, 
						type         : "link",   
						editable     : true, 
						is_mod_hide  : false,  
						is_card_show : true,
						name         : "引用",   
						text         : "", 
						href         : "",
						require      : true, 
					},
				}
			});
			
			$scope.setExternalIframeHeight = function(){
				setTimeout(function(){
					var iFrame = document.querySelector('.intake');

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
					var iFrame = document.querySelector('.intake');

					iFrame.style.height = (iFrame.contentWindow.outerHeight + 600) + "px";
				}, 0);
			}

			if($scope.params.link_include.href.length > 4){
				if($scope.params.link_include.href.indexOf(config.hostname) > 0){
					$scope.$watch("$veieContentLoaded", $scope.setInnerIframeHeight);
				}else{
					$scope.$watch("$viewContentLoaded", $scope.setExternalIframeHeight);
				}
			}

			$scope.pageUrl = $sce.trustAsResourceUrl($scope.params.link_include.href);
		}]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
		}
    }
});

