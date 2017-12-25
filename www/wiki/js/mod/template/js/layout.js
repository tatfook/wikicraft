
define([
	"app",
	"helper/util",
	"helper/markdownwiki",
	"helper/dataSource",
    'text!wikimod/template/html/layout.html',
], function(app, util, markdownwiki, dataSource, htmlContent){

	var defaultModParams = {
		rows: {
			list: [
			{
				cols:{
					list:[
					{
						content:"",
						contentUrl:"",
						"class":"",
						"style":"",
						isMainContent:true,
					}
					]
				}
			}
			]
			
		}
	};


	function registerController(wikiBlock) {
		app.registerController("layoutController", ["$scope", "$rootScope", function($scope, $rootScope){
			var modParams = wikiBlock.modParams;
			var pageinfo = $rootScope.pageinfo;

			console.log(pageinfo);

			wikiBlock.selfLoadContent = true;
			$scope.editorMode = wikiBlock.editorMode;
			$scope.isPageTemplate = wikiBlock.isPageTemplate;
			$scope.mode = wikiBlock.mode;

			for (var i = 0; i < modParams.rows.list.length; i++) {
				var row = modParams.rows.list[i];
				for (var j = 0; j < row.cols.list.length; j++) {
					var col = row.cols.list[j];
					if (col.isMainContent) {
						//col.content = wikiBlock.content;
					}
					col.$kp_id = wikiBlock.containerId + "_templeate_" + i + "_" + j;
				}
			}

			var render = function(id, content, contentUrl) {
				if (!content && !contentUrl) {
					return;
				}
				var md = markdownwiki({use_template:false});
				//console.log($("#"+id));
				if (content) {
					util.html("#" + id, md.render(content));
				} else {
					var pageinfo = $rootScope.pageinfo;
					var currentDataSource = dataSource.getDataSource(pageinfo.username,pageinfo.sitename);
					if (contentUrl && currentDataSource){
						var urlPrefix = "/" + pageinfo.username + "/" + pageinfo.sitename + "/"; 
						if (contentUrl.indexOf(urlPrefix) != 0){
							contentUrl = urlPrefix + contentUrl;
						}
						currentDataSource.getRawContent({
							path:contentUrl+config.pageSuffixName, 
							isShowLoading:false
						}, function(content){
							content = content || "";
							util.html("#" + id, md.render(content));
						});
					}	
				}
			}
			
			function init() {
				//$scope.params = modParams;
				//console.log($scope.params);
				setTimeout(function(){
					for (var i = 0; i < modParams.rows.list.length; i++) {
						var row = modParams.rows.list[i];
						for (var j = 0; j < row.cols.list.length; j++) {
							var col = row.cols.list[j];
							if (col.isMainContent) {
								util.html("#" + col.$kp_id, wikiBlock.content);
							} else {
								render(col.$kp_id, col.content, col.contentUrl);
							}
						}
					}
					wikiBlock.loadContent();
				});
			}

			function params_template_func(modParams) {
				var params_template = {
					design:{
						is_leaf:true,
						editable:false,
						require:true,
						text:"style1",
					},
					rows:{
						is_leaf: true,
						type: "list",
						editable: true,
						require: false,
						name: "行",
						list:[],
					},
				}

				for (var i = 0; i < modParams.rows.list.length; i++) {
					var row = modParams.rows.list[i];
					params_template.rows.list.push({
						cols: {
							is_leaf: true,
							type: "simple_list",
							editable: true,
							require: false,
							name:"行" + (i+1),
							list:[],
						}
					});

					var params = params_template.rows.list[i];
					for (var j = 0; j < row.cols.list.length; j++) {
						var col = row.cols.list[j];
						params.cols.list.push({
							is_leaf: !col.isMainContent,
							type:"page",
							editable: !col.isMainContent,
							require:false,
							name: "行" + (i+1) + "列" + (j+1),
							content: col.content,
							contentUrl: col.contentUrl,
						});
					}
				}

				//console.log(params_template);
				return params_template;
			}

			function toModParams(templateParams) {
				var params = {rows:[]};
				for (var i = 0; i < templateParams.rows.length; i++) {
					var row = templateParams.rows[i];
					params.rows.push({cols:[]});
					var params_row = params.rows[i];
					for (var j = 0; j < row.cols.length; j++) {
						var col = row.cols[j];
						params_row.cols.push({});
						var params_col = params_row.cols[j];
						params_col.class = col.class;
						params_col.style = col.style;
						params_col.isMainContent = col.isMainContent;
						if (!col.isMainContent) {
							params_col.content = col.content;
							params_col.contentUrl = col.contentUrl;
						}
					}
				}
				return params;
			}

			wikiBlock.init({
				scope: $scope,
				params_template:params_template_func(modParams), 
				styles:[
				{
					design:{
						text:"style1",
					},
					rows:{
						list:[
						{
							cols: {
								list:[
								{
									"desc": "default 布局",
									"class":"container",
									isMainContent: true,
								}
								]
							}
						}
						]
					},
				},
				{
					design:{
						text:"style2",
					},
					rows:{
						list: [
						{
							cols:{
								list:[
									{
										desc: "wiki 布局",
										contentUrl:"_header",
										isMainContent:false,
									},
								]
							}	
						},
						{
							cols:{
								list: [
									{
										class:"col-sm-10",
										isMainContent: true,
									},
									{
										class:"col-sm-2",
										contentUrl:"_rightSidebar",
										isMainContent:false,
									}
								]
							}
						}
						]
					}, 
				},
				{
					design:{
						text:"style3",
					},
					rows:{
						list: [
						{
							cols:{
								list:[
									{
										desc: "wiki 布局",
										contentUrl:"_header",
										isMainContent:false,
									},
								]
							}	
						},
						{
							cols:{
								list: [
									{
										class:"col-sm-2",
										contentUrl:"_leftSidebar",
										isMainContent:false,
									},
									{
										class:"col-sm-10",
										isMainContent: true,
									}
								]
							}
						}
						]
					}, 
				},
				]
			});

			$scope.$watch("$viewContentLoaded", init);
		}]);
	}

	return {
		render: function(wikiBlock) {
            wikiBlock.modParams = wikiBlock.modParams ? angular.merge({}, defaultModParams, wikiBlock.modParams) : defaultModParams;
			registerController(wikiBlock);
			return htmlContent;
		}
	}

});
