--[[
Author: Li,Xizhi
Date: 2008-5-21
Desc: testing rule mapping.
-----------------------------------------------
NPL.load("(gl)script/ide/test/test_rulemapping.lua");
TestRuleMapping()
-----------------------------------------------
]]
NPL.load("(gl)script/ide/rulemapping.lua");

--passed 2008-5-21 LiXizhi
function TestRuleMapping()
	
	-- testing with a file
	local testRules = CommonCtrl.rulemapping:new("script/ide/test/test.rules.lua.table")
	assert(testRules("my car")=="character/Animation/v3/开车.x", "my car")
	assert(testRules("huabanche")=="character/Animation/v3/欢迎.x")
	assert(testRules("no mapping")==nil)
	
	-- for table value
	commonlib.echo(testRules("bicycle"))
	
	-- testing with tables
	local testRules = CommonCtrl.rulemapping:new({
		general={["abc.*"]="general"}, 
		special={["abc"]="special",},
	})
	
	assert(testRules("abc")=="special")
	assert(testRules("abc any word")=="general")
	assert(testRules("no mapping", true)=="no mapping")


	log("Test commonlib.rulemapping succeeded\n")
end	