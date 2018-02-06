
define([
	"text!wikimod/adi/html/toc.html",
], function(htmlContent){
	var scrollTimer = undefined;

	function getTocTree(wikiBlock) {
		var md = app.objects.mainMdwiki;
		var blockList = md.template.blockList;

		var params = wikiBlock.modParams || {};
		var tree = {nodes:[]};
		var minLevel = params.min_level ? parseInt(params.min_level) : 1;
		var maxLevel = params.max_level ? parseInt(params.max_level) : 6;
		var curLevel = minLevel;
		var curNode = undefined;
		var id = 0;

		//console.log(params, wikiBlock);
		for (var i = 0; i < blockList.length; i++) {
			var block = blockList[i];
			var token = angular.copy(block.token);

			if (!/^[hH][1-6]$/.test(token.tag)) {
				continue;
			}

			var level = parseInt(token.tag.substring(1));
			if (level < minLevel || level > maxLevel) {
				continue;
			}

			if (level == minLevel) {
				tree.nodes.push({
					nodes:[],
					token:token,
					block:block,
					text: token.content.replace(/!?\[.*\]\(.*\)/, ""),
					id: id++,
					offsetTop: block.$element[0].offsetTop,
				});
				continue;
			}
			
			var node = tree;
			for (var j = minLevel; j < level; j++) {
				if (node.nodes.length == 0){
					node.nodes.push({nodes:[]});
				}
				node = node.nodes[node.nodes.length-1];
			}

			node.nodes.push({
				nodes:[],
			   	token:token,
				block:block,
				offsetTop: block.$element[0].offsetTop,
				text: token.content.replace(/!?\[.*\]\(.*\)/, ""),
				id: id++,
			});
		}

		//console.log(blockList);
		return tree;
	}

	var scrollProccess = function (wikiBlock, scrollElement, tocContent, dataOffsetTop) {
		function active(item) {
			$(".toc_container .active").removeClass("active");
			var targetObj = $('[data-targetid="'+ item.id+'"]');
			targetObj.addClass("active");
			//targetObj.get(0).scrollIntoView();
		}

		scrollTimer && clearTimeout(scrollTimer);
		scrollTimer = setTimeout(function () {
			var $scope = wikiBlock.$scope;
			if (!$scope.tree || !$scope.tree.nodes) {
				return;
			}

			scrollTimer = undefined;
			var scrollTop = scrollElement.scrollTop();
			//console.log(scrollTop, dataOffsetTop);
			if (scrollTop > dataOffsetTop){
				$(".toc_container").addClass("affix");
			}else{
				$(".toc_container").removeClass("affix");
			}

			var nodes = $scope.tree.nodes;
			for (var i = 0; i< nodes.length; i++){
				var node = nodes[i];
				//console.log(scrollTop, dataOffsetTop, node.offsetTop);
				if (scrollTop - dataOffsetTop - 600 - node.offsetTop < 0){
					active(node);
					break;
				}
			}
			if (i >= nodes.length){
				active(nodes[nodes.length-1]);
			}
		}, 100);
	};

	function render(wikiBlock) {
		if (!app.objects.mainMdwiki) {
			return;
		}

		var $scope = wikiBlock.$scope;

		// 初始化默认参数
		$scope.params = wikiBlock.modParams || {};
		$scope.params.design = $scope.params.design || "style1";
		$scope.mode = wikiBlock.mode;
		//console.log($scope.params, wikiBlock);
		if ($scope.params.isHome) {
			var scrollElement = $(window);
			var tocContent = wikiBlock.$element;
			var dataOffsetTop = tocContent.get(0).getBoundingClientRect().top || 0;
			scrollElement.on("scroll", function () {
				scrollProccess(wikiBlock, scrollElement, tocContent, dataOffsetTop);
			});
			scrollProccess(wikiBlock, scrollElement, tocContent, dataOffsetTop);
		}

		$scope.template = app.objects.mainMdwiki.template;
		$scope.tree = getTocTree(wikiBlock);

		$scope.clickTocItem = function(x) {
			if (!x.block || !x.block.$element) {
				return;
			}	

			var element = x.block.$element;
			element[0].scrollIntoView();
			//$("html, body").animate({scrollTop: element.offset().top }, {duration: 500,easing: "swing"});
			//console.log(x);
		}

		return htmlContent;
	}

	// 或编辑参数
	function getEditorParams(modParams) {
		return {
			design:modParams.design,
			min_level:{
				text: modParams.min_level,
				$data: {
					type:"number",
				},
			},
			max_level:{
				text:modParams.max_level,
				$data: {
					type:"number",
				}
			}
		};
	}

	// 获取模块参数
	function getModuleParams(editorParams) {
		return {
			design:editorParams.design,
			min_level:parseInt(editorParams.min_level.text),
			max_level:parseInt(editorParams.max_level.text),
		};
	}

	// 获取样式列表
	function getStyleList() {
		return [
			{
				design:"style1",
				min_level: 1,
				max_level: 4,
			},
		];
	}

	return {
		render: render,
		forceRender: render,
		getStyleList: getStyleList,
		getEditorParams: getEditorParams,
		getModuleParams: getModuleParams,
	};
});
