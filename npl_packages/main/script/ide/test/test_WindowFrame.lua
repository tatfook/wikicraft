--[[
Title: test Window Frame
Author(s): WangTian
Date: 2008/5/19
Desc: 
Use Lib:
-------------------------------------------------------
NPL.load("(gl)script/ide/test/test_WindowFrame.lua");
test.test_WindowFrame();
%TESTCASE{"Window Frame", func="test.test_WindowFrame", }%
-------------------------------------------------------
]]

if(not test) then test ={} end

NPL.load("(gl)script/ide/WindowFrame.lua");


function Map3DSystem.UI.CCS.ShowAuraInventory(bShow, _parent, wnd)
	
	NPL.load("(gl)script/kids/3DMapSystemUI/InGame/TabGrid.lua");
	
	NPL.load("(gl)script/kids/3DMapSystemUI/CCS/DB.lua");
	
	-- update the inventory info
	Map3DSystem.UI.CCS.DB.GetInventoryDB2();
	
	local ctl = CommonCtrl.GetControl("InventoryTabGrid");
	if(ctl == nil) then
		local param = {
			name = "InventoryTabGrid",
			parent = _parent,
			background = nil,
			wnd = wnd,
			
			----------- CATEGORY REGION -----------
			Level1 = "Right",
			Level1Offset = 24,
			Level1ItemWidth = 48,
			Level1ItemHeight = 48,
			--Level1ItemGap = 0,
			
			--Level2 = "Top",
			--Level2Offset = 48,
			--Level2ItemWidth = 32,
			--Level2ItemHeight = 48,
			--Level2ItemGap = 0,
			
			----------- GRID REGION -----------
			nGridBorderLeft = 8,
			nGridBorderTop = 8,
			nGridBorderRight = 8,
			nGridBorderBottom = 8,
			
			nGridCellWidth = 48,
			nGridCellHeight = 48,
			nGridCellGap = 8, -- gridview gap between cells
			
			----------- PAGE REGION -----------
			pageRegionHeight = 48,
			pageNumberWidth = 40,
			pageDefaultMargin = 16,
			
			pageLeftImage = nil,
			pageLeftWidth = 32,
			pageLeftHeight = 32,
			
			pageRightImage = nil,
			pageRightWidth = 32,
			pageRightHeight = 32,
			
			isAlwaysShowPager = false,
			
			isGridView3D = true, -- show 3D grid
			
			----------- FUNCTION REGION -----------
			GetLevel1ItemCount = function() return 9; end,
			GetLevel1ItemSelectedForeImage = function(index)
					if(index == 1) then return "Texture/3DMapSystem/CCS/btn_CCS_IT_Head.png";
					elseif(index == 2) then return "Texture/3DMapSystem/CCS/btn_CCS_IT_Shoulder.png";
					elseif(index == 3) then return "Texture/3DMapSystem/CCS/btn_CCS_IT_Chest.png";
					elseif(index == 4) then return "Texture/3DMapSystem/CCS/btn_CCS_IT_Gloves.png";
					elseif(index == 5) then return "Texture/3DMapSystem/CCS/btn_CCS_IT_Pants.png";
					elseif(index == 6) then return "Texture/3DMapSystem/CCS/btn_CCS_IT_Boots.png";
					elseif(index == 7) then return "Texture/3DMapSystem/CCS/btn_CCS_IT_HandLeft.png";
					elseif(index == 8) then return "Texture/3DMapSystem/CCS/btn_CCS_IT_HandRight.png";
					elseif(index == 9) then return "Texture/3DMapSystem/CCS/btn_CCS_IT_Cape.png";
					end
				end,
			GetLevel1ItemSelectedBackImage = function(index)
					return "Texture/3DMapSystem/CCS/btn_CCS_IT_Empty_Highlight.png";
				end,
			GetLevel1ItemUnselectedForeImage = function(index)
					if(index == 1) then return "Texture/3DMapSystem/CCS/btn_CCS_IT_Head_Fade.png";
					elseif(index == 2) then return "Texture/3DMapSystem/CCS/btn_CCS_IT_Shoulder_Fade.png";
					elseif(index == 3) then return "Texture/3DMapSystem/CCS/btn_CCS_IT_Chest_Fade.png";
					elseif(index == 4) then return "Texture/3DMapSystem/CCS/btn_CCS_IT_Gloves_Fade.png";
					elseif(index == 5) then return "Texture/3DMapSystem/CCS/btn_CCS_IT_Pants_Fade.png";
					elseif(index == 6) then return "Texture/3DMapSystem/CCS/btn_CCS_IT_Boots_Fade.png";
					elseif(index == 7) then return "Texture/3DMapSystem/CCS/btn_CCS_IT_HandLeft_Fade.png";
					elseif(index == 8) then return "Texture/3DMapSystem/CCS/btn_CCS_IT_HandRight_Fade.png";
					elseif(index == 9) then return "Texture/3DMapSystem/CCS/btn_CCS_IT_Cape_Fade.png";
					end
				end,
			GetLevel1ItemUnselectedBackImage = function(index)
					return "Texture/3DMapSystem/CCS/btn_CCS_IT_Empty_Normal.png";
				end,
			
			
			
			
			GetGridItemCount = function(level1index, level2index)
					return table.getn(Map3DSystem.UI.CCS.DB.AuraInventoryID[level1index]);
				end,
			GetGrid3DItemModel = function(level1index, level2index, itemindex)
					return Map3DSystem.UI.CCS.DB.AuraInventoryPreview[level1index][itemindex].model;
				end,
			GetGrid3DItemSkin = function(level1index, level2index, itemindex)
					return Map3DSystem.UI.CCS.DB.AuraInventoryPreview[level1index][itemindex].skin;
				end,
			
			OnClickItem = function(level1index, level2index, itemindex)
					
					local component;
					if(level1index == 1) then
						component = Map3DSystem.UI.CCS.DB.CS_HEAD;
					elseif(level1index == 2) then
						component = Map3DSystem.UI.CCS.DB.CS_SHOULDER;
					elseif(level1index == 3) then
						component = Map3DSystem.UI.CCS.DB.CS_SHIRT;
					elseif(level1index == 4) then
						component = Map3DSystem.UI.CCS.DB.CS_GLOVES;
					elseif(level1index == 5) then
						component = Map3DSystem.UI.CCS.DB.CS_PANTS;
					elseif(level1index == 6) then
						component = Map3DSystem.UI.CCS.DB.CS_BOOTS;
					elseif(level1index == 7) then
						component = Map3DSystem.UI.CCS.DB.CS_HAND_LEFT;
					elseif(level1index == 8) then
						component = Map3DSystem.UI.CCS.DB.CS_HAND_RIGHT;
					elseif(level1index == 9) then
						component = Map3DSystem.UI.CCS.DB.CS_CAPE;
					end
					
					-- temporarily directly mount the item on the selected character
					local player, playerChar = Map3DSystem.UI.CCS.DB.GetPlayerChar();
					if(playerChar~=nil) then
						playerChar:SetCharacterSlot(component, Map3DSystem.UI.CCS.DB.AuraInventoryID[level1index][itemindex]);
					end
					
				end,
		};
		ctl = Map3DSystem.UI.TabGrid:new(param);
	end
	
	ctl:Show(true);
	
