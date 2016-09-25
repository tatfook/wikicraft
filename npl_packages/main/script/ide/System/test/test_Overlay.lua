--[[
Title: test overlay
Author(s): LiXizhi
Date: 2015/8/12
Desc: 
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/ide/System/test/test_Overlay.lua");
local test_Overlay = commonlib.gettable("System.Core.Test.test_Overlay");
test_Overlay:TestPainterTransforms();
test_Overlay:TestManipContainer();
test_Overlay:TestManipulators();
test_Overlay:TestShapeDrawer();
test_Overlay:TestOverlay();
------------------------------------------------------------
]]
-- define a new class
local test_Overlay = commonlib.gettable("System.Core.Test.test_Overlay");

function test_Overlay:TestOverlay()

	local red_pen_wide = {color="#ff0000", width=0.2};
	local green_pen_wide = {color="#00ff00", width=0.2};
	local green_pen_wide = {color="#00ff00", width=0.2};

	local x, y, z = ParaScene.GetPlayer():GetPosition()
	NPL.load("(gl)script/ide/System/Scene/Overlays/Overlay.lua");
	local Overlay = commonlib.gettable("System.Scene.Overlays.Overlay");
	local layer1 = Overlay:new():init();
	layer1:SetPosition(x, y, z);
	layer1.paintEvent = function(self, painter)
		painter:SetPen("#ff0000");
		painter:DrawRect(0, 0, 1, 1);
		painter:SetPen(red_pen_wide);
		painter:DrawLine(0, 0, 2, 2);
	end

	local triangleList = {{0,1,0}, {1,0,0}, {0,0,1}, {0,1,0}, {0.5, 0.5, 0.5}, {0,0,1},};
	local lineList = {{0,1,0}, {1,0,0}, {1,0,0}, {0,0,1}};
	local layer2 = Overlay:new():init();
	layer2:SetPosition(x, y+2.0, z);
	layer2.paintEvent = function(self, painter)
		painter:SetPen("#00ff00");
		painter:DrawTriangleList(triangleList, 2, 0);
		painter:Flush(); -- ensure that lines are drawn after triangles
		painter:SetPen(red_pen_wide);
		painter:DrawLineList(lineList, 2, 0);
	end
end

function test_Overlay:TestShapeDrawer()
	NPL.load("(gl)script/ide/System/Scene/Overlays/ShapesDrawer.lua");
	local ShapesDrawer = commonlib.gettable("System.Scene.Overlays.ShapesDrawer");

	local solid_pen = {color="#ff0000", width=0.02};
	
	local x, y, z = ParaScene.GetPlayer():GetPosition()
	NPL.load("(gl)script/ide/System/Scene/Overlays/Overlay.lua");
	local Overlay = commonlib.gettable("System.Scene.Overlays.Overlay");
	local layer1 = Overlay:new():init();
	layer1:SetPosition(x, y, z);
	layer1.paintEvent = function(self, painter)
		painter:SetPen(solid_pen);
		local radius = 1.5;
		painter:SetBrush("#ff0000");
		ShapesDrawer.DrawLine(painter, 0,0,0, 1,0,0);
		ShapesDrawer.DrawCube(painter, 1,0,0, 0.05);
		ShapesDrawer.DrawCircle(painter, 0,0,0, radius, "x", false, nil);
		painter:SetBrush("#ffff3380");
		ShapesDrawer.DrawCircle(painter, 0,0,0, radius, "x", true, nil, 0, 0.717);
		painter:SetBrush("#00ff00");
		ShapesDrawer.DrawLine(painter, 0,0,0, 0,1,0);
		ShapesDrawer.DrawCube(painter, 0,1,0, 0.05);
		ShapesDrawer.DrawCircle(painter, 0,0,0, radius, "y", false);
		painter:SetBrush("#0000ff");
		ShapesDrawer.DrawLine(painter, 0,0,0, 0,0,1);
		ShapesDrawer.DrawCube(painter, 0,0,1, 0.05);
		ShapesDrawer.DrawCircle(painter, 0,0,0, radius, "z", false);
	end
end

function test_Overlay:TestManipulators()
	local x, y, z = ParaScene.GetPlayer():GetPosition()

	NPL.load("(gl)script/ide/System/Scene/Manipulators/TranslateManip.lua");
	local TranslateManip = commonlib.gettable("System.Scene.Manipulators.TranslateManip");
	local manip = TranslateManip:new():init();
	manip:SetPosition(x,y,z);

	NPL.load("(gl)script/ide/System/Scene/Manipulators/RotateManip.lua");
	local RotateManip = commonlib.gettable("System.Scene.Manipulators.RotateManip");
	local manip = RotateManip:new():init();
	manip:SetPosition(x+3,y,z);
	manip:SetFromAngle(0.3);
	manip:SetToAngle(0.8);

	NPL.load("(gl)script/ide/System/Scene/Manipulators/ScaleManip.lua");
	local ScaleManip = commonlib.gettable("System.Scene.Manipulators.ScaleManip");
	local manip = ScaleManip:new():init();
	manip:SetPosition(x-3,y,z);
end

function test_Overlay:TestManipContainer()
	local x, y, z = ParaScene.GetPlayer():GetPosition()
	NPL.load("(gl)script/ide/System/Scene/Manipulators/ManipContainer.lua");
	local ManipContainer = commonlib.gettable("System.Scene.Manipulators.ManipContainer");
	local manipCont = ManipContainer:new():init();
	manipCont:SetPosition(x,y,z);
	manipCont.rotateManip = manipCont:AddRotateManip();
	manipCont.scaleManip = manipCont:AddScaleManip();
	manipCont.translateManip = manipCont:AddTranslateManip();

	commonlib.TimerManager.SetTimeout(function()
		manipCont:Destroy();
	end, 5000)
end

function test_Overlay:TestPainterTransforms()
	NPL.load("(gl)script/ide/System/Scene/Overlays/ShapesDrawer.lua");
	local ShapesDrawer = commonlib.gettable("System.Scene.Overlays.ShapesDrawer");

	local solid_pen = {color="#ff0000", width=0.02};
	
	local x, y, z = ParaScene.GetPlayer():GetPosition()
	NPL.load("(gl)script/ide/System/Scene/Overlays/Overlay.lua");
	local Overlay = commonlib.gettable("System.Scene.Overlays.Overlay");
	local layer1 = Overlay:new():init();
	layer1:SetPosition(x, y, z);

	local function DrawCube_(painter, color)
		painter:SetBrush(color or "#ff0000");
		ShapesDrawer.DrawCube(painter, 0,0,0, 0.1);
	end
	layer1.paintEvent = function(self, painter)
		painter:SetPen(solid_pen);
		DrawCube_(painter, "#ff0000");
		painter:PushMatrix();
			painter:TranslateMatrix(0,1,0);
			DrawCube_(painter, "#00ff00");
			painter:TranslateMatrix(0,0.5,0);
			painter:RotateMatrix(0.3, 0, 1, 0);
			DrawCube_(painter, "#0000ff");
		painter:PopMatrix();
		painter:TranslateMatrix(0.3,0,0);
		DrawCube_(painter, "#ff0000");
	end
end
