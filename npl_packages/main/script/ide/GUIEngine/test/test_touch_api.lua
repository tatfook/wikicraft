--[[
Title: test_touch_api
Author(s): LiXizhi
Date: 2014/4/24
Revision: 
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/ide/GUIEngine/test/test_touch_api.lua");
local test_touch_api = commonlib.gettable("commonlib.GUIEngine.test.test_touch_api");
test_touch_api.test_AddTouchEvent();
-------------------------------------------------------
]]
NPL.load("(gl)script/ide/GUIEngine/TouchManager.lua");
NPL.load("(gl)script/ide/GUIEngine/TouchEvent.lua");
local TouchEvent = commonlib.gettable("commonlib.GUIEngine.TouchEvent")
local TouchManager = commonlib.gettable("commonlib.GUIEngine.TouchManager");

local test_touch_api = commonlib.gettable("commonlib.GUIEngine.test.test_touch_api");

function test_touch_api.test_AddTouchEvent()
	-- testing dispatch to event pool
	local event = TouchEvent:new():init("WM_POINTERUPDATE", 100, 200, 1001);
	TouchManager.AddTouchEvent(event);

	local event = TouchEvent:new():init("WM_POINTERUPDATE", 101, 201, 1001);
	TouchManager.AddTouchEvent(event);

	local event = TouchEvent:new():init("WM_POINTERLEAVE", 102, 202, 1001);
	TouchManager.AddTouchEvent(event);

	local event = TouchEvent:new():init("WM_POINTERUPDATE", 107, 207, 1002);
	TouchManager.AddTouchEvent(event);

	-- testing custom event handler
	TouchManager.AddEventListener("ontouch", function(self, event)
		echo("custom event listener")
		echo({event.x, event.y, event.id, event.type})
	end, nil, "test");

	-- testing on GUI object. 
	local obj = ParaUI.GetUIObject("root");
	obj:SetScript("ontouch", function(obj, event)
		echo("from UI event callback")
		echo(event)
	end);

	-- testing on child GUI object. 
	local _this = ParaUI.GetUIObject("test_touch_button");
	if(_this:IsValid() == false) then
		_this = ParaUI.CreateUIObject("button", "test_touch_button", "_lt", 300, 50, 150, 50);
		_this.text= "Touch Button"
		_this.zorder = 100;
		_this:AttachToRoot();
		_this:SetScript("ontouch", function(obj, event)
			echo("from Button event callback")
			echo(event)
		end);
	else
		ParaUI.Destroy("test_touch_button");
	end

	-- testing tick 
	TouchManager.FrameMove();
end