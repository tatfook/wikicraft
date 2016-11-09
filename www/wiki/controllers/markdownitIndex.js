(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
    /*
     Syntax highlighting with language autodetection.
     https://highlightjs.org/
     */

    (function(factory) {

        // Find the global object for export to both the browser and web workers.
        var globalObject = typeof window === 'object' && window ||
            typeof self === 'object' && self;

        // Setup highlight.js for different environments. First is Node.js or
        // CommonJS.
        if(typeof exports !== 'undefined') {
            factory(exports);
        } else if(globalObject) {
            // Export hljs globally even when using AMD for cases when this script
            // is loaded with others that may still expect a global hljs.
            globalObject.hljs = factory({});

            // Finally register the global hljs with AMD.
            if(typeof define === 'function' && define.amd) {
                define([], function() {
                    return globalObject.hljs;
                });
            }
        }

    }(function(hljs) {
        // Convenience variables for build-in objects
        var ArrayProto = [],
            objectKeys = Object.keys;

        // Global internal variables used within the highlight.js library.
        var languages = {},
            aliases   = {};

        // Regular expressions used throughout the highlight.js library.
        var noHighlightRe    = /^(no-?highlight|plain|text)$/i,
            languagePrefixRe = /\blang(?:uage)?-([\w-]+)\b/i,
            fixMarkupRe      = /((^(<[^>]+>|\t|)+|(?:\n)))/gm;

        var spanEndTag = '</span>';

        // Global options used when within external APIs. This is modified when
        // calling the `hljs.configure` function.
        var options = {
            classPrefix: 'hljs-',
            tabReplace: null,
            useBR: false,
            languages: undefined
        };

        // Object map that is used to escape some common HTML characters.
        var escapeRegexMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;'
        };

        /* Utility functions */

        function escape(value) {
            return value.replace(/[&<>]/gm, function(character) {
                return escapeRegexMap[character];
            });
        }

        function tag(node) {
            return node.nodeName.toLowerCase();
        }

        function testRe(re, lexeme) {
            var match = re && re.exec(lexeme);
            return match && match.index === 0;
        }

        function isNotHighlighted(language) {
            return noHighlightRe.test(language);
        }

        function blockLanguage(block) {
            var i, match, length, _class;
            var classes = block.className + ' ';

            classes += block.parentNode ? block.parentNode.className : '';

            // language-* takes precedence over non-prefixed class names.
            match = languagePrefixRe.exec(classes);
            if (match) {
                return getLanguage(match[1]) ? match[1] : 'no-highlight';
            }

            classes = classes.split(/\s+/);

            for (i = 0, length = classes.length; i < length; i++) {
                _class = classes[i]

                if (isNotHighlighted(_class) || getLanguage(_class)) {
                    return _class;
                }
            }
        }

        function inherit(parent, obj) {
            var key;
            var result = {};

            for (key in parent)
                result[key] = parent[key];
            if (obj)
                for (key in obj)
                    result[key] = obj[key];
            return result;
        }

        /* Stream merging */

        function nodeStream(node) {
            var result = [];
            (function _nodeStream(node, offset) {
                for (var child = node.firstChild; child; child = child.nextSibling) {
                    if (child.nodeType === 3)
                        offset += child.nodeValue.length;
                    else if (child.nodeType === 1) {
                        result.push({
                            event: 'start',
                            offset: offset,
                            node: child
                        });
                        offset = _nodeStream(child, offset);
                        // Prevent void elements from having an end tag that would actually
                        // double them in the output. There are more void elements in HTML
                        // but we list only those realistically expected in code display.
                        if (!tag(child).match(/br|hr|img|input/)) {
                            result.push({
                                event: 'stop',
                                offset: offset,
                                node: child
                            });
                        }
                    }
                }
                return offset;
            })(node, 0);
            return result;
        }

        function mergeStreams(original, highlighted, value) {
            var processed = 0;
            var result = '';
            var nodeStack = [];

            function selectStream() {
                if (!original.length || !highlighted.length) {
                    return original.length ? original : highlighted;
                }
                if (original[0].offset !== highlighted[0].offset) {
                    return (original[0].offset < highlighted[0].offset) ? original : highlighted;
                }

                /*
                 To avoid starting the stream just before it should stop the order is
                 ensured that original always starts first and closes last:

                 if (event1 == 'start' && event2 == 'start')
                 return original;
                 if (event1 == 'start' && event2 == 'stop')
                 return highlighted;
                 if (event1 == 'stop' && event2 == 'start')
                 return original;
                 if (event1 == 'stop' && event2 == 'stop')
                 return highlighted;

                 ... which is collapsed to:
                 */
                return highlighted[0].event === 'start' ? original : highlighted;
            }

            function open(node) {
                function attr_str(a) {return ' ' + a.nodeName + '="' + escape(a.value) + '"';}
                result += '<' + tag(node) + ArrayProto.map.call(node.attributes, attr_str).join('') + '>';
            }

            function close(node) {
                result += '</' + tag(node) + '>';
            }

            function render(event) {
                (event.event === 'start' ? open : close)(event.node);
            }

            while (original.length || highlighted.length) {
                var stream = selectStream();
                result += escape(value.substr(processed, stream[0].offset - processed));
                processed = stream[0].offset;
                if (stream === original) {
                    /*
                     On any opening or closing tag of the original markup we first close
                     the entire highlighted node stack, then render the original tag along
                     with all the following original tags at the same offset and then
                     reopen all the tags on the highlighted stack.
                     */
                    nodeStack.reverse().forEach(close);
                    do {
                        render(stream.splice(0, 1)[0]);
                        stream = selectStream();
                    } while (stream === original && stream.length && stream[0].offset === processed);
                    nodeStack.reverse().forEach(open);
                } else {
                    if (stream[0].event === 'start') {
                        nodeStack.push(stream[0].node);
                    } else {
                        nodeStack.pop();
                    }
                    render(stream.splice(0, 1)[0]);
                }
            }
            return result + escape(value.substr(processed));
        }

        /* Initialization */

        function compileLanguage(language) {

            function reStr(re) {
                return (re && re.source) || re;
            }

            function langRe(value, global) {
                return new RegExp(
                    reStr(value),
                    'm' + (language.case_insensitive ? 'i' : '') + (global ? 'g' : '')
                );
            }

            function compileMode(mode, parent) {
                if (mode.compiled)
                    return;
                mode.compiled = true;

                mode.keywords = mode.keywords || mode.beginKeywords;
                if (mode.keywords) {
                    var compiled_keywords = {};

                    var flatten = function(className, str) {
                        if (language.case_insensitive) {
                            str = str.toLowerCase();
                        }
                        str.split(' ').forEach(function(kw) {
                            var pair = kw.split('|');
                            compiled_keywords[pair[0]] = [className, pair[1] ? Number(pair[1]) : 1];
                        });
                    };

                    if (typeof mode.keywords === 'string') { // string
                        flatten('keyword', mode.keywords);
                    } else {
                        objectKeys(mode.keywords).forEach(function (className) {
                            flatten(className, mode.keywords[className]);
                        });
                    }
                    mode.keywords = compiled_keywords;
                }
                mode.lexemesRe = langRe(mode.lexemes || /\w+/, true);

                if (parent) {
                    if (mode.beginKeywords) {
                        mode.begin = '\\b(' + mode.beginKeywords.split(' ').join('|') + ')\\b';
                    }
                    if (!mode.begin)
                        mode.begin = /\B|\b/;
                    mode.beginRe = langRe(mode.begin);
                    if (!mode.end && !mode.endsWithParent)
                        mode.end = /\B|\b/;
                    if (mode.end)
                        mode.endRe = langRe(mode.end);
                    mode.terminator_end = reStr(mode.end) || '';
                    if (mode.endsWithParent && parent.terminator_end)
                        mode.terminator_end += (mode.end ? '|' : '') + parent.terminator_end;
                }
                if (mode.illegal)
                    mode.illegalRe = langRe(mode.illegal);
                if (mode.relevance == null)
                    mode.relevance = 1;
                if (!mode.contains) {
                    mode.contains = [];
                }
                var expanded_contains = [];
                mode.contains.forEach(function(c) {
                    if (c.variants) {
                        c.variants.forEach(function(v) {expanded_contains.push(inherit(c, v));});
                    } else {
                        expanded_contains.push(c === 'self' ? mode : c);
                    }
                });
                mode.contains = expanded_contains;
                mode.contains.forEach(function(c) {compileMode(c, mode);});

                if (mode.starts) {
                    compileMode(mode.starts, parent);
                }

                var terminators =
                    mode.contains.map(function(c) {
                            return c.beginKeywords ? '\\.?(' + c.begin + ')\\.?' : c.begin;
                        })
                        .concat([mode.terminator_end, mode.illegal])
                        .map(reStr)
                        .filter(Boolean);
                mode.terminators = terminators.length ? langRe(terminators.join('|'), true) : {exec: function(/*s*/) {return null;}};
            }

            compileMode(language);
        }

        /*
         Core highlighting function. Accepts a language name, or an alias, and a
         string with the code to highlight. Returns an object with the following
         properties:

         - relevance (int)
         - value (an HTML string with highlighting markup)

         */
        function highlight(name, value, ignore_illegals, continuation) {

            function subMode(lexeme, mode) {
                var i, length;

                for (i = 0, length = mode.contains.length; i < length; i++) {
                    if (testRe(mode.contains[i].beginRe, lexeme)) {
                        return mode.contains[i];
                    }
                }
            }

            function endOfMode(mode, lexeme) {
                if (testRe(mode.endRe, lexeme)) {
                    while (mode.endsParent && mode.parent) {
                        mode = mode.parent;
                    }
                    return mode;
                }
                if (mode.endsWithParent) {
                    return endOfMode(mode.parent, lexeme);
                }
            }

            function isIllegal(lexeme, mode) {
                return !ignore_illegals && testRe(mode.illegalRe, lexeme);
            }

            function keywordMatch(mode, match) {
                var match_str = language.case_insensitive ? match[0].toLowerCase() : match[0];
                return mode.keywords.hasOwnProperty(match_str) && mode.keywords[match_str];
            }

            function buildSpan(classname, insideSpan, leaveOpen, noPrefix) {
                var classPrefix = noPrefix ? '' : options.classPrefix,
                    openSpan    = '<span class="' + classPrefix,
                    closeSpan   = leaveOpen ? '' : spanEndTag

                openSpan += classname + '">';

                return openSpan + insideSpan + closeSpan;
            }

            function processKeywords() {
                var keyword_match, last_index, match, result;

                if (!top.keywords)
                    return escape(mode_buffer);

                result = '';
                last_index = 0;
                top.lexemesRe.lastIndex = 0;
                match = top.lexemesRe.exec(mode_buffer);

                while (match) {
                    result += escape(mode_buffer.substr(last_index, match.index - last_index));
                    keyword_match = keywordMatch(top, match);
                    if (keyword_match) {
                        relevance += keyword_match[1];
                        result += buildSpan(keyword_match[0], escape(match[0]));
                    } else {
                        result += escape(match[0]);
                    }
                    last_index = top.lexemesRe.lastIndex;
                    match = top.lexemesRe.exec(mode_buffer);
                }
                return result + escape(mode_buffer.substr(last_index));
            }

            function processSubLanguage() {
                var explicit = typeof top.subLanguage === 'string';
                if (explicit && !languages[top.subLanguage]) {
                    return escape(mode_buffer);
                }

                var result = explicit ?
                    highlight(top.subLanguage, mode_buffer, true, continuations[top.subLanguage]) :
                    highlightAuto(mode_buffer, top.subLanguage.length ? top.subLanguage : undefined);

                // Counting embedded language score towards the host language may be disabled
                // with zeroing the containing mode relevance. Usecase in point is Markdown that
                // allows XML everywhere and makes every XML snippet to have a much larger Markdown
                // score.
                if (top.relevance > 0) {
                    relevance += result.relevance;
                }
                if (explicit) {
                    continuations[top.subLanguage] = result.top;
                }
                return buildSpan(result.language, result.value, false, true);
            }

            function processBuffer() {
                result += (top.subLanguage != null ? processSubLanguage() : processKeywords());
                mode_buffer = '';
            }

            function startNewMode(mode) {
                result += mode.className? buildSpan(mode.className, '', true): '';
                top = Object.create(mode, {parent: {value: top}});
            }

            function processLexeme(buffer, lexeme) {

                mode_buffer += buffer;

                if (lexeme == null) {
                    processBuffer();
                    return 0;
                }

                var new_mode = subMode(lexeme, top);
                if (new_mode) {
                    if (new_mode.skip) {
                        mode_buffer += lexeme;
                    } else {
                        if (new_mode.excludeBegin) {
                            mode_buffer += lexeme;
                        }
                        processBuffer();
                        if (!new_mode.returnBegin && !new_mode.excludeBegin) {
                            mode_buffer = lexeme;
                        }
                    }
                    startNewMode(new_mode, lexeme);
                    return new_mode.returnBegin ? 0 : lexeme.length;
                }

                var end_mode = endOfMode(top, lexeme);
                if (end_mode) {
                    var origin = top;
                    if (origin.skip) {
                        mode_buffer += lexeme;
                    } else {
                        if (!(origin.returnEnd || origin.excludeEnd)) {
                            mode_buffer += lexeme;
                        }
                        processBuffer();
                        if (origin.excludeEnd) {
                            mode_buffer = lexeme;
                        }
                    }
                    do {
                        if (top.className) {
                            result += spanEndTag;
                        }
                        if (!top.skip) {
                            relevance += top.relevance;
                        }
                        top = top.parent;
                    } while (top !== end_mode.parent);
                    if (end_mode.starts) {
                        startNewMode(end_mode.starts, '');
                    }
                    return origin.returnEnd ? 0 : lexeme.length;
                }

                if (isIllegal(lexeme, top))
                    throw new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.className || '<unnamed>') + '"');

                /*
                 Parser should not reach this point as all types of lexemes should be caught
                 earlier, but if it does due to some bug make sure it advances at least one
                 character forward to prevent infinite looping.
                 */
                mode_buffer += lexeme;
                return lexeme.length || 1;
            }

            var language = getLanguage(name);
            if (!language) {
                throw new Error('Unknown language: "' + name + '"');
            }

            compileLanguage(language);
            var top = continuation || language;
            var continuations = {}; // keep continuations for sub-languages
            var result = '', current;
            for(current = top; current !== language; current = current.parent) {
                if (current.className) {
                    result = buildSpan(current.className, '', true) + result;
                }
            }
            var mode_buffer = '';
            var relevance = 0;
            try {
                var match, count, index = 0;
                while (true) {
                    top.terminators.lastIndex = index;
                    match = top.terminators.exec(value);
                    if (!match)
                        break;
                    count = processLexeme(value.substr(index, match.index - index), match[0]);
                    index = match.index + count;
                }
                processLexeme(value.substr(index));
                for(current = top; current.parent; current = current.parent) { // close dangling modes
                    if (current.className) {
                        result += spanEndTag;
                    }
                }
                return {
                    relevance: relevance,
                    value: result,
                    language: name,
                    top: top
                };
            } catch (e) {
                if (e.message && e.message.indexOf('Illegal') !== -1) {
                    return {
                        relevance: 0,
                        value: escape(value)
                    };
                } else {
                    throw e;
                }
            }
        }

        /*
         Highlighting with language detection. Accepts a string with the code to
         highlight. Returns an object with the following properties:

         - language (detected language)
         - relevance (int)
         - value (an HTML string with highlighting markup)
         - second_best (object with the same structure for second-best heuristically
         detected language, may be absent)

         */
        function highlightAuto(text, languageSubset) {
            languageSubset = languageSubset || options.languages || objectKeys(languages);
            var result = {
                relevance: 0,
                value: escape(text)
            };
            var second_best = result;
            languageSubset.filter(getLanguage).forEach(function(name) {
                var current = highlight(name, text, false);
                current.language = name;
                if (current.relevance > second_best.relevance) {
                    second_best = current;
                }
                if (current.relevance > result.relevance) {
                    second_best = result;
                    result = current;
                }
            });
            if (second_best.language) {
                result.second_best = second_best;
            }
            return result;
        }

        /*
         Post-processing of the highlighted markup:

         - replace TABs with something more useful
         - replace real line-breaks with '<br>' for non-pre containers

         */
        function fixMarkup(value) {
            return !(options.tabReplace || options.useBR)
                ? value
                : value.replace(fixMarkupRe, function(match, p1) {
                if (options.useBR && match === '\n') {
                    return '<br>';
                } else if (options.tabReplace) {
                    return p1.replace(/\t/g, options.tabReplace);
                }
            });
        }

        function buildClassName(prevClassName, currentLang, resultLang) {
            var language = currentLang ? aliases[currentLang] : resultLang,
                result   = [prevClassName.trim()];

            if (!prevClassName.match(/\bhljs\b/)) {
                result.push('hljs');
            }

            if (prevClassName.indexOf(language) === -1) {
                result.push(language);
            }

            return result.join(' ').trim();
        }

        /*
         Applies highlighting to a DOM node containing code. Accepts a DOM node and
         two optional parameters for fixMarkup.
         */
        function highlightBlock(block) {
            var node, originalStream, result, resultNode, text;
            var language = blockLanguage(block);

            if (isNotHighlighted(language))
                return;

            if (options.useBR) {
                node = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
                node.innerHTML = block.innerHTML.replace(/\n/g, '').replace(/<br[ \/]*>/g, '\n');
            } else {
                node = block;
            }
            text = node.textContent;
            result = language ? highlight(language, text, true) : highlightAuto(text);

            originalStream = nodeStream(node);
            if (originalStream.length) {
                resultNode = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
                resultNode.innerHTML = result.value;
                result.value = mergeStreams(originalStream, nodeStream(resultNode), text);
            }
            result.value = fixMarkup(result.value);

            block.innerHTML = result.value;
            block.className = buildClassName(block.className, language, result.language);
            block.result = {
                language: result.language,
                re: result.relevance
            };
            if (result.second_best) {
                block.second_best = {
                    language: result.second_best.language,
                    re: result.second_best.relevance
                };
            }
        }

        /*
         Updates highlight.js global options with values passed in the form of an object.
         */
        function configure(user_options) {
            options = inherit(options, user_options);
        }

        /*
         Applies highlighting to all <pre><code>..</code></pre> blocks on a page.
         */
        function initHighlighting() {
            if (initHighlighting.called)
                return;
            initHighlighting.called = true;

            var blocks = document.querySelectorAll('pre code');
            ArrayProto.forEach.call(blocks, highlightBlock);
        }

        /*
         Attaches highlighting to the page load event.
         */
        function initHighlightingOnLoad() {
            addEventListener('DOMContentLoaded', initHighlighting, false);
            addEventListener('load', initHighlighting, false);
        }

        function registerLanguage(name, language) {
            var lang = languages[name] = language(hljs);
            if (lang.aliases) {
                lang.aliases.forEach(function(alias) {aliases[alias] = name;});
            }
        }

        function listLanguages() {
            return objectKeys(languages);
        }

        function getLanguage(name) {
            name = (name || '').toLowerCase();
            return languages[name] || languages[aliases[name]];
        }

        /* Interface definition */

        hljs.highlight = highlight;
        hljs.highlightAuto = highlightAuto;
        hljs.fixMarkup = fixMarkup;
        hljs.highlightBlock = highlightBlock;
        hljs.configure = configure;
        hljs.initHighlighting = initHighlighting;
        hljs.initHighlightingOnLoad = initHighlightingOnLoad;
        hljs.registerLanguage = registerLanguage;
        hljs.listLanguages = listLanguages;
        hljs.getLanguage = getLanguage;
        hljs.inherit = inherit;

        // Common regexps
        hljs.IDENT_RE = '[a-zA-Z]\\w*';
        hljs.UNDERSCORE_IDENT_RE = '[a-zA-Z_]\\w*';
        hljs.NUMBER_RE = '\\b\\d+(\\.\\d+)?';
        hljs.C_NUMBER_RE = '(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
        hljs.BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
        hljs.RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

        // Common modes
        hljs.BACKSLASH_ESCAPE = {
            begin: '\\\\[\\s\\S]', relevance: 0
        };
        hljs.APOS_STRING_MODE = {
            className: 'string',
            begin: '\'', end: '\'',
            illegal: '\\n',
            contains: [hljs.BACKSLASH_ESCAPE]
        };
        hljs.QUOTE_STRING_MODE = {
            className: 'string',
            begin: '"', end: '"',
            illegal: '\\n',
            contains: [hljs.BACKSLASH_ESCAPE]
        };
        hljs.PHRASAL_WORDS_MODE = {
            begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|like)\b/
        };
        hljs.COMMENT = function (begin, end, inherits) {
            var mode = hljs.inherit(
                {
                    className: 'comment',
                    begin: begin, end: end,
                    contains: []
                },
                inherits || {}
            );
            mode.contains.push(hljs.PHRASAL_WORDS_MODE);
            mode.contains.push({
                className: 'doctag',
                begin: '(?:TODO|FIXME|NOTE|BUG|XXX):',
                relevance: 0
            });
            return mode;
        };
        hljs.C_LINE_COMMENT_MODE = hljs.COMMENT('//', '$');
        hljs.C_BLOCK_COMMENT_MODE = hljs.COMMENT('/\\*', '\\*/');
        hljs.HASH_COMMENT_MODE = hljs.COMMENT('#', '$');
        hljs.NUMBER_MODE = {
            className: 'number',
            begin: hljs.NUMBER_RE,
            relevance: 0
        };
        hljs.C_NUMBER_MODE = {
            className: 'number',
            begin: hljs.C_NUMBER_RE,
            relevance: 0
        };
        hljs.BINARY_NUMBER_MODE = {
            className: 'number',
            begin: hljs.BINARY_NUMBER_RE,
            relevance: 0
        };
        hljs.CSS_NUMBER_MODE = {
            className: 'number',
            begin: hljs.NUMBER_RE + '(' +
            '%|em|ex|ch|rem'  +
            '|vw|vh|vmin|vmax' +
            '|cm|mm|in|pt|pc|px' +
            '|deg|grad|rad|turn' +
            '|s|ms' +
            '|Hz|kHz' +
            '|dpi|dpcm|dppx' +
            ')?',
            relevance: 0
        };
        hljs.REGEXP_MODE = {
            className: 'regexp',
            begin: /\//, end: /\/[gimuy]*/,
            illegal: /\n/,
            contains: [
                hljs.BACKSLASH_ESCAPE,
                {
                    begin: /\[/, end: /\]/,
                    relevance: 0,
                    contains: [hljs.BACKSLASH_ESCAPE]
                }
            ]
        };
        hljs.TITLE_MODE = {
            className: 'title',
            begin: hljs.IDENT_RE,
            relevance: 0
        };
        hljs.UNDERSCORE_TITLE_MODE = {
            className: 'title',
            begin: hljs.UNDERSCORE_IDENT_RE,
            relevance: 0
        };
        hljs.METHOD_GUARD = {
            // excludes method names from keyword processing
            begin: '\\.\\s*' + hljs.UNDERSCORE_IDENT_RE,
            relevance: 0
        };

        return hljs;
    }));

},{}],2:[function(require,module,exports){
    module.exports = function(hljs) {
        var IDENT_RE = '[a-zA-Z_$][a-zA-Z0-9_$]*';
        var IDENT_FUNC_RETURN_TYPE_RE = '([*]|[a-zA-Z_$][a-zA-Z0-9_$]*)';

        var AS3_REST_ARG_MODE = {
            className: 'rest_arg',
            begin: '[.]{3}', end: IDENT_RE,
            relevance: 10
        };

        return {
            aliases: ['as'],
            keywords: {
                keyword: 'as break case catch class const continue default delete do dynamic each ' +
                'else extends final finally for function get if implements import in include ' +
                'instanceof interface internal is namespace native new override package private ' +
                'protected public return set static super switch this throw try typeof use var void ' +
                'while with',
                literal: 'true false null undefined'
            },
            contains: [
                hljs.APOS_STRING_MODE,
                hljs.QUOTE_STRING_MODE,
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE,
                hljs.C_NUMBER_MODE,
                {
                    className: 'class',
                    beginKeywords: 'package', end: '{',
                    contains: [hljs.TITLE_MODE]
                },
                {
                    className: 'class',
                    beginKeywords: 'class interface', end: '{', excludeEnd: true,
                    contains: [
                        {
                            beginKeywords: 'extends implements'
                        },
                        hljs.TITLE_MODE
                    ]
                },
                {
                    className: 'meta',
                    beginKeywords: 'import include', end: ';',
                    keywords: {'meta-keyword': 'import include'}
                },
                {
                    className: 'function',
                    beginKeywords: 'function', end: '[{;]', excludeEnd: true,
                    illegal: '\\S',
                    contains: [
                        hljs.TITLE_MODE,
                        {
                            className: 'params',
                            begin: '\\(', end: '\\)',
                            contains: [
                                hljs.APOS_STRING_MODE,
                                hljs.QUOTE_STRING_MODE,
                                hljs.C_LINE_COMMENT_MODE,
                                hljs.C_BLOCK_COMMENT_MODE,
                                AS3_REST_ARG_MODE
                            ]
                        },
                        {
                            begin: ':\\s*' + IDENT_FUNC_RETURN_TYPE_RE
                        }
                    ]
                },
                hljs.METHOD_GUARD
            ],
            illegal: /#/
        };
    };
},{}],3:[function(require,module,exports){
    module.exports = function(hljs) {
        var NUMBER = {className: 'number', begin: '[\\$%]\\d+'};
        return {
            aliases: ['apacheconf'],
            case_insensitive: true,
            contains: [
                hljs.HASH_COMMENT_MODE,
                {className: 'section', begin: '</?', end: '>'},
                {
                    className: 'attribute',
                    begin: /\w+/,
                    relevance: 0,
                    // keywords aren’t needed for highlighting per se, they only boost relevance
                    // for a very generally defined mode (starts with a word, ends with line-end
                    keywords: {
                        nomarkup:
                        'order deny allow setenv rewriterule rewriteengine rewritecond documentroot ' +
                        'sethandler errordocument loadmodule options header listen serverroot ' +
                        'servername'
                    },
                    starts: {
                        end: /$/,
                        relevance: 0,
                        keywords: {
                            literal: 'on off all'
                        },
                        contains: [
                            {
                                className: 'meta',
                                begin: '\\s\\[', end: '\\]$'
                            },
                            {
                                className: 'variable',
                                begin: '[\\$%]\\{', end: '\\}',
                                contains: ['self', NUMBER]
                            },
                            NUMBER,
                            hljs.QUOTE_STRING_MODE
                        ]
                    }
                }
            ],
            illegal: /\S/
        };
    };
},{}],4:[function(require,module,exports){
    module.exports = function(hljs) {
        var CPP = hljs.getLanguage('cpp').exports;
        return {
            keywords: {
                keyword:
                'boolean byte word string String array ' + CPP.keywords.keyword,
                built_in:
                'setup loop while catch for if do goto try switch case else ' +
                'default break continue return ' +
                'KeyboardController MouseController SoftwareSerial ' +
                'EthernetServer EthernetClient LiquidCrystal ' +
                'RobotControl GSMVoiceCall EthernetUDP EsploraTFT ' +
                'HttpClient RobotMotor WiFiClient GSMScanner ' +
                'FileSystem Scheduler GSMServer YunClient YunServer ' +
                'IPAddress GSMClient GSMModem Keyboard Ethernet ' +
                'Console GSMBand Esplora Stepper Process ' +
                'WiFiUDP GSM_SMS Mailbox USBHost Firmata PImage ' +
                'Client Server GSMPIN FileIO Bridge Serial ' +
                'EEPROM Stream Mouse Audio Servo File Task ' +
                'GPRS WiFi Wire TFT GSM SPI SD ' +
                'runShellCommandAsynchronously analogWriteResolution ' +
                'retrieveCallingNumber printFirmwareVersion ' +
                'analogReadResolution sendDigitalPortPair ' +
                'noListenOnLocalhost readJoystickButton setFirmwareVersion ' +
                'readJoystickSwitch scrollDisplayRight getVoiceCallStatus ' +
                'scrollDisplayLeft writeMicroseconds delayMicroseconds ' +
                'beginTransmission getSignalStrength runAsynchronously ' +
                'getAsynchronously listenOnLocalhost getCurrentCarrier ' +
                'readAccelerometer messageAvailable sendDigitalPorts ' +
                'lineFollowConfig countryNameWrite runShellCommand ' +
                'readStringUntil rewindDirectory readTemperature ' +
                'setClockDivider readLightSensor endTransmission ' +
                'analogReference detachInterrupt countryNameRead ' +
                'attachInterrupt encryptionType readBytesUntil ' +
                'robotNameWrite readMicrophone robotNameRead cityNameWrite ' +
                'userNameWrite readJoystickY readJoystickX mouseReleased ' +
                'openNextFile scanNetworks noInterrupts digitalWrite ' +
                'beginSpeaker mousePressed isActionDone mouseDragged ' +
                'displayLogos noAutoscroll addParameter remoteNumber ' +
                'getModifiers keyboardRead userNameRead waitContinue ' +
                'processInput parseCommand printVersion readNetworks ' +
                'writeMessage blinkVersion cityNameRead readMessage ' +
                'setDataMode parsePacket isListening setBitOrder ' +
                'beginPacket isDirectory motorsWrite drawCompass ' +
                'digitalRead clearScreen serialEvent rightToLeft ' +
                'setTextSize leftToRight requestFrom keyReleased ' +
                'compassRead analogWrite interrupts WiFiServer ' +
                'disconnect playMelody parseFloat autoscroll ' +
                'getPINUsed setPINUsed setTimeout sendAnalog ' +
                'readSlider analogRead beginWrite createChar ' +
                'motorsStop keyPressed tempoWrite readButton ' +
                'subnetMask debugPrint macAddress writeGreen ' +
                'randomSeed attachGPRS readString sendString ' +
                'remotePort releaseAll mouseMoved background ' +
                'getXChange getYChange answerCall getResult ' +
                'voiceCall endPacket constrain getSocket writeJSON ' +
                'getButton available connected findUntil readBytes ' +
                'exitValue readGreen writeBlue startLoop IPAddress ' +
                'isPressed sendSysex pauseMode gatewayIP setCursor ' +
                'getOemKey tuneWrite noDisplay loadImage switchPIN ' +
                'onRequest onReceive changePIN playFile noBuffer ' +
                'parseInt overflow checkPIN knobRead beginTFT ' +
                'bitClear updateIR bitWrite position writeRGB ' +
                'highByte writeRed setSpeed readBlue noStroke ' +
                'remoteIP transfer shutdown hangCall beginSMS ' +
                'endWrite attached maintain noCursor checkReg ' +
                'checkPUK shiftOut isValid shiftIn pulseIn ' +
                'connect println localIP pinMode getIMEI ' +
                'display noBlink process getBand running beginSD ' +
                'drawBMP lowByte setBand release bitRead prepare ' +
                'pointTo readRed setMode noFill remove listen ' +
                'stroke detach attach noTone exists buffer ' +
                'height bitSet circle config cursor random ' +
                'IRread setDNS endSMS getKey micros ' +
                'millis begin print write ready flush width ' +
                'isPIN blink clear press mkdir rmdir close ' +
                'point yield image BSSID click delay ' +
                'read text move peek beep rect line open ' +
                'seek fill size turn stop home find ' +
                'step tone sqrt RSSI SSID ' +
                'end bit tan cos sin pow map abs max ' +
                'min get run put',
                literal:
                'DIGITAL_MESSAGE FIRMATA_STRING ANALOG_MESSAGE ' +
                'REPORT_DIGITAL REPORT_ANALOG INPUT_PULLUP ' +
                'SET_PIN_MODE INTERNAL2V56 SYSTEM_RESET LED_BUILTIN ' +
                'INTERNAL1V1 SYSEX_START INTERNAL EXTERNAL ' +
                'DEFAULT OUTPUT INPUT HIGH LOW'
            },
            contains: [
                CPP.preprocessor,
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE,
                hljs.APOS_STRING_MODE,
                hljs.QUOTE_STRING_MODE,
                hljs.C_NUMBER_MODE
            ]
        };
    };
},{}],5:[function(require,module,exports){
    module.exports = function(hljs) {
        //local labels: %?[FB]?[AT]?\d{1,2}\w+
        return {
            case_insensitive: true,
            aliases: ['arm'],
            lexemes: '\\.?' + hljs.IDENT_RE,
            keywords: {
                meta:
                //GNU preprocs
                '.2byte .4byte .align .ascii .asciz .balign .byte .code .data .else .end .endif .endm .endr .equ .err .exitm .extern .global .hword .if .ifdef .ifndef .include .irp .long .macro .rept .req .section .set .skip .space .text .word .arm .thumb .code16 .code32 .force_thumb .thumb_func .ltorg '+
                    //ARM directives
                'ALIAS ALIGN ARM AREA ASSERT ATTR CN CODE CODE16 CODE32 COMMON CP DATA DCB DCD DCDU DCDO DCFD DCFDU DCI DCQ DCQU DCW DCWU DN ELIF ELSE END ENDFUNC ENDIF ENDP ENTRY EQU EXPORT EXPORTAS EXTERN FIELD FILL FUNCTION GBLA GBLL GBLS GET GLOBAL IF IMPORT INCBIN INCLUDE INFO KEEP LCLA LCLL LCLS LTORG MACRO MAP MEND MEXIT NOFP OPT PRESERVE8 PROC QN READONLY RELOC REQUIRE REQUIRE8 RLIST FN ROUT SETA SETL SETS SN SPACE SUBT THUMB THUMBX TTL WHILE WEND ',
                built_in:
                'r0 r1 r2 r3 r4 r5 r6 r7 r8 r9 r10 r11 r12 r13 r14 r15 '+ //standard registers
                'pc lr sp ip sl sb fp '+ //typical regs plus backward compatibility
                'a1 a2 a3 a4 v1 v2 v3 v4 v5 v6 v7 v8 f0 f1 f2 f3 f4 f5 f6 f7 '+ //more regs and fp
                'p0 p1 p2 p3 p4 p5 p6 p7 p8 p9 p10 p11 p12 p13 p14 p15 '+ //coprocessor regs
                'c0 c1 c2 c3 c4 c5 c6 c7 c8 c9 c10 c11 c12 c13 c14 c15 '+ //more coproc
                'q0 q1 q2 q3 q4 q5 q6 q7 q8 q9 q10 q11 q12 q13 q14 q15 '+ //advanced SIMD NEON regs

                    //program status registers
                'cpsr_c cpsr_x cpsr_s cpsr_f cpsr_cx cpsr_cxs cpsr_xs cpsr_xsf cpsr_sf cpsr_cxsf '+
                'spsr_c spsr_x spsr_s spsr_f spsr_cx spsr_cxs spsr_xs spsr_xsf spsr_sf spsr_cxsf '+

                    //NEON and VFP registers
                's0 s1 s2 s3 s4 s5 s6 s7 s8 s9 s10 s11 s12 s13 s14 s15 '+
                's16 s17 s18 s19 s20 s21 s22 s23 s24 s25 s26 s27 s28 s29 s30 s31 '+
                'd0 d1 d2 d3 d4 d5 d6 d7 d8 d9 d10 d11 d12 d13 d14 d15 '+
                'd16 d17 d18 d19 d20 d21 d22 d23 d24 d25 d26 d27 d28 d29 d30 d31 ' +

                '{PC} {VAR} {TRUE} {FALSE} {OPT} {CONFIG} {ENDIAN} {CODESIZE} {CPU} {FPU} {ARCHITECTURE} {PCSTOREOFFSET} {ARMASM_VERSION} {INTER} {ROPI} {RWPI} {SWST} {NOSWST} . @'
            },
            contains: [
                {
                    className: 'keyword',
                    begin: '\\b('+     //mnemonics
                    'adc|'+
                    '(qd?|sh?|u[qh]?)?add(8|16)?|usada?8|(q|sh?|u[qh]?)?(as|sa)x|'+
                    'and|adrl?|sbc|rs[bc]|asr|b[lx]?|blx|bxj|cbn?z|tb[bh]|bic|'+
                    'bfc|bfi|[su]bfx|bkpt|cdp2?|clz|clrex|cmp|cmn|cpsi[ed]|cps|'+
                    'setend|dbg|dmb|dsb|eor|isb|it[te]{0,3}|lsl|lsr|ror|rrx|'+
                    'ldm(([id][ab])|f[ds])?|ldr((s|ex)?[bhd])?|movt?|mvn|mra|mar|'+
                    'mul|[us]mull|smul[bwt][bt]|smu[as]d|smmul|smmla|'+
                    'mla|umlaal|smlal?([wbt][bt]|d)|mls|smlsl?[ds]|smc|svc|sev|'+
                    'mia([bt]{2}|ph)?|mrr?c2?|mcrr2?|mrs|msr|orr|orn|pkh(tb|bt)|rbit|'+
                    'rev(16|sh)?|sel|[su]sat(16)?|nop|pop|push|rfe([id][ab])?|'+
                    'stm([id][ab])?|str(ex)?[bhd]?|(qd?)?sub|(sh?|q|u[qh]?)?sub(8|16)|'+
                    '[su]xt(a?h|a?b(16)?)|srs([id][ab])?|swpb?|swi|smi|tst|teq|'+
                    'wfe|wfi|yield'+
                    ')'+
                    '(eq|ne|cs|cc|mi|pl|vs|vc|hi|ls|ge|lt|gt|le|al|hs|lo)?'+ //condition codes
                    '[sptrx]?' ,                                             //legal postfixes
                    end: '\\s'
                },
                hljs.COMMENT('[;@]', '$', {relevance: 0}),
                hljs.C_BLOCK_COMMENT_MODE,
                hljs.QUOTE_STRING_MODE,
                {
                    className: 'string',
                    begin: '\'',
                    end: '[^\\\\]\'',
                    relevance: 0
                },
                {
                    className: 'title',
                    begin: '\\|', end: '\\|',
                    illegal: '\\n',
                    relevance: 0
                },
                {
                    className: 'number',
                    variants: [
                        {begin: '[#$=]?0x[0-9a-f]+'}, //hex
                        {begin: '[#$=]?0b[01]+'},     //bin
                        {begin: '[#$=]\\d+'},        //literal
                        {begin: '\\b\\d+'}           //bare number
                    ],
                    relevance: 0
                },
                {
                    className: 'symbol',
                    variants: [
                        {begin: '^[a-z_\\.\\$][a-z0-9_\\.\\$]+'}, //ARM syntax
                        {begin: '^\\s*[a-z_\\.\\$][a-z0-9_\\.\\$]+:'}, //GNU ARM syntax
                        {begin: '[=#]\\w+' }  //label reference
                    ],
                    relevance: 0
                }
            ]
        };
    };
},{}],6:[function(require,module,exports){
    module.exports = function(hljs) {
        return {
            aliases: ['adoc'],
            contains: [
                // block comment
                hljs.COMMENT(
                    '^/{4,}\\n',
                    '\\n/{4,}$',
                    // can also be done as...
                    //'^/{4,}$',
                    //'^/{4,}$',
                    {
                        relevance: 10
                    }
                ),
                // line comment
                hljs.COMMENT(
                    '^//',
                    '$',
                    {
                        relevance: 0
                    }
                ),
                // title
                {
                    className: 'title',
                    begin: '^\\.\\w.*$'
                },
                // example, admonition & sidebar blocks
                {
                    begin: '^[=\\*]{4,}\\n',
                    end: '\\n^[=\\*]{4,}$',
                    relevance: 10
                },
                // headings
                {
                    className: 'section',
                    relevance: 10,
                    variants: [
                        {begin: '^(={1,5}) .+?( \\1)?$'},
                        {begin: '^[^\\[\\]\\n]+?\\n[=\\-~\\^\\+]{2,}$'},
                    ]
                },
                // document attributes
                {
                    className: 'meta',
                    begin: '^:.+?:',
                    end: '\\s',
                    excludeEnd: true,
                    relevance: 10
                },
                // block attributes
                {
                    className: 'meta',
                    begin: '^\\[.+?\\]$',
                    relevance: 0
                },
                // quoteblocks
                {
                    className: 'quote',
                    begin: '^_{4,}\\n',
                    end: '\\n_{4,}$',
                    relevance: 10
                },
                // listing and literal blocks
                {
                    className: 'code',
                    begin: '^[\\-\\.]{4,}\\n',
                    end: '\\n[\\-\\.]{4,}$',
                    relevance: 10
                },
                // passthrough blocks
                {
                    begin: '^\\+{4,}\\n',
                    end: '\\n\\+{4,}$',
                    contains: [
                        {
                            begin: '<', end: '>',
                            subLanguage: 'xml',
                            relevance: 0
                        }
                    ],
                    relevance: 10
                },
                // lists (can only capture indicators)
                {
                    className: 'bullet',
                    begin: '^(\\*+|\\-+|\\.+|[^\\n]+?::)\\s+'
                },
                // admonition
                {
                    className: 'symbol',
                    begin: '^(NOTE|TIP|IMPORTANT|WARNING|CAUTION):\\s+',
                    relevance: 10
                },
                // inline strong
                {
                    className: 'strong',
                    // must not follow a word character or be followed by an asterisk or space
                    begin: '\\B\\*(?![\\*\\s])',
                    end: '(\\n{2}|\\*)',
                    // allow escaped asterisk followed by word char
                    contains: [
                        {
                            begin: '\\\\*\\w',
                            relevance: 0
                        }
                    ]
                },
                // inline emphasis
                {
                    className: 'emphasis',
                    // must not follow a word character or be followed by a single quote or space
                    begin: '\\B\'(?![\'\\s])',
                    end: '(\\n{2}|\')',
                    // allow escaped single quote followed by word char
                    contains: [
                        {
                            begin: '\\\\\'\\w',
                            relevance: 0
                        }
                    ],
                    relevance: 0
                },
                // inline emphasis (alt)
                {
                    className: 'emphasis',
                    // must not follow a word character or be followed by an underline or space
                    begin: '_(?![_\\s])',
                    end: '(\\n{2}|_)',
                    relevance: 0
                },
                // inline smart quotes
                {
                    className: 'string',
                    variants: [
                        {begin: "``.+?''"},
                        {begin: "`.+?'"}
                    ]
                },
                // inline code snippets (TODO should get same treatment as strong and emphasis)
                {
                    className: 'code',
                    begin: '(`.+?`|\\+.+?\\+)',
                    relevance: 0
                },
                // indented literal block
                {
                    className: 'code',
                    begin: '^[ \\t]',
                    end: '$',
                    relevance: 0
                },
                // horizontal rules
                {
                    begin: '^\'{3,}[ \\t]*$',
                    relevance: 10
                },
                // images and links
                {
                    begin: '(link:)?(http|https|ftp|file|irc|image:?):\\S+\\[.*?\\]',
                    returnBegin: true,
                    contains: [
                        {
                            begin: '(link|image:?):',
                            relevance: 0
                        },
                        {
                            className: 'link',
                            begin: '\\w',
                            end: '[^\\[]+',
                            relevance: 0
                        },
                        {
                            className: 'string',
                            begin: '\\[',
                            end: '\\]',
                            excludeBegin: true,
                            excludeEnd: true,
                            relevance: 0
                        }
                    ],
                    relevance: 10
                }
            ]
        };
    };
},{}],7:[function(require,module,exports){
    module.exports = function(hljs) {
        return {
            case_insensitive: true,
            lexemes: '\\.?' + hljs.IDENT_RE,
            keywords: {
                keyword:
                /* mnemonic */
                'adc add adiw and andi asr bclr bld brbc brbs brcc brcs break breq brge brhc brhs ' +
                'brid brie brlo brlt brmi brne brpl brsh brtc brts brvc brvs bset bst call cbi cbr ' +
                'clc clh cli cln clr cls clt clv clz com cp cpc cpi cpse dec eicall eijmp elpm eor ' +
                'fmul fmuls fmulsu icall ijmp in inc jmp ld ldd ldi lds lpm lsl lsr mov movw mul ' +
                'muls mulsu neg nop or ori out pop push rcall ret reti rjmp rol ror sbc sbr sbrc sbrs ' +
                'sec seh sbi sbci sbic sbis sbiw sei sen ser ses set sev sez sleep spm st std sts sub ' +
                'subi swap tst wdr',
                built_in:
                /* general purpose registers */
                'r0 r1 r2 r3 r4 r5 r6 r7 r8 r9 r10 r11 r12 r13 r14 r15 r16 r17 r18 r19 r20 r21 r22 ' +
                'r23 r24 r25 r26 r27 r28 r29 r30 r31 x|0 xh xl y|0 yh yl z|0 zh zl ' +
                    /* IO Registers (ATMega128) */
                'ucsr1c udr1 ucsr1a ucsr1b ubrr1l ubrr1h ucsr0c ubrr0h tccr3c tccr3a tccr3b tcnt3h ' +
                'tcnt3l ocr3ah ocr3al ocr3bh ocr3bl ocr3ch ocr3cl icr3h icr3l etimsk etifr tccr1c ' +
                'ocr1ch ocr1cl twcr twdr twar twsr twbr osccal xmcra xmcrb eicra spmcsr spmcr portg ' +
                'ddrg ping portf ddrf sreg sph spl xdiv rampz eicrb eimsk gimsk gicr eifr gifr timsk ' +
                'tifr mcucr mcucsr tccr0 tcnt0 ocr0 assr tccr1a tccr1b tcnt1h tcnt1l ocr1ah ocr1al ' +
                'ocr1bh ocr1bl icr1h icr1l tccr2 tcnt2 ocr2 ocdr wdtcr sfior eearh eearl eedr eecr ' +
                'porta ddra pina portb ddrb pinb portc ddrc pinc portd ddrd pind spdr spsr spcr udr0 ' +
                'ucsr0a ucsr0b ubrr0l acsr admux adcsr adch adcl porte ddre pine pinf',
                meta:
                '.byte .cseg .db .def .device .dseg .dw .endmacro .equ .eseg .exit .include .list ' +
                '.listmac .macro .nolist .org .set'
            },
            contains: [
                hljs.C_BLOCK_COMMENT_MODE,
                hljs.COMMENT(
                    ';',
                    '$',
                    {
                        relevance: 0
                    }
                ),
                hljs.C_NUMBER_MODE, // 0x..., decimal, float
                hljs.BINARY_NUMBER_MODE, // 0b...
                {
                    className: 'number',
                    begin: '\\b(\\$[a-zA-Z0-9]+|0o[0-7]+)' // $..., 0o...
                },
                hljs.QUOTE_STRING_MODE,
                {
                    className: 'string',
                    begin: '\'', end: '[^\\\\]\'',
                    illegal: '[^\\\\][^\']'
                },
                {className: 'symbol',  begin: '^[A-Za-z0-9_.$]+:'},
                {className: 'meta', begin: '#', end: '$'},
                {  // подстановка в «.macro»
                    className: 'subst',
                    begin: '@[0-9]+'
                }
            ]
        };
    };
},{}],8:[function(require,module,exports){
    module.exports = function(hljs) {
        var VAR = {
            className: 'variable',
            variants: [
                {begin: /\$[\w\d#@][\w\d_]*/},
                {begin: /\$\{(.*?)}/}
            ]
        };
        var QUOTE_STRING = {
            className: 'string',
            begin: /"/, end: /"/,
            contains: [
                hljs.BACKSLASH_ESCAPE,
                VAR,
                {
                    className: 'variable',
                    begin: /\$\(/, end: /\)/,
                    contains: [hljs.BACKSLASH_ESCAPE]
                }
            ]
        };
        var APOS_STRING = {
            className: 'string',
            begin: /'/, end: /'/
        };

        return {
            aliases: ['sh', 'zsh'],
            lexemes: /-?[a-z\._]+/,
            keywords: {
                keyword:
                    'if then else elif fi for while in do done case esac function',
                literal:
                    'true false',
                built_in:
                // Shell built-ins
                // http://www.gnu.org/software/bash/manual/html_node/Shell-Builtin-Commands.html
                'break cd continue eval exec exit export getopts hash pwd readonly return shift test times ' +
                'trap umask unset ' +
                    // Bash built-ins
                'alias bind builtin caller command declare echo enable help let local logout mapfile printf ' +
                'read readarray source type typeset ulimit unalias ' +
                    // Shell modifiers
                'set shopt ' +
                    // Zsh built-ins
                'autoload bg bindkey bye cap chdir clone comparguments compcall compctl compdescribe compfiles ' +
                'compgroups compquote comptags comptry compvalues dirs disable disown echotc echoti emulate ' +
                'fc fg float functions getcap getln history integer jobs kill limit log noglob popd print ' +
                'pushd pushln rehash sched setcap setopt stat suspend ttyctl unfunction unhash unlimit ' +
                'unsetopt vared wait whence where which zcompile zformat zftp zle zmodload zparseopts zprof ' +
                'zpty zregexparse zsocket zstyle ztcp',
                _:
                    '-ne -eq -lt -gt -f -d -e -s -l -a' // relevance booster
            },
            contains: [
                {
                    className: 'meta',
                    begin: /^#![^\n]+sh\s*$/,
                    relevance: 10
                },
                {
                    className: 'function',
                    begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
                    returnBegin: true,
                    contains: [hljs.inherit(hljs.TITLE_MODE, {begin: /\w[\w\d_]*/})],
                    relevance: 0
                },
                hljs.HASH_COMMENT_MODE,
                QUOTE_STRING,
                APOS_STRING,
                VAR
            ]
        };
    };
},{}],9:[function(require,module,exports){
    module.exports = function(hljs) {
        var keywords = {
            'builtin-name':
            // Clojure keywords
            'def defonce cond apply if-not if-let if not not= = < > <= >= == + / * - rem '+
            'quot neg? pos? delay? symbol? keyword? true? false? integer? empty? coll? list? '+
            'set? ifn? fn? associative? sequential? sorted? counted? reversible? number? decimal? '+
            'class? distinct? isa? float? rational? reduced? ratio? odd? even? char? seq? vector? '+
            'string? map? nil? contains? zero? instance? not-every? not-any? libspec? -> ->> .. . '+
            'inc compare do dotimes mapcat take remove take-while drop letfn drop-last take-last '+
            'drop-while while intern condp case reduced cycle split-at split-with repeat replicate '+
            'iterate range merge zipmap declare line-seq sort comparator sort-by dorun doall nthnext '+
            'nthrest partition eval doseq await await-for let agent atom send send-off release-pending-sends '+
            'add-watch mapv filterv remove-watch agent-error restart-agent set-error-handler error-handler '+
            'set-error-mode! error-mode shutdown-agents quote var fn loop recur throw try monitor-enter '+
            'monitor-exit defmacro defn defn- macroexpand macroexpand-1 for dosync and or '+
            'when when-not when-let comp juxt partial sequence memoize constantly complement identity assert '+
            'peek pop doto proxy defstruct first rest cons defprotocol cast coll deftype defrecord last butlast '+
            'sigs reify second ffirst fnext nfirst nnext defmulti defmethod meta with-meta ns in-ns create-ns import '+
            'refer keys select-keys vals key val rseq name namespace promise into transient persistent! conj! '+
            'assoc! dissoc! pop! disj! use class type num float double short byte boolean bigint biginteger '+
            'bigdec print-method print-dup throw-if printf format load compile get-in update-in pr pr-on newline '+
            'flush read slurp read-line subvec with-open memfn time re-find re-groups rand-int rand mod locking '+
            'assert-valid-fdecl alias resolve ref deref refset swap! reset! set-validator! compare-and-set! alter-meta! '+
            'reset-meta! commute get-validator alter ref-set ref-history-count ref-min-history ref-max-history ensure sync io! '+
            'new next conj set! to-array future future-call into-array aset gen-class reduce map filter find empty '+
            'hash-map hash-set sorted-map sorted-map-by sorted-set sorted-set-by vec vector seq flatten reverse assoc dissoc list '+
            'disj get union difference intersection extend extend-type extend-protocol int nth delay count concat chunk chunk-buffer '+
            'chunk-append chunk-first chunk-rest max min dec unchecked-inc-int unchecked-inc unchecked-dec-inc unchecked-dec unchecked-negate '+
            'unchecked-add-int unchecked-add unchecked-subtract-int unchecked-subtract chunk-next chunk-cons chunked-seq? prn vary-meta '+
            'lazy-seq spread list* str find-keyword keyword symbol gensym force rationalize'
        };

        var SYMBOLSTART = 'a-zA-Z_\\-!.?+*=<>&#\'';
        var SYMBOL_RE = '[' + SYMBOLSTART + '][' + SYMBOLSTART + '0-9/;:]*';
        var SIMPLE_NUMBER_RE = '[-+]?\\d+(\\.\\d+)?';

        var SYMBOL = {
            begin: SYMBOL_RE,
            relevance: 0
        };
        var NUMBER = {
            className: 'number', begin: SIMPLE_NUMBER_RE,
            relevance: 0
        };
        var STRING = hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null});
        var COMMENT = hljs.COMMENT(
            ';',
            '$',
            {
                relevance: 0
            }
        );
        var LITERAL = {
            className: 'literal',
            begin: /\b(true|false|nil)\b/
        };
        var COLLECTION = {
            begin: '[\\[\\{]', end: '[\\]\\}]'
        };
        var HINT = {
            className: 'comment',
            begin: '\\^' + SYMBOL_RE
        };
        var HINT_COL = hljs.COMMENT('\\^\\{', '\\}');
        var KEY = {
            className: 'symbol',
            begin: '[:]{1,2}' + SYMBOL_RE
        };
        var LIST = {
            begin: '\\(', end: '\\)'
        };
        var BODY = {
            endsWithParent: true,
            relevance: 0
        };
        var NAME = {
            keywords: keywords,
            lexemes: SYMBOL_RE,
            className: 'name', begin: SYMBOL_RE,
            starts: BODY
        };
        var DEFAULT_CONTAINS = [LIST, STRING, HINT, HINT_COL, COMMENT, KEY, COLLECTION, NUMBER, LITERAL, SYMBOL];

        LIST.contains = [hljs.COMMENT('comment', ''), NAME, BODY];
        BODY.contains = DEFAULT_CONTAINS;
        COLLECTION.contains = DEFAULT_CONTAINS;

        return {
            aliases: ['clj'],
            illegal: /\S/,
            contains: [LIST, STRING, HINT, HINT_COL, COMMENT, KEY, COLLECTION, NUMBER, LITERAL]
        }
    };
},{}],10:[function(require,module,exports){
    module.exports = function(hljs) {
        return {
            aliases: ['cmake.in'],
            case_insensitive: true,
            keywords: {
                keyword:
                'add_custom_command add_custom_target add_definitions add_dependencies ' +
                'add_executable add_library add_subdirectory add_test aux_source_directory ' +
                'break build_command cmake_minimum_required cmake_policy configure_file ' +
                'create_test_sourcelist define_property else elseif enable_language enable_testing ' +
                'endforeach endfunction endif endmacro endwhile execute_process export find_file ' +
                'find_library find_package find_path find_program fltk_wrap_ui foreach function ' +
                'get_cmake_property get_directory_property get_filename_component get_property ' +
                'get_source_file_property get_target_property get_test_property if include ' +
                'include_directories include_external_msproject include_regular_expression install ' +
                'link_directories load_cache load_command macro mark_as_advanced message option ' +
                'output_required_files project qt_wrap_cpp qt_wrap_ui remove_definitions return ' +
                'separate_arguments set set_directory_properties set_property ' +
                'set_source_files_properties set_target_properties set_tests_properties site_name ' +
                'source_group string target_link_libraries try_compile try_run unset variable_watch ' +
                'while build_name exec_program export_library_dependencies install_files ' +
                'install_programs install_targets link_libraries make_directory remove subdir_depends ' +
                'subdirs use_mangled_mesa utility_source variable_requires write_file ' +
                'qt5_use_modules qt5_use_package qt5_wrap_cpp on off true false and or ' +
                'equal less greater strless strgreater strequal matches'
            },
            contains: [
                {
                    className: 'variable',
                    begin: '\\${', end: '}'
                },
                hljs.HASH_COMMENT_MODE,
                hljs.QUOTE_STRING_MODE,
                hljs.NUMBER_MODE
            ]
        };
    };
},{}],11:[function(require,module,exports){
    module.exports = function(hljs) {
        var KEYWORDS = {
            keyword:
            // JS keywords
            'in if for while finally new do return else break catch instanceof throw try this ' +
            'switch continue typeof delete debugger super ' +
                // Coffee keywords
            'then unless until loop of by when and or is isnt not',
            literal:
            // JS literals
            'true false null undefined ' +
                // Coffee literals
            'yes no on off',
            built_in:
                'npm require console print module global window document'
        };
        var JS_IDENT_RE = '[A-Za-z$_][0-9A-Za-z$_]*';
        var SUBST = {
            className: 'subst',
            begin: /#\{/, end: /}/,
            keywords: KEYWORDS
        };
        var EXPRESSIONS = [
            hljs.BINARY_NUMBER_MODE,
            hljs.inherit(hljs.C_NUMBER_MODE, {starts: {end: '(\\s*/)?', relevance: 0}}), // a number tries to eat the following slash to prevent treating it as a regexp
            {
                className: 'string',
                variants: [
                    {
                        begin: /'''/, end: /'''/,
                        contains: [hljs.BACKSLASH_ESCAPE]
                    },
                    {
                        begin: /'/, end: /'/,
                        contains: [hljs.BACKSLASH_ESCAPE]
                    },
                    {
                        begin: /"""/, end: /"""/,
                        contains: [hljs.BACKSLASH_ESCAPE, SUBST]
                    },
                    {
                        begin: /"/, end: /"/,
                        contains: [hljs.BACKSLASH_ESCAPE, SUBST]
                    }
                ]
            },
            {
                className: 'regexp',
                variants: [
                    {
                        begin: '///', end: '///',
                        contains: [SUBST, hljs.HASH_COMMENT_MODE]
                    },
                    {
                        begin: '//[gim]*',
                        relevance: 0
                    },
                    {
                        // regex can't start with space to parse x / 2 / 3 as two divisions
                        // regex can't start with *, and it supports an "illegal" in the main mode
                        begin: /\/(?![ *])(\\\/|.)*?\/[gim]*(?=\W|$)/
                    }
                ]
            },
            {
                begin: '@' + JS_IDENT_RE // relevance booster
            },
            {
                begin: '`', end: '`',
                excludeBegin: true, excludeEnd: true,
                subLanguage: 'javascript'
            }
        ];
        SUBST.contains = EXPRESSIONS;

        var TITLE = hljs.inherit(hljs.TITLE_MODE, {begin: JS_IDENT_RE});
        var PARAMS_RE = '(\\(.*\\))?\\s*\\B[-=]>';
        var PARAMS = {
            className: 'params',
            begin: '\\([^\\(]', returnBegin: true,
            /* We need another contained nameless mode to not have every nested
             pair of parens to be called "params" */
            contains: [{
                begin: /\(/, end: /\)/,
                keywords: KEYWORDS,
                contains: ['self'].concat(EXPRESSIONS)
            }]
        };

        return {
            aliases: ['coffee', 'cson', 'iced'],
            keywords: KEYWORDS,
            illegal: /\/\*/,
            contains: EXPRESSIONS.concat([
                hljs.COMMENT('###', '###'),
                hljs.HASH_COMMENT_MODE,
                {
                    className: 'function',
                    begin: '^\\s*' + JS_IDENT_RE + '\\s*=\\s*' + PARAMS_RE, end: '[-=]>',
                    returnBegin: true,
                    contains: [TITLE, PARAMS]
                },
                {
                    // anonymous function start
                    begin: /[:\(,=]\s*/,
                    relevance: 0,
                    contains: [
                        {
                            className: 'function',
                            begin: PARAMS_RE, end: '[-=]>',
                            returnBegin: true,
                            contains: [PARAMS]
                        }
                    ]
                },
                {
                    className: 'class',
                    beginKeywords: 'class',
                    end: '$',
                    illegal: /[:="\[\]]/,
                    contains: [
                        {
                            beginKeywords: 'extends',
                            endsWithParent: true,
                            illegal: /[:="\[\]]/,
                            contains: [TITLE]
                        },
                        TITLE
                    ]
                },
                {
                    begin: JS_IDENT_RE + ':', end: ':',
                    returnBegin: true, returnEnd: true,
                    relevance: 0
                }
            ])
        };
    };
},{}],12:[function(require,module,exports){
    module.exports = function(hljs) {
        var CPP_PRIMITIVE_TYPES = {
            className: 'keyword',
            begin: '\\b[a-z\\d_]*_t\\b'
        };

        var STRINGS = {
            className: 'string',
            variants: [
                {
                    begin: '(u8?|U)?L?"', end: '"',
                    illegal: '\\n',
                    contains: [hljs.BACKSLASH_ESCAPE]
                },
                {
                    begin: '(u8?|U)?R"', end: '"',
                    contains: [hljs.BACKSLASH_ESCAPE]
                },
                {
                    begin: '\'\\\\?.', end: '\'',
                    illegal: '.'
                }
            ]
        };

        var NUMBERS = {
            className: 'number',
            variants: [
                { begin: '\\b(0b[01\'_]+)' },
                { begin: '\\b([\\d\'_]+(\\.[\\d\'_]*)?|\\.[\\d\'_]+)(u|U|l|L|ul|UL|f|F|b|B)' },
                { begin: '(-?)(\\b0[xX][a-fA-F0-9\'_]+|(\\b[\\d\'_]+(\\.[\\d\'_]*)?|\\.[\\d\'_]+)([eE][-+]?[\\d\'_]+)?)' }
            ],
            relevance: 0
        };

        var PREPROCESSOR =       {
            className: 'meta',
            begin: /#\s*[a-z]+\b/, end: /$/,
            keywords: {
                'meta-keyword':
                'if else elif endif define undef warning error line ' +
                'pragma ifdef ifndef include'
            },
            contains: [
                {
                    begin: /\\\n/, relevance: 0
                },
                hljs.inherit(STRINGS, {className: 'meta-string'}),
                {
                    className: 'meta-string',
                    begin: '<', end: '>',
                    illegal: '\\n',
                },
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE
            ]
        };

        var FUNCTION_TITLE = hljs.IDENT_RE + '\\s*\\(';

        var CPP_KEYWORDS = {
            keyword: 'int float while private char catch import module export virtual operator sizeof ' +
            'dynamic_cast|10 typedef const_cast|10 const struct for static_cast|10 union namespace ' +
            'unsigned long volatile static protected bool template mutable if public friend ' +
            'do goto auto void enum else break extern using class asm case typeid ' +
            'short reinterpret_cast|10 default double register explicit signed typename try this ' +
            'switch continue inline delete alignof constexpr decltype ' +
            'noexcept static_assert thread_local restrict _Bool complex _Complex _Imaginary ' +
            'atomic_bool atomic_char atomic_schar ' +
            'atomic_uchar atomic_short atomic_ushort atomic_int atomic_uint atomic_long atomic_ulong atomic_llong ' +
            'atomic_ullong new throw return',
            built_in: 'std string cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream ' +
            'auto_ptr deque list queue stack vector map set bitset multiset multimap unordered_set ' +
            'unordered_map unordered_multiset unordered_multimap array shared_ptr abort abs acos ' +
            'asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp ' +
            'fscanf isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper ' +
            'isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow ' +
            'printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp ' +
            'strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan ' +
            'vfprintf vprintf vsprintf endl initializer_list unique_ptr',
            literal: 'true false nullptr NULL'
        };

        var EXPRESSION_CONTAINS = [
            CPP_PRIMITIVE_TYPES,
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            NUMBERS,
            STRINGS
        ];

        return {
            aliases: ['c', 'cc', 'h', 'c++', 'h++', 'hpp'],
            keywords: CPP_KEYWORDS,
            illegal: '</',
            contains: EXPRESSION_CONTAINS.concat([
                PREPROCESSOR,
                {
                    begin: '\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<', end: '>',
                    keywords: CPP_KEYWORDS,
                    contains: ['self', CPP_PRIMITIVE_TYPES]
                },
                {
                    begin: hljs.IDENT_RE + '::',
                    keywords: CPP_KEYWORDS
                },
                {
                    // This mode covers expression context where we can't expect a function
                    // definition and shouldn't highlight anything that looks like one:
                    // `return some()`, `else if()`, `(x*sum(1, 2))`
                    variants: [
                        {begin: /=/, end: /;/},
                        {begin: /\(/, end: /\)/},
                        {beginKeywords: 'new throw return else', end: /;/}
                    ],
                    keywords: CPP_KEYWORDS,
                    contains: EXPRESSION_CONTAINS.concat([
                        {
                            begin: /\(/, end: /\)/,
                            keywords: CPP_KEYWORDS,
                            contains: EXPRESSION_CONTAINS.concat(['self']),
                            relevance: 0
                        }
                    ]),
                    relevance: 0
                },
                {
                    className: 'function',
                    begin: '(' + hljs.IDENT_RE + '[\\*&\\s]+)+' + FUNCTION_TITLE,
                    returnBegin: true, end: /[{;=]/,
                    excludeEnd: true,
                    keywords: CPP_KEYWORDS,
                    illegal: /[^\w\s\*&]/,
                    contains: [
                        {
                            begin: FUNCTION_TITLE, returnBegin: true,
                            contains: [hljs.TITLE_MODE],
                            relevance: 0
                        },
                        {
                            className: 'params',
                            begin: /\(/, end: /\)/,
                            keywords: CPP_KEYWORDS,
                            relevance: 0,
                            contains: [
                                hljs.C_LINE_COMMENT_MODE,
                                hljs.C_BLOCK_COMMENT_MODE,
                                STRINGS,
                                NUMBERS,
                                CPP_PRIMITIVE_TYPES
                            ]
                        },
                        hljs.C_LINE_COMMENT_MODE,
                        hljs.C_BLOCK_COMMENT_MODE,
                        PREPROCESSOR
                    ]
                }
            ]),
            exports: {
                preprocessor: PREPROCESSOR,
                strings: STRINGS,
                keywords: CPP_KEYWORDS
            }
        };
    };
},{}],13:[function(require,module,exports){
    module.exports = function(hljs) {
        var IDENT_RE = '[a-zA-Z-][a-zA-Z0-9_-]*';
        var RULE = {
            begin: /[A-Z\_\.\-]+\s*:/, returnBegin: true, end: ';', endsWithParent: true,
            contains: [
                {
                    className: 'attribute',
                    begin: /\S/, end: ':', excludeEnd: true,
                    starts: {
                        endsWithParent: true, excludeEnd: true,
                        contains: [
                            {
                                begin: /[\w-]+\(/, returnBegin: true,
                                contains: [
                                    {
                                        className: 'built_in',
                                        begin: /[\w-]+/
                                    },
                                    {
                                        begin: /\(/, end: /\)/,
                                        contains: [
                                            hljs.APOS_STRING_MODE,
                                            hljs.QUOTE_STRING_MODE
                                        ]
                                    }
                                ]
                            },
                            hljs.CSS_NUMBER_MODE,
                            hljs.QUOTE_STRING_MODE,
                            hljs.APOS_STRING_MODE,
                            hljs.C_BLOCK_COMMENT_MODE,
                            {
                                className: 'number', begin: '#[0-9A-Fa-f]+'
                            },
                            {
                                className: 'meta', begin: '!important'
                            }
                        ]
                    }
                }
            ]
        };

        return {
            case_insensitive: true,
            illegal: /[=\/|'\$]/,
            contains: [
                hljs.C_BLOCK_COMMENT_MODE,
                {
                    className: 'selector-id', begin: /#[A-Za-z0-9_-]+/
                },
                {
                    className: 'selector-class', begin: /\.[A-Za-z0-9_-]+/
                },
                {
                    className: 'selector-attr',
                    begin: /\[/, end: /\]/,
                    illegal: '$'
                },
                {
                    className: 'selector-pseudo',
                    begin: /:(:)?[a-zA-Z0-9\_\-\+\(\)"'.]+/
                },
                {
                    begin: '@(font-face|page)',
                    lexemes: '[a-z-]+',
                    keywords: 'font-face page'
                },
                {
                    begin: '@', end: '[{;]', // at_rule eating first "{" is a good thing
                                             // because it doesn’t let it to be parsed as
                                             // a rule set but instead drops parser into
                                             // the default mode which is how it should be.
                    illegal: /:/, // break on Less variables @var: ...
                    contains: [
                        {
                            className: 'keyword',
                            begin: /\w+/
                        },
                        {
                            begin: /\s/, endsWithParent: true, excludeEnd: true,
                            relevance: 0,
                            contains: [
                                hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE,
                                hljs.CSS_NUMBER_MODE
                            ]
                        }
                    ]
                },
                {
                    className: 'selector-tag', begin: IDENT_RE,
                    relevance: 0
                },
                {
                    begin: '{', end: '}',
                    illegal: /\S/,
                    contains: [
                        hljs.C_BLOCK_COMMENT_MODE,
                        RULE,
                    ]
                }
            ]
        };
    };
},{}],14:[function(require,module,exports){
    module.exports = function(hljs) {
        return {
            aliases: ['patch'],
            contains: [
                {
                    className: 'meta',
                    relevance: 10,
                    variants: [
                        {begin: /^@@ +\-\d+,\d+ +\+\d+,\d+ +@@$/},
                        {begin: /^\*\*\* +\d+,\d+ +\*\*\*\*$/},
                        {begin: /^\-\-\- +\d+,\d+ +\-\-\-\-$/}
                    ]
                },
                {
                    className: 'comment',
                    variants: [
                        {begin: /Index: /, end: /$/},
                        {begin: /={3,}/, end: /$/},
                        {begin: /^\-{3}/, end: /$/},
                        {begin: /^\*{3} /, end: /$/},
                        {begin: /^\+{3}/, end: /$/},
                        {begin: /\*{5}/, end: /\*{5}$/}
                    ]
                },
                {
                    className: 'addition',
                    begin: '^\\+', end: '$'
                },
                {
                    className: 'deletion',
                    begin: '^\\-', end: '$'
                },
                {
                    className: 'addition',
                    begin: '^\\!', end: '$'
                }
            ]
        };
    };
},{}],15:[function(require,module,exports){
    module.exports = function(hljs) {
        var FILTER = {
            begin: /\|[A-Za-z]+:?/,
            keywords: {
                name:
                'truncatewords removetags linebreaksbr yesno get_digit timesince random striptags ' +
                'filesizeformat escape linebreaks length_is ljust rjust cut urlize fix_ampersands ' +
                'title floatformat capfirst pprint divisibleby add make_list unordered_list urlencode ' +
                'timeuntil urlizetrunc wordcount stringformat linenumbers slice date dictsort ' +
                'dictsortreversed default_if_none pluralize lower join center default ' +
                'truncatewords_html upper length phone2numeric wordwrap time addslashes slugify first ' +
                'escapejs force_escape iriencode last safe safeseq truncatechars localize unlocalize ' +
                'localtime utc timezone'
            },
            contains: [
                hljs.QUOTE_STRING_MODE,
                hljs.APOS_STRING_MODE
            ]
        };

        return {
            aliases: ['jinja'],
            case_insensitive: true,
            subLanguage: 'xml',
            contains: [
                hljs.COMMENT(/\{%\s*comment\s*%}/, /\{%\s*endcomment\s*%}/),
                hljs.COMMENT(/\{#/, /#}/),
                {
                    className: 'template-tag',
                    begin: /\{%/, end: /%}/,
                    contains: [
                        {
                            className: 'name',
                            begin: /\w+/,
                            keywords: {
                                name:
                                'comment endcomment load templatetag ifchanged endifchanged if endif firstof for ' +
                                'endfor ifnotequal endifnotequal widthratio extends include spaceless ' +
                                'endspaceless regroup ifequal endifequal ssi now with cycle url filter ' +
                                'endfilter debug block endblock else autoescape endautoescape csrf_token empty elif ' +
                                'endwith static trans blocktrans endblocktrans get_static_prefix get_media_prefix ' +
                                'plural get_current_language language get_available_languages ' +
                                'get_current_language_bidi get_language_info get_language_info_list localize ' +
                                'endlocalize localtime endlocaltime timezone endtimezone get_current_timezone ' +
                                'verbatim'
                            },
                            starts: {
                                endsWithParent: true,
                                keywords: 'in by as',
                                contains: [FILTER],
                                relevance: 0
                            }
                        }
                    ]
                },
                {
                    className: 'template-variable',
                    begin: /\{\{/, end: /}}/,
                    contains: [FILTER]
                }
            ]
        };
    };
},{}],16:[function(require,module,exports){
    module.exports = function(hljs) {
        return {
            aliases: ['docker'],
            case_insensitive: true,
            keywords: 'from maintainer cmd expose add copy entrypoint volume user workdir onbuild run env label',
            contains: [
                hljs.HASH_COMMENT_MODE,
                {
                    keywords: 'run cmd entrypoint volume add copy workdir onbuild label',
                    begin: /^ *(onbuild +)?(run|cmd|entrypoint|volume|add|copy|workdir|label) +/,
                    starts: {
                        end: /[^\\]\n/,
                        subLanguage: 'bash'
                    }
                },
                {
                    keywords: 'from maintainer expose env user onbuild',
                    begin: /^ *(onbuild +)?(from|maintainer|expose|env|user|onbuild) +/, end: /[^\\]\n/,
                    contains: [
                        hljs.APOS_STRING_MODE,
                        hljs.QUOTE_STRING_MODE,
                        hljs.NUMBER_MODE,
                        hljs.HASH_COMMENT_MODE
                    ]
                }
            ]
        }
    };
},{}],17:[function(require,module,exports){
    module.exports = function(hljs) {
        var PARAMS = {
            className: 'params',
            begin: '\\(', end: '\\)'
        };

        var F_KEYWORDS = {
            literal: '.False. .True.',
            keyword: 'kind do while private call intrinsic where elsewhere ' +
            'type endtype endmodule endselect endinterface end enddo endif if forall endforall only contains default return stop then ' +
            'public subroutine|10 function program .and. .or. .not. .le. .eq. .ge. .gt. .lt. ' +
            'goto save else use module select case ' +
            'access blank direct exist file fmt form formatted iostat name named nextrec number opened rec recl sequential status unformatted unit ' +
            'continue format pause cycle exit ' +
            'c_null_char c_alert c_backspace c_form_feed flush wait decimal round iomsg ' +
            'synchronous nopass non_overridable pass protected volatile abstract extends import ' +
            'non_intrinsic value deferred generic final enumerator class associate bind enum ' +
            'c_int c_short c_long c_long_long c_signed_char c_size_t c_int8_t c_int16_t c_int32_t c_int64_t c_int_least8_t c_int_least16_t ' +
            'c_int_least32_t c_int_least64_t c_int_fast8_t c_int_fast16_t c_int_fast32_t c_int_fast64_t c_intmax_t C_intptr_t c_float c_double ' +
            'c_long_double c_float_complex c_double_complex c_long_double_complex c_bool c_char c_null_ptr c_null_funptr ' +
            'c_new_line c_carriage_return c_horizontal_tab c_vertical_tab iso_c_binding c_loc c_funloc c_associated  c_f_pointer ' +
            'c_ptr c_funptr iso_fortran_env character_storage_size error_unit file_storage_size input_unit iostat_end iostat_eor ' +
            'numeric_storage_size output_unit c_f_procpointer ieee_arithmetic ieee_support_underflow_control ' +
            'ieee_get_underflow_mode ieee_set_underflow_mode newunit contiguous recursive ' +
            'pad position action delim readwrite eor advance nml interface procedure namelist include sequence elemental pure ' +
            'integer real character complex logical dimension allocatable|10 parameter ' +
            'external implicit|10 none double precision assign intent optional pointer ' +
            'target in out common equivalence data',
            built_in: 'alog alog10 amax0 amax1 amin0 amin1 amod cabs ccos cexp clog csin csqrt dabs dacos dasin datan datan2 dcos dcosh ddim dexp dint ' +
            'dlog dlog10 dmax1 dmin1 dmod dnint dsign dsin dsinh dsqrt dtan dtanh float iabs idim idint idnint ifix isign max0 max1 min0 min1 sngl ' +
            'algama cdabs cdcos cdexp cdlog cdsin cdsqrt cqabs cqcos cqexp cqlog cqsin cqsqrt dcmplx dconjg derf derfc dfloat dgamma dimag dlgama ' +
            'iqint qabs qacos qasin qatan qatan2 qcmplx qconjg qcos qcosh qdim qerf qerfc qexp qgamma qimag qlgama qlog qlog10 qmax1 qmin1 qmod ' +
            'qnint qsign qsin qsinh qsqrt qtan qtanh abs acos aimag aint anint asin atan atan2 char cmplx conjg cos cosh exp ichar index int log ' +
            'log10 max min nint sign sin sinh sqrt tan tanh print write dim lge lgt lle llt mod nullify allocate deallocate ' +
            'adjustl adjustr all allocated any associated bit_size btest ceiling count cshift date_and_time digits dot_product ' +
            'eoshift epsilon exponent floor fraction huge iand ibclr ibits ibset ieor ior ishft ishftc lbound len_trim matmul ' +
            'maxexponent maxloc maxval merge minexponent minloc minval modulo mvbits nearest pack present product ' +
            'radix random_number random_seed range repeat reshape rrspacing scale scan selected_int_kind selected_real_kind ' +
            'set_exponent shape size spacing spread sum system_clock tiny transpose trim ubound unpack verify achar iachar transfer ' +
            'dble entry dprod cpu_time command_argument_count get_command get_command_argument get_environment_variable is_iostat_end ' +
            'ieee_arithmetic ieee_support_underflow_control ieee_get_underflow_mode ieee_set_underflow_mode ' +
            'is_iostat_eor move_alloc new_line selected_char_kind same_type_as extends_type_of'  +
            'acosh asinh atanh bessel_j0 bessel_j1 bessel_jn bessel_y0 bessel_y1 bessel_yn erf erfc erfc_scaled gamma log_gamma hypot norm2 ' +
            'atomic_define atomic_ref execute_command_line leadz trailz storage_size merge_bits ' +
            'bge bgt ble blt dshiftl dshiftr findloc iall iany iparity image_index lcobound ucobound maskl maskr ' +
            'num_images parity popcnt poppar shifta shiftl shiftr this_image'
        };
        return {
            case_insensitive: true,
            aliases: ['f90', 'f95'],
            keywords: F_KEYWORDS,
            illegal: /\/\*/,
            contains: [
                hljs.inherit(hljs.APOS_STRING_MODE, {className: 'string', relevance: 0}),
                hljs.inherit(hljs.QUOTE_STRING_MODE, {className: 'string', relevance: 0}),
                {
                    className: 'function',
                    beginKeywords: 'subroutine function program',
                    illegal: '[${=\\n]',
                    contains: [hljs.UNDERSCORE_TITLE_MODE, PARAMS]
                },
                hljs.COMMENT('!', '$', {relevance: 0}),
                {
                    className: 'number',
                    begin: '(?=\\b|\\+|\\-|\\.)(?=\\.\\d|\\d)(?:\\d+)?(?:\\.?\\d*)(?:[de][+-]?\\d+)?\\b\\.?',
                    relevance: 0
                }
            ]
        };
    };
},{}],18:[function(require,module,exports){
    module.exports = function(hljs) {
        return {
            keywords: {
                keyword:
                // Statements
                'break continue discard do else for if return while' +
                    // Qualifiers
                'attribute binding buffer ccw centroid centroid varying coherent column_major const cw ' +
                'depth_any depth_greater depth_less depth_unchanged early_fragment_tests equal_spacing ' +
                'flat fractional_even_spacing fractional_odd_spacing highp in index inout invariant ' +
                'invocations isolines layout line_strip lines lines_adjacency local_size_x local_size_y ' +
                'local_size_z location lowp max_vertices mediump noperspective offset origin_upper_left ' +
                'out packed patch pixel_center_integer point_mode points precise precision quads r11f_g11f_b10f '+
                'r16 r16_snorm r16f r16i r16ui r32f r32i r32ui r8 r8_snorm r8i r8ui readonly restrict ' +
                'rg16 rg16_snorm rg16f rg16i rg16ui rg32f rg32i rg32ui rg8 rg8_snorm rg8i rg8ui rgb10_a2 ' +
                'rgb10_a2ui rgba16 rgba16_snorm rgba16f rgba16i rgba16ui rgba32f rgba32i rgba32ui rgba8 ' +
                'rgba8_snorm rgba8i rgba8ui row_major sample shared smooth std140 std430 stream triangle_strip ' +
                'triangles triangles_adjacency uniform varying vertices volatile writeonly',
                type:
                'atomic_uint bool bvec2 bvec3 bvec4 dmat2 dmat2x2 dmat2x3 dmat2x4 dmat3 dmat3x2 dmat3x3 ' +
                'dmat3x4 dmat4 dmat4x2 dmat4x3 dmat4x4 double dvec2 dvec3 dvec4 float iimage1D iimage1DArray ' +
                'iimage2D iimage2DArray iimage2DMS iimage2DMSArray iimage2DRect iimage3D iimageBuffer' +
                'iimageCube iimageCubeArray image1D image1DArray image2D image2DArray image2DMS image2DMSArray ' +
                'image2DRect image3D imageBuffer imageCube imageCubeArray int isampler1D isampler1DArray ' +
                'isampler2D isampler2DArray isampler2DMS isampler2DMSArray isampler2DRect isampler3D ' +
                'isamplerBuffer isamplerCube isamplerCubeArray ivec2 ivec3 ivec4 mat2 mat2x2 mat2x3 ' +
                'mat2x4 mat3 mat3x2 mat3x3 mat3x4 mat4 mat4x2 mat4x3 mat4x4 sampler1D sampler1DArray ' +
                'sampler1DArrayShadow sampler1DShadow sampler2D sampler2DArray sampler2DArrayShadow ' +
                'sampler2DMS sampler2DMSArray sampler2DRect sampler2DRectShadow sampler2DShadow sampler3D ' +
                'samplerBuffer samplerCube samplerCubeArray samplerCubeArrayShadow samplerCubeShadow ' +
                'image1D uimage1DArray uimage2D uimage2DArray uimage2DMS uimage2DMSArray uimage2DRect ' +
                'uimage3D uimageBuffer uimageCube uimageCubeArray uint usampler1D usampler1DArray ' +
                'usampler2D usampler2DArray usampler2DMS usampler2DMSArray usampler2DRect usampler3D ' +
                'samplerBuffer usamplerCube usamplerCubeArray uvec2 uvec3 uvec4 vec2 vec3 vec4 void',
                built_in:
                // Constants
                'gl_MaxAtomicCounterBindings gl_MaxAtomicCounterBufferSize gl_MaxClipDistances gl_MaxClipPlanes ' +
                'gl_MaxCombinedAtomicCounterBuffers gl_MaxCombinedAtomicCounters gl_MaxCombinedImageUniforms ' +
                'gl_MaxCombinedImageUnitsAndFragmentOutputs gl_MaxCombinedTextureImageUnits gl_MaxComputeAtomicCounterBuffers ' +
                'gl_MaxComputeAtomicCounters gl_MaxComputeImageUniforms gl_MaxComputeTextureImageUnits ' +
                'gl_MaxComputeUniformComponents gl_MaxComputeWorkGroupCount gl_MaxComputeWorkGroupSize ' +
                'gl_MaxDrawBuffers gl_MaxFragmentAtomicCounterBuffers gl_MaxFragmentAtomicCounters ' +
                'gl_MaxFragmentImageUniforms gl_MaxFragmentInputComponents gl_MaxFragmentInputVectors ' +
                'gl_MaxFragmentUniformComponents gl_MaxFragmentUniformVectors gl_MaxGeometryAtomicCounterBuffers ' +
                'gl_MaxGeometryAtomicCounters gl_MaxGeometryImageUniforms gl_MaxGeometryInputComponents ' +
                'gl_MaxGeometryOutputComponents gl_MaxGeometryOutputVertices gl_MaxGeometryTextureImageUnits ' +
                'gl_MaxGeometryTotalOutputComponents gl_MaxGeometryUniformComponents gl_MaxGeometryVaryingComponents ' +
                'gl_MaxImageSamples gl_MaxImageUnits gl_MaxLights gl_MaxPatchVertices gl_MaxProgramTexelOffset ' +
                'gl_MaxTessControlAtomicCounterBuffers gl_MaxTessControlAtomicCounters gl_MaxTessControlImageUniforms ' +
                'gl_MaxTessControlInputComponents gl_MaxTessControlOutputComponents gl_MaxTessControlTextureImageUnits ' +
                'gl_MaxTessControlTotalOutputComponents gl_MaxTessControlUniformComponents ' +
                'gl_MaxTessEvaluationAtomicCounterBuffers gl_MaxTessEvaluationAtomicCounters ' +
                'gl_MaxTessEvaluationImageUniforms gl_MaxTessEvaluationInputComponents gl_MaxTessEvaluationOutputComponents ' +
                'gl_MaxTessEvaluationTextureImageUnits gl_MaxTessEvaluationUniformComponents ' +
                'gl_MaxTessGenLevel gl_MaxTessPatchComponents gl_MaxTextureCoords gl_MaxTextureImageUnits ' +
                'gl_MaxTextureUnits gl_MaxVaryingComponents gl_MaxVaryingFloats gl_MaxVaryingVectors ' +
                'gl_MaxVertexAtomicCounterBuffers gl_MaxVertexAtomicCounters gl_MaxVertexAttribs gl_MaxVertexImageUniforms ' +
                'gl_MaxVertexOutputComponents gl_MaxVertexOutputVectors gl_MaxVertexTextureImageUnits ' +
                'gl_MaxVertexUniformComponents gl_MaxVertexUniformVectors gl_MaxViewports gl_MinProgramTexelOffset ' +
                    // Variables
                'gl_BackColor gl_BackLightModelProduct gl_BackLightProduct gl_BackMaterial ' +
                'gl_BackSecondaryColor gl_ClipDistance gl_ClipPlane gl_ClipVertex gl_Color ' +
                'gl_DepthRange gl_EyePlaneQ gl_EyePlaneR gl_EyePlaneS gl_EyePlaneT gl_Fog gl_FogCoord ' +
                'gl_FogFragCoord gl_FragColor gl_FragCoord gl_FragData gl_FragDepth gl_FrontColor ' +
                'gl_FrontFacing gl_FrontLightModelProduct gl_FrontLightProduct gl_FrontMaterial ' +
                'gl_FrontSecondaryColor gl_GlobalInvocationID gl_InstanceID gl_InvocationID gl_Layer gl_LightModel ' +
                'gl_LightSource gl_LocalInvocationID gl_LocalInvocationIndex gl_ModelViewMatrix ' +
                'gl_ModelViewMatrixInverse gl_ModelViewMatrixInverseTranspose gl_ModelViewMatrixTranspose ' +
                'gl_ModelViewProjectionMatrix gl_ModelViewProjectionMatrixInverse gl_ModelViewProjectionMatrixInverseTranspose ' +
                'gl_ModelViewProjectionMatrixTranspose gl_MultiTexCoord0 gl_MultiTexCoord1 gl_MultiTexCoord2 ' +
                'gl_MultiTexCoord3 gl_MultiTexCoord4 gl_MultiTexCoord5 gl_MultiTexCoord6 gl_MultiTexCoord7 ' +
                'gl_Normal gl_NormalMatrix gl_NormalScale gl_NumSamples gl_NumWorkGroups gl_ObjectPlaneQ ' +
                'gl_ObjectPlaneR gl_ObjectPlaneS gl_ObjectPlaneT gl_PatchVerticesIn gl_Point gl_PointCoord ' +
                'gl_PointSize gl_Position gl_PrimitiveID gl_PrimitiveIDIn gl_ProjectionMatrix gl_ProjectionMatrixInverse ' +
                'gl_ProjectionMatrixInverseTranspose gl_ProjectionMatrixTranspose gl_SampleID gl_SampleMask ' +
                'gl_SampleMaskIn gl_SamplePosition gl_SecondaryColor gl_TessCoord gl_TessLevelInner gl_TessLevelOuter ' +
                'gl_TexCoord gl_TextureEnvColor gl_TextureMatrix gl_TextureMatrixInverse gl_TextureMatrixInverseTranspose ' +
                'gl_TextureMatrixTranspose gl_Vertex gl_VertexID gl_ViewportIndex gl_WorkGroupID gl_WorkGroupSize gl_in gl_out ' +
                    // Functions
                'EmitStreamVertex EmitVertex EndPrimitive EndStreamPrimitive abs acos acosh all any asin ' +
                'asinh atan atanh atomicAdd atomicAnd atomicCompSwap atomicCounter atomicCounterDecrement ' +
                'atomicCounterIncrement atomicExchange atomicMax atomicMin atomicOr atomicXor barrier ' +
                'bitCount bitfieldExtract bitfieldInsert bitfieldReverse ceil clamp cos cosh cross ' +
                'dFdx dFdy degrees determinant distance dot equal exp exp2 faceforward findLSB findMSB ' +
                'floatBitsToInt floatBitsToUint floor fma fract frexp ftransform fwidth greaterThan ' +
                'greaterThanEqual groupMemoryBarrier imageAtomicAdd imageAtomicAnd imageAtomicCompSwap ' +
                'imageAtomicExchange imageAtomicMax imageAtomicMin imageAtomicOr imageAtomicXor imageLoad ' +
                'imageSize imageStore imulExtended intBitsToFloat interpolateAtCentroid interpolateAtOffset ' +
                'interpolateAtSample inverse inversesqrt isinf isnan ldexp length lessThan lessThanEqual log ' +
                'log2 matrixCompMult max memoryBarrier memoryBarrierAtomicCounter memoryBarrierBuffer ' +
                'memoryBarrierImage memoryBarrierShared min mix mod modf noise1 noise2 noise3 noise4 ' +
                'normalize not notEqual outerProduct packDouble2x32 packHalf2x16 packSnorm2x16 packSnorm4x8 ' +
                'packUnorm2x16 packUnorm4x8 pow radians reflect refract round roundEven shadow1D shadow1DLod ' +
                'shadow1DProj shadow1DProjLod shadow2D shadow2DLod shadow2DProj shadow2DProjLod sign sin sinh ' +
                'smoothstep sqrt step tan tanh texelFetch texelFetchOffset texture texture1D texture1DLod ' +
                'texture1DProj texture1DProjLod texture2D texture2DLod texture2DProj texture2DProjLod ' +
                'texture3D texture3DLod texture3DProj texture3DProjLod textureCube textureCubeLod ' +
                'textureGather textureGatherOffset textureGatherOffsets textureGrad textureGradOffset ' +
                'textureLod textureLodOffset textureOffset textureProj textureProjGrad textureProjGradOffset ' +
                'textureProjLod textureProjLodOffset textureProjOffset textureQueryLevels textureQueryLod ' +
                'textureSize transpose trunc uaddCarry uintBitsToFloat umulExtended unpackDouble2x32 ' +
                'unpackHalf2x16 unpackSnorm2x16 unpackSnorm4x8 unpackUnorm2x16 unpackUnorm4x8 usubBorrow',
                literal: 'true false'
            },
            illegal: '"',
            contains: [
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE,
                hljs.C_NUMBER_MODE,
                {
                    className: 'meta',
                    begin: '#', end: '$'
                }
            ]
        };
    };
},{}],19:[function(require,module,exports){
    module.exports = function(hljs) {
        var GO_KEYWORDS = {
            keyword:
            'break default func interface select case map struct chan else goto package switch ' +
            'const fallthrough if range type continue for import return var go defer ' +
            'bool byte complex64 complex128 float32 float64 int8 int16 int32 int64 string uint8 ' +
            'uint16 uint32 uint64 int uint uintptr rune',
            literal:
                'true false iota nil',
            built_in:
                'append cap close complex copy imag len make new panic print println real recover delete'
        };
        return {
            aliases: ['golang'],
            keywords: GO_KEYWORDS,
            illegal: '</',
            contains: [
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE,
                {
                    className: 'string',
                    variants: [
                        hljs.QUOTE_STRING_MODE,
                        {begin: '\'', end: '[^\\\\]\''},
                        {begin: '`', end: '`'},
                    ]
                },
                {
                    className: 'number',
                    variants: [
                        {begin: hljs.C_NUMBER_RE + '[dflsi]', relevance: 1},
                        hljs.C_NUMBER_MODE
                    ]
                },
                {
                    begin: /:=/ // relevance booster
                },
                {
                    className: 'function',
                    beginKeywords: 'func', end: /\s*\{/, excludeEnd: true,
                    contains: [
                        hljs.TITLE_MODE,
                        {
                            className: 'params',
                            begin: /\(/, end: /\)/,
                            keywords: GO_KEYWORDS,
                            illegal: /["']/
                        }
                    ]
                }
            ]
        };
    };
},{}],20:[function(require,module,exports){
    module.exports = function(hljs) {
        return {
            keywords: {
                literal : 'true false null',
                keyword:
                'byte short char int long boolean float double void ' +
                    // groovy specific keywords
                'def as in assert trait ' +
                    // common keywords with Java
                'super this abstract static volatile transient public private protected synchronized final ' +
                'class interface enum if else for while switch case break default continue ' +
                'throw throws try catch finally implements extends new import package return instanceof'
            },

            contains: [
                hljs.COMMENT(
                    '/\\*\\*',
                    '\\*/',
                    {
                        relevance : 0,
                        contains : [
                            {
                                // eat up @'s in emails to prevent them to be recognized as doctags
                                begin: /\w+@/, relevance: 0
                            },
                            {
                                className : 'doctag',
                                begin : '@[A-Za-z]+'
                            }
                        ]
                    }
                ),
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE,
                {
                    className: 'string',
                    begin: '"""', end: '"""'
                },
                {
                    className: 'string',
                    begin: "'''", end: "'''"
                },
                {
                    className: 'string',
                    begin: "\\$/", end: "/\\$",
                    relevance: 10
                },
                hljs.APOS_STRING_MODE,
                {
                    className: 'regexp',
                    begin: /~?\/[^\/\n]+\//,
                    contains: [
                        hljs.BACKSLASH_ESCAPE
                    ]
                },
                hljs.QUOTE_STRING_MODE,
                {
                    className: 'meta',
                    begin: "^#!/usr/bin/env", end: '$',
                    illegal: '\n'
                },
                hljs.BINARY_NUMBER_MODE,
                {
                    className: 'class',
                    beginKeywords: 'class interface trait enum', end: '{',
                    illegal: ':',
                    contains: [
                        {beginKeywords: 'extends implements'},
                        hljs.UNDERSCORE_TITLE_MODE
                    ]
                },
                hljs.C_NUMBER_MODE,
                {
                    className: 'meta', begin: '@[A-Za-z]+'
                },
                {
                    // highlight map keys and named parameters as strings
                    className: 'string', begin: /[^\?]{0}[A-Za-z0-9_$]+ *:/
                },
                {
                    // catch middle element of the ternary operator
                    // to avoid highlight it as a label, named parameter, or map key
                    begin: /\?/, end: /\:/
                },
                {
                    // highlight labeled statements
                    className: 'symbol', begin: '^\\s*[A-Za-z0-9_$]+:',
                    relevance: 0
                }
            ],
            illegal: /#|<\//
        }
    };
},{}],21:[function(require,module,exports){
    module.exports = function(hljs) {
        var BUILT_INS = {'builtin-name': 'each in with if else unless bindattr action collection debugger log outlet template unbound view yield'};
        return {
            aliases: ['hbs', 'html.hbs', 'html.handlebars'],
            case_insensitive: true,
            subLanguage: 'xml',
            contains: [
                hljs.COMMENT('{{!(--)?', '(--)?}}'),
                {
                    className: 'template-tag',
                    begin: /\{\{[#\/]/, end: /\}\}/,
                    contains: [
                        {
                            className: 'name',
                            begin: /[a-zA-Z\.-]+/,
                            keywords: BUILT_INS,
                            starts: {
                                endsWithParent: true, relevance: 0,
                                contains: [
                                    hljs.QUOTE_STRING_MODE
                                ]
                            }
                        }
                    ]
                },
                {
                    className: 'template-variable',
                    begin: /\{\{/, end: /\}\}/,
                    keywords: BUILT_INS
                }
            ]
        };
    };
},{}],22:[function(require,module,exports){
    module.exports = function(hljs) {
        var COMMENT = {
            variants: [
                hljs.COMMENT('--', '$'),
                hljs.COMMENT(
                    '{-',
                    '-}',
                    {
                        contains: ['self']
                    }
                )
            ]
        };

        var PRAGMA = {
            className: 'meta',
            begin: '{-#', end: '#-}'
        };

        var PREPROCESSOR = {
            className: 'meta',
            begin: '^#', end: '$'
        };

        var CONSTRUCTOR = {
            className: 'type',
            begin: '\\b[A-Z][\\w\']*', // TODO: other constructors (build-in, infix).
            relevance: 0
        };

        var LIST = {
            begin: '\\(', end: '\\)',
            illegal: '"',
            contains: [
                PRAGMA,
                PREPROCESSOR,
                {className: 'type', begin: '\\b[A-Z][\\w]*(\\((\\.\\.|,|\\w+)\\))?'},
                hljs.inherit(hljs.TITLE_MODE, {begin: '[_a-z][\\w\']*'}),
                COMMENT
            ]
        };

        var RECORD = {
            begin: '{', end: '}',
            contains: LIST.contains
        };

        return {
            aliases: ['hs'],
            keywords:
            'let in if then else case of where do module import hiding ' +
            'qualified type data newtype deriving class instance as default ' +
            'infix infixl infixr foreign export ccall stdcall cplusplus ' +
            'jvm dotnet safe unsafe family forall mdo proc rec',
            contains: [

                // Top-level constructions.

                {
                    beginKeywords: 'module', end: 'where',
                    keywords: 'module where',
                    contains: [LIST, COMMENT],
                    illegal: '\\W\\.|;'
                },
                {
                    begin: '\\bimport\\b', end: '$',
                    keywords: 'import qualified as hiding',
                    contains: [LIST, COMMENT],
                    illegal: '\\W\\.|;'
                },

                {
                    className: 'class',
                    begin: '^(\\s*)?(class|instance)\\b', end: 'where',
                    keywords: 'class family instance where',
                    contains: [CONSTRUCTOR, LIST, COMMENT]
                },
                {
                    className: 'class',
                    begin: '\\b(data|(new)?type)\\b', end: '$',
                    keywords: 'data family type newtype deriving',
                    contains: [PRAGMA, CONSTRUCTOR, LIST, RECORD, COMMENT]
                },
                {
                    beginKeywords: 'default', end: '$',
                    contains: [CONSTRUCTOR, LIST, COMMENT]
                },
                {
                    beginKeywords: 'infix infixl infixr', end: '$',
                    contains: [hljs.C_NUMBER_MODE, COMMENT]
                },
                {
                    begin: '\\bforeign\\b', end: '$',
                    keywords: 'foreign import export ccall stdcall cplusplus jvm ' +
                    'dotnet safe unsafe',
                    contains: [CONSTRUCTOR, hljs.QUOTE_STRING_MODE, COMMENT]
                },
                {
                    className: 'meta',
                    begin: '#!\\/usr\\/bin\\/env\ runhaskell', end: '$'
                },

                // "Whitespaces".

                PRAGMA,
                PREPROCESSOR,

                // Literals and names.

                // TODO: characters.
                hljs.QUOTE_STRING_MODE,
                hljs.C_NUMBER_MODE,
                CONSTRUCTOR,
                hljs.inherit(hljs.TITLE_MODE, {begin: '^[_a-z][\\w\']*'}),

                COMMENT,

                {begin: '->|<-'} // No markup, relevance booster
            ]
        };
    };
},{}],23:[function(require,module,exports){
    module.exports = function(hljs) {
        var STRING = {
            className: "string",
            contains: [hljs.BACKSLASH_ESCAPE],
            variants: [
                {
                    begin: "'''", end: "'''",
                    relevance: 10
                }, {
                    begin: '"""', end: '"""',
                    relevance: 10
                }, {
                    begin: '"', end: '"'
                }, {
                    begin: "'", end: "'"
                }
            ]
        };
        return {
            aliases: ['toml'],
            case_insensitive: true,
            illegal: /\S/,
            contains: [
                hljs.COMMENT(';', '$'),
                hljs.HASH_COMMENT_MODE,
                {
                    className: 'section',
                    begin: /^\s*\[+/, end: /\]+/
                },
                {
                    begin: /^[a-z0-9\[\]_-]+\s*=\s*/, end: '$',
                    returnBegin: true,
                    contains: [
                        {
                            className: 'attr',
                            begin: /[a-z0-9\[\]_-]+/
                        },
                        {
                            begin: /=/, endsWithParent: true,
                            relevance: 0,
                            contains: [
                                {
                                    className: 'literal',
                                    begin: /\bon|off|true|false|yes|no\b/
                                },
                                {
                                    className: 'variable',
                                    variants: [
                                        {begin: /\$[\w\d"][\w\d_]*/},
                                        {begin: /\$\{(.*?)}/}
                                    ]
                                },
                                STRING,
                                {
                                    className: 'number',
                                    begin: /([\+\-]+)?[\d]+_[\d_]+/
                                },
                                hljs.NUMBER_MODE
                            ]
                        }
                    ]
                }
            ]
        };
    };
},{}],24:[function(require,module,exports){
    module.exports = function(hljs) {
        var GENERIC_IDENT_RE = hljs.UNDERSCORE_IDENT_RE + '(<' + hljs.UNDERSCORE_IDENT_RE + '(\\s*,\\s*' + hljs.UNDERSCORE_IDENT_RE + ')*>)?';
        var KEYWORDS =
            'false synchronized int abstract float private char boolean static null if const ' +
            'for true while long strictfp finally protected import native final void ' +
            'enum else break transient catch instanceof byte super volatile case assert short ' +
            'package default double public try this switch continue throws protected public private ' +
            'module requires exports';

        // https://docs.oracle.com/javase/7/docs/technotes/guides/language/underscores-literals.html
        var JAVA_NUMBER_RE = '\\b' +
            '(' +
            '0[bB]([01]+[01_]+[01]+|[01]+)' + // 0b...
            '|' +
            '0[xX]([a-fA-F0-9]+[a-fA-F0-9_]+[a-fA-F0-9]+|[a-fA-F0-9]+)' + // 0x...
            '|' +
            '(' +
            '([\\d]+[\\d_]+[\\d]+|[\\d]+)(\\.([\\d]+[\\d_]+[\\d]+|[\\d]+))?' +
            '|' +
            '\\.([\\d]+[\\d_]+[\\d]+|[\\d]+)' +
            ')' +
            '([eE][-+]?\\d+)?' + // octal, decimal, float
            ')' +
            '[lLfF]?';
        var JAVA_NUMBER_MODE = {
            className: 'number',
            begin: JAVA_NUMBER_RE,
            relevance: 0
        };

        return {
            aliases: ['jsp'],
            keywords: KEYWORDS,
            illegal: /<\/|#/,
            contains: [
                hljs.COMMENT(
                    '/\\*\\*',
                    '\\*/',
                    {
                        relevance : 0,
                        contains : [
                            {
                                // eat up @'s in emails to prevent them to be recognized as doctags
                                begin: /\w+@/, relevance: 0
                            },
                            {
                                className : 'doctag',
                                begin : '@[A-Za-z]+'
                            }
                        ]
                    }
                ),
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE,
                hljs.APOS_STRING_MODE,
                hljs.QUOTE_STRING_MODE,
                {
                    className: 'class',
                    beginKeywords: 'class interface', end: /[{;=]/, excludeEnd: true,
                    keywords: 'class interface',
                    illegal: /[:"\[\]]/,
                    contains: [
                        {beginKeywords: 'extends implements'},
                        hljs.UNDERSCORE_TITLE_MODE
                    ]
                },
                {
                    // Expression keywords prevent 'keyword Name(...)' from being
                    // recognized as a function definition
                    beginKeywords: 'new throw return else',
                    relevance: 0
                },
                {
                    className: 'function',
                    begin: '(' + GENERIC_IDENT_RE + '\\s+)+' + hljs.UNDERSCORE_IDENT_RE + '\\s*\\(', returnBegin: true, end: /[{;=]/,
                    excludeEnd: true,
                    keywords: KEYWORDS,
                    contains: [
                        {
                            begin: hljs.UNDERSCORE_IDENT_RE + '\\s*\\(', returnBegin: true,
                            relevance: 0,
                            contains: [hljs.UNDERSCORE_TITLE_MODE]
                        },
                        {
                            className: 'params',
                            begin: /\(/, end: /\)/,
                            keywords: KEYWORDS,
                            relevance: 0,
                            contains: [
                                hljs.APOS_STRING_MODE,
                                hljs.QUOTE_STRING_MODE,
                                hljs.C_NUMBER_MODE,
                                hljs.C_BLOCK_COMMENT_MODE
                            ]
                        },
                        hljs.C_LINE_COMMENT_MODE,
                        hljs.C_BLOCK_COMMENT_MODE
                    ]
                },
                JAVA_NUMBER_MODE,
                {
                    className: 'meta', begin: '@[A-Za-z]+'
                }
            ]
        };
    };
},{}],25:[function(require,module,exports){
    module.exports = function(hljs) {
        return {
            aliases: ['js', 'jsx'],
            keywords: {
                keyword:
                'in of if for while finally var new function do return void else break catch ' +
                'instanceof with throw case default try this switch continue typeof delete ' +
                'let yield const export super debugger as async await static ' +
                    // ECMAScript 6 modules import
                'import from as'
                ,
                literal:
                    'true false null undefined NaN Infinity',
                built_in:
                'eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent ' +
                'encodeURI encodeURIComponent escape unescape Object Function Boolean Error ' +
                'EvalError InternalError RangeError ReferenceError StopIteration SyntaxError ' +
                'TypeError URIError Number Math Date String RegExp Array Float32Array ' +
                'Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array ' +
                'Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require ' +
                'module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect ' +
                'Promise'
            },
            contains: [
                {
                    className: 'meta',
                    relevance: 10,
                    begin: /^\s*['"]use (strict|asm)['"]/
                },
                {
                    className: 'meta',
                    begin: /^#!/, end: /$/
                },
                hljs.APOS_STRING_MODE,
                hljs.QUOTE_STRING_MODE,
                { // template string
                    className: 'string',
                    begin: '`', end: '`',
                    contains: [
                        hljs.BACKSLASH_ESCAPE,
                        {
                            className: 'subst',
                            begin: '\\$\\{', end: '\\}'
                        }
                    ]
                },
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE,
                {
                    className: 'number',
                    variants: [
                        { begin: '\\b(0[bB][01]+)' },
                        { begin: '\\b(0[oO][0-7]+)' },
                        { begin: hljs.C_NUMBER_RE }
                    ],
                    relevance: 0
                },
                { // "value" container
                    begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
                    keywords: 'return throw case',
                    contains: [
                        hljs.C_LINE_COMMENT_MODE,
                        hljs.C_BLOCK_COMMENT_MODE,
                        hljs.REGEXP_MODE,
                        { // E4X / JSX
                            begin: /</, end: /(\/\w+|\w+\/)>/,
                            subLanguage: 'xml',
                            contains: [
                                {begin: /<\w+\s*\/>/, skip: true},
                                {begin: /<\w+/, end: /(\/\w+|\w+\/)>/, skip: true, contains: ['self']}
                            ]
                        }
                    ],
                    relevance: 0
                },
                {
                    className: 'function',
                    beginKeywords: 'function', end: /\{/, excludeEnd: true,
                    contains: [
                        hljs.inherit(hljs.TITLE_MODE, {begin: /[A-Za-z$_][0-9A-Za-z$_]*/}),
                        {
                            className: 'params',
                            begin: /\(/, end: /\)/,
                            excludeBegin: true,
                            excludeEnd: true,
                            contains: [
                                hljs.C_LINE_COMMENT_MODE,
                                hljs.C_BLOCK_COMMENT_MODE
                            ]
                        }
                    ],
                    illegal: /\[|%/
                },
                {
                    begin: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
                },
                hljs.METHOD_GUARD,
                { // ES6 class
                    className: 'class',
                    beginKeywords: 'class', end: /[{;=]/, excludeEnd: true,
                    illegal: /[:"\[\]]/,
                    contains: [
                        {beginKeywords: 'extends'},
                        hljs.UNDERSCORE_TITLE_MODE
                    ]
                },
                {
                    beginKeywords: 'constructor', end: /\{/, excludeEnd: true
                }
            ],
            illegal: /#(?!!)/
        };
    };
},{}],26:[function(require,module,exports){
    module.exports = function(hljs) {
        var LITERALS = {literal: 'true false null'};
        var TYPES = [
            hljs.QUOTE_STRING_MODE,
            hljs.C_NUMBER_MODE
        ];
        var VALUE_CONTAINER = {
            end: ',', endsWithParent: true, excludeEnd: true,
            contains: TYPES,
            keywords: LITERALS
        };
        var OBJECT = {
            begin: '{', end: '}',
            contains: [
                {
                    className: 'attr',
                    begin: /"/, end: /"/,
                    contains: [hljs.BACKSLASH_ESCAPE],
                    illegal: '\\n',
                },
                hljs.inherit(VALUE_CONTAINER, {begin: /:/})
            ],
            illegal: '\\S'
        };
        var ARRAY = {
            begin: '\\[', end: '\\]',
            contains: [hljs.inherit(VALUE_CONTAINER)], // inherit is a workaround for a bug that makes shared modes with endsWithParent compile only the ending of one of the parents
            illegal: '\\S'
        };
        TYPES.splice(TYPES.length, 0, OBJECT, ARRAY);
        return {
            contains: TYPES,
            keywords: LITERALS,
            illegal: '\\S'
        };
    };
},{}],27:[function(require,module,exports){
    module.exports = function(hljs) {
        var IDENT_RE        = '[\\w-]+'; // yes, Less identifiers may begin with a digit
        var INTERP_IDENT_RE = '(' + IDENT_RE + '|@{' + IDENT_RE + '})';

        /* Generic Modes */

        var RULES = [], VALUE = []; // forward def. for recursive modes

        var STRING_MODE = function(c) { return {
            // Less strings are not multiline (also include '~' for more consistent coloring of "escaped" strings)
            className: 'string', begin: '~?' + c + '.*?' + c
        };};

        var IDENT_MODE = function(name, begin, relevance) { return {
            className: name, begin: begin, relevance: relevance
        };};

        var PARENS_MODE = {
            // used only to properly balance nested parens inside mixin call, def. arg list
            begin: '\\(', end: '\\)', contains: VALUE, relevance: 0
        };

        // generic Less highlighter (used almost everywhere except selectors):
        VALUE.push(
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            STRING_MODE("'"),
            STRING_MODE('"'),
            hljs.CSS_NUMBER_MODE, // fixme: it does not include dot for numbers like .5em :(
            {
                begin: '(url|data-uri)\\(',
                starts: {className: 'string', end: '[\\)\\n]', excludeEnd: true}
            },
            IDENT_MODE('number', '#[0-9A-Fa-f]+\\b'),
            PARENS_MODE,
            IDENT_MODE('variable', '@@?' + IDENT_RE, 10),
            IDENT_MODE('variable', '@{'  + IDENT_RE + '}'),
            IDENT_MODE('built_in', '~?`[^`]*?`'), // inline javascript (or whatever host language) *multiline* string
            { // @media features (it’s here to not duplicate things in AT_RULE_MODE with extra PARENS_MODE overriding):
                className: 'attribute', begin: IDENT_RE + '\\s*:', end: ':', returnBegin: true, excludeEnd: true
            },
            {
                className: 'meta',
                begin: '!important'
            }
        );

        var VALUE_WITH_RULESETS = VALUE.concat({
            begin: '{', end: '}', contains: RULES
        });

        var MIXIN_GUARD_MODE = {
            beginKeywords: 'when', endsWithParent: true,
            contains: [{beginKeywords: 'and not'}].concat(VALUE) // using this form to override VALUE’s 'function' match
        };

        /* Rule-Level Modes */

        var RULE_MODE = {
            begin: INTERP_IDENT_RE + '\\s*:', returnBegin: true, end: '[;}]',
            relevance: 0,
            contains: [
                {
                    className: 'attribute',
                    begin: INTERP_IDENT_RE, end: ':', excludeEnd: true,
                    starts: {
                        endsWithParent: true, illegal: '[<=$]',
                        relevance: 0,
                        contains: VALUE
                    }
                }
            ]
        };

        var AT_RULE_MODE = {
            className: 'keyword',
            begin: '@(import|media|charset|font-face|(-[a-z]+-)?keyframes|supports|document|namespace|page|viewport|host)\\b',
            starts: {end: '[;{}]', returnEnd: true, contains: VALUE, relevance: 0}
        };

        // variable definitions and calls
        var VAR_RULE_MODE = {
            className: 'variable',
            variants: [
                // using more strict pattern for higher relevance to increase chances of Less detection.
                // this is *the only* Less specific statement used in most of the sources, so...
                // (we’ll still often loose to the css-parser unless there's '//' comment,
                // simply because 1 variable just can't beat 99 properties :)
                {begin: '@' + IDENT_RE + '\\s*:', relevance: 15},
                {begin: '@' + IDENT_RE}
            ],
            starts: {end: '[;}]', returnEnd: true, contains: VALUE_WITH_RULESETS}
        };

        var SELECTOR_MODE = {
            // first parse unambiguous selectors (i.e. those not starting with tag)
            // then fall into the scary lookahead-discriminator variant.
            // this mode also handles mixin definitions and calls
            variants: [{
                begin: '[\\.#:&\\[>]', end: '[;{}]'  // mixin calls end with ';'
            }, {
                begin: INTERP_IDENT_RE + '[^;]*{',
                end: '{'
            }],
            returnBegin: true,
            returnEnd:   true,
            illegal: '[<=\'$"]',
            contains: [
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE,
                MIXIN_GUARD_MODE,
                IDENT_MODE('keyword',  'all\\b'),
                IDENT_MODE('variable', '@{'  + IDENT_RE + '}'),     // otherwise it’s identified as tag
                IDENT_MODE('selector-tag',  INTERP_IDENT_RE + '%?', 0), // '%' for more consistent coloring of @keyframes "tags"
                IDENT_MODE('selector-id', '#' + INTERP_IDENT_RE),
                IDENT_MODE('selector-class', '\\.' + INTERP_IDENT_RE, 0),
                IDENT_MODE('selector-tag',  '&', 0),
                {className: 'selector-attr', begin: '\\[', end: '\\]'},
                {className: 'selector-pseudo', begin: /:(:)?[a-zA-Z0-9\_\-\+\(\)"'.]+/},
                {begin: '\\(', end: '\\)', contains: VALUE_WITH_RULESETS}, // argument list of parametric mixins
                {begin: '!important'} // eat !important after mixin call or it will be colored as tag
            ]
        };

        RULES.push(
            hljs.C_LINE_COMMENT_MODE,
            hljs.C_BLOCK_COMMENT_MODE,
            AT_RULE_MODE,
            VAR_RULE_MODE,
            RULE_MODE,
            SELECTOR_MODE
        );

        return {
            case_insensitive: true,
            illegal: '[=>\'/<($"]',
            contains: RULES
        };
    };
},{}],28:[function(require,module,exports){
    module.exports = function(hljs) {
        var LISP_IDENT_RE = '[a-zA-Z_\\-\\+\\*\\/\\<\\=\\>\\&\\#][a-zA-Z0-9_\\-\\+\\*\\/\\<\\=\\>\\&\\#!]*';
        var MEC_RE = '\\|[^]*?\\|';
        var LISP_SIMPLE_NUMBER_RE = '(\\-|\\+)?\\d+(\\.\\d+|\\/\\d+)?((d|e|f|l|s|D|E|F|L|S)(\\+|\\-)?\\d+)?';
        var SHEBANG = {
            className: 'meta',
            begin: '^#!', end: '$'
        };
        var LITERAL = {
            className: 'literal',
            begin: '\\b(t{1}|nil)\\b'
        };
        var NUMBER = {
            className: 'number',
            variants: [
                {begin: LISP_SIMPLE_NUMBER_RE, relevance: 0},
                {begin: '#(b|B)[0-1]+(/[0-1]+)?'},
                {begin: '#(o|O)[0-7]+(/[0-7]+)?'},
                {begin: '#(x|X)[0-9a-fA-F]+(/[0-9a-fA-F]+)?'},
                {begin: '#(c|C)\\(' + LISP_SIMPLE_NUMBER_RE + ' +' + LISP_SIMPLE_NUMBER_RE, end: '\\)'}
            ]
        };
        var STRING = hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null});
        var COMMENT = hljs.COMMENT(
            ';', '$',
            {
                relevance: 0
            }
        );
        var VARIABLE = {
            begin: '\\*', end: '\\*'
        };
        var KEYWORD = {
            className: 'symbol',
            begin: '[:&]' + LISP_IDENT_RE
        };
        var IDENT = {
            begin: LISP_IDENT_RE,
            relevance: 0
        };
        var MEC = {
            begin: MEC_RE
        };
        var QUOTED_LIST = {
            begin: '\\(', end: '\\)',
            contains: ['self', LITERAL, STRING, NUMBER, IDENT]
        };
        var QUOTED = {
            contains: [NUMBER, STRING, VARIABLE, KEYWORD, QUOTED_LIST, IDENT],
            variants: [
                {
                    begin: '[\'`]\\(', end: '\\)'
                },
                {
                    begin: '\\(quote ', end: '\\)',
                    keywords: {name: 'quote'}
                },
                {
                    begin: '\'' + MEC_RE
                }
            ]
        };
        var QUOTED_ATOM = {
            variants: [
                {begin: '\'' + LISP_IDENT_RE},
                {begin: '#\'' + LISP_IDENT_RE + '(::' + LISP_IDENT_RE + ')*'}
            ]
        };
        var LIST = {
            begin: '\\(\\s*', end: '\\)'
        };
        var BODY = {
            endsWithParent: true,
            relevance: 0
        };
        LIST.contains = [
            {
                className: 'name',
                variants: [
                    {begin: LISP_IDENT_RE},
                    {begin: MEC_RE}
                ]
            },
            BODY
        ];
        BODY.contains = [QUOTED, QUOTED_ATOM, LIST, LITERAL, NUMBER, STRING, COMMENT, VARIABLE, KEYWORD, MEC, IDENT];

        return {
            illegal: /\S/,
            contains: [
                NUMBER,
                SHEBANG,
                LITERAL,
                STRING,
                COMMENT,
                QUOTED,
                QUOTED_ATOM,
                LIST,
                IDENT
            ]
        };
    };
},{}],29:[function(require,module,exports){
    module.exports = function(hljs) {
        var KEYWORDS = {
            keyword:
            // JS keywords
            'in if for while finally new do return else break catch instanceof throw try this ' +
            'switch continue typeof delete debugger case default function var with ' +
                // LiveScript keywords
            'then unless until loop of by when and or is isnt not it that otherwise from to til fallthrough super ' +
            'case default function var void const let enum export import native ' +
            '__hasProp __extends __slice __bind __indexOf',
            literal:
            // JS literals
            'true false null undefined ' +
                // LiveScript literals
            'yes no on off it that void',
            built_in:
                'npm require console print module global window document'
        };
        var JS_IDENT_RE = '[A-Za-z$_](?:\-[0-9A-Za-z$_]|[0-9A-Za-z$_])*';
        var TITLE = hljs.inherit(hljs.TITLE_MODE, {begin: JS_IDENT_RE});
        var SUBST = {
            className: 'subst',
            begin: /#\{/, end: /}/,
            keywords: KEYWORDS
        };
        var SUBST_SIMPLE = {
            className: 'subst',
            begin: /#[A-Za-z$_]/, end: /(?:\-[0-9A-Za-z$_]|[0-9A-Za-z$_])*/,
            keywords: KEYWORDS
        };
        var EXPRESSIONS = [
            hljs.BINARY_NUMBER_MODE,
            {
                className: 'number',
                begin: '(\\b0[xX][a-fA-F0-9_]+)|(\\b\\d(\\d|_\\d)*(\\.(\\d(\\d|_\\d)*)?)?(_*[eE]([-+]\\d(_\\d|\\d)*)?)?[_a-z]*)',
                relevance: 0,
                starts: {end: '(\\s*/)?', relevance: 0} // a number tries to eat the following slash to prevent treating it as a regexp
            },
            {
                className: 'string',
                variants: [
                    {
                        begin: /'''/, end: /'''/,
                        contains: [hljs.BACKSLASH_ESCAPE]
                    },
                    {
                        begin: /'/, end: /'/,
                        contains: [hljs.BACKSLASH_ESCAPE]
                    },
                    {
                        begin: /"""/, end: /"""/,
                        contains: [hljs.BACKSLASH_ESCAPE, SUBST, SUBST_SIMPLE]
                    },
                    {
                        begin: /"/, end: /"/,
                        contains: [hljs.BACKSLASH_ESCAPE, SUBST, SUBST_SIMPLE]
                    },
                    {
                        begin: /\\/, end: /(\s|$)/,
                        excludeEnd: true
                    }
                ]
            },
            {
                className: 'regexp',
                variants: [
                    {
                        begin: '//', end: '//[gim]*',
                        contains: [SUBST, hljs.HASH_COMMENT_MODE]
                    },
                    {
                        // regex can't start with space to parse x / 2 / 3 as two divisions
                        // regex can't start with *, and it supports an "illegal" in the main mode
                        begin: /\/(?![ *])(\\\/|.)*?\/[gim]*(?=\W|$)/
                    }
                ]
            },
            {
                begin: '@' + JS_IDENT_RE
            },
            {
                begin: '``', end: '``',
                excludeBegin: true, excludeEnd: true,
                subLanguage: 'javascript'
            }
        ];
        SUBST.contains = EXPRESSIONS;

        var PARAMS = {
            className: 'params',
            begin: '\\(', returnBegin: true,
            /* We need another contained nameless mode to not have every nested
             pair of parens to be called "params" */
            contains: [
                {
                    begin: /\(/, end: /\)/,
                    keywords: KEYWORDS,
                    contains: ['self'].concat(EXPRESSIONS)
                }
            ]
        };

        return {
            aliases: ['ls'],
            keywords: KEYWORDS,
            illegal: /\/\*/,
            contains: EXPRESSIONS.concat([
                hljs.COMMENT('\\/\\*', '\\*\\/'),
                hljs.HASH_COMMENT_MODE,
                {
                    className: 'function',
                    contains: [TITLE, PARAMS],
                    returnBegin: true,
                    variants: [
                        {
                            begin: '(' + JS_IDENT_RE + '\\s*(?:=|:=)\\s*)?(\\(.*\\))?\\s*\\B\\->\\*?', end: '\\->\\*?'
                        },
                        {
                            begin: '(' + JS_IDENT_RE + '\\s*(?:=|:=)\\s*)?!?(\\(.*\\))?\\s*\\B[-~]{1,2}>\\*?', end: '[-~]{1,2}>\\*?'
                        },
                        {
                            begin: '(' + JS_IDENT_RE + '\\s*(?:=|:=)\\s*)?(\\(.*\\))?\\s*\\B!?[-~]{1,2}>\\*?', end: '!?[-~]{1,2}>\\*?'
                        }
                    ]
                },
                {
                    className: 'class',
                    beginKeywords: 'class',
                    end: '$',
                    illegal: /[:="\[\]]/,
                    contains: [
                        {
                            beginKeywords: 'extends',
                            endsWithParent: true,
                            illegal: /[:="\[\]]/,
                            contains: [TITLE]
                        },
                        TITLE
                    ]
                },
                {
                    begin: JS_IDENT_RE + ':', end: ':',
                    returnBegin: true, returnEnd: true,
                    relevance: 0
                }
            ])
        };
    };
},{}],30:[function(require,module,exports){
    module.exports = function(hljs) {
        var OPENING_LONG_BRACKET = '\\[=*\\[';
        var CLOSING_LONG_BRACKET = '\\]=*\\]';
        var LONG_BRACKETS = {
            begin: OPENING_LONG_BRACKET, end: CLOSING_LONG_BRACKET,
            contains: ['self']
        };
        var COMMENTS = [
            hljs.COMMENT('--(?!' + OPENING_LONG_BRACKET + ')', '$'),
            hljs.COMMENT(
                '--' + OPENING_LONG_BRACKET,
                CLOSING_LONG_BRACKET,
                {
                    contains: [LONG_BRACKETS],
                    relevance: 10
                }
            )
        ];
        return {
            lexemes: hljs.UNDERSCORE_IDENT_RE,
            keywords: {
                keyword:
                'and break do else elseif end false for if in local nil not or repeat return then ' +
                'true until while',
                built_in:
                '_G _VERSION assert collectgarbage dofile error getfenv getmetatable ipairs load ' +
                'loadfile loadstring module next pairs pcall print rawequal rawget rawset require ' +
                'select setfenv setmetatable tonumber tostring type unpack xpcall coroutine debug ' +
                'io math os package string table'
            },
            contains: COMMENTS.concat([
                {
                    className: 'function',
                    beginKeywords: 'function', end: '\\)',
                    contains: [
                        hljs.inherit(hljs.TITLE_MODE, {begin: '([_a-zA-Z]\\w*\\.)*([_a-zA-Z]\\w*:)?[_a-zA-Z]\\w*'}),
                        {
                            className: 'params',
                            begin: '\\(', endsWithParent: true,
                            contains: COMMENTS
                        }
                    ].concat(COMMENTS)
                },
                hljs.C_NUMBER_MODE,
                hljs.APOS_STRING_MODE,
                hljs.QUOTE_STRING_MODE,
                {
                    className: 'string',
                    begin: OPENING_LONG_BRACKET, end: CLOSING_LONG_BRACKET,
                    contains: [LONG_BRACKETS],
                    relevance: 5
                }
            ])
        };
    };
},{}],31:[function(require,module,exports){
    module.exports = function(hljs) {
        var VARIABLE = {
            className: 'variable',
            begin: /\$\(/, end: /\)/,
            contains: [hljs.BACKSLASH_ESCAPE]
        };
        return {
            aliases: ['mk', 'mak'],
            contains: [
                hljs.HASH_COMMENT_MODE,
                {
                    begin: /^\w+\s*\W*=/, returnBegin: true,
                    relevance: 0,
                    starts: {
                        end: /\s*\W*=/, excludeEnd: true,
                        starts: {
                            end: /$/,
                            relevance: 0,
                            contains: [
                                VARIABLE
                            ]
                        }
                    }
                },
                {
                    className: 'section',
                    begin: /^[\w]+:\s*$/
                },
                {
                    className: 'meta',
                    begin: /^\.PHONY:/, end: /$/,
                    keywords: {'meta-keyword': '.PHONY'}, lexemes: /[\.\w]+/
                },
                {
                    begin: /^\t+/, end: /$/,
                    relevance: 0,
                    contains: [
                        hljs.QUOTE_STRING_MODE,
                        VARIABLE
                    ]
                }
            ]
        };
    };
},{}],32:[function(require,module,exports){
    module.exports = function(hljs) {
        var COMMON_CONTAINS = [
            hljs.C_NUMBER_MODE,
            {
                className: 'string',
                begin: '\'', end: '\'',
                contains: [hljs.BACKSLASH_ESCAPE, {begin: '\'\''}]
            }
        ];
        var TRANSPOSE = {
            relevance: 0,
            contains: [
                {
                    begin: /'['\.]*/
                }
            ]
        };

        return {
            keywords: {
                keyword:
                'break case catch classdef continue else elseif end enumerated events for function ' +
                'global if methods otherwise parfor persistent properties return spmd switch try while',
                built_in:
                'sin sind sinh asin asind asinh cos cosd cosh acos acosd acosh tan tand tanh atan ' +
                'atand atan2 atanh sec secd sech asec asecd asech csc cscd csch acsc acscd acsch cot ' +
                'cotd coth acot acotd acoth hypot exp expm1 log log1p log10 log2 pow2 realpow reallog ' +
                'realsqrt sqrt nthroot nextpow2 abs angle complex conj imag real unwrap isreal ' +
                'cplxpair fix floor ceil round mod rem sign airy besselj bessely besselh besseli ' +
                'besselk beta betainc betaln ellipj ellipke erf erfc erfcx erfinv expint gamma ' +
                'gammainc gammaln psi legendre cross dot factor isprime primes gcd lcm rat rats perms ' +
                'nchoosek factorial cart2sph cart2pol pol2cart sph2cart hsv2rgb rgb2hsv zeros ones ' +
                'eye repmat rand randn linspace logspace freqspace meshgrid accumarray size length ' +
                'ndims numel disp isempty isequal isequalwithequalnans cat reshape diag blkdiag tril ' +
                'triu fliplr flipud flipdim rot90 find sub2ind ind2sub bsxfun ndgrid permute ipermute ' +
                'shiftdim circshift squeeze isscalar isvector ans eps realmax realmin pi i inf nan ' +
                'isnan isinf isfinite j why compan gallery hadamard hankel hilb invhilb magic pascal ' +
                'rosser toeplitz vander wilkinson'
            },
            illegal: '(//|"|#|/\\*|\\s+/\\w+)',
            contains: [
                {
                    className: 'function',
                    beginKeywords: 'function', end: '$',
                    contains: [
                        hljs.UNDERSCORE_TITLE_MODE,
                        {
                            className: 'params',
                            variants: [
                                {begin: '\\(', end: '\\)'},
                                {begin: '\\[', end: '\\]'}
                            ]
                        }
                    ]
                },
                {
                    begin: /[a-zA-Z_][a-zA-Z_0-9]*'['\.]*/,
                    returnBegin: true,
                    relevance: 0,
                    contains: [
                        {begin: /[a-zA-Z_][a-zA-Z_0-9]*/, relevance: 0},
                        TRANSPOSE.contains[0]
                    ]
                },
                {
                    begin: '\\[', end: '\\]',
                    contains: COMMON_CONTAINS,
                    relevance: 0,
                    starts: TRANSPOSE
                },
                {
                    begin: '\\{', end: /}/,
                    contains: COMMON_CONTAINS,
                    relevance: 0,
                    starts: TRANSPOSE
                },
                {
                    // transpose operators at the end of a function call
                    begin: /\)/,
                    relevance: 0,
                    starts: TRANSPOSE
                },
                hljs.COMMENT('^\\s*\\%\\{\\s*$', '^\\s*\\%\\}\\s*$'),
                hljs.COMMENT('\\%', '$')
            ].concat(COMMON_CONTAINS)
        };
    };
},{}],33:[function(require,module,exports){
    module.exports = function(hljs) {
        //local labels: %?[FB]?[AT]?\d{1,2}\w+
        return {
            case_insensitive: true,
            aliases: ['mips'],
            lexemes: '\\.?' + hljs.IDENT_RE,
            keywords: {
                meta:
                //GNU preprocs
                    '.2byte .4byte .align .ascii .asciz .balign .byte .code .data .else .end .endif .endm .endr .equ .err .exitm .extern .global .hword .if .ifdef .ifndef .include .irp .long .macro .rept .req .section .set .skip .space .text .word .ltorg ',
                built_in:
                '$0 $1 $2 $3 $4 $5 $6 $7 $8 $9 $10 $11 $12 $13 $14 $15 ' + // integer registers
                '$16 $17 $18 $19 $20 $21 $22 $23 $24 $25 $26 $27 $28 $29 $30 $31 ' + // integer registers
                'zero at v0 v1 a0 a1 a2 a3 a4 a5 a6 a7 ' + // integer register aliases
                't0 t1 t2 t3 t4 t5 t6 t7 t8 t9 s0 s1 s2 s3 s4 s5 s6 s7 s8 ' + // integer register aliases
                'k0 k1 gp sp fp ra ' + // integer register aliases
                '$f0 $f1 $f2 $f2 $f4 $f5 $f6 $f7 $f8 $f9 $f10 $f11 $f12 $f13 $f14 $f15 ' + // floating-point registers
                '$f16 $f17 $f18 $f19 $f20 $f21 $f22 $f23 $f24 $f25 $f26 $f27 $f28 $f29 $f30 $f31 ' + // floating-point registers
                'Context Random EntryLo0 EntryLo1 Context PageMask Wired EntryHi ' + // Coprocessor 0 registers
                'HWREna BadVAddr Count Compare SR IntCtl SRSCtl SRSMap Cause EPC PRId ' + // Coprocessor 0 registers
                'EBase Config Config1 Config2 Config3 LLAddr Debug DEPC DESAVE CacheErr ' + // Coprocessor 0 registers
                'ECC ErrorEPC TagLo DataLo TagHi DataHi WatchLo WatchHi PerfCtl PerfCnt ' // Coprocessor 0 registers
            },
            contains: [
                {
                    className: 'keyword',
                    begin: '\\b('+     //mnemonics
                                       // 32-bit integer instructions
                    'addi?u?|andi?|b(al)?|beql?|bgez(al)?l?|bgtzl?|blezl?|bltz(al)?l?|' +
                    'bnel?|cl[oz]|divu?|ext|ins|j(al)?|jalr(\.hb)?|jr(\.hb)?|lbu?|lhu?|' +
                    'll|lui|lw[lr]?|maddu?|mfhi|mflo|movn|movz|move|msubu?|mthi|mtlo|mul|' +
                    'multu?|nop|nor|ori?|rotrv?|sb|sc|se[bh]|sh|sllv?|slti?u?|srav?|' +
                    'srlv?|subu?|sw[lr]?|xori?|wsbh|' +
                        // floating-point instructions
                    'abs\.[sd]|add\.[sd]|alnv.ps|bc1[ft]l?|' +
                    'c\.(s?f|un|u?eq|[ou]lt|[ou]le|ngle?|seq|l[et]|ng[et])\.[sd]|' +
                    '(ceil|floor|round|trunc)\.[lw]\.[sd]|cfc1|cvt\.d\.[lsw]|' +
                    'cvt\.l\.[dsw]|cvt\.ps\.s|cvt\.s\.[dlw]|cvt\.s\.p[lu]|cvt\.w\.[dls]|' +
                    'div\.[ds]|ldx?c1|luxc1|lwx?c1|madd\.[sd]|mfc1|mov[fntz]?\.[ds]|' +
                    'msub\.[sd]|mth?c1|mul\.[ds]|neg\.[ds]|nmadd\.[ds]|nmsub\.[ds]|' +
                    'p[lu][lu]\.ps|recip\.fmt|r?sqrt\.[ds]|sdx?c1|sub\.[ds]|suxc1|' +
                    'swx?c1|' +
                        // system control instructions
                    'break|cache|d?eret|[de]i|ehb|mfc0|mtc0|pause|prefx?|rdhwr|' +
                    'rdpgpr|sdbbp|ssnop|synci?|syscall|teqi?|tgei?u?|tlb(p|r|w[ir])|' +
                    'tlti?u?|tnei?|wait|wrpgpr'+
                    ')',
                    end: '\\s'
                },
                hljs.COMMENT('[;#]', '$'),
                hljs.C_BLOCK_COMMENT_MODE,
                hljs.QUOTE_STRING_MODE,
                {
                    className: 'string',
                    begin: '\'',
                    end: '[^\\\\]\'',
                    relevance: 0
                },
                {
                    className: 'title',
                    begin: '\\|', end: '\\|',
                    illegal: '\\n',
                    relevance: 0
                },
                {
                    className: 'number',
                    variants: [
                        {begin: '0x[0-9a-f]+'}, //hex
                        {begin: '\\b-?\\d+'}           //bare number
                    ],
                    relevance: 0
                },
                {
                    className: 'symbol',
                    variants: [
                        {begin: '^\\s*[a-z_\\.\\$][a-z0-9_\\.\\$]+:'}, //GNU MIPS syntax
                        {begin: '^\\s*[0-9]+:'}, // numbered local labels
                        {begin: '[0-9]+[bf]' }  // number local label reference (backwards, forwards)
                    ],
                    relevance: 0
                }
            ],
            illegal: '\/'
        };
    };
},{}],34:[function(require,module,exports){
    module.exports = function(hljs) {
        var VAR = {
            className: 'variable',
            variants: [
                {begin: /\$\d+/},
                {begin: /\$\{/, end: /}/},
                {begin: '[\\$\\@]' + hljs.UNDERSCORE_IDENT_RE}
            ]
        };
        var DEFAULT = {
            endsWithParent: true,
            lexemes: '[a-z/_]+',
            keywords: {
                literal:
                'on off yes no true false none blocked debug info notice warn error crit ' +
                'select break last permanent redirect kqueue rtsig epoll poll /dev/poll'
            },
            relevance: 0,
            illegal: '=>',
            contains: [
                hljs.HASH_COMMENT_MODE,
                {
                    className: 'string',
                    contains: [hljs.BACKSLASH_ESCAPE, VAR],
                    variants: [
                        {begin: /"/, end: /"/},
                        {begin: /'/, end: /'/}
                    ]
                },
                // this swallows entire URLs to avoid detecting numbers within
                {
                    begin: '([a-z]+):/', end: '\\s', endsWithParent: true, excludeEnd: true,
                    contains: [VAR]
                },
                {
                    className: 'regexp',
                    contains: [hljs.BACKSLASH_ESCAPE, VAR],
                    variants: [
                        {begin: "\\s\\^", end: "\\s|{|;", returnEnd: true},
                        // regexp locations (~, ~*)
                        {begin: "~\\*?\\s+", end: "\\s|{|;", returnEnd: true},
                        // *.example.com
                        {begin: "\\*(\\.[a-z\\-]+)+"},
                        // sub.example.*
                        {begin: "([a-z\\-]+\\.)+\\*"}
                    ]
                },
                // IP
                {
                    className: 'number',
                    begin: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(:\\d{1,5})?\\b'
                },
                // units
                {
                    className: 'number',
                    begin: '\\b\\d+[kKmMgGdshdwy]*\\b',
                    relevance: 0
                },
                VAR
            ]
        };

        return {
            aliases: ['nginxconf'],
            contains: [
                hljs.HASH_COMMENT_MODE,
                {
                    begin: hljs.UNDERSCORE_IDENT_RE + '\\s+{', returnBegin: true,
                    end: '{',
                    contains: [
                        {
                            className: 'section',
                            begin: hljs.UNDERSCORE_IDENT_RE
                        }
                    ],
                    relevance: 0
                },
                {
                    begin: hljs.UNDERSCORE_IDENT_RE + '\\s', end: ';|{', returnBegin: true,
                    contains: [
                        {
                            className: 'attribute',
                            begin: hljs.UNDERSCORE_IDENT_RE,
                            starts: DEFAULT
                        }
                    ],
                    relevance: 0
                }
            ],
            illegal: '[^\\s\\}]'
        };
    };
},{}],35:[function(require,module,exports){
    module.exports = function(hljs) {
        var API_CLASS = {
            className: 'built_in',
            begin: '\\b(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)\\w+',
        };
        var OBJC_KEYWORDS = {
            keyword:
            'int float while char export sizeof typedef const struct for union ' +
            'unsigned long volatile static bool mutable if do return goto void ' +
            'enum else break extern asm case short default double register explicit ' +
            'signed typename this switch continue wchar_t inline readonly assign ' +
            'readwrite self @synchronized id typeof ' +
            'nonatomic super unichar IBOutlet IBAction strong weak copy ' +
            'in out inout bycopy byref oneway __strong __weak __block __autoreleasing ' +
            '@private @protected @public @try @property @end @throw @catch @finally ' +
            '@autoreleasepool @synthesize @dynamic @selector @optional @required ' +
            '@encode @package @import @defs @compatibility_alias ' +
            '__bridge __bridge_transfer __bridge_retained __bridge_retain ' +
            '__covariant __contravariant __kindof ' +
            '_Nonnull _Nullable _Null_unspecified ' +
            '__FUNCTION__ __PRETTY_FUNCTION__ __attribute__ ' +
            'getter setter retain unsafe_unretained ' +
            'nonnull nullable null_unspecified null_resettable class instancetype ' +
            'NS_DESIGNATED_INITIALIZER NS_UNAVAILABLE NS_REQUIRES_SUPER ' +
            'NS_RETURNS_INNER_POINTER NS_INLINE NS_AVAILABLE NS_DEPRECATED ' +
            'NS_ENUM NS_OPTIONS NS_SWIFT_UNAVAILABLE ' +
            'NS_ASSUME_NONNULL_BEGIN NS_ASSUME_NONNULL_END ' +
            'NS_REFINED_FOR_SWIFT NS_SWIFT_NAME NS_SWIFT_NOTHROW ' +
            'NS_DURING NS_HANDLER NS_ENDHANDLER NS_VALUERETURN NS_VOIDRETURN',
            literal:
                'false true FALSE TRUE nil YES NO NULL',
            built_in:
                'BOOL dispatch_once_t dispatch_queue_t dispatch_sync dispatch_async dispatch_once'
        };
        var LEXEMES = /[a-zA-Z@][a-zA-Z0-9_]*/;
        var CLASS_KEYWORDS = '@interface @class @protocol @implementation';
        return {
            aliases: ['mm', 'objc', 'obj-c'],
            keywords: OBJC_KEYWORDS,
            lexemes: LEXEMES,
            illegal: '</',
            contains: [
                API_CLASS,
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE,
                hljs.C_NUMBER_MODE,
                hljs.QUOTE_STRING_MODE,
                {
                    className: 'string',
                    variants: [
                        {
                            begin: '@"', end: '"',
                            illegal: '\\n',
                            contains: [hljs.BACKSLASH_ESCAPE]
                        },
                        {
                            begin: '\'', end: '[^\\\\]\'',
                            illegal: '[^\\\\][^\']'
                        }
                    ]
                },
                {
                    className: 'meta',
                    begin: '#',
                    end: '$',
                    contains: [
                        {
                            className: 'meta-string',
                            variants: [
                                { begin: '\"', end: '\"' },
                                { begin: '<', end: '>' }
                            ]
                        }
                    ]
                },
                {
                    className: 'class',
                    begin: '(' + CLASS_KEYWORDS.split(' ').join('|') + ')\\b', end: '({|$)', excludeEnd: true,
                    keywords: CLASS_KEYWORDS, lexemes: LEXEMES,
                    contains: [
                        hljs.UNDERSCORE_TITLE_MODE
                    ]
                },
                {
                    begin: '\\.'+hljs.UNDERSCORE_IDENT_RE,
                    relevance: 0
                }
            ]
        };
    };
},{}],36:[function(require,module,exports){
    module.exports = function(hljs) {
        var PERL_KEYWORDS = 'getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ' +
            'ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime ' +
            'readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qq' +
            'fileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent ' +
            'shutdown dump chomp connect getsockname die socketpair close flock exists index shmget' +
            'sub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr ' +
            'unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 ' +
            'getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline ' +
            'endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand ' +
            'mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink ' +
            'getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr ' +
            'untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link ' +
            'getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller ' +
            'lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and ' +
            'sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 ' +
            'chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach ' +
            'tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedir' +
            'ioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe ' +
            'atan2 getgrent exp time push setgrent gt lt or ne m|0 break given say state when';
        var SUBST = {
            className: 'subst',
            begin: '[$@]\\{', end: '\\}',
            keywords: PERL_KEYWORDS
        };
        var METHOD = {
            begin: '->{', end: '}'
            // contains defined later
        };
        var VAR = {
            variants: [
                {begin: /\$\d/},
                {begin: /[\$%@](\^\w\b|#\w+(::\w+)*|{\w+}|\w+(::\w*)*)/},
                {begin: /[\$%@][^\s\w{]/, relevance: 0}
            ]
        };
        var STRING_CONTAINS = [hljs.BACKSLASH_ESCAPE, SUBST, VAR];
        var PERL_DEFAULT_CONTAINS = [
            VAR,
            hljs.HASH_COMMENT_MODE,
            hljs.COMMENT(
                '^\\=\\w',
                '\\=cut',
                {
                    endsWithParent: true
                }
            ),
            METHOD,
            {
                className: 'string',
                contains: STRING_CONTAINS,
                variants: [
                    {
                        begin: 'q[qwxr]?\\s*\\(', end: '\\)',
                        relevance: 5
                    },
                    {
                        begin: 'q[qwxr]?\\s*\\[', end: '\\]',
                        relevance: 5
                    },
                    {
                        begin: 'q[qwxr]?\\s*\\{', end: '\\}',
                        relevance: 5
                    },
                    {
                        begin: 'q[qwxr]?\\s*\\|', end: '\\|',
                        relevance: 5
                    },
                    {
                        begin: 'q[qwxr]?\\s*\\<', end: '\\>',
                        relevance: 5
                    },
                    {
                        begin: 'qw\\s+q', end: 'q',
                        relevance: 5
                    },
                    {
                        begin: '\'', end: '\'',
                        contains: [hljs.BACKSLASH_ESCAPE]
                    },
                    {
                        begin: '"', end: '"'
                    },
                    {
                        begin: '`', end: '`',
                        contains: [hljs.BACKSLASH_ESCAPE]
                    },
                    {
                        begin: '{\\w+}',
                        contains: [],
                        relevance: 0
                    },
                    {
                        begin: '\-?\\w+\\s*\\=\\>',
                        contains: [],
                        relevance: 0
                    }
                ]
            },
            {
                className: 'number',
                begin: '(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b',
                relevance: 0
            },
            { // regexp container
                begin: '(\\/\\/|' + hljs.RE_STARTERS_RE + '|\\b(split|return|print|reverse|grep)\\b)\\s*',
                keywords: 'split return print reverse grep',
                relevance: 0,
                contains: [
                    hljs.HASH_COMMENT_MODE,
                    {
                        className: 'regexp',
                        begin: '(s|tr|y)/(\\\\.|[^/])*/(\\\\.|[^/])*/[a-z]*',
                        relevance: 10
                    },
                    {
                        className: 'regexp',
                        begin: '(m|qr)?/', end: '/[a-z]*',
                        contains: [hljs.BACKSLASH_ESCAPE],
                        relevance: 0 // allows empty "//" which is a common comment delimiter in other languages
                    }
                ]
            },
            {
                className: 'function',
                beginKeywords: 'sub', end: '(\\s*\\(.*?\\))?[;{]', excludeEnd: true,
                relevance: 5,
                contains: [hljs.TITLE_MODE]
            },
            {
                begin: '-\\w\\b',
                relevance: 0
            },
            {
                begin: "^__DATA__$",
                end: "^__END__$",
                subLanguage: 'mojolicious',
                contains: [
                    {
                        begin: "^@@.*",
                        end: "$",
                        className: "comment"
                    }
                ]
            }
        ];
        SUBST.contains = PERL_DEFAULT_CONTAINS;
        METHOD.contains = PERL_DEFAULT_CONTAINS;

        return {
            aliases: ['pl', 'pm'],
            lexemes: /[\w\.]+/,
            keywords: PERL_KEYWORDS,
            contains: PERL_DEFAULT_CONTAINS
        };
    };
},{}],37:[function(require,module,exports){
    module.exports = function(hljs) {
        var VARIABLE = {
            begin: '\\$+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*'
        };
        var PREPROCESSOR = {
            className: 'meta', begin: /<\?(php)?|\?>/
        };
        var STRING = {
            className: 'string',
            contains: [hljs.BACKSLASH_ESCAPE, PREPROCESSOR],
            variants: [
                {
                    begin: 'b"', end: '"'
                },
                {
                    begin: 'b\'', end: '\''
                },
                hljs.inherit(hljs.APOS_STRING_MODE, {illegal: null}),
                hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null})
            ]
        };
        var NUMBER = {variants: [hljs.BINARY_NUMBER_MODE, hljs.C_NUMBER_MODE]};
        return {
            aliases: ['php3', 'php4', 'php5', 'php6'],
            case_insensitive: true,
            keywords:
            'and include_once list abstract global private echo interface as static endswitch ' +
            'array null if endwhile or const for endforeach self var while isset public ' +
            'protected exit foreach throw elseif include __FILE__ empty require_once do xor ' +
            'return parent clone use __CLASS__ __LINE__ else break print eval new ' +
            'catch __METHOD__ case exception default die require __FUNCTION__ ' +
            'enddeclare final try switch continue endfor endif declare unset true false ' +
            'trait goto instanceof insteadof __DIR__ __NAMESPACE__ ' +
            'yield finally',
            contains: [
                hljs.HASH_COMMENT_MODE,
                hljs.COMMENT('//', '$', {contains: [PREPROCESSOR]}),
                hljs.COMMENT(
                    '/\\*',
                    '\\*/',
                    {
                        contains: [
                            {
                                className: 'doctag',
                                begin: '@[A-Za-z]+'
                            }
                        ]
                    }
                ),
                hljs.COMMENT(
                    '__halt_compiler.+?;',
                    false,
                    {
                        endsWithParent: true,
                        keywords: '__halt_compiler',
                        lexemes: hljs.UNDERSCORE_IDENT_RE
                    }
                ),
                {
                    className: 'string',
                    begin: /<<<['"]?\w+['"]?$/, end: /^\w+;?$/,
                    contains: [
                        hljs.BACKSLASH_ESCAPE,
                        {
                            className: 'subst',
                            variants: [
                                {begin: /\$\w+/},
                                {begin: /\{\$/, end: /\}/}
                            ]
                        }
                    ]
                },
                PREPROCESSOR,
                {
                    className: 'keyword', begin: /\$this\b/
                },
                VARIABLE,
                {
                    // swallow composed identifiers to avoid parsing them as keywords
                    begin: /(::|->)+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/
                },
                {
                    className: 'function',
                    beginKeywords: 'function', end: /[;{]/, excludeEnd: true,
                    illegal: '\\$|\\[|%',
                    contains: [
                        hljs.UNDERSCORE_TITLE_MODE,
                        {
                            className: 'params',
                            begin: '\\(', end: '\\)',
                            contains: [
                                'self',
                                VARIABLE,
                                hljs.C_BLOCK_COMMENT_MODE,
                                STRING,
                                NUMBER
                            ]
                        }
                    ]
                },
                {
                    className: 'class',
                    beginKeywords: 'class interface', end: '{', excludeEnd: true,
                    illegal: /[:\(\$"]/,
                    contains: [
                        {beginKeywords: 'extends implements'},
                        hljs.UNDERSCORE_TITLE_MODE
                    ]
                },
                {
                    beginKeywords: 'namespace', end: ';',
                    illegal: /[\.']/,
                    contains: [hljs.UNDERSCORE_TITLE_MODE]
                },
                {
                    beginKeywords: 'use', end: ';',
                    contains: [hljs.UNDERSCORE_TITLE_MODE]
                },
                {
                    begin: '=>' // No markup, just a relevance booster
                },
                STRING,
                NUMBER
            ]
        };
    };
},{}],38:[function(require,module,exports){
    module.exports = function(hljs) {
        var PROMPT = {
            className: 'meta',  begin: /^(>>>|\.\.\.) /
        };
        var STRING = {
            className: 'string',
            contains: [hljs.BACKSLASH_ESCAPE],
            variants: [
                {
                    begin: /(u|b)?r?'''/, end: /'''/,
                    contains: [PROMPT],
                    relevance: 10
                },
                {
                    begin: /(u|b)?r?"""/, end: /"""/,
                    contains: [PROMPT],
                    relevance: 10
                },
                {
                    begin: /(u|r|ur)'/, end: /'/,
                    relevance: 10
                },
                {
                    begin: /(u|r|ur)"/, end: /"/,
                    relevance: 10
                },
                {
                    begin: /(b|br)'/, end: /'/
                },
                {
                    begin: /(b|br)"/, end: /"/
                },
                hljs.APOS_STRING_MODE,
                hljs.QUOTE_STRING_MODE
            ]
        };
        var NUMBER = {
            className: 'number', relevance: 0,
            variants: [
                {begin: hljs.BINARY_NUMBER_RE + '[lLjJ]?'},
                {begin: '\\b(0o[0-7]+)[lLjJ]?'},
                {begin: hljs.C_NUMBER_RE + '[lLjJ]?'}
            ]
        };
        var PARAMS = {
            className: 'params',
            begin: /\(/, end: /\)/,
            contains: ['self', PROMPT, NUMBER, STRING]
        };
        return {
            aliases: ['py', 'gyp'],
            keywords: {
                keyword:
                'and elif is global as in if from raise for except finally print import pass return ' +
                'exec else break not with class assert yield try while continue del or def lambda ' +
                'async await nonlocal|10 None True False',
                built_in:
                    'Ellipsis NotImplemented'
            },
            illegal: /(<\/|->|\?)/,
            contains: [
                PROMPT,
                NUMBER,
                STRING,
                hljs.HASH_COMMENT_MODE,
                {
                    variants: [
                        {className: 'function', beginKeywords: 'def', relevance: 10},
                        {className: 'class', beginKeywords: 'class'}
                    ],
                    end: /:/,
                    illegal: /[${=;\n,]/,
                    contains: [
                        hljs.UNDERSCORE_TITLE_MODE,
                        PARAMS,
                        {
                            begin: /->/, endsWithParent: true,
                            keywords: 'None'
                        }
                    ]
                },
                {
                    className: 'meta',
                    begin: /^[\t ]*@/, end: /$/
                },
                {
                    begin: /\b(print|exec)\(/ // don’t highlight keywords-turned-functions in Python 3
                }
            ]
        };
    };
},{}],39:[function(require,module,exports){
    module.exports = function(hljs) {
        var RUBY_METHOD_RE = '[a-zA-Z_]\\w*[!?=]?|[-+~]\\@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?';
        var RUBY_KEYWORDS = {
            keyword:
            'and then defined module in return redo if BEGIN retry end for self when ' +
            'next until do begin unless END rescue else break undef not super class case ' +
            'require yield alias while ensure elsif or include attr_reader attr_writer attr_accessor',
            literal:
                'true false nil'
        };
        var YARDOCTAG = {
            className: 'doctag',
            begin: '@[A-Za-z]+'
        };
        var IRB_OBJECT = {
            begin: '#<', end: '>'
        };
        var COMMENT_MODES = [
            hljs.COMMENT(
                '#',
                '$',
                {
                    contains: [YARDOCTAG]
                }
            ),
            hljs.COMMENT(
                '^\\=begin',
                '^\\=end',
                {
                    contains: [YARDOCTAG],
                    relevance: 10
                }
            ),
            hljs.COMMENT('^__END__', '\\n$')
        ];
        var SUBST = {
            className: 'subst',
            begin: '#\\{', end: '}',
            keywords: RUBY_KEYWORDS
        };
        var STRING = {
            className: 'string',
            contains: [hljs.BACKSLASH_ESCAPE, SUBST],
            variants: [
                {begin: /'/, end: /'/},
                {begin: /"/, end: /"/},
                {begin: /`/, end: /`/},
                {begin: '%[qQwWx]?\\(', end: '\\)'},
                {begin: '%[qQwWx]?\\[', end: '\\]'},
                {begin: '%[qQwWx]?{', end: '}'},
                {begin: '%[qQwWx]?<', end: '>'},
                {begin: '%[qQwWx]?/', end: '/'},
                {begin: '%[qQwWx]?%', end: '%'},
                {begin: '%[qQwWx]?-', end: '-'},
                {begin: '%[qQwWx]?\\|', end: '\\|'},
                {
                    // \B in the beginning suppresses recognition of ?-sequences where ?
                    // is the last character of a preceding identifier, as in: `func?4`
                    begin: /\B\?(\\\d{1,3}|\\x[A-Fa-f0-9]{1,2}|\\u[A-Fa-f0-9]{4}|\\?\S)\b/
                }
            ]
        };
        var PARAMS = {
            className: 'params',
            begin: '\\(', end: '\\)', endsParent: true,
            keywords: RUBY_KEYWORDS
        };

        var RUBY_DEFAULT_CONTAINS = [
            STRING,
            IRB_OBJECT,
            {
                className: 'class',
                beginKeywords: 'class module', end: '$|;',
                illegal: /=/,
                contains: [
                    hljs.inherit(hljs.TITLE_MODE, {begin: '[A-Za-z_]\\w*(::\\w+)*(\\?|\\!)?'}),
                    {
                        begin: '<\\s*',
                        contains: [{
                            begin: '(' + hljs.IDENT_RE + '::)?' + hljs.IDENT_RE
                        }]
                    }
                ].concat(COMMENT_MODES)
            },
            {
                className: 'function',
                beginKeywords: 'def', end: '$|;',
                contains: [
                    hljs.inherit(hljs.TITLE_MODE, {begin: RUBY_METHOD_RE}),
                    PARAMS
                ].concat(COMMENT_MODES)
            },
            {
                // swallow namespace qualifiers before symbols
                begin: hljs.IDENT_RE + '::'
            },
            {
                className: 'symbol',
                begin: hljs.UNDERSCORE_IDENT_RE + '(\\!|\\?)?:',
                relevance: 0
            },
            {
                className: 'symbol',
                begin: ':(?!\\s)',
                contains: [STRING, {begin: RUBY_METHOD_RE}],
                relevance: 0
            },
            {
                className: 'number',
                begin: '(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b',
                relevance: 0
            },
            {
                begin: '(\\$\\W)|((\\$|\\@\\@?)(\\w+))' // variables
            },
            {
                className: 'params',
                begin: /\|/, end: /\|/,
                keywords: RUBY_KEYWORDS
            },
            { // regexp container
                begin: '(' + hljs.RE_STARTERS_RE + ')\\s*',
                contains: [
                    IRB_OBJECT,
                    {
                        className: 'regexp',
                        contains: [hljs.BACKSLASH_ESCAPE, SUBST],
                        illegal: /\n/,
                        variants: [
                            {begin: '/', end: '/[a-z]*'},
                            {begin: '%r{', end: '}[a-z]*'},
                            {begin: '%r\\(', end: '\\)[a-z]*'},
                            {begin: '%r!', end: '![a-z]*'},
                            {begin: '%r\\[', end: '\\][a-z]*'}
                        ]
                    }
                ].concat(COMMENT_MODES),
                relevance: 0
            }
        ].concat(COMMENT_MODES);

        SUBST.contains = RUBY_DEFAULT_CONTAINS;
        PARAMS.contains = RUBY_DEFAULT_CONTAINS;

        var SIMPLE_PROMPT = "[>?]>";
        var DEFAULT_PROMPT = "[\\w#]+\\(\\w+\\):\\d+:\\d+>";
        var RVM_PROMPT = "(\\w+-)?\\d+\\.\\d+\\.\\d(p\\d+)?[^>]+>";

        var IRB_DEFAULT = [
            {
                begin: /^\s*=>/,
                starts: {
                    end: '$', contains: RUBY_DEFAULT_CONTAINS
                }
            },
            {
                className: 'meta',
                begin: '^('+SIMPLE_PROMPT+"|"+DEFAULT_PROMPT+'|'+RVM_PROMPT+')',
                starts: {
                    end: '$', contains: RUBY_DEFAULT_CONTAINS
                }
            }
        ];

        return {
            aliases: ['rb', 'gemspec', 'podspec', 'thor', 'irb'],
            keywords: RUBY_KEYWORDS,
            illegal: /\/\*/,
            contains: COMMENT_MODES.concat(IRB_DEFAULT).concat(RUBY_DEFAULT_CONTAINS)
        };
    };
},{}],40:[function(require,module,exports){
    module.exports = function(hljs) {
        var NUM_SUFFIX = '([uif](8|16|32|64|size))\?';
        var BLOCK_COMMENT = hljs.inherit(hljs.C_BLOCK_COMMENT_MODE);
        BLOCK_COMMENT.contains.push('self');
        var KEYWORDS =
            'alignof as be box break const continue crate do else enum extern ' +
            'false fn for if impl in let loop match mod mut offsetof once priv ' +
            'proc pub pure ref return self Self sizeof static struct super trait true ' +
            'type typeof unsafe unsized use virtual while where yield move default ' +
            'int i8 i16 i32 i64 isize ' +
            'uint u8 u32 u64 usize ' +
            'float f32 f64 ' +
            'str char bool'
        var BUILTINS =
            // prelude
            'Copy Send Sized Sync Drop Fn FnMut FnOnce drop Box ToOwned Clone ' +
            'PartialEq PartialOrd Eq Ord AsRef AsMut Into From Default Iterator ' +
            'Extend IntoIterator DoubleEndedIterator ExactSizeIterator Option ' +
            'Result SliceConcatExt String ToString Vec ' +
                // macros
            'assert! assert_eq! bitflags! bytes! cfg! col! concat! concat_idents! ' +
            'debug_assert! debug_assert_eq! env! panic! file! format! format_args! ' +
            'include_bin! include_str! line! local_data_key! module_path! ' +
            'option_env! print! println! select! stringify! try! unimplemented! ' +
            'unreachable! vec! write! writeln! macro_rules!';
        return {
            aliases: ['rs'],
            keywords: {
                keyword:
                KEYWORDS,
                literal:
                    'true false Some None Ok Err',
                built_in:
                BUILTINS
            },
            lexemes: hljs.IDENT_RE + '!?',
            illegal: '</',
            contains: [
                hljs.C_LINE_COMMENT_MODE,
                BLOCK_COMMENT,
                hljs.inherit(hljs.QUOTE_STRING_MODE, {begin: /b?"/, illegal: null}),
                {
                    className: 'string',
                    variants: [
                        { begin: /r(#*)".*?"\1(?!#)/ },
                        { begin: /b?'\\?(x\w{2}|u\w{4}|U\w{8}|.)'/ }
                    ]
                },
                {
                    className: 'symbol',
                    begin: /'[a-zA-Z_][a-zA-Z0-9_]*/
                },
                {
                    className: 'number',
                    variants: [
                        { begin: '\\b0b([01_]+)' + NUM_SUFFIX },
                        { begin: '\\b0o([0-7_]+)' + NUM_SUFFIX },
                        { begin: '\\b0x([A-Fa-f0-9_]+)' + NUM_SUFFIX },
                        { begin: '\\b(\\d[\\d_]*(\\.[0-9_]+)?([eE][+-]?[0-9_]+)?)' +
                        NUM_SUFFIX
                        }
                    ],
                    relevance: 0
                },
                {
                    className: 'function',
                    beginKeywords: 'fn', end: '(\\(|<)', excludeEnd: true,
                    contains: [hljs.UNDERSCORE_TITLE_MODE]
                },
                {
                    className: 'meta',
                    begin: '#\\!?\\[', end: '\\]',
                    contains: [
                        {
                            className: 'meta-string',
                            begin: /"/, end: /"/
                        }
                    ]
                },
                {
                    className: 'class',
                    beginKeywords: 'type', end: ';',
                    contains: [
                        hljs.inherit(hljs.UNDERSCORE_TITLE_MODE, {endsParent: true})
                    ],
                    illegal: '\\S'
                },
                {
                    className: 'class',
                    beginKeywords: 'trait enum struct', end: '{',
                    contains: [
                        hljs.inherit(hljs.UNDERSCORE_TITLE_MODE, {endsParent: true})
                    ],
                    illegal: '[\\w\\d]'
                },
                {
                    begin: hljs.IDENT_RE + '::',
                    keywords: {built_in: BUILTINS}
                },
                {
                    begin: '->'
                }
            ]
        };
    };
},{}],41:[function(require,module,exports){
    module.exports = function(hljs) {

        var ANNOTATION = { className: 'meta', begin: '@[A-Za-z]+' };

        // used in strings for escaping/interpolation/substitution
        var SUBST = {
            className: 'subst',
            variants: [
                {begin: '\\$[A-Za-z0-9_]+'},
                {begin: '\\${', end: '}'}
            ]
        };

        var STRING = {
            className: 'string',
            variants: [
                {
                    begin: '"', end: '"',
                    illegal: '\\n',
                    contains: [hljs.BACKSLASH_ESCAPE]
                },
                {
                    begin: '"""', end: '"""',
                    relevance: 10
                },
                {
                    begin: '[a-z]+"', end: '"',
                    illegal: '\\n',
                    contains: [hljs.BACKSLASH_ESCAPE, SUBST]
                },
                {
                    className: 'string',
                    begin: '[a-z]+"""', end: '"""',
                    contains: [SUBST],
                    relevance: 10
                }
            ]

        };

        var SYMBOL = {
            className: 'symbol',
            begin: '\'\\w[\\w\\d_]*(?!\')'
        };

        var TYPE = {
            className: 'type',
            begin: '\\b[A-Z][A-Za-z0-9_]*',
            relevance: 0
        };

        var NAME = {
            className: 'title',
            begin: /[^0-9\n\t "'(),.`{}\[\]:;][^\n\t "'(),.`{}\[\]:;]+|[^0-9\n\t "'(),.`{}\[\]:;=]/,
            relevance: 0
        };

        var CLASS = {
            className: 'class',
            beginKeywords: 'class object trait type',
            end: /[:={\[\n;]/,
            excludeEnd: true,
            contains: [
                {
                    beginKeywords: 'extends with',
                    relevance: 10
                },
                {
                    begin: /\[/,
                    end: /\]/,
                    excludeBegin: true,
                    excludeEnd: true,
                    relevance: 0,
                    contains: [TYPE]
                },
                {
                    className: 'params',
                    begin: /\(/,
                    end: /\)/,
                    excludeBegin: true,
                    excludeEnd: true,
                    relevance: 0,
                    contains: [TYPE]
                },
                NAME
            ]
        };

        var METHOD = {
            className: 'function',
            beginKeywords: 'def',
            end: /[:={\[(\n;]/,
            excludeEnd: true,
            contains: [NAME]
        };

        return {
            keywords: {
                literal: 'true false null',
                keyword: 'type yield lazy override def with val var sealed abstract private trait object if forSome for while throw finally protected extends import final return else break new catch super class case package default try this match continue throws implicit'
            },
            contains: [
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE,
                STRING,
                SYMBOL,
                TYPE,
                METHOD,
                CLASS,
                hljs.C_NUMBER_MODE,
                ANNOTATION
            ]
        };
    };
},{}],42:[function(require,module,exports){
    module.exports = function(hljs) {
        var SCHEME_IDENT_RE = '[^\\(\\)\\[\\]\\{\\}",\'`;#|\\\\\\s]+';
        var SCHEME_SIMPLE_NUMBER_RE = '(\\-|\\+)?\\d+([./]\\d+)?';
        var SCHEME_COMPLEX_NUMBER_RE = SCHEME_SIMPLE_NUMBER_RE + '[+\\-]' + SCHEME_SIMPLE_NUMBER_RE + 'i';
        var BUILTINS = {
            'builtin-name':
            'case-lambda call/cc class define-class exit-handler field import ' +
            'inherit init-field interface let*-values let-values let/ec mixin ' +
            'opt-lambda override protect provide public rename require ' +
            'require-for-syntax syntax syntax-case syntax-error unit/sig unless ' +
            'when with-syntax and begin call-with-current-continuation ' +
            'call-with-input-file call-with-output-file case cond define ' +
            'define-syntax delay do dynamic-wind else for-each if lambda let let* ' +
            'let-syntax letrec letrec-syntax map or syntax-rules \' * + , ,@ - ... / ' +
            '; < <= = => > >= ` abs acos angle append apply asin assoc assq assv atan ' +
            'boolean? caar cadr call-with-input-file call-with-output-file ' +
            'call-with-values car cdddar cddddr cdr ceiling char->integer ' +
            'char-alphabetic? char-ci<=? char-ci<? char-ci=? char-ci>=? char-ci>? ' +
            'char-downcase char-lower-case? char-numeric? char-ready? char-upcase ' +
            'char-upper-case? char-whitespace? char<=? char<? char=? char>=? char>? ' +
            'char? close-input-port close-output-port complex? cons cos ' +
            'current-input-port current-output-port denominator display eof-object? ' +
            'eq? equal? eqv? eval even? exact->inexact exact? exp expt floor ' +
            'force gcd imag-part inexact->exact inexact? input-port? integer->char ' +
            'integer? interaction-environment lcm length list list->string ' +
            'list->vector list-ref list-tail list? load log magnitude make-polar ' +
            'make-rectangular make-string make-vector max member memq memv min ' +
            'modulo negative? newline not null-environment null? number->string ' +
            'number? numerator odd? open-input-file open-output-file output-port? ' +
            'pair? peek-char port? positive? procedure? quasiquote quote quotient ' +
            'rational? rationalize read read-char real-part real? remainder reverse ' +
            'round scheme-report-environment set! set-car! set-cdr! sin sqrt string ' +
            'string->list string->number string->symbol string-append string-ci<=? ' +
            'string-ci<? string-ci=? string-ci>=? string-ci>? string-copy ' +
            'string-fill! string-length string-ref string-set! string<=? string<? ' +
            'string=? string>=? string>? string? substring symbol->string symbol? ' +
            'tan transcript-off transcript-on truncate values vector ' +
            'vector->list vector-fill! vector-length vector-ref vector-set! ' +
            'with-input-from-file with-output-to-file write write-char zero?'
        };

        var SHEBANG = {
            className: 'meta',
            begin: '^#!',
            end: '$'
        };

        var LITERAL = {
            className: 'literal',
            begin: '(#t|#f|#\\\\' + SCHEME_IDENT_RE + '|#\\\\.)'
        };

        var NUMBER = {
            className: 'number',
            variants: [
                { begin: SCHEME_SIMPLE_NUMBER_RE, relevance: 0 },
                { begin: SCHEME_COMPLEX_NUMBER_RE, relevance: 0 },
                { begin: '#b[0-1]+(/[0-1]+)?' },
                { begin: '#o[0-7]+(/[0-7]+)?' },
                { begin: '#x[0-9a-f]+(/[0-9a-f]+)?' }
            ]
        };

        var STRING = hljs.QUOTE_STRING_MODE;

        var REGULAR_EXPRESSION = {
            className: 'regexp',
            begin: '#[pr]x"',
            end: '[^\\\\]"'
        };

        var COMMENT_MODES = [
            hljs.COMMENT(
                ';',
                '$',
                {
                    relevance: 0
                }
            ),
            hljs.COMMENT('#\\|', '\\|#')
        ];

        var IDENT = {
            begin: SCHEME_IDENT_RE,
            relevance: 0
        };

        var QUOTED_IDENT = {
            className: 'symbol',
            begin: '\'' + SCHEME_IDENT_RE
        };

        var BODY = {
            endsWithParent: true,
            relevance: 0
        };

        var QUOTED_LIST = {
            begin: /'/,
            contains: [
                {
                    begin: '\\(', end: '\\)',
                    contains: ['self', LITERAL, STRING, NUMBER, IDENT, QUOTED_IDENT]
                }
            ]
        };

        var NAME = {
            className: 'name',
            begin: SCHEME_IDENT_RE,
            lexemes: SCHEME_IDENT_RE,
            keywords: BUILTINS
        };

        var LAMBDA = {
            begin: /lambda/, endsWithParent: true, returnBegin: true,
            contains: [
                NAME,
                {
                    begin: /\(/, end: /\)/, endsParent: true,
                    contains: [IDENT],
                }
            ]
        };

        var LIST = {
            variants: [
                { begin: '\\(', end: '\\)' },
                { begin: '\\[', end: '\\]' }
            ],
            contains: [LAMBDA, NAME, BODY]
        };

        BODY.contains = [LITERAL, NUMBER, STRING, IDENT, QUOTED_IDENT, QUOTED_LIST, LIST].concat(COMMENT_MODES);

        return {
            illegal: /\S/,
            contains: [SHEBANG, NUMBER, STRING, QUOTED_IDENT, QUOTED_LIST, LIST].concat(COMMENT_MODES)
        };
    };
},{}],43:[function(require,module,exports){
    module.exports = function(hljs) {
        var IDENT_RE = '[a-zA-Z-][a-zA-Z0-9_-]*';
        var VARIABLE = {
            className: 'variable',
            begin: '(\\$' + IDENT_RE + ')\\b'
        };
        var HEXCOLOR = {
            className: 'number', begin: '#[0-9A-Fa-f]+'
        };
        var DEF_INTERNALS = {
            className: 'attribute',
            begin: '[A-Z\\_\\.\\-]+', end: ':',
            excludeEnd: true,
            illegal: '[^\\s]',
            starts: {
                endsWithParent: true, excludeEnd: true,
                contains: [
                    HEXCOLOR,
                    hljs.CSS_NUMBER_MODE,
                    hljs.QUOTE_STRING_MODE,
                    hljs.APOS_STRING_MODE,
                    hljs.C_BLOCK_COMMENT_MODE,
                    {
                        className: 'meta', begin: '!important'
                    }
                ]
            }
        };
        return {
            case_insensitive: true,
            illegal: '[=/|\']',
            contains: [
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE,
                {
                    className: 'selector-id', begin: '\\#[A-Za-z0-9_-]+',
                    relevance: 0
                },
                {
                    className: 'selector-class', begin: '\\.[A-Za-z0-9_-]+',
                    relevance: 0
                },
                {
                    className: 'selector-attr', begin: '\\[', end: '\\]',
                    illegal: '$'
                },
                {
                    className: 'selector-tag', // begin: IDENT_RE, end: '[,|\\s]'
                    begin: '\\b(a|abbr|acronym|address|area|article|aside|audio|b|base|big|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|div|dl|dt|em|embed|fieldset|figcaption|figure|footer|form|frame|frameset|(h[1-6])|head|header|hgroup|hr|html|i|iframe|img|input|ins|kbd|keygen|label|legend|li|link|map|mark|meta|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|samp|script|section|select|small|span|strike|strong|style|sub|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|tt|ul|var|video)\\b',
                    relevance: 0
                },
                {
                    begin: ':(visited|valid|root|right|required|read-write|read-only|out-range|optional|only-of-type|only-child|nth-of-type|nth-last-of-type|nth-last-child|nth-child|not|link|left|last-of-type|last-child|lang|invalid|indeterminate|in-range|hover|focus|first-of-type|first-line|first-letter|first-child|first|enabled|empty|disabled|default|checked|before|after|active)'
                },
                {
                    begin: '::(after|before|choices|first-letter|first-line|repeat-index|repeat-item|selection|value)'
                },
                VARIABLE,
                {
                    className: 'attribute',
                    begin: '\\b(z-index|word-wrap|word-spacing|word-break|width|widows|white-space|visibility|vertical-align|unicode-bidi|transition-timing-function|transition-property|transition-duration|transition-delay|transition|transform-style|transform-origin|transform|top|text-underline-position|text-transform|text-shadow|text-rendering|text-overflow|text-indent|text-decoration-style|text-decoration-line|text-decoration-color|text-decoration|text-align-last|text-align|tab-size|table-layout|right|resize|quotes|position|pointer-events|perspective-origin|perspective|page-break-inside|page-break-before|page-break-after|padding-top|padding-right|padding-left|padding-bottom|padding|overflow-y|overflow-x|overflow-wrap|overflow|outline-width|outline-style|outline-offset|outline-color|outline|orphans|order|opacity|object-position|object-fit|normal|none|nav-up|nav-right|nav-left|nav-index|nav-down|min-width|min-height|max-width|max-height|mask|marks|margin-top|margin-right|margin-left|margin-bottom|margin|list-style-type|list-style-position|list-style-image|list-style|line-height|letter-spacing|left|justify-content|initial|inherit|ime-mode|image-orientation|image-resolution|image-rendering|icon|hyphens|height|font-weight|font-variant-ligatures|font-variant|font-style|font-stretch|font-size-adjust|font-size|font-language-override|font-kerning|font-feature-settings|font-family|font|float|flex-wrap|flex-shrink|flex-grow|flex-flow|flex-direction|flex-basis|flex|filter|empty-cells|display|direction|cursor|counter-reset|counter-increment|content|column-width|column-span|column-rule-width|column-rule-style|column-rule-color|column-rule|column-gap|column-fill|column-count|columns|color|clip-path|clip|clear|caption-side|break-inside|break-before|break-after|box-sizing|box-shadow|box-decoration-break|bottom|border-width|border-top-width|border-top-style|border-top-right-radius|border-top-left-radius|border-top-color|border-top|border-style|border-spacing|border-right-width|border-right-style|border-right-color|border-right|border-radius|border-left-width|border-left-style|border-left-color|border-left|border-image-width|border-image-source|border-image-slice|border-image-repeat|border-image-outset|border-image|border-color|border-collapse|border-bottom-width|border-bottom-style|border-bottom-right-radius|border-bottom-left-radius|border-bottom-color|border-bottom|border|background-size|background-repeat|background-position|background-origin|background-image|background-color|background-clip|background-attachment|background-blend-mode|background|backface-visibility|auto|animation-timing-function|animation-play-state|animation-name|animation-iteration-count|animation-fill-mode|animation-duration|animation-direction|animation-delay|animation|align-self|align-items|align-content)\\b',
                    illegal: '[^\\s]'
                },
                {
                    begin: '\\b(whitespace|wait|w-resize|visible|vertical-text|vertical-ideographic|uppercase|upper-roman|upper-alpha|underline|transparent|top|thin|thick|text|text-top|text-bottom|tb-rl|table-header-group|table-footer-group|sw-resize|super|strict|static|square|solid|small-caps|separate|se-resize|scroll|s-resize|rtl|row-resize|ridge|right|repeat|repeat-y|repeat-x|relative|progress|pointer|overline|outside|outset|oblique|nowrap|not-allowed|normal|none|nw-resize|no-repeat|no-drop|newspaper|ne-resize|n-resize|move|middle|medium|ltr|lr-tb|lowercase|lower-roman|lower-alpha|loose|list-item|line|line-through|line-edge|lighter|left|keep-all|justify|italic|inter-word|inter-ideograph|inside|inset|inline|inline-block|inherit|inactive|ideograph-space|ideograph-parenthesis|ideograph-numeric|ideograph-alpha|horizontal|hidden|help|hand|groove|fixed|ellipsis|e-resize|double|dotted|distribute|distribute-space|distribute-letter|distribute-all-lines|disc|disabled|default|decimal|dashed|crosshair|collapse|col-resize|circle|char|center|capitalize|break-word|break-all|bottom|both|bolder|bold|block|bidi-override|below|baseline|auto|always|all-scroll|absolute|table|table-cell)\\b'
                },
                {
                    begin: ':', end: ';',
                    contains: [
                        VARIABLE,
                        HEXCOLOR,
                        hljs.CSS_NUMBER_MODE,
                        hljs.QUOTE_STRING_MODE,
                        hljs.APOS_STRING_MODE,
                        {
                            className: 'meta', begin: '!important'
                        }
                    ]
                },
                {
                    begin: '@', end: '[{;]',
                    keywords: 'mixin include extend for if else each while charset import debug media page content font-face namespace warn',
                    contains: [
                        VARIABLE,
                        hljs.QUOTE_STRING_MODE,
                        hljs.APOS_STRING_MODE,
                        HEXCOLOR,
                        hljs.CSS_NUMBER_MODE,
                        {
                            begin: '\\s[A-Za-z0-9_.-]+',
                            relevance: 0
                        }
                    ]
                }
            ]
        };
    };
},{}],44:[function(require,module,exports){
    module.exports = function(hljs) {
        var VAR_IDENT_RE = '[a-z][a-zA-Z0-9_]*';
        var CHAR = {
            className: 'string',
            begin: '\\$.{1}'
        };
        var SYMBOL = {
            className: 'symbol',
            begin: '#' + hljs.UNDERSCORE_IDENT_RE
        };
        return {
            aliases: ['st'],
            keywords: 'self super nil true false thisContext', // only 6
            contains: [
                hljs.COMMENT('"', '"'),
                hljs.APOS_STRING_MODE,
                {
                    className: 'type',
                    begin: '\\b[A-Z][A-Za-z0-9_]*',
                    relevance: 0
                },
                {
                    begin: VAR_IDENT_RE + ':',
                    relevance: 0
                },
                hljs.C_NUMBER_MODE,
                SYMBOL,
                CHAR,
                {
                    // This looks more complicated than needed to avoid combinatorial
                    // explosion under V8. It effectively means `| var1 var2 ... |` with
                    // whitespace adjacent to `|` being optional.
                    begin: '\\|[ ]*' + VAR_IDENT_RE + '([ ]+' + VAR_IDENT_RE + ')*[ ]*\\|',
                    returnBegin: true, end: /\|/,
                    illegal: /\S/,
                    contains: [{begin: '(\\|[ ]*)?' + VAR_IDENT_RE}]
                },
                {
                    begin: '\\#\\(', end: '\\)',
                    contains: [
                        hljs.APOS_STRING_MODE,
                        CHAR,
                        hljs.C_NUMBER_MODE,
                        SYMBOL
                    ]
                }
            ]
        };
    };
},{}],45:[function(require,module,exports){
    module.exports = function(hljs) {

        var VARIABLE = {
            className: 'variable',
            begin: '\\$' + hljs.IDENT_RE
        };

        var HEX_COLOR = {
            className: 'number',
            begin: '#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})'
        };

        var AT_KEYWORDS = [
            'charset',
            'css',
            'debug',
            'extend',
            'font-face',
            'for',
            'import',
            'include',
            'media',
            'mixin',
            'page',
            'warn',
            'while'
        ];

        var PSEUDO_SELECTORS = [
            'after',
            'before',
            'first-letter',
            'first-line',
            'active',
            'first-child',
            'focus',
            'hover',
            'lang',
            'link',
            'visited'
        ];

        var TAGS = [
            'a',
            'abbr',
            'address',
            'article',
            'aside',
            'audio',
            'b',
            'blockquote',
            'body',
            'button',
            'canvas',
            'caption',
            'cite',
            'code',
            'dd',
            'del',
            'details',
            'dfn',
            'div',
            'dl',
            'dt',
            'em',
            'fieldset',
            'figcaption',
            'figure',
            'footer',
            'form',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'header',
            'hgroup',
            'html',
            'i',
            'iframe',
            'img',
            'input',
            'ins',
            'kbd',
            'label',
            'legend',
            'li',
            'mark',
            'menu',
            'nav',
            'object',
            'ol',
            'p',
            'q',
            'quote',
            'samp',
            'section',
            'span',
            'strong',
            'summary',
            'sup',
            'table',
            'tbody',
            'td',
            'textarea',
            'tfoot',
            'th',
            'thead',
            'time',
            'tr',
            'ul',
            'var',
            'video'
        ];

        var TAG_END = '[\\.\\s\\n\\[\\:,]';

        var ATTRIBUTES = [
            'align-content',
            'align-items',
            'align-self',
            'animation',
            'animation-delay',
            'animation-direction',
            'animation-duration',
            'animation-fill-mode',
            'animation-iteration-count',
            'animation-name',
            'animation-play-state',
            'animation-timing-function',
            'auto',
            'backface-visibility',
            'background',
            'background-attachment',
            'background-clip',
            'background-color',
            'background-image',
            'background-origin',
            'background-position',
            'background-repeat',
            'background-size',
            'border',
            'border-bottom',
            'border-bottom-color',
            'border-bottom-left-radius',
            'border-bottom-right-radius',
            'border-bottom-style',
            'border-bottom-width',
            'border-collapse',
            'border-color',
            'border-image',
            'border-image-outset',
            'border-image-repeat',
            'border-image-slice',
            'border-image-source',
            'border-image-width',
            'border-left',
            'border-left-color',
            'border-left-style',
            'border-left-width',
            'border-radius',
            'border-right',
            'border-right-color',
            'border-right-style',
            'border-right-width',
            'border-spacing',
            'border-style',
            'border-top',
            'border-top-color',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-top-style',
            'border-top-width',
            'border-width',
            'bottom',
            'box-decoration-break',
            'box-shadow',
            'box-sizing',
            'break-after',
            'break-before',
            'break-inside',
            'caption-side',
            'clear',
            'clip',
            'clip-path',
            'color',
            'column-count',
            'column-fill',
            'column-gap',
            'column-rule',
            'column-rule-color',
            'column-rule-style',
            'column-rule-width',
            'column-span',
            'column-width',
            'columns',
            'content',
            'counter-increment',
            'counter-reset',
            'cursor',
            'direction',
            'display',
            'empty-cells',
            'filter',
            'flex',
            'flex-basis',
            'flex-direction',
            'flex-flow',
            'flex-grow',
            'flex-shrink',
            'flex-wrap',
            'float',
            'font',
            'font-family',
            'font-feature-settings',
            'font-kerning',
            'font-language-override',
            'font-size',
            'font-size-adjust',
            'font-stretch',
            'font-style',
            'font-variant',
            'font-variant-ligatures',
            'font-weight',
            'height',
            'hyphens',
            'icon',
            'image-orientation',
            'image-rendering',
            'image-resolution',
            'ime-mode',
            'inherit',
            'initial',
            'justify-content',
            'left',
            'letter-spacing',
            'line-height',
            'list-style',
            'list-style-image',
            'list-style-position',
            'list-style-type',
            'margin',
            'margin-bottom',
            'margin-left',
            'margin-right',
            'margin-top',
            'marks',
            'mask',
            'max-height',
            'max-width',
            'min-height',
            'min-width',
            'nav-down',
            'nav-index',
            'nav-left',
            'nav-right',
            'nav-up',
            'none',
            'normal',
            'object-fit',
            'object-position',
            'opacity',
            'order',
            'orphans',
            'outline',
            'outline-color',
            'outline-offset',
            'outline-style',
            'outline-width',
            'overflow',
            'overflow-wrap',
            'overflow-x',
            'overflow-y',
            'padding',
            'padding-bottom',
            'padding-left',
            'padding-right',
            'padding-top',
            'page-break-after',
            'page-break-before',
            'page-break-inside',
            'perspective',
            'perspective-origin',
            'pointer-events',
            'position',
            'quotes',
            'resize',
            'right',
            'tab-size',
            'table-layout',
            'text-align',
            'text-align-last',
            'text-decoration',
            'text-decoration-color',
            'text-decoration-line',
            'text-decoration-style',
            'text-indent',
            'text-overflow',
            'text-rendering',
            'text-shadow',
            'text-transform',
            'text-underline-position',
            'top',
            'transform',
            'transform-origin',
            'transform-style',
            'transition',
            'transition-delay',
            'transition-duration',
            'transition-property',
            'transition-timing-function',
            'unicode-bidi',
            'vertical-align',
            'visibility',
            'white-space',
            'widows',
            'width',
            'word-break',
            'word-spacing',
            'word-wrap',
            'z-index'
        ];

        // illegals
        var ILLEGAL = [
            '\\?',
            '(\\bReturn\\b)', // monkey
            '(\\bEnd\\b)', // monkey
            '(\\bend\\b)', // vbscript
            '(\\bdef\\b)', // gradle
            ';', // a whole lot of languages
            '#\\s', // markdown
            '\\*\\s', // markdown
            '===\\s', // markdown
            '\\|',
            '%', // prolog
        ];

        return {
            aliases: ['styl'],
            case_insensitive: false,
            keywords: 'if else for in',
            illegal: '(' + ILLEGAL.join('|') + ')',
            contains: [

                // strings
                hljs.QUOTE_STRING_MODE,
                hljs.APOS_STRING_MODE,

                // comments
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE,

                // hex colors
                HEX_COLOR,

                // class tag
                {
                    begin: '\\.[a-zA-Z][a-zA-Z0-9_-]*' + TAG_END,
                    returnBegin: true,
                    contains: [
                        {className: 'selector-class', begin: '\\.[a-zA-Z][a-zA-Z0-9_-]*'}
                    ]
                },

                // id tag
                {
                    begin: '\\#[a-zA-Z][a-zA-Z0-9_-]*' + TAG_END,
                    returnBegin: true,
                    contains: [
                        {className: 'selector-id', begin: '\\#[a-zA-Z][a-zA-Z0-9_-]*'}
                    ]
                },

                // tags
                {
                    begin: '\\b(' + TAGS.join('|') + ')' + TAG_END,
                    returnBegin: true,
                    contains: [
                        {className: 'selector-tag', begin: '\\b[a-zA-Z][a-zA-Z0-9_-]*'}
                    ]
                },

                // psuedo selectors
                {
                    begin: '&?:?:\\b(' + PSEUDO_SELECTORS.join('|') + ')' + TAG_END
                },

                // @ keywords
                {
                    begin: '\@(' + AT_KEYWORDS.join('|') + ')\\b'
                },

                // variables
                VARIABLE,

                // dimension
                hljs.CSS_NUMBER_MODE,

                // number
                hljs.NUMBER_MODE,

                // functions
                //  - only from beginning of line + whitespace
                {
                    className: 'function',
                    begin: '^[a-zA-Z][a-zA-Z0-9_\-]*\\(.*\\)',
                    illegal: '[\\n]',
                    returnBegin: true,
                    contains: [
                        {className: 'title', begin: '\\b[a-zA-Z][a-zA-Z0-9_\-]*'},
                        {
                            className: 'params',
                            begin: /\(/,
                            end: /\)/,
                            contains: [
                                HEX_COLOR,
                                VARIABLE,
                                hljs.APOS_STRING_MODE,
                                hljs.CSS_NUMBER_MODE,
                                hljs.NUMBER_MODE,
                                hljs.QUOTE_STRING_MODE
                            ]
                        }
                    ]
                },

                // attributes
                //  - only from beginning of line + whitespace
                //  - must have whitespace after it
                {
                    className: 'attribute',
                    begin: '\\b(' + ATTRIBUTES.reverse().join('|') + ')\\b',
                    starts: {
                        // value container
                        end: /;|$/,
                        contains: [
                            HEX_COLOR,
                            VARIABLE,
                            hljs.APOS_STRING_MODE,
                            hljs.QUOTE_STRING_MODE,
                            hljs.CSS_NUMBER_MODE,
                            hljs.NUMBER_MODE,
                            hljs.C_BLOCK_COMMENT_MODE
                        ],
                        illegal: /\./,
                        relevance: 0
                    }
                }
            ]
        };
    };
},{}],46:[function(require,module,exports){
    module.exports = function(hljs) {
        var SWIFT_KEYWORDS = {
            keyword: '__COLUMN__ __FILE__ __FUNCTION__ __LINE__ as as! as? associativity ' +
            'break case catch class continue convenience default defer deinit didSet do ' +
            'dynamic dynamicType else enum extension fallthrough false final for func ' +
            'get guard if import in indirect infix init inout internal is lazy left let ' +
            'mutating nil none nonmutating operator optional override postfix precedence ' +
            'prefix private protocol Protocol public repeat required rethrows return ' +
            'right self Self set static struct subscript super switch throw throws true ' +
            'try try! try? Type typealias unowned var weak where while willSet',
            literal: 'true false nil',
            built_in: 'abs advance alignof alignofValue anyGenerator assert assertionFailure ' +
            'bridgeFromObjectiveC bridgeFromObjectiveCUnconditional bridgeToObjectiveC ' +
            'bridgeToObjectiveCUnconditional c contains count countElements countLeadingZeros ' +
            'debugPrint debugPrintln distance dropFirst dropLast dump encodeBitsAsWords ' +
            'enumerate equal fatalError filter find getBridgedObjectiveCType getVaList ' +
            'indices insertionSort isBridgedToObjectiveC isBridgedVerbatimToObjectiveC ' +
            'isUniquelyReferenced isUniquelyReferencedNonObjC join lazy lexicographicalCompare ' +
            'map max maxElement min minElement numericCast overlaps partition posix ' +
            'precondition preconditionFailure print println quickSort readLine reduce reflect ' +
            'reinterpretCast reverse roundUpToAlignment sizeof sizeofValue sort split ' +
            'startsWith stride strideof strideofValue swap toString transcode ' +
            'underestimateCount unsafeAddressOf unsafeBitCast unsafeDowncast unsafeUnwrap ' +
            'unsafeReflect withExtendedLifetime withObjectAtPlusZero withUnsafePointer ' +
            'withUnsafePointerToObject withUnsafeMutablePointer withUnsafeMutablePointers ' +
            'withUnsafePointer withUnsafePointers withVaList zip'
        };

        var TYPE = {
            className: 'type',
            begin: '\\b[A-Z][\\w\']*',
            relevance: 0
        };
        var BLOCK_COMMENT = hljs.COMMENT(
            '/\\*',
            '\\*/',
            {
                contains: ['self']
            }
        );
        var SUBST = {
            className: 'subst',
            begin: /\\\(/, end: '\\)',
            keywords: SWIFT_KEYWORDS,
            contains: [] // assigned later
        };
        var NUMBERS = {
            className: 'number',
            begin: '\\b([\\d_]+(\\.[\\deE_]+)?|0x[a-fA-F0-9_]+(\\.[a-fA-F0-9p_]+)?|0b[01_]+|0o[0-7_]+)\\b',
            relevance: 0
        };
        var QUOTE_STRING_MODE = hljs.inherit(hljs.QUOTE_STRING_MODE, {
            contains: [SUBST, hljs.BACKSLASH_ESCAPE]
        });
        SUBST.contains = [NUMBERS];

        return {
            keywords: SWIFT_KEYWORDS,
            contains: [
                QUOTE_STRING_MODE,
                hljs.C_LINE_COMMENT_MODE,
                BLOCK_COMMENT,
                TYPE,
                NUMBERS,
                {
                    className: 'function',
                    beginKeywords: 'func', end: '{', excludeEnd: true,
                    contains: [
                        hljs.inherit(hljs.TITLE_MODE, {
                            begin: /[A-Za-z$_][0-9A-Za-z$_]*/
                        }),
                        {
                            begin: /</, end: />/
                        },
                        {
                            className: 'params',
                            begin: /\(/, end: /\)/, endsParent: true,
                            keywords: SWIFT_KEYWORDS,
                            contains: [
                                'self',
                                NUMBERS,
                                QUOTE_STRING_MODE,
                                hljs.C_BLOCK_COMMENT_MODE,
                                {begin: ':'} // relevance booster
                            ],
                            illegal: /["']/
                        }
                    ],
                    illegal: /\[|%/
                },
                {
                    className: 'class',
                    beginKeywords: 'struct protocol class extension enum',
                    keywords: SWIFT_KEYWORDS,
                    end: '\\{',
                    excludeEnd: true,
                    contains: [
                        hljs.inherit(hljs.TITLE_MODE, {begin: /[A-Za-z$_][0-9A-Za-z$_]*/})
                    ]
                },
                {
                    className: 'meta', // @attributes
                    begin: '(@warn_unused_result|@exported|@lazy|@noescape|' +
                    '@NSCopying|@NSManaged|@objc|@convention|@required|' +
                    '@noreturn|@IBAction|@IBDesignable|@IBInspectable|@IBOutlet|' +
                    '@infix|@prefix|@postfix|@autoclosure|@testable|@available|' +
                    '@nonobjc|@NSApplicationMain|@UIApplicationMain)'

                },
                {
                    beginKeywords: 'import', end: /$/,
                    contains: [hljs.C_LINE_COMMENT_MODE, BLOCK_COMMENT]
                }
            ]
        };
    };
},{}],47:[function(require,module,exports){
    module.exports = function(hljs) {
        return {
            aliases: ['tk'],
            keywords: 'after append apply array auto_execok auto_import auto_load auto_mkindex ' +
            'auto_mkindex_old auto_qualify auto_reset bgerror binary break catch cd chan clock ' +
            'close concat continue dde dict encoding eof error eval exec exit expr fblocked ' +
            'fconfigure fcopy file fileevent filename flush for foreach format gets glob global ' +
            'history http if incr info interp join lappend|10 lassign|10 lindex|10 linsert|10 list ' +
            'llength|10 load lrange|10 lrepeat|10 lreplace|10 lreverse|10 lsearch|10 lset|10 lsort|10 '+
            'mathfunc mathop memory msgcat namespace open package parray pid pkg::create pkg_mkIndex '+
            'platform platform::shell proc puts pwd read refchan regexp registry regsub|10 rename '+
            'return safe scan seek set socket source split string subst switch tcl_endOfWord '+
            'tcl_findLibrary tcl_startOfNextWord tcl_startOfPreviousWord tcl_wordBreakAfter '+
            'tcl_wordBreakBefore tcltest tclvars tell time tm trace unknown unload unset update '+
            'uplevel upvar variable vwait while',
            contains: [
                hljs.COMMENT(';[ \\t]*#', '$'),
                hljs.COMMENT('^[ \\t]*#', '$'),
                {
                    beginKeywords: 'proc',
                    end: '[\\{]',
                    excludeEnd: true,
                    contains: [
                        {
                            className: 'title',
                            begin: '[ \\t\\n\\r]+(::)?[a-zA-Z_]((::)?[a-zA-Z0-9_])*',
                            end: '[ \\t\\n\\r]',
                            endsWithParent: true,
                            excludeEnd: true
                        }
                    ]
                },
                {
                    excludeEnd: true,
                    variants: [
                        {
                            begin: '\\$(\\{)?(::)?[a-zA-Z_]((::)?[a-zA-Z0-9_])*\\(([a-zA-Z0-9_])*\\)',
                            end: '[^a-zA-Z0-9_\\}\\$]'
                        },
                        {
                            begin: '\\$(\\{)?(::)?[a-zA-Z_]((::)?[a-zA-Z0-9_])*',
                            end: '(\\))?[^a-zA-Z0-9_\\}\\$]'
                        }
                    ]
                },
                {
                    className: 'string',
                    contains: [hljs.BACKSLASH_ESCAPE],
                    variants: [
                        hljs.inherit(hljs.APOS_STRING_MODE, {illegal: null}),
                        hljs.inherit(hljs.QUOTE_STRING_MODE, {illegal: null})
                    ]
                },
                {
                    className: 'number',
                    variants: [hljs.BINARY_NUMBER_MODE, hljs.C_NUMBER_MODE]
                }
            ]
        }
    };
},{}],48:[function(require,module,exports){
    module.exports = function(hljs) {
        var COMMAND = {
            className: 'tag',
            begin: /\\/,
            relevance: 0,
            contains: [
                {
                    className: 'name',
                    variants: [
                        {begin: /[a-zA-Zа-яА-я]+[*]?/},
                        {begin: /[^a-zA-Zа-яА-я0-9]/}
                    ],
                    starts: {
                        endsWithParent: true,
                        relevance: 0,
                        contains: [
                            {
                                className: 'string', // because it looks like attributes in HTML tags
                                variants: [
                                    {begin: /\[/, end: /\]/},
                                    {begin: /\{/, end: /\}/}
                                ]
                            },
                            {
                                begin: /\s*=\s*/, endsWithParent: true,
                                relevance: 0,
                                contains: [
                                    {
                                        className: 'number',
                                        begin: /-?\d*\.?\d+(pt|pc|mm|cm|in|dd|cc|ex|em)?/
                                    }
                                ]
                            }
                        ]
                    }
                }
            ]
        };

        return {
            contains: [
                COMMAND,
                {
                    className: 'formula',
                    contains: [COMMAND],
                    relevance: 0,
                    variants: [
                        {begin: /\$\$/, end: /\$\$/},
                        {begin: /\$/, end: /\$/}
                    ]
                },
                hljs.COMMENT(
                    '%',
                    '$',
                    {
                        relevance: 0
                    }
                )
            ]
        };
    };
},{}],49:[function(require,module,exports){
    module.exports = function(hljs) {
        var KEYWORDS = {
            keyword:
            'in if for while finally var new function do return void else break catch ' +
            'instanceof with throw case default try this switch continue typeof delete ' +
            'let yield const class public private protected get set super ' +
            'static implements enum export import declare type namespace abstract',
            literal:
                'true false null undefined NaN Infinity',
            built_in:
            'eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent ' +
            'encodeURI encodeURIComponent escape unescape Object Function Boolean Error ' +
            'EvalError InternalError RangeError ReferenceError StopIteration SyntaxError ' +
            'TypeError URIError Number Math Date String RegExp Array Float32Array ' +
            'Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array ' +
            'Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require ' +
            'module console window document any number boolean string void'
        };

        return {
            aliases: ['ts'],
            keywords: KEYWORDS,
            contains: [
                {
                    className: 'meta',
                    begin: /^\s*['"]use strict['"]/
                },
                hljs.APOS_STRING_MODE,
                hljs.QUOTE_STRING_MODE,
                { // template string
                    className: 'string',
                    begin: '`', end: '`',
                    contains: [
                        hljs.BACKSLASH_ESCAPE,
                        {
                            className: 'subst',
                            begin: '\\$\\{', end: '\\}'
                        }
                    ]
                },
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE,
                {
                    className: 'number',
                    variants: [
                        { begin: '\\b(0[bB][01]+)' },
                        { begin: '\\b(0[oO][0-7]+)' },
                        { begin: hljs.C_NUMBER_RE }
                    ],
                    relevance: 0
                },
                { // "value" container
                    begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
                    keywords: 'return throw case',
                    contains: [
                        hljs.C_LINE_COMMENT_MODE,
                        hljs.C_BLOCK_COMMENT_MODE,
                        hljs.REGEXP_MODE
                    ],
                    relevance: 0
                },
                {
                    className: 'function',
                    begin: 'function', end: /[\{;]/, excludeEnd: true,
                    keywords: KEYWORDS,
                    contains: [
                        'self',
                        hljs.inherit(hljs.TITLE_MODE, {begin: /[A-Za-z$_][0-9A-Za-z$_]*/}),
                        {
                            className: 'params',
                            begin: /\(/, end: /\)/,
                            excludeBegin: true,
                            excludeEnd: true,
                            keywords: KEYWORDS,
                            contains: [
                                hljs.C_LINE_COMMENT_MODE,
                                hljs.C_BLOCK_COMMENT_MODE
                            ],
                            illegal: /["'\(]/
                        }
                    ],
                    illegal: /%/,
                    relevance: 0 // () => {} is more typical in TypeScript
                },
                {
                    beginKeywords: 'constructor', end: /\{/, excludeEnd: true
                },
                { // prevent references like module.id from being higlighted as module definitions
                    begin: /module\./,
                    keywords: {built_in: 'module'},
                    relevance: 0
                },
                {
                    beginKeywords: 'module', end: /\{/, excludeEnd: true
                },
                {
                    beginKeywords: 'interface', end: /\{/, excludeEnd: true,
                    keywords: 'interface extends'
                },
                {
                    begin: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
                },
                {
                    begin: '\\.' + hljs.IDENT_RE, relevance: 0 // hack: prevents detection of keywords after dots
                }
            ]
        };
    };
},{}],50:[function(require,module,exports){
    module.exports = function(hljs) {
        var SV_KEYWORDS = {
            keyword:
            'accept_on alias always always_comb always_ff always_latch and assert assign ' +
            'assume automatic before begin bind bins binsof bit break buf|0 bufif0 bufif1 ' +
            'byte case casex casez cell chandle checker class clocking cmos config const ' +
            'constraint context continue cover covergroup coverpoint cross deassign default ' +
            'defparam design disable dist do edge else end endcase endchecker endclass ' +
            'endclocking endconfig endfunction endgenerate endgroup endinterface endmodule ' +
            'endpackage endprimitive endprogram endproperty endspecify endsequence endtable ' +
            'endtask enum event eventually expect export extends extern final first_match for ' +
            'force foreach forever fork forkjoin function generate|5 genvar global highz0 highz1 ' +
            'if iff ifnone ignore_bins illegal_bins implements implies import incdir include ' +
            'initial inout input inside instance int integer interconnect interface intersect ' +
            'join join_any join_none large let liblist library local localparam logic longint ' +
            'macromodule matches medium modport module nand negedge nettype new nexttime nmos ' +
            'nor noshowcancelled not notif0 notif1 or output package packed parameter pmos ' +
            'posedge primitive priority program property protected pull0 pull1 pulldown pullup ' +
            'pulsestyle_ondetect pulsestyle_onevent pure rand randc randcase randsequence rcmos ' +
            'real realtime ref reg reject_on release repeat restrict return rnmos rpmos rtran ' +
            'rtranif0 rtranif1 s_always s_eventually s_nexttime s_until s_until_with scalared ' +
            'sequence shortint shortreal showcancelled signed small soft solve specify specparam ' +
            'static string strong strong0 strong1 struct super supply0 supply1 sync_accept_on ' +
            'sync_reject_on table tagged task this throughout time timeprecision timeunit tran ' +
            'tranif0 tranif1 tri tri0 tri1 triand trior trireg type typedef union unique unique0 ' +
            'unsigned until until_with untyped use uwire var vectored virtual void wait wait_order ' +
            'wand weak weak0 weak1 while wildcard wire with within wor xnor xor',
            literal:
                'null',
            built_in:
            '$finish $stop $exit $fatal $error $warning $info $realtime $time $printtimescale ' +
            '$bitstoreal $bitstoshortreal $itor $signed $cast $bits $stime $timeformat ' +
            '$realtobits $shortrealtobits $rtoi $unsigned $asserton $assertkill $assertpasson ' +
            '$assertfailon $assertnonvacuouson $assertoff $assertcontrol $assertpassoff ' +
            '$assertfailoff $assertvacuousoff $isunbounded $sampled $fell $changed $past_gclk ' +
            '$fell_gclk $changed_gclk $rising_gclk $steady_gclk $coverage_control ' +
            '$coverage_get $coverage_save $set_coverage_db_name $rose $stable $past ' +
            '$rose_gclk $stable_gclk $future_gclk $falling_gclk $changing_gclk $display ' +
            '$coverage_get_max $coverage_merge $get_coverage $load_coverage_db $typename ' +
            '$unpacked_dimensions $left $low $increment $clog2 $ln $log10 $exp $sqrt $pow ' +
            '$floor $ceil $sin $cos $tan $countbits $onehot $isunknown $fatal $warning ' +
            '$dimensions $right $high $size $asin $acos $atan $atan2 $hypot $sinh $cosh ' +
            '$tanh $asinh $acosh $atanh $countones $onehot0 $error $info $random ' +
            '$dist_chi_square $dist_erlang $dist_exponential $dist_normal $dist_poisson ' +
            '$dist_t $dist_uniform $q_initialize $q_remove $q_exam $async$and$array ' +
            '$async$nand$array $async$or$array $async$nor$array $sync$and$array ' +
            '$sync$nand$array $sync$or$array $sync$nor$array $q_add $q_full $psprintf ' +
            '$async$and$plane $async$nand$plane $async$or$plane $async$nor$plane ' +
            '$sync$and$plane $sync$nand$plane $sync$or$plane $sync$nor$plane $system ' +
            '$display $displayb $displayh $displayo $strobe $strobeb $strobeh $strobeo ' +
            '$write $readmemb $readmemh $writememh $value$plusargs ' +
            '$dumpvars $dumpon $dumplimit $dumpports $dumpportson $dumpportslimit ' +
            '$writeb $writeh $writeo $monitor $monitorb $monitorh $monitoro $writememb ' +
            '$dumpfile $dumpoff $dumpall $dumpflush $dumpportsoff $dumpportsall ' +
            '$dumpportsflush $fclose $fdisplay $fdisplayb $fdisplayh $fdisplayo ' +
            '$fstrobe $fstrobeb $fstrobeh $fstrobeo $swrite $swriteb $swriteh ' +
            '$swriteo $fscanf $fread $fseek $fflush $feof $fopen $fwrite $fwriteb ' +
            '$fwriteh $fwriteo $fmonitor $fmonitorb $fmonitorh $fmonitoro $sformat ' +
            '$sformatf $fgetc $ungetc $fgets $sscanf $rewind $ftell $ferror'
        };
        return {
            aliases: ['v', 'sv', 'svh'],
            case_insensitive: false,
            keywords: SV_KEYWORDS, lexemes: /[\w\$]+/,
            contains: [
                hljs.C_BLOCK_COMMENT_MODE,
                hljs.C_LINE_COMMENT_MODE,
                hljs.QUOTE_STRING_MODE,
                {
                    className: 'number',
                    contains: [hljs.BACKSLASH_ESCAPE],
                    variants: [
                        {begin: '\\b((\\d+\'(b|h|o|d|B|H|O|D))[0-9xzXZa-fA-F_]+)'},
                        {begin: '\\B((\'(b|h|o|d|B|H|O|D))[0-9xzXZa-fA-F_]+)'},
                        {begin: '\\b([0-9_])+', relevance: 0}
                    ]
                },
                /* parameters to instances */
                {
                    className: 'variable',
                    variants: [
                        {begin: '#\\((?!parameter).+\\)'},
                        {begin: '\\.\\w+', relevance: 0},
                    ]
                },
                {
                    className: 'meta',
                    begin: '`', end: '$',
                    keywords: {'meta-keyword': 'define __FILE__ ' +
                    '__LINE__ begin_keywords celldefine default_nettype define ' +
                    'else elsif end_keywords endcelldefine endif ifdef ifndef ' +
                    'include line nounconnected_drive pragma resetall timescale ' +
                    'unconnected_drive undef undefineall'},
                    relevance: 0
                }
            ]
        }; // return
    };
},{}],51:[function(require,module,exports){
    module.exports = function(hljs) {
        // Regular expression for VHDL numeric literals.

        // Decimal literal:
        var INTEGER_RE = '\\d(_|\\d)*';
        var EXPONENT_RE = '[eE][-+]?' + INTEGER_RE;
        var DECIMAL_LITERAL_RE = INTEGER_RE + '(\\.' + INTEGER_RE + ')?' + '(' + EXPONENT_RE + ')?';
        // Based literal:
        var BASED_INTEGER_RE = '\\w+';
        var BASED_LITERAL_RE = INTEGER_RE + '#' + BASED_INTEGER_RE + '(\\.' + BASED_INTEGER_RE + ')?' + '#' + '(' + EXPONENT_RE + ')?';

        var NUMBER_RE = '\\b(' + BASED_LITERAL_RE + '|' + DECIMAL_LITERAL_RE + ')';

        return {
            case_insensitive: true,
            keywords: {
                keyword:
                'abs access after alias all and architecture array assert attribute begin block ' +
                'body buffer bus case component configuration constant context cover disconnect ' +
                'downto default else elsif end entity exit fairness file for force function generate ' +
                'generic group guarded if impure in inertial inout is label library linkage literal ' +
                'loop map mod nand new next nor not null of on open or others out package port ' +
                'postponed procedure process property protected pure range record register reject ' +
                'release rem report restrict restrict_guarantee return rol ror select sequence ' +
                'severity shared signal sla sll sra srl strong subtype then to transport type ' +
                'unaffected units until use variable vmode vprop vunit wait when while with xnor xor',
                built_in:
                'boolean bit character severity_level integer time delay_length natural positive ' +
                'string bit_vector file_open_kind file_open_status std_ulogic std_ulogic_vector ' +
                'std_logic std_logic_vector unsigned signed boolean_vector integer_vector ' +
                'real_vector time_vector'
            },
            illegal: '{',
            contains: [
                hljs.C_BLOCK_COMMENT_MODE,        // VHDL-2008 block commenting.
                hljs.COMMENT('--', '$'),
                hljs.QUOTE_STRING_MODE,
                {
                    className: 'number',
                    begin: NUMBER_RE,
                    relevance: 0
                },
                {
                    className: 'literal',
                    begin: '\'(U|X|0|1|Z|W|L|H|-)\'',
                    contains: [hljs.BACKSLASH_ESCAPE]
                },
                {
                    className: 'symbol',
                    begin: '\'[A-Za-z](_?[A-Za-z0-9])*',
                    contains: [hljs.BACKSLASH_ESCAPE]
                }
            ]
        };
    };
},{}],52:[function(require,module,exports){
    module.exports = function(hljs) {
        var XML_IDENT_RE = '[A-Za-z0-9\\._:-]+';
        var TAG_INTERNALS = {
            endsWithParent: true,
            illegal: /</,
            relevance: 0,
            contains: [
                {
                    className: 'attr',
                    begin: XML_IDENT_RE,
                    relevance: 0
                },
                {
                    begin: /=\s*/,
                    relevance: 0,
                    contains: [
                        {
                            className: 'string',
                            endsParent: true,
                            variants: [
                                {begin: /"/, end: /"/},
                                {begin: /'/, end: /'/},
                                {begin: /[^\s"'=<>`]+/}
                            ]
                        }
                    ]
                }
            ]
        };
        return {
            aliases: ['html', 'xhtml', 'rss', 'atom', 'xjb', 'xsd', 'xsl', 'plist'],
            case_insensitive: true,
            contains: [
                {
                    className: 'meta',
                    begin: '<!DOCTYPE', end: '>',
                    relevance: 10,
                    contains: [{begin: '\\[', end: '\\]'}]
                },
                hljs.COMMENT(
                    '<!--',
                    '-->',
                    {
                        relevance: 10
                    }
                ),
                {
                    begin: '<\\!\\[CDATA\\[', end: '\\]\\]>',
                    relevance: 10
                },
                {
                    begin: /<\?(php)?/, end: /\?>/,
                    subLanguage: 'php',
                    contains: [{begin: '/\\*', end: '\\*/', skip: true}]
                },
                {
                    className: 'tag',
                    /*
                     The lookahead pattern (?=...) ensures that 'begin' only matches
                     '<style' as a single word, followed by a whitespace or an
                     ending braket. The '$' is needed for the lexeme to be recognized
                     by hljs.subMode() that tests lexemes outside the stream.
                     */
                    begin: '<style(?=\\s|>|$)', end: '>',
                    keywords: {name: 'style'},
                    contains: [TAG_INTERNALS],
                    starts: {
                        end: '</style>', returnEnd: true,
                        subLanguage: ['css', 'xml']
                    }
                },
                {
                    className: 'tag',
                    // See the comment in the <style tag about the lookahead pattern
                    begin: '<script(?=\\s|>|$)', end: '>',
                    keywords: {name: 'script'},
                    contains: [TAG_INTERNALS],
                    starts: {
                        end: '\<\/script\>', returnEnd: true,
                        subLanguage: ['actionscript', 'javascript', 'handlebars', 'xml']
                    }
                },
                {
                    className: 'meta',
                    variants: [
                        {begin: /<\?xml/, end: /\?>/, relevance: 10},
                        {begin: /<\?\w+/, end: /\?>/}
                    ]
                },
                {
                    className: 'tag',
                    begin: '</?', end: '/?>',
                    contains: [
                        {
                            className: 'name', begin: /[^\/><\s]+/, relevance: 0
                        },
                        TAG_INTERNALS
                    ]
                }
            ]
        };
    };
},{}],53:[function(require,module,exports){
    module.exports = function(hljs) {
        var LITERALS = {literal: '{ } true false yes no Yes No True False null'};

        var keyPrefix = '^[ \\-]*';
        var keyName =  '[a-zA-Z_][\\w\\-]*';
        var KEY = {
            className: 'attr',
            variants: [
                { begin: keyPrefix + keyName + ":"},
                { begin: keyPrefix + '"' + keyName + '"' + ":"},
                { begin: keyPrefix + "'" + keyName + "'" + ":"}
            ]
        };

        var TEMPLATE_VARIABLES = {
            className: 'template-variable',
            variants: [
                { begin: '\{\{', end: '\}\}' }, // jinja templates Ansible
                { begin: '%\{', end: '\}' } // Ruby i18n
            ]
        };
        var STRING = {
            className: 'string',
            relevance: 0,
            variants: [
                {begin: /'/, end: /'/},
                {begin: /"/, end: /"/}
            ],
            contains: [
                hljs.BACKSLASH_ESCAPE,
                TEMPLATE_VARIABLES
            ]
        };

        return {
            case_insensitive: true,
            aliases: ['yml', 'YAML', 'yaml'],
            contains: [
                KEY,
                {
                    className: 'meta',
                    begin: '^---\s*$',
                    relevance: 10
                },
                { // multi line string
                    className: 'string',
                    begin: '[\\|>] *$',
                    returnEnd: true,
                    contains: STRING.contains,
                    // very simple termination: next hash key
                    end: KEY.variants[0].begin
                },
                { // Ruby/Rails erb
                    begin: '<%[%=-]?', end: '[%-]?%>',
                    subLanguage: 'ruby',
                    excludeBegin: true,
                    excludeEnd: true,
                    relevance: 0
                },
                { // data type
                    className: 'type',
                    begin: '!!' + hljs.UNDERSCORE_IDENT_RE,
                },
                { // fragment id &ref
                    className: 'meta',
                    begin: '&' + hljs.UNDERSCORE_IDENT_RE + '$',
                },
                { // fragment reference *ref
                    className: 'meta',
                    begin: '\\*' + hljs.UNDERSCORE_IDENT_RE + '$'
                },
                { // array listing
                    className: 'bullet',
                    begin: '^ *-',
                    relevance: 0
                },
                STRING,
                hljs.HASH_COMMENT_MODE,
                hljs.C_NUMBER_MODE
            ],
            keywords: LITERALS
        };
    };
},{}],54:[function(require,module,exports){
// Enclose abbreviations in <abbr> tags
//
    'use strict';


    module.exports = function sub_plugin(md) {
        var escapeRE        = md.utils.escapeRE,
            arrayReplaceAt  = md.utils.arrayReplaceAt;

        // ASCII characters in Cc, Sc, Sm, Sk categories we should terminate on;
        // you can check character classes here:
        // http://www.unicode.org/Public/UNIDATA/UnicodeData.txt
        var OTHER_CHARS      = ' \r\n$+<=>^`|~';

        var UNICODE_PUNCT_RE = md.utils.lib.ucmicro.P.source;
        var UNICODE_SPACE_RE = md.utils.lib.ucmicro.Z.source;


        function abbr_def(state, startLine, endLine, silent) {
            var label, title, ch, labelStart, labelEnd,
                pos = state.bMarks[startLine] + state.tShift[startLine],
                max = state.eMarks[startLine];

            if (pos + 2 >= max) { return false; }

            if (state.src.charCodeAt(pos++) !== 0x2A/* * */) { return false; }
            if (state.src.charCodeAt(pos++) !== 0x5B/* [ */) { return false; }

            labelStart = pos;

            for (; pos < max; pos++) {
                ch = state.src.charCodeAt(pos);
                if (ch === 0x5B /* [ */) {
                    return false;
                } else if (ch === 0x5D /* ] */) {
                    labelEnd = pos;
                    break;
                } else if (ch === 0x5C /* \ */) {
                    pos++;
                }
            }

            if (labelEnd < 0 || state.src.charCodeAt(labelEnd + 1) !== 0x3A/* : */) {
                return false;
            }

            if (silent) { return true; }

            label = state.src.slice(labelStart, labelEnd).replace(/\\(.)/g, '$1');
            title = state.src.slice(labelEnd + 2, max).trim();
            if (label.length === 0) { return false; }
            if (title.length === 0) { return false; }
            if (!state.env.abbreviations) { state.env.abbreviations = {}; }
            // prepend ':' to avoid conflict with Object.prototype members
            if (typeof state.env.abbreviations[':' + label] === 'undefined') {
                state.env.abbreviations[':' + label] = title;
            }

            state.line = startLine + 1;
            return true;
        }


        function abbr_replace(state) {
            var i, j, l, tokens, token, text, nodes, pos, reg, m, regText, regSimple,
                currentToken,
                blockTokens = state.tokens;

            if (!state.env.abbreviations) { return; }

            regSimple = new RegExp('(?:' +
                Object.keys(state.env.abbreviations).map(function (x) {
                    return x.substr(1);
                }).sort(function (a, b) {
                    return b.length - a.length;
                }).map(escapeRE).join('|') +
                ')');

            regText = '(^|' + UNICODE_PUNCT_RE + '|' + UNICODE_SPACE_RE +
                '|[' + OTHER_CHARS.split('').map(escapeRE).join('') + '])'
                + '(' + Object.keys(state.env.abbreviations).map(function (x) {
                    return x.substr(1);
                }).sort(function (a, b) {
                    return b.length - a.length;
                }).map(escapeRE).join('|') + ')'
                + '($|' + UNICODE_PUNCT_RE + '|' + UNICODE_SPACE_RE +
                '|[' + OTHER_CHARS.split('').map(escapeRE).join('') + '])';

            reg = new RegExp(regText, 'g');

            for (j = 0, l = blockTokens.length; j < l; j++) {
                if (blockTokens[j].type !== 'inline') { continue; }
                tokens = blockTokens[j].children;

                // We scan from the end, to keep position when new tags added.
                for (i = tokens.length - 1; i >= 0; i--) {
                    currentToken = tokens[i];
                    if (currentToken.type !== 'text') { continue; }

                    pos = 0;
                    text = currentToken.content;
                    reg.lastIndex = 0;
                    nodes = [];

                    // fast regexp run to determine whether there are any abbreviated words
                    // in the current token
                    if (!regSimple.test(text)) { continue; }

                    while ((m = reg.exec(text))) {
                        if (m.index > 0 || m[1].length > 0) {
                            token         = new state.Token('text', '', 0);
                            token.content = text.slice(pos, m.index + m[1].length);
                            nodes.push(token);
                        }

                        token         = new state.Token('abbr_open', 'abbr', 1);
                        token.attrs   = [ [ 'title', state.env.abbreviations[':' + m[2]] ] ];
                        nodes.push(token);

                        token         = new state.Token('text', '', 0);
                        token.content = m[2];
                        nodes.push(token);

                        token         = new state.Token('abbr_close', 'abbr', -1);
                        nodes.push(token);

                        reg.lastIndex -= m[3].length;
                        pos = reg.lastIndex;
                    }

                    if (!nodes.length) { continue; }

                    if (pos < text.length) {
                        token         = new state.Token('text', '', 0);
                        token.content = text.slice(pos);
                        nodes.push(token);
                    }

                    // replace current node
                    blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
                }
            }
        }

        md.block.ruler.before('reference', 'abbr_def', abbr_def, { alt: [ 'paragraph', 'reference' ] });

        md.core.ruler.after('linkify', 'abbr_replace', abbr_replace);
    };

},{}],55:[function(require,module,exports){
// Process block-level custom containers
//
    'use strict';


    module.exports = function container_plugin(md, name, options) {

        function validateDefault(params) {
            return params.trim().split(' ', 2)[0] === name;
        }

        function renderDefault(tokens, idx, _options, env, self) {

            // add a class to the opening tag
            if (tokens[idx].nesting === 1) {
                tokens[idx].attrPush([ 'class', name ]);
            }

            return self.renderToken(tokens, idx, _options, env, self);
        }

        options = options || {};

        var min_markers = 3,
            marker_str  = options.marker || ':',
            marker_char = marker_str.charCodeAt(0),
            marker_len  = marker_str.length,
            validate    = options.validate || validateDefault,
            render      = options.render || renderDefault;

        function container(state, startLine, endLine, silent) {
            var pos, nextLine, marker_count, markup, params, token,
                old_parent, old_line_max,
                auto_closed = false,
                start = state.bMarks[startLine] + state.tShift[startLine],
                max = state.eMarks[startLine];

            // Check out the first character quickly,
            // this should filter out most of non-containers
            //
            if (marker_char !== state.src.charCodeAt(start)) { return false; }

            // Check out the rest of the marker string
            //
            for (pos = start + 1; pos <= max; pos++) {
                if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
                    break;
                }
            }

            marker_count = Math.floor((pos - start) / marker_len);
            if (marker_count < min_markers) { return false; }
            pos -= (pos - start) % marker_len;

            markup = state.src.slice(start, pos);
            params = state.src.slice(pos, max);
            if (!validate(params)) { return false; }

            // Since start is found, we can report success here in validation mode
            //
            if (silent) { return true; }

            // Search for the end of the block
            //
            nextLine = startLine;

            for (;;) {
                nextLine++;
                if (nextLine >= endLine) {
                    // unclosed block should be autoclosed by end of document.
                    // also block seems to be autoclosed by end of parent
                    break;
                }

                start = state.bMarks[nextLine] + state.tShift[nextLine];
                max = state.eMarks[nextLine];

                if (start < max && state.sCount[nextLine] < state.blkIndent) {
                    // non-empty line with negative indent should stop the list:
                    // - ```
                    //  test
                    break;
                }

                if (marker_char !== state.src.charCodeAt(start)) { continue; }

                if (state.sCount[nextLine] - state.blkIndent >= 4) {
                    // closing fence should be indented less than 4 spaces
                    continue;
                }

                for (pos = start + 1; pos <= max; pos++) {
                    if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
                        break;
                    }
                }

                // closing code fence must be at least as long as the opening one
                if (Math.floor((pos - start) / marker_len) < marker_count) { continue; }

                // make sure tail has spaces only
                pos -= (pos - start) % marker_len;
                pos = state.skipSpaces(pos);

                if (pos < max) { continue; }

                // found!
                auto_closed = true;
                break;
            }

            old_parent = state.parentType;
            old_line_max = state.lineMax;
            state.parentType = 'container';

            // this will prevent lazy continuations from ever going past our end marker
            state.lineMax = nextLine;

            token        = state.push('container_' + name + '_open', 'div', 1);
            token.markup = markup;
            token.block  = true;
            token.info   = params;
            token.map    = [ startLine, nextLine ];

            state.md.block.tokenize(state, startLine + 1, nextLine);

            token        = state.push('container_' + name + '_close', 'div', -1);
            token.markup = state.src.slice(start, pos);
            token.block  = true;

            state.parentType = old_parent;
            state.lineMax = old_line_max;
            state.line = nextLine + (auto_closed ? 1 : 0);

            return true;
        }

        md.block.ruler.before('fence', 'container_' + name, container, {
            alt: [ 'paragraph', 'reference', 'blockquote', 'list' ]
        });
        md.renderer.rules['container_' + name + '_open'] = render;
        md.renderer.rules['container_' + name + '_close'] = render;
    };

},{}],56:[function(require,module,exports){
// Process definition lists
//
    'use strict';


    module.exports = function deflist_plugin(md) {
        var isSpace = md.utils.isSpace;

        // Search `[:~][\n ]`, returns next pos after marker on success
        // or -1 on fail.
        function skipMarker(state, line) {
            var pos, marker,
                start = state.bMarks[line] + state.tShift[line],
                max = state.eMarks[line];

            if (start >= max) { return -1; }

            // Check bullet
            marker = state.src.charCodeAt(start++);
            if (marker !== 0x7E/* ~ */ && marker !== 0x3A/* : */) { return -1; }

            pos = state.skipSpaces(start);

            // require space after ":"
            if (start === pos) { return -1; }

            // no empty definitions, e.g. "  : "
            if (pos >= max) { return -1; }

            return start;
        }

        function markTightParagraphs(state, idx) {
            var i, l,
                level = state.level + 2;

            for (i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
                if (state.tokens[i].level === level && state.tokens[i].type === 'paragraph_open') {
                    state.tokens[i + 2].hidden = true;
                    state.tokens[i].hidden = true;
                    i += 2;
                }
            }
        }

        function deflist(state, startLine, endLine, silent) {
            var ch,
                contentStart,
                ddLine,
                dtLine,
                itemLines,
                listLines,
                listTokIdx,
                max,
                nextLine,
                offset,
                oldDDIndent,
                oldIndent,
                oldParentType,
                oldSCount,
                oldTShift,
                oldTight,
                pos,
                prevEmptyEnd,
                tight,
                token;

            if (silent) {
                // quirk: validation mode validates a dd block only, not a whole deflist
                if (state.ddIndent < 0) { return false; }
                return skipMarker(state, startLine) >= 0;
            }

            nextLine = startLine + 1;
            if (state.isEmpty(nextLine)) {
                if (++nextLine > endLine) { return false; }
            }

            if (state.sCount[nextLine] < state.blkIndent) { return false; }
            contentStart = skipMarker(state, nextLine);
            if (contentStart < 0) { return false; }

            // Start list
            listTokIdx = state.tokens.length;
            tight = true;

            token     = state.push('dl_open', 'dl', 1);
            token.map = listLines = [ startLine, 0 ];

            //
            // Iterate list items
            //

            dtLine = startLine;
            ddLine = nextLine;

            // One definition list can contain multiple DTs,
            // and one DT can be followed by multiple DDs.
            //
            // Thus, there is two loops here, and label is
            // needed to break out of the second one
            //
            /*eslint no-labels:0,block-scoped-var:0*/
            OUTER:
                for (;;) {
                    prevEmptyEnd = false;

                    token          = state.push('dt_open', 'dt', 1);
                    token.map      = [ dtLine, dtLine ];

                    token          = state.push('inline', '', 0);
                    token.map      = [ dtLine, dtLine ];
                    token.content  = state.getLines(dtLine, dtLine + 1, state.blkIndent, false).trim();
                    token.children = [];

                    token          = state.push('dt_close', 'dt', -1);

                    for (;;) {
                        token     = state.push('dd_open', 'dd', 1);
                        token.map = itemLines = [ nextLine, 0 ];

                        pos = contentStart;
                        max = state.eMarks[ddLine];
                        offset = state.sCount[ddLine] + contentStart - (state.bMarks[ddLine] + state.tShift[ddLine]);

                        while (pos < max) {
                            ch = state.src.charCodeAt(pos);

                            if (isSpace(ch)) {
                                if (ch === 0x09) {
                                    offset += 4 - offset % 4;
                                } else {
                                    offset++;
                                }
                            } else {
                                break;
                            }

                            pos++;
                        }

                        contentStart = pos;

                        oldTight = state.tight;
                        oldDDIndent = state.ddIndent;
                        oldIndent = state.blkIndent;
                        oldTShift = state.tShift[ddLine];
                        oldSCount = state.sCount[ddLine];
                        oldParentType = state.parentType;
                        state.blkIndent = state.ddIndent = state.sCount[ddLine] + 2;
                        state.tShift[ddLine] = contentStart - state.bMarks[ddLine];
                        state.sCount[ddLine] = offset;
                        state.tight = true;
                        state.parentType = 'deflist';

                        state.md.block.tokenize(state, ddLine, endLine, true);

                        // If any of list item is tight, mark list as tight
                        if (!state.tight || prevEmptyEnd) {
                            tight = false;
                        }
                        // Item become loose if finish with empty line,
                        // but we should filter last element, because it means list finish
                        prevEmptyEnd = (state.line - ddLine) > 1 && state.isEmpty(state.line - 1);

                        state.tShift[ddLine] = oldTShift;
                        state.sCount[ddLine] = oldSCount;
                        state.tight = oldTight;
                        state.parentType = oldParentType;
                        state.blkIndent = oldIndent;
                        state.ddIndent = oldDDIndent;

                        token = state.push('dd_close', 'dd', -1);

                        itemLines[1] = nextLine = state.line;

                        if (nextLine >= endLine) { break OUTER; }

                        if (state.sCount[nextLine] < state.blkIndent) { break OUTER; }
                        contentStart = skipMarker(state, nextLine);
                        if (contentStart < 0) { break; }

                        ddLine = nextLine;

                        // go to the next loop iteration:
                        // insert DD tag and repeat checking
                    }

                    if (nextLine >= endLine) { break; }
                    dtLine = nextLine;

                    if (state.isEmpty(dtLine)) { break; }
                    if (state.sCount[dtLine] < state.blkIndent) { break; }

                    ddLine = dtLine + 1;
                    if (ddLine >= endLine) { break; }
                    if (state.isEmpty(ddLine)) { ddLine++; }
                    if (ddLine >= endLine) { break; }

                    if (state.sCount[ddLine] < state.blkIndent) { break; }
                    contentStart = skipMarker(state, ddLine);
                    if (contentStart < 0) { break; }

                    // go to the next loop iteration:
                    // insert DT and DD tags and repeat checking
                }

            // Finilize list
            token = state.push('dl_close', 'dl', -1);

            listLines[1] = nextLine;

            state.line = nextLine;

            // mark paragraphs tight if needed
            if (tight) {
                markTightParagraphs(state, listTokIdx);
            }

            return true;
        }


        md.block.ruler.before('paragraph', 'deflist', deflist, { alt: [ 'paragraph', 'reference' ] });
    };

},{}],57:[function(require,module,exports){
    'use strict';


    var emojies_defs      = require('./lib/data/full.json');
    var emojies_shortcuts = require('./lib/data/shortcuts');
    var emoji_html        = require('./lib/render');
    var emoji_replace     = require('./lib/replace');
    var normalize_opts    = require('./lib/normalize_opts');


    module.exports = function emoji_plugin(md, options) {
        var defaults = {
            defs: emojies_defs,
            shortcuts: emojies_shortcuts,
            enabled: []
        };

        var opts = normalize_opts(md.utils.assign({}, defaults, options || {}));

        md.renderer.rules.emoji = emoji_html;

        md.core.ruler.push('emoji', emoji_replace(md, opts.defs, opts.shortcuts, opts.scanRE, opts.replaceRE));
    };

},{"./lib/data/full.json":58,"./lib/data/shortcuts":59,"./lib/normalize_opts":60,"./lib/render":61,"./lib/replace":62}],58:[function(require,module,exports){
    module.exports={
        "100": "💯",
        "1234": "🔢",
        "smile": "😄",
        "smiley": "😃",
        "grinning": "😀",
        "blush": "😊",
        "relaxed": "☺️",
        "wink": "😉",
        "heart_eyes": "😍",
        "kissing_heart": "😘",
        "kissing_closed_eyes": "😚",
        "kissing": "😗",
        "kissing_smiling_eyes": "😙",
        "stuck_out_tongue_winking_eye": "😜",
        "stuck_out_tongue_closed_eyes": "😝",
        "stuck_out_tongue": "😛",
        "flushed": "😳",
        "grin": "😁",
        "pensive": "😔",
        "relieved": "😌",
        "unamused": "😒",
        "disappointed": "😞",
        "persevere": "😣",
        "cry": "😢",
        "joy": "😂",
        "sob": "😭",
        "sleepy": "😪",
        "disappointed_relieved": "😥",
        "cold_sweat": "😰",
        "sweat_smile": "😅",
        "sweat": "😓",
        "weary": "😩",
        "tired_face": "😫",
        "fearful": "😨",
        "scream": "😱",
        "angry": "😠",
        "rage": "😡",
        "triumph": "😤",
        "confounded": "😖",
        "laughing": "😆",
        "satisfied": "😆",
        "yum": "😋",
        "mask": "😷",
        "sunglasses": "😎",
        "sleeping": "😴",
        "dizzy_face": "😵",
        "astonished": "😲",
        "worried": "😟",
        "frowning": "😦",
        "anguished": "😧",
        "smiling_imp": "😈",
        "imp": "👿",
        "open_mouth": "😮",
        "grimacing": "😬",
        "neutral_face": "😐",
        "confused": "😕",
        "hushed": "😯",
        "no_mouth": "😶",
        "innocent": "😇",
        "smirk": "😏",
        "expressionless": "😑",
        "man_with_gua_pi_mao": "👲",
        "man_with_turban": "👳",
        "cop": "👮",
        "construction_worker": "👷",
        "guardsman": "💂",
        "baby": "👶",
        "boy": "👦",
        "girl": "👧",
        "man": "👨",
        "woman": "👩",
        "older_man": "👴",
        "older_woman": "👵",
        "person_with_blond_hair": "👱",
        "angel": "👼",
        "princess": "👸",
        "smiley_cat": "😺",
        "smile_cat": "😸",
        "heart_eyes_cat": "😻",
        "kissing_cat": "😽",
        "smirk_cat": "😼",
        "scream_cat": "🙀",
        "crying_cat_face": "😿",
        "joy_cat": "😹",
        "pouting_cat": "😾",
        "japanese_ogre": "👹",
        "japanese_goblin": "👺",
        "see_no_evil": "🙈",
        "hear_no_evil": "🙉",
        "speak_no_evil": "🙊",
        "skull": "💀",
        "alien": "👽",
        "hankey": "💩",
        "poop": "💩",
        "shit": "💩",
        "fire": "🔥",
        "sparkles": "✨",
        "star2": "🌟",
        "dizzy": "💫",
        "boom": "💥",
        "collision": "💥",
        "anger": "💢",
        "sweat_drops": "💦",
        "droplet": "💧",
        "zzz": "💤",
        "dash": "💨",
        "ear": "👂",
        "eyes": "👀",
        "nose": "👃",
        "tongue": "👅",
        "lips": "👄",
        "+1": "👍",
        "thumbsup": "👍",
        "-1": "👎",
        "thumbsdown": "👎",
        "ok_hand": "👌",
        "facepunch": "👊",
        "punch": "👊",
        "fist": "✊",
        "v": "✌️",
        "wave": "👋",
        "hand": "✋",
        "raised_hand": "✋",
        "open_hands": "👐",
        "point_up_2": "👆",
        "point_down": "👇",
        "point_right": "👉",
        "point_left": "👈",
        "raised_hands": "🙌",
        "pray": "🙏",
        "point_up": "☝️",
        "clap": "👏",
        "muscle": "💪",
        "walking": "🚶",
        "runner": "🏃",
        "running": "🏃",
        "dancer": "💃",
        "couple": "👫",
        "family": "👪",
        "two_men_holding_hands": "👬",
        "two_women_holding_hands": "👭",
        "couplekiss": "💏",
        "couple_with_heart": "💑",
        "dancers": "👯",
        "ok_woman": "🙆",
        "no_good": "🙅",
        "information_desk_person": "💁",
        "raising_hand": "🙋",
        "massage": "💆",
        "haircut": "💇",
        "nail_care": "💅",
        "bride_with_veil": "👰",
        "person_with_pouting_face": "🙎",
        "person_frowning": "🙍",
        "bow": "🙇",
        "tophat": "🎩",
        "crown": "👑",
        "womans_hat": "👒",
        "athletic_shoe": "👟",
        "mans_shoe": "👞",
        "shoe": "👞",
        "sandal": "👡",
        "high_heel": "👠",
        "boot": "👢",
        "shirt": "👕",
        "tshirt": "👕",
        "necktie": "👔",
        "womans_clothes": "👚",
        "dress": "👗",
        "running_shirt_with_sash": "🎽",
        "jeans": "👖",
        "kimono": "👘",
        "bikini": "👙",
        "briefcase": "💼",
        "handbag": "👜",
        "pouch": "👝",
        "purse": "👛",
        "eyeglasses": "👓",
        "ribbon": "🎀",
        "closed_umbrella": "🌂",
        "lipstick": "💄",
        "yellow_heart": "💛",
        "blue_heart": "💙",
        "purple_heart": "💜",
        "green_heart": "💚",
        "heart": "❤️",
        "broken_heart": "💔",
        "heartpulse": "💗",
        "heartbeat": "💓",
        "two_hearts": "💕",
        "sparkling_heart": "💖",
        "revolving_hearts": "💞",
        "cupid": "💘",
        "love_letter": "💌",
        "kiss": "💋",
        "ring": "💍",
        "gem": "💎",
        "bust_in_silhouette": "👤",
        "busts_in_silhouette": "👥",
        "speech_balloon": "💬",
        "footprints": "👣",
        "thought_balloon": "💭",
        "dog": "🐶",
        "wolf": "🐺",
        "cat": "🐱",
        "mouse": "🐭",
        "hamster": "🐹",
        "rabbit": "🐰",
        "frog": "🐸",
        "tiger": "🐯",
        "koala": "🐨",
        "bear": "🐻",
        "pig": "🐷",
        "pig_nose": "🐽",
        "cow": "🐮",
        "boar": "🐗",
        "monkey_face": "🐵",
        "monkey": "🐒",
        "horse": "🐴",
        "sheep": "🐑",
        "elephant": "🐘",
        "panda_face": "🐼",
        "penguin": "🐧",
        "bird": "🐦",
        "baby_chick": "🐤",
        "hatched_chick": "🐥",
        "hatching_chick": "🐣",
        "chicken": "🐔",
        "snake": "🐍",
        "turtle": "🐢",
        "bug": "🐛",
        "bee": "🐝",
        "honeybee": "🐝",
        "ant": "🐜",
        "beetle": "🐞",
        "snail": "🐌",
        "octopus": "🐙",
        "shell": "🐚",
        "tropical_fish": "🐠",
        "fish": "🐟",
        "dolphin": "🐬",
        "flipper": "🐬",
        "whale": "🐳",
        "whale2": "🐋",
        "cow2": "🐄",
        "ram": "🐏",
        "rat": "🐀",
        "water_buffalo": "🐃",
        "tiger2": "🐅",
        "rabbit2": "🐇",
        "dragon": "🐉",
        "racehorse": "🐎",
        "goat": "🐐",
        "rooster": "🐓",
        "dog2": "🐕",
        "pig2": "🐖",
        "mouse2": "🐁",
        "ox": "🐂",
        "dragon_face": "🐲",
        "blowfish": "🐡",
        "crocodile": "🐊",
        "camel": "🐫",
        "dromedary_camel": "🐪",
        "leopard": "🐆",
        "cat2": "🐈",
        "poodle": "🐩",
        "feet": "🐾",
        "paw_prints": "🐾",
        "bouquet": "💐",
        "cherry_blossom": "🌸",
        "tulip": "🌷",
        "four_leaf_clover": "🍀",
        "rose": "🌹",
        "sunflower": "🌻",
        "hibiscus": "🌺",
        "maple_leaf": "🍁",
        "leaves": "🍃",
        "fallen_leaf": "🍂",
        "herb": "🌿",
        "ear_of_rice": "🌾",
        "mushroom": "🍄",
        "cactus": "🌵",
        "palm_tree": "🌴",
        "evergreen_tree": "🌲",
        "deciduous_tree": "🌳",
        "chestnut": "🌰",
        "seedling": "🌱",
        "blossom": "🌼",
        "globe_with_meridians": "🌐",
        "sun_with_face": "🌞",
        "full_moon_with_face": "🌝",
        "new_moon_with_face": "🌚",
        "new_moon": "🌑",
        "waxing_crescent_moon": "🌒",
        "first_quarter_moon": "🌓",
        "moon": "🌔",
        "waxing_gibbous_moon": "🌔",
        "full_moon": "🌕",
        "waning_gibbous_moon": "🌖",
        "last_quarter_moon": "🌗",
        "waning_crescent_moon": "🌘",
        "last_quarter_moon_with_face": "🌜",
        "first_quarter_moon_with_face": "🌛",
        "crescent_moon": "🌙",
        "earth_africa": "🌍",
        "earth_americas": "🌎",
        "earth_asia": "🌏",
        "volcano": "🌋",
        "milky_way": "🌌",
        "stars": "🌠",
        "star": "⭐",
        "sunny": "☀️",
        "partly_sunny": "⛅",
        "cloud": "☁️",
        "zap": "⚡",
        "umbrella": "☔",
        "snowflake": "❄️",
        "snowman": "⛄",
        "cyclone": "🌀",
        "foggy": "🌁",
        "rainbow": "🌈",
        "ocean": "🌊",
        "bamboo": "🎍",
        "gift_heart": "💝",
        "dolls": "🎎",
        "school_satchel": "🎒",
        "mortar_board": "🎓",
        "flags": "🎏",
        "fireworks": "🎆",
        "sparkler": "🎇",
        "wind_chime": "🎐",
        "rice_scene": "🎑",
        "jack_o_lantern": "🎃",
        "ghost": "👻",
        "santa": "🎅",
        "christmas_tree": "🎄",
        "gift": "🎁",
        "tanabata_tree": "🎋",
        "tada": "🎉",
        "confetti_ball": "🎊",
        "balloon": "🎈",
        "crossed_flags": "🎌",
        "crystal_ball": "🔮",
        "movie_camera": "🎥",
        "camera": "📷",
        "video_camera": "📹",
        "vhs": "📼",
        "cd": "💿",
        "dvd": "📀",
        "minidisc": "💽",
        "floppy_disk": "💾",
        "computer": "💻",
        "iphone": "📱",
        "phone": "☎️",
        "telephone": "☎️",
        "telephone_receiver": "📞",
        "pager": "📟",
        "fax": "📠",
        "satellite": "📡",
        "tv": "📺",
        "radio": "📻",
        "loud_sound": "🔊",
        "sound": "🔉",
        "speaker": "🔈",
        "mute": "🔇",
        "bell": "🔔",
        "no_bell": "🔕",
        "loudspeaker": "📢",
        "mega": "📣",
        "hourglass_flowing_sand": "⏳",
        "hourglass": "⌛",
        "alarm_clock": "⏰",
        "watch": "⌚",
        "unlock": "🔓",
        "lock": "🔒",
        "lock_with_ink_pen": "🔏",
        "closed_lock_with_key": "🔐",
        "key": "🔑",
        "mag_right": "🔎",
        "bulb": "💡",
        "flashlight": "🔦",
        "high_brightness": "🔆",
        "low_brightness": "🔅",
        "electric_plug": "🔌",
        "battery": "🔋",
        "mag": "🔍",
        "bathtub": "🛁",
        "bath": "🛀",
        "shower": "🚿",
        "toilet": "🚽",
        "wrench": "🔧",
        "nut_and_bolt": "🔩",
        "hammer": "🔨",
        "door": "🚪",
        "smoking": "🚬",
        "bomb": "💣",
        "gun": "🔫",
        "hocho": "🔪",
        "knife": "🔪",
        "pill": "💊",
        "syringe": "💉",
        "moneybag": "💰",
        "yen": "💴",
        "dollar": "💵",
        "pound": "💷",
        "euro": "💶",
        "credit_card": "💳",
        "money_with_wings": "💸",
        "calling": "📲",
        "e-mail": "📧",
        "inbox_tray": "📥",
        "outbox_tray": "📤",
        "email": "✉️",
        "envelope": "✉️",
        "envelope_with_arrow": "📩",
        "incoming_envelope": "📨",
        "postal_horn": "📯",
        "mailbox": "📫",
        "mailbox_closed": "📪",
        "mailbox_with_mail": "📬",
        "mailbox_with_no_mail": "📭",
        "postbox": "📮",
        "package": "📦",
        "memo": "📝",
        "pencil": "📝",
        "page_facing_up": "📄",
        "page_with_curl": "📃",
        "bookmark_tabs": "📑",
        "bar_chart": "📊",
        "chart_with_upwards_trend": "📈",
        "chart_with_downwards_trend": "📉",
        "scroll": "📜",
        "clipboard": "📋",
        "date": "📅",
        "calendar": "📆",
        "card_index": "📇",
        "file_folder": "📁",
        "open_file_folder": "📂",
        "scissors": "✂️",
        "pushpin": "📌",
        "paperclip": "📎",
        "black_nib": "✒️",
        "pencil2": "✏️",
        "straight_ruler": "📏",
        "triangular_ruler": "📐",
        "closed_book": "📕",
        "green_book": "📗",
        "blue_book": "📘",
        "orange_book": "📙",
        "notebook": "📓",
        "notebook_with_decorative_cover": "📔",
        "ledger": "📒",
        "books": "📚",
        "book": "📖",
        "open_book": "📖",
        "bookmark": "🔖",
        "name_badge": "📛",
        "microscope": "🔬",
        "telescope": "🔭",
        "newspaper": "📰",
        "art": "🎨",
        "clapper": "🎬",
        "microphone": "🎤",
        "headphones": "🎧",
        "musical_score": "🎼",
        "musical_note": "🎵",
        "notes": "🎶",
        "musical_keyboard": "🎹",
        "violin": "🎻",
        "trumpet": "🎺",
        "saxophone": "🎷",
        "guitar": "🎸",
        "space_invader": "👾",
        "video_game": "🎮",
        "black_joker": "🃏",
        "flower_playing_cards": "🎴",
        "mahjong": "🀄",
        "game_die": "🎲",
        "dart": "🎯",
        "football": "🏈",
        "basketball": "🏀",
        "soccer": "⚽",
        "baseball": "⚾️",
        "tennis": "🎾",
        "8ball": "🎱",
        "rugby_football": "🏉",
        "bowling": "🎳",
        "golf": "⛳",
        "mountain_bicyclist": "🚵",
        "bicyclist": "🚴",
        "checkered_flag": "🏁",
        "horse_racing": "🏇",
        "trophy": "🏆",
        "ski": "🎿",
        "snowboarder": "🏂",
        "swimmer": "🏊",
        "surfer": "🏄",
        "fishing_pole_and_fish": "🎣",
        "coffee": "☕",
        "tea": "🍵",
        "sake": "🍶",
        "baby_bottle": "🍼",
        "beer": "🍺",
        "beers": "🍻",
        "cocktail": "🍸",
        "tropical_drink": "🍹",
        "wine_glass": "🍷",
        "fork_and_knife": "🍴",
        "pizza": "🍕",
        "hamburger": "🍔",
        "fries": "🍟",
        "poultry_leg": "🍗",
        "meat_on_bone": "🍖",
        "spaghetti": "🍝",
        "curry": "🍛",
        "fried_shrimp": "🍤",
        "bento": "🍱",
        "sushi": "🍣",
        "fish_cake": "🍥",
        "rice_ball": "🍙",
        "rice_cracker": "🍘",
        "rice": "🍚",
        "ramen": "🍜",
        "stew": "🍲",
        "oden": "🍢",
        "dango": "🍡",
        "egg": "🍳",
        "bread": "🍞",
        "doughnut": "🍩",
        "custard": "🍮",
        "icecream": "🍦",
        "ice_cream": "🍨",
        "shaved_ice": "🍧",
        "birthday": "🎂",
        "cake": "🍰",
        "cookie": "🍪",
        "chocolate_bar": "🍫",
        "candy": "🍬",
        "lollipop": "🍭",
        "honey_pot": "🍯",
        "apple": "🍎",
        "green_apple": "🍏",
        "tangerine": "🍊",
        "lemon": "🍋",
        "cherries": "🍒",
        "grapes": "🍇",
        "watermelon": "🍉",
        "strawberry": "🍓",
        "peach": "🍑",
        "melon": "🍈",
        "banana": "🍌",
        "pear": "🍐",
        "pineapple": "🍍",
        "sweet_potato": "🍠",
        "eggplant": "🍆",
        "tomato": "🍅",
        "corn": "🌽",
        "house": "🏠",
        "house_with_garden": "🏡",
        "school": "🏫",
        "office": "🏢",
        "post_office": "🏣",
        "hospital": "🏥",
        "bank": "🏦",
        "convenience_store": "🏪",
        "love_hotel": "🏩",
        "hotel": "🏨",
        "wedding": "💒",
        "church": "⛪",
        "department_store": "🏬",
        "european_post_office": "🏤",
        "city_sunrise": "🌇",
        "city_sunset": "🌆",
        "japanese_castle": "🏯",
        "european_castle": "🏰",
        "tent": "⛺",
        "factory": "🏭",
        "tokyo_tower": "🗼",
        "japan": "🗾",
        "mount_fuji": "🗻",
        "sunrise_over_mountains": "🌄",
        "sunrise": "🌅",
        "night_with_stars": "🌃",
        "statue_of_liberty": "🗽",
        "bridge_at_night": "🌉",
        "carousel_horse": "🎠",
        "ferris_wheel": "🎡",
        "fountain": "⛲",
        "roller_coaster": "🎢",
        "ship": "🚢",
        "boat": "⛵",
        "sailboat": "⛵",
        "speedboat": "🚤",
        "rowboat": "🚣",
        "anchor": "⚓",
        "rocket": "🚀",
        "airplane": "✈️",
        "seat": "💺",
        "helicopter": "🚁",
        "steam_locomotive": "🚂",
        "tram": "🚊",
        "station": "🚉",
        "mountain_railway": "🚞",
        "train2": "🚆",
        "bullettrain_side": "🚄",
        "bullettrain_front": "🚅",
        "light_rail": "🚈",
        "metro": "🚇",
        "monorail": "🚝",
        "train": "🚋",
        "railway_car": "🚃",
        "trolleybus": "🚎",
        "bus": "🚌",
        "oncoming_bus": "🚍",
        "blue_car": "🚙",
        "oncoming_automobile": "🚘",
        "car": "🚗",
        "red_car": "🚗",
        "taxi": "🚕",
        "oncoming_taxi": "🚖",
        "articulated_lorry": "🚛",
        "truck": "🚚",
        "rotating_light": "🚨",
        "police_car": "🚓",
        "oncoming_police_car": "🚔",
        "fire_engine": "🚒",
        "ambulance": "🚑",
        "minibus": "🚐",
        "bike": "🚲",
        "aerial_tramway": "🚡",
        "suspension_railway": "🚟",
        "mountain_cableway": "🚠",
        "tractor": "🚜",
        "barber": "💈",
        "busstop": "🚏",
        "ticket": "🎫",
        "vertical_traffic_light": "🚦",
        "traffic_light": "🚥",
        "warning": "⚠️",
        "construction": "🚧",
        "beginner": "🔰",
        "fuelpump": "⛽",
        "izakaya_lantern": "🏮",
        "lantern": "🏮",
        "slot_machine": "🎰",
        "hotsprings": "♨️",
        "moyai": "🗿",
        "circus_tent": "🎪",
        "performing_arts": "🎭",
        "round_pushpin": "📍",
        "triangular_flag_on_post": "🚩",
        "jp": "🇯🇵",
        "kr": "🇰🇷",
        "de": "🇩🇪",
        "cn": "🇨🇳",
        "us": "🇺🇸",
        "fr": "🇫🇷",
        "es": "🇪🇸",
        "it": "🇮🇹",
        "ru": "🇷🇺",
        "gb": "🇬🇧",
        "uk": "🇬🇧",
        "one": "1️⃣",
        "two": "2️⃣",
        "three": "3️⃣",
        "four": "4️⃣",
        "five": "5️⃣",
        "six": "6️⃣",
        "seven": "7️⃣",
        "eight": "8️⃣",
        "nine": "9️⃣",
        "zero": "0️⃣",
        "keycap_ten": "🔟",
        "hash": "#️⃣",
        "symbols": "🔣",
        "arrow_up": "⬆️",
        "arrow_down": "⬇️",
        "arrow_left": "⬅️",
        "arrow_right": "➡️",
        "capital_abcd": "🔠",
        "abcd": "🔡",
        "abc": "🔤",
        "arrow_upper_right": "↗️",
        "arrow_upper_left": "↖️",
        "arrow_lower_right": "↘️",
        "arrow_lower_left": "↙️",
        "left_right_arrow": "↔️",
        "arrow_up_down": "↕️",
        "arrows_counterclockwise": "🔄",
        "arrow_backward": "◀️",
        "arrow_forward": "▶️",
        "arrow_up_small": "🔼",
        "arrow_down_small": "🔽",
        "leftwards_arrow_with_hook": "↩️",
        "arrow_right_hook": "↪️",
        "information_source": "ℹ️",
        "rewind": "⏪",
        "fast_forward": "⏩",
        "arrow_double_up": "⏫",
        "arrow_double_down": "⏬",
        "arrow_heading_down": "⤵️",
        "arrow_heading_up": "⤴️",
        "ok": "🆗",
        "twisted_rightwards_arrows": "🔀",
        "repeat": "🔁",
        "repeat_one": "🔂",
        "new": "🆕",
        "up": "🆙",
        "cool": "🆒",
        "free": "🆓",
        "ng": "🆖",
        "signal_strength": "📶",
        "cinema": "🎦",
        "koko": "🈁",
        "u6307": "🈯",
        "u7a7a": "🈳",
        "u6e80": "🈵",
        "u5408": "🈴",
        "u7981": "🈲",
        "ideograph_advantage": "🉐",
        "u5272": "🈹",
        "u55b6": "🈺",
        "u6709": "🈶",
        "u7121": "🈚",
        "restroom": "🚻",
        "mens": "🚹",
        "womens": "🚺",
        "baby_symbol": "🚼",
        "wc": "🚾",
        "potable_water": "🚰",
        "put_litter_in_its_place": "🚮",
        "parking": "🅿️",
        "wheelchair": "♿",
        "no_smoking": "🚭",
        "u6708": "🈷️",
        "u7533": "🈸",
        "sa": "🈂️",
        "m": "Ⓜ️",
        "passport_control": "🛂",
        "baggage_claim": "🛄",
        "left_luggage": "🛅",
        "customs": "🛃",
        "accept": "🉑",
        "secret": "㊙️",
        "congratulations": "㊗️",
        "cl": "🆑",
        "sos": "🆘",
        "id": "🆔",
        "no_entry_sign": "🚫",
        "underage": "🔞",
        "no_mobile_phones": "📵",
        "do_not_litter": "🚯",
        "non-potable_water": "🚱",
        "no_bicycles": "🚳",
        "no_pedestrians": "🚷",
        "children_crossing": "🚸",
        "no_entry": "⛔",
        "eight_spoked_asterisk": "✳️",
        "sparkle": "❇️",
        "negative_squared_cross_mark": "❎",
        "white_check_mark": "✅",
        "eight_pointed_black_star": "✴️",
        "heart_decoration": "💟",
        "vs": "🆚",
        "vibration_mode": "📳",
        "mobile_phone_off": "📴",
        "a": "🅰️",
        "b": "🅱️",
        "ab": "🆎",
        "o2": "🅾️",
        "diamond_shape_with_a_dot_inside": "💠",
        "loop": "➿",
        "recycle": "♻️",
        "aries": "♈",
        "taurus": "♉",
        "gemini": "♊",
        "cancer": "♋",
        "leo": "♌",
        "virgo": "♍",
        "libra": "♎",
        "scorpius": "♏",
        "sagittarius": "♐",
        "capricorn": "♑",
        "aquarius": "♒",
        "pisces": "♓",
        "ophiuchus": "⛎",
        "six_pointed_star": "🔯",
        "atm": "🏧",
        "chart": "💹",
        "heavy_dollar_sign": "💲",
        "currency_exchange": "💱",
        "copyright": "©️",
        "registered": "®️",
        "tm": "™️",
        "x": "❌",
        "bangbang": "‼️",
        "interrobang": "⁉️",
        "exclamation": "❗",
        "heavy_exclamation_mark": "❗",
        "question": "❓",
        "grey_exclamation": "❕",
        "grey_question": "❔",
        "o": "⭕",
        "top": "🔝",
        "end": "🔚",
        "back": "🔙",
        "on": "🔛",
        "soon": "🔜",
        "arrows_clockwise": "🔃",
        "clock12": "🕛",
        "clock1230": "🕧",
        "clock1": "🕐",
        "clock130": "🕜",
        "clock2": "🕑",
        "clock230": "🕝",
        "clock3": "🕒",
        "clock330": "🕞",
        "clock4": "🕓",
        "clock430": "🕟",
        "clock5": "🕔",
        "clock530": "🕠",
        "clock6": "🕕",
        "clock7": "🕖",
        "clock8": "🕗",
        "clock9": "🕘",
        "clock10": "🕙",
        "clock11": "🕚",
        "clock630": "🕡",
        "clock730": "🕢",
        "clock830": "🕣",
        "clock930": "🕤",
        "clock1030": "🕥",
        "clock1130": "🕦",
        "heavy_multiplication_x": "✖️",
        "heavy_plus_sign": "➕",
        "heavy_minus_sign": "➖",
        "heavy_division_sign": "➗",
        "spades": "♠️",
        "hearts": "♥️",
        "clubs": "♣️",
        "diamonds": "♦️",
        "white_flower": "💮",
        "heavy_check_mark": "✔️",
        "ballot_box_with_check": "☑️",
        "radio_button": "🔘",
        "link": "🔗",
        "curly_loop": "➰",
        "wavy_dash": "〰️",
        "part_alternation_mark": "〽️",
        "trident": "🔱",
        "black_medium_square": "◼️",
        "white_medium_square": "◻️",
        "black_medium_small_square": "◾",
        "white_medium_small_square": "◽",
        "black_small_square": "▪️",
        "white_small_square": "▫️",
        "small_red_triangle": "🔺",
        "black_square_button": "🔲",
        "white_square_button": "🔳",
        "black_circle": "⚫",
        "white_circle": "⚪",
        "red_circle": "🔴",
        "large_blue_circle": "🔵",
        "small_red_triangle_down": "🔻",
        "white_large_square": "⬜",
        "black_large_square": "⬛",
        "large_orange_diamond": "🔶",
        "large_blue_diamond": "🔷",
        "small_orange_diamond": "🔸",
        "small_blue_diamond": "🔹"
    }
},{}],59:[function(require,module,exports){
// Emoticons -> Emoji mapping.
//
// (!) Some patterns skipped, to avoid collisions
// without increase matcher complicity. Than can change in future.
//
// Places to look for more emoticons info:
//
// - http://en.wikipedia.org/wiki/List_of_emoticons#Western
// - https://github.com/wooorm/emoticon/blob/master/Support.md
// - http://factoryjoe.com/projects/emoticons/
//
    'use strict';

    module.exports = {
        angry:            [ '>:(', '>:-(' ],
        blush:            [ ':")', ':-")' ],
        broken_heart:     [ '</3', '<\\3' ],
        // :\ and :-\ not used because of conflict with markdown escaping
        confused:         [ ':/', ':-/' ], // twemoji shows question
        cry:              [ ":'(", ":'-(", ':,(', ':,-(' ],
        frowning:         [ ':(', ':-(' ],
        heart:            [ '<3' ],
        imp:              [ ']:(', ']:-(' ],
        innocent:         [ 'o:)', 'O:)', 'o:-)', 'O:-)', '0:)', '0:-)' ],
        joy:              [ ":')", ":'-)", ':,)', ':,-)', ":'D", ":'-D", ':,D', ':,-D' ],
        kissing:          [ ':*', ':-*' ],
        laughing:         [ 'x-)', 'X-)' ],
        neutral_face:     [ ':|', ':-|' ],
        open_mouth:       [ ':o', ':-o', ':O', ':-O' ],
        rage:             [ ':@', ':-@' ],
        smile:            [ ':D', ':-D' ],
        smiley:           [ ':)', ':-)' ],
        smiling_imp:      [ ']:)', ']:-)' ],
        sob:              [ ":,'(", ":,'-(", ';(', ';-(' ],
        stuck_out_tongue: [ ':P', ':-P' ],
        sunglasses:       [ '8-)', 'B-)' ],
        sweat:            [ ',:(', ',:-(' ],
        sweat_smile:      [ ',:)', ',:-)' ],
        unamused:         [ ':s', ':-S', ':z', ':-Z', ':$', ':-$' ],
        wink:             [ ';)', ';-)' ]
    };

},{}],60:[function(require,module,exports){
// Convert input options to more useable format
// and compile search regexp

    'use strict';


    function quoteRE (str) {
        return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');
    }


    module.exports = function normalize_opts(options) {
        var emojies = options.defs,
            shortcuts;

        // Filter emojies by whitelist, if needed
        if (options.enabled.length) {
            emojies = Object.keys(emojies).reduce(function (acc, key) {
                if (options.enabled.indexOf(key) >= 0) {
                    acc[key] = emojies[key];
                }
                return acc;
            }, {});
        }

        // Flatten shortcuts to simple object: { alias: emoji_name }
        shortcuts = Object.keys(options.shortcuts).reduce(function (acc, key) {
            // Skip aliases for filtered emojies, to reduce regexp
            if (!emojies[key]) { return acc; }

            if (Array.isArray(options.shortcuts[key])) {
                options.shortcuts[key].forEach(function (alias) {
                    acc[alias] = key;
                });
                return acc;
            }

            acc[options.shortcuts[key]] = key;
            return acc;
        }, {});

        // Compile regexp
        var names = Object.keys(emojies)
            .map(function (name) { return ':' + name + ':'; })
            .concat(Object.keys(shortcuts))
            .sort()
            .reverse()
            .map(function (name) { return quoteRE(name); })
            .join('|');
        var scanRE = RegExp(names);
        var replaceRE = RegExp(names, 'g');

        return {
            defs: emojies,
            shortcuts: shortcuts,
            scanRE: scanRE,
            replaceRE: replaceRE
        };
    };

},{}],61:[function(require,module,exports){
    'use strict';

    module.exports = function emoji_html(tokens, idx /*, options, env */) {
        return tokens[idx].content;
    };

},{}],62:[function(require,module,exports){
// Emojies & shortcuts replacement logic.
//
// Note: In theory, it could be faster to parse :smile: in inline chain and
// leave only shortcuts here. But, who care...
//

    'use strict';


    module.exports = function create_rule(md, emojies, shortcuts, scanRE, replaceRE) {
        var arrayReplaceAt = md.utils.arrayReplaceAt,
            ucm = md.utils.lib.ucmicro,
            ZPCc = new RegExp([ ucm.Z.source, ucm.P.source, ucm.Cc.source ].join('|'));

        function splitTextToken(text, level, Token) {
            var token, last_pos = 0, nodes = [];

            text.replace(replaceRE, function(match, offset, src) {
                var emoji_name;
                // Validate emoji name
                if (shortcuts.hasOwnProperty(match)) {
                    // replace shortcut with full name
                    emoji_name = shortcuts[match];

                    // Don't allow letters before any shortcut (as in no ":/" in http://)
                    if (offset > 0 && !ZPCc.test(src[offset - 1])) {
                        return;
                    }

                    // Don't allow letters after any shortcut
                    if (offset + match.length < src.length && !ZPCc.test(src[offset + match.length])) {
                        return;
                    }
                } else {
                    emoji_name = match.slice(1, -1);
                }

                // Add new tokens to pending list
                if (offset > last_pos) {
                    token         = new Token('text', '', 0);
                    token.content = text.slice(last_pos, offset);
                    nodes.push(token);
                }

                token         = new Token('emoji', '', 0);
                token.markup  = emoji_name;
                token.content = emojies[emoji_name];
                nodes.push(token);

                last_pos = offset + match.length;
            });

            if (last_pos < text.length) {
                token         = new Token('text', '', 0);
                token.content = text.slice(last_pos);
                nodes.push(token);
            }

            return nodes;
        }

        return function emoji_replace(state) {
            var i, j, l, tokens, token,
                blockTokens = state.tokens,
                autolinkLevel = 0;

            for (j = 0, l = blockTokens.length; j < l; j++) {
                if (blockTokens[j].type !== 'inline') { continue; }
                tokens = blockTokens[j].children;

                // We scan from the end, to keep position when new tags added.
                // Use reversed logic in links start/end match
                for (i = tokens.length - 1; i >= 0; i--) {
                    token = tokens[i];

                    if (token.type === 'link_open' || token.type === 'link_close') {
                        if (token.info === 'auto') { autolinkLevel -= token.nesting; }
                    }

                    if (token.type === 'text' && scanRE.test(token.content) && autolinkLevel === 0) {
                        // replace current node
                        blockTokens[j].children = tokens = arrayReplaceAt(
                            tokens, i, splitTextToken(token.content, token.level, state.Token)
                        );
                    }
                }
            }
        };
    };

},{}],63:[function(require,module,exports){
// Process footnotes
//
    'use strict';

////////////////////////////////////////////////////////////////////////////////
// Renderer partials

    function render_footnote_anchor_name(tokens, idx, options, env/*, slf*/) {
        var n = Number(tokens[idx].meta.id + 1).toString();
        var prefix = '';

        if (typeof env.docId === 'string') {
            prefix = '-' + env.docId + '-';
        }

        return prefix + n;
    }

    function render_footnote_caption(tokens, idx/*, options, env, slf*/) {
        var n = Number(tokens[idx].meta.id + 1).toString();

        if (tokens[idx].meta.subId > 0) {
            n += ':' + tokens[idx].meta.subId;
        }

        return '[' + n + ']';
    }

    function render_footnote_ref(tokens, idx, options, env, slf) {
        var id      = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
        var caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
        var refid   = id;

        if (tokens[idx].meta.subId > 0) {
            refid += ':' + tokens[idx].meta.subId;
        }

        return '<sup class="footnote-ref"><a href="#fn' + id + '" id="fnref' + refid + '">' + caption + '</a></sup>';
    }

    function render_footnote_block_open(tokens, idx, options) {
        return (options.xhtmlOut ? '<hr class="footnotes-sep" />\n' : '<hr class="footnotes-sep">\n') +
            '<section class="footnotes">\n' +
            '<ol class="footnotes-list">\n';
    }

    function render_footnote_block_close() {
        return '</ol>\n</section>\n';
    }

    function render_footnote_open(tokens, idx, options, env, slf) {
        var id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);

        if (tokens[idx].meta.subId > 0) {
            id += ':' + tokens[idx].meta.subId;
        }

        return '<li id="fn' + id + '" class="footnote-item">';
    }

    function render_footnote_close() {
        return '</li>\n';
    }

    function render_footnote_anchor(tokens, idx, options, env, slf) {
        var id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);

        if (tokens[idx].meta.subId > 0) {
            id += ':' + tokens[idx].meta.subId;
        }

        /* ↩ with escape code to prevent display as Apple Emoji on iOS */
        return ' <a href="#fnref' + id + '" class="footnote-backref">\u21a9\uFE0E</a>';
    }


    module.exports = function footnote_plugin(md) {
        var parseLinkLabel = md.helpers.parseLinkLabel,
            isSpace = md.utils.isSpace;

        md.renderer.rules.footnote_ref          = render_footnote_ref;
        md.renderer.rules.footnote_block_open   = render_footnote_block_open;
        md.renderer.rules.footnote_block_close  = render_footnote_block_close;
        md.renderer.rules.footnote_open         = render_footnote_open;
        md.renderer.rules.footnote_close        = render_footnote_close;
        md.renderer.rules.footnote_anchor       = render_footnote_anchor;

        // helpers (only used in other rules, no tokens are attached to those)
        md.renderer.rules.footnote_caption      = render_footnote_caption;
        md.renderer.rules.footnote_anchor_name  = render_footnote_anchor_name;

        // Process footnote block definition
        function footnote_def(state, startLine, endLine, silent) {
            var oldBMark, oldTShift, oldSCount, oldParentType, pos, label, token,
                initial, offset, ch, posAfterColon,
                start = state.bMarks[startLine] + state.tShift[startLine],
                max = state.eMarks[startLine];

            // line should be at least 5 chars - "[^x]:"
            if (start + 4 > max) { return false; }

            if (state.src.charCodeAt(start) !== 0x5B/* [ */) { return false; }
            if (state.src.charCodeAt(start + 1) !== 0x5E/* ^ */) { return false; }

            for (pos = start + 2; pos < max; pos++) {
                if (state.src.charCodeAt(pos) === 0x20) { return false; }
                if (state.src.charCodeAt(pos) === 0x5D /* ] */) {
                    break;
                }
            }

            if (pos === start + 2) { return false; } // no empty footnote labels
            if (pos + 1 >= max || state.src.charCodeAt(++pos) !== 0x3A /* : */) { return false; }
            if (silent) { return true; }
            pos++;

            if (!state.env.footnotes) { state.env.footnotes = {}; }
            if (!state.env.footnotes.refs) { state.env.footnotes.refs = {}; }
            label = state.src.slice(start + 2, pos - 2);
            state.env.footnotes.refs[':' + label] = -1;

            token       = new state.Token('footnote_reference_open', '', 1);
            token.meta  = { label: label };
            token.level = state.level++;
            state.tokens.push(token);

            oldBMark = state.bMarks[startLine];
            oldTShift = state.tShift[startLine];
            oldSCount = state.sCount[startLine];
            oldParentType = state.parentType;

            posAfterColon = pos;
            initial = offset = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);

            while (pos < max) {
                ch = state.src.charCodeAt(pos);

                if (isSpace(ch)) {
                    if (ch === 0x09) {
                        offset += 4 - offset % 4;
                    } else {
                        offset++;
                    }
                } else {
                    break;
                }

                pos++;
            }

            state.tShift[startLine] = pos - posAfterColon;
            state.sCount[startLine] = offset - initial;

            state.bMarks[startLine] = posAfterColon;
            state.blkIndent += 4;
            state.parentType = 'footnote';

            if (state.sCount[startLine] < state.blkIndent) {
                state.sCount[startLine] += state.blkIndent;
            }

            state.md.block.tokenize(state, startLine, endLine, true);

            state.parentType = oldParentType;
            state.blkIndent -= 4;
            state.tShift[startLine] = oldTShift;
            state.sCount[startLine] = oldSCount;
            state.bMarks[startLine] = oldBMark;

            token       = new state.Token('footnote_reference_close', '', -1);
            token.level = --state.level;
            state.tokens.push(token);

            return true;
        }

        // Process inline footnotes (^[...])
        function footnote_inline(state, silent) {
            var labelStart,
                labelEnd,
                footnoteId,
                token,
                tokens,
                max = state.posMax,
                start = state.pos;

            if (start + 2 >= max) { return false; }
            if (state.src.charCodeAt(start) !== 0x5E/* ^ */) { return false; }
            if (state.src.charCodeAt(start + 1) !== 0x5B/* [ */) { return false; }

            labelStart = start + 2;
            labelEnd = parseLinkLabel(state, start + 1);

            // parser failed to find ']', so it's not a valid note
            if (labelEnd < 0) { return false; }

            // We found the end of the link, and know for a fact it's a valid link;
            // so all that's left to do is to call tokenizer.
            //
            if (!silent) {
                if (!state.env.footnotes) { state.env.footnotes = {}; }
                if (!state.env.footnotes.list) { state.env.footnotes.list = []; }
                footnoteId = state.env.footnotes.list.length;

                state.md.inline.parse(
                    state.src.slice(labelStart, labelEnd),
                    state.md,
                    state.env,
                    tokens = []
                );

                token      = state.push('footnote_ref', '', 0);
                token.meta = { id: footnoteId };

                state.env.footnotes.list[footnoteId] = { tokens: tokens };
            }

            state.pos = labelEnd + 1;
            state.posMax = max;
            return true;
        }

        // Process footnote references ([^...])
        function footnote_ref(state, silent) {
            var label,
                pos,
                footnoteId,
                footnoteSubId,
                token,
                max = state.posMax,
                start = state.pos;

            // should be at least 4 chars - "[^x]"
            if (start + 3 > max) { return false; }

            if (!state.env.footnotes || !state.env.footnotes.refs) { return false; }
            if (state.src.charCodeAt(start) !== 0x5B/* [ */) { return false; }
            if (state.src.charCodeAt(start + 1) !== 0x5E/* ^ */) { return false; }

            for (pos = start + 2; pos < max; pos++) {
                if (state.src.charCodeAt(pos) === 0x20) { return false; }
                if (state.src.charCodeAt(pos) === 0x0A) { return false; }
                if (state.src.charCodeAt(pos) === 0x5D /* ] */) {
                    break;
                }
            }

            if (pos === start + 2) { return false; } // no empty footnote labels
            if (pos >= max) { return false; }
            pos++;

            label = state.src.slice(start + 2, pos - 1);
            if (typeof state.env.footnotes.refs[':' + label] === 'undefined') { return false; }

            if (!silent) {
                if (!state.env.footnotes.list) { state.env.footnotes.list = []; }

                if (state.env.footnotes.refs[':' + label] < 0) {
                    footnoteId = state.env.footnotes.list.length;
                    state.env.footnotes.list[footnoteId] = { label: label, count: 0 };
                    state.env.footnotes.refs[':' + label] = footnoteId;
                } else {
                    footnoteId = state.env.footnotes.refs[':' + label];
                }

                footnoteSubId = state.env.footnotes.list[footnoteId].count;
                state.env.footnotes.list[footnoteId].count++;

                token      = state.push('footnote_ref', '', 0);
                token.meta = { id: footnoteId, subId: footnoteSubId, label: label };
            }

            state.pos = pos;
            state.posMax = max;
            return true;
        }

        // Glue footnote tokens to end of token stream
        function footnote_tail(state) {
            var i, l, j, t, lastParagraph, list, token, tokens, current, currentLabel,
                insideRef = false,
                refTokens = {};

            if (!state.env.footnotes) { return; }

            state.tokens = state.tokens.filter(function (tok) {
                if (tok.type === 'footnote_reference_open') {
                    insideRef = true;
                    current = [];
                    currentLabel = tok.meta.label;
                    return false;
                }
                if (tok.type === 'footnote_reference_close') {
                    insideRef = false;
                    // prepend ':' to avoid conflict with Object.prototype members
                    refTokens[':' + currentLabel] = current;
                    return false;
                }
                if (insideRef) { current.push(tok); }
                return !insideRef;
            });

            if (!state.env.footnotes.list) { return; }
            list = state.env.footnotes.list;

            token = new state.Token('footnote_block_open', '', 1);
            state.tokens.push(token);

            for (i = 0, l = list.length; i < l; i++) {
                token      = new state.Token('footnote_open', '', 1);
                token.meta = { id: i, label: list[i].label };
                state.tokens.push(token);

                if (list[i].tokens) {
                    tokens = [];

                    token          = new state.Token('paragraph_open', 'p', 1);
                    token.block    = true;
                    tokens.push(token);

                    token          = new state.Token('inline', '', 0);
                    token.children = list[i].tokens;
                    token.content  = '';
                    tokens.push(token);

                    token          = new state.Token('paragraph_close', 'p', -1);
                    token.block    = true;
                    tokens.push(token);

                } else if (list[i].label) {
                    tokens = refTokens[':' + list[i].label];
                }

                state.tokens = state.tokens.concat(tokens);
                if (state.tokens[state.tokens.length - 1].type === 'paragraph_close') {
                    lastParagraph = state.tokens.pop();
                } else {
                    lastParagraph = null;
                }

                t = list[i].count > 0 ? list[i].count : 1;
                for (j = 0; j < t; j++) {
                    token      = new state.Token('footnote_anchor', '', 0);
                    token.meta = { id: i, subId: j, label: list[i].label };
                    state.tokens.push(token);
                }

                if (lastParagraph) {
                    state.tokens.push(lastParagraph);
                }

                token = new state.Token('footnote_close', '', -1);
                state.tokens.push(token);
            }

            token = new state.Token('footnote_block_close', '', -1);
            state.tokens.push(token);
        }

        md.block.ruler.before('reference', 'footnote_def', footnote_def, { alt: [ 'paragraph', 'reference' ] });
        md.inline.ruler.after('image', 'footnote_inline', footnote_inline);
        md.inline.ruler.after('footnote_inline', 'footnote_ref', footnote_ref);
        md.core.ruler.after('inline', 'footnote_tail', footnote_tail);
    };

},{}],64:[function(require,module,exports){
    'use strict';


    module.exports = function ins_plugin(md) {
        // Insert each marker as a separate text token, and add it to delimiter list
        //
        function tokenize(state, silent) {
            var i, scanned, token, len, ch,
                start = state.pos,
                marker = state.src.charCodeAt(start);

            if (silent) { return false; }

            if (marker !== 0x2B/* + */) { return false; }

            scanned = state.scanDelims(state.pos, true);
            len = scanned.length;
            ch = String.fromCharCode(marker);

            if (len < 2) { return false; }

            if (len % 2) {
                token         = state.push('text', '', 0);
                token.content = ch;
                len--;
            }

            for (i = 0; i < len; i += 2) {
                token         = state.push('text', '', 0);
                token.content = ch + ch;

                state.delimiters.push({
                    marker: marker,
                    jump:   i,
                    token:  state.tokens.length - 1,
                    level:  state.level,
                    end:    -1,
                    open:   scanned.can_open,
                    close:  scanned.can_close
                });
            }

            state.pos += scanned.length;

            return true;
        }


        // Walk through delimiter list and replace text tokens with tags
        //
        function postProcess(state) {
            var i, j,
                startDelim,
                endDelim,
                token,
                loneMarkers = [],
                delimiters = state.delimiters,
                max = state.delimiters.length;

            for (i = 0; i < max; i++) {
                startDelim = delimiters[i];

                if (startDelim.marker !== 0x2B/* + */) {
                    continue;
                }

                if (startDelim.end === -1) {
                    continue;
                }

                endDelim = delimiters[startDelim.end];

                token         = state.tokens[startDelim.token];
                token.type    = 'ins_open';
                token.tag     = 'ins';
                token.nesting = 1;
                token.markup  = '++';
                token.content = '';

                token         = state.tokens[endDelim.token];
                token.type    = 'ins_close';
                token.tag     = 'ins';
                token.nesting = -1;
                token.markup  = '++';
                token.content = '';

                if (state.tokens[endDelim.token - 1].type === 'text' &&
                    state.tokens[endDelim.token - 1].content === '+') {

                    loneMarkers.push(endDelim.token - 1);
                }
            }

            // If a marker sequence has an odd number of characters, it's splitted
            // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
            // start of the sequence.
            //
            // So, we have to move all those markers after subsequent s_close tags.
            //
            while (loneMarkers.length) {
                i = loneMarkers.pop();
                j = i + 1;

                while (j < state.tokens.length && state.tokens[j].type === 'ins_close') {
                    j++;
                }

                j--;

                if (i !== j) {
                    token = state.tokens[j];
                    state.tokens[j] = state.tokens[i];
                    state.tokens[i] = token;
                }
            }
        }

        md.inline.ruler.before('emphasis', 'ins', tokenize);
        md.inline.ruler2.before('emphasis', 'ins', postProcess);
    };

},{}],65:[function(require,module,exports){
    'use strict';


    module.exports = function ins_plugin(md) {
        // Insert each marker as a separate text token, and add it to delimiter list
        //
        function tokenize(state, silent) {
            var i, scanned, token, len, ch,
                start = state.pos,
                marker = state.src.charCodeAt(start);

            if (silent) { return false; }

            if (marker !== 0x3D/* = */) { return false; }

            scanned = state.scanDelims(state.pos, true);

            len = scanned.length;
            ch = String.fromCharCode(marker);

            if (len < 2) { return false; }

            if (len % 2) {
                token         = state.push('text', '', 0);
                token.content = ch;
                len--;
            }

            for (i = 0; i < len; i += 2) {
                token         = state.push('text', '', 0);
                token.content = ch + ch;

                state.delimiters.push({
                    marker: marker,
                    jump:   i,
                    token:  state.tokens.length - 1,
                    level:  state.level,
                    end:    -1,
                    open:   scanned.can_open,
                    close:  scanned.can_close
                });
            }

            state.pos += scanned.length;

            return true;
        }


        // Walk through delimiter list and replace text tokens with tags
        //
        function postProcess(state) {
            var i, j,
                startDelim,
                endDelim,
                token,
                loneMarkers = [],
                delimiters = state.delimiters,
                max = state.delimiters.length;

            for (i = 0; i < max; i++) {
                startDelim = delimiters[i];

                if (startDelim.marker !== 0x3D/* = */) {
                    continue;
                }

                if (startDelim.end === -1) {
                    continue;
                }

                endDelim = delimiters[startDelim.end];

                token         = state.tokens[startDelim.token];
                token.type    = 'mark_open';
                token.tag     = 'mark';
                token.nesting = 1;
                token.markup  = '==';
                token.content = '';

                token         = state.tokens[endDelim.token];
                token.type    = 'mark_close';
                token.tag     = 'mark';
                token.nesting = -1;
                token.markup  = '==';
                token.content = '';

                if (state.tokens[endDelim.token - 1].type === 'text' &&
                    state.tokens[endDelim.token - 1].content === '=') {

                    loneMarkers.push(endDelim.token - 1);
                }
            }

            // If a marker sequence has an odd number of characters, it's splitted
            // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
            // start of the sequence.
            //
            // So, we have to move all those markers after subsequent s_close tags.
            //
            while (loneMarkers.length) {
                i = loneMarkers.pop();
                j = i + 1;

                while (j < state.tokens.length && state.tokens[j].type === 'mark_close') {
                    j++;
                }

                j--;

                if (i !== j) {
                    token = state.tokens[j];
                    state.tokens[j] = state.tokens[i];
                    state.tokens[i] = token;
                }
            }
        }

        md.inline.ruler.before('emphasis', 'mark', tokenize);
        md.inline.ruler2.before('emphasis', 'mark', postProcess);
    };

},{}],66:[function(require,module,exports){
// Process ~subscript~

    'use strict';

// same as UNESCAPE_MD_RE plus a space
    var UNESCAPE_RE = /\\([ \\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;


    function subscript(state, silent) {
        var found,
            content,
            token,
            max = state.posMax,
            start = state.pos;

        if (state.src.charCodeAt(start) !== 0x7E/* ~ */) { return false; }
        if (silent) { return false; } // don't run any pairs in validation mode
        if (start + 2 >= max) { return false; }

        state.pos = start + 1;

        while (state.pos < max) {
            if (state.src.charCodeAt(state.pos) === 0x7E/* ~ */) {
                found = true;
                break;
            }

            state.md.inline.skipToken(state);
        }

        if (!found || start + 1 === state.pos) {
            state.pos = start;
            return false;
        }

        content = state.src.slice(start + 1, state.pos);

        // don't allow unescaped spaces/newlines inside
        if (content.match(/(^|[^\\])(\\\\)*\s/)) {
            state.pos = start;
            return false;
        }

        // found!
        state.posMax = state.pos;
        state.pos = start + 1;

        // Earlier we checked !silent, but this implementation does not need it
        token         = state.push('sub_open', 'sub', 1);
        token.markup  = '~';

        token         = state.push('text', '', 0);
        token.content = content.replace(UNESCAPE_RE, '$1');

        token         = state.push('sub_close', 'sub', -1);
        token.markup  = '~';

        state.pos = state.posMax + 1;
        state.posMax = max;
        return true;
    }


    module.exports = function sub_plugin(md) {
        md.inline.ruler.after('emphasis', 'sub', subscript);
    };

},{}],67:[function(require,module,exports){
// Process ^superscript^

    'use strict';

// same as UNESCAPE_MD_RE plus a space
    var UNESCAPE_RE = /\\([ \\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;

    function superscript(state, silent) {
        var found,
            content,
            token,
            max = state.posMax,
            start = state.pos;

        if (state.src.charCodeAt(start) !== 0x5E/* ^ */) { return false; }
        if (silent) { return false; } // don't run any pairs in validation mode
        if (start + 2 >= max) { return false; }

        state.pos = start + 1;

        while (state.pos < max) {
            if (state.src.charCodeAt(state.pos) === 0x5E/* ^ */) {
                found = true;
                break;
            }

            state.md.inline.skipToken(state);
        }

        if (!found || start + 1 === state.pos) {
            state.pos = start;
            return false;
        }

        content = state.src.slice(start + 1, state.pos);

        // don't allow unescaped spaces/newlines inside
        if (content.match(/(^|[^\\])(\\\\)*\s/)) {
            state.pos = start;
            return false;
        }

        // found!
        state.posMax = state.pos;
        state.pos = start + 1;

        // Earlier we checked !silent, but this implementation does not need it
        token         = state.push('sup_open', 'sup', 1);
        token.markup  = '^';

        token         = state.push('text', '', 0);
        token.content = content.replace(UNESCAPE_RE, '$1');

        token         = state.push('sup_close', 'sup', -1);
        token.markup  = '^';

        state.pos = state.posMax + 1;
        state.posMax = max;
        return true;
    }


    module.exports = function sup_plugin(md) {
        md.inline.ruler.after('emphasis', 'sup', superscript);
    };

},{}],68:[function(require,module,exports){

    'use strict';


    /* eslint-disable no-bitwise */

    var decodeCache = {};

    function getDecodeCache(exclude) {
        var i, ch, cache = decodeCache[exclude];
        if (cache) { return cache; }

        cache = decodeCache[exclude] = [];

        for (i = 0; i < 128; i++) {
            ch = String.fromCharCode(i);
            cache.push(ch);
        }

        for (i = 0; i < exclude.length; i++) {
            ch = exclude.charCodeAt(i);
            cache[ch] = '%' + ('0' + ch.toString(16).toUpperCase()).slice(-2);
        }

        return cache;
    }


// Decode percent-encoded string.
//
    function decode(string, exclude) {
        var cache;

        if (typeof exclude !== 'string') {
            exclude = decode.defaultChars;
        }

        cache = getDecodeCache(exclude);

        return string.replace(/(%[a-f0-9]{2})+/gi, function(seq) {
            var i, l, b1, b2, b3, b4, chr,
                result = '';

            for (i = 0, l = seq.length; i < l; i += 3) {
                b1 = parseInt(seq.slice(i + 1, i + 3), 16);

                if (b1 < 0x80) {
                    result += cache[b1];
                    continue;
                }

                if ((b1 & 0xE0) === 0xC0 && (i + 3 < l)) {
                    // 110xxxxx 10xxxxxx
                    b2 = parseInt(seq.slice(i + 4, i + 6), 16);

                    if ((b2 & 0xC0) === 0x80) {
                        chr = ((b1 << 6) & 0x7C0) | (b2 & 0x3F);

                        if (chr < 0x80) {
                            result += '\ufffd\ufffd';
                        } else {
                            result += String.fromCharCode(chr);
                        }

                        i += 3;
                        continue;
                    }
                }

                if ((b1 & 0xF0) === 0xE0 && (i + 6 < l)) {
                    // 1110xxxx 10xxxxxx 10xxxxxx
                    b2 = parseInt(seq.slice(i + 4, i + 6), 16);
                    b3 = parseInt(seq.slice(i + 7, i + 9), 16);

                    if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
                        chr = ((b1 << 12) & 0xF000) | ((b2 << 6) & 0xFC0) | (b3 & 0x3F);

                        if (chr < 0x800 || (chr >= 0xD800 && chr <= 0xDFFF)) {
                            result += '\ufffd\ufffd\ufffd';
                        } else {
                            result += String.fromCharCode(chr);
                        }

                        i += 6;
                        continue;
                    }
                }

                if ((b1 & 0xF8) === 0xF0 && (i + 9 < l)) {
                    // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx
                    b2 = parseInt(seq.slice(i + 4, i + 6), 16);
                    b3 = parseInt(seq.slice(i + 7, i + 9), 16);
                    b4 = parseInt(seq.slice(i + 10, i + 12), 16);

                    if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80 && (b4 & 0xC0) === 0x80) {
                        chr = ((b1 << 18) & 0x1C0000) | ((b2 << 12) & 0x3F000) | ((b3 << 6) & 0xFC0) | (b4 & 0x3F);

                        if (chr < 0x10000 || chr > 0x10FFFF) {
                            result += '\ufffd\ufffd\ufffd\ufffd';
                        } else {
                            chr -= 0x10000;
                            result += String.fromCharCode(0xD800 + (chr >> 10), 0xDC00 + (chr & 0x3FF));
                        }

                        i += 9;
                        continue;
                    }
                }

                result += '\ufffd';
            }

            return result;
        });
    }


    decode.defaultChars   = ';/?:@&=+$,#';
    decode.componentChars = '';


    module.exports = decode;

},{}],69:[function(require,module,exports){

    'use strict';


    var encodeCache = {};


// Create a lookup array where anything but characters in `chars` string
// and alphanumeric chars is percent-encoded.
//
    function getEncodeCache(exclude) {
        var i, ch, cache = encodeCache[exclude];
        if (cache) { return cache; }

        cache = encodeCache[exclude] = [];

        for (i = 0; i < 128; i++) {
            ch = String.fromCharCode(i);

            if (/^[0-9a-z]$/i.test(ch)) {
                // always allow unencoded alphanumeric characters
                cache.push(ch);
            } else {
                cache.push('%' + ('0' + i.toString(16).toUpperCase()).slice(-2));
            }
        }

        for (i = 0; i < exclude.length; i++) {
            cache[exclude.charCodeAt(i)] = exclude[i];
        }

        return cache;
    }


// Encode unsafe characters with percent-encoding, skipping already
// encoded sequences.
//
//  - string       - string to encode
//  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
//  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
//
    function encode(string, exclude, keepEscaped) {
        var i, l, code, nextCode, cache,
            result = '';

        if (typeof exclude !== 'string') {
            // encode(string, keepEscaped)
            keepEscaped  = exclude;
            exclude = encode.defaultChars;
        }

        if (typeof keepEscaped === 'undefined') {
            keepEscaped = true;
        }

        cache = getEncodeCache(exclude);

        for (i = 0, l = string.length; i < l; i++) {
            code = string.charCodeAt(i);

            if (keepEscaped && code === 0x25 /* % */ && i + 2 < l) {
                if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
                    result += string.slice(i, i + 3);
                    i += 2;
                    continue;
                }
            }

            if (code < 128) {
                result += cache[code];
                continue;
            }

            if (code >= 0xD800 && code <= 0xDFFF) {
                if (code >= 0xD800 && code <= 0xDBFF && i + 1 < l) {
                    nextCode = string.charCodeAt(i + 1);
                    if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
                        result += encodeURIComponent(string[i] + string[i + 1]);
                        i++;
                        continue;
                    }
                }
                result += '%EF%BF%BD';
                continue;
            }

            result += encodeURIComponent(string[i]);
        }

        return result;
    }

    encode.defaultChars   = ";/?:@&=+$,-_.!~*'()#";
    encode.componentChars = "-_.!~*'()";


    module.exports = encode;

},{}],70:[function(require,module,exports){

    'use strict';


    module.exports = function format(url) {
        var result = '';

        result += url.protocol || '';
        result += url.slashes ? '//' : '';
        result += url.auth ? url.auth + '@' : '';

        if (url.hostname && url.hostname.indexOf(':') !== -1) {
            // ipv6 address
            result += '[' + url.hostname + ']';
        } else {
            result += url.hostname || '';
        }

        result += url.port ? ':' + url.port : '';
        result += url.pathname || '';
        result += url.search || '';
        result += url.hash || '';

        return result;
    };

},{}],71:[function(require,module,exports){
    'use strict';


    module.exports.encode = require('./encode');
    module.exports.decode = require('./decode');
    module.exports.format = require('./format');
    module.exports.parse  = require('./parse');

},{"./decode":68,"./encode":69,"./format":70,"./parse":72}],72:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

    'use strict';

//
// Changes from joyent/node:
//
// 1. No leading slash in paths,
//    e.g. in `url.parse('http://foo?bar')` pathname is ``, not `/`
//
// 2. Backslashes are not replaced with slashes,
//    so `http:\\example.org\` is treated like a relative path
//
// 3. Trailing colon is treated like a part of the path,
//    i.e. in `http://example.org:foo` pathname is `:foo`
//
// 4. Nothing is URL-encoded in the resulting object,
//    (in joyent/node some chars in auth and paths are encoded)
//
// 5. `url.parse()` does not have `parseQueryString` argument
//
// 6. Removed extraneous result properties: `host`, `path`, `query`, etc.,
//    which can be constructed using other parts of the url.
//


    function Url() {
        this.protocol = null;
        this.slashes = null;
        this.auth = null;
        this.port = null;
        this.hostname = null;
        this.hash = null;
        this.search = null;
        this.pathname = null;
    }

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
    var protocolPattern = /^([a-z0-9.+-]+:)/i,
        portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
        simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
        delims = [ '<', '>', '"', '`', ' ', '\r', '\n', '\t' ],

    // RFC 2396: characters not allowed for various reasons.
        unwise = [ '{', '}', '|', '\\', '^', '`' ].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
        autoEscape = [ '\'' ].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
        nonHostChars = [ '%', '/', '?', ';', '#' ].concat(autoEscape),
        hostEndingChars = [ '/', '?', '#' ],
        hostnameMaxLen = 255,
        hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
        hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    /* eslint-disable no-script-url */
    // protocols that never have a hostname.
        hostlessProtocol = {
            'javascript': true,
            'javascript:': true
        },
    // protocols that always contain a // bit.
        slashedProtocol = {
            'http': true,
            'https': true,
            'ftp': true,
            'gopher': true,
            'file': true,
            'http:': true,
            'https:': true,
            'ftp:': true,
            'gopher:': true,
            'file:': true
        };
    /* eslint-enable no-script-url */

    function urlParse(url, slashesDenoteHost) {
        if (url && url instanceof Url) { return url; }

        var u = new Url();
        u.parse(url, slashesDenoteHost);
        return u;
    }

    Url.prototype.parse = function(url, slashesDenoteHost) {
        var i, l, lowerProto, hec, slashes,
            rest = url;

        // trim before proceeding.
        // This is to support parse stuff like "  http://foo.com  \n"
        rest = rest.trim();

        if (!slashesDenoteHost && url.split('#').length === 1) {
            // Try fast path regexp
            var simplePath = simplePathPattern.exec(rest);
            if (simplePath) {
                this.pathname = simplePath[1];
                if (simplePath[2]) {
                    this.search = simplePath[2];
                }
                return this;
            }
        }

        var proto = protocolPattern.exec(rest);
        if (proto) {
            proto = proto[0];
            lowerProto = proto.toLowerCase();
            this.protocol = proto;
            rest = rest.substr(proto.length);
        }

        // figure out if it's got a host
        // user@server is *always* interpreted as a hostname, and url
        // resolution will treat //foo/bar as host=foo,path=bar because that's
        // how the browser resolves relative URLs.
        if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
            slashes = rest.substr(0, 2) === '//';
            if (slashes && !(proto && hostlessProtocol[proto])) {
                rest = rest.substr(2);
                this.slashes = true;
            }
        }

        if (!hostlessProtocol[proto] &&
            (slashes || (proto && !slashedProtocol[proto]))) {

            // there's a hostname.
            // the first instance of /, ?, ;, or # ends the host.
            //
            // If there is an @ in the hostname, then non-host chars *are* allowed
            // to the left of the last @ sign, unless some host-ending character
            // comes *before* the @-sign.
            // URLs are obnoxious.
            //
            // ex:
            // http://a@b@c/ => user:a@b host:c
            // http://a@b?@c => user:a host:c path:/?@c

            // v0.12 TODO(isaacs): This is not quite how Chrome does things.
            // Review our test case against browsers more comprehensively.

            // find the first instance of any hostEndingChars
            var hostEnd = -1;
            for (i = 0; i < hostEndingChars.length; i++) {
                hec = rest.indexOf(hostEndingChars[i]);
                if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
                    hostEnd = hec;
                }
            }

            // at this point, either we have an explicit point where the
            // auth portion cannot go past, or the last @ char is the decider.
            var auth, atSign;
            if (hostEnd === -1) {
                // atSign can be anywhere.
                atSign = rest.lastIndexOf('@');
            } else {
                // atSign must be in auth portion.
                // http://a@b/c@d => host:b auth:a path:/c@d
                atSign = rest.lastIndexOf('@', hostEnd);
            }

            // Now we have a portion which is definitely the auth.
            // Pull that off.
            if (atSign !== -1) {
                auth = rest.slice(0, atSign);
                rest = rest.slice(atSign + 1);
                this.auth = auth;
            }

            // the host is the remaining to the left of the first non-host char
            hostEnd = -1;
            for (i = 0; i < nonHostChars.length; i++) {
                hec = rest.indexOf(nonHostChars[i]);
                if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
                    hostEnd = hec;
                }
            }
            // if we still have not hit it, then the entire thing is a host.
            if (hostEnd === -1) {
                hostEnd = rest.length;
            }

            if (rest[hostEnd - 1] === ':') { hostEnd--; }
            var host = rest.slice(0, hostEnd);
            rest = rest.slice(hostEnd);

            // pull out port.
            this.parseHost(host);

            // we've indicated that there is a hostname,
            // so even if it's empty, it has to be present.
            this.hostname = this.hostname || '';

            // if hostname begins with [ and ends with ]
            // assume that it's an IPv6 address.
            var ipv6Hostname = this.hostname[0] === '[' &&
                this.hostname[this.hostname.length - 1] === ']';

            // validate a little.
            if (!ipv6Hostname) {
                var hostparts = this.hostname.split(/\./);
                for (i = 0, l = hostparts.length; i < l; i++) {
                    var part = hostparts[i];
                    if (!part) { continue; }
                    if (!part.match(hostnamePartPattern)) {
                        var newpart = '';
                        for (var j = 0, k = part.length; j < k; j++) {
                            if (part.charCodeAt(j) > 127) {
                                // we replace non-ASCII char with a temporary placeholder
                                // we need this to make sure size of hostname is not
                                // broken by replacing non-ASCII by nothing
                                newpart += 'x';
                            } else {
                                newpart += part[j];
                            }
                        }
                        // we test again with ASCII char only
                        if (!newpart.match(hostnamePartPattern)) {
                            var validParts = hostparts.slice(0, i);
                            var notHost = hostparts.slice(i + 1);
                            var bit = part.match(hostnamePartStart);
                            if (bit) {
                                validParts.push(bit[1]);
                                notHost.unshift(bit[2]);
                            }
                            if (notHost.length) {
                                rest = notHost.join('.') + rest;
                            }
                            this.hostname = validParts.join('.');
                            break;
                        }
                    }
                }
            }

            if (this.hostname.length > hostnameMaxLen) {
                this.hostname = '';
            }

            // strip [ and ] from the hostname
            // the host field still retains them, though
            if (ipv6Hostname) {
                this.hostname = this.hostname.substr(1, this.hostname.length - 2);
            }
        }

        // chop off from the tail first.
        var hash = rest.indexOf('#');
        if (hash !== -1) {
            // got a fragment string.
            this.hash = rest.substr(hash);
            rest = rest.slice(0, hash);
        }
        var qm = rest.indexOf('?');
        if (qm !== -1) {
            this.search = rest.substr(qm);
            rest = rest.slice(0, qm);
        }
        if (rest) { this.pathname = rest; }
        if (slashedProtocol[lowerProto] &&
            this.hostname && !this.pathname) {
            this.pathname = '';
        }

        return this;
    };

    Url.prototype.parseHost = function(host) {
        var port = portPattern.exec(host);
        if (port) {
            port = port[0];
            if (port !== ':') {
                this.port = port.substr(1);
            }
            host = host.substr(0, host.length - port.length);
        }
        if (host) { this.hostname = host; }
    };

    module.exports = urlParse;

},{}],73:[function(require,module,exports){
    // Process wikicrafts   [\order](your parameter such as 'title:"标题')
    'use strict';
    const SYNTAX_CHARS = "@[]()".split("");
    module.exports = function wikicraft_plugin(md,options) {

        function advanceToSymbol(state, endLine, symbol, pointer) {
            var maxPos = null;
            var symbolLine = pointer.line;
            var symbolIndex = state.src.indexOf(symbol, pointer.pos);

            if (symbolIndex === -1) return false;

            maxPos = state.eMarks[pointer.line];
            while (symbolIndex >= maxPos) {
                ++symbolLine;
                maxPos = state.eMarks[symbolLine];

                if (symbolLine >= endLine) return false;
            }

            pointer.prevPos = pointer.pos;
            pointer.pos = symbolIndex;
            pointer.line = symbolLine;
            return true;
        }
        function tokenizer(state, startLine, endLine, silent) {
            var order,paramete
            var startPos = state.bMarks[startLine] + state.tShift[startLine];
            var maxPos = state.eMarks[startLine];

            var pointer = { line: startLine, pos: startPos };

            // must be at start of input or the previous line must be blank.
            if (startLine !== 0) {
                var prevLineStartPos = state.bMarks[startLine - 1] + state.tShift[startLine - 1];
                var prevLineMaxPos = state.eMarks[startLine - 1];
                if (prevLineMaxPos > prevLineStartPos) return false;
            }

            // line should be at least 6 chars - "@[x]()"
            if (maxPos - startPos < 6) return false;


            if (state.src.charCodeAt(startPos) !== 0x40/* @ */) { return false; }
            if (state.src.charCodeAt(startPos + 1) !== 0x5B/* \ */) { return false; }

            for (pointer.pos = startPos + 2; pointer.pos < maxPos; pointer.pos++) {
                if (state.src.charCodeAt(pointer.pos) === 0x20) { return false; }
                if (state.src.charCodeAt(pointer.pos) === 0x5D /* ] */) {
                    break;
                }
            }

            if (pointer.pos === startPos + 2) { return false; } // no empty wikicraft labels
            if (pointer.pos + 1 >= maxPos || state.src.charCodeAt(++pointer.pos) !== 0x28 /* ( */) { return false; }
            pointer.pos++;

            if (!advanceToSymbol(state, endLine, ")", pointer)) return false;
            pointer.pos++;

            // Do not recognize as block element when there is trailing text.
            var trailingText = state.src
                .substr(pointer.pos, maxPos - pointer.pos)
                .trim();
            if (trailingText !== "") return false;

            console.log("trailingText:");
            console.log(trailingText);

            // Block image must be at end of input or the next line must be blank.
            if (endLine !== pointer.line + 1) {
                var nextLineStartPos = state.bMarks[pointer.line + 1] + state.tShift[pointer.line + 1];
                var nextLineMaxPos = state.eMarks[pointer.line + 1];
                if (nextLineMaxPos > nextLineStartPos) return false;
            }

            if (pointer.line >= endLine) return false;

            if (!silent) {
                var token;

                //if (this.options.outputContainer) {
                    token = state.push("block-wikicraft_open", 'wikicraft', 1);
                    token.map = [ pointer.line, pointer.line + 1 ];

                    //if (this.options.containerClassName) {
                    //    token.attrSet("class", "wikicraft-editor");
                    //}
                //}

                token = state.push("inline", "", 0);
                token.content = state.src.substr(startPos, pointer.pos - startPos);
                token.map = [ startLine, pointer.line + 1 ];
                token.children = [];

                //if (this.options.outputContainer) {
                //    state.push("block-wikicraft_close", 'wikicraft', -1);
                //}

                state.line = pointer.line + 1;
            }

            return true;
        }
        md.block.ruler.before('fence', 'block-wikicraft', tokenizer, { alt: [ "paragraph", "reference", "blockquote", "list" ] });
    };
},{}],74:[function(require,module,exports){
    // Process @[youtube](youtubeVideoID)
    // Process @[vimeo](vimeoVideoID)
    // Process @[vine](vineVideoID)
    // Process @[prezi](preziID)

    'use strict';

    var yt_regex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    function youtube_parser (url) {
        var match = url.match(yt_regex);
        return match && match[7].length === 11 ? match[7] : url;
    }

    /*eslint-disable max-len */
    var vimeo_regex = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
    /*eslint-enable max-len */
    function vimeo_parser (url) {
        var match = url.match(vimeo_regex);
        return match && typeof match[3] === 'string' ? match[3] : url;
    }

    var vine_regex = /^http(?:s?):\/\/(?:www\.)?vine\.co\/v\/([a-zA-Z0-9]{1,13}).*/;
    function vine_parser (url) {
        var match = url.match(vine_regex);
        return match && match[1].length === 11 ? match[1] : url;
    }

    var prezi_regex = /^https:\/\/prezi.com\/(.[^/]+)/;
    function prezi_parser(url) {
        var match = url.match(prezi_regex);
        return match ? match[1] : url;
    }

    var EMBED_REGEX = /@\[([a-zA-Z].+)\]\([\s]*(.*?)[\s]*[\)]/im;

    function video_embed(md, options) {
        function video_return(state, silent) {
            var serviceEnd,
                serviceStart,
                token,
                oldPos = state.pos;

            if (state.src.charCodeAt(oldPos) !== 0x40/* @ */ ||
                state.src.charCodeAt(oldPos + 1) !== 0x5B/* [ */) {
                return false;
            }

            var match = EMBED_REGEX.exec(state.src);

            if (!match || match.length < 3) {
                return false;
            }

            var service = match[1];
            var videoID = match[2];
            var serviceLower = service.toLowerCase();

            if (serviceLower === 'youtube') {
                videoID = youtube_parser(videoID);
            } else if (serviceLower === 'vimeo') {
                videoID = vimeo_parser(videoID);
            } else if (serviceLower === 'vine') {
                videoID = vine_parser(videoID);
            } else if (serviceLower === 'prezi') {
                videoID = prezi_parser(videoID);
            } else if (!options[serviceLower]) {
                return false;
            }

            // If the videoID field is empty, regex currently make it the close parenthesis.
            if (videoID === ')') {
                videoID = '';
            }

            serviceStart = oldPos + 2;
            serviceEnd = md.helpers.parseLinkLabel(state, oldPos + 1, false);

            //
            // We found the end of the link, and know for a fact it's a valid link;
            // so all that's left to do is to call tokenizer.
            //
            if (!silent) {
                state.pos = serviceStart;
                state.posMax = serviceEnd;
                state.service = state.src.slice(serviceStart, serviceEnd);
                var newState = new state.md.inline.State(service, state.md, state.env, []);
                newState.md.inline.tokenize(newState);

                token = state.push('video', '');
                token.videoID = videoID;
                token.service = service;
                token.level = state.level;
            }

            state.pos = state.pos + state.src.indexOf(')', state.pos);
            state.posMax = state.tokens.length;
            return true;
        }

        return video_return;
    }

    function video_url(service, videoID, options) {
        switch (service) {
            case 'youtube':
                return '//www.youtube.com/embed/' + videoID;
            case 'vimeo':
                return '//player.vimeo.com/video/' + videoID;
            case 'vine':
                return '//vine.co/v/' + videoID + '/embed/' + options.vine.embed;
            case 'prezi':
                return 'https://prezi.com/embed/' + videoID +
                    '/?bgcolor=ffffff&amp;lock_to_path=0&amp;autoplay=0&amp;autohide_ctrls=0&amp;' +
                    'landing_data=bHVZZmNaNDBIWnNjdEVENDRhZDFNZGNIUE43MHdLNWpsdFJLb2ZHanI5N1lQVHkxSHFxazZ0UUNCRHloSXZROHh3PT0&amp;' +
                    'landing_sign=1kD6c0N6aYpMUS0wxnQjxzSqZlEB8qNFdxtdjYhwSuI';
        }
    }

    function tokenize_video(md, options) {
        function tokenize_return(tokens, idx) {
            var videoID = md.utils.escapeHtml(tokens[idx].videoID);
            var service = md.utils.escapeHtml(tokens[idx].service).toLowerCase();
            return videoID === '' ? '' :
            '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" id="' +
            service + 'player" type="text/html" width="' + (options[service].width) +
            '" height="' + (options[service].height) +
            '" src="' + options.url(service, videoID, options) +
            '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>';
        }

        return tokenize_return;
    }

    var defaults = {
        url: video_url,
        youtube: { width: 640, height: 390 },
        vimeo: { width: 500, height: 281 },
        vine: { width: 600, height: 600, embed: 'simple' },
        prezi: { width: 550, height: 400 }
    };

    module.exports = function video_plugin(md, options) {
        if (options) {
            Object.keys(defaults).forEach(function(key) {
                if (typeof options[key] === 'undefined') {
                    options[key] = defaults[key];
                }
            });
        } else {
            options = defaults;
        }
        md.renderer.rules.video = tokenize_video(md, options);
        md.inline.ruler.before('emphasis', 'video', video_embed(md, options));
    };
},{}],75:[function(require,module,exports){
    'use strict';

    /*eslint-env browser*/
    /*global $, _*/

    var mdurl = require('mdurl');


    var hljs = require('highlight.js/lib/highlight.js');

    hljs.registerLanguage('actionscript', require('highlight.js/lib/languages/actionscript'));
    hljs.registerLanguage('apache',       require('highlight.js/lib/languages/apache'));
    hljs.registerLanguage('armasm',       require('highlight.js/lib/languages/armasm'));
    hljs.registerLanguage('xml',          require('highlight.js/lib/languages/xml'));
    hljs.registerLanguage('asciidoc',     require('highlight.js/lib//languages/asciidoc'));
    hljs.registerLanguage('avrasm',       require('highlight.js/lib/languages/avrasm'));
    hljs.registerLanguage('bash',         require('highlight.js/lib/languages/bash'));
    hljs.registerLanguage('clojure',      require('highlight.js/lib/languages/clojure'));
    hljs.registerLanguage('cmake',        require('highlight.js/lib/languages/cmake'));
    hljs.registerLanguage('coffeescript', require('highlight.js/lib/languages/coffeescript'));
    hljs.registerLanguage('cpp',          require('highlight.js/lib/languages/cpp'));
    hljs.registerLanguage('arduino',      require('highlight.js/lib/languages/arduino'));
    hljs.registerLanguage('css',          require('highlight.js/lib/languages/css'));
    hljs.registerLanguage('diff',         require('highlight.js/lib/languages/diff'));
    hljs.registerLanguage('django',       require('highlight.js/lib/languages/django'));
    hljs.registerLanguage('dockerfile',   require('highlight.js/lib/languages/dockerfile'));
    hljs.registerLanguage('ruby',         require('highlight.js/lib/languages/ruby'));
    hljs.registerLanguage('fortran',      require('highlight.js/lib/languages/fortran'));
    hljs.registerLanguage('glsl',         require('highlight.js/lib/languages/glsl'));
    hljs.registerLanguage('go',           require('highlight.js/lib/languages/go'));
    hljs.registerLanguage('groovy',       require('highlight.js/lib/languages/groovy'));
    hljs.registerLanguage('handlebars',   require('highlight.js/lib/languages/handlebars'));
    hljs.registerLanguage('haskell',      require('highlight.js/lib/languages/haskell'));
    hljs.registerLanguage('ini',          require('highlight.js/lib/languages/ini'));
    hljs.registerLanguage('java',         require('highlight.js/lib/languages/java'));
    hljs.registerLanguage('javascript',   require('highlight.js/lib/languages/javascript'));
    hljs.registerLanguage('json',         require('highlight.js/lib/languages/json'));
    hljs.registerLanguage('less',         require('highlight.js/lib/languages/less'));
    hljs.registerLanguage('lisp',         require('highlight.js/lib/languages/lisp'));
    hljs.registerLanguage('livescript',   require('highlight.js/lib/languages/livescript'));
    hljs.registerLanguage('lua',          require('highlight.js/lib/languages/lua'));
    hljs.registerLanguage('makefile',     require('highlight.js/lib/languages/makefile'));
    hljs.registerLanguage('matlab',       require('highlight.js/lib/languages/matlab'));
    hljs.registerLanguage('mipsasm',      require('highlight.js/lib/languages/mipsasm'));
    hljs.registerLanguage('perl',         require('highlight.js/lib/languages/perl'));
    hljs.registerLanguage('nginx',        require('highlight.js/lib/languages/nginx'));
    hljs.registerLanguage('objectivec',   require('highlight.js/lib/languages/objectivec'));
    hljs.registerLanguage('php',          require('highlight.js/lib/languages/php'));
    hljs.registerLanguage('python',       require('highlight.js/lib/languages/python'));
    hljs.registerLanguage('rust',         require('highlight.js/lib/languages/rust'));
    hljs.registerLanguage('scala',        require('highlight.js/lib/languages/scala'));
    hljs.registerLanguage('scheme',       require('highlight.js/lib/languages/scheme'));
    hljs.registerLanguage('scss',         require('highlight.js/lib/languages/scss'));
    hljs.registerLanguage('smalltalk',    require('highlight.js/lib/languages/smalltalk'));
    hljs.registerLanguage('stylus',       require('highlight.js/lib/languages/stylus'));
    hljs.registerLanguage('swift',        require('highlight.js/lib/languages/swift'));
    hljs.registerLanguage('tcl',          require('highlight.js/lib/languages/tcl'));
    hljs.registerLanguage('tex',          require('highlight.js/lib/languages/tex'));
    hljs.registerLanguage('typescript',   require('highlight.js/lib/languages/typescript'));
    hljs.registerLanguage('verilog',      require('highlight.js/lib/languages/verilog'));
    hljs.registerLanguage('vhdl',         require('highlight.js/lib/languages/vhdl'));
    hljs.registerLanguage('yaml',         require('highlight.js/lib/languages/yaml'));


    var mdHtml, mdSrc, permalink, scrollMap;

    var defaults = {
        html:         false,        // Enable HTML tags in source
        xhtmlOut:     false,        // Use '/' to close single tags (<br />)
        breaks:       false,        // Convert '\n' in paragraphs into <br>
        langPrefix:   'language-',  // CSS language prefix for fenced blocks
        linkify:      true,         // autoconvert URL-like texts to links
        typographer:  true,         // Enable smartypants and other sweet transforms

        // options below are for demo only
        _highlight: true,
        _strict: false,
        _view: 'html'               // html / src / debug
    };

    defaults.highlight = function (str, lang) {
        var esc = mdHtml.utils.escapeHtml;

        try {
            if (!defaults._highlight) {
                throw 'highlighting disabled';
            }

            if (lang && lang !== 'auto' && hljs.getLanguage(lang)) {

                return '<pre class="hljs language-' + esc(lang.toLowerCase()) + '"><code>' +
                    hljs.highlight(lang, str, true).value +
                    '</code></pre>';

            } else if (lang === 'auto') {

                var result = hljs.highlightAuto(str);

                /*eslint-disable no-console*/
                console.log('highlight language: ' + result.language + ', relevance: ' + result.relevance);

                return '<pre class="hljs language-' + esc(result.language) + '"><code>' +
                    result.value +
                    '</code></pre>';
            }
        } catch (__) { /**/ }

        return '<pre class="hljs"><code>' + esc(str) + '</code></pre>';
    };

    function setOptionClass(name, val) {
        if (val) {
            $('body').addClass('opt_' + name);
        } else {
            $('body').removeClass('opt_' + name);
        }
    }

    function setResultView(val) {
        $('body').removeClass('result-as-html');
        $('body').removeClass('result-as-src');
        $('body').removeClass('result-as-debug');
        $('body').addClass('result-as-' + val);
        defaults._view = val;

        $('.toolbar-page-view').removeClass('active');
        $('.toolbar-page-'+val).addClass('active');
    }

    function mdInit() {
        if (defaults._strict) {
            mdHtml = window.markdownit('commonmark');
            mdSrc = window.markdownit('commonmark');
        } else {
            mdHtml = window.markdownit(defaults)
                .use(require('markdown-it-abbr'))
                .use(require('markdown-it-container'), 'warning')
                .use(require('markdown-it-deflist'))
                .use(require('markdown-it-emoji'))
                .use(require('markdown-it-footnote'))
                .use(require('markdown-it-ins'))
                .use(require('markdown-it-mark'))
                .use(require('markdown-it-sub'))
                .use(require('markdown-it-sup'))
                .use(require('markdown-it-wikicraft'))
                .use(require('markdown-it-video'));
            mdSrc = window.markdownit(defaults)
                .use(require('markdown-it-abbr'))
                .use(require('markdown-it-container'), 'warning')
                .use(require('markdown-it-deflist'))
                .use(require('markdown-it-emoji'))
                .use(require('markdown-it-footnote'))
                .use(require('markdown-it-ins'))
                .use(require('markdown-it-mark'))
                .use(require('markdown-it-sub'))
                .use(require('markdown-it-sup'))
                .use(require('markdown-it-wikicraft'))
                .use(require('markdown-it-video'));
        }

        // Beautify output of parser for html content
        mdHtml.renderer.rules.table_open = function () {
            return '<table class="table table-striped">\n';
        };
        // Replace emoji codes with images
        mdHtml.renderer.rules.emoji = function (token, idx) {
            return window.twemoji.parse(token[idx].content);
        };

        //mdHtml.renderer.rules.emoji = function(token, idx) {
        //    return '<span class="emoji emoji_' + token[idx].markup + '"></span>';
        //}

        //
        // Inject line numbers for sync scroll. Notes:
        //
        // - We track only headings and paragraphs on first level. That's enough.
        // - Footnotes content causes jumps. Level limit filter it automatically.
        function injectLineNumbers(tokens, idx, options, env, slf) {
            var line;
            if (tokens[idx].map && tokens[idx].level === 0) {
                line = tokens[idx].map[0];
                tokens[idx].attrJoin('class', 'line');
                tokens[idx].attrSet('data-line', String(line));
            }
            return slf.renderToken(tokens, idx, options, env, slf);
        }

        mdHtml.renderer.rules.paragraph_open = mdHtml.renderer.rules.heading_open = injectLineNumbers;
    }

    function setHighlightedlContent(selector, content, lang) {
        if (window.hljs) {
            $(selector).html(window.hljs.highlight(lang, content).value);
        } else {
            $(selector).text(content);
        }
    }

    function updateResult() {
        var source = editor.getValue();

        // Update only active view to avoid slowdowns
        // (debug & src view with highlighting are a bit slow)
        if (defaults._view === 'src') {
            setHighlightedlContent('.result-src-content', mdSrc.render(source), 'html');

        } else if (defaults._view === 'debug') {
            setHighlightedlContent(
                '.result-debug-content',
                JSON.stringify(mdSrc.parse(source, { references: {} }), null, 2),
                'json'
            );

        } else { /*defaults._view === 'html'*/
            $('.result-html').html(mdHtml.render(source));
        }

        // reset lines mapping cache on content update
        scrollMap = null;

        try {
            if (source) {
                // serialize state - source and options
                permalink.href = '#md3=' + mdurl.encode(JSON.stringify({
                        source: source,
                        defaults: _.omit(defaults, 'highlight')
                    }), '-_.!~', false);
            } else {
                permalink.href = '';
            }
        } catch (__) {
            //permalink.href = '';
        }
    }

// Build offsets for each line (lines can be wrapped)
// That's a bit dirty to process each line everytime, but ok for demo.
// Optimizations are required only for big texts.
    function buildScrollMap() {
        var i, offset, nonEmptyList, pos, a, b, lineHeightMap, linesCount,
            acc, sourceLikeDiv, textarea = $('.source'),
            _scrollMap;

        sourceLikeDiv = $('<div />').css({
            position: 'absolute',
            visibility: 'hidden',
            height: 'auto',
            width: textarea[0].clientWidth,
            'font-size': textarea.css('font-size'),
            'font-family': textarea.css('font-family'),
            'line-height': textarea.css('line-height'),
            'white-space': textarea.css('white-space')
        }).appendTo('body');

        offset = $('.result-html').scrollTop() - $('.result-html').offset().top;
        _scrollMap = [];
        nonEmptyList = [];
        lineHeightMap = [];

        acc = 0;
        textarea.val().split('\n').forEach(function (str) {
            var h, lh;

            lineHeightMap.push(acc);

            if (str.length === 0) {
                acc++;
                return;
            }

            sourceLikeDiv.text(str);
            h = parseFloat(sourceLikeDiv.css('height'));
            lh = parseFloat(sourceLikeDiv.css('line-height'));
            acc += Math.round(h / lh);
        });
        sourceLikeDiv.remove();
        lineHeightMap.push(acc);
        linesCount = acc;

        for (i = 0; i < linesCount; i++) { _scrollMap.push(-1); }

        nonEmptyList.push(0);
        _scrollMap[0] = 0;

        $('.line').each(function (n, el) {
            var $el = $(el), t = $el.data('line');
            if (t === '') { return; }
            t = lineHeightMap[t];
            if (t !== 0) { nonEmptyList.push(t); }
            _scrollMap[t] = Math.round($el.offset().top + offset);
        });

        nonEmptyList.push(linesCount);
        _scrollMap[linesCount] = $('.result-html')[0].scrollHeight;

        pos = 0;
        for (i = 1; i < linesCount; i++) {
            if (_scrollMap[i] !== -1) {
                pos++;
                continue;
            }

            a = nonEmptyList[pos];
            b = nonEmptyList[pos + 1];
            _scrollMap[i] = Math.round((_scrollMap[b] * (i - a) + _scrollMap[a] * (b - i)) / (b - a));
        }

        return _scrollMap;
    }

// Synchronize scroll position from source to result
    var syncResultScroll = function () {
        var textarea   = $('.source'),
            lineHeight = parseFloat(textarea.css('line-height')),
            lineNo, posTo;

        lineNo = Math.floor(textarea.scrollTop() / lineHeight);
        if (!scrollMap) { scrollMap = buildScrollMap(); }
        posTo = scrollMap[lineNo];
        $('.result-html').stop(true).animate({
            scrollTop: posTo
        }, 100, 'linear');
    };

// Synchronize scroll position from result to source
    var syncSrcScroll = function () {
        var resultHtml = $('.result-html'),
            scrollTop  = resultHtml.scrollTop(),
            textarea   = $('.source'),
            lineHeight = parseFloat(textarea.css('line-height')),
            lines,
            i,
            line;

        if (!scrollMap) { scrollMap = buildScrollMap(); }

        lines = Object.keys(scrollMap);

        if (lines.length < 1) {
            return;
        }

        line = lines[0];

        for (i = 1; i < lines.length; i++) {
            if (scrollMap[lines[i]] < scrollTop) {
                line = lines[i];
                continue;
            }

            break;
        }

        textarea.stop(true).animate({
            scrollTop: lineHeight * line
        }, 100, 'linear');
    };


    function loadPermalink() {

        if (!location.hash) { return; }

        var cfg, opts;

        try {

            if (/^#md3=/.test(location.hash)) {
                cfg = JSON.parse(mdurl.decode(location.hash.slice(5), mdurl.decode.componentChars));

            } else if (/^#md64=/.test(location.hash)) {
                cfg = JSON.parse(window.atob(location.hash.slice(6)));

            } else if (/^#md=/.test(location.hash)) {
                cfg = JSON.parse(decodeURIComponent(location.hash.slice(4)));

            } else {
                return;
            }

            if (_.isString(cfg.source)) {
                $('.source').val(cfg.source);
            }
        } catch (__) {
            return;
        }

        opts = _.isObject(cfg.defaults) ? cfg.defaults : {};

        // copy config to defaults, but only if key exists
        // and value has the same type
        _.forOwn(opts, function (val, key) {
            if (!_.has(defaults, key)) { return; }

            // Legacy, for old links
            if (key === '_src') {
                defaults._view = val ? 'src' : 'html';
                return;
            }

            if ((_.isBoolean(defaults[key]) && _.isBoolean(val)) ||
                (_.isString(defaults[key]) && _.isString(val))) {
                defaults[key] = val;
            }
        });

        // sanitize for sure
        if ([ 'html', 'src', 'debug' ].indexOf(defaults._view) === -1) {
            defaults._view = 'html';
        }
    }


//////////////////////////////////////////////////////////////////////////////
// Init on page load
//
    $(function () {
        // highlight snippet
        if (window.hljs) {
            $('pre.code-sample code').each(function (i, block) {
                window.hljs.highlightBlock(block);
            });
        }

        loadPermalink();

        // Activate tooltips
        $('._tip').tooltip({ container: 'body' });

        // Set default option values and option listeners
        //_.forOwn(defaults, function (val, key) {
        //    if (key === 'highlight') { return; }
        //
        //    var el = document.getElementById(key);
        //
        //    if (!el) { return; }
        //
        //    var $el = $(el);
        //
        //    if (_.isBoolean(val)) {
        //        $el.prop('checked', val);
        //        $el.on('change', function () {
        //            var value = Boolean($el.prop('checked'));
        //            setOptionClass(key, value);
        //            defaults[key] = value;
        //            mdInit();
        //            updateResult();
        //        });
        //        setOptionClass(key, val);
        //
        //    } else {
        //        $(el).val(val);
        //        $el.on('change update keyup', function () {
        //            defaults[key] = String($(el).val());
        //            mdInit();
        //            updateResult();
        //        });
        //    }
        //});

        setResultView(defaults._view);

        mdInit();
        permalink = document.getElementById('permalink');

        // Setup listeners
        editor.on('change',updateResult);

        //$('.source').on('keyup paste cut mouseup', updateResult );
        //
        //$('.source').on('touchstart mouseover', function () {
        //    $('.result-html').off('scroll');
        //    $('.source').on('scroll', syncResultScroll);
        //});
        //
        //$('.result-html').on('touchstart mouseover', function () {
        //    $('.source').off('scroll');
        //    $('.result-html').on('scroll', syncSrcScroll);
        //});

        $('.source-clear').on('click', function (event) {
            editor.setValue('');
            updateResult();
            event.preventDefault();
        });

        $(document).on('click', '[data-result-as]', function (event) {
            var view = $(this).data('resultAs');
            if (view) {
                setResultView(view);
                // only to update permalink
                updateResult();
                event.preventDefault();
            }
        });

        // Need to recalculate line positions on window resize
        $(window).on('resize', function () {
            scrollMap = null;
        });

        updateResult();
    });

},{"highlight.js/lib//languages/asciidoc":6,"highlight.js/lib/highlight.js":1,"highlight.js/lib/languages/actionscript":2,"highlight.js/lib/languages/apache":3,"highlight.js/lib/languages/arduino":4,"highlight.js/lib/languages/armasm":5,"highlight.js/lib/languages/avrasm":7,"highlight.js/lib/languages/bash":8,"highlight.js/lib/languages/clojure":9,"highlight.js/lib/languages/cmake":10,"highlight.js/lib/languages/coffeescript":11,"highlight.js/lib/languages/cpp":12,"highlight.js/lib/languages/css":13,"highlight.js/lib/languages/diff":14,"highlight.js/lib/languages/django":15,"highlight.js/lib/languages/dockerfile":16,"highlight.js/lib/languages/fortran":17,"highlight.js/lib/languages/glsl":18,"highlight.js/lib/languages/go":19,"highlight.js/lib/languages/groovy":20,"highlight.js/lib/languages/handlebars":21,"highlight.js/lib/languages/haskell":22,"highlight.js/lib/languages/ini":23,"highlight.js/lib/languages/java":24,"highlight.js/lib/languages/javascript":25,"highlight.js/lib/languages/json":26,"highlight.js/lib/languages/less":27,"highlight.js/lib/languages/lisp":28,"highlight.js/lib/languages/livescript":29,"highlight.js/lib/languages/lua":30,"highlight.js/lib/languages/makefile":31,"highlight.js/lib/languages/matlab":32,"highlight.js/lib/languages/mipsasm":33,"highlight.js/lib/languages/nginx":34,"highlight.js/lib/languages/objectivec":35,"highlight.js/lib/languages/perl":36,"highlight.js/lib/languages/php":37,"highlight.js/lib/languages/python":38,"highlight.js/lib/languages/ruby":39,"highlight.js/lib/languages/rust":40,"highlight.js/lib/languages/scala":41,"highlight.js/lib/languages/scheme":42,"highlight.js/lib/languages/scss":43,"highlight.js/lib/languages/smalltalk":44,"highlight.js/lib/languages/stylus":45,"highlight.js/lib/languages/swift":46,"highlight.js/lib/languages/tcl":47,"highlight.js/lib/languages/tex":48,"highlight.js/lib/languages/typescript":49,"highlight.js/lib/languages/verilog":50,"highlight.js/lib/languages/vhdl":51,"highlight.js/lib/languages/xml":52,"highlight.js/lib/languages/yaml":53,"markdown-it-abbr":54,"markdown-it-container":55,"markdown-it-deflist":56,"markdown-it-emoji":57,"markdown-it-footnote":63,"markdown-it-ins":64,"markdown-it-mark":65,"markdown-it-sub":66,"markdown-it-sup":67,"mdurl":71,"markdown-it-wikicraft":73,"markdown-it-video":74}]},{},[75]);