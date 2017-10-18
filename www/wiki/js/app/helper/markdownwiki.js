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
		"@include":"@wiki/js/include",
		"@mod":"@wiki/js/mod",
		"@toc":"@wiki/js/toc",
	}
    var mdwikiMap = {
        count: 0,    // markdownwiki 数量
    };

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
            wikiModulePath += cmdName.replace('@', '');
        } else {
            wikiModulePath = cmdName;
        }
        wikiModulePath += (cmdName.lastIndexOf('/') > 0 ? ".js" : "/render.js"); // 当cmdName 为 @test 或/test  取该模块目录下的render.js文件

        return wikiModulePath;
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
                console.log("wiki module define format error!!!");
            }
        }, function (err) {
            console.log(err);
            console.log(wikiBlockObj.cmdName + " wiki module not exist!!!");
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
        var pos = block.textPosition;

        var wikiBlockParams = {
            modName: wikiBlock.modName,
            cmdName: wikiBlock.cmdName,
            modParams: wikiBlock.modParams,
            editorMode: mdwiki.options.editorMode,
			containerId: blockCache.containerId,
			blockList:mdwiki.blockList,
            isEditorEnable: function () {
                return mdwiki.options.editorMode;
            },
            isPageTemplate: block.isPageTemplate,   // 是页内模板则可编辑   wiki tempate block 使用此字段判断当前是否可以编辑
			content: block.isTemplate ? defaultTemplateContent : undefined, // 模板模块使用
            render: function (htmlContent) {
                if (block.isTemplate) {
                    $('#' + mdwiki.getMdWikiContentContainerId()).remove();  // 删除旧模板  插入新模板
                    $('#' + mdwiki.getMdWikiContainerId()).prepend('<div id="' + blockCache.containerId + '"></div>');
                }
                util.html('#' + blockCache.containerId, htmlContent);
                blockCache.domNode = $('#' + blockCache.containerId);
                if (block.isTemplate) {
                    setMdWikiContent(mdwiki);
                }
            },
            applyModParams: function (modParams) {
                //console.log(modParams);
                if (!modParams || !editor || !mdwiki.options.editorMode) {
                    return;
                }

                if (typeof(modParams) == "object") {
                    modParams = angular.toJson(modParams, 4);
                }
                editor.replaceRange(modParams + '\n', {line: pos.from + 1, ch: 0}, {
                    line: pos.to - 1,
                    ch: 0
                });
            }
        };
        render(wikiBlockParams);
		// 渲染后回调
		defaultRender(wikiBlockParams, true);
    };

    // 设置模板内容
    function setMdWikiContent(mdwiki) {
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
            if (block.isTemplate) {
                if (block.isPageTemplate) {
					for (var j = start; j < block.textPosition.from; j++) {
						$(selector).append('<br/>');
					}
					start = block.textPosition.to + 1;
                    $(selector).append("<div></div>");
                }
                continue;
            }

            for (var j = start; j < block.textPosition.from; j++) {
                $(selector).append('<br/>');
            }
            start = block.textPosition.to + 1;

            var blockCache = block.blockCache;
            //console.log(blockCache);
            if (blockCache.domNode) {
                $(selector).append(blockCache.domNode);
                continue;
            }

            $(selector).append(blockCache.htmlContent);
            blockCache.domNode = $('#' + blockCache.containerId);

            //console.log("render block:", blockCache);
            if (blockCache.isWikiBlock) {
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
    window.mdwikiRender = function (mdwikiName, text) {
        // 备份节点信息
        text = decodeURI(text);
        var mdwiki = getMdwiki(mdwikiName);
        var tempSelector = '#' + mdwiki.getMdWikiTempContentContainerId();
        var selector = '#' + mdwiki.getMdWikiContentContainerId();
        $(tempSelector).empty();
        $(tempSelector).append($(selector).children());

        var siteinfo = util.getAngularServices().$rootScope.siteinfo;
        var pageinfo = util.getAngularServices().$rootScope.pageinfo;
        var tplinfo = util.getAngularServices().$rootScope.tplinfo;
        var existTemplate = isExistTemplate(mdwiki, text);
        mdwiki.templateLineCount = 0;
        mdwiki.template = undefined;

        var _render = function () {
            var blockList = mdwiki.parse(text);   // 会对 mdwikiObj.template 赋值
            for (var i = 0; i < blockList.length; i++) {
                blockList[i].textPosition.from = blockList[i].textPosition.from - mdwiki.templateLineCount;
                blockList[i].textPosition.to = blockList[i].textPosition.to - mdwiki.templateLineCount;
            }

            if (mdwiki.template) {
                if (mdwiki.templateLineCount) {
                    mdwiki.template.isPageTemplate = false;
                } else {
                    mdwiki.template.isPageTemplate = true;
                }
            }

            if (!mdwiki.template || mdwiki.template.blockCache.domNode) {// 模板不存在 且默认模板也不存在
                setMdWikiContent(mdwiki);
                return;
            }

            renderWikiBlock(mdwiki, mdwiki.template);
        };

        // 不存在内嵌模板 外置模板存在  页面允许使用外置模板
        if (!existTemplate && tplinfo && pageinfo && pageinfo.pagename && pageinfo.pagename[0] != "_" && mdwiki.options.use_template) {
            var currentDataSource = dataSource.getDataSource(pageinfo.username,pageinfo.sitename);
			if (currentDataSource) {
				currentDataSource.getRawContent({path:'/' + pageinfo.username + '/' + pageinfo.sitename + '/_theme' + config.pageSuffixName, isShowLoading:false}, function (content) {
						//console.log(content);
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
    function markdownwiki(options) {
        var mdwikiName = "mdwiki_" + mdwikiMap.count++;

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
        markdownit_rule_override(md, mdwikiName);
        //console.log(md.renderer.rules);

        var mdwiki = getMdwiki(mdwikiName);
        mdwiki.editorMode = options.editorMode;
        mdwiki.md = md;
        mdwiki.mdwikiName = mdwikiName;
        mdwiki.renderCount = 0;
        mdwiki.blockId = 0; // 块id自增
        mdwiki.options = options;
        mdwiki.blockCacheMap = {};
		mdwiki.isMainMd = options.isMainMd;
		mdwiki.renderAfterCBMap = {
			//"$anchorScroll": config.services.$anchorScroll,
		};

		if (mdwiki.isMainMd) {
			config.shareMap["mdwiki"] = mdwiki;
		}

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

        // force render a given text
        mdwiki.render = function (text) {
            text = encodeURI(text);
            if (mdwiki.mdwikiContainerSelector) {
                mdwikiRender(mdwikiName, text);
                return;
            }

            mdwiki.clearBlockCache();
            var mdwikiContainerId = mdwiki.getMdWikiContainerId();
            var mdwikiContentContainerId = mdwiki.getMdWikiContentContainerId();
            var mdwikiTempContentContainerId = mdwiki.getMdWikiTempContentContainerId();
            //var htmlContent = '<div style="margin: 0px 10px" id="' + mdwikiContainerId + '"><div id="' + mdwikiContentContainerId + '"></div><div id="' + mdwikiTempContentContainerId + '"></div></div>';
            var htmlContent = '<div class="wikiEditor" id="' + mdwikiContainerId + '"><div id="' + mdwikiContentContainerId + '"></div><div id="' + mdwikiTempContentContainerId + '"></div></div>';
            var scriptContent = '<script>mdwikiRender("' + mdwikiName + '","' + text + '")</script>';
            return htmlContent + scriptContent;
        }

        mdwiki.bindRenderContainer = function (selector) {
            mdwiki.mdwikiContainerSelector = selector;
            var mdwikiContainerId = mdwiki.getMdWikiContainerId();
            var mdwikiContentContainerId = mdwiki.getMdWikiContentContainerId();
            var mdwikiTempContentContainerId = mdwiki.getMdWikiTempContentContainerId();
            //var htmlContent = '<div style="margin: 0px 10px" id="' + mdwikiContainerId + '"><div id="' + mdwikiContentContainerId + '"></div><div id="' + mdwikiTempContentContainerId + '"></div></div>';
            var htmlContent = '<div class="wikiEditor" id="' + mdwikiContainerId + '"><div id="' + mdwikiContentContainerId + '"></div><div id="' + mdwikiTempContentContainerId + '"></div></div>';
            mdwiki.clearBlockCache();
            $(selector).html(htmlContent);
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
				var params = mdconf.toJson(token.content).params;

                modParams = params || token.content;
            }

            var wikiBlock = {
                modName: modName,
                cmdName: cmdname,
                modParams: modParams,
            }

            // 模板信息
            if (modName == "template") {
                wikiBlock.isTemplate = true;
            }
            return wikiBlock;
        }
        mdwiki.getBlockCache = function (text, token) {
			var isWikiBlock = token.type == "fence" && token.tag == "code" && /^\s*([\/@][\w_\/]+)/.test(token.info);
            var idx = "wikiblock_" + mdwikiName + "_" + mdwiki.renderCount + '_' + mdwiki.blockId++;
            //var htmlContent = '<div id="' + idx + '"' + ((token.type == "html_block" || !mdwiki.editorMode) ? '' : '  contenteditable="true"') + '></div>';
            var htmlContent = '<div id="' + idx + '"' + ((token.type == "html_block" || !mdwiki.editorMode) ? '' : '  contenteditable="false"') + '></div>';
            var blockCache = undefined;

			//console.log(token);
			if (!isWikiBlock && token.type != "html_block") {
				//htmlContent = '<div class="markdown-body" id="' + idx + '"' + ((token.type == "html_block" || !mdwiki.editorMode) ? '' : '  contenteditable="false"') + '></div>';
			}
            //console.log(token);
            var blockCacheList = mdwiki.blockCacheMap[text];
            for (var i = 0; blockCacheList && i < blockCacheList.length; i++) {
                blockCache = blockCacheList[i];
                if (!blockCache.domNode) {
                    continue;
                }
                if (!blockCache.isUsing) {  // 返回一个未被使用缓存块
                    blockCache.isUsing = true;
                    return blockCache;
                }
            }

            // 创建缓存对象
            blockCache = {
                containerId: idx,
                htmlContent: htmlContent,
                renderContent: mdwiki.md.render(text),
                isUsing: true,
                isWikiBlock: false,
                wikiBlock: undefined,
            }
			// console.log(text, token, blockCache.renderContent);
			if (/^[hH][1-6]$/.test(token.tag)) {
				var title = text.replace(/^[ ]*[#]*[ ]*/,"");
				var tag = token.tag;
				title = title.replace(/[\r\n]*$/,"");
				//var encodeTitle = encodeURI(title);
				blockCache.renderContent = '<div class="wiki_page_inner_link"><a class="glyphicon glyphicon-link" name="' + title + '" href="#/#' + title + '"></a>'+ blockCache.renderContent + '</div>';
				// console.log(blockCache.renderContent);
			}

            if (token.type == "fence" && token.tag == "code" && /^\s*([\/@][\w_\/]+)/.test(token.info)) {
                var wikiBlock = mdwiki.parseWikiBlock(token);
                blockCache.isTemplate = wikiBlock.isTemplate;
                blockCache.htmlContent = '<div id="' + idx + '"></div>';
                blockCache.wikiBlock = wikiBlock;
                blockCache.isWikiBlock = true;
            }
            mdwiki.blockCacheMap[text] = mdwiki.blockCacheMap[text] || [];
            mdwiki.blockCacheMap[text].push(blockCache);

            return blockCache;
        }
        mdwiki.clearBlockCache = function () {
            for (key in mdwiki.blockCacheMap) {
                var blockCacheList = mdwiki.blockCacheMap[key];
                var newBlockCacheList = [];
                for (var i = 0; blockCacheList && i < blockCacheList.length; i++) {
                    var blockCache = blockCacheList[i];
                    if (blockCache.isUsing) {
                        blockCache.isUsing = false;   // 将使用状态改为未使用状态 下次未使用则删除
                        newBlockCacheList.push(blockCache);
                    } else {
                        blockCache.domNode && blockCache.domNode.remove();
                    }
                }
                if (newBlockCacheList.length > 0) {
                    mdwiki.blockCacheMap[key] = newBlockCacheList;
                } else {
                    delete mdwiki.blockCacheMap[key];
                }
            }
        }

        // 解析文本
        mdwiki.parse = function (text) {
            //console.log(text);
            var textLineList = text.split('\n');
            var tokenList = md.parse(text, {});
            var blockList = [];
            var stack = 0;
            var maxValue = 99999999;
            var block = {
                textPosition: {from: maxValue, to: 0},
                htmlContent: '',
                content: '',
                info: '',
            }
            for (var i = 0; i < tokenList.length; i++) {
                var token = tokenList[i];
                if (token.type.indexOf('_open') >= 0) {
                    stack++;
                }
                if (token.type.indexOf('_close') >= 0) {
                    stack--;
                }
				block.tag = token.tag || block.tag;
                // 获取文本位置
                block.textPosition.from = block.textPosition.from == maxValue && token.map ? token.map[0] : block.textPosition.from;
                block.textPosition.to = token.map ? token.map[1] : block.textPosition.to;
                /*
                 if (token.map) {
                 if (block.textPosition.from > token.map[0])
                 block.textPosition.from = token.map[0];
                 if (block.textPosition.to < token.map[1])
                 block.textPosition.to = token.map[1];
                 }
                 */
                if (stack == 0) {
                    for (var j = block.textPosition.from; j < block.textPosition.to; j++) {
                        block.content += textLineList[j] + '\n';
                    }
                    // 获取的对应的html标签内容
                    block.blockCache = mdwiki.getBlockCache(block.content, token);
                    block.isTemplate = block.blockCache.isTemplate;
                    if (block.blockCache.isTemplate) {
                        mdwiki.template = block;
                    }
                    blockList.push(block);
                    // 重置初始状态
                    block = {
                        textPosition: {from: maxValue, to: 0},
                        htmlContent: '',
                        content: '',
                    }
                }
            }
            mdwiki.clearBlockCache();
            mdwiki.blockList = blockList;
			//console.log(tokenList);
			//console.log(blockList);
            return blockList;
        }
        return mdwiki;
    }

    return markdownwiki;
});
