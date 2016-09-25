--[[
Title: CSGPlane
Author(s): leio
Date: 2016/3/29
Desc: 
Represents a plane in 3D space.
-------------------------------------------------------
NPL.load("(gl)script/ide/CSG/CSGPlane.lua");
local CSGPlane = commonlib.gettable("CSG.CSGPlane");
-------------------------------------------------------
]]
NPL.load("(gl)script/ide/CSG/CSGVector.lua");
NPL.load("(gl)script/ide/CSG/CSGPolygon.lua");
local CSGVector = commonlib.gettable("CSG.CSGVector");
local CSGPolygon = commonlib.gettable("CSG.CSGPolygon");
local CSGPlane = commonlib.inherit(nil, commonlib.gettable("CSG.CSGPlane"));
--`CSG.Plane.EPSILON` is the tolerance used by `splitPolygon()` to decide if a
-- point is on the plane.
CSGPlane.EPSILON = 0.00001;
function CSGPlane:ctor()
end
function CSGPlane:init(normal, w)
	self.normal = normal;
	self.w = w;
	return self;
end
function CSGPlane.fromPoints(a, b, c)
	local n = b:minus(a):cross(c:minus(a)):unit();
	local plane = CSGPlane:new():init(n,n:dot(a));
	return plane;
end
function CSGPlane:clone()
	local plane = CSGPlane:new():init(self.normal:clone(),self.w);
	return plane;
end
function CSGPlane:flip()
	self.normal = self.normal:negated();
	self.w = -self.w;
end
-- Split `polygon` by this plane if needed, then put the polygon or polygon
-- fragments in the appropriate lists. Coplanar polygons go into either
-- `coplanarFront` or `coplanarBack` depending on their orientation with
-- respect to this plane. Polygons in front or in back of this plane go into
-- either `front` or `back`.
function CSGPlane:splitPolygon(polygon, coplanarFront, coplanarBack, front, back)
	local COPLANAR = 0;
    local FRONT = 1;
    local BACK = 2;
    local SPANNING = 3;

    --Classify each point as well as the entire polygon into one of the above four classes.
    local polygonType = 0;
    local types = {};
	for k,v in ipairs(polygon.vertices) do
		local t = self.normal:dot(v.pos) - self.w;
		local type;
		if(t < -CSGPlane.EPSILON)then
			type = BACK;
		elseif(t > CSGPlane.EPSILON)then
			type = FRONT;
		else
			type = COPLANAR;
		end
		polygonType = mathlib.bit.bor(polygonType, type);
		table.insert(types,type);
	end
	if(polygonType == COPLANAR)then
		if(self.normal:dot(polygon.plane.normal) > 0)then
			table.insert(coplanarFront,polygon);
		else
			table.insert(coplanarBack,polygon);
		end
	elseif(polygonType == FRONT)then
		table.insert(front,polygon);
	elseif(polygonType == BACK)then
		table.insert(back,polygon);
	elseif(polygonType == SPANNING)then
		local f = {};
		local b = {};
		local size = #polygon.vertices;
		for k = 0,size-1 do
			local i = k + 1;
			local j = math.mod(k+1,size) + 1;
			local ti = types[i];
			local tj = types[j];
			local vi = polygon.vertices[i]
			local vj = polygon.vertices[j];
			if(ti ~= BACK)then
				table.insert(f,vi);
			end
			if(ti ~= FRONT)then
				if(ti ~= BACK)then
					table.insert(b,vi:clone());
				else
					table.insert(b,vi);
				end
			end
			if(mathlib.bit.bor(ti, tj) == SPANNING)then
				local t = (self.w - self.normal:dot(vi.pos)) / self.normal:dot(vj.pos:minus(vi.pos));
				local v = vi:interpolate(vj, t);
				table.insert(f,v);
				table.insert(b,v:clone());
			end
		end
		if((#f) >= 3)then
			table.insert(front,CSGPolygon:new():init(f,polygon.shared));
		end
		if((#b) >= 3)then
			table.insert(back,CSGPolygon:new():init(b,polygon.shared));
		end
	end
end
