--[[
Title: test 
Author(s): LiXizhi
Date: 2011/3/3
Desc: 
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/ide/Display2D/test/test_viewport2d.lua");
local test_viewport2d = commonlib.gettable("CommonCtrl.Display2D.test.test_viewport2d");
test_viewport2d:CreateViewPort()
------------------------------------------------------------
]]
NPL.load("(gl)script/ide/Display2D/viewport2d.lua");
local test_viewport2d = commonlib.gettable("CommonCtrl.Display2D.test.test_viewport2d");

-- create a new object
function test_viewport2d:CreateViewPort()
	NPL.load("(gl)script/ide/Display2D/viewport2d.lua");
	local viewport2d = commonlib.gettable("CommonCtrl.Display2D.viewport2d");
	local my_view = viewport2d:new({name="my_minimap"});
	my_view:set_point_ui_radius(4);
	my_view:clear();
	my_view:add("obj1", {x=0,y=0, tooltip="0,0"});
	my_view:add("obj2", {x=60,y=60, tooltip="2"});
	my_view:add("obj3", {x=-60,y=-60, tooltip="3"});

	local my_tex = my_view:get_texture_grid();
	my_tex:set_active_rendering(true);
	my_tex:set_mask_texture("Texture/Aries/Common/circular_mask.png")
	my_tex:clear();
	my_tex:add("obj1", {left=-100,top=-100, right=0, bottom=0, background="Texture/16number.png"});
	my_tex:add("obj2", {left=0,top=-100, right=100, bottom=0, background="Texture/16number.png"});
	my_tex:add("obj3", {left=0,top=0, right=100, bottom=100, background="Texture/16number.png"});
	my_tex:add("obj4", {left=-100,top=0, right=0, bottom=100, background="Texture/16number.png"});

	my_view:clip_circle(0, 0, 300);
	local _parent = ParaUI.GetUIObject("viewport2d_cont")
	if(not _parent:IsValid()) then
		_parent = ParaUI.CreateUIObject("container","viewport2d_cont", "_lt", 70,70,160,160);
		_parent.candrag = true;
		ParaUI.GetUIObject("root"):AddChild(_parent);
	end
	my_view:draw(_parent, 0,0,160,160);
end

-- test texture grid
function test_viewport2d:Test_texture_grid_container_type()
	NPL.load("(gl)script/ide/Display2D/texture_grid.lua");
	local texture_grid = commonlib.gettable("CommonCtrl.Display2D.texture_grid");
	local my_tex = texture_grid:new({name="my_tex", width=128, height=128, render_target_type="container"})
	my_tex:clear();
	my_tex:add("obj1", {left=-100,top=-100, right=0, bottom=0, background="Texture/16number.png"});
	my_tex:add("obj2", {left=0,top=-100, right=100, bottom=0, background="Texture/16number.png"});
	my_tex:add("obj3", {left=0,top=0, right=100, bottom=100, background="Texture/16number.png"});
	my_tex:add("obj4", {left=-100,top=0, right=0, bottom=100, background="Texture/16number.png"});
	my_tex:clip(-100,-100,100,100);

	local _parent = ParaUI.GetUIObject("my_tex_cont")
	if(not _parent:IsValid()) then
		_parent = ParaUI.CreateUIObject("container","my_tex_cont", "_lt", 70,70,160,160);
		_parent.candrag = true;
		ParaUI.GetUIObject("root"):AddChild(_parent);
	end
	my_tex:draw(_parent, 0,0,160,160);
end

function test_viewport2d:Test_texture_grid_texture_type()
	NPL.load("(gl)script/ide/Display2D/texture_grid.lua");
	local texture_grid = commonlib.gettable("CommonCtrl.Display2D.texture_grid");
	local my_tex = texture_grid:new({name="my_tex", width=128, height=128, render_target_type="texture"})
	my_tex:clear();
	my_tex:set_active_rendering(true);
	my_tex:set_mask_texture("Texture/Aries/Common/circular_mask.png")
	my_tex:add("obj1", {left=-100,top=-100, right=0, bottom=0, background="Texture/16number.png"});
	my_tex:add("obj2", {left=0,top=-100, right=100, bottom=0, background="Texture/16number.png"});
	my_tex:add("obj3", {left=0,top=0, right=100, bottom=100, background="Texture/16number.png"});
	my_tex:add("obj4", {left=-100,top=0, right=0, bottom=100, background="Texture/16number.png"});
	my_tex:clip(-100,-100,100,100);

	local _parent = ParaUI.GetUIObject("my_tex_cont1")
	if(not _parent:IsValid()) then
		_parent = ParaUI.CreateUIObject("container","my_tex_cont1", "_lt", 70,70,160,160);
		_parent.candrag = true;
		ParaUI.GetUIObject("root"):AddChild(_parent);
	end
	my_tex:draw(_parent, 0,0,160,160);
end
