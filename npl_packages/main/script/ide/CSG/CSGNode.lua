--[[
Title: CSGNode
Author(s): leio
Date: 2016/3/29
Desc: 
Holds a node in a BSP tree. A BSP tree is built from a collection of polygons
by picking a polygon to split along. That polygon (and all other coplanar
polygons) are added directly to that node and the other polygons are added to
the front and/or back subtrees. This is not a leafy BSP tree since there is
no distinction between internal and leaf nodes.
-------------------------------------------------------
NPL.load("(gl)script/ide/CSG/CSGNode.lua");
local CSGNode = commonlib.gettable("CSG.CSGNode");
-------------------------------------------------------
]]
local CSGNode = commonlib.inherit(nil, commonlib.gettable("CSG.CSGNode"));
local function slice(source)
	if(not source)then
		return
	end
	local result = {};
	local k,v;
	for k,v in ipairs(source) do
		table.insert(result,v);
	end
	return result;
end
local function concat(a,b)
	if(a and b)then
		a = slice(a);
		local k,v;
		for k,v in ipairs(b) do
			table.insert(a,v);
		end
		return a;
	end
end
function CSGNode:ctor()
end
function CSGNode:init(polygons)
	self.plane = nil;
	self.front = nil;
	self.back = nil;
	self.polygons = {};
	if (polygons) then
		self:build(polygons);
	end
	return self;
end
function CSGNode:clone()
	local node = CSGNode:new();
	if(self.plane)then
		node.plane = self.plane:clone();
	end
	if(self.front)then
		node.front = self.front:clone();
	end
	if(self.back)then
		node.back = self.back:clone();
	end
	local polygons = {};
	local k,p;
	for k,p in ipairs(self.polygons) do
		table.insert(polygons,p:clone());
	end
	node.polygons = polygons;
	return node;
end
--Convert solid space to empty space and empty space to solid space.
function CSGNode:invert()
	for k,p in ipairs(self.polygons) do
		p:flip();
	end
	if(self.plane)then
		self.plane:flip();
	end
	if(self.front)then
		self.front:invert();
	end
	if(self.back)then
		self.back:invert();
	end
	local temp = self.front;
	self.front = self.back;
	self.back = temp;
end
--Recursively remove all polygons in `polygons` that are inside this BSP tree.
function CSGNode:clipPolygons(polygons)
	if(not self.plane)then
		return slice(polygons);
	end
	local front = {};
	local back = {};
	local k,p;
	for k,p in ipairs(polygons) do
		self.plane:splitPolygon(p,front, back, front, back);
	end
	if(self.front)then
		front = self.front:clipPolygons(front);
	end
	if(self.back)then
		back = self.back:clipPolygons(back);
	else
		back = {};
	end
	return concat(front,back);
end
--Remove all polygons in this BSP tree that are inside the other BSP tree 'bsp'.
function CSGNode:clipTo(bsp)
	if(not bsp)then return end
	self.polygons = bsp:clipPolygons(self.polygons);
	if(self.front)then
		self.front:clipTo(bsp);
	end
	if(self.back)then
		self.back:clipTo(bsp);
	end
end
--Return a list of all polygons in this BSP tree.
function CSGNode:allPolygons()
	local polygons = slice(self.polygons);
	if(self.front)then
		polygons = concat(polygons,self.front:allPolygons());
	end
	if(self.back)then
		polygons = concat(polygons,self.back:allPolygons());
	end
	return polygons;
end
--Build a BSP tree out of `polygons`. When called on an existing tree, the
--new polygons are filtered down to the bottom of the tree and become new
--nodes there. Each set of polygons is partitioned using the first polygon
--(no heuristic is used to pick a good split).
function CSGNode:build(polygons)
	if(not polygons or #polygons == 0)then
		return;
	end
	if(not self.plane)then
		self.plane = polygons[1].plane:clone();
	end
	local front = {};
	local back = {};
	for k,p in ipairs(polygons) do
		self.plane:splitPolygon(p, self.polygons, self.polygons, front, back);
	end
	if((#front) > 0)then
		if(not self.front)then
			self.front = CSGNode:new():init();
		end
		self.front:build(front);
	end
	if((#back) > 0)then
		if(not self.back)then
			self.back = CSGNode:new():init();
		end
		self.back:build(back);
	end
end