end

function Map3DSystem.UI.CCS.ShowAuraCartoonFace(bShow, _parent, wnd)
	
	NPL.load("(gl)script/kids/3DMapSystemUI/InGame/TabGrid.lua");
	
	NPL.load("(gl)script/kids/3DMapSystemUI/CCS/DB.lua");
	
	--Map3DSystem.UI.CCS.DB.CFS_FACE = 0;
	--Map3DSystem.UI.CCS.DB.CFS_WRINKLE = 1;
	--Map3DSystem.UI.CCS.DB.CFS_EYE = 2;
	--Map3DSystem.UI.CCS.DB.CFS_EYEBROW = 3;
	--Map3DSystem.UI.CCS.DB.CFS_MOUTH = 4;
	--Map3DSystem.UI.CCS.DB.CFS_NOSE = 5;
	--Map3DSystem.UI.CCS.DB.CFS_MARKS = 6;
	
	local i;
	for i = 0, 6 do
		Map3DSystem.UI.CCS.DB.GetFaceComponentStyleList(i);
		Map3DSystem.UI.CCS.DB.GetFaceComponentIconList(i);
	end
	
	local ctl = CommonCtrl.GetControl("CartoonFaceTabGrid");
	if(ctl == nil) then
		local param = {
			name = "CartoonFaceTabGrid",
			parent = _parent,
			background = nil,
			wnd = wnd,
			
			----------- CATEGORY REGION -----------
			Level1 = "Left",
			Level1Offset = 48,
			Level1ItemWidth = 48,
			Level1ItemHeight = 48,
			--Level1ItemGap = 0,
			
			--Level2 = "Top",
			--Level2Offset = 48,
			--Level2ItemWidth = 32,
			--Level2ItemHeight = 48,
			--Level2ItemGap = 0,
			
			----------- GRID REGION -----------
			nGridBorderLeft = 8,
			nGridBorderTop = 8,
			nGridBorderRight = 8,
			nGridBorderBottom = 8,
			
			nGridCellWidth = 48,
			nGridCellHeight = 48,
			nGridCellGap = 8, -- gridview gap between cells
			
			----------- PAGE REGION -----------
			pageRegionHeight = 48,
			pageNumberWidth = 40,
			pageDefaultMargin = 16,
			
			pageLeftImage = nil,
			pageLeftWidth = 32,
			pageLeftHeight = 32,
			
			pageRightImage = nil,
			pageRightWidth = 32,
			pageRightHeight = 32,
			
			isAlwaysShowPager = false,
			
			----------- FUNCTION REGION -----------
			GetLevel1ItemCount = function() return 7; end,
			GetLevel1ItemSelectedForeImage = function(index)
					if(index == 1) then return "Texture/3DMapSystem/CCS/btn_CCS_CF_Eyebrow.png";
					elseif(index == 2) then return "Texture/3DMapSystem/CCS/btn_CCS_CF_Eye.png";
					elseif(index == 3) then return "Texture/3DMapSystem/CCS/btn_CCS_CF_Nose.png";
					elseif(index == 4) then return "Texture/3DMapSystem/CCS/btn_CCS_CF_Mouth.png";
					elseif(index == 5) then return "Texture/3DMapSystem/CCS/btn_CCS_CF_Wrinkle.png";
					elseif(index == 6) then return "Texture/3DMapSystem/CCS/btn_CCS_CF_Marks.png";
					elseif(index == 7) then return "Texture/3DMapSystem/CCS/btn_CCS_CF_Face.png";
					end
				end,
			GetLevel1ItemSelectedBackImage = function(index)
					return "Texture/3DMapSystem/CCS/btn_CCS_CF_Empty_Highlight.png";
				end,
			GetLevel1ItemUnselectedForeImage = function(index)
					if(index == 1) then return "Texture/3DMapSystem/CCS/btn_CCS_CF_Eyebrow.png";
					elseif(index == 2) then return "Texture/3DMapSystem/CCS/btn_CCS_CF_Eye.png";
					elseif(index == 3) then return "Texture/3DMapSystem/CCS/btn_CCS_CF_Nose.png";
					elseif(index == 4) then return "Texture/3DMapSystem/CCS/btn_CCS_CF_Mouth.png";
					elseif(index == 5) then return "Texture/3DMapSystem/CCS/btn_CCS_CF_Wrinkle.png";
					elseif(index == 6) then return "Texture/3DMapSystem/CCS/btn_CCS_CF_Marks.png";
					elseif(index == 7) then return "Texture/3DMapSystem/CCS/btn_CCS_CF_Face.png";
					end
				end,
			GetLevel1ItemUnselectedBackImage = function(index)
					return "Texture/3DMapSystem/CCS/btn_CCS_CF_Empty_Normal.png";
				end,
			
			
			
			
			GetGridItemCount = function(level1index, level2index)
					if(level1index == 1) then return table.getn(Map3DSystem.UI.CCS.DB.FaceIconLists[3]);
					elseif(level1index == 2) then return table.getn(Map3DSystem.UI.CCS.DB.FaceIconLists[2]);
					elseif(level1index == 3) then return table.getn(Map3DSystem.UI.CCS.DB.FaceIconLists[5]);
					elseif(level1index == 4) then return table.getn(Map3DSystem.UI.CCS.DB.FaceIconLists[4]);
					elseif(level1index == 5) then return table.getn(Map3DSystem.UI.CCS.DB.FaceIconLists[1]);
					elseif(level1index == 6) then return table.getn(Map3DSystem.UI.CCS.DB.FaceIconLists[6]);
					elseif(level1index == 7) then return table.getn(Map3DSystem.UI.CCS.DB.FaceIconLists[0]);
					end
				end,
			GetGridItemForeImage = function(level1index, level2index, itemindex)
					if(level1index == 1) then return "character/v3/CartoonFace/eyebrow/"..Map3DSystem.UI.CCS.DB.FaceIconLists[3][itemindex];
					elseif(level1index == 2) then return "character/v3/CartoonFace/eye/"..Map3DSystem.UI.CCS.DB.FaceIconLists[2][itemindex];
					elseif(level1index == 3) then return "character/v3/CartoonFace/nose/"..Map3DSystem.UI.CCS.DB.FaceIconLists[5][itemindex];
					elseif(level1index == 4) then return "character/v3/CartoonFace/mouth/"..Map3DSystem.UI.CCS.DB.FaceIconLists[4][itemindex];
					elseif(level1index == 5) then return "character/v3/CartoonFace/facedeco/"..Map3DSystem.UI.CCS.DB.FaceIconLists[1][itemindex];
					elseif(level1index == 6) then return "character/v3/CartoonFace/mark/"..Map3DSystem.UI.CCS.DB.FaceIconLists[6][itemindex];
					elseif(level1index == 7) then return "character/v3/CartoonFace/face/"..Map3DSystem.UI.CCS.DB.FaceIconLists[0][itemindex];
					end
				end,
			GetGridItemBackImage = function(level1index, level2index, itemindex)
					--return "Texture/3DMapSystem/common/ThemeLightBlue/menuitem_over.png: 4 4 4 4";
					return "Texture/3DMapSystem/Window/RightPanel/ItemBG.png: 8 8 8 8";
				end,
			
			OnClickItem = function(level1index, level2index, itemindex)
					
					if(level1index == 1) then Map3DSystem.UI.CCS.DB.SetFaceComponent(3, 0, Map3DSystem.UI.CCS.DB.FaceStyleLists[3][itemindex]);
					elseif(level1index == 2) then Map3DSystem.UI.CCS.DB.SetFaceComponent(2, 0, Map3DSystem.UI.CCS.DB.FaceStyleLists[2][itemindex]);
					elseif(level1index == 3) then Map3DSystem.UI.CCS.DB.SetFaceComponent(5, 0, Map3DSystem.UI.CCS.DB.FaceStyleLists[5][itemindex]);
					elseif(level1index == 4) then Map3DSystem.UI.CCS.DB.SetFaceComponent(4, 0, Map3DSystem.UI.CCS.DB.FaceStyleLists[4][itemindex]);
					elseif(level1index == 5) then Map3DSystem.UI.CCS.DB.SetFaceComponent(1, 0, Map3DSystem.UI.CCS.DB.FaceStyleLists[1][itemindex]);
					elseif(level1index == 6) then Map3DSystem.UI.CCS.DB.SetFaceComponent(6, 0, Map3DSystem.UI.CCS.DB.FaceStyleLists[6][itemindex]);
					elseif(level1index == 7) then Map3DSystem.UI.CCS.DB.SetFaceComponent(0, 0, Map3DSystem.UI.CCS.DB.FaceStyleLists[0][itemindex]);
					end
				end,
		};
		ctl = Map3DSystem.UI.TabGrid:new(param);
	end
	
	ctl:Show(true);
	
