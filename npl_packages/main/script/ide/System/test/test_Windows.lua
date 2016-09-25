--[[
Title: test Windows
Author(s): LiXizhi
Date: 2015/4/21
Desc: 
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/ide/System/test/test_Windows.lua");
local test_Windows = commonlib.gettable("System.Core.Test.test_Windows");
test_Windows:TestMCMLPage();
test_Windows:TestEditbox();
test_Windows:TestMouseEnterLeaveEvents();
test_Windows:TestCreateWindow();
test_Windows:TestPostEvents();
test_Windows:test_pe_custom();
------------------------------------------------------------
]]
NPL.load("(gl)script/ide/System/Windows/Window.lua");
NPL.load("(gl)script/ide/System/Windows/Shapes/Rectangle.lua");
NPL.load("(gl)script/ide/System/Windows/Controls/Button.lua");
NPL.load("(gl)script/ide/System/Windows/Application.lua");
NPL.load("(gl)script/ide/System/Windows/Controls/EditBox.lua");
local EditBox = commonlib.gettable("System.Windows.Controls.EditBox");
local Application = commonlib.gettable("System.Windows.Application");
local Button = commonlib.gettable("System.Windows.Controls.Button");
local Rectangle = commonlib.gettable("System.Windows.Shapes.Rectangle");
local UIElement = commonlib.gettable("System.Windows.UIElement");
local Window = commonlib.gettable("System.Windows.Window")
local Event = commonlib.gettable("System.Core.Event");
	
-- define a new class
local test_Windows = commonlib.gettable("System.Core.Test.test_Windows");

function test_Windows:TestCreateWindow()
	
	-- create the native window
	local window = Window:new();

	-- test UI element
	local elem = UIElement:new():init(window);
	elem:SetBackgroundColor("#0000ff");
	elem:setGeometry(10,0,64,32);

	-- test create rectangle
	local rcRect = Rectangle:new():init(window);
	rcRect:SetBackgroundColor("#ff0000");
	rcRect:setGeometry(10,32,64,32);

	-- test Button
	local btn = Button:new():init(window);
	btn:SetBackgroundColor("#00ff00");
	btn:setGeometry(10,64,64,32);
	btn:Connect("clicked", function (event)
		_guihelper.MessageBox("you clicked me");
	end)
	btn:Connect("released", function(event)
		_guihelper.MessageBox("mouse up");
	end)
	
	-- show the window natively
	window:Show("my_window", nil, "_mt", 0,0, 200, 200);
end

-- test passed: 2015.4.24   LiXizhi
function test_Windows:TestPostEvents()
	local window = Window:new();
	Application:postEvent(window, System.Core.LogEvent:new({"postEvent 1"}), 1);
	Application:postEvent(window, System.Core.LogEvent:new({"postEvent 2"}), 2);

	local window2 = Window:new();
	Application:postEvent(window2, System.Core.LogEvent:new({"postEvent 1 window2"}), 1);
	Application:postEvent(window2, System.Core.LogEvent:new({"postEvent 2 window2"}), 2);
	-- event compressing
	Application:postEvent(window2, System.Windows.SizeEvent:new():init({1,1}));
	Application:postEvent(window2, System.Windows.SizeEvent:new():init({2,2}));
	window2.sizeEvent = function(self, event)
		-- only one size event should be sent
		Application:postEvent(self, System.Core.LogEvent:new({"size event", event}));	
	end
	-- only post event for the first window
	Application:sendPostedEvents(window);

	echo({window.postedEvents, window2.postedEvents});
end

function test_Windows:TestMouseEnterLeaveEvents()
	-- create the native window
	local window = Window:new();
	window.mouseEnterEvent = function(self, event)
		Application:postEvent(self, System.Core.LogEvent:new({"window enter", event:localPos()}));	
	end
	window.mouseLeaveEvent = function(self, event)
		Application:postEvent(self, System.Core.LogEvent:new({"window leave"}));	
	end

	-- Parent1
	local elem = UIElement:new():init(window);
	elem:SetBackgroundColor("#0000ff");
	elem:setGeometry(10,0,64,64);
	elem.mouseEnterEvent = function(self, event)
		Application:postEvent(self, System.Core.LogEvent:new({"parent1 enter", event:localPos()}));	
	end
	elem.mouseLeaveEvent = function(self, event)
		Application:postEvent(self, System.Core.LogEvent:new({"parent1 leave"}));	
	end

	-- Parent1:Button1
	local btn = Button:new():init(elem);
	btn:SetBackgroundColor("#ff0000");
	btn:setGeometry(0,0,64,32);
	btn.mouseEnterEvent = function(self, event)
		Application:postEvent(self, System.Core.LogEvent:new({"btn1 enter", event:localPos()}));	
	end
	btn.mouseLeaveEvent = function(self, event)
		Application:postEvent(self, System.Core.LogEvent:new({"btn1 leave"}));	
	end

	-- Button2
	local btn = Button:new():init(window);
	btn:SetBackgroundColor("#00ff00");
	btn:setGeometry(10,64,64,32);
	btn.mouseEnterEvent = function(self, event)
		Application:postEvent(self, System.Core.LogEvent:new({"btn2 enter", event:localPos()}));	
	end
	btn.mouseLeaveEvent = function(self, event)
		Application:postEvent(self, System.Core.LogEvent:new({"btn2 leave"}));	
	end
	
	-- show the window natively
	window:Show("my_window1", nil, "_mt", 0,200, 200, 200);
end

-- test loading componets via url
function test_Windows:TestMCMLPage()
	NPL.load("(gl)script/ide/System/Windows/Window.lua");
	local Window = commonlib.gettable("System.Windows.Window")
	local window = Window:new();
	window:Show({
		url="script/ide/System/test/test_mcml_page.html", 
		alignment="_mt", left = 0, top = 0, width = 200, height = 400,
	});

	-- testing loading another mcml layout after window is created.  
	-- window:LoadComponent("script/ide/System/test/test_mcml_page.html?page=2");
end

function test_Windows:test_pe_custom()
	local window = Window:new();
	window:Show({
		url="script/ide/System/test/test_pe_custom.html", 
		alignment="_mt", left = 0, top = 0, width = 200, height = 400,
	});
end

function test_Windows:TestEditbox()
	
	-- create the native window
	local window = Window:new();

	-- test UI element
	local elem = EditBox:new():init(window);
	elem:setGeometry(60,30,64,25);
	-- elem:setMaxLength(6);
	-- show the window natively
	window:Show("my_window", nil, "_lt", 0,0, 200, 200);
end