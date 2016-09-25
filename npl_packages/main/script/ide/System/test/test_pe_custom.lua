--[[
Title: test pe_custom controls
Author(s): LiXizhi
Date: 2015/5/6
Desc: 
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/ide/System/test/test_pe_custom.lua");
local MyCustomControl = commonlib.gettable("MyApp.Controls.MyCustomControl");
------------------------------------------------------------
]]
local MyCustomControl = commonlib.inherit(commonlib.gettable("System.Windows.UIElement"), commonlib.gettable("MyApp.Controls.MyCustomControl"));

function MyCustomControl:paintEvent(painter)
	painter:SetPen("#ff0000");
	painter:DrawText(10,10, "MyCustomControl");
end