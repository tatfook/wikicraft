--[[
Title: CSGVertex
Author(s): leio
Date: 2016/3/29
Desc: 
Represents a vertex of a polygon. Use your own vertex class instead of this
one to provide additional features like texture coordinates and vertex
colors. Custom vertex classes need to provide a `pos` property and `clone()`,
`flip()`, and `interpolate()` methods that behave analogous to the ones
defined by `CSG.Vertex`. This class provides `normal` so convenience
functions like `CSG.sphere()` can return a smooth vertex normal, but `normal`
is not used anywhere else.
-------------------------------------------------------
NPL.load("(gl)script/ide/CSG/CSGVertex.lua");
local CSGVertex = commonlib.gettable("CSG.CSGVertex");
-------------------------------------------------------
]]
NPL.load("(gl)script/ide/CSG/CSGVector.lua");
local CSGVector = commonlib.gettable("CSG.CSGVector");

local CSGVertex = commonlib.inherit(nil, commonlib.gettable("CSG.CSGVertex"));
function CSGVertex:ctor()
	self.pos = CSGVector:new();
	self.normal = CSGVector:new();
end
function CSGVertex:init(pos, normal)
	self.pos = pos;
	self.normal = normal;
	return self;
end
function CSGVertex:clone()
	return CSGVertex:new():init(self.pos:clone(),self.normal:clone());
end
--Invert all orientation-specific data (e.g. vertex normal). Called when the orientation of a polygon is flipped.
function CSGVertex:flip()
	self.normal = self.normal:negated();
end
--Create a new vertex between this vertex and `other` by linearly
--interpolating all properties using a parameter of `t`. Subclasses should
--override this to interpolate additional properties.
function CSGVertex:interpolate(other, t)
	return CSGVertex:new():init(
		self.pos:lerp(other.pos,t),
		self.normal:lerp(other.normal,t)
	);
end
