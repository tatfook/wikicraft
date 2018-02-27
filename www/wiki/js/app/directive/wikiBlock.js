
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
				block.getNewScope = function() {
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

					self.getNewScope();

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

				//console.log("init block:" + block.cmdName);
				// 将htmlContent置空 确保初始化的render正确的执行
				block.getNewScope();
				block.htmlContent = undefined;
				block.render();
            }],
        };
    }]);

    function loadMod(block, cb, errcb) {
        var defaultModPath = "wikimod/";
        var requireUrl = block.cmdName;
		var cmdName = block.cmdName;

        if (block.cmdName == block.modName) {
            requireUrl = defaultModPath + block.modName + "/index";
		} else {
			requireUrl = defaultModPath + block.cmdName;
		}

		//console.log("加载mod:", requireUrl);

		//block.blockUrl = requireUrl;  // 暂时以cmdName标识唯一模块
        require([requireUrl], function (mod) {
            cb && cb(mod, cmdName);
        }, function () {
            errcb && errcb(cmdName);
        });
    }
	function render(success, error) {
		var self = this;

		// 非wiki block
		if (self.isWikiBlock) {
			if (self.htmlContent != self.token.htmlContent) {
				self.htmlContent = self.token.htmlContent;
				self.$render(self.token.htmlContent);
			}

			success && success();
			return;
		}

		// 强制渲染
		if (self.cmdName && self.wikimod && self.cmdName == self.wikimod.cmdName && 
				self.wikimod.mod && self.wikimod.mod.forceRender) {
			self.wikimod.mod.forceRender(self);
		}

		// 没有改变不重新渲染
		if (!self.isChange) {
			success && success();
			return;
		}

		//console.log(self);
		function _render(mod) {
			// 获取模板html
			function _getModHtml() {
				var htmlContent = undefined;
				if (typeof(mod) == "function") {
					htmlContent = mod(self);	
				} else if(typeof(mod) == "object") {
					htmlContent = mod.render(self);
				} else {
					htmlContent = mod;
				}

				return htmlContent;
			}
			var htmlContent = _getModHtml();
			var md = getMd(self.mdName);

			// text 改变不一定重新渲染  htmlContent改变则重新渲染
			if (self.htmlContent != htmlContent) {
				self.htmlContent = htmlContent;
				// 预览模式渲染魔板块 此外排除魔板块
				if (self.mode == "preview" || !self.isTemplate || self.blockList != undefined) { // template 与 template_block 唯一区别是blockList
					self.$render(_getModHtml);
				}
			} else {
			}
			success && success();
		}

		if (self.cmdName && self.wikimod && self.cmdName == self.wikimod.cmdName) {
			_render(self.wikimod.mod);
		} else {
			loadMod(self, function (mod, cmdName) {
				if (self.cmdName != cmdName) {
					return;
				}

				self.wikimod = {cmdName: cmdName, mod: mod};
				_render(self.wikimod.mod);
			}, function () {
				console.log("加载模块" + block.modName + "失败");
				error && error();
			});
		}
	}

})
