--[[
Title: 
Author(s): Leio
Date: 2010/5/12
Desc: 
Use Lib:
-------------------------------------------------------
NPL.load("(gl)script/ide/IPCBinding/IPCBindingContext.lua");
NPL.load("(gl)script/ide/IPCBinding/Test/TestBindableObject.lua");
local bindableObject = IPCBinding.TestBindableObject:new{
	uid = "1_1",
	name = "leio",
	count = 0,
	isshow = true,
}; 
IPCBindingContext.AddBinding(bindableObject);
--------------------------------------------------------
NPL.load("(gl)script/ide/IPCBinding/IPCBindingContext.lua");
NPL.load("(gl)script/ide/IPCBinding/Test/TestBindableObject.lua");
local uid = "1_1";
local obj = IPCBindingContext.GetBindingObject(uid);
if(obj)then
	local params = {
		name = "leio1",
		count = 1,
		isshow = false,
	}
	commonlib.echo("=========set params");
	commonlib.echo(params);
	obj:SetParams(params);
end
--------------------------------------------------------
NPL.load("(gl)script/ide/IPCBinding/IPCBindingContext.lua");
NPL.load("(gl)script/ide/IPCBinding/Test/TestBindableObject.lua");
IPCBindingContext.RemoveBindingByUID("1_1");

--------------------------------------------------------
NPL.load("(gl)script/ide/ExternalInterface.lua");
ExternalInterface.Call("addbinding",ParaGlobal.GenerateUniqueID());
------------------------------------------------------
]]
NPL.load("(gl)script/ide/IPCBinding/BindableObject.lua");
NPL.load("(gl)script/ide/EventDispatcher.lua");
--#BeginDefine
--[Class(namespace="PETools.World",label="TestBindableObject")]
NPL.load("(gl)script/ide/EventDispatcher.lua");
local TestBindableObject = commonlib.inherit(IPCBinding.BindableObject,{
	--[Property(type="string",label="uid")]
	uid = nil,
	--[Property(type="string",label="name")]
	name = nil,
	--[Property(type="number",label="count")]
	count = nil,
	--[Property(type="boolean",label="isshow")]
	isshow = nil,
})
--#EndDefine
commonlib.setfield("IPCBinding.TestBindableObject",TestBindableObject);

function TestBindableObject:GetClassDescriptor()
	local classTitle = {label = "TestBindableObject", namespace = "PETools.World", }
	local props = {
		{ 
			label = "uid", 
			type = "string",
			category = "test category", 
			desc = "description", 
			editor="System.Drawing.Design.UITypeEditor", 
			converter="System.ComponentModel.TypeConverter",
		
		},
		{ label = "name", type = "string", },
		{ label = "count", type = "number", },
		{ label = "isshow", type = "boolean", },
	}
	self.classTitle,self.props = classTitle,props;
	return classTitle,props;
end
function TestBindableObject:ToXML()
	local classTitle,props = self:GetClassDescriptor();
	local xml = IPCBinding.BindableObject.NPLToXML(self,classTitle,props)
	return xml;
end
function TestBindableObject:OnPropertyChanged()
	self:DispatchEvent({
		type = "propertychanged",
		sender = self,
	});
end
function TestBindableObject.Add()
	NPL.load("(gl)script/ide/IPCBinding/IPCBindingContext.lua");
	NPL.load("(gl)script/ide/IPCBinding/Test/TestBindableObject.lua");
	local bindableObject = IPCBinding.TestBindableObject:new{
		uid = "1_1",
		name = "leio",
		count = 0,
		isshow = true,
	}; 
	IPCBindingContext.AddBinding(bindableObject);
end
function TestBindableObject.Remove()
	NPL.load("(gl)script/ide/IPCBinding/IPCBindingContext.lua");
	NPL.load("(gl)script/ide/IPCBinding/Test/TestBindableObject.lua");
	IPCBindingContext.RemoveBindingByUID("1_1");
end
function TestBindableObject.Modify()
	NPL.load("(gl)script/ide/IPCBinding/IPCBindingContext.lua");
	NPL.load("(gl)script/ide/IPCBinding/Test/TestBindableObject.lua");
	local uid = "1_1";
	local obj = IPCBindingContext.GetBindingObject(uid);
	if(obj)then
		local params = {
			name = "leio1",
			count = 1,
			isshow = false,
		}
		commonlib.echo("=========set params");
		commonlib.echo(params);
		obj:SetParams(params);
	end
end
