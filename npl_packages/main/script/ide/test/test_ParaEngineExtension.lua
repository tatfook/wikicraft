--[[
Author: Li,Xizhi
Date: 2007-9-3
Desc: testing ParaEngine extension functions.
-----------------------------------------------
NPL.load("(gl)script/ide/test/test_ParaEngineExtension.lua");
-----------------------------------------------
]]

NPL.load("(gl)script/ide/ParaEngineExtension.lua");


--passed 2007-9-3 LiXizhi
function TestRemoteTexture()
	local testTex = ParaAsset.LoadRemoteTexture("http://www.paraengine.com/images/index_12.png", "Texture/whitedot.png");
	ParaUI.Destroy("test_RemoteTex");
	local _parent=ParaUI.CreateUIObject("container","test_RemoteTex", "_lt",0,0,256,256);
	_parent.background="http://www.paraengine.com/images/index_12.png;0 0 -1 -1";
	_parent:AttachToRoot();
end


--passed 2007-9-28 LiXizhi
function TestDynamicFields()
	-- call this function multiple times to test 
	local url = ParaScene.GetPlayer():GetAttributeObject():GetDynamicField("URL", "url_");
	url = url.."url_";
	ParaScene.GetPlayer():GetAttributeObject():SetDynamicField("URL", url );
	_guihelper.MessageBox(url.."\n");
end

--passed 2008-5-9 LiXizhi
function TestParaUIObjectSetScript()
	-- call this function multiple times to test 
	local _parent=ParaUI.CreateUIObject("button","test_SetScriptCtrl", "_lt",0,0,120,20);
	_parent.text = "SetScript Test"
	_parent:AttachToRoot();
	
	-- without params
	_parent:SetScript("onmouseleave", function(obj)
		log(string.format("object %s mouse leaved \n", obj.name))
	end);
	
	-- with params
	_parent:SetScript("onclick", function(obj, p1, p2)
		_guihelper.MessageBox(string.format("object %s onclick is called with %s, %s", obj.name, p1, p2))
	end, "AdditionalInput1", "AdditionalInput2");
end

function TestParaEngineIcon()
	ParaEngine.GetAttributeObject():SetField("Icon", "IDI_APPLICATION");
	-- ParaEngine.GetAttributeObject():SetField("Icon", "IDI_ERROR");
end


function TestCamera()
	local x,y,z = ParaScene.GetPlayer():GetPosition();
	if(not counter) then
		counter = 0;
	else
		counter = counter+1;
	end
	if(counter == 0)then
		ParaCamera.SetLookAtPos(x+10, y, z)
	elseif(counter == 1)then
		ParaCamera.SetLookAtPos(x-5, y, z)
	elseif(counter == 2)then
		ParaCamera.SetEyePos(0, 3, 0.4);
	elseif(counter == 3)then
		ParaCamera.SetEyePos(0.8, 6, 0.4);
	else	
		counter = nil;
	end
end