end

function Map3DSystem.UI.CCS.ShowAuraCreation(bShow, _parent, wnd)
	
	NPL.load("(gl)script/kids/3DMapSystemUI/InGame/TabGrid.lua");
	
	local ctl = CommonCtrl.GetControl("CreationTabGrid");
	if(ctl == nil) then
		local param = {
			name = "CreationTabGrid",
			parent = _parent,
			background = nil,
			wnd = wnd,
			
			----------- CATEGORY REGION -----------
			Level1 = "Left",
			Level1Offset = 48,
			Level1ItemWidth = 48,
			Level1ItemHeight = 48,
			--Level1ItemGap = 0,
			
			Level2 = "Top",
			Level2Offset = 48,
			Level2ItemWidth = 32,
			Level2ItemHeight = 48,
			--Level2ItemGap = 0,
			
			----------- GRID REGION -----------
			nGridBorderLeft = 16,
			nGridBorderTop = 16,
			nGridBorderRight = 16,
			nGridBorderBottom = 16,
			
			nGridCellWidth = 48,
			nGridCellHeight = 48,
			nGridCellGap = 8, -- gridview gap between cells
			
			----------- PAGE REGION -----------
			pageRegionHeight = 48,
			pageNumberWidth = 40,
			pageDefaultMargin = 16,
			
			pageLeftImage = nil,
			pageLeftWidth = 32,
			pageLeftHeight = 32,
			
			pageRightImage = nil,
			pageRightWidth = 32,
			pageRightHeight = 32,
			
			isAlwaysShowPager = true,
			
			----------- FUNCTION REGION -----------
			GetLevel1ItemCount = function() return 3; end,
			GetLevel1ItemSelectedForeImage = function(index)
					if(index == 1) then return "Texture/3DMapSystem/MainBarIcon/Delete_3.png";
					elseif(index == 2) then return "Texture/3DMapSystem/MainBarIcon/Tips_1.png";
					elseif(index == 3) then return "Texture/3DMapSystem/MainBarIcon/Delete_1.png";
					end
				end,
			GetLevel1ItemSelectedBackImage = function(index)
				return "Texture/3DMapSystem/common/ThemeLightBlue/tabitem_selected.png: 4 4 4 4";
				end,
			GetLevel1ItemUnselectedForeImage = function(index)
					if(index == 1) then return "Texture/3DMapSystem/MainBarIcon/Delete_6.png";
					elseif(index == 2) then return "Texture/3DMapSystem/MainBarIcon/Tips_2.png";
					elseif(index == 3) then return "Texture/3DMapSystem/MainBarIcon/Delete_2.png";
					end
				end,
			GetLevel1ItemUnselectedBackImage = function(index)
				return "Texture/3DMapSystem/common/ThemeLightBlue/tabitem_unselected.png: 4 4 4 4";
				end,
			
			
			
			GetLevel2ItemCount = function(level1index)
					local nCount, k, v = 0;
					for k, v in ipairs(Map3DSystem.DB.Groups) do
						if(level1index == 1 and v.parent == "Normal Model") then
							nCount = nCount + 1;
						elseif(level1index == 2 and v.parent == "BCS") then
							nCount = nCount + 1;
						elseif(level1index == 3 and v.parent == "Normal Character") then
							nCount = nCount + 1;
						end
					end
					return nCount;
				end,
			GetLevel2ItemSelectedForeImage = function(level1index, level2index)
					local nCount, k, v = 0;
					for k, v in ipairs(Map3DSystem.DB.Groups) do
						if(level1index == 1 and v.parent == "Normal Model") then
							nCount = nCount + 1;
						elseif(level1index == 2 and v.parent == "BCS") then
							nCount = nCount + 1;
						elseif(level1index == 3 and v.parent == "Normal Character") then
							nCount = nCount + 1;
						end
						
						if(nCount == level2index) then
							return v.icon;
						end
					end
				end,
			GetLevel2ItemSelectedBackImage = function(level1index, level2index)
					return "Texture/3DMapSystem/common/ThemeLightBlue/tabitem_selected.png: 4 4 4 4";
				end,
			GetLevel2ItemUnselectedForeImage = function(level1index, level2index)
					local nCount, k, v = 0;
					for k, v in ipairs(Map3DSystem.DB.Groups) do
						if(level1index == 1 and v.parent == "Normal Model") then
							nCount = nCount + 1;
							if(nCount == level2index) then
								return v.icon;
							end
						elseif(level1index == 2 and v.parent == "BCS") then
							nCount = nCount + 1;
							if(nCount == level2index) then
								return v.icon;
							end
						elseif(level1index == 3 and v.parent == "Normal Character") then
							nCount = nCount + 1;
							if(nCount == level2index) then
								return v.icon;
							end
						end
					end
				end,
			GetLevel2ItemUnselectedBackImage = function(level1index, level2index)
					return "Texture/3DMapSystem/common/ThemeLightBlue/tabitem_unselected.png: 4 4 4 4";
				end,
			
			GetGridItemCount = function(level1index, level2index)
					local nCount, k, v = 0;
					for k, v in ipairs(Map3DSystem.DB.Groups) do
						if(level1index == 1 and v.parent == "Normal Model") then
							nCount = nCount + 1;
						elseif(level1index == 2 and v.parent == "BCS") then
							nCount = nCount + 1;
						elseif(level1index == 3 and v.parent == "Normal Character") then
							nCount = nCount + 1;
						end
						
						if(level2index == nCount) then
							_guihelper.PrintTableStructure(Map3DSystem.DB.Items[v.name], "TestTable/items.ini");
							return table.getn(Map3DSystem.DB.Items[v.name]);
						end
					end
				end,
			GetGridItemForeImage = function(level1index, level2index, itemindex)
					local nCount, k, v = 0;
					for k, v in ipairs(Map3DSystem.DB.Groups) do
						if(level1index == 1 and v.parent == "Normal Model") then
							nCount = nCount + 1;
						elseif(level1index == 2 and v.parent == "BCS") then
							nCount = nCount + 1;
						elseif(level1index == 3 and v.parent == "Normal Character") then
							nCount = nCount + 1;
						end
						
						if(level2index == nCount) then
							local item = Map3DSystem.DB.Items[v.name][itemindex];
							if(item ~= nil) then
								return item.IconFilePath;
							end
						end
					end
				end,
			GetGridItemBackImage = function(level1index, level2index, itemindex)
					--return "Texture/3DMapSystem/common/ThemeLightBlue/menuitem_over.png: 4 4 4 4";
					return "Texture/3DMapSystem/Window/RightPanel/ItemBG.png: 8 8 8 8";
				end,
			
			OnClickItem = function(level1index, level2index, itemindex)
					--commonlib.log("OnClickItem: ");
					--commonlib.log(level1index);
					--commonlib.log(" ");
					--commonlib.log(level2index);
					--commonlib.log(" ");
					--commonlib.log(itemindex);
					--commonlib.log("\n");
					
					local nCount, k, v = 0;
					for k, v in ipairs(Map3DSystem.DB.Groups) do
						if(level1index == 1 and v.parent == "Normal Model") then
							nCount = nCount + 1;
						elseif(level1index == 2 and v.parent == "BCS") then
							nCount = nCount + 1;
						elseif(level1index == 3 and v.parent == "Normal Character") then
							nCount = nCount + 1;
						end
						
						if(level2index == nCount) then
							local backup = Map3DSystem.UI.Creation.CategoryGroup;
							Map3DSystem.UI.Creation.CategoryGroup = v.name;
							Map3DSystem.UI.Creation.OnIconClick(itemindex - 1);
							Map3DSystem.UI.Creation.CategoryGroup = backup;
							
							return;
						end
					end
				end,
		};
		ctl = Map3DSystem.UI.TabGrid:new(param);
	end
	
	ctl:Show(true);
	
