--[[
Title: test Tool Base
Author(s): LiXizhi
Date: 2014/11/25
Desc: 
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/ide/System/test/test_ToolBase.lua");
local test_ToolBase = commonlib.gettable("System.Core.Test.test_ToolBase");
test_ToolBase:TestConnection();
------------------------------------------------------------
]]
NPL.load("(gl)script/ide/System/Core/ToolBase.lua");
local ToolBase = commonlib.gettable("System.Core.ToolBase");

local test_ToolBase = commonlib.gettable("System.Core.Test.test_ToolBase");


function test_ToolBase:TestConnection()
	-- define a new class
	local MyTool = commonlib.inherit(commonlib.gettable("System.Core.ToolBase"), commonlib.gettable("System.Core.MyTool"));
	MyTool:Property("Tag");
	MyTool:Property("Value", nil, nil, nil, "ValueChanged");
	-- any parameter is only for documentation purposes. 
	MyTool:Signal("XXXChanged", function(only_for_doc)  end);

	-- create instance
	local tool1 = MyTool:new();tool1:SetName("tool1");
	local tool2 = MyTool:new();tool2:SetName("tool2");

	-- connect by method name
	tool1:Connect("ValueChanged", tool2, "SetValue");
	tool1:Connect("ValueChanged", tool2, "SetTag");
	-- connect by method pointer directly
	tool2.Connect(tool2, tool2.ValueChanged, tool1, tool1.SetValue);
	tool1:SetValue("tool1");
	assert(tool1:GetValue() == tool2:GetValue() and tool1:GetValue() == tool2:GetTag());
	tool2:SetValue("tool2");
	assert(tool1:GetValue() == "tool2");
	-- disconnect 
	tool1:Disconnect("ValueChanged", tool2, "SetTag");
	tool1:SetValue("tool1.changed");
	assert(tool1:GetValue() ~= tool2:GetTag() and tool1:GetValue() == tool2:GetValue());
	-- disconnect all signals
	tool1:Disconnect();
	tool1:SetValue("tool1.changed2");
	assert(tool1:GetValue() ~= tool2:GetValue());
	-- invoke signals
	tool1:Connect("XXXChanged", tool2, "SetTag");
	tool1:XXXChanged("XXXChanged");
	assert(tool2:GetTag() == "XXXChanged");

	-- invoke signals
	tool1:ScheduleFunctionCall(100, nil, function()
		echo("ScheduleFunctionCall passed");
	end);

	-- test auto deletion 
	tool2:SetValue("test2")
	tool1:Connect("ValueChanged", tool2, "SetValue");
	tool2:dumpObjectInfo()
	tool2:Destroy();
	tool2:dumpObjectInfo()
	tool1:SetValue("test1");
	assert(tool2:GetValue() == "test2");
end