
define([
    'app',
	//"helper/md/mdconf",
	"helper/mdconf",
	"helper/md/md",
], function(app, mdconf, markdown){
    var instCount = 0;
    var mds = {};
    // 获取md
    function getMd(mdName) {
		//return app.get('app.md.' + mdName);
		mds[mdName] = mds[mdName] || {};
		return mds[mdName];
    }

    // 加载mod
    function loadMod(block, cb, errcb) {
        var defaultModPath = "wikimod/";
        var requireUrl = block.cmdName;

        if (block.cmdName == block.modName) {
            requireUrl = defaultModPath + block.modName + "/index";
		} else {
			requireUrl = defaultModPath + block.cmdName;
		}

        require([requireUrl], function (mod) {
            cb && cb(mod);
        }, function () {
            errcb && errcb();
        });
    }

    function extendBlock($scope, params) {
		//if ($scope.$kp_block) {
			//return $scope.$kp_block;
		//}

		var block = undefined;
		try {
			block = params && angular.fromJson(decodeURI(params));
		} catch(e) {
			block = $scope.$eval(params);
		}
		if(!block) {
            return block;
		}
		
		var md = getMd(block.mdName);
        if (block.isTemplate) {
			block = md.template;
        }
		$scope.$kp_block = block;
		block.$scope = $scope;
		block.$apply = function() {
			setTimeout(function(){
				block.$scope && block.$scope.$apply();
				//if (block.isTemplate) {
					//for (var i = 0; i < block.blockList; i++) {
						//var tempBlock = block.blockList[i];
						//tempBlock.$scope && tempBlock.$scope.$apply();
					//}
				//}
			});
		};
		
		if (typeof(block.modParams) == "string" && !block.modParams.trim()) {
			block.modParams = undefined;
		}

        if (!md.editable || !md.editor) {
            return block;
        }

        block.applyModParams = function(modParams) {
            var pos = block.textPosition;
            modParams = modParams || {};
            //console.log(modParams);
            if (typeof(modParams) == "object") {
                //modParams = angular.toJson(modParams, 4);
                modParams = mdconf.jsonToMd(modParams);
            }
            editor.replaceRange(modParams + '\n', {line: pos.from + 1, ch: 0}, {
                line: pos.to - 1,
                ch: 0
            });
        }

		return block;
    }

    // 定义扩展指令
    config.registerDirective("wikiBlock", ['$compile', function ($compile) {
        return {
            restrict:'E',
            controller: ['$scope', '$attrs', '$element', function ($scope, $attrs, $element) {
				var block = $scope.$kp_block;
				if (!block) {
					block = extendBlock($scope, $attrs.params);
				}

				var oldHtmlContent;
				var render = function(newVal) {
					if (!newVal || oldHtmlContent == newVal) {
						return;
					}
					$element.html($compile(newVal)($scope));
					oldHtmlContent = newVal;
					setTimeout(function() { $scope.$apply(); });
				}
				$scope.$watch('$kp_block.htmlContent', render);
            }],
        };
    }]);

	// 定义模块编辑器
	config.registerDirective("wikiBlockContainer", ["$compile", function($compile){
		return {
			restrict:'E',
			//scope: true,
			template: '<div><div>this is test</div><wiki-block data-params="$kp_block"></wiki-block></div>',
			controller:['$scope', '$attrs', '$element', function($scope, $attrs, $element) {
				extendBlock($scope, $attrs.params);
			}],
		}
	}]);

    // md 构造函数
    function mdwiki(options) {
		options = options || {};

        var mdName = "md" + instCount++;
		var templateContent = '<div ng-repeat="$kp_block in $kp_block.blockList track by $index" ng-if="!wikiBlock.isTemplate"><wiki-block-container data-params="$kp_block"></wiki-block-container></div>';
		var $compile = config.services.$compile;
		var $scope = options.$scope || config.services.$rootScope;
        var md = getMd(mdName);

        md.mdName = mdName;
        md.md = markdown(options);
        md.editable = options.editable;
        md.containerId = options.containerId;
        md.editor = options.editor;
        md.$scope = options.$scope;
		md.isBindContainer = false;

		md.template = {
			mdName: mdName,
			isTemplate: true,
			isWikiBlock: true,
			templateContent:templateContent,
			htmlContent: "<div>" + templateContent + "</div>",
			blockList:[],
		}

        md.setEditor = function(editor) {
            md.editor = editor;
        }

		md.bindContainer = function() {
			if (!md.isBindContainer && md.containerId && $('#' + md.containerId)) {
				$("#" + md.containerId).html($compile('<wiki-block-container data-params="' + encodeURI(angular.toJson(md.template)) + '"></wiki-block-container>')($scope));
				md.isBindContainer = true;
			}
		}

        // 渲染
        md.render = function (text, theme) {
            var blockList = md.parse(text, theme);
            var list = [];
			var template = undefined;
            for (var i = 0; i < blockList.length; i++) {
                if (blockList[i].isWikiBlock && blockList[i].isTemplate) {
                    template = blockList[i];
                } else {
                    list.push(blockList[i]);
                }
            }

            //md.template.blockList = list;
			if (template) {
				md.template.htmlContent = template.htmlContent;
				md.template.modName = template.modName;
				md.template.cmdName = template.cmdName;
				md.template.modParams = template.modParams;
			} else {
				md.template.htmlContent = '<div>' + templateContent + '</div>';
			}

			md.bindContainer();

			md.template.$apply && md.template.$apply();
			return '<wiki-block data-params="' + encodeURI(angular.toJson(md.template)) + '"></wiki-block>';
        }

        // md.bind
        md.parseBlock = function (block, token) {
            var content = token.content;
			var text = token.text;
			var line = text.split("\n")[0];
            var isWikiBlock = token.tag == "pre"  && /^```@([\w_\/]+)/.test(line);

            block.isWikiBlock = isWikiBlock;
            if (!isWikiBlock) {
                block.htmlContent = token.htmlContent;
            } else {
                var wikiCmdRE = /^```@([\w_\/]+)/;
                var wikiModNameRE = /^([\w_]+)/;
                var cmdName = line.match(wikiCmdRE)[1];
                var modName = cmdName.match(wikiModNameRE)[1];
                var modParams = undefined;
                try {
                    modParams = angular.fromJson(content)
                }
                catch (e) {
                    modParams = mdconf.mdToJson(content) || content;
                }

				block.htmlContent = '<div></div>';
                block.modName = modName;
                block.cmdName = cmdName;
                block.modParams = modParams;
                block.isTemplate = modName == "template";
				block.templateContent = block.isTemplate ? templateContent : undefined;
				loadMod(block, function (mod) {
					var htmlContent = mod.render(block);
					if (block.isTemplate) {
						md.template.htmlContent = htmlContent;
						md.template.$scope && md.template.$scope.$apply();
					} else {
						block.htmlContent = htmlContent;
						block.$scope && block.$scope.$apply();
					}
				}, function () {
					// console.log("加载模块" + block.modName + "失败");
				});
            }
        }

        md.parse = function (text) {
            var tokenList = md.md.parse(text);
            var blockList = md.template.blockList;
            for (var i = 0; i < tokenList.length; i++) {
                var token = tokenList[i];
				var block = blockList[i] || {};

				block.token = token;
				block.mdName = mdName;
				if (block.text != token.text) {
					block.text = token.text;
					md.parseBlock(block, token);
				}
				blockList[i] = block;
            }

			var size = blockList.length;
			for (var i = tokenList.length; i < size; i++) {
				blockList.pop();
			}
			//console.log(blockList);
            return blockList;
        }

        return md;
    }

    return mdwiki;
})
