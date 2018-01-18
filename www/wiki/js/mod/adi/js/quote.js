define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/quote.html',
], function (app, util, htmlContent) {
    function registerController(wikiblock) {
        app.registerController("includeController", ['$scope','$sce', function ($scope, $sce) {	
			$scope.editorMode = wikiblock.editorMode;
			/* var viewHeight = $(".result-html").height();
			var editHeight= $(".wikiEditor").height();
			if($scope.editorMode){
				$("Intake").css({
					"height" : viewHeight + "px",
				});
			}else{
				$("Intake").css({
					"height" : editHeight + "px",
				});
			} */
			
			 /* $('.editIntake').load(function(){
				var a=$('.editIntake').contents();
			}) */
			document.domain = "caibaojian.com";
			function setIframeHeight(iframe) {
			if (iframe) {
			var iframeWin = iframe.contentWindow || iframe.contentDocument.parentWindow;
			if (iframeWin.document.body) {
			//iframe.height = iframeWin.document.documentElement.scrollHeight || iframeWin.document.body.scrollHeight;
			$(".editIntake").css("height",iframeWin.document.body.scrollHeight); 
			}
			}
			};
			
			window.onload = function () {
			setIframeHeight(document.getElementById('external-frame'));
			};
			
			
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

