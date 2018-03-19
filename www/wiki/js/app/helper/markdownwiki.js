/**
 * Created by wuxiangan on 2016/12/28.
 */

define([
    'helper/util',
    'helper/dataSource',
    'helper/mdconf',
    'markdown-it',
    'highlight',
], function (util, dataSource, mdconf, markdownit, hljs) {
	var shortCmdMap = {
		"@mod":"@wiki/js/mod",
		"@toc":"@wiki/js/toc",
    }
    var mdwikiMap = {
        count: 0,    // markdownwiki 数量
    };

	config.mdwikiMap = mdwikiMap;
	var wikiBlockMap = {};

	function getWikiBlock(containerId) {
		wikiBlockMap[containerId] = wikiBlockMap[containerId] || {};
		return wikiBlockMap[containerId];
	}
    // 获得mdwiki
    function getMdwiki(mdwikiName) {
        mdwikiMap[mdwikiName] = mdwikiMap[mdwikiName] || {};
        return mdwikiMap[mdwikiName];
    }

    // 获得模块路径
    function getModPath(cmdName) {
        var wikiModulePath = config.wikiModPath;
        if (cmdName[cmdName.length - 1] == '/') {
            cmdName = cmdName.substring(0, cmdName.length - 1);
        }
		if (shortCmdMap[cmdName]) {
			cmdName = shortCmdMap[cmdName];
		}
        if (cmdName.indexOf('@') >= 0) {
            cmdName = adiShortCmdTranslate(cmdName);
            wikiModulePath += cmdName.replace('@', '');
        } else {
            wikiModulePath = cmdName;
        }
        wikiModulePath += (cmdName.lastIndexOf('/') > 0 ? ".js" : "/render.js"); // 当cmdName 为 @test 或/test  取该模块目录下的render.js文件
        return wikiModulePath;
    }

    /**
     * Translate shortCmd to full cmd for cmds which like @adi/js/project
     * input
     *      @project
     * output
     *      @adi/js/project
     */
    function adiShortCmdTranslate(cmd) {
        var result = cmd;
        if ( (/^\@[^\/]+$/.test(cmd)) ) {
            result = '@adi/js/' + cmd.replace(/^\@/,'');
        }
        return result;
    }

    // 默认渲染
    function defaultRender(wikiBlockObj, renderAfter) {
        var wikiModulePath = getModPath(wikiBlockObj.cmdName);
        require([wikiModulePath], function (module) {
			
			if (typeof module == "object"){
				if (!renderAfter && typeof(module.render) == "function") {
					wikiBlockObj.render(module.render(wikiBlockObj));
				}

				if (renderAfter && typeof(module.renderAfter) == "function") {
					module.renderAfter(wikiBlockObj);
				}
			} else {
                // console.log("wiki module define format error!!!");
            }
        }, function (err) {
            // console.log(err);
            // console.log(wikiBlockObj.cmdName + " wiki module not exist!!!");
        });
    };

    // 获得渲染函数
    function getRenderFunc(modName) {
        var render = config.getWikiModuleRender(modName);
        if (typeof render != "function") {
            render = defaultRender;
        }
        return render;
    }

    // 重写图片渲染
    function markdownit_wikicmd_link(md) {
        var defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
                return self.renderToken(tokens, idx, options);
            };

        md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
			var pageinfo = config.services.$rootScope.pageinfo;

			if (!pageinfo) {
				return defaultRender(tokens, idx, options, env, self);
			}

            var currentDataSource = dataSource.getDataSource(pageinfo.username,pageinfo.sitename);

			if (!currentDataSource) {
				return defaultRender(tokens, idx, options, env, self);
			}

            var token = tokens[idx], alt = token.content,
                srcIndex = token.attrIndex('href'),
                src = token.attrs[srcIndex][1] || '';
			
			if (src.indexOf("private_token=visitortoken") >=0 ) {
				token.attrs[srcIndex][1] = src.replace('private_token=visitortoken','private_token=' + currentDataSource.getToken());
			}
			
            tokens[idx].tag = 'wiki-link';

            return defaultRender(tokens, idx, options, env, self);
        };

        defaultRender = md.renderer.rules.link_close || function (tokens, idx, options, env, self) {
                return self.renderToken(tokens, idx, options);
            };
        md.renderer.rules.link_close = function (tokens, idx, options, env, self) {
            tokens[idx].tag = 'wiki-link';
            return defaultRender(tokens, idx, options, env, self);
        };
    }

    // 重写图片渲染
    function markdownit_wikicmd_iamge(md) {
        var defaultRender = md.renderer.rules.image;
        md.renderer.rules.image = function (tokens, idx, options, env, self) {
			var pageinfo = config.services.$rootScope.pageinfo;
			
			if (!pageinfo) {
				return defaultRender(tokens, idx, options, env, self);
			}

            var currentDataSource = dataSource.getDataSource(pageinfo.username,pageinfo.sitename);

			if (!currentDataSource) {
				return defaultRender(tokens, idx, options, env, self);
			}

            var token = tokens[idx], alt = token.content,
                srcIndex = token.attrIndex('src'),
                src = token.attrs[srcIndex][1] || '';

			if (src.indexOf("private_token=visitortoken") >=0 ) {
				token.attrs[srcIndex][1] = src.replace('private_token=visitortoken','private_token=' + currentDataSource.getToken());
			}
            // pass token to default renderer.
            return defaultRender(tokens, idx, options, env, self);
        }
    }

    // md 语法重写
    function markdownit_rule_override(md, mdwikiName) {
        //console.log(md.renderer.rules);
        markdownit_wikicmd_link(md, mdwikiName);
		markdownit_wikicmd_iamge(md, mdwikiName);
    }

    function preprocessInnerLink(text) {
        text = ' ' + text;
        var linkList = text.match(/[^\\](\[\[.*\]\])/g);
        if (linkList) {
            for (var i = 0; i < linkList.length; i++) {
                // 过长不做连接处理
                if (linkList[i].length > 1024)
                    continue;
                var content = linkList[i].substring(3, linkList[i].length - 2);
                var splitIndex = content.indexOf('|');
                var newContent = "";
                if (splitIndex > 0) {
                    newContent = linkList[i][0] + '[' + content.substring(0, splitIndex) + '](wikilink://' + content.substring(splitIndex + 1) + ')';
                } else {
                    newContent = linkList[i][0] + '[' + content + '](wikilink://' + content + ')';
                }
                text = text.replace(/[^\\](\[\[.*\]\])/, newContent);
            }
        }
        //console.log(text);
        return text.substring(1);
    }

    function preprocessLink(text) {
        var lines = text.split('\n');
        var codeBlock = false, codeLine = false;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            // 代码块
            if (/^\s*```/.test(line)) {
                codeBlock = !codeBlock;
                continue;
            }
            //
            if (codeBlock)
                continue;

            if (/^(\t|[ ]{4})/.test(line) && i > 0 && (codeLine || /^\s*$/.test(lines[i - 1]))) {
                codeLine = true;
                continue;
            }

            codeLine = false;
            lines[i] = preprocessInnerLink(line);
        }
        return lines.join('\n');
    }

    // preprocess md text
    function preprocessMDText(text) {
        var preprocessText = preprocessLink(text);
        return preprocessText;
    }

    // 渲染wiki block
    function renderWikiBlock(mdwiki, block) {
        var mdwikiContentContainerId = mdwiki.getMdWikiContentContainerId();
        var defaultTemplateContent = '<div id="' + mdwikiContentContainerId + '"></div>';
        var blockCache = block.blockCache;
        var wikiBlock = blockCache.wikiBlock;
        var render = getRenderFunc(wikiBlock.modName);
        var editor = mdwiki.editor;
		
        var wikiBlockParams = {
			blockCache:blockCache,
            modName: wikiBlock.modName,
            cmdName: wikiBlock.cmdName,
            modParams: wikiBlock.modParams,
            editorMode: mdwiki.options.editorMode,
			mode: mdwiki.mode,
			containerId: blockCache.containerId,
			blockList:mdwiki.blockList,
            isEditorEnable: function () {
                return mdwiki.options.editorMode;
            },
            isPageTemplate: block.isPageTemplate,   // 是页内模板则可编辑   wiki tempate block 使用此字段判断当前是否可以编辑
			content: block.isTemplate ? defaultTemplateContent : undefined, // 模板模块使用
            render: function (htmlContent) {
				var self = this;
                if (block.isTemplate) {
					var childrens = $("#" + mdwiki.getMdWikiContainerId()).children();
					for (var i = 0; i < childrens.length; i++){
						var temp = $(childrens[i]);
						//console.log(temp, typeof(temp));
						if (temp.attr("id") == mdwiki.getMdWikiTempContentContainerId()) {
							continue;
						}
						temp.remove();
					}
                    //$('#' + mdwiki.getMdWikiContentContainerId()).remove();  // 删除旧模板  插入新模板
                    $('#' + mdwiki.getMdWikiContainerId()).prepend('<div id="' + blockCache.containerId + '"></div>');
					//console.log($("#"+mdwiki.getMdWikiContainerId()));
                }
                htmlContent = '<span class="fake-icon add-before" ng-click="insertMod(\'before\')">+</span>'
                            +'<span class="fake-icon add-after" ng-click="insertMod(\'after\')">+</span>'
                            + htmlContent;
                util.html('#' + blockCache.containerId, htmlContent);

                blockCache.domNode = $('#' + blockCache.containerId);
				//console.log(self.selfLoadContent, block.isTemplate);
                if (block.isTemplate) {
					if (self.selfLoadContent) {
						self.loadContent = function() {
							setMdWikiContent(mdwiki);
						}
					} else {
						setMdWikiContent(mdwiki);
					}
                }

				//moduleEditorInit(blockCache.containerId, wikiBlockParams);
            },
            applyModParams: function (modParams) {
				var pos = blockCache.block.textPosition;
				//console.log(modParams);
                if (!modParams || !editor || !mdwiki.options.editorMode) {
                    return;
                }

                if (typeof(modParams) == "object") {
					//modParams = angular.toJson(modParams, 4);
					modParams = mdconf.jsonToMd(modParams);
                }
                var oldCursorPosition = editor.getCursor();
				//console.log(modParams, pos);
                editor.replaceRange(modParams + '\n', {line: pos.from + 1, ch: 0}, {
                    line: pos.to - 1,
                    ch: 0
                });
                editor.setCursor(oldCursorPosition);
            },

			formatModParams: function(key, datas, data, hideDefauleValue) {
				if (typeof(datas) != "object"){
					return undefined;
				}

				var self = this;
				var keywordMap = {
					"is_leaf":true,
					"order":true,
					"type":true,
					"editable":true,
					"is_card_show":true,
					"is_mod_hide":true,
					"require":true,
					"name":true,
					"list":true, // 针对列表 不处理
				}

				//console.log(datas);
				if (datas.is_leaf == true) {
					datas.type = datas.type || "text";
					data = data || {};
					if (datas.require) {
						for (var key in datas) {
							//if (keywordMap[key] || typeof(datas[key]) == "object") {
							if (keywordMap[key]) {
								continue;
							}
							data[key] = data[key] || datas[key];
						}
						if (datas.type == "list") {
							if (!angular.isArray(data.list)) {
								data.list = [];
							}
							for (var i = 0; i < datas.list.length; i++) {
								data.list[i] = self.formatModParams(key + '.list.' + i, datas.list[i], data.list[i]);
							}
						}
					}
					if (hideDefauleValue) {
						for (var key in datas) {
							if (keywordMap[key]) {
								continue;
							}
							if (typeof(key) != "object" && data[key] == datas[key]) {
								delete data[key];
							}
						}
						if (datas.type == "list") {
							// 列表不作默认隐藏
						}
					} else {
						//datas.is_show = data.is_show == undefined ? datas.editable : datas.is_show;
						//if (datas.is_show) {
							// 暂不支持单值 应都对象 因为至少存在 text, is_hide 两个值
							if (typeof(data) != "object")  {
								datas.value = data;
							} else {
								if (datas.type == "text") {
									datas.text = data.text;
								} else if (datas.type == "link") {
									datas.text = data.text;
									datas.href = data.href;
								} else if (datas.type == "list" || datas.type == "simple_list") {
									if (!angular.isArray(data.list)) {
										data.list = [];
									}
									for (var i = 0; i < data.list.length; i++) {
										datas.list[i] = datas.list[i] || angular.copy(datas.list[0]);
										self.formatModParams(key + ".list." + i, datas.list[i], data.list[i]);
									}
								} else {
									//datas = angular.merge(datas, data);
								}
								datas.is_card_show = data.is_card_show;
							}
						//}
						datas.id = util.getId();
						datas.data = data;
						datas.containerId = self.containerId;
						data.$kp_datas = datas;
						datas.$kp_key = key[0] == "." ? key.substring(1) : key;
					}
					return data;
				}

				if (typeof(datas) == "object") {
					if (angular.isArray(datas)) {
						if (!angular.isArray(data)) {
							data = [];
						}
						for (var i = 0; i < datas.length; i++) {
							data[i] = self.formatModParams(key + "." + i, datas[i], data[i],hideDefauleValue);
						}
					} else {
						if (angular.isArray(data) || typeof(data) != "object") {
							data = {};
						}
						for (var k in datas) {
							data[k] = self.formatModParams(key + "." + k, datas[k], data[k], hideDefauleValue);
						}
					}
				}
				return data;
            },

			init: function(obj) {
				var getSelf = function(obj){
					//console.log(obj);
					if (typeof(obj) == "string") {
						return getWikiBlock(obj);
					} else if (angular.isArray(obj) && obj.length > 0 && obj[0].$kp_datas && obj[0].$kp_datas.containerId) {
						return getWikiBlock(obj[0].$kp_datas.containerId);	
					} else if (angular.isObject(obj) && obj.$kp_datas && obj.$kp_datas.containerId){
						return getWikiBlock(obj.$kp_datas.containerId);
					}
					return undefined;
				}
				config.services.$rootScope.viewEditorClick = function(obj, $event) {
                    var isCodeView = moduleEditorParams && moduleEditorParams.show_type;
                    if (!isCodeView) {
                        return;
                    }
					var self = getSelf(obj);	
					if (!self || !self.blockCache) {
						return;
					}
					if ($event) {
                        $event.preventDefault();
						$event.stopPropagation();
					}
					moduleEditorParams.selectObj = obj && obj.$kp_datas;
					//console.log(obj);
					if (obj && obj.$kp_datas) {
						obj = obj.$kp_datas;
						var keys = obj.$kp_key && obj.$kp_key.split(".");
						if (keys && keys.length>1) {
							var root_obj = self.format_params_template;
							for (var i = 0; i < keys.length-1; i++) {
								if (angular.isArray(root_obj)) {
									root_obj = root_obj[parseInt(keys[i])];
								} else {
									root_obj = root_obj[keys[i]];
								}
							}
							if (!angular.isArray(root_obj)) {
								obj = root_obj;
							}
						} else {
							obj = self.format_params_template;
						}
					} else {
						obj = self.format_params_template;
                    }
					//console.log(self);
					moduleEditorParams.wikiBlockStartPost = self.blockCache.block.textPosition.from;
                    moduleEditorParams.wikiBlock = self;
                    moduleEditorParams.activeContainerId = self.containerId;
                    
                    $(".mod-container.active").removeClass("active");
					if (self.blockCache.domNode) {
						self.blockCache.domNode.addClass("active");
                    }
                    moduleEditorParams.setEditorObj(obj);
                    setFakeIconPosition();
					//console.log(params_template);
					// moduleEditorParams.is_show = true;
					moduleEditorParams.show_type = "editor";
					// $("#moduleEditorContainer").show();
                    var modToLine = self.blockCache.block.textPosition.to;
                    editor = editor || mdwiki.editor;
                    if (!editor) {
                        return;
                    }
                    editor.setCursor({
                        "line": modToLine-1,
                        "ch": 0
                    });
				};


				config.services.$rootScope.viewDesignClick = function(obj, $event) {
					var self = getSelf(obj);	
					var moduleEditorParams = config.shareMap.moduleEditorParams || {};
					//console.log(self);
					moduleEditorParams.wikiBlockStartPost = self.blockCache.block.textPosition.from;
					moduleEditorParams.wikiBlock = self;
					moduleEditorParams.is_show = true;
					moduleEditorParams.show_type = "design";
					moduleEditorParams.setDesignList();
					$("#moduleEditorContainer").show();

				}
			
				// {"scope":scope, style_list:[],  params_template:{}}
				if (!obj || !obj.scope) {
					return;
				}

				var self = this;
				var moduleEditorParams = config.shareMap.moduleEditorParams || {};
				self.scope = obj.scope;
				self.params_template = obj.params_template || {};
				self.styles = obj.styles || [];

				self.format_params_template = angular.copy(self.params_template);
				if (obj.params_template) {
					self.modParams = self.formatModParams("", self.format_params_template, self.modParams);
				}
				self.setEditorObj = moduleEditorParams.setEditorObj;
				self.setDesignList = moduleEditorParams.setDesignList;

				self.blockCache.adiObj = obj;
				obj.scope.params = self.modParams;
				//console.log(self.modParams);

				//console.log(self.modParams);

				if (!editor) {
					return;
				}

                //console.log(moduleEditorParams, self);
                var fakeIconDom = [];
                var setFakeIconPosition = function(){
                    fakeIconDom = fakeIconDom.length > 0 ? fakeIconDom : $(".mod-container.active .fake-icon");
                    if (fakeIconDom.length <= 0) {
                        setTimeout(function(){
                            setFakeIconPosition();
                        });
                        return;
                    }
                    var boxWidth = $("#preview").width();
                    var leftDistance = boxWidth/2;
                    var scaleSize = config.services.$rootScope.scaleSelect.scaleValue;
                    fakeIconDom.css({
                        "left" : leftDistance / scaleSize
                    });
                    fakeIconDom = [];
                }

				if (moduleEditorParams && moduleEditorParams.wikiBlockStartPost != undefined) {
					//var oldWikiBlock = moduleEditorParams.wikiBlock;
					//var oldPos = oldWikiBlock.blockCache.block.textPosition;
					var pos = self.blockCache.block.textPosition;
					if (moduleEditorParams.wikiBlockStartPost == pos.from) {
						if (moduleEditorParams.wikiBlock == undefined) {
							moduleEditorParams.wikiBlock = self;
							config.services.$rootScope.viewEditorClick(""+self.containerId+"");
						}
                        $("#" + self.containerId).addClass("active");
						moduleEditorParams.wikiBlock.blockCache.block.textPosition = self.blockCache.block.textPosition;
						if (moduleEditorParams.show_type == "design") {
							moduleEditorParams.wikiBlock = self;
							moduleEditorParams.updateEditorObj(self.format_params_template);
						}
                        // console.log("更新wikiblock", moduleEditorParams);
					}
                }
                
                setFakeIconPosition();

				var containerId = "#" + self.containerId;
				if (!self.blockCache.block.isTemplate) {
                    var modContainer = $(containerId);
					var $rootScope = config.services.$rootScope;
                    modContainer.on("click", function (e) {
						if (self.blockCache.block.isTemplate && !self.blockCache.block.isPageTemplate) {
							//config.services.$rootScope.viewEditorClick(""+self.containerId+"");
							var pageinfo = $rootScope.pageinfo;
							var urlObj = {username: pageinfo.username, sitename:pageinfo.sitename, pagename:"_theme"};
							$rootScope.$broadcast('changeEditorPage', urlObj);
							return;
						}
                        $(".mod-container.active").removeClass("active");
                        modContainer.addClass("active");
                        config.services.$rootScope.viewEditorClick(""+self.containerId+"");
                        util.$apply();
                    });
				}
			},
        };
		blockCache.wikiBlockParams = wikiBlockParams;
		wikiBlockMap[wikiBlockParams.containerId] = wikiBlockParams;
        render(wikiBlockParams);
		// 渲染后回调
		defaultRender(wikiBlockParams, true);
    };

    // 设置模板内容
    function setMdWikiContent(mdwiki) {

        // >>>>>>>>>>>>>>>>>>>>>>>> Render >>>>>>>>>>>>>>>>>>>>>>>>

        var blockList = mdwiki.blockList;
        var container = '#' + mdwiki.getMdWikiContainerId();
        var selector = '#' + mdwiki.getMdWikiContentContainerId();
        var tempSelector = '#' + mdwiki.getMdWikiTempContentContainerId();

		//console.log($(selector), $(tempSelector), blockList);
        if (!$(selector).length) {
            $(container).prepend('<div id="' + mdwiki.getMdWikiContentContainerId() + '"></div>');
        }

        var start = 0;
        for (var i = 0; i < blockList.length; i++) {
            var block = blockList[i];

            //block.isTemplate means modName looks like @template
            if (block.isTemplate) {
                if (block.isPageTemplate) {
					for (var j = start; j < block.textPosition.from; j++) {
						$(selector).append('<br/>');
					}
                }
				start = block.textPosition.to + 1;
				$(selector).append("<div></div>");
                continue;
            }

            // What's this for? add some br???
            for (var j = start; j < block.textPosition.from; j++) {
                $(selector).append('<br/>');
            }
            start = block.textPosition.to + 1;


            // >>>>>>>>>>>>>>>>>>>>>>>> Render Mods >>>>>>>>>>>>>>>>>>>>>>>> 
            // >>>>>>>>>>>>>>>>>>>>>>>> This is real important >>>>>>>>>>>>>
            var blockCache = block.blockCache;
            
            // cached block will go here
            if (blockCache.domNode) {
                // most mods render will come here
                blockCache.block.textPosition = block.textPosition;
                $(selector).append(blockCache.domNode);

                if (blockCache.isWikiBlock && blockCache.newWikiBlock) {
                    $.extend(true, blockCache.wikiBlock, blockCache.newWikiBlock);
                    //notice $scope in wikiBlock

                    try {
                        blockCache.adiObj && blockCache.adiObj.scope && blockCache.adiObj.scope.onParamsChange && blockCache.adiObj.scope.onParamsChange();
                    } catch(e) {}

                    // console.log(blockCache);
                    delete blockCache.newWikiBlock;
                }

                continue;
            }

            // most original markdown render results will come here
            $(selector).append(blockCache.htmlContent);
            blockCache.domNode = $('#' + blockCache.containerId);

            // the first block rendered block will go here, 
            if (blockCache.isWikiBlock) {
                // console.log('blockCache without cachedDom', blockCache);
                //console.log("load and render block");
                renderWikiBlock(mdwiki, block);
            } else {
                util.html('#' + blockCache.containerId, blockCache.renderContent);
            }
        }
        $(tempSelector).empty();
        //console.log($(selector), $(tempSelector), blockList);
        util.$apply();

		mdwiki.renderAfterCallback();
    }

    function isExistTemplate(mdwiki, text) {
        var tokenList = mdwiki.md.parse(text, {});
        var wikiCmdRE = /^\s*([\/@][\w_\/]+)/;
        var wikiModNameRE = /^[\/@]+([\w_]+)/;
        for (var i = 0; i < tokenList.length; i++) {
            var token = tokenList[i];
            if (token.type == "fence" && token.tag == "code" && /^\s*([\/@][\w_\/]+)/.test(token.info)){
                var cmdname = token.info.match(wikiCmdRE)[1];
                var modName = cmdname.match(wikiModNameRE)[1];
                if (modName == "template") {
                    return true;
                }
            }
        }
        return false;
    }

    // mdwiki render
    // the critical part of the render
    /**
     * 
     * @param {* It's for getting the unique mdwiki object} mdwikiName 
     * @param {* It's the current content of the editor} text 
     */
    window.mdwikiRender = function (mdwikiName, text) {
        // 备份节点信息
        text = decodeURI(text);
        var mdwiki = getMdwiki(mdwikiName);

        // this is the selector for temp
        var tempSelector = '#' + mdwiki.getMdWikiTempContentContainerId();

        // this is the selector for the contentContainer
        var selector = '#' + mdwiki.getMdWikiContentContainerId();

        // emtpy the temp first
        $(tempSelector).empty();

        // save all the content in temp div
        $(tempSelector).append($(selector).children());

        // the siteinfo
        var siteinfo = util.getAngularServices().$rootScope.siteinfo;

        // the pageinfo
        var pageinfo = util.getAngularServices().$rootScope.pageinfo;

        // the tplinfo
        var tplinfo = util.getAngularServices().$rootScope.tplinfo;

        // what the fuck is the existTemplate, it's never used
        var existTemplate = isExistTemplate(mdwiki, text);

        // this is the line count of the theme( if we can use ), which is used as prefix.
        mdwiki.templateLineCount = 0;
        mdwiki.template = {};

        // the real render funciton, the most most critical things
        var _render = function () {

            // get the blockList, blockCache is about here
            var blockList = mdwiki.parse(text);   // 会对 mdwikiObj.template 赋值
            //console.log(text, mdwiki.template, mdwikiName);
            
            // update the textPosition by templateLineCount
            for (var i = 0; i < blockList.length; i++) {
                blockList[i].textPosition.from = blockList[i].textPosition.from - mdwiki.templateLineCount;
                blockList[i].textPosition.to = blockList[i].textPosition.to - mdwiki.templateLineCount;
            }

            // about template, what's this?
			if (mdwiki.template) {
				if (mdwiki.template.textPosition && mdwiki.template.textPosition.from < 0) {
					mdwiki.template.isPageTemplate = false;
				} else {
					mdwiki.template.isPageTemplate = true;
				}
			}

            if (!mdwiki.template || !mdwiki.template.blockCache || mdwiki.template.blockCache.domNode) {// 模板不存在 且默认模板也不存在 模板未改动
                setMdWikiContent(mdwiki);
                return;
            }

            renderWikiBlock(mdwiki, mdwiki.template);
        };

        // 不存在内嵌模板 外置模板存在  页面允许使用外置模板
        //if (!existTemplate && tplinfo && pageinfo && pageinfo.pagename && pageinfo.pagename[0] != "_" && mdwiki.options.use_template) {

        // if we can use theme( template ), get the theme content and combine the info to render
		if (pageinfo && pageinfo.pagename && pageinfo.pagename[0] != "_" && mdwiki.options.use_template) {
            var currentDataSource = dataSource.getDataSource(pageinfo.username,pageinfo.sitename);
			if (currentDataSource) {
                // get theme content
				currentDataSource.getRawContent({path:'/' + pageinfo.username + '/' + pageinfo.sitename + '/_theme' + config.pageSuffixName, isShowLoading:false}, function (content) {
                    //console.log(content);
                    
                    // get the content, anc combine it with original text, put it in front of the file.
					content = content || "";
					text = content + '\n' + text;
					mdwiki.templateLineCount = content.split('\n').length;
					_render();
				}, function () {
					_render();
				})
			} else {
				_render();
			}
        } else {
            _render();
        }
    }

    // 新建mdwiki编辑器
    // mdwiki, this is the very important part, render is here
    function markdownwiki(options) {

        // mdwikiName is unique in memory
        var mdwikiName = "mdwiki_" + mdwikiMap.count++;

        // config options
        options = options || {};

        // Enable HTML tags in source
        options.html = options.html == null ? true : options.html;
        // Autoconvert URL-like text to links
        options.linkify = options.linkify == null ? true : options.linkify;
        // Enable some language-neutral replacement + quotes beautification
        options.typographer = options.typographer == null ? true : options.typographer;
        // Convert '\n' in paragraphs into <br>
        options.breaks = options.breaks == null ? true : options.breaks;
        // 是否使用模板
        options.use_template = options.use_template == null ? true : options.use_template;
        //console.log("use_template:", options.use_template);

        // code block highlighter
        if (options.highlight == null) {
            options.highlight = function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(lang, str, true).value;
                    } catch (__) {
                    }
                }
                return ''; // use external default escaping
            };
        }

        // private : internal markdown it renderer.
        //var md = markdownit(options).use(markdownit_wikicmd_plugin);
        var md = markdownit(options);

        // override original md
        markdownit_rule_override(md, mdwikiName);
        //console.log(md.renderer.rules);

        // the mdwiki is an empty object or a cached object with mdwikiName
        var mdwiki = getMdwiki(mdwikiName);
        mdwiki.editorMode = options.editorMode;
		mdwiki.mode = options.mode || "normal";
        
        // this is the original md object
        mdwiki.md = md;

        // the unique mdwikiName with a unique id
        mdwiki.mdwikiName = mdwikiName;

        // renderCount, what's this for?
        mdwiki.renderCount = 0;

        // this is the blockId for blockList
        mdwiki.blockId = 0; // 块id自增

        // options
        mdwiki.options = options;

        // blockCacheMap for caching with text, but it should not be text?
        mdwiki.blockCacheMap = {};

        // isMainMd, will be true in wikiEditorController
        mdwiki.isMainMd = options.isMainMd;
        
        // callbacks
		mdwiki.renderAfterCBMap = {
			//"$anchorScroll": config.services.$anchorScroll,
		};

        // if it's for wikiEditor, share it in public
		if (mdwiki.isMainMd) {
            // config.shareMap is public
			config.shareMap["mdwiki"] = mdwiki;
		}

        // container_selector is target Container selector for rendering
        if (options.container_selector) {
            mdwiki.bindRenderContainer(options.container_selector);
        }

		mdwiki.registerRenderAfterCallback = function(name, fn) {
			this.renderAfterCBMap[name] = fn;
		};
		
		mdwiki.renderAfterCallback = function() {
			for (var key in this.renderAfterCBMap) {
				var fn = this.renderAfterCBMap[key];
				fn && fn();
			}
		};

        mdwiki.enableEditor = function () {
            mdwiki.editorMode = true;
        };

        mdwiki.disableEditor = function () {
            mdwiki.editorMode = false;
        };

        mdwiki.isEditor = function () {
            return mdwiki.editorMode;
        };

        // 获取原生markdown
        mdwiki.getMarkdown = function () {
            return md;
        };

		mdwiki.cursorActivity = function(cm) {
			var cur_line = mdwiki.editor.getCursor().line;
			var blockList = mdwiki.blockList || [], curBlock = undefined;
			for (var i = 0; i < blockList.length; i++) {
				var block = blockList[i];
				if (cur_line >= block.textPosition.from && cur_line < block.textPosition.to) {
					curBlock = block;
					break;
				}
			}
			if (curBlock && curBlock.blockCache.isWikiBlock) {
                var moduleEditorParams = config.shareMap.moduleEditorParams || {};
                var moduleContainerId = moduleEditorParams.activeContainerId;
                var curContainerId = curBlock.blockCache.containerId;
                var isContainerIdChange = (moduleContainerId != curContainerId);
                if (!isContainerIdChange) {
                    return;
                }
				// wiki mod todo
				if (curBlock && curBlock.blockCache && curBlock.blockCache.wikiBlockParams &&
						curBlock.blockCache.wikiBlockParams.scope) {

					curBlock.blockCache.wikiBlockParams.scope.viewEditorClick(curBlock.blockCache.containerId);	
				}

			} else {
                // console.log(cm);
                // 非wiki mod todo
                var moduleEditorParams = config.shareMap.moduleEditorParams || {};
                moduleEditorParams.activeContainerId = "";
                moduleEditorParams.show_type = "knowledge";
                // console.log("markwnwiki---line 838");
				moduleEditorParams.setKnowledge("");
				util.$apply();
			}
			//console.log(cur_line);
			//console.log(mdwiki.blockList);
		}
        // force render a given text
        mdwiki.render = function (text) {
            text = encodeURI(text);
            if (mdwiki.mdwikiContainerSelector) {

                // window.mdwikiRender is the most important part
                mdwikiRender(mdwikiName, text);
                return;
            }

            // shit, the codes below never executed.
            mdwiki.clearBlockCache();
            var mdwikiContainerId = mdwiki.getMdWikiContainerId();
            var mdwikiContentContainerId = mdwiki.getMdWikiContentContainerId();
            var mdwikiTempContentContainerId = mdwiki.getMdWikiTempContentContainerId();
            //var htmlContent = '<div style="margin: 0px 10px" id="' + mdwikiContainerId + '"><div id="' + mdwikiContentContainerId + '"></div><div id="' + mdwikiTempContentContainerId + '"></div></div>';
			var tplheaderContent = '<tplheader data-mdwikiname="' + mdwiki.mdwikiName + '"></tplheader>';
            var htmlContent = '<div class="wikiEditor" id="' + mdwikiContainerId + '"><div id="' + mdwikiContentContainerId + '"></div><div id="' + mdwikiTempContentContainerId + '"></div></div>';
            var scriptContent = '<script>mdwikiRender("' + mdwikiName + '","' + text + '")</script>';
            return htmlContent + scriptContent;
        }


        /**
            the selector is .result-html usually. 
            check the codes in wikiEditorController
            mdwiki.bindRenderContainer(".result-html", ".tpl-header-container");
         */
        mdwiki.bindRenderContainer = function (
            selector, /* .result-html */
            tplSelector 
        ) {
            // console.error('mdwiki.bindRenderContainer: ', selector, tplSelector);
            tplSelector = tplSelector || ".tpl-header-container";

            mdwiki.mdwikiContainerSelector = selector;

            // containerId is related with mdwiki mdwikiName
            var mdwikiContainerId = mdwiki.getMdWikiContainerId();

            // containerContainerId is the container_container with mdwikiName
            var mdwikiContentContainerId = mdwiki.getMdWikiContentContainerId();

            // containerContainerId with temp_ as prefix
            var mdwikiTempContentContainerId = mdwiki.getMdWikiTempContentContainerId();
            //var htmlContent = '<div style="margin: 0px 10px" id="' + mdwikiContainerId + '"><div id="' + mdwikiContentContainerId + '"></div><div id="' + mdwikiTempContentContainerId + '"></div></div>';
            
            // tplheaderContent, which is for layout
            var tplheaderContent = '<tplheader data-mdwikiname="' + mdwiki.mdwikiName + '"></tplheader>';
        
            // htmlContent is thing which likes the following html
            // <div class="result-html">
            //     <div class="wikiEditor" id="_mdwiki_container_mdwiki_2">
            //         <div id="_mdwiki_content_container_mdwiki_2">
            //              ... the rendered results will be put in here ...
            //         </div>
            //         <div id="_mdwiki_temp_content_container_mdwiki_2"></div>
            //     </div>
            // </div>
			var htmlContent = '<div class="wikiEditor" id="' + mdwikiContainerId + '">' + '<div id="' + mdwikiContentContainerId + '"></div><div id="' + mdwikiTempContentContainerId + '"></div></div>';

            // clear the cached using block in blockList
            mdwiki.clearBlockCache();
            //$(selector).html(htmlContent);

            // insert htmlContent in .result-html
            util.html(selector, htmlContent);

            // inset layout controller in .tpl-header-container
            util.html(tplSelector, tplheaderContent);
        }

        mdwiki.getMdWikiContainerId = function () {
            return "_mdwiki_container_" + mdwikiName;// + "_" + mdwiki.renderCount;
        }
        mdwiki.getMdWikiContentContainerId = function () {
            return "_mdwiki_content_container_" + mdwikiName;// + "_" + mdwiki.renderCount;
        }
        mdwiki.getMdWikiTempContentContainerId = function () {
            return "_mdwiki_temp_content_container_" + mdwikiName;// + "_" + mdwiki.renderCount;
        }

        mdwiki.setEditor = function (editor) {
            mdwiki.editor = editor;
        }

        /**
         * @param {*} token 
         * return wikiBlock {
                modName: modName,
                cmdName: cmdname,
                modParams: modParams, //all the info for the view controller 
            }
         */
        mdwiki.parseWikiBlock = function (token) {
            var wikiCmdRE = /^\s*([\/@][\w_\/]+)/;
            var wikiModNameRE = /^[\/@]+([\w_]+)/;
            var cmdname = token.info.match(wikiCmdRE)[1];
            var modName = cmdname.match(wikiModNameRE)[1];
            var modParams = undefined;

            try {
                modParams = angular.fromJson(token.content)
            }
            catch (e) {
				//var params = mdconf.toJson(token.content).params;

                //this is the core part, convert mdToJson
				var params = mdconf.mdToJson(token.content);
                modParams = params || token.content;
            }

            var wikiBlock = {
                modName: modName,
                cmdName: cmdname,
                modParams: modParams,
            }

            // 模板信息
            // isTemplate means modName equals to @template
            if (modName == "template") {
                wikiBlock.isTemplate = true;
            }
            return wikiBlock;
        }

        /**
         * @param {*} text it sould be the text for one rendered block
         * @param {*} token token is from the tokenList, mk.parse(text) => tokenList
         */
        mdwiki.getBlockCache = function (text, token) {
            var idx = "wikiblock_" + mdwikiName + "_" + mdwiki.renderCount + '_' + mdwiki.blockId++;
            //isWikiBlock: something like ```@project ```
            var isWikiBlock = token.type == "fence" && token.tag == "code" && /^\s*([\/@][\w_\/]+)/.test(token.info);

            //new rendered view container div
            var htmlContent = '<div id="' + idx + '"' + '></div>';

            //generate cacheKey
            var cacheKey = isWikiBlock ? token.info : text;
            var blockCacheList = mdwiki.blockCacheMap[cacheKey];

            // try to pick unused cache part and return
            var blockCache = blockCacheList && blockCacheList.filter(function(blockCache) {
                return blockCache.domNode && !blockCache.isUsing;
            })[0];

            // if find any cached block, use it and return;
            if (blockCache) {
                if (isWikiBlock && blockCache.text != text) {
					blockCache.text = text;
                    blockCache.newWikiBlock = mdwiki.parseWikiBlock(token);
                }
                return (blockCache.isUsing = true, blockCache);
            }

            // create new blockCache, if not found
            blockCache = {
                text: text,
                containerId: idx, //containerId is uid for the container div which contains rendered block
                htmlContent: htmlContent,
                renderContent: mdwiki.md.render(text),
                isUsing: true,
                isWikiBlock: isWikiBlock,
                wikiBlock: undefined,
            }

            //special handle for h1 h2 h3 h4 h5 h6, add a link for h* title
			if (/^[hH][1-6]$/.test(token.tag)) {
                var title = text.replace(/^[ ]*[#]*[ ]*/,"");
				var tag = token.tag;
				title = title.replace(/[\r\n]*$/,"");
				blockCache.renderContent = '<div class="wiki_page_inner_link"><a class="glyphicon glyphicon-link" name="' + title + '" href="#/#' + title + '"></a>'+ blockCache.renderContent + '</div>';
			}

            //special handle for mod
            if (isWikiBlock) {
                // wikiBlock actually is parsed data info in mod block
                // cmdName, modName, modParams: all the info parsed from the block of text, which will be rendered
                var wikiBlock = mdwiki.parseWikiBlock(token);
                blockCache.isTemplate = wikiBlock.isTemplate;
                blockCache.htmlContent = '<div id="' + idx + '"' + ' class="mod-container"' +'></div>';
                blockCache.wikiBlock = wikiBlock;
            }

            mdwiki.blockCacheMap[cacheKey] = mdwiki.blockCacheMap[cacheKey] || [];
            mdwiki.blockCacheMap[cacheKey].push(blockCache);

            return blockCache;
        }

        mdwiki.clearBlockCache = function () {
            // check every cache by key, actually, the key is the text string now
            for (key in mdwiki.blockCacheMap) {

                // the blockCacheList with the string
                var blockCacheList = mdwiki.blockCacheMap[key];

                // some BlockCache can be preserved, save it in newBlockCacheList
                var newBlockCacheList = [];
                for (var i = 0; blockCacheList && i < blockCacheList.length; i++) {
                    var blockCache = blockCacheList[i];

                    // if blockCache is not used, preserve it.
                    if (blockCache.isUsing) {
                        blockCache.isUsing = false;   // 将使用状态改为未使用状态 下次未使用则删除
                        newBlockCacheList.push(blockCache);
                    } else {
                        blockCache.domNode && blockCache.domNode.remove();
                    }
                }

                // save some preserved blockCache
                if (newBlockCacheList.length > 0) {
                    mdwiki.blockCacheMap[key] = newBlockCacheList;
                } else {

                    // remove empty list
                    delete mdwiki.blockCacheMap[key];
                }
            }
        }

		// 模板匹配
		mdwiki.templateMatch = function(wikiBlock) {
			var modParams = wikiBlock.modParams;
			var pageinfo = util.getAngularServices().$rootScope.pageinfo;

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

        /**
         * this is for handle _open & _close type of token, they often appear as paired tokens.
         * heading (h1, h2, h3, h4, h5, ... ), table ... is often affected.
         */
        function getCombinedTokenListByMarkdownText(text) {
            var tokenList = md.parse(text, {});
            var resultTokenList = [];
            var stack = 0;

            var tempToken = {};
            tokenList.forEach(function(token) {
                token.type.indexOf('_open') >= 0 && (stack++);
                token.type.indexOf('_close') >= 0 && (stack--);
    
                //store and retrieve last avaliable .tag and .map
                if (stack == 1) {
                    tempToken.map = token.map || tempToken.map;
                }

                if (stack == 0) {
                    token.map = token.map || tempToken.map;
                    !stack && resultTokenList.push(token);
                }
            });
            // console.log('getCombinedTokenListByMarkdownText: ', tokenList, resultTokenList);
            return resultTokenList;
        }

        /**
         * convert text into blockList,
         * blockList contain domNode or htmlContent,
         * domNode & htmlContent are used for render
         * they may use cache
         * 
         * check mdwikiRender & _render to learn them
         * 
         * @param {*} text It sould be editor content normaly
         */
        mdwiki.parse = function (text) {
            var textLineList = text.split('\n');
            var tokenList = getCombinedTokenListByMarkdownText(text);

            var blockList = tokenList.map(function(token) {
                var block = {
                    tag: token.tag,
                    textPosition: {
                        from: token.map[0],
                        to: token.map[1]
                    },
                    content: '',
                    htmlContent: ''
                };


                block.content = textLineList.filter(function(line, index) {
                    return index >= block.textPosition.from && index < block.textPosition.to;
                }).join('\n') + '\n';

                block.blockCache = mdwiki.getBlockCache(block.content, token);

                block.blockCache.block = block;
                block.isTemplate = block.blockCache.isTemplate;
                if (mdwiki.options.use_template && block.blockCache.isTemplate && mdwiki.templateMatch(block.blockCache.wikiBlock)) {
                    mdwiki.template = block;
                }

                return block;
            });

            mdwiki.clearBlockCache();
            mdwiki.blockList = blockList;
            return blockList;
        }

        return mdwiki;
    }

    return markdownwiki;
});
