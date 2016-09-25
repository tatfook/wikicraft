--[[
Author: LiXizhi
Date: 2009-7-23
Desc: testing commonlib. 
-----------------------------------------------
NPL.load("(gl)script/ide/test/test_commonlib.lua");
test_commonlib_tolower()
-----------------------------------------------
]]
NPL.load("(gl)script/ide/commonlib.lua");

-- passed 2009.7.23. lixizhi
function test_commonlib_tolower()
	commonlib.echo(commonlib.tolower("ABCabc_123")); --> abcabc_123
	commonlib.echo(commonlib.tolower(123)); --> 123
	commonlib.echo(commonlib.tolower({userName="LiXizhi", PassWord="aaaAAA"}));
	commonlib.echo(commonlib.tolower({userName="LiXizhi", Req={userName="LiXizhi"}}));
end

