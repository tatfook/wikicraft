
define([
	'app',
], function(app) {
    // 加载mod
    // 定义扩展指令
    app.registerDirective("wikiBlock", ['$compile', function ($compile) {
        return {
            restrict:'E',
            controller: ['$scope', '$attrs', '$element', function ($scope, $attrs, $element) {
				var block = $scope.$kp_block;

				if (!block) {
					return;
				}

				// 获取新scope 避免模块重用干扰
				block.$getNewScope = function() {
					var self = this;
					if (self.$scope) {
						self.$scope.$destroy();
					}
					self.$scope = $scope.$new(false);
				}

				
				block.$apply = function(callback) {
					setTimeout(function(){
						block.$scope && block.$scope.$apply();
					});

					callback && callback();
				};

				block.$render = function(htmlContent) {
					var self = this;

					self.$getNewScope();
					
					if (typeof(htmlContent) == "function") {
						htmlContent = htmlContent();
					}

					$element.html($compile(htmlContent)(self.$scope));

					self.$apply(function(){
						if (block.wikimod && block.wikimod.mod && block.wikimod.mod.renderAfter) {
							block.wikimod.mod.renderAfter(block);
						}
					});
				}

				var renderListener = function(htmlContent){
					block.$render(htmlContent);
				}

				var applyListener = function(callback) {
					block.$apply(callback);
				}

				block.removeEventListener("render", renderListener);
				block.addEventListener("render", renderListener);

				block.removeEventListener("apply", applyListener);
				block.addEventListener("apply", applyListener);

				//console.log("init block:" + block.cmdName);
				// 将htmlContent置空 确保初始化的render正确的执行
				block.$getNewScope();
				block.htmlContent = undefined;
				block.render();
            }],
        };
    }]);
})
