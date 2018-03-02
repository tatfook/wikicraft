
/**
 * Created by wuxiangan on 2016/12/20.
 */
define([
	'app',
	"helper/util",
], function (app, util) {
    app.directive('tplheader', ['$compile', function ($compile) {
		return {
			restrict: 'E',
			scope: true,
			template:'<div ng-show="isShow" class="tpl-header" ng-click="click()">\
			            <button ng-click="setTheme()">设置主题</button>\
						{{templateSrc}}\
						<i ng-show="isShowEdit" class="iconfont icon-bianji"></i>\
						<i ng-show="isShowNew" ng-click="clickNewTemplate($event)" class="iconfont icon-tianjia"></i>\
                        <span class="pull-right" ng-click="showVersions()">上次保存：{{committer_name}}于{{committed_date}}</span>\
                      </div>',
			controller: ["$rootScope", "$scope", "$attrs", "modal", function($rootScope, $scope, $attrs, modal){
				var clickEventType     = undefined;
				var mdwiki             = app.objects.editormd;
				var pageinfo           = $rootScope.pageinfo;
				var template           = mdwiki.template;
				var moduleEditorParams = config.shareMap.moduleEditorParams;

				$scope.$rootScope = $rootScope;
				$scope.isShow     = mdwiki.mode == "editor" && $rootScope.pageinfo;
				$scope.mdwiki     = mdwiki;
				
				$scope.$watch("mdwiki.template.token" ,function(){
					template = mdwiki.template;

					if (template && template.token) {
                        $scope.templateSrc = template.token.start >= 0 ? "当前页面" : "_theme";
						$scope.isShowEdit  = true;

						if ($scope.templateSrc == "_theme") {
							$scope.isShowNew = true;
						} else {
							$scope.isShowNew = false;
						}
					} else {
                        $scope.templateSrc = "布局模板为空";
						$scope.isShowEdit  = false;
						$scope.isShowNew   = true;
                    }
                });

				$scope.$watch("$rootScope.pageinfo", function() {
					pageinfo = $rootScope.pageinfo;

					if (mdwiki.mode != "editor" || !pageinfo) {
						$scope.isShow = false;
						return;
					}

					$scope.isShow = true;

					if (pageinfo.committer_name) {
						$scope.committer_name = pageinfo.committer_name.substring(11);
					}
					if (pageinfo.committed_date) {
						$scope.committed_date = pageinfo.committed_date.substring(0,10);
					}

					util.$apply();
                });

                $scope.showVersions = function(){
                    $scope.currentPage = $scope.pageinfo;
                    modal('controller/gitVersionController', {
                        controller: 'gitVersionController',
                        size: 'lg',
                        backdrop: true,
                        scope: $scope
                    }, function (wikiBlock) {
                        // console.log(wikiBlock);
                    }, function (result) {
                        // console.log(result);
                    });
                }

				$scope.clickNewTemplate = function($event) {
					if ($event) {
						$event.stopPropagation();
					}
					
					var defaultTemplate = "```@template/js/layout\n# urlmatch\n- text:\n```\n";
					mdwiki.editor.replaceRange(defaultTemplate, {line: 0, ch: 0}, {line:0,ch: 0});
				}

				$scope.click = function(){
					template = mdwiki.template;

					if (!template) {
						var defaultTemplate = "```@template/js/layout\n# urlmatch\n- text:\n```\n";
						mdwiki.editor.replaceRange(defaultTemplate, {line: 0, ch: 0}, {line:0,ch: 0});
						return ;
					}

					if (template.token && template.token.start < 0) {
						var urlObj = {username: pageinfo.username, sitename:pageinfo.sitename, pagename:"_theme"};
						$rootScope.$broadcast('changeEditorPage', urlObj);
						return;
					}
					
					moduleEditorParams.setBlock(template);
					util.$apply();	
				}

				$scope.setTheme = function() {
					let hasTheme = false;

					for (let item in template.blockList) {
						if (template.blockList[item].cmdName == 'adi/js/theme') {
							hasTheme = true;
							break;
						}
					}

					if (hasTheme) {
						alert(11111)
						moduleEditorParams.setBlock(template.blockList[item]);
					} else {
						alert(22222)
						app.addThemeBlock();
					}
				}
			}],
		}
    }]);
});
