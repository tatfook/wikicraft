--[[
Title: test multiline editbox
Author(s): LiXizhi
Date: 2007/3/8
Desc: 
Use Lib:
-------------------------------------------------------
NPL.load("(gl)script/ide/test/test_multiline_editbox.lua");
test.test_multiline_general();
%TESTCASE{"General Editbox", func="test.test_multiline_general", }%
-------------------------------------------------------
]]

if(not test) then test ={} end

-- passed by LiXizhi 2008.3.8
function test.test_multiline_general(input)
	_guihelper.ShowDialogBox("Add a new package", nil, nil, 500, 500, 
		function(_parent)
			-- readonly
			NPL.load("(gl)script/ide/MultiLineEditbox.lua");
			local ctl = CommonCtrl.MultiLineEditbox:new{
				name = "MultiLineEditbox1",
				alignment = "_lt",left=0, top=0,width = 256,height = 90, 
				parent = _parent,
				ReadOnly = true,
				WordWrap = false,
				ShowLineNumber = true,
				syntax_map = CommonCtrl.MultiLineEditbox.syntax_map_NPL,
			};
			ctl:Show(true);
			ctl:SetText("Read Only Test with Line Number\r\n-- Syntax highlighting \r\nvoid function abc()\r\nend\r\n-- some text here");
			
			-- empty
			local ctl = CommonCtrl.MultiLineEditbox:new{
				name = "MultiLineEditbox2",
				alignment = "_lt",left=0, top=100,width = 256,height = 90, 
				parent = _parent,
				WordWrap = false,
				syntax_map = CommonCtrl.MultiLineEditbox.syntax_map_NPL,
			};
			ctl:Show(true);
			
			-- editable with line number, context menu
			local ctl = CommonCtrl.MultiLineEditbox:new{
				name = "MultiLineEditbox3",
				alignment = "_lt",left=0, top=200,width = 256,height = 90, 
				parent = _parent,
				WordWrap = false,
				ShowLineNumber = true,
				OnContextMenu = CommonCtrl.MultiLineEditbox.OnContextMenuDefault,
			};
			ctl:Show(true);
			ctl:SetText("Right Click to open the context menu\r\nTest with editable Line Number");
		end);
end
