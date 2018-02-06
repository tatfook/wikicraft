define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/vipread.html',
], function (app, util, htmlContent) {

	function getEditorParams(modParams) {
		modParams = modParams || {};

		modParams.switch_vipread = modParams.switch_vipread || {};
		modParams.switch_vipread.$data = {
			is_leaf      : true,
			type         : "switch",
			editable     : true,
			is_card_show : true,
			is_mod_hide  : false,
			name         : "阅读权限",
			text         : "",
			require      : true,
			module_kind  : "vip",
			desc         : "本网页内容，仅限VIP用户浏览全部"
		};

		return modParams;
	}

	function getStyleList() {
		return [];
	}

    function render(wikiBlock) {
		var $scope = wikiBlock.$scope;
		var $rootScope = app.ng_objects.$rootScope;
		var $sce = app.ng_objects.$sce;
		var Account = app.objects.Account;
		var modal = app.objects.modal;

		$scope.params = getEditorParams(wikiBlock.modParams);
		$scope.mode = wikiBlock.mode;
		var rearrangement = function(){
			var mdwiki      = config.shareMap["mdwiki"];
			var containerId = mdwiki.getMdWikiContentContainerId();
			var container   = $("#" + containerId);
			var vipBlock    = document.querySelector("#" + wikiBlock.containerId);

			var innerElement = container[0];

			for(var i = 0; i < innerElement.childNodes.length; i++){
				if(innerElement.childNodes[i].id == wikiBlock.containerId){
					innerElement.childNodes[i].remove();
				}
			}

			// for(var i = 0; i < innerElement.childNodes.length; i++){
			//     if(i >= 1){
			//         innerElement.childNodes[i].style.display = "none";
			//     }else{
			//         innerElement.childNodes[i].style.maxHeight = "150px";
			//         innerElement.childNodes[i].style.overflow = "hidden";
			//     }
			// }

			innerElement.prepend(vipBlock);

			if($scope.isVip){
				container.css({"height":"auto", "overflow":"none"});
			}else{
				container.css({"height":"300px", "overflow":"hidden"});
			}
		}

		var init = function () {
			if(wikiBlock.mode != "editor"){
				setUserVip();
				rearrangement();

			}
		};

		$scope.goLoginModal = function () {
			modal('controller/loginController', {
				controller: 'loginController',
				size: 'lg',
				backdrop: true
			}, function (result) {
				$scope.user = result;
				$scope.isLogin = true;
				init();
			}, function (result) {
				$scope.isLogin = false;
				init();
			});
		};
		

		$rootScope.$watch("isLogin", function(newValue, oldValue){
			$scope.$watch("$viewContentLoaded", function () {
				$scope.isLogin = newValue;
				init();
			});
		});

		function setUserVip(){
			if($scope.isLogin){
				$scope.user = Account.getUser();

				if($scope.user.vipInfo.endDate){
					$scope.isVip = true;
				}
			}else{
				$scope.isVip = false;
			}
		}

		return htmlContent;
    }

    return {
        render: render,
		getEditorParams: getEditorParams,
		getStyleList: getStyleList,
    }
});
