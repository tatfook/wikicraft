/**
 * Author: LiXizhi
 * Date: 2016.11.24
 * Desc: router for all markdown wiki commands 
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.markdownit_wikicmd_plugin = factory());
}(this, (function () { 'use strict';

    
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
    var wikiCmdRE = /^\s*[\/@]([\w_\.]+)/;
    var wikiModNameRE = /^([\w_]+)/;
    md.renderer.rules.fence = function (tokens, idx, options, env, self) {
        var token = tokens[idx];
        
        if (wikiCmdRE.test(token.info)) {
            var cmdname = token.info.match(wikiCmdRE)[1];
            if (cmdname) {
                var modName = cmdname.match(wikiModNameRE)[1];
                if (modName) {
                    var content = token.content.replace(/[\r\n]/g, '')
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
                    var script = '<script>renderWikiBlock(' + idx + ', "' + modName + `", "` + cmdname + '",' + params + ');</script>';
                    return '<div class="col-sm-12" id="wikiblock_' + idx + '"></div>' + script;
                }
            }
        }
        // pass token to default renderer.
        return defaultRender(tokens, idx, options, env, self);
    }
};
return markdownit_wikicmd_plugin;
})));


/** Global helper function: 
* Helper function to render a single block
*/
function renderWikiBlock(block_index, modName, cmdName, params, isEditor) {
    var rendererPath = "mod/" + modName + "/renderer";
    // async loading mod renderer. 
    requirejs([rendererPath], function (renderer) {
        var htmlResult;
        if (renderer != null) {
            htmlResult = renderer.render(cmdName, params, isEditor);
        }
        else {
            htmlResult = cmdName + '命令不存在';
        }
        $("#wikiblock_" + block_index).html(htmlResult);
    })
};
    