end

function test.MSGProcCreationTabGrid(window, msg)

	if(msg.type == CommonCtrl.os.MSGTYPE.WM_CLOSE) then
		
	elseif(msg.type == CommonCtrl.os.MSGTYPE.WM_SIZE) then
		
		local ctl = CommonCtrl.GetControl("CreationTabGrid");
		if(ctl ~= nil) then
			ctl:OnSize(msg.width, msg.height);
		end
		
		--["height"]=440,
		--["type"]=1,
		--["wndName"]="TabGridTEST",
		--["width"]=608,
		
	elseif(msg.type == CommonCtrl.os.MSGTYPE.WM_HIDE) then
		
		
	elseif(msg.type == CommonCtrl.os.MSGTYPE.WM_SHOW) then
		
	end
end


function test.MSGProcCartoonFaceTabGrid(window, msg)

	if(msg.type == CommonCtrl.os.MSGTYPE.WM_CLOSE) then
		
	elseif(msg.type == CommonCtrl.os.MSGTYPE.WM_SIZE) then
		
		local ctl = CommonCtrl.GetControl("CartoonFaceTabGrid");
		if(ctl ~= nil) then
			ctl:OnSize(msg.width, msg.height);
		end
		
		--["height"]=440,
		--["type"]=1,
		--["wndName"]="TabGridTEST",
		--["width"]=608,
		
	elseif(msg.type == CommonCtrl.os.MSGTYPE.WM_HIDE) then
		
		
	elseif(msg.type == CommonCtrl.os.MSGTYPE.WM_SHOW) then
		
	end
end


function test.MSGProcInventoryTabGrid(window, msg)

	if(msg.type == CommonCtrl.os.MSGTYPE.WM_CLOSE) then
		
	elseif(msg.type == CommonCtrl.os.MSGTYPE.WM_SIZE) then
		
		local ctl = CommonCtrl.GetControl("InventoryTabGrid");
		if(ctl ~= nil) then
			ctl:OnSize(msg.width, msg.height);
		end
		
		--["height"]=440,
		--["type"]=1,
		--["wndName"]="TabGridTEST",
		--["width"]=608,
		
	elseif(msg.type == CommonCtrl.os.MSGTYPE.WM_HIDE) then
		
		
	elseif(msg.type == CommonCtrl.os.MSGTYPE.WM_SHOW) then
		
	end
end


