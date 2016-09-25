--[[
Title: test file explorer control
Author(s): LiXizhi
Date: 2008/4/24
Desc: 
Use Lib:
-------------------------------------------------------
NPL.load("(gl)script/ide/test/test_FileExplorerCtrl.lua");
test.test_fileexplorer();

%TESTCASE{"General file explorer", func="test.test_fileexplorer", }%
-------------------------------------------------------
]]

if(not test) then test ={} end

-- passed by LiXizhi 2008.4.24
function test.test_fileexplorer(input)
	_guihelper.ShowDialogBox("Test file explorer", nil, nil, 512, 400, 
		function(_parent)
			-- readonly
			NPL.load("(gl)script/ide/FileExplorerCtrl.lua");
			local ctl = CommonCtrl.FileExplorerCtrl:new{
				name = "FileExplorerCtrl1",
				alignment = "_lt",left=0, top=0,width = 256,height = 300, 
				parent = _parent,
				rootfolder = "/",
				filter = "*.png;*.lua;*.x",
				--AllowFolderSelection = true,
				-- OnClick = nil,
				OnDoubleClick = function(filepath) _guihelper.MessageBox(filepath);	end,
			};
			ctl:Show(true);
			
			local ctl = CommonCtrl.FileExplorerCtrl:new{
				name = "FileExplorerCtrl2",
				alignment = "_lt",left=256, top=0,width = 256,height = 300, 
				parent = _parent,
				filter = "*.worldconfig.txt;*.zip;*.pkg",
				--AllowFolderSelection = true,
				--OnSelect = function(filepath) _guihelper.MessageBox(filepath);	end,
			};
			ctl.RootNode:AddChild(CommonCtrl.TreeNode:new({Text = "My worlds", rootfolder = "worlds/", Expanded = false,}));
			ctl.RootNode:AddChild(CommonCtrl.TreeNode:new({Text = "My documents", rootfolder = "temp"})); -- you can even add owner draw to these node
			ctl:Show(true);
		end);
end
