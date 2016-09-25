--[[
Title: CSGPolygon
Author(s): leio
Date: 2016/3/29
Desc: 
Represents a convex polygon. The vertices used to initialize a polygon must
be coplanar and form a convex loop. They do not have to be `CSG.Vertex`
instances but they must behave similarly (duck typing can be used for
customization).
 
Each convex polygon has a `shared` property, which is shared between all
polygons that are clones of each other or were split from the same polygon.
This can be used to define per-polygon properties (such as surface color).
-------------------------------------------------------
NPL.load("(gl)script/ide/CSG/CSGPolygon.lua");
local CSGPolygon = commonlib.gettable("CSG.CSGPolygon");
-------------------------------------------------------
]]
NPL.load("(gl)script/ide/CSG/CSGPlane.lua");
local CSGPlane = commonlib.gettable("CSG.CSGPlane");
local CSGPolygon = commonlib.inherit(nil, commonlib.gettable("CSG.CSGPolygon"));
function CSGPolygon:ctor()
end
function CSGPolygon:init(vertices, shared)
	self.vertices = vertices;
	self.shared = shared;
	self.plane = CSGPlane.fromPoints(vertices[1].pos, vertices[2].pos, vertices[3].pos);
	return self;
end
function CSGPolygon:clone()
	local k,v;
	local result = {};
	for k,v in ipairs(self.vertices) do
		table.insert(result,v:clone());
	end
	local p = CSGPolygon:new():init(result,self.shared);
	return p;
end
function CSGPolygon:flip()
	local result = {};
	local len = #self.vertices;
	while(len > 0)do
		local vertex = self.vertices[len];
		vertex:flip();
		table.insert(result,vertex);
		len = len - 1;
	end
	self.vertices = result;
	self.plane:flip();
end