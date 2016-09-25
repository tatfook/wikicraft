--[[
-----------------------------------------------
NPL.load("(gl)script/ide/Storyboard/Test/Test.lua");
CommonCtrl.Storyboard.Storyboard_Test.Test_1()
-----------------------------------------------
--]]
NPL.load("(gl)script/ide/Storyboard/Storyboard.lua");
NPL.load("(gl)script/ide/Storyboard/StoryboardParser.lua");
local Storyboard_Test = {

}
commonlib.setfield("CommonCtrl.Storyboard.Storyboard_Test",Storyboard_Test);
function Storyboard_Test.Test_1()
	Storyboard_Test.InitAssets();
	local path = "script/ide/Storyboard/Test/Test.xml";
	local storyboard = Storyboard_Test.Parse(path);
	if(storyboard)then
		local dur = storyboard:GetDuration();
		storyboard:Play();
	end
end
function Storyboard_Test.InitAssets()
	Storyboard_Test.CreateObj("test_obj_1")
	Storyboard_Test.CreateObj("test_obj_2")
	Storyboard_Test.CreateObj("test_obj_3")
	Storyboard_Test.CreateObj("test_obj_4")
end
function Storyboard_Test.CreateObj(name)
	local scene = CommonCtrl.Storyboard.Storyboard.GetScene()
	NPL.load("(gl)script/ide/Display/Objects/Building3D.lua");
	local building3D = CommonCtrl.Display.Objects.Building3D:new()
	building3D:Init(); 
	building3D:SetUID(name);
	local params = building3D:GetEntityParams();
	building3D:SetEntityParams(params);
	
	local player = ParaScene.GetPlayer()
	local x,y,z = player:GetPosition();
	building3D:SetPosition(x,y,z);
	scene:AddChild(building3D);
	CommonCtrl.Storyboard.Storyboard.AddHookObj(name,building3D);
end
function Storyboard_Test.Parse(path)
	if(not path)then return end
	local xmlRoot = ParaXML.LuaXML_ParseFile(path);
	local params,assets,movieclip;
	if(type(xmlRoot)=="table" and table.getn(xmlRoot)>0) then
		xmlRoot = Map3DSystem.mcml.buildclass(xmlRoot);
		NPL.load("(gl)script/ide/XPath.lua");
		local root_node;
		local node;
		for node in commonlib.XPath.eachNode(xmlRoot, "//Storyboard") do
			root_node = node;
			break;
		end
		local storyboard = CommonCtrl.Storyboard.StoryboardParser.create(root_node);
		return storyboard;
	end
	
end