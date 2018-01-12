
local strings = require("md/strings")
local mdconf = require("md/mdconf")
local md = require("md/md")

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

	--local mod_obj = require(wiki_mod_path .. modName .. "/index")

	--if type(mod_obj) == "table" and type(mod_obj.render) == "function" then
		--return mod_obj:render(mod)
	--end
	return default_render(obj)
end)

return md

--local html = md:render([[
--[百度](http://www.baidu.com)
--```@test/js/test
--helloworld 
--```
--]])

--print(html)
