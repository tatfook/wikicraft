
define([
	"app",
	"helper/dataSource",
], function(app, dataSource) {
	app.registerDirective("wikipage", ["$compile", function($compile){
		var util = app.objects.util;
		var config = app.objects.config;
		var mdwiki = app.objects.mdwiki;
		return {
			restrict:"E",
			scope: true,
			//template:'<input ng-model="message"><div>{{message}}</div>',
			controller: ["$scope", "$element", "$attrs", function($scope, $element, $attrs){
				var content, contentUrl;
				var $rootScope = app.ng_objects.$rootScope;
				var $auth =app.ng_objects.$auth;
				$scope.imgsPath = $rootScope.imgsPath;

				function noscript() {
					var text = $("#noscriptId").text();
					if (!text) {
						return false;
					}
					var md = mdwiki();
					var htmlstr = md.render(text);
					console.log(htmlstr);
					$element.html($compile(htmlstr)($scope));
					util.$apply($scope);
					$("#noscriptId").html("");

					return true;
				}

				function renderMDContent(content , theme) {
					var md = mdwiki();

					if ($attrs.isMainContent) {
						app.objects.share.md = md;
					}

					var htmlstr = md.render(content, theme);
					$element.html($compile(htmlstr)($scope));
					util.$apply($scope);
				}

				function loadContentByUrl(contentUrl) {
					var pageinfo = app.ng_objects.$rootScope.pageinfo;
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
							renderMDContent(content||"");
						});
					}	
				}

				function render() {
					//console.log("--------------", content, contentUrl);
					if (content) {
						if ($attrs.contentType == "md") {
							renderMDContent(content);
						} else {
							$element.html($compile(content)($scope));
						}
						return;
					}

					if (!contentUrl) {
						return;
					}

					loadContentByUrl(contentUrl);
				}

				$scope.$watch($attrs.content, function(newVal) {
					if (newVal == undefined || newVal == content) {
						return;
					}
					content = newVal;
					//console.log($attrs.content, $scope);
					//console.log(content);
					render();
				});

				$scope.$watch($attrs.contentUrl, function(newVal) {
					if (!newVal || newVal == contentUrl) {
						return;
					}
					contentUrl = newVal;
					render();
				});
			}],
		}
	}]);
});
