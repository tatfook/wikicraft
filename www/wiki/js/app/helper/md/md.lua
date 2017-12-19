--require("md/basetype")

local function console(obj, out)
	out = out or print

	local outlist = {}
	function _print(obj, level, flag)
		-- 避免循环输出
		local obj_str = tostring(obj)
		for _, str in ipairs(outlist) do
			if str == obj_str then
				return
			end
		end
		outlist[#outlist+1] = obj_str

		level = level or 0
		local indent_str = ""
		for i = 1, level do
		  indent_str = indent_str.."    "
		end
	  
		if not flag then
			out(indent_str.."{")
		end
	  
		for k,v in pairs(obj) do
			if type(v) == "table" then 
				out(string.format("%s    %s = {", indent_str, tostring(k)))
				_print(v, level + 1, true)
			elseif type(v) == "string" then
				out(string.format('%s    %s = "%s"', indent_str, tostring(k), tostring(v)))
			else
				out(string.format("%s    %s = %s", indent_str, tostring(k), tostring(v)))
			end
		end
		out(indent_str.."}")
	end
	
	if type(obj) == "table" then
		_print(obj)
	elseif type(obj) == "string" then
		out('"' .. obj .. '"')
	else
		out(tostring(obj))
	end
end

local function strings_split(str, sep) 
	local list = {}
	local str = str .. sep

	for word in string.gmatch(str, '([^' .. sep .. ']*)' .. sep) do
		list[#list+1] = word
	end

	return list
end

local function strings_substring(str, s, e) 
	return string.sub(str, s, e)
end

local function strings_indexOf(str, substr) 
	for i = 1, #str do
		if strings_substring(str, i, i + #substr - 1) == substr  then
			return i
		end
	end
	return nil
end

local function strings_trim(str)
	return string.match(str, '^%s*(.-)%s*$')
end

local function strings_at(str, i)
	return string.char(string.byte(str,i))
end

local escape_ch = "@"
local special_str = '`*_{}[]()#+-.!>\\'

-- markdown 特殊字符转义
local function md_special_char_escape(text) 
	local new_text = ""
	local i = 1
	while i <= #text do
		local ch = strings_at(text, i)
		local nextch = strings_at(text, i+1)
		i = i + 1
		if ch == escape_ch then
			new_text = new_text .. escape_ch .. escape_ch
		else 
			if ch == '\\' and nextch and strings_indexOf(special_str, nextch) then
				new_text = new_text .. nextch
				i = i + 1	
			else
				if strings_indexOf(special_str, ch) then
					new_text = new_text .. escape_ch .. ch	
				else
					new_text = new_text .. ch
				end
			end
		end
	end

	return new_text
end

local function md_special_char_unescape(text) 
	local new_text = ""
	local i = 1
	while i <= #text do
		local ch = strings_at(text, i)
		local nextch = strings_at(text, i+1)
		i = i + 1
		if ch == escape_ch and nextch == escape_ch then
			new_text = new_text .. escape_ch
			i = i + 1
		else
			if ch == escape_ch and nextch and strings_indexOf(special_str, nextch) then
				new_text = new_text .. nextch
				i = i + 1
			else
				new_text = new_text .. ch
			end
		end 
	end
	return new_text
end


 --是否是空行
local function is_empty_list(line) 
	if strings_trim(line or "") == "" then
		return true
	end
	return false
end

--是否是水平线
local function is_hr(line) 
	local line_trim = strings_trim(line)
	if line_trim == "@*@*@*" and strings_indexOf(line_trim, "@*@*@*") == 1 then
		return true
	end
	if line_trim == "@-@-@-" and strings_indexOf(line_trim, "@-@-@-") == 1 then
		return true
	end

	return false
end


-- 是否是列表 
local function is_list(line) 
	if strings_indexOf(line, "@* ") == 1 or
			strings_indexOf(line, "@- ") == 1 or
			strings_indexOf(line, "@+ ") == 1 or 
			(string.match(line, '^%d+. ')) then
		return true
	end
	return false
end

-- 是否是引用
local function is_blockquote(line)
	if (strings_indexOf(line, "@>") == 1) then
		return true
	end
	return false
end

-- 是否是标题
local function is_header(line) 
	local header_list = {
		"@# ",
		"@#@# ",
		"@#@#@# ",
		"@#@#@#@# ",
		"@#@#@#@#@# ",
		"@#@#@#@#@#@# ",
	}
	for _, str in ipairs(header_list) do
		if strings_indexOf(line, str) == 1 then
			return true
		end
	end
	return false
end

local function link(obj)
	local text = obj.text
	local reg_str = '(@%[(.-)@%]@%((.-)@%))'
	local match_str, link_text, link_href = string.match(text, reg_str)
		
	if not match_str then
		return text
	end	
	
	local link_str = '<a href="'.. link_href ..'">' .. link_text .. '</a>'
	local link_render = obj.md.rule_render["a"]
	if link_render then
		link_str = link_render({md=obj.md, text=match_str, link_text=link_text, link_href=link_href}) or link_str
	end
	
	text = string.gsub(text, reg_str, link_str)

	obj.text = text
	return link(obj)
end

local function image(obj)
	local text = obj.text
	local reg_str = '(@!@%[(.-)@%]@%((.-)@%))'
	local match_str, image_text, image_href = string.match(text, reg_str)
		
	if not match_str then
		return text
	end	

	local image_str = '<img src="'.. image_href ..'" alt="'.. image_text .. '"/>'
	
	local image_render = obj.md.rule_render["img"]
	if image_render then
		image_str = image_render({md=obj.md, text=match_str, image_href=image_href, image_text=image_text}) or image_str
	end
	text = string.gsub(text, reg_str, image_str)

	obj.text = text
	return image(obj)
end

local function image_link(obj)
	obj.text = image(obj)
	return link(obj)
end

local function em(obj) 
	local text = obj.text
	local reg_str = '(@%*(.-)@%*)'
	local htmlstr, em_render = "", nil	
	local _text, content = string.match(text, reg_str)
	if _text then
		htmlstr = '<em>' .. content .. '</em>'
		em_render = obj.md.rule_render["em"]
		if em_render then
			htmlstr = em_render({md=obj.md, content=content, text=_text}) or htmlstr 
		end
		text = string.gsub(text, reg_str, htmlstr)
		obj.text = text
		return em(obj)
	end

	reg_str = '(@_(.-)@_)'
	_text, content = string.match(text, reg_str)
	if _text then
		htmlstr = '<em>' .. content .. '</em>'
		em_render = obj.md.rule_render["em"]
		if em_render then
			htmlstr = em_render({md=obj.md, content=content, text=_text}) or htmlstr 
		end
		text = string.gsub(text, reg_str, htmlstr)
		obj.text = text
		return em(obj)
	end

	return text
end

local function strong(obj) 
	local text = obj.text
	local reg_str = '(@%*@%*(.-)@%*@%*)'
	local htmlstr, strong_renderr = "", nil	
	local _text, content = string.match(text, reg_str)
	if _text then
		htmlstr = '<strong>' .. content .. '</strong>'
		strong_render = obj.md.rule_render["strong"]
		if strong_render then
			htmlstr = strong_render({md=obj.md, content=content, text=_text}) or htmlstr
		end
		text = string.gsub(text, reg_str, htmlstr)
		obj.text = text
		return strong(obj)
	end

	reg_str = '(@_@_(.-)@_@_)'
	_text, content = string.match(text, reg_str)
	if _text then
		htmlstr = '<strong>' .. content .. '</strong>'
		strong_render = obj.md.rule_render["strong"]
		if strong_render then
			htmlstr = strong_render({md=obj.md, content=content, text=_text}) or htmlstr
		end
		text = string.gsub(text, reg_str, htmlstr)
		obj.text = text
		return strong(obj)
	end

	return text
end

local function strong_em(obj)
	obj.text = strong(obj)
	return em(obj)
end

local function inline_code(obj)
	local text = obj.text
	local reg_str = '(@`(.-)@`)'
	local _text, content = string.match(text, reg_str)
	local htmlstr = ""	
	if _text then
		local htmlstr = '<code>' .. content .. '</code>'
		local code_render = obj.md.rule_render["code"]
		if code_render then
			htmlstr = code_render({md=obj.md, content=content, text=_text}) or htmlstr
		end
		text = (string.gsub(text, reg_str, htmlstr))
		obj.text = text
		return strong(obj)
	end

	return text
end

 --头部判断
local function header(obj) 
	local cur_line = obj.lines[obj.start]
	local header_list = {
		"@# ",
		"@#@# ",
		"@#@#@# ",
		"@#@#@#@# ",
		"@#@#@#@#@# ",
		"@#@#@#@#@#@# ",
	}

	local hn = 0
	for idx, line in ipairs(header_list) do
		if strings_indexOf(cur_line, line) == 1 then
			hn = idx
			break
		end
	end

	if hn == 0 then
		return
	end

	local content = strings_substring(cur_line, #(header_list[hn]) + 1)
	local text = cur_line
	local tag = "h" .. tostring(hn)
	local hn_render = obj.md.rule_render["hn"]
	local htmlContent = '<' .. tag .. '>' .. obj.md:line_parse(content) .. '</' .. tag .. '>'
	if hn_render then
		htmlContent = hn_render({md=obj.md, content=content, text=text}) or htmlContent
	end

	local token = {
		tag = tag,
		content = content,
		text = text,
		start = obj.start,
		_end = obj.start + 1,
		htmlContent = htmlContent,
	}

	return token
end

 --换行
local function br(obj) 
	local cur_line = obj.lines[obj.start]
	local _end, htmlContent, text, content=#obj.lines+1, "", cur_line, ""	
	if not is_empty_list(cur_line) or #obj.lines <= obj.start or not is_empty_list(obj.lines[obj.start+1]) then
		return
	end

	for i = obj.start + 1, #obj.lines do
		local line = obj.lines[i]
		if not is_empty_list(line) then
			_end = i
			break
		end
		htmlContent = htmlContent ..  "<br/>"
		text = text .. "\n" .. line
		content = content .. "\n" .. line
	end

	return {
		tag= "div",
		text= text,
		content= content,
		htmlContent= htmlContent,
		start= obj.start+1,
		_end= _end,
	}
end

 --分割线
local function horizontal_line(obj) 
	local cur_line = obj.lines[obj.start]
	if not is_hr(cur_line) then
		return
	end

	local hr_render = obj.md.rule_render["hr"]
	local  htmlContent = "<hr>"
	if hr_render then
		htmlContent = hr_render({md=obj.md, text=cur_line}) or htmlContent
	end
	
	return {
		tag= "div",
		content= cur_line,
		text= cur_line,
		htmlContent= htmlContent,
		start= obj.start,
		_end= obj.start+1,
	}
end

-- 代码块
local function block_code(obj) 
	local cur_line = obj.lines[obj.start]
	local flag_str = '@`@`@`'
	if strings_indexOf(cur_line, flag_str) ~= 1 then
		return 
	end
	local text = cur_line
	local _end = #obj.lines + 1
	local codeContent = ""
	for i = obj.start + 1, #obj.lines do
		local line = obj.lines[i]
		text = text .. "\n" .. line
		if strings_indexOf(line, flag_str) == 1 then
			_end = i + 1
			break
		end
		codeContent = codeContent .. "\n" .. line
	end

	local pre_render = obj.md.rule_render["pre"]
	local htmlContent = '<pre>' .. codeContent .. '</pre>'
	if pre_render then
		htmlContent = pre_render({md=obj.md, content= codeContent, text=text}) or htmlContent
	end

	return {
		tag='pre',
		text=text,
		content=codeContent,
		start= obj.start,
		_end= _end,
		htmlContent=htmlContent
	}
end

local function block_code_tab(obj)
	local last_line = obj.lines[obj.start-1] or ""
	local cur_line = obj.lines[obj.start]
	local is_blockcode_flag = function(line)
		if strings_indexOf(line, "\t") == 1 or strings_indexOf(line, "    ") == 1 then
			return true
		end
		return false
	end

	if not is_empty_list(last_line) or not is_blockcode_flag(cur_line) then
		return 
	end

	local text = cur_line
	if strings_at(cur_line, 1) == " " then
		cur_line = strings_substring(cur_line, 5)
	else 
		cur_line = strings_substring(cur_line, 2)
	end
	local content = cur_line
	local _end = #obj.lines + 1
	for i = obj.start + 1, #obj.lines do
		local line = obj.lines[i]
		if not is_blockcode_flag(line) then
			_end = i
			break
		end

		text = text .. "\n" .. line
		if strings_at(line, 1) == " " then
			line = strings_substring(line, 5) 
		else 
			line = strings_substring(line, 2)
		end
		content = content ..  "\n" .. line
	end

	local pre_render = obj.md.rule_render["pre"]
	local htmlContent = '<pre>' .. content .. '</pre>'
	if pre_render then
		htmlContent = pre_render({md=obj.md, content=content, text=text}) or htmlContent
	end

	return {
		tag= 'pre',
		content= content,
		text= text,
		start= obj.start,
		_end= _end,
		htmlContent= htmlContent,
	}
end

-- 段落
local function paragraph(obj, env)
	local is_paragraph_line = function(line)
		if (is_hr(line)
				or is_list(line) 
				or is_blockquote(line) 
				or is_header(line) 
				or strings_indexOf(line, "@`@`@`") == 1
				or is_empty_list(line)) then
			return false
		end

		return true
	end

	local cur_line = obj.lines[obj.start]
	if not is_paragraph_line(cur_line) then
		return
	end

	local content, _end = cur_line, #obj.lines + 1
	for i = obj.start + 1, #obj.lines do
		local line = obj.lines[i]
		if not is_paragraph_line(line) then
			_end = i
			break
		end
		content = content .. "<br/>" .. line
	end

	local token = {
		tag= "p",
		content= content,
		text= content,
		start= obj.start,
		_end=_end,
	}
	
	if env and env.is_sub_tag then
		token.htmlContent = obj.md:line_parse(token.content)
	else
		token.htmlContent = '<' .. token.tag .. '>' .. obj.md:line_parse(token.content) .. '</' .. token.tag .. '>'
	end

	local paragraph_render = obj.md.rule_render["paragraph"]
	if (paragraph_render) then
		token.htmlContent = paragraph_render({md=obj.md, content = content, text=content, is_sub_tag=env.is_sub_tag})  or token.htmlContent
	end
	return token
end
-- 引用
local function blockquote(obj)
	local cur_line = obj.lines[obj.start]
	if not is_blockquote(cur_line) then
		return 
	end
	
	local content, _end, text = strings_substring(cur_line, 3), #obj.lines + 1, cur_line
	for i = obj.start + 1, #obj.lines do
		local line = obj.lines[i]
		if (is_empty_list(line)) then
			_end = i
			break
		end
		text = text .. "\n" .. line
		line = strings_trim(line)
		if (is_blockquote(line)) then
			line = strings_substring(3)
		end
		content = content .. "\n" .. line
	end

	local blockquote_render = obj.md.rule_render["blockquote"]
	local htmlContent = nil
	if (blockquote_render) then
		htmlContent = blockquote_render({md=obj.md, content=content, text=text})
	end

	return {
		tag= "blockquote",
		text= text,
		content= content,
		start= obj.start,
		_end= _end,
		subtokens= obj.md:block_parse(content, {start= obj.start, is_sub_tag=true}),
		htmlContent= htmlContent,
	}
end

-- 列表
local function list(obj)
	local cur_line = obj.lines[obj.start]
	local is_list = function(line)
		if strings_indexOf(line, "@* ") == 1 or strings_indexOf(line, "@- ") == 1 or strings_indexOf(line, "@.. ") == 1 then
			return {is_list= true, is_sort= false}
		end
		if (string.match(line, '^%d+%. ')) then
			return {is_list=true, is_sort= true}
		end

		return {is_list=false, is_sort= false}
	end

	local cur_ret = is_list(cur_line)
	if not cur_ret.is_list then
		return
	end

	local content, text, _end = "", cur_line, #obj.lines + 1
	local subtokens = {}
	local token = {
		tag= "li",
		start= obj.start,
		content= strings_trim(strings_substring(cur_line, 4)),
	}
	for i = obj.start + 1, #obj.lines + 1 do
		local line = obj.lines[i] or ""
		local ret = is_list(line)
		_end = i
		if (is_empty_list(line)) then
			token._end = i
			token.subtokens = obj.md:block_parse(token.content, {start=i, is_sub_tag=true})
			subtokens[#subtokens+1] = token
			if (content == "") then
				content = content .. token.content
			else 
				content = content .. "\n" .. token.content
			end
			break
		end
		if (ret.is_list) then
			token._end = i
			token.subtokens = obj.md:block_parse(token.content, {start=i, is_sub_tag=true})
			subtokens[#subtokens+1] = token
			if (content == "") then
				content = content .. token.content
			else 
				content = content .. "\n" .. token.content
			end
			if (cur_ret.is_sort ~= ret.is_sort) then
				break
			else
				token = {
					tag= "li",
					start= i,
					content= strings_trim(strings_substring(line, 4)),
				}
			end
		else
			token.content = token.content .. "\n" .. strings_trim(line)
		end
		text = text .. "\n" .. line
	end

	local tag = "ol"
	local list_render = obj.md.rule_render[tag]
	local htmlContent = undefined
	if list_render then
		htmlContent = list_render({md=obj.md, text=text, content=content})
	end
	return {
		tag=tag,
		content= content,
		text= text,
		start= obj.start,
		_end= _end,
		subtokens= subtokens,
		htmlContent=htmlContent,
	} 
end	
-- 表
local function md_table(obj)
	local cur_line = obj.lines[obj.start]
	local next_line = obj.lines[obj.start + 1] or ""
	local format_line = function(line)
		if (strings_at(line, 1) == "1") then
			line = strings_substring(2)
		end
		line = strings_trim(line)
		if strings_at(#line) == "|" then
			line = strings_substring(1, #line -1)
		end
		return line
	end

	cur_line = format_line(cur_line)
	next_line = format_line(next_line)

	local cur_line_fields = strings_split(cur_line, "|")
	local next_line_fields = strings_split(next_line, "|")
	local line_fields, field, htmlField, line = nil 
	local style_list = {}
	if #cur_line_fields ~= #next_line_fields or #cur_line_fields == 1 then
		return
	end
	for _, field in ipairs(next_line_fields) do
		field = strings_trim(field)
		if not (md_special_char_unescape(field).match('^:?%-+:?$/')) then
			return
		end
		if (strings_at(1) == ":" and strings_at(field, #field) ~= ":") then
			style_list[#style_list+1] = 'style="text-align=left"'
		elseif (strings_at(1) ~= ":" and strings_at(field, #field) == ":") then
			style_list[#style_list+1] = 'style="text-align=right"'
		elseif (strings_at(1) == ":" and strings_at(field, #field) == ":") then
			style_list[#style_list+1] = 'style="text-align=center"'
		else 
			style_list[#style_list+1] = 'style="text-align=left"'
		end
	end

	local text = obj.lines[obj.start] .. '\n' .. obj.lines[obj.start + 1]
	local content = cur_line .. '\n' .. next_line
	local htmlContent = "<table><thead><tr>"
	for _, field in ipairs(cur_line_fields) do
		field = strings_trim(field)
		htmlField = obj.md.line_parse(field)
		htmlContent = htmlContent .. "<th>" .. htmlField .. "</th>"
	end
	htmlContent = htmlContent .. "</tr></thead><tbody>"

	local _end = #obj.lines + 1
	for i = obj.start + 2, #obj.lines do
		line = obj.lines[i]
		line = format_line(line)
		line_fields = strings_split(line, "|")
		if #line_fields ~= #cur_line_fields then
			_end = i + 1
			break
		end

		htmlContent = htmlContent ..  "<tr>"
		for j, field in ipairs(line_fields) do
			field = strings_trim(field)
			htmlField = obj.md.line_parse(field)
			htmlContent = htmlContent .. "<td ".. style_list[j] ..">" .. htmlField .. "</td>"
		end
		htmlContent = htmlContent .. "</tr>"
		content = content .. "\n" .. line
		text = text .. "\n" .. obj.lines[i]
	end

	htmlContent = htmlContent .. "</tbody></table>"

	local table_render = obj.md.rule_render["table"]
	if table_render then
		htmlContent = table_render({md=obj.md, content=content, text=text}) or htmlContent
	end

	return {
		tag="table",
		content= content,
		text= text,
		htmlContent= htmlContent,
		start= obj.start,
		_end= _end,
	}
end

-- 渲染token
local function render_token(token) 
	local htmlContent = ""

	if token.htmlContent then
		return token.htmlContent
	end

	htmlContent = htmlContent .. "<" .. token.tag .. ">"

	local subtokens = token.subtokens or {}
	for _, token in ipairs(subtokens) do
		htmlContent = htmlContent .. render_token(token)
	end
	htmlContent = htmlContent .. "</" .. token.tag .. ">"

	return htmlContent
end

local md = {
	block_rule_list={},
	inline_rule_list={},
	rule_render={},
	escape_ch=escape_ch,
	special_str=special_str,
}

md.md_special_char_escape = md_special_char_escape
md.md_special_char_unescape = md_special_char_unescape

function md:register_inline_rule(rule) 
	self.inline_rule_list[#self.inline_rule_list+1] = rule
end

function md:register_block_rule(rule) 
	self.block_rule_list[#self.block_rule_list+1] = rule
end

function md:register_rule_render(tag, render) 
	local default_render = self.rule_render[tag] or (function() end)
	self.rule_render[tag] = function(obj)
		return render(obj, default_render)
	end
end

md:register_inline_rule(image_link)
md:register_inline_rule(strong_em)
md:register_inline_rule(inline_code)

md:register_block_rule(horizontal_line)
md:register_block_rule(br)
md:register_block_rule(header)
md:register_block_rule(block_code)
md:register_block_rule(block_code_tab)
md:register_block_rule(blockquote)
md:register_block_rule(list)
md:register_block_rule(md_table)

-- 段落需放最后
md:register_block_rule(paragraph)

function md:line_parse(text) 
	for _, rule in ipairs(self.inline_rule_list) do
		text = rule({text=text, md=md})
	end
	return text
end

function md:block_parse(text, env) 
	local params = {}
	local tokens = {}
	local lines = strings_split(text, "\n")
	local start = 1
	local size = #lines
	while start <= size do
		params.start = start
		params.lines = lines
		params.md = self

		for _, block_rule in ipairs(self.block_rule_list) do
			local token = block_rule(params, env)
			if token then
				tokens[#tokens+1] = token
				start = token._end -1
				break
			end
		end
		start = start + 1
	end
	--console(tokens)

	return tokens
end

function md:parse(text) 
	text = md_special_char_escape(text or "")
	local tokens = self:block_parse(text)
	for _, token in ipairs(tokens) do
		token.content = md.md_special_char_unescape(token.content)
		token.text = md.md_special_char_unescape(token.text)
		token.htmlContent = render_token(token)
		token.htmlContent = md.md_special_char_unescape(token.htmlContent)
	end
	return tokens
end

function md:render(text) 
	local tokens = self:parse(text)
	local htmlContent = ""

	for _, token in ipairs(tokens) do
		htmlContent = htmlContent .. token.htmlContent	
	end

	return htmlContent
end

function md:test()
	file = io.open("md/text", "r")
	str = file:read("*a")
	io.close(file)
	print(md:render(str))
end

return md
