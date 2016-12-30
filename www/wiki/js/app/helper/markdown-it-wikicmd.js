/**
 * Created by wuxiangan on 2016/12/28.
 */

define(['util'], function (util) {
    function defaultRender(cmdName, moduleParams, render) {
        var wikiModulePath = config.wikiModPath;
        if (cmdName[cmdName.length-1] == '/') {
            cmdName = cmdName.substring(0, cmdName.length-1);
        }
        if (cmdName.indexOf('@') >= 0) {
            wikiModulePath += cmdName.replace('@','');
        } else {
            wikiModulePath = cmdName;
        }

        wikiModulePath += (cmdName.lastIndexOf('/') > 0 ? ".js" : "render.js");

        require([wikiModulePath], function (module) {
            if (typeof module == "object" && typeof module.render == "function"){
                render(module.render(cmdName, moduleParams));
            } else {
                // module error
            }
        });
    };

    /** Global helper function:
     * Helper function to render a single block
     */
    window.renderWikiBlock = function(containerTagId, modName, cmdName, params) {
        var render = config.getWikiModuleRender(modName);
        var realRender = function (htmlResult) {
            util.html('#'+containerTagId, htmlResult);
        };

        if (typeof render != "function") {
            render = defaultRender;
        }
        render(cmdName, params, realRender);
    };

    /**
     * ```/world.new
     * {url=2, revision=3}
     * ```
     * will generate following js code
     * <div class="col-sm-12" id="wikiblock_1"></div>
     * <script>renderWikiBlock(1, "world", "world.new", "{url=2, revision=3}")</script>
     */
    function markdownit_wikicmd_plugin(md, options) {
        options = options || {};
        var defaultRender = md.renderer.rules.fence;
        var wikiCmdRE = /^\s*([\/@][\w_\/]+)/;
        var wikiModNameRE = /^[\/@]+([\w_]+)/;
        md.renderer.rules.fence = function (tokens, idx, options, env, self) {
            /*
            console.log(tokens);
            console.log(idx);
            console.log(options);
            console.log(env);
            console.log(self);
             */

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
                        var containerTagId = 'wikiblock_' + idx;
                        var script = '<script>renderWikiBlock("' + containerTagId + '", "' + modName + '", "' + cmdname + '",' + params + ');</script>';
                        return '<div class="col-sm-12" id="' + containerTagId + '"></div>' + script;
                    }
                }
            }
            // pass token to default renderer.
            return defaultRender(tokens, idx, options, env, self);
        }
    };
    
    return markdownit_wikicmd_plugin;
});

    

