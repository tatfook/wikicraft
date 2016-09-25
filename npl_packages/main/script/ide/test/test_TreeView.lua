--[[
Title: test tree view control
Author(s): LiXizhi
Date: 2008/4/24
Desc: 
Use Lib:
-------------------------------------------------------
NPL.load("(gl)script/ide/test/test_TreeView.lua");
%TESTCASE{"General file explorer", func="test.test_fileexplorer", }%
-------------------------------------------------------
]]

if(not test) then test ={} end

-- passed by LiXizhi 2009.2.11
function test.test_treeview_grid(input)
	NPL.load("(gl)script/ide/TreeView.lua");
	local ctl = CommonCtrl.TreeView:new{
		name = "TreeView1",
		alignment = "_lt",
		left=100, top=50,
		width = 200,
		height = 200,
		parent = nil,
		DrawNodeHandler = nil,
		DefaultNodeHeight = 32,
		DefaultNodeWidth = 32,
	};
	local node = ctl.RootNode;
	node.ItemsPerRow = 3;
	node:AddChild("Node1");
	node:AddChild("Node2");
	node:AddChild("Node3");
	node:AddChild("Node4");
	node:AddChild("Node5");
	node:AddChild("Node6");
	node:AddChild("Node7");
	node:AddChild("Node8");
	node:AddChild("Node9");
	ctl:Show();
end
