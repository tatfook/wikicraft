/**
 * Created by wuxiangan on 2016/12/28.
 */

define([
    'util',
    'markdown-it',
    'highlight',
    config.jsAppHelperPath + 'markdown-it-wikicmd.js',
], function (util, markdownit,hljs, markdownit_wikicmd_plugin) {
    // 重写图片渲染
    function markdownit_wikicmd_iamge(md) {
        var defaultRender = md.renderer.rules.image;
        md.renderer.rules.image = function (tokens, idx, options, env, self) {
            var token = tokens[idx], alt = token.content,
                srcIndex = token.attrIndex('src'),
                src = token.attrs[srcIndex][1] || '';

            console.log(token);
            if (src.indexOf('#images/') == 0) {
                return '<wiki-image src="' + src + '" alt="' + alt + '"></wiki-image>';
            }

            // pass token to default renderer.
            return defaultRender(tokens, idx, options, env, self);
        }
    }

    function markdownit_rule_override(md) {
        markdownit_wikicmd_iamge(md);
    }

    function markdownwiki(options) {
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
        var md = markdownit(options).use(markdownit_wikicmd_plugin);
        markdownit_rule_override(md);

        var mdwiki = {};
        var editor;

        var GetEditorText;

        // force render a given text
        mdwiki.render = function (text) {
            md.render(text);
        }

        // update the content of markdown whenever the editor is changed
        mdwiki.bindToCodeMirrorEditor = function (editor_) {
            editor = editor_;
            GetEditorText = function () {
                return editor && editor.getValue();
            }
            // Setup listeners
            editor.on("change", mdwiki.updateResult);
        }

        // NOT tested: update the content of markdown whenever the editor is changed
        mdwiki.bindToAceEditor = function (editor_) {
            editor = editor_;
            GetEditorText = function () {
                return editor && editor.session.getValue();
            }
            // Setup listeners
            editor.on("change", mdwiki.updateResult);
        }

        // update result from current editor, this is usually called automatically whenever editor content changed. 
        mdwiki.updateResult = function () {
            var source = GetEditorText && GetEditorText();
            var htmlResult = md.render(source);
            util.html(options.container_name, htmlResult)
            //$(options.container_name).html(htmlResult);
        }
        return mdwiki;
    }

    return markdownwiki;
});