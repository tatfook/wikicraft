define([
    'app',
	"helper/md/mdconf",
	"helper/md/md",
	'directive/wikiBlock',
	'directive/wikiBlockContainer',
], function(app, mdconf, markdown){
    app.objects.mds = {};
    var instCount = 0;
	var mds = app.objects.mds;
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
        }, function (e) {
			console.log(e);
            errcb && errcb(cmdName);
        });
    }

	function md_link_render(obj) {
		var pageinfo = config.services.$rootScope.pageinfo;

		if (!pageinfo) {
			return; 
		}

		var href = obj.md.md_special_char_unescape(obj.link_href);
		var text = obj.md.md_special_char_unescape(obj.link_text);
		//console.log(obj);
		//console.log(href);
		var currentDataSource = dataSource.getDataSource(pageinfo.username,pageinfo.sitename);
		if (currentDataSource && href.indexOf("private_token=visitortoken") >=0 ) {
			href = href.replace('private_token=visitortoken','private_token=' + currentDataSource.getToken());
		}
		
		return '<wiki-link href="' + href + '">' + text + '<wiki-link>';
	}

	function md_image_render(obj) {
		var pageinfo = config.services.$rootScope.pageinfo;
		if (!pageinfo) {
			return; 
		}

		var href = obj.md.md_special_char_unescape(obj.image_href);
		var text = obj.md.md_special_char_unescape(obj.image_text);
		//console.log(obj);
		//console.log(href);
		var currentDataSource = dataSource.getDataSource(pageinfo.username,pageinfo.sitename);
		if (currentDataSource && href.indexOf("private_token=visitortoken") >=0 ) {
			href = href.replace('private_token=visitortoken','private_token=' + currentDataSource.getToken());
		}
		
		return '<img src="' + href + '" alt="' + text + '"/>';
	}

	function md_rule_override(md) {
		md.register_rule_render("a", md_link_render);
		md.register_rule_render("img", md_image_render);
	}
    // md 构造函数
    function mdwiki(options) {
		options = options || {};

        var mdName = "md" + instCount++;
		var encodeMdName = encodeURI(mdName);
        var md = getMd(mdName);

        md.mdName = mdName;
        md.md = markdown(options);
        md.containerId = options.containerId;
        md.editor = options.editor;
		md.mode = options.mode || "normal";
        md.$scope = options.$scope;
		md.isBindContainer = false;
		md.use_template = options.use_template;

		md_rule_override(md.md);

		var templateContent = '<div class="wikiEditor" ng-repeat="$kp_block in $kp_block.blockList track by $index" ng-if="!$kp_block.isTemplate"><wiki-block-container data-params="' + encodeMdName +'"></wiki-block-container></div>';
		var blankTemplateContent = '<div>' + templateContent + '</div>';

		if (md.mode == "preview") {
			templateContent = '<div class="wikiEditor" ng-repeat="$kp_block in $kp_block.blockList track by $index"><wiki-block-container data-params="' + encodeMdName +'"></wiki-block-container></div>';
			blankTemplateContent = '<div>' + templateContent + '</div>';
		}

		md.template = {
			mdName: mdName,
			isTemplate: true,
			isWikiBlock: true,
			templateContent:templateContent,
			htmlContent: blankTemplateContent,
			text:undefined,
			blockList:[],
		}

        md.setEditor = function(editor) {
            md.editor = editor;
        }

		md.bindContainer = function() {
			var $scope = options.$scope || app.ng_objects.$rootScope;
			var $compile = app.ng_objects.$compile;

			if (!md.isBindContainer && md.containerId && $('#' + md.containerId)) {
				$("#" + md.containerId).html($compile('<wiki-block-container class="wikiEditor" data-template="true" data-params="' + encodeMdName + '"></wiki-block-container>')($scope));
				md.isBindContainer = true;
			}
		}

        // 渲染
        md.render = function (text, theme, isLoadTheme) {
			function _render(text, theme) {
				md.parse(text, theme);

				//console.log("-------render----------");
				md.template.render(function(){
					for(var i = 0; i < md.template.blockList.length; i++) {
						var block = md.template.blockList[i];
						block.render();
					}
				});

				md.template.$apply && md.template.$apply();
				//console.log(md.template);

				md.bindContainer();
				return '<wiki-block-container data-template="true" data-params="' + encodeURI(md.mdName) + '"></wiki-block-container>';
			}

			if (!isLoadTheme) {
				return _render(text, theme);
			}

			var pageinfo = app.ng_objects.$rootScope.pageinfo;
			if (pageinfo && pageinfo.pagename && pageinfo.pagename[0] != "_" ) {
				var currentDataSource = app.objects.dataSource.getDataSource(pageinfo.username,pageinfo.sitename);
				if (currentDataSource) {
					// get theme content
					currentDataSource.getRawContent({path:'/' + pageinfo.username + '/' + pageinfo.sitename + '/_theme' + config.pageSuffixName, isShowLoading:false}, function (content) {
						_render(text, content);
					}, function () {
						_render(text, theme);
					})
				} else {
					_render(text, theme);
				}
			} else {
				_render(text,theme);
			}
        }

		md.getBlockList = function() {
			return md.template.blockList;
		}
        // md.bind
        md.parseBlock = function (block) {
			// 进来表明该模块发生变化 应重置所有状态
			var token = block.token;
            var content = token.content;
			var text = token.text;
			var line = text.split("\n")[0];
            var isWikiBlock = token.tag == "pre"  && /^```@([\w_\/]+)/.test(line);

            block.isWikiBlock = isWikiBlock;
            if (!isWikiBlock) {
				//block.blockUrl = undefined;
				block.isTemplate = false;
				block.modName = undefined;
				block.cmdName = undefined;
				block.modParams = undefined;
				block.wikimod = undefined;
				block.applyModParams = undefined;
				block.render = function() {
					if (block.htmlContent != token.htmlContent && block.$render) {
						block.htmlContent = token.htmlContent;
						//console.log(block.htmlContent, block);
						block.$render(block.htmlContent);
					}
				}
            } else {
                var wikiCmdRE = /^```@([\w_\/]+)/;
                var wikiModNameRE = /^([\w_]+)/;
                var cmdName = line.match(wikiCmdRE)[1];
                var modName = cmdName.match(wikiModNameRE)[1];
                var modParams = undefined;
                try {
                    modParams = angular.fromJson(content.trim())
                }
                catch (e) {
                    modParams = mdconf.mdToJson(content) || content;
                }

				//console.log(modParams);
				if (block.cmdName != cmdName) {
					block.wikimod = undefined;
				}

                block.modName = modName;
                block.cmdName = cmdName;
                block.modParams = modParams;
                block.isTemplate = modName == "template";
				block.templateContent = block.isTemplate ? templateContent : undefined;

				if (typeof(block.modParams) == "string" && !block.modParams.trim()) {
					block.modParams = undefined;
				}

				block.applyModParams = function(modParams) {
					var md = getMd(block.mdName);
					var editor = md.editor || {};

					if (!editor) {
						return;
					}

					var from = block.token.start;
					var to = block.token.end;
					modParams = modParams || block.modParams;

					//console.log(modParams);
					if (typeof(modParams) == "object") {
						//modParams = angular.toJson(modParams, 4);
						modParams = mdconf.jsonToMd(modParams);
					}

					editor.replaceRange(modParams + '\n', {line: from + 1, ch: 0}, {line: to - 1, ch: 0});
				}

				block.render = function(success, error) {
					var self = this;
					// 强制渲染
					if (self.$render && self.cmdName && self.wikimod && self.cmdName == self.wikimod.cmdName && 
							self.wikimod.mod && self.wikimod.mod.forceRender) {
						self.wikimod.mod.forceRender(self);
					}

					if (self.wikimod && !self.isChange) {
						success && success();
						return;
					}

					//console.log(self);
					function _render(mod) {
						if (!self.$render) {
							return;
						}

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
							console.log("加载模块" + block.cmdName + "失败");
							error && error();
						});
					}
				}
            }
        }
		// 模板匹配
		md.templateMatch = function(wikiBlock) {
			var modParams = wikiBlock.modParams;
			var pageinfo = app.ng_objects.$rootScope.pageinfo;

			// 临时页做全匹配
			if (!pageinfo) {
				return true;
			}

            var urlPrefix = "/" + pageinfo.username + "/" + pageinfo.sitename + "/";
            var tempUrl = pageinfo.url || pageinfo.pagepath || pageinfo.pagename;
			var pagePath = tempUrl.substring(urlPrefix.length);

			if (typeof(modParams) != "object" || !modParams.urlmatch || !modParams.urlmatch.text) {
				return true;
			}
			// 存在urlmatch 字段 做一个子串匹配
			if (pagePath && pagePath.indexOf(modParams.urlmatch.text) >= 0) {
				return true;
			}
			//console.log(pageinfo, pagePath, modParams);

			return false;
        }

        md.parse = function (text, theme) {
			theme = theme || "";
			text = theme + '\n' + text;
			themeLineCount = theme.split("\n").length;

            var tokenList = md.md.parse(text);
            var blockList = md.template.blockList;
			var template = undefined;
            for (var i = 0; i < tokenList.length; i++) {
                var token = tokenList[i];
				var block = blockList[i] || {};

				block.token = token;
				block.mdName = md.mdName;
				block.mode = md.mode;
				if (block.text != token.text) {
					block.text = token.text;
					block.isChange = true;
					md.parseBlock(block);
				} else {
					block.isChange = false;
				}
				block.token.start = block.token.start - themeLineCount;
				block.token.end = block.token.end - themeLineCount;
				blockList[i] = block;
				//console.log(blcok);
				if (md.use_template && block.isTemplate && md.templateMatch(block)) {
					template = block;
				}
            }

			var size = blockList.length;
			for (var i = tokenList.length; i < size; i++) {
				blockList.pop();
			}

			var templateText = md.template.text;
			//  预览模式不支持template
			if (md.mode != "preview" && template) {
				md.template.text = template.text;
				md.template.token = template.token;
				md.template.modName = template.modName;
				md.template.cmdName = template.cmdName;
				md.template.modParams = template.modParams;
				md.template.wikimod = template.wikimod;
				md.template.render = template.render;
				md.template.applyModParams = template.applyModParams;
				md.template.init = template.init;
			} else {
				md.template.text = undefined;
				md.template.token = undefined;
				md.template.modName = undefined;
				md.template.cmdName = undefined;
				md.template.modParams = undefined;
				md.template.wikimod = undefined;
				md.template.applyModParams = undefined;
				md.template.init = undefined;
				md.template.render = function(success){
					if (md.template.htmlContent != blankTemplateContent && md.template.$render) {
						md.template.htmlContent = blankTemplateContent;
						md.template.$render(blankTemplateContent);
					}
					success && success();
				};
			}
			if (templateText != md.template.text) {
				md.template.isChange = true;
			} else {
				md.template.isChange = false;
			}
			//console.log(blockList);
            return blockList;
        }

		md.cursorActivity = function(cm) {
			var pos = this.editor.getCursor();
			var blockList = this.getBlockList();
			var block = undefined, tmp = undefined;
			var moduleEditorParams = config.shareMap.moduleEditorParams;

			if (!moduleEditorParams) {
				return ;
			}

			for (var i = 0; i < blockList.length; i++) {
				tmp = blockList[i];
				if (pos.line >= tmp.token.start && pos.line < tmp.token.end) {
					block = tmp;
					break;
				}
			}
			if (!block || !block.isWikiBlock) {
				moduleEditorParams.setShowType("knowledge");
				return;
			}

			moduleEditorParams.setBlock(block);
		}

        return md;
    }

    return mdwiki;
})
