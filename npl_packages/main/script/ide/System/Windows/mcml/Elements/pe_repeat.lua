--[[
Title: pe:repeat element
Author(s): LiXizhi
Date: 2016/7/19
Desc: pe:repeat element

### `pe:repeat` tag
@param value: "[name] in [func_or_table]"
@param DataSource: alternatively one can use DataSource rather than `value`

Examples: 
```xml
<%
repeat_data = { {a=1}, {a=2} };
function GetDS()
    return repeat_data;
end
%>
<pe:repeat value="item in repeat_data" style="float:left">
    <div style="float:left;"><%=item.a%></div>
</pe:repeat>
<pe:repeat value="item in GetDS()" style="float:left">
    <div style="float:left;"><%=item.a%></div>
</pe:repeat>
<pe:repeat DataSource='<%=GetDS()%>' style="float:left">
    <div style="float:left;"><%=a%></div>
</pe:repeat>
```
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/ide/System/Windows/mcml/Elements/pe_repeat.lua");
System.Windows.mcml.Elements.pe_repeat:RegisterAs("pe:repeat");
------------------------------------------------------------
]]

NPL.load("(gl)script/ide/System/Windows/mcml/PageElement.lua");
NPL.load("(gl)script/ide/System/Windows/Shapes/Rectangle.lua");
NPL.load("(gl)script/ide/System/Windows/Controls/Button.lua");
local Button = commonlib.gettable("System.Windows.Controls.Button");
local Rectangle = commonlib.gettable("System.Windows.Shapes.Rectangle");

local pe_repeat = commonlib.inherit(commonlib.gettable("System.Windows.mcml.PageElement"), commonlib.gettable("System.Windows.mcml.Elements.pe_repeat"));

function pe_repeat:ctor()
end

function pe_repeat:OnLoadComponentBeforeChild(parentElem, parentLayout, css)
	if(self.isCompiled) then
		return;
	end
	self.isCompiled = true;
	self:MoveChildrenToTemplate();

	local arrayValues, name, value;
	local value = self:GetAttributeWithCode("value");
	if(type(value) == "string") then
		name, value = value:match("^([%w_]+)%s+in%s+([^%s%(]+)");
		if(name and value) then
			arrayValues = self:GetScriptValue(value);
		end
	else
		arrayValues = self:GetAttributeWithCode("DataSource", nil, true);
		name = "this";
	end

	if(type(arrayValues) == "function") then
		arrayValues = arrayValues();
	end
	if(arrayValues and type(arrayValues) == "table") then
		local template = self:GetTemplateNode();
		for i, v in ipairs(arrayValues) do
			local child = template:clone();
			child:SetPreValue("index", i);
			child:SetPreValue(name, v);
			if(name == "this") then
				for n,v in pairs(v) do
					child:SetPreValue(n, v);
				end
			end
			self:AddChild(child);
		end
	end
end
