/**
 * Created by wuxiangan on 2016/12/28.
 */

define([
    'helper/util',
    'markdown-it',
    'highlight',
], function (util, markdownit, hljs) {
    var httpCache = {};
    var idCount = 0;
    var mdwikiMap = {
        count: 0, // markdownwiki 数量
    };
    // 获得毫秒
    function getTime() {
        return (new Date()).getTime();
    }

    function http(isCache, method, url, params, callback, errorCallback) {
        var $http = util.angularServices.$http;
        var httpRespone = undefined;
        var key = method + url + angular.toJson(params || {});

        if (isCache && httpCache[key]) {
            callback && callback(httpCache[key]);
            return;
        }
        // 在此带上认证参数
        if (method == 'POST') {
            httpRespone = $http({method: method, url: url, data: params}); //$http.post(url, params);
        } else {
            httpRespone = $http({method: method, url: url, params: params});
        }
        httpRespone.then(function (response) {
            if (isCache) {
                httpCache[key] = angular.copy(response.data);
            }
            callback && callback(response.data);

        }).catch(function (response) {
            // 网络错误
            errorCallback && errorCallback(response);
        });
    }

    // 获得mdwiki
    function getMdwiki(mdwikiName) {
        mdwikiMap[mdwikiName] = mdwikiMap[mdwikiName] || {renderCount: 0, module: {}};
        return mdwikiMap[mdwikiName];
    }

    function getWikiMdContentContainerId(mdwikiName) {
        var mdwikiObj = getMdwiki(mdwikiName);
        return 'wikimdContentContainer_' + mdwikiName + '_' + (mdwikiObj.renderCount - 1);
    }

    // 获得模块路径
    function getModPath(cmdName) {
        var wikiModulePath = config.wikiModPath;
        if (cmdName[cmdName.length - 1] == '/') {
            cmdName = cmdName.substring(0, cmdName.length - 1);
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
    function defaultRender(wikiBlockObj) {
        var cmdName = wikiBlockObj.cmdName;
        var wikiModulePath = getModPath(cmdName);
        var mdwikiObj = getMdwiki(wikiBlockObj.mdwikiName);
        require([wikiModulePath], function (module) {
            mdwikiObj.module[cmdName] = module;
            if (typeof module == "object" && typeof module.render == "function") {
                wikiBlockObj.render(module.render(wikiBlockObj));
            } else {
                // module error
            }
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

    // 模板渲染
    window.renderWikiTemplate = function (mdwikiName) {
        //console.log(mdwikiName);
        var mdwikiObj = getMdwiki(mdwikiName);
        var tplObj = mdwikiObj.template;
        var innerParams = tplObj.innerParams;
        var editor = mdwikiObj.editor;
        var render = getRenderFunc(tplObj.modName);
        tplObj.mdwikiName = mdwikiName;
        tplObj.isPageTemplate = mdwikiObj.isPageTemplate;
        tplObj.editorMode = mdwikiObj.editorMode;
        tplObj.render = function (htmlContent) {
            util.html('#' + getWikiMdContentContainerId(mdwikiName), htmlContent);
        };
        tplObj.http = function (method, url, params, callback, errorCallback) {
            return http(mdwikiObj.editorMode, method, url, params, callback, errorCallback);
        };

        tplObj.applyModParams = function (modParams) {
            //console.log(modParams);
            if (!modParams || !editor || !innerParams) {
                return;
            }
            editor.replaceRange(angular.toJson(modParams, 4) + '\n', {
                line: innerParams.line_begin + 1,
                ch: '\n'
            }, {line: innerParams.line_end - 1, ch: '\n'});
        }
        render(tplObj);
    };

    /** Global helper function:
     * Helper function to render a single block
     */
    window.renderWikiBlock = function (idx, modName, cmdName, params, innerParams) {
        //console.log(params);
        //console.log(innerParams);
        var render = getRenderFunc(modName);
        var mdwikiObj = getMdwiki(innerParams.mdwikiName);

        if (mdwikiObj.templateLineCount) {
            innerParams.line_begin = innerParams.line_begin - mdwikiObj.templateLineCount;
            innerParams.line_end = innerParams.line_end - mdwikiObj.templateLineCount;
        }

        var wikiBlockObj = {
            idx: idx,
            modName: modName,
            cmdName: cmdName,
            modParams: params,
            mdwikiName: innerParams.mdwikiName,
            innerParams: innerParams,
            viewEdit: false,
            editorMode: mdwikiObj.editorMode,
            editor: mdwikiObj.editor,
            applyModParams: function (modParams) {
                //console.log(modParams);
                if (!modParams || !this.editor) {
                    this.viewEdit = false;
                    return;
                }
                //console.log(innerParams);
                this.editor.replaceRange(angular.toJson(modParams, 4) + '\n', {
                    line: innerParams.line_begin + 1,  ch: '\n'
                }, {line: innerParams.line_end - 1, ch: '\n'});
                this.viewEdit = false;
                render(this);
            },
            setSelection: function (key) {
                var value = this.editor.getRange({
                    line: this.innerParams.line_begin + 2,
                    ch: '\n'
                }, {line: this.innerParams.line_end - 2, ch: '\n'});
                var start = this.innerParams.line_begin + 2, value = value.split('\n');
                for (var i = 0; i < value.length; i++) {
                    if (value[i].split(':')[0].indexOf(key) >= 0) {
                        start += i;
                        //this.editor.setSelection({line:start, ch:'\n'}, {line:start+1, ch:'\n'});
                        break;
                    }
                }
            },
            http: function (method, url, params, callback, errorCallback) {
                return http(mdwikiObj.editorMode, method, url, params, callback, errorCallback);
            },
            render: function (htmlContent) {
                //console.log(idx);
                util.html('#wikiblock_' + idx, htmlContent);
            },
        };
        render(wikiBlockObj);
    };

    /**
     * ```/world.new
     * {url=2, revision=3}
     * ```
     * will generate following js code
     * <div class="col-sm-12" id="wikiblock_1"></div>
     * <script>renderWikiBlock(1, "world", "world.new", "{url=2, revision=3}")</script>
     */
    function markdownit_wikicmd_fence(md, mdwikiName) {
        var mdwikiObj = getMdwiki(mdwikiName);
        var defaultRender = md.renderer.rules.fence;
        var wikiCmdRE = /^\s*([\/@][\w_\/]+)/;
        var wikiModNameRE = /^[\/@]+([\w_]+)/;
        md.renderer.rules.fence = function (tokens, idx, options, env, self) {
            //console.log(tokens);
            var token = tokens[idx];
            if (wikiCmdRE.test(token.info)) {
                var cmdname = token.info.match(wikiCmdRE)[1];
                if (cmdname) {
                    var modName = cmdname.match(wikiModNameRE)[1];
                    if (modName) {
                        var content = token.content.replace(/[\r\n]/g, '');
                        var params = null;
                        try {
                            params = JSON.parse(content);
                            if (params) {
                                params = JSON.stringify(params);
                            }
                        }
                        catch (e) {
                        }
                        if (params == null && token.content) {
                            params = '"' + content.replace(/[\""]/g, '\\"') + '"';
                        }
                        if (modName == "template") {
                            // 模板信息
                            mdwikiObj.template = {
                                modName: modName,
                                cmdName: cmdname,
                                modParams: angular.fromJson(params) || params,
                                innerParams: {mdwikiName: mdwikiName, line_begin: token.map[0], line_end: token.map[1]},
                            };
                            return '<div></div>'
                        }
                        idx = mdwikiName + "_" + mdwikiObj.renderCount + '_' + idx;
                        var script = '<script>renderWikiBlock("' + idx + '", "' + modName + '", "' + cmdname + '",' + params + ','
                            + JSON.stringify({
                                mdwikiName: mdwikiName,
                                line_begin: token.map[0],
                                line_end: token.map[1]
                            }) + ');</script>';
                        return '<div><div id="wikiblock_' + idx + '"></div></div>' + script;
                    }
                }
            }
            // pass token to default renderer.
            return defaultRender(tokens, idx, options, env, self);
        }
    };

    // 重写图片渲染
    function markdownit_wikicmd_link(md) {
        var defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
                return self.renderToken(tokens, idx, options);
            };

        md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
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
            var gitlab = util.getSelfServices().gitlab;
            var $rootScope = util.getAngularServices().$rootScope;
            gitlab = gitlab();
            var dataSourceList = $rootScope.userinfo.dataSource || [];
            //console.log($rootScope.userinfo);
            var urlPrefix = '';
            for (var i = 0; i < dataSourceList.length; i++) {
                var ds = dataSourceList[i];
                if (ds.type == 0) {
                    urlPrefix = gitlab.getRawContentUrlPrefix({username:ds.dataSourceUsername});  // TODO 独立数据源，即不使用默认库名或项目名时，此处也应做修改
                }
            }

            var token = tokens[idx], alt = token.content,
                srcIndex = token.attrIndex('src'),
                src = token.attrs[srcIndex][1] || '';

            //console.log(token);
            if (src.indexOf('#images/') == 0) {
                var url = urlPrefix + src.substring(1);
                return '<wiki-image src="' + url + '" alt="' + alt + '"></wiki-image>';
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
        markdownit_wikicmd_fence(md, mdwikiName);
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

    window.mdwikiRender = function (id, text, mdwikiName) {
        text = decodeURI(text);
        //console.log(id, mdwikiName, text);
        var mdwikiObj = getMdwiki(mdwikiName);
        var id = '#' + id;
        var siteinfo = util.getAngularServices().$rootScope.siteinfo;
        var pageinfo = util.getAngularServices().$rootScope.pageinfo;

        mdwikiObj.renderCount++;
        mdwikiObj.template = undefined;

        var renderContent = mdwikiObj.md.render(preprocessMDText(text));   // 会对 mdwikiObj.template 赋值
        var wikimdContentContainerId = getWikiMdContentContainerId(mdwikiName);
        if (!mdwikiObj.options.use_template) {
            util.html(id, '<div id="' + wikimdContentContainerId + '">' + renderContent + '</div>');
            return;
        }
        var script = '<script>renderWikiTemplate("' + mdwikiName + '")</script>';
        var html = '<div id="' + wikimdContentContainerId + '"></div>';
        var htmlContent = html + script;

        if (mdwikiObj.template) {
            mdwikiObj.template.content = renderContent;
            mdwikiObj.isPageTemplate = true;
            util.html(id, htmlContent);
            return;
        } else {
            if (pageinfo && pageinfo.name[0] == '_') {
                util.html(id, '<div id="' + wikimdContentContainerId + '">' + renderContent + '</div>');
                return;
            }
            mdwikiObj.template = {
                content: renderContent,
                modName: 'template',
                cmdName: '@template/js/default',
                modParams: {}
            };
            if (siteinfo) {
                var url = '/' + siteinfo.username + '/' + siteinfo.name + '/_theme';
                util.post(config.apiUrlPrefix + 'website_pages/getWebsitePageByUrl', {url: url}, function (data) {
                    if (data) {
                        text = data.content + '\n' + text;
                        //console.log(text);
                        renderContent = mdwikiObj.md.render(preprocessMDText(text));
                        mdwikiObj.template.content = renderContent;
                        mdwikiObj.templateLineCount =  data.content.split('\n').length;
                    }
                    util.html(id, htmlContent)
                }, function () {
                    util.html(id, htmlContent)
                });
            } else {
                util.html(id, htmlContent)
            }
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
        options.breaks = options.breaks == null ? false : options.breaks;
        // jquery container name where to output the md content. default to ".result-html"
        options.container_name = options.container_name == null ? '.result-html' : options.container_name;
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
        var mdwiki = {};
        var editor;
        var mdwikiObj = getMdwiki(mdwikiName);
        var GetEditorText;
        var lastUpdateTime = 0; // 上次更新时间
        var timer = undefined; // 定时器
        var divContainerId = undefined;
        mdwikiObj.md = md;
        mdwikiObj.options = options;

        mdwiki.getMarkdown = function () {
            return md;
        }

        mdwiki.getPosList = function () {
            return mdwiki.positionList || mdwiki.generatePosList();
        }

        // force render a given text
        mdwiki.render = function (text) {
            //console.log(text)
            var mdwikiObj = getMdwiki(mdwikiName);
            var id = mdwikiName + "_" + idCount;
            var html = '<div id="' + id + '"></div>';

            idCount++;
            divContainerId = id;
            text = encodeURI(text);

            var script = '<script>mdwikiRender("' + id + '","' + text + '","' + mdwikiName + '");</script>';
            return html + script;
        }

        mdwiki.getLastDivId = function () {
            return divContainerId;
        }

        mdwiki.getWikiMdContentContainerId = function () {
            getWikiMdContentContainerId(mdwikiName);
        }

        // update the content of markdown whenever the editor is changed
        mdwiki.bindToCodeMirrorEditor = function (editor_) {
            mdwikiObj.editor = editor_;
            mdwikiObj.editorMode = true;
            editor = editor_;
            GetEditorText = function () {
                return editor && editor.getValue();
            }
            // Setup listeners
            editor.on("change", mdwiki.updateResult);
        }

        // NOT tested: update the content of markdown whenever the editor is changed
        mdwiki.bindToAceEditor = function (editor_) {
            mdwikiObj.editor = editor_;
            mdwikiObj.editorMode = true;
            editor = editor_;
            GetEditorText = function () {
                return editor && editor.session.getValue();
            }
            // Setup listeners
            editor.on("change", mdwiki.updateResult);
        }

        // update result from current editor, this is usually called automatically whenever editor content changed.
        mdwiki.updateResult = function (cm, changeObj) {
            options.changeCallback && options.changeCallback(cm, changeObj);
            timer && clearTimeout(timer);
            timer = setTimeout(function () {
                var source = GetEditorText && GetEditorText();
                var htmlResult = mdwiki.render(source);
                mdwiki.generatePosList();
                //console.log(htmlResult);
                util.html(options.container_name, htmlResult);
                options.renderCallback && options.renderCallback(source);
                //$(options.container_name).html(htmlResult);
                timer = undefined;
            }, 1000);
        }

        // 生成每个div块对应编辑的位置列表
        mdwiki.generatePosList = function () {
            var source = GetEditorText && GetEditorText();
            var tokenList = md.parse(source, {});
            var posList = [];
            var pos = {from: 999999, to: 0};
            var stack = 0;

            for (var i = 0; i < tokenList.length; i++) {
                var token = tokenList[i];
                if (token.type.indexOf('_open') >= 0) {
                    stack++;
                }
                if (token.map) {
                    if (pos.from > token.map[0])
                        pos.from = token.map[0];
                    if (pos.to < token.map[1])
                        pos.to = token.map[1];
                }
                if (token.type.indexOf('_close') >= 0) {
                    stack--;
                }
                if (stack == 0) {
                    posList.push({from: pos.from, to: pos.to});
                    pos = {from: 999999, to: 0};
                }
            }
            mdwiki.positionList = posList;
            console.log(tokenList);
            console.log(posList);
            return posList;
            /*
             var temp = [];
             for (var i = 0; i < posList.length; i++) {
             temp.push({height:editor.heightAtLine(posList[i].from), line:posList[i].from});
             }
             console.log(posList);
             console.log(temp);
             */
            //console.log(tokenList);
            //console.log(posList);
        }

        return mdwiki;
    }

    return markdownwiki;
});