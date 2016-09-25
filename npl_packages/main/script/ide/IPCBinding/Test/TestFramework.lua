--[[
Title: Test Framework
Author(s): LiXizhi
Date: 2010/6/1
Desc: 
Use Lib:
-------------------------------------------------------
NPL.load("(gl)script/ide/IPCBinding/Test/TestFramework.lua", true);
------------------------------------------------------
]]
NPL.load("(gl)script/ide/UnitTest/luaunit.lua");
NPL.load("(gl)script/ide/IPCBinding/Framework.lua");

local EntityView = commonlib.gettable("IPCBinding.EntityView");
local InstanceView = commonlib.gettable("IPCBinding.InstanceView");
local EntityHelperSerializer = commonlib.gettable("IPCBinding.EntityHelperSerializer");

TestEntityView = {} 

function TestEntityView:setUp()
end

function TestEntityView:test_LoadEntityTemplate()
	local filename = "script/ide/IPCBinding/EntitySampleTemplate.entity.xml";
	local template = EntityView.LoadEntityTemplate(filename, false);
	if(template) then
		assert(template.name == "EntitySampleTemplate");
		local entity_class = template.class;
		assert(entity_class~=nil)
		local classTitle, props = entity_class:GetClassDescriptor();
		assert(classTitle.label == "EntitySampleTemplate");
		-- commonlib.echo(props);
	end
end

function TestEntityView:test_EntityCreation()
	local filename = "script/ide/IPCBinding/EntitySampleTemplate.entity.xml";
	-- test new entity
	local instance = EntityView.CreateNewEntityInstance(filename, "sequence number1");

	-- this should be same as above for singleton object
	instance = EntityView.CreateFromExistingFile(filename, "sequence number2");

	-- bind uid: "EntitySampleTemplate" to the instance view 
	InstanceView.BindInstance(filename, "EntitySampleTemplate", ".*", instance.codefile, "sequence number3");

	-- dump to see state. 
	InstanceView.DumpAll();

	-- delete it
	InstanceView.DeleteInstance(filename, "EntitySampleTemplate", ".*");
end

function TestEntityView:test_GenerateIDEFiles()
	local filename = "script/ide/IPCBinding/EntitySampleTemplate.entity.xml";
	-- file will be generated. 
	EntityView.GenerateIDEFileFromTemplateFile(filename);
end

function TestEntityView:test_InstanceFuncions()
	local filename = "script/ide/IPCBinding/EntitySampleTemplate.entity.xml";
	-- test new entity
	local instance = EntityView.CreateNewEntityInstance(filename, "sequence number1");

	-- bind uid: "EntitySampleTemplate" to the instance view 
	InstanceView.BindInstance(filename, "EntitySampleTemplate", ".*", instance.codefile, "sequence number3");

	-- save it
	InstanceView.SaveInstance("EntitySampleTemplate");

	-- unbind it
	InstanceView.UnbindInstance(filename, "EntitySampleTemplate", ".*");

	-- now delete should take no effect, since we can no longer find it in the bind pool. 
	InstanceView.DeleteInstance(filename, "EntitySampleTemplate", ".*");
end

-- basic functions in the entity view. 
function TestEntityView:test_EntityFunctions()
	local filename = "script/ide/IPCBinding/EntitySamplePlaceableTemplate.entity.xml";
	local instance = EntityView.CreateNewEntityInstance(filename);
	local mesh_obj = instance:GetValue("mesh_obj")
	instance:SetValue("mesh_obj", "mesh_obj_0.x");
	assert(instance:GetValue("mesh_obj") == "mesh_obj_0.x");
end

-------------------------------------
-- TestEntityHelper
-------------------------------------
TestEntityHelper = {} 

function TestEntityHelper:setUp()
	NPL.load("(gl)script/ide/IPCBinding/EntityHelper.lua");
	IPCBinding.EntityHelper.ClearAllCachedObject();
end

function TestEntityHelper:test_GenerateBuildinTemplates()
	-- IPCBinding.EntityHelper.GenerateBuildinTemplates("script/PETools/Buildin/")
end

function TestEntityHelper:test_GetSetFields()
	assert(IPCBinding.EntityHelper.GetField("GlobalSettings.IsFullScreenMode") == false)
	IPCBinding.EntityHelper.SetField("GlobalSettings.IsWindowClosingAllowed", true);
