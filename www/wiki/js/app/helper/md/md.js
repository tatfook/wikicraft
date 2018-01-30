
define([
], function(){
	var escape_ch = "@";
	var special_str = '`*_{}[]()#+-.!>\\';

	// markdown 特殊字符转义
	function md_special_char_escape(text) {
		var new_text = "";
		for (var i = 0; i < text.length; i++) {
			var ch = text[i];
			var nextch = text[i+1];
			if (ch == escape_ch) {
				new_text += escape_ch + escape_ch;
				continue;
			} 
			if (ch == '\\' && nextch && special_str.indexOf(nextch) >= 0) {
				new_text += nextch;
				i++;	
				continue;
			}
			if (special_str.indexOf(ch) >= 0) {
				new_text += escape_ch + ch;	
				continue;
			}
			new_text += ch;
		}

		return new_text;
	}

	function md_special_char_unescape(text) {
		var new_text = "";
		for (var i = 0; i < text.length; i++) {
			var ch = text[i];
			var nextch = text[i+1];
			if (ch == escape_ch && nextch == escape_ch) {
				new_text += escape_ch;
				i++;
				continue;
			} 
			if (ch == escape_ch && nextch && special_str.indexOf(nextch) >= 0) {
				new_text += nextch;
				i++;	
				continue;
			}
			new_text += ch;
		}
		return new_text;
	}

	// 是否是空行
	function is_empty_list(line) {
		if (line.trim() == "") {
			return true;
		}
		return false;
	}

	// 是否是水平线
	function is_hr(line) {
		//if (line.match(/^-{3,}[-\s]*$/) || line.match(/^\*{3,}[\*\s]*$/)) {
			//return true;
		//}

		var line_trim = line.trim();
		if (line_trim == "@*@*@*" && line.indexOf("@*@*@*") == 0) {
			return true;
		}
		if (line_trim == "@-@-@-" && line.indexOf("@-@-@-") == 0) {
			return true;
		}

		return false;
	}

	// 是否是列表 
	function is_list(line) {
		//if (line.indexOf("* ") == 0 ||
				//line.indexOf("- ") == 0 ||
				//line.indexOf("+ ") == 0 || 
				//line.match(/^\d+\./)) {
			//return true;
		//}

		if (line.indexOf("@* ") == 0 ||
				line.indexOf("@- ") == 0 ||
				line.indexOf("@+ ") == 0 || 
				line.match(/^\d+\. /)) {
			return true;
		}
		return false;
	}

	// 是否是引用
	function is_blockquote(line) {
		//if (line.indexOf(">") == 0) {
			//return true;
		//}
		if (line.indexOf("@>") == 0) {
			return true;
		}
		return false;
	}

	// 是否是标题
	function is_header(line) {
		//if (line.match(/^#{1,6} /)) {
			//return true;
		//}
		if (line.match(/^(@#){1,6} /)) {
			return true;
		}
		return false;
	}

	function link(obj) {
		var text = obj.text;
		var reg_str = /@\[(.*?)@\]@\((.*?)@\)/;
		var regs = text.match(reg_str);
			
		if (!regs) {
			return text;
		}
		
		var match_str = regs[0];
		var link_text = regs[1];
		var link_href = regs[2];
		var link_str = '<a href="'+ link_href +'">' + link_text + '</a>';
		var link_render = obj.md.rule_render["a"];
		if (link_render) {
			link_str = link_render({md:obj.md, text:match_str, link_text:link_text, link_href:link_href}) || link_str;
		}
		
		text = text.replace(reg_str, link_str)

		obj.text = text;
		return link(obj);
	}

	function image(obj) {
		var text = obj.text;
		var reg_str = /@!@\[(.*?)@\]@\((.*?)@\)/;
		var regs = text.match(reg_str);
			
		if (!regs) {
			return text;
		}	

		var match_str = regs[0];
		var image_text = regs[1];
		var image_href = regs[2];
		var image_str = '<img src="'+ image_href +'" alt="'+ image_text + '"/>';
		
		var image_render = obj.md.rule_render["img"];
		if (image_render) {
			image_str = image_render({md:obj.md, text:match_str, image_href:image_href, image_text:image_text}) || image_str;
		}
		text = text.replace(reg_str, image_str)

		obj.text = text;
		return image(obj);
	}

	function image_link(obj) {
		obj.text = image(obj);
		return link(obj);
	}

	function em(obj) {
		var text = obj.text;
		var reg_str = /@\*(.+?)@\*/;
		var regs = text.match(reg_str);
		var htmlstr = "", em_render;	
		if (regs){
			htmlstr = '<em>' + regs[1] + '</em>';
			em_render = obj.md.rule_render["em"];
			if (em_render) {
				htmlstr = em_render({md:obj.md, content:regs[1], text:regs[0]}) || htmlstr; 
			}
			text = text.replace(reg_str, htmlstr);
			obj.text = text;
			return em(obj);
		}

		reg_str = /@_(.*?)@_/;
		regs = text.match(reg_str);
		if (regs){
			htmlstr = '<em>' + regs[1] + '</em>';
			em_render = obj.md.rule_render["em"];
			if (em_render) {
				htmlstr = em_render({md:obj.md, content:regs[1], text:regs[0]}) || htmlstr; 
			}
			text = text.replace(reg_str, htmlstr);
			obj.text = text;
			return em(obj);
		}

		return text;
	}

	function strong(obj) {
		var text = obj.text;
		var reg_str = /@\*@\*(.+?)@\*@\*/;
		var regs = text.match(reg_str);
		var htmlstr = "", strong_render;	
		if (regs){
			htmlstr = '<strong>' + regs[1] + '</strong>';
			strong_render = obj.md.rule_render["strong"];
			if (strong_render) {
				htmlstr = strong_render({md:obj.md, content:regs[1], text:regs[0]}) || htmlstr;
			}
			text = text.replace(reg_str, htmlstr);
			obj.text = text;
			return strong(obj);
		}

		reg_str = /@_@_(.*?)@_@_/;
		regs = text.match(reg_str);
		if (regs){
			htmlstr = '<strong>' + regs[1] + '</strong>';
			strong_render = obj.md.rule_render["strong"];
			if (strong_render) {
				htmlstr = strong_render({md:obj.md, content: regs[1], text:regs[0]}) || htmlstr;
			}
			text = text.replace(reg_str, htmlstr);
			obj.text = text;
			return strong(obj);
		}

		return text;
	}

	function strong_em(obj) {
		obj.text = strong(obj);
		return em(obj);
	}

	function inline_code(obj) {
		var text = obj.text;
		var reg_str = /@`(.*?)@`/;
		var regs = text.match(reg_str);
		var htmlstr = "";	
		if (regs){
			var htmlstr = '<code>' + regs[1] + '</code>';
			var code_render = obj.md.rule_render["code"];
			if (code_render) {
				htmlstr = code_render({md:obj.md, content:regs[1], text:regs[0]}) || htmlstr;
			}
			text = text.replace(reg_str, htmlstr);
			obj.text = text;
			return inline_code(obj);
		}

		return text;
	}

	// 代码块
	function block_code(obj) {
		var cur_line = obj.lines[obj.start];
		var flag_str = '@`@`@`';
		if (cur_line.indexOf(flag_str) != 0) {
			return ;
		}
		var text = cur_line, i = 0;
		var codeContent = "";
		for (i = obj.start + 1; i < obj.lines.length; i++) {
			var line = obj.lines[i];
			text += "\n" + line;
			if (line.indexOf(flag_str) == 0) {
				i++;
				break;
			}
			codeContent += "\n" + line;
		}

		var pre_render = obj.md.rule_render["pre"];
		var htmlContent = '<pre>' + codeContent + '</pre>';
		if (pre_render) {
			htmlContent = pre_render({md:obj.md, content: codeContent, text:text}) || htmlContent;
		}

		return {
			tag:'pre',
			text:text,
			content:codeContent,
			start: obj.start,
			end: i,
			htmlContent: htmlContent,
		}
	}

	function block_code_tab(obj){
		var last_line = obj.start > 0 ? obj.lines[obj.start-1] : "";
		var cur_line = obj.lines[obj.start];
		var is_blockcode_flag = function(line) {
			if (line.indexOf("\t") == 0 || line.indexOf("    ") == 0) {
				return true;
			}
			return false;
		};

		if (!is_empty_list(last_line) || !is_blockcode_flag(cur_line)) {
			return ;
		}

		var content = cur_line[0] == " " ? cur_line.substring(4) : cur_line.substring(1), i = 0, text = cur_line;
		for (i = obj.start + 1; i < obj.lines.length; i++) {
			var line = obj.lines[i];
			if (!is_blockcode_flag(line)) {
				break;
			}
			content += "\n" + (line[0] == " " ? line.substring(4) : line.substring(1));
			text += "\n" + line;
		}

		var pre_render = obj.md.rule_render["pre"];
		var htmlContent = '<pre>' + content + '</pre>';
		if (pre_render) {
			htmlContent = pre_render({md:obj.md, content:content, text:text}) || htmlContent;
		}

		return {
			tag: 'pre',
			content: content,
			text: text,
			start: obj.start,
			end: i,
			htmlContent: htmlContent,
		}
	}

	// 头部判断
	function header(obj) {
		var cur_line = obj.lines[obj.start];
		var header_list = [
			"@# ",
			"@#@# ",
			"@#@#@# ",
			"@#@#@#@# ",
			"@#@#@#@#@# ",
			"@#@#@#@#@#@# ",
		];

		for (var i = 0 ; i < header_list.length; i++) {
			if (cur_line.indexOf(header_list[i]) == 0) {
				break;
			}
		}

		if (i == header_list.length) {
			return ;
		}
		var content = cur_line.substring(header_list[i].length);
		var text = cur_line;
		var tag = "h" + (i+1);
		var hn_render = obj.md.rule_render["hn"];
		var htmlContent = '<' + tag + '>' + obj.md.line_parse(content) + '</' + tag + '>';
		if (hn_render) {
			htmlContent = hn_render({md:obj.md, content:content, text:text}) || htmlContent;
		}
		var token = {
			tag:tag,
			content: content,
			text: text,
			start: obj.start,
			end: obj.start + 1,
			htmlContent: htmlContent,
		}

		return token;
	}

	// 换行
	function br(obj) {
		var cur_line = obj.lines[obj.start];
		var i = 0, htmlContent = "", text = cur_line , content="";	
		if (!is_empty_list(cur_line) || obj.lines.length == (obj.start + 1) || !is_empty_list(obj.lines[obj.start+1])) {
			return;
		}

		for (i = obj.start + 1; i < obj.lines.length; i++) {
			if (!is_empty_list(obj.lines[i])) {
				break;
			}
			htmlContent += "<br/>";
			text += "\n" + obj.lines[i];
			content += "\n" + obj.lines[i];
		}

		return {
			tag: "div",
			text: text,
			content: content,
			htmlContent: htmlContent,
			start: obj.start+1,
			end: i,
		}
	}

	// 段落
	function paragraph(obj, env) {
		var is_paragraph_line = function(line) {
			if (is_hr(line)
					|| is_list(line) 
					|| is_blockquote(line) 
					|| is_header(line) 
					|| line.indexOf("@`@`@`") == 0
					|| is_empty_list(line)) {
				return false;
			}

			return true;
		}

		var cur_line = obj.lines[obj.start];
		if (!is_paragraph_line(cur_line)) {
			return;
		}

		var content = cur_line, i = 0;
		for (i = obj.start+1; i < obj.lines.length; i++) {
			var line = obj.lines[i];
			if (!is_paragraph_line(line)) {
				break;
			}
			content += "<br/>" + line;
		}

		var token = {
			tag: "p",
			content: content,
			text: content,
			start: obj.start,
			end:i,
		}
		
		if (env && env.is_sub_tag) {
			token.htmlContent = obj.md.line_parse(token.content);
		} else {
			token.htmlContent = '<' + token.tag + '>' + obj.md.line_parse(token.content) + '</' + token.tag + '>';
		}

		var paragraph_render = obj.md.rule_render["paragraph"];
		if (paragraph_render) {
			token.htmlContent = paragraph_render({md:obj.md, content: content, text:content, is_sub_tag:env.is_sub_tag})  || token.htmlContent;
		}
		return token;
	}

	// 引用
	function blockquote(obj) {
		var cur_line = obj.lines[obj.start];
		if (cur_line.indexOf("@>") != 0) {
			return ;
		}
		
		var content = cur_line.substring(2), i = 0, text = cur_line;
		for (i = obj.start + 1; i < obj.lines.length; i++) {
			var line = obj.lines[i];
			if (is_empty_list(line)) {
				break;
			}
			text += "\n" + line;
			line = line.trim();
			content += "\n" + ((line.indexOf("@>") == 0) ? line.substring(2) : line);
		}

		var blockquote_render = obj.md.rule_render["blockquote"];
		var htmlContent = undefined;
		if (blockquote_render) {
			htmlContent = blockquote_render({md:obj.md, content:content, text:text});
		}
		return {
			tag: "blockquote",
			text: text,
			content: content,
			start: obj.start,
			end: i,
			subtokens: obj.md.block_parse(content, {start: obj.start, is_sub_tag:true}),
			htmlContent: htmlContent,
		}
	}

	// 列表
	function list(obj) {
		var cur_line = obj.lines[obj.start];
		var is_list = function(line) {
			if (line.indexOf("@* ") == 0 || line.indexOf("@- ") == 0 || line.indexOf("@+ ") == 0) {
				return {is_list: true, is_sort: false};
			}
			if (line.match(/^\d+\. /)) {
				return {is_list:true, is_sort: true};
			}

			return {is_list:false, is_sort: false};
		}

		var cur_ret = is_list(cur_line);
		if (!cur_ret.is_list) {
			return;
		}

		var content = "", text = cur_line, i = 0;
		var subtokens = [];
		var token = {
			tag: "li",
			start: obj.start,
			content: cur_line.substring(3).trim(),
		}
		for (i = obj.start + 1; i <= obj.lines.length; i++) {
			var line = obj.lines[i] || "";
			var ret = is_list(line);
			if (is_empty_list(line)) {
				token.end = i;
				token.subtokens = obj.md.block_parse(token.content, {start:i, is_sub_tag:true});
				subtokens.push(token);
				content += (content == "" ? "" : "\n") + token.content;
				break;
			}
			if (ret.is_list) {
				token.end = i;
				token.subtokens = obj.md.block_parse(token.content, {start:i, is_sub_tag:true});
				subtokens.push(token);
				content += (content == "" ? "" : "\n") + token.content;
				if (cur_ret.is_sort != ret.is_sort) {
					break;
				} else {
					token = {
						tag: "li",
						start: i,
						content: line.substring(3).trim(),
					}
				}
			} else {
				token.content += "\n" + line.trim();
			}
			text += "\n" + line;
		}

		var tag = (cur_line[1] == "*" || cur_line[1] == "+" || cur_line[1] == "-") ? "ul" : "ol";
		var list_render = obj.md.rule_render[tag];
		var htmlContent = undefined;
		if (list_render) {
			htmlContent = list_render({md:obj.md, text:text, content:content});
		}
		return {
			tag:tag,
			content: content,
			text: text,
			start: obj.start,
			end: i,
			subtokens: subtokens,
			htmlContent:htmlContent,
		} 
	}	


	// 分割线
	function horizontal_line(obj) {
		var cur_line = obj.lines[obj.start];
		if (!is_hr(cur_line)) {
			return ;
		}

		var hr_render = obj.md.rule_render["hr"];
		var htmlContent = "<hr>";
		if (hr_render) {
			htmlContent = hr_render({md:obj.md, text:cur_line}) || htmlContent;
		}
		
		return {
			tag: "div",
			content: cur_line,
			text: cur_line,
			htmlContent: htmlContent,
			start: obj.start,
			end: obj.start+1,
		}
	}

	// 表
	function table(obj) {
		var cur_line = obj.lines[obj.start];
		var next_line = obj.lines[obj.start+1] ||"";
		var format_line = function(line) {
			line = line[0] == "|" ? line.substring(1) : line;
			line = line.trim();
			line = line[line.length-1] == "|" ? line.substring(0, line.length-1) : line;

			return line;
		}

		cur_line = format_line(cur_line);
		next_line = format_line(next_line);

		var cur_line_fields = cur_line.split("|");
		var next_line_fields = next_line.split("|");
		var i = 0, line_fields, field, htmlField, line, style_list = [];
		if (cur_line_fields.length != next_line_fields.length || cur_line_fields.length == 1) {
			return;
		}
		for (var i = 0; i < next_line_fields.length; i++) {
			field = next_line_fields[i].trim();
			if (!field.match(/^:?(@-)+:?$/)) {
				return;
			}
			if (field[0] == ":" && field[field.length-1] != ":") {
				style_list.push('style="text-align:left"');
			} else if (field[0] != ":" && field[field.length-1] == ":") {
				style_list.push('style="text-align:right"');
			} else if (field[0] == ":" && field[field.length-1] == ":") {
				style_list.push('style="text-align:center"');
			} else {
				style_list.push('style="text-align:left"');
			}
		}

		var text = obj.lines[obj.start] + '\n' + obj.lines[obj.start+1];
		var content = cur_line + '\n' + next_line;
		var htmlContent = "<table><thead><tr>";
		for (var i = 0; i < cur_line_fields.length; i++) {
			field = cur_line_fields[i].trim();
			htmlField = obj.md.line_parse(field);
			htmlContent += "<th>" + htmlField + "</th>";
		}
		htmlContent += "</tr></thead><tbody>";

		for (i = obj.start + 2; i < obj.lines.length; i++) {
			line = obj.lines[i];
			line = format_line(line);
			line_fields = line.split("|");
			if (line_fields.length != cur_line_fields.length) {
				break;
			}

			htmlContent += "<tr>";
			for (var j = 0; j < line_fields.length; j++) {
				field = line_fields[j].trim();
				htmlField = obj.md.line_parse(field);
				htmlContent += "<td "+ style_list[j] +">" + htmlField + "</td>";
			}
			htmlContent += "</tr>";
			content += "\n" + line;
			text += "\n" + obj.lines[i];
		}

		htmlContent += "</tbody></table>";

		var table_render = obj.md.rule_render["table"];
		if (table_render) {
			htmlContent = table_render({md:obj.md, content:content, text:text}) || htmlContent;
		}

		return {
			tag:"table",
			content: content,
			text: text,
			htmlContent: htmlContent,
			start: obj.start,
			end: i,
		}
	}

	// 渲染token
	function render_token(token) {
		var htmlContent = "";

		if (token.htmlContent) {
			return token.htmlContent;
		}

		htmlContent += "<" + token.tag + ">";

		var subtokens = token.subtokens || [];
		for (var i = 0; i < subtokens.length; i++) {
			htmlContent += render_token(subtokens[i]);
		}
		htmlContent += "</" + token.tag + ">";

		return htmlContent;
	}

	function markdown(options) {
		var md = {
			block_rule_list:[],
			inline_rule_list:[],
			rule_render:{},
			options: options,
		};

		md.md_special_char_escape = md_special_char_escape;
		md.md_special_char_unescape = md_special_char_unescape;

		md.register_inline_rule = function(rule) {
			this.inline_rule_list.push(rule);
		}

		md.register_block_rule = function(rule) {
			this.block_rule_list.push(rule);
		}

		md.register_rule_render = function(tag, render) {
			this.rule_render[tag] = render
		}

		md.register_inline_rule(image_link);
		md.register_inline_rule(strong_em);
		md.register_inline_rule(inline_code);
		
		md.register_block_rule(horizontal_line);
		md.register_block_rule(br);
		md.register_block_rule(header);
		md.register_block_rule(block_code);
		md.register_block_rule(block_code_tab);
		md.register_block_rule(blockquote);
		md.register_block_rule(list);
		md.register_block_rule(table);

		// 段落需放最后
		md.register_block_rule(paragraph);

		md.line_parse = function(text) {
			for (var i = 0; i < md.inline_rule_list.length; i++) {
				var rule = md.inline_rule_list[i];
				text = rule({text:text, md: md});
			}
			return text;
		}

		md.block_parse = function(text, env) {
			var self = this;
			var params = {}, tokens = [], lines = text.split("\n"), start = 0;
			//console.log(lines);	
			while(start < lines.length && start >= 0) {
				params.start = start;
				params.lines = lines;
				params.md = self;

				for (var i = 0; i < md.block_rule_list.length; i++){
					var block_rule = md.block_rule_list[i];
					var token = block_rule(params, env);
					if (token) {
						tokens.push(token);
						start = token.end - 1;
						break;
					}
				}
				start++;
			}	

			return tokens;
		}

		md.parse = function(text) {
			text = md_special_char_escape(text || "");
			var tokens = this.block_parse(text);
			for (var i = 0; i < tokens.length; i++) {
				var token = tokens[i];
				token.htmlContent = render_token(token)
				token.content = md.md_special_char_unescape(token.content);
				token.text = md.md_special_char_unescape(token.text);
				token.start++;
				token.end++;
				token.htmlContent = md.md_special_char_unescape(token.htmlContent);
			}
			return tokens;
		}

		md.render = function(text) {
			var tokens = this.parse(text);

			// console.log(tokens);

			var htmlContent = "";
			for (var i = 0; i < tokens.length; i++) {
				htmlContent += tokens[i].htmlContent;	
			}

			return htmlContent;
		}

		return md;
	}
	
	return markdown;
});