function test.test_WindowFrame(input)
	
	local _app = CommonCtrl.os.CreateApp("TestWindow");
	local _wnd = _app:FindWindow("TabGridTEST") or _app:RegisterWindow("TabGridTEST", nil, test.MSGProcCreationTabGrid);
	
	local sampleWindowsParam = {
		wnd = _wnd, -- a CommonCtrl.os.window object
		
		-- icon and text is shown in the middle on the top of the frame
		text = "Middle Text", -- text is shown in default size and font, but bold
		icon = "Texture/3DMapSystem/MainBarIcon/SubIcon/NewWorld.png; 0 0 48 48", -- icon size is specified in style
		
		isShowTitleBar = true, -- default show title bar
		isShowToolboxBar = true, -- default hide title bar
			--toolboxBarHeight = 48, -- default toolbar height
		isShowStatusBar = true, -- default show status bar
		
		initialWidth = 600, -- initial width of the window client area
		initialHeight = 450, -- initial height of the window client area
		
		style = nil,
		theme = "", -- theme texture specification, please refer to wiki document
		
		alignment = "Free", -- Free|Left|Right|Bottom
		-- NOTE: autohide will collect all the same alignment within the same application, and behave like Visual Studio
		--		enable/disable autohide will enable/disable all the windows with the same alignment in the same application
		enableautohide = false, -- only applicable to document window
		
		allowDrag = true, -- allow the window frame dragable
		allowResize = true, -- allow the window frame sizeable
		
		maxWidth = 800, -- only applicable to application window and document window
		maxHeight = 600, -- only applicable to application window and document window
		minWidth = 400, -- only applicable to application window and document window, init size = initialWidth
		minHeight = 300, -- only applicable to application window and document window, init size = initialHeight
		
		opacity = 100, -- opacity value [0, 100]
		
		isShowMinimizeBox = true,
		isShowMaximizeBox = true,
		--isShowAutoHideBox = false,
		isShowCloseBox = true,
		initialPosX = 200, -- if not specified, use 
		initialPosY = 150,
		
		isFastRender = false,
		
		-- set the window to top level
		-- NOTE: be careful with this setting. in some cases 
		--		top level window will ruin mouse enter-and-leave pairs 
		--		and currently drag-and-drop UI control
		isTopLevel = false, -- false or nil will set the window to normal UI container
		
		ShowUICallback = Map3DSystem.UI.CCS.ShowAuraCreation,
	};
	
	local frame = CommonCtrl.WindowFrame:new2(sampleWindowsParam);
	frame:Show2();
	
	--frame:MoveWindow(2000, 2000, 400, 300);
	frame:MoveWindow(-2000, -2000, 400, 300);
	
	
	--local function C()
		--NPL.SetTimer(43912, 0.5, ";ACNJ();");
	--end
	--
	--function ACNJ()
		--local x, y;
		--x = math.random() * 4000 - 1000;
		--y = math.random() * 4000 - 1000;
		--frame:MoveWindow(x, y, 400, 300);
	--end
	--
	--C();
	
	
	--- LEFT ---
	
	local _app = CommonCtrl.os.CreateApp("TestWindow");
	local _wnd = _app:FindWindow("Left2") or _app:RegisterWindow("Left2", nil, test.MSGProcCartoonFaceTabGrid);	
	
	local sampleWindowsParam = {
		wnd = _wnd,
		text = "LEFT2",
		icon = "Texture/checkbox.png",
		initialWidth = 300,
		initialHeight = 450,
		style = testStyle,
		alignment = "Left",
		ShowUICallback = Map3DSystem.UI.CCS.ShowAuraCartoonFace,
	};
	local frame = CommonCtrl.WindowFrame:new2(sampleWindowsParam);
	frame:Show2();
	
	
	local _app = CommonCtrl.os.CreateApp("TestWindow");
	local _wnd = _app:FindWindow("Left3") or _app:RegisterWindow("Left3", nil, nil);
	
	local sampleWindowsParam = {
		wnd = _wnd,
		text = "LEFT3",
		icon = "Texture/checkbox.png",
		initialWidth = 300,
		initialHeight = 450,
		style = testStyle,
		alignment = "Left",
		ShowUICallback = function() local i = 1; end,
	};
	local frame = CommonCtrl.WindowFrame:new2(sampleWindowsParam);
	frame:Show2();
	
	
	local _app = CommonCtrl.os.CreateApp("TestWindow");
	local _wnd = _app:FindWindow("Left4") or _app:RegisterWindow("Left4", nil, nil);	
	
	local sampleWindowsParam = {
		wnd = _wnd,
		text = "LEFT4",
		icon = "Texture/checkbox.png",
		initialWidth = 300,
		initialHeight = 450,
		style = testStyle,
		alignment = "Left",
		ShowUICallback = function() local i = 1; end,
	};
	local frame = CommonCtrl.WindowFrame:new2(sampleWindowsParam);
	frame:Show2();
	
	
	local _app = CommonCtrl.os.CreateApp("TestWindow");
	local _wnd = _app:FindWindow("Left5") or _app:RegisterWindow("Left5", nil, nil);	
	
	local sampleWindowsParam = {
		wnd = _wnd,
		text = "LEFT5",
		icon = "Texture/checkbox.png",
		initialWidth = 300,
		initialHeight = 450,
		style = testStyle,
		alignment = "Left",
		ShowUICallback = function() local i = 1; end,
	};
	local frame = CommonCtrl.WindowFrame:new2(sampleWindowsParam);
	frame:Show2();
	
	-- test remove
	frame:Destroy();
	
	
	--- RIGHT ---
	
	local _app = CommonCtrl.os.CreateApp("TestWindow");
	local _wnd = _app:FindWindow("Right2") or _app:RegisterWindow("Right2", nil, nil);	
	
	local sampleWindowsParam = {
		wnd = _wnd,
		text = "RIGHT2",
		icon = "Texture/checkbox.png",
		initialWidth = 300,
		initialHeight = 450,
		style = testStyle,
		alignment = "Right",
		ShowUICallback = function() local i = 1; end,
	};
	local frame1 = CommonCtrl.WindowFrame:new2(sampleWindowsParam);
	frame1:Show2();
	
	
	local _app = CommonCtrl.os.CreateApp("TestWindow");
	local _wnd = _app:FindWindow("Right3") or _app:RegisterWindow("Right3", nil, test.MSGProcInventoryTabGrid);	
	
	local sampleWindowsParam = {
		wnd = _wnd,
		text = "RIGHT3",
		icon = "Texture/checkbox.png",
		initialWidth = 300,
		initialHeight = 450,
		style = testStyle,
		alignment = "Right",
		ShowUICallback = Map3DSystem.UI.CCS.ShowAuraInventory,
	};
	local frame = CommonCtrl.WindowFrame:new2(sampleWindowsParam);
	frame:Show2();
	
	--frame1:Destroy();
	
	
	--- Bottom ---
	
	local _app = CommonCtrl.os.CreateApp("TestWindow");
	local _wnd = _app:FindWindow("Bottom2") or _app:RegisterWindow("Bottom2", nil, nil);	
	
	local sampleWindowsParam = {
		wnd = _wnd,
		text = "BOTTOM2",
		icon = "Texture/checkbox.png",
		initialWidth = 300,
		initialHeight = 50,
		style = testStyle,
		alignment = "Bottom",
		ShowUICallback = function() local i = 1; end,
	};
	local frame = CommonCtrl.WindowFrame:new2(sampleWindowsParam);
	frame:Show2();
	
	
	local _app = CommonCtrl.os.CreateApp("TestWindow");
	local _wnd = _app:FindWindow("Bottom3") or _app:RegisterWindow("Bottom3", nil, nil);	
	
	local sampleWindowsParam = {
		wnd = _wnd,
		text = "BOTTOM3",
		icon = "Texture/checkbox.png",
		initialWidth = 300,
		initialHeight = 50,
		style = testStyle,
		alignment = "Bottom",
		ShowUICallback = function() local i = 1; end,
	};
	local frame = CommonCtrl.WindowFrame:new2(sampleWindowsParam);
	frame:Show2();
	
