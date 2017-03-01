/**
 * Created by wuxiangan on 2016/12/28.
 */

define([
    'helper/util',
    'markdown-it',
    'highlight',
], function (util, markdownit,hljs) {
    var httpCache = {};
    var mdwikiMap = {
        count:0, // markdownwiki 数量
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
            httpRespone = $http({method:method,url:url,data:params}); //$http.post(url, params);
        } else {
            httpRespone = $http({method:method,url:url,params:params});
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
        mdwikiMap[mdwikiName] = mdwikiMap[mdwikiName] || {module:{renderCount:0}};
        return mdwikiMap[mdwikiName];
    }

    // 获得模块路径
    function getModPath(cmdName) {
        var wikiModulePath = config.wikiModPath;
        if (cmdName[cmdName.length-1] == '/') {
            cmdName = cmdName.substring(0, cmdName.length-1);
        }
        if (cmdName.indexOf('@') >= 0) {
            wikiModulePath += cmdName.replace('@','');
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
            if (typeof module == "object" && typeof module.render == "function"){
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

    // 视图编辑实现
    function registerEvent(wikiBlockObj, render) {
        var cmdName = wikiBlockObj.cmdName;
        var mdwikiObj = getMdwiki(wikiBlockObj.mdwikiName);
        var module = mdwikiObj.module[cmdName];
        // 没有绑定编辑器则不支持视图编辑
        if (!wikiBlockObj.editor) {
            return ;
        }
        var idx = wikiBlockObj.idx;
        // 模块头部显示与隐藏
        $('#wikiblockContainer_' + idx).on('mouseenter mouseleave mouseover mouseout', function (e) {
            var element = $(e.target);
            if (e.type == 'mouseenter') {
                /*
                 if (!wikiBlockObj.viewEdit) {
                 $('#wikiblockHeader_' + idx).fadeIn();
                 }
                 */
                $('#wikiblockHeader_' + idx).fadeIn();
                $('#wikiblockContainer_' + idx).css('border','1px solid silver');
                //wikiBlockObj.editor.setSelection({line:wikiBlockObj.innerParams.line_begin, ch:'\n'},{line:wikiBlockObj.innerParams.line_end, ch:'\n'});
            } else if (e.type == 'mouseleave') {
                $('#wikiblockHeader_' + idx).fadeOut();
                $('#wikiblockContainer_' + idx).css('border','0px');
                //wikiBlockObj.editor.setSelection({line:0});
            } else if(e.type == 'mouseover' && element.attr('wikimodparamskey')) {
                //wikiBlockObj.setSelection(element.attr('wikimodparamskey'));
            } else if (e.type == 'mouseout'){
                //wikiBlockObj.editor.setSelection({line:0});
            }
        });

        // 编辑模块
        $('#wikiblockEditBtn_' + idx).on('click', function () {
            //console.log('edit wiki block' + idx);
            $('#wikiblockHeader_' + idx).fadeOut();
            wikiBlockObj.viewEdit = true;
            render(wikiBlockObj);
        });

        // 删除模块
        $('#wikiblockDeleteBtn_' + idx).on('click', function () {
            $('#wikiblockHeader_' + idx).fadeOut();
            //console.log('delete wiki block' + idx);
            wikiBlockObj.editor.replaceRange('',{line:wikiBlockObj.innerParams.line_begin,ch:'\n'}, {line:wikiBlockObj.innerParams.line_end, ch:'\n'});
        });

        // 删除模块
        $('#wikiblockHideBtn_' + idx).on('click', function () {
            $('#wikiblockHeader_' + idx).fadeOut();
        });
    };

    // 模板渲染
    window.renderWikiTemplate = function (mdwikiName) {
        //console.log(mdwikiName);
        var mdwikiObj = getMdwiki(mdwikiName);
        var tplObj = mdwikiObj.template;
        var render = getRenderFunc(tplObj.modName);
        tplObj.mdwikiName = mdwikiName;
        tplObj.render = function (htmlContent) {
            util.html('#wikiblock_template', htmlContent);
        };
        tplObj.http = function(method, url, params, callback, errorCallback){
            return http(mdwikiObj.editorMode, method, url, params, callback, errorCallback);
        };
        render(tplObj);
    };

    /** Global helper function:
     * Helper function to render a single block
     */
    window.renderWikiBlock = function(idx, modName, cmdName, params, innerParams) {
        //console.log(params);
        //console.log(innerParams);
        var render = getRenderFunc(modName);
        var mdwikiObj = getMdwiki(innerParams.mdwikiName);
        var wikiBlockObj = {
            idx:idx,
            modName:modName,
            cmdName:cmdName,
            modParams:params,
            mdwikiName:innerParams.mdwikiName,
            innerParams: innerParams,
            viewEdit:false,
            editorMode: mdwikiObj.editorMode,
            editor:mdwikiObj.editor,
            applyModParams: function (modParams) {
                //console.log(modParams);
                if (!modParams) {
                    this.viewEdit = false;
                    return ;
                }
                this.editor.replaceRange(angular.toJson(modParams, 4) + '\n', {line:innerParams.line_begin+1, ch:'\n'}, {line:innerParams.line_end-1, ch:'\n'});
                this.viewEdit = false;
                render(this);
            },
            setSelection: function (key) {
                var value = this.editor.getRange({line:this.innerParams.line_begin + 2, ch:'\n'},{line:this.innerParams.line_end-2, ch:'\n'});
                var start = this.innerParams.line_begin + 2, value = value.split('\n');
                for (var i = 0; i < value.length; i++) {
                    if (value[i].split(':')[0].indexOf(key) >= 0) {
                        start += i;
                        //this.editor.setSelection({line:start, ch:'\n'}, {line:start+1, ch:'\n'});
                        break;
                    }
                }
            },
            http:function(method, url, params, callback, errorCallback){
                return http(mdwikiObj.editorMode, method, url, params, callback, errorCallback);
            },
            render: function (htmlContent) {
                util.html('#wikiblock_'+ idx, htmlContent);
            },
        };
        registerEvent(wikiBlockObj, render);
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
                                modName:modName,
                                cmdName:cmdname,
                                modParams:angular.fromJson(params) || params,
                            };
                            return '<div></div>'
                        }
                        idx = mdwikiObj.renderCount + '_' + idx;
                        var script = '<script>renderWikiBlock("' + idx + '", "' + modName + '", "' + cmdname + '",' + params + ','
                            + JSON.stringify({mdwikiName:mdwikiName, line_begin:token.map[0], line_end:token.map[1]}) +');</script>';
                        return '<div>' +
                            '<div id="wikiblockContainer_'+ idx + '" style="position: relative">' +
                            '<div id="wikiblockHeader_'+ idx + '" style="position: absolute; left:0px; right:0px; display: none; z-index: 3">' +
                            '<div style="background-color: rgba(0,0,0,0.1); display: flex; justify-content: flex-end">' +
                            '<button class="btn" id="wikiblockEditBtn_'+idx+'"style="background: none; color: white">编辑</button>' +
                            '<button class="btn" id="wikiblockDeleteBtn_'+idx+'"style="background: none; color: white">删除</button>' +
                            '<button class="btn" id="wikiblockHideBtn_'+idx+'"style="background: none; color: white">隐藏</button>' +
                            '</div>' +
                            '</div>' +
                            '<div id="wikiblockEdit_'+idx+'"></div>' +
                            '<div id="wikiblock_' + idx+ '"></div>' +
                            '</div>' +
                            "</div>"  + script;
                        //return '<div class="col-sm-12" id="' + containerTagId + '"></div>' + script;
                    }
                }
            }
            // pass token to default renderer.
            return defaultRender(tokens, idx, options, env, self);
        }
    };

    // 重写图片渲染
    function markdownit_wikicmd_iamge(md) {
        var defaultRender = md.renderer.rules.image;
        md.renderer.rules.image = function (tokens, idx, options, env, self) {
            var token = tokens[idx], alt = token.content,
                srcIndex = token.attrIndex('src'),
                src = token.attrs[srcIndex][1] || '';

            //console.log(token);
            if (src.indexOf('#images/') == 0) {
                var url = util.getSelfServices().github.getRawContentUrl({path:src.substring(1)});
                return '<wiki-image src="' + url + '" alt="' + alt + '"></wiki-image>';
            }

            // pass token to default renderer.
            return defaultRender(tokens, idx, options, env, self);
        }
    }

    // md 语法重写
    function markdownit_rule_override(md, mdwikiName) {
        //console.log(md.renderer.rules);
        markdownit_wikicmd_iamge(md, mdwikiName);
        markdownit_wikicmd_fence(md, mdwikiName);
    }

    // formt md text
    function formatMDText(text) {
        
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

        var mdwiki = {};
        var editor;
        var mdwikiObj = getMdwiki(mdwikiName);
        var GetEditorText;
        var lastUpdateTime = 0; // 上次更新时间
        var timer = undefined; // 定时器

        mdwiki.getMarkdown = function () {
            return md;
        }

        mdwiki.getPosList = function () {
            return mdwiki.positionList || mdwiki.generatePosList();
        }

        // force render a given text
        mdwiki.render = function (text) {
            mdwikiObj.template = undefined;
            var htmlResult = md.render(text);
            htmlResult = '<div id="wikimdContentContainer">' + htmlResult + '</div>';
            if (!options.use_template) {
                return htmlResult;
            }
            var scipt = '<script>renderWikiTemplate("'+ mdwikiName +'")</script>';
            var html = '<div id="wikiblock_template"></div>';
            mdwikiObj.template = mdwikiObj.template || {modName:'template', cmdName:'@template/default', modParams:{}};
            mdwikiObj.template.content = htmlResult;
            mdwikiObj.renderCount++;
            return html + scipt;
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
        mdwiki.updateResult = function () {
            options.changeCallback && options.changeCallback();
            timer && clearTimeout(timer);
            timer = setTimeout(function () {
                var source = GetEditorText && GetEditorText();
                var htmlResult = mdwiki.render(source);
                mdwiki.generatePosList();
                //console.log(htmlResult);
                util.html(options.container_name, htmlResult);
                options.renderCallback && options.renderCallback();
                //$(options.container_name).html(htmlResult);
                timer = undefined;
            }, 1000);
        }

        // 生成每个div块对应编辑的位置列表
        mdwiki.generatePosList = function() {
            var source = GetEditorText && GetEditorText();
            var tokenList = md.parse(source);
            var posList = [];
            var pos = {from: 999999, to:0};
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
                    posList.push({from:pos.from, to:pos.to});
                    pos = {from: 999999, to:0};
                }
            }
            mdwiki.positionList = posList;
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