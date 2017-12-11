
local strings = NPL.load("./strings.lua")
local mdconf = NPL.load("./mdconf.lua")
local md = NPL.load("./md.lua")

local mdwiki = {}
local wiki_mod_path = ""

md:register_rule_render("pre", function(obj, default_render)
	local text = obj.md.md_special_char_unescape(obj.text)
	local content = obj.md.md_special_char_unescape(obj.content)
	local line = strings.split(text, "\n")[1]
	local cmdName = line:match('^```@([%w_/]+)')
	if not cmdName then
		return default_render(obj)
	end

	local modName = strings.split(cmdName, '/')[1]
	local modParams = mdconf.mdToJson(content)
	local mod = { modName=modName, cmdName=cmdName, modParams=modParams }

	local mod_obj = NPL.load(wiki_mod_path .. modName .. "/index.lua")

	if type(mod_obj) == "table" and type(mod_obj.render) == "function" then
		return mod_obj:render(mod)
	end
	return default_render(obj)
end)

function mdwiki.render(text) 
	return md:render(text)
end
function mdwiki.set_wiki_mod_path(path)
	wiki_mod_path = path
end

return mdwiki

--local html = md:render([[
--[百度](http://www.baidu.com)
--```@test/js/test
--helloworld 
--```
--]])

--print(html)
