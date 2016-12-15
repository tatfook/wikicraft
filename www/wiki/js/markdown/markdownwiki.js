/**
 * Author: LiXizhi
 * Date: 2016.11.26
 * Desc: markdown renderer for wikicraft
 * it can be used as a passive wiki markdown renderer or bind to a given text editor
 * so that whever editor content is changed content will be refreshed. 
 */

(function (global, factory) {
    // require('markdown-it.min.js')
    // require('markdownit_wikicmd.js')

    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.markdownwiki = factory());
}(this, (function () { 'use strict';

// A markdownwiki instance represents a renderer. This is the object
// that user code is usually dealing with.
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
            if (lang && window.hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, str, true).value;
                } catch (__) { }
            }
            return ''; // use external default escaping
        };
    }

    // private : internal markdown it renderer. 
    var md = window.markdownit(options).use(window.markdownit_wikicmd_plugin);

    var mdwiki = {};
    var editor;

    var GetEditorText;

    // force render a given text
    mdwiki.render = function (text) {
        md.render(text);
    }

    // update the content of markdown whenever the editor is changed
    mdwiki.bindToCodeMirrorEditor = function(editor_) {
        editor = editor_;
        GetEditorText = function() {
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
        $(options.container_name).html(md.render(source));
    }
    return mdwiki;
}

return markdownwiki;
})));