end


-------------------------------------
-- EntityHelperSerializer
-------------------------------------
TestEntityHelperSerializer = {} 

function TestEntityHelperSerializer:setUp()
	NPL.load("(gl)script/ide/IPCBinding/EntityHelperSerializer.lua");
end

function TestEntityHelperSerializer:test_LoadSave()
	local filename = "script/ide/IPCBinding/EntitySamplePlaceableTemplate.entity.xml";
	local template = EntityView.LoadEntityTemplate(filename, false);
	-- test new entity
	local instance = EntityView.CreateNewEntityInstance(filename);
	if(instance) then
		assert(instance.classTitle.label == "SamplePlaceable")
	end

	local uid, instance, instance2;
	for uid, instance in InstanceView.eachInstance() do
		if(instance.classTitle.label == "SamplePlaceable") then
			instance.mesh_obj = "mesh_obj.x"
			if(EntityHelperSerializer.SaveInstance(instance)) then
				
				instance2 = EntityHelperSerializer.LoadInstance(template, uid, instance.worldfilter, instance.codefile);
				assert(instance2.uid == instance.uid);
				assert(instance2.mesh_obj == instance.mesh_obj);
				instance2.mesh_obj = "mesh_obj2.x"

				if(EntityHelperSerializer.SaveInstance(instance2)) then
					-- now save again to the previous table with modified values. 
				end
			end
		end
	end
	-- now delete the instance. 
	InstanceView.DeleteInstance(filename, instance2.uid, instance2.worldfilter);

	-- now bind the instance from previous file. 
	instance = InstanceView.BindInstance(filename, instance2.uid, instance2.worldfilter, instance2.codefile, nil);

	-- this is an official update, and will ensure is_modified is set to true. 
	instance:SetParams({mesh_obj = "mesh_obj3.x"});

	-- now save again using the formal interface
	InstanceView.SaveInstance(instance2.uid)

	-- now delete 
	InstanceView.DeleteInstance(filename, instance2.uid, instance2.worldfilter);

	-- now test creating from existing file
	instance = EntityView.CreateFromExistingFile(filename, instance2.codefile)
	assert(instance.uid == instance2.uid);
	assert(instance.mesh_obj == "mesh_obj3.x");
	instance:SetParams({mesh_obj = "mesh_obj4.x"});

	-- testing save all
	InstanceView.SaveAll(instance.worldfilter);

	-- delete again
	InstanceView.DeleteInstance(filename, instance2.uid, instance2.worldfilter);
end

-- saving using xpath
function TestEntityHelperSerializer:test_SaveLoadWithXpath()
	local filename = "script/ide/IPCBinding/EntitySamplePlaceableTemplate.entity.xml";
	local template = EntityView.LoadEntityTemplate(filename, false);
	-- test new entity
	local instance = EntityView.CreateNewEntityInstance(filename);
	if(instance) then
		assert(instance.classTitle.label == "SamplePlaceable")
	end
	local instance2;
	if(EntityHelperSerializer.SaveInstance(instance)) then
		instance2 = EntityHelperSerializer.LoadInstance(template, instance.uid, instance.worldfilter, instance.codefile);
	end
end

-------------------------------------
-- EntityHelperSerializer
-------------------------------------
TestEntityEditors = {} 

function TestEntityEditors:setUp()
	
end

function TestEntityEditors:test_BuildinEditors()
	local filename = "script/ide/IPCBinding/EntitySamplePlaceableTemplate.entity.xml";
	local instance = EntityView.CreateNewEntityInstance(filename);
	if(instance) then
		instance:UpdateView();

		-- test changing some property values
		local position = instance:GetValue("position");
		position.y = position.y + 1;

		--local mesh_obj = instance:GetValue("mesh_obj");
		--mesh_obj = "model/common/editor/z.x";

		instance:SetParams( {position = position, mesh_obj = mesh_obj})
	end
end

-- LuaUnit:run("TestEntityEditors")
--LuaUnit:run("TestEntityHelperSerializer")
-- LuaUnit:run("TestEntityView:test_EntityFunctions")
-- LuaUnit:run("TestEntityHelperSerializer:test_SaveLoadWithXpath");
LuaUnit:run("TestEntityHelperSerializer:test_LoadSave");