end



function test.test_WindowFrame2(input)
	
	--- LEFT ---
	
	local _app = CommonCtrl.os.CreateApp("TestWindow");
	local _wnd = _app:FindWindow("Left2") or _app:RegisterWindow("Left2", nil, test.MSGProcCartoonFaceTabGrid);	
	
	local sampleWindowsParam = {
		wnd = _wnd,
		text = "LEFT2",
		icon = "Texture/checkbox.png",
		
		isShowTitleBar = false,
		isShowToolboxBar = false,
		isShowStatusBar = false,
		
		initialWidth = 400,
		initialHeight = 450,
		style = CommonCtrl.WindowFrame.ParaWorldRightPanelStyle,
		alignment = "Left",
		ShowUICallback = Test_Env,
	};
	local frame = CommonCtrl.WindowFrame:new2(sampleWindowsParam);
	frame:Show2();
	
end


function Test_Env(bShow, _parent, parentWindow)
	
	if(not Map3DSystem.UI.Env) then Map3DSystem.UI.Env = {}; end
	local _this;
	_this = ParaUI.GetUIObject("Env_Main");
	
	if(_this:IsValid() == false) then
		if(bShow == false) then
			return;
		end
		
		if(_parent == nil) then
			_this = ParaUI.CreateUIObject("container", "Env_Main", "_lt", 0, 50, 300, 500);
			_this:AttachToRoot();
		else
			_this = ParaUI.CreateUIObject("container", "Env_Main", "_fi", 0, 0, 0, 0);
			_this.background = "";
			_parent:AddChild(_this);
			
			_BG = ParaUI.CreateUIObject("container", "Env_Main", "_fi", 0, 0, 20, 0);
			_BG.background = "Texture/3DMapSystem/Window/LeftPanel/LeftPanel2.png: 4 1 123 1";
			_BG.enabled = false;
			_this:AddChild(_BG);
		end
		
		local _main = _this;
		
		local _tab = ParaUI.CreateUIObject("container", "Tab", "_mt", 0, 0, 0, 48);
		_tab.background = "";
		_main:AddChild(_tab);
		
		local startOffset = 48;
		local tabWidth, tabHeight = 96, 48;
		
		local _ = ParaUI.CreateUIObject("container", "_", "_lt", 0, 0, startOffset, 48);
		_.background = "Texture/3DMapSystem/CCS/LeftPanel/TopTabLeft.png; 0 0 64 48: 32 24 16 24";
		_main:AddChild(_);
		local _tabSky = ParaUI.CreateUIObject("button", "Env.Sky", "_lt", startOffset, 0, tabWidth, tabHeight);
		_tabSky.onclick = ";Map3DSystem.UI.Env.ChangeToEnvTab(1);";
		--_tabSky.text = "天空";
		_main:AddChild(_tabSky);
		local _tabTerrain = ParaUI.CreateUIObject("button", "Env.Terrain", "_lt", startOffset + tabWidth, 0, tabWidth, tabHeight);
		_tabTerrain.onclick = ";Map3DSystem.UI.Env.ChangeToEnvTab(2);";
		--_tabTerrain.text = "地形";
		_main:AddChild(_tabTerrain);
		local _tabOcean = ParaUI.CreateUIObject("button", "Env.Ocean", "_lt", startOffset + tabWidth * 2, 0, tabWidth, tabHeight);
		_tabOcean.onclick = ";Map3DSystem.UI.Env.ChangeToEnvTab(3);";
		--_tabOcean.text = "海洋";
		_main:AddChild(_tabOcean);
		
		local _tabSky = ParaUI.CreateUIObject("button", "Env.Sky1", "_lt", startOffset + 4, 0, tabHeight + 4, tabHeight);
		_tabSky.onclick = ";Map3DSystem.UI.Env.ChangeToEnvTab(1);";
		_main:AddChild(_tabSky);
		local _tabSky = ParaUI.CreateUIObject("button", "Env.Sky2", "_lt", startOffset + tabHeight - 10, 0, tabWidth - tabHeight, tabHeight);
		_tabSky.text = "天空";
		_tabSky.background = "";
		_tabSky.enabled = false;
		_main:AddChild(_tabSky);
		local _tabTerrain = ParaUI.CreateUIObject("button", "Env.Terrain1", "_lt", startOffset + tabWidth + 4, 0, tabHeight + 4, tabHeight);
		_tabTerrain.onclick = ";Map3DSystem.UI.Env.ChangeToEnvTab(2);";
		_main:AddChild(_tabTerrain);
		local _tabTerrain = ParaUI.CreateUIObject("button", "Env.Terrain2", "_lt", startOffset + tabWidth + tabHeight - 10, 0, tabWidth - tabHeight, tabHeight);
		_tabTerrain.text = "地形";
		_tabTerrain.background = "";
		_tabTerrain.enabled = false;
		_main:AddChild(_tabTerrain);
		local _tabOcean = ParaUI.CreateUIObject("button", "Env.Ocean1", "_lt", startOffset + tabWidth * 2 + 4, 0, tabHeight + 4, tabHeight);
		_tabOcean.onclick = ";Map3DSystem.UI.Env.ChangeToEnvTab(3);";
		_main:AddChild(_tabOcean);
		local _tabOcean = ParaUI.CreateUIObject("button", "Env.Ocean2", "_lt", startOffset + (tabWidth * 2) + tabHeight - 10, 0, tabWidth - tabHeight, tabHeight);
		_tabOcean.text = "海洋";
		_tabOcean.background = "";
		_tabOcean.enabled = false;
		_main:AddChild(_tabOcean);
		
		local _ = ParaUI.CreateUIObject("container", "_", "_mt", startOffset + tabWidth * 3, 0, 0, 48);
		_.background = "Texture/3DMapSystem/CCS/LeftPanel/TopTabRight.png; 0 0 64 48: 4 24 50 24";
		_main:AddChild(_);
		
		
		
		
		function Map3DSystem.UI.Env.ChangeToEnvTab(i)
			local tabSelected = "Texture/3DMapSystem/CCS/LeftPanel/TopTabItem.png; 0 0 64 48: 22 22 22 22";
			local tabUnSelected = "Texture/3DMapSystem/CCS/LeftPanel/TopTabItemUnSelected.png; 0 0 64 48: 22 22 22 22";
			
			local tabSky = "Texture/3DMapSystem/Env/Sky.png; 8 8 48 48";
			local tabSky_HL = "Texture/3DMapSystem/Env/Sky_HL.png; 8 8 48 48";
			local tabTerrain = "Texture/3DMapSystem/Env/Terrain.png; 8 8 48 48";
			local tabTerrain_HL = "Texture/3DMapSystem/Env/Terrain_HL.png; 8 8 48 48";
			local tabOcean = "Texture/3DMapSystem/Env/Ocean.png; 8 8 48 48";
			local tabOcean_HL = "Texture/3DMapSystem/Env/Ocean_HL.png; 8 8 48 48";
			
			if(i == 1) then
				local _tabSky = ParaUI.GetUIObject("Env.Sky");
				local _tabTerrain = ParaUI.GetUIObject("Env.Terrain");
				local _tabOcean = ParaUI.GetUIObject("Env.Ocean");
				_guihelper.SetVistaStyleButton4(_tabSky, "", tabSelected);
				_guihelper.SetVistaStyleButton4(_tabTerrain, "", tabUnSelected);
				_guihelper.SetVistaStyleButton4(_tabOcean, "", tabUnSelected);
				local _tabSky = ParaUI.GetUIObject("Env.Sky1");
				local _tabTerrain = ParaUI.GetUIObject("Env.Terrain1");
				local _tabOcean = ParaUI.GetUIObject("Env.Ocean1");
				_guihelper.SetVistaStyleButton4(_tabSky, tabSky_HL, "");
				_guihelper.SetVistaStyleButton4(_tabTerrain, tabTerrain, "");
				_guihelper.SetVistaStyleButton4(_tabOcean, tabOcean, "");
			elseif(i == 2) then
				local _tabSky = ParaUI.GetUIObject("Env.Sky");
				local _tabTerrain = ParaUI.GetUIObject("Env.Terrain");
				local _tabOcean = ParaUI.GetUIObject("Env.Ocean");
				_guihelper.SetVistaStyleButton4(_tabSky, "", tabUnSelected);
				_guihelper.SetVistaStyleButton4(_tabTerrain, "", tabSelected);
				_guihelper.SetVistaStyleButton4(_tabOcean, "", tabUnSelected);
				local _tabSky = ParaUI.GetUIObject("Env.Sky1");
				local _tabTerrain = ParaUI.GetUIObject("Env.Terrain1");
				local _tabOcean = ParaUI.GetUIObject("Env.Ocean1");
				_guihelper.SetVistaStyleButton4(_tabSky, tabSky, "");
				_guihelper.SetVistaStyleButton4(_tabTerrain, tabTerrain_HL, "");
				_guihelper.SetVistaStyleButton4(_tabOcean, tabOcean, "");
			elseif(i == 3) then
				local _tabSky = ParaUI.GetUIObject("Env.Sky");
				local _tabTerrain = ParaUI.GetUIObject("Env.Terrain");
				local _tabOcean = ParaUI.GetUIObject("Env.Ocean");
				_guihelper.SetVistaStyleButton4(_tabSky, "", tabUnSelected);
				_guihelper.SetVistaStyleButton4(_tabTerrain, "", tabUnSelected);
				_guihelper.SetVistaStyleButton4(_tabOcean, "", tabSelected);
				local _tabSky = ParaUI.GetUIObject("Env.Sky1");
				local _tabTerrain = ParaUI.GetUIObject("Env.Terrain1");
				local _tabOcean = ParaUI.GetUIObject("Env.Ocean1");
				_guihelper.SetVistaStyleButton4(_tabSky, tabSky, "");
				_guihelper.SetVistaStyleButton4(_tabTerrain, tabTerrain, "");
				_guihelper.SetVistaStyleButton4(_tabOcean, tabOcean_HL, "");
			end
		end
		
		Map3DSystem.UI.Env.ChangeToEnvTab(1);
		
		
		local _ = ParaUI.CreateUIObject("container", "bar", "_ml", 4, 64, 50, 49);
		_.background = "Texture/3DMapSystem/CCS/LeftPanel/BarBG.png; 0 0 50 128: 28 21 21 74";
		_main:AddChild(_);
		
		--local _ = ParaUI.CreateUIObject("container", "bar", "_ml", 4, 469, 50, 138);
		--_.background = "Texture/3DMapSystem/CCS/LeftPanel/LeftTabUnSelected.png; 0 0 50 104: 28 21 21 74";
		--_main:AddChild(_);
		
		local _tabgrid = ParaUI.CreateUIObject("container", "tabgrid", "_fi", 5, 64, 100, 64);
		_tabgrid.background = "";
		_main:AddChild(_tabgrid);
		
		
		NPL.load("(gl)script/kids/3DMapSystemUI/InGame/TabGrid.lua");
		local i;
		for i = 0, 6 do
			Map3DSystem.UI.CCS.DB.GetFaceComponentStyleList(i);
			Map3DSystem.UI.CCS.DB.GetFaceComponentIconList(i);
		end
		
		local ctl = CommonCtrl.GetControl("CartoonFaceTabGrid2");
		if(ctl == nil) then
			local param = {
				name = "CartoonFaceTabGrid2",
				parent = _tabgrid,
				background = "",
				wnd = wnd,
				
				----------- CATEGORY REGION -----------
				Level1 = "Left",
				Level1Offset = 21,
				Level1ItemWidth = 50,
				Level1ItemHeight = 64,
				--Level1ItemGap = 0,
				Level1BG = "",
				--Level1ItemVistaStyle = 4;
				
				--Level2 = "Top",
				--Level2Offset = 48,
				--Level2ItemWidth = 32,
				--Level2ItemHeight = 48,
				--Level2ItemGap = 0,
				
				----------- GRID REGION -----------
				nGridBorderLeft = 16,
				nGridBorderTop = 8,
				nGridBorderRight = 8,
				nGridBorderBottom = 8,
				
				nGridCellWidth = 48,
				nGridCellHeight = 48,
				nGridCellGap = 4, -- gridview gap between cells
				
				----------- PAGE REGION -----------
				pageRegionHeight = 48,
				pageNumberWidth = 40,
				pageDefaultMargin = 16,
				
				pageLeftImage = nil,
				pageLeftWidth = 32,
				pageLeftHeight = 32,
				
				pageRightImage = nil,
				pageRightWidth = 32,
				pageRightHeight = 32,
				
				isAlwaysShowPager = false,
				
				----------- FUNCTION REGION -----------
				GetLevel1ItemCount = function() return 7; end,
				GetLevel1ItemSelectedForeImage = function(index)
						if(index == 1) then return "Texture/3DMapSystem/CCS/LeftPanel/CF_Eyebrow.png; 8 0 50 64";
						elseif(index == 2) then return "Texture/3DMapSystem/CCS/LeftPanel/CF_Eye.png; 8 0 50 64";
						elseif(index == 3) then return "Texture/3DMapSystem/CCS/LeftPanel/CF_Nose.png; 8 0 50 64";
						elseif(index == 4) then return "Texture/3DMapSystem/CCS/LeftPanel/CF_Mouth.png; 8 0 50 64";
						elseif(index == 5) then return "Texture/3DMapSystem/CCS/LeftPanel/CF_Wrinkle.png; 8 0 50 64";
						elseif(index == 6) then return "Texture/3DMapSystem/CCS/LeftPanel/CF_Marks.png; 8 0 50 64";
						elseif(index == 7) then return "Texture/3DMapSystem/CCS/LeftPanel/CF_Face.png; 8 0 50 64";
						end
					end,
				GetLevel1ItemSelectedBackImage = function(index)
						return "Texture/3DMapSystem/CCS/LeftPanel/LeftTabSelected.png; 0 0 50 64";
						--return "Texture/3DMapSystem/CCS/btn_CCS_CF_Empty_Highlight.png";
					end,
				GetLevel1ItemUnselectedForeImage = function(index)
						if(index == 1) then return "Texture/3DMapSystem/CCS/LeftPanel/CF_Eyebrow.png; 8 0 50 64";
						elseif(index == 2) then return "Texture/3DMapSystem/CCS/LeftPanel/CF_Eye.png; 8 0 50 64";
						elseif(index == 3) then return "Texture/3DMapSystem/CCS/LeftPanel/CF_Nose.png; 8 0 50 64";
						elseif(index == 4) then return "Texture/3DMapSystem/CCS/LeftPanel/CF_Mouth.png; 8 0 50 64";
						elseif(index == 5) then return "Texture/3DMapSystem/CCS/LeftPanel/CF_Wrinkle.png; 8 0 50 64";
						elseif(index == 6) then return "Texture/3DMapSystem/CCS/LeftPanel/CF_Marks.png; 8 0 50 64";
						elseif(index == 7) then return "Texture/3DMapSystem/CCS/LeftPanel/CF_Face.png; 8 0 50 64";
						end
					end,
				GetLevel1ItemUnselectedBackImage = function(index)
						return "Texture/3DMapSystem/CCS/LeftPanel/LeftTabUnSelected.png; 0 0 50 64";
						--return "Texture/3DMapSystem/CCS/btn_CCS_CF_Empty_Normal.png";
					end,
				
				
				
				
				GetGridItemCount = function(level1index, level2index)
						if(level1index == 1) then return table.getn(Map3DSystem.UI.CCS.DB.FaceIconLists[3]);
						elseif(level1index == 2) then return table.getn(Map3DSystem.UI.CCS.DB.FaceIconLists[2]);
						elseif(level1index == 3) then return table.getn(Map3DSystem.UI.CCS.DB.FaceIconLists[5]);
						elseif(level1index == 4) then return table.getn(Map3DSystem.UI.CCS.DB.FaceIconLists[4]);
						elseif(level1index == 5) then return table.getn(Map3DSystem.UI.CCS.DB.FaceIconLists[1]);
						elseif(level1index == 6) then return table.getn(Map3DSystem.UI.CCS.DB.FaceIconLists[6]);
						elseif(level1index == 7) then return table.getn(Map3DSystem.UI.CCS.DB.FaceIconLists[0]);
						end
					end,
				GetGridItemForeImage = function(level1index, level2index, itemindex)
						if(level1index == 1) then return "character/v3/CartoonFace/eyebrow/"..Map3DSystem.UI.CCS.DB.FaceIconLists[3][itemindex];
						elseif(level1index == 2) then return "character/v3/CartoonFace/eye/"..Map3DSystem.UI.CCS.DB.FaceIconLists[2][itemindex];
						elseif(level1index == 3) then return "character/v3/CartoonFace/nose/"..Map3DSystem.UI.CCS.DB.FaceIconLists[5][itemindex];
						elseif(level1index == 4) then return "character/v3/CartoonFace/mouth/"..Map3DSystem.UI.CCS.DB.FaceIconLists[4][itemindex];
						elseif(level1index == 5) then return "character/v3/CartoonFace/facedeco/"..Map3DSystem.UI.CCS.DB.FaceIconLists[1][itemindex];
						elseif(level1index == 6) then return "character/v3/CartoonFace/mark/"..Map3DSystem.UI.CCS.DB.FaceIconLists[6][itemindex];
						elseif(level1index == 7) then return "character/v3/CartoonFace/face/"..Map3DSystem.UI.CCS.DB.FaceIconLists[0][itemindex];
						end
					end,
				GetGridItemBackImage = function(level1index, level2index, itemindex)
						--return "Texture/3DMapSystem/common/ThemeLightBlue/menuitem_over.png: 4 4 4 4";
						--return "Texture/3DMapSystem/Window/RightPanel/ItemBG.png: 8 8 8 8";
						return "";
					end,
				
				OnClickItem = function(level1index, level2index, itemindex)
						
						if(level1index == 1) then Map3DSystem.UI.CCS.DB.SetFaceComponent(3, 0, Map3DSystem.UI.CCS.DB.FaceStyleLists[3][itemindex]);
						elseif(level1index == 2) then Map3DSystem.UI.CCS.DB.SetFaceComponent(2, 0, Map3DSystem.UI.CCS.DB.FaceStyleLists[2][itemindex]);
						elseif(level1index == 3) then Map3DSystem.UI.CCS.DB.SetFaceComponent(5, 0, Map3DSystem.UI.CCS.DB.FaceStyleLists[5][itemindex]);
						elseif(level1index == 4) then Map3DSystem.UI.CCS.DB.SetFaceComponent(4, 0, Map3DSystem.UI.CCS.DB.FaceStyleLists[4][itemindex]);
						elseif(level1index == 5) then Map3DSystem.UI.CCS.DB.SetFaceComponent(1, 0, Map3DSystem.UI.CCS.DB.FaceStyleLists[1][itemindex]);
						elseif(level1index == 6) then Map3DSystem.UI.CCS.DB.SetFaceComponent(6, 0, Map3DSystem.UI.CCS.DB.FaceStyleLists[6][itemindex]);
						elseif(level1index == 7) then Map3DSystem.UI.CCS.DB.SetFaceComponent(0, 0, Map3DSystem.UI.CCS.DB.FaceStyleLists[0][itemindex]);
						end
					end,
			};
			ctl = Map3DSystem.UI.TabGrid:new(param);
		end
		
		ctl:Show(true);
		
	else
		if(bShow == nil) then
			bShow = not _this.visible;
		end
		_this.visible = bShow;
	end
end

testStyle = {
	titleBarHeight = 48,
	toolboxBarHeight = 48,
	statusBarHeight = 32,
	borderLeft = 16,
	borderRight = 16,
	
	iconSize = 16,
	iconTextDistance = 16, -- distance between icon and text on the title bar
	
	CloseBox = {alignment = "_rt",
				x = -40, y = 8, size = 32,
				icon = nil,},
	MinBox = {alignment = "_rt",
				x = -120, y = 8, size = 32,
				icon = nil,},
	MaxBox = {alignment = "_rt",
				x = -80, y = 8, size = 32,
				icon = nil,},
	resizerSize = 24,
	
	};