--[[
Title: CSG
Author(s): leio
Date: 2016/3/29
Desc: 
based on http://evanw.github.com/csg.js/
Holds a binary space partition tree representing a 3D solid. Two solids can
be combined using the `union()`, `subtract()`, and `intersect()` methods.
-------------------------------------------------------
NPL.load("(gl)script/ide/CSG/CSG.lua");
local CSG = commonlib.gettable("CSG.CSG");
-------------------------------------------------------
]]
NPL.load("(gl)script/ide/math/vector.lua");
NPL.load("(gl)script/ide/math/bit.lua");
NPL.load("(gl)script/ide/CSG/CSGVector.lua");
NPL.load("(gl)script/ide/CSG/CSGVertex.lua");
NPL.load("(gl)script/ide/CSG/CSGPlane.lua");
NPL.load("(gl)script/ide/CSG/CSGPolygon.lua");
NPL.load("(gl)script/ide/CSG/CSGNode.lua");

local vector3d = commonlib.gettable("mathlib.vector3d");
local CSGVector = commonlib.gettable("CSG.CSGVector");
local CSGVertex = commonlib.gettable("CSG.CSGVertex");
local CSGPlane = commonlib.gettable("CSG.CSGPlane");
local CSGPolygon = commonlib.gettable("CSG.CSGPolygon");
local CSGNode = commonlib.gettable("CSG.CSGNode");
local CSG = commonlib.inherit(nil, commonlib.gettable("CSG.CSG"));
function CSG:ctor()
	self.polygons = {};
end
--Construct a CSG solid from a list of `CSG.Polygon` instances.
function CSG.fromPolygons(polygons)
	local csg = CSG:new();
	csg.polygons = polygons;
	return csg;
end
function CSG:clone()
	local csg = CSG:new();
	local result = {};
	for k,p in ipairs(self.polygons) do
		table.insert(result,p:clone());
	end
	csg.polygons = result;
	return csg;
end
function CSG:toPolygons()
	return self.polygons;
end
-- Return a new CSG solid representing space in either this solid or in the
-- solid `csg`. Neither this solid nor the solid `csg` are modified.
-- 
--     A.union(B)
-- 
--     +-------+            +-------+
--     |       |            |       |
--     |   A   |            |       |
--     |    +--+----+   =   |       +----+
--     +----+--+    |       +----+       |
--          |   B   |            |       |
--          |       |            |       |
--          +-------+            +-------+
-- 
function CSG:union(csg)
	local a = CSGNode:new():init(self:clone().polygons);
	local b = CSGNode:new():init(csg:clone().polygons);
	a:clipTo(b);
    b:clipTo(a);
    b:invert();
    b:clipTo(a);
    b:invert();
    a:build(b:allPolygons());
	return CSG.fromPolygons(a:allPolygons());
end
-- Return a new CSG solid representing space in this solid but not in the
-- solid `csg`. Neither this solid nor the solid `csg` are modified.
-- 
--     A.subtract(B)
-- 
--     +-------+            +-------+
--     |       |            |       |
--     |   A   |            |       |
--     |    +--+----+   =   |    +--+
--     +----+--+    |       +----+
--          |   B   |
--          |       |
--          +-------+
-- 
function CSG:subtract(csg)
	local a = CSGNode:new():init(self:clone().polygons);
	local b = CSGNode:new():init(csg:clone().polygons);
	a:invert();
    a:clipTo(b);
    b:clipTo(a);
    b:invert();
    b:clipTo(a);
    b:invert();
    a:build(b:allPolygons());
    a:invert();
    return CSG.fromPolygons(a:allPolygons());
end
-- Return a new CSG solid representing space both this solid and in the
-- solid `csg`. Neither this solid nor the solid `csg` are modified.
-- 
--     A.intersect(B)
-- 
--     +-------+
--     |       |
--     |   A   |
--     |    +--+----+   =   +--+
--     +----+--+    |       +--+
--          |   B   |
--          |       |
--          +-------+
-- 
function CSG:intersect(csg)
	local a = CSGNode:new():init(self:clone().polygons);
	local b = CSGNode:new():init(csg:clone().polygons);
	a:invert();
    b:clipTo(a);
    b:invert();
    a:clipTo(b);
    b:clipTo(a);
    a:build(b:allPolygons());
    a:invert();
    return CSG.fromPolygons(a:allPolygons());
end
--Return a new CSG solid with solid and empty space switched. This solid is not modified.
function CSG:inverse()
	local csg = self:clone();
	local k,p;
	for k,p in ipairs(self.polygons) do
		p:flip();
	end
	return csg;
end
function CSG.cube(options)
	options = options or {};
	local c = CSGVector:new():init(options.center or {0,0,0});
	local r = options.radius or {1,1,1};
	if(type(r) == "number")then
		r = {r,r,r};
	end
	r = CSGVector:new():init(r);
	local polygons = {};
	local data = {
		{{0, 4, 6, 2}, {-1, 0, 0}},
		{{1, 3, 7, 5}, {1, 0, 0}},
		{{0, 1, 5, 4}, {0, -1, 0}},
		{{2, 6, 7, 3}, {0, 1, 0}},
		{{0, 2, 3, 1}, {0, 0, -1}},
		{{4, 5, 7, 6}, {0, 0, 1}}
	};
	local function tmp(a,b)
		local value = mathlib.bit.band(a, b);
		if(value ~= 0)then
			return 1
		else
			return 0
		end
	end
	for k,info in ipairs(data) do
		local normal = CSGVector:new():init(info[2]);
		local vertices = {};
		for kk,vv in ipairs(info[1]) do
			local x = c.x + r.x * (2 * (tmp(vv, 1)) - 1);
			local y = c.y + r.y * (2 * (tmp(vv, 2)) - 1);
			local z = c.z + r.z * (2 * (tmp(vv, 4)) - 1);

			local pos = CSGVector:new():init(x,y,z);
			local vertex = CSGVertex:new():init(pos,normal);
			table.insert(vertices,vertex);
		end
		local polygon = CSGPolygon:new():init(vertices);
		table.insert(polygons,polygon);
	end
	
	return CSG.fromPolygons(polygons)
end
function CSG.sphere(options)
	options = options or {};
	local c = CSGVector:new():init(options.center or {0,0,0});
	local r = options.radius or 1;
	local slices = options.slices or 16;
	local stacks = options.stacks or 8;
	local polygons = {};
	local vertices;
	local function vertex(theta, phi) 
		theta = theta * math.pi * 2;
		phi = phi * math.pi;
		local dir = CSGVector:new():init(
		  math.cos(theta) * math.sin(phi),
		  math.cos(phi),
		  math.sin(theta) * math.sin(phi)
		);
		table.insert(vertices,CSGVertex:new():init(c:plus(dir:times(r)), dir));
	end
	local i;
	local j;
	for i=0,slices-1 do
		for j=0,stacks-1 do
			vertices = {};
			vertex(i / slices, j / stacks);
			if (j > 0) then
				vertex((i + 1) / slices, j / stacks);
			end
			if (j < stacks - 1) then
				vertex((i + 1) / slices, (j + 1) / stacks);
			end
			vertex(i / slices, (j + 1) / stacks);
			table.insert(polygons,CSGPolygon:new():init(vertices));
		end
	end
	return CSG.fromPolygons(polygons);
end
function CSG.cylinder(options)
	options = options or {};
	local s = CSGVector:new():init(options["from"] or {0,-1,0});
	local e = CSGVector:new():init(options["to"] or {0,1,0});
	local ray = e:minus(s);
	local r = options.radius or 1;
	local slices = options.slices or 16;
	local axisZ = ray:unit()
	local isY = (math.abs(axisZ.y) > 0.5);
	local isY_v1;
	local isY_v2;
	if(isY)then
		isY_v1 = 1;
		isY_v2 = 0;
	else
		isY_v1 = 0;
		isY_v2 = 1;
	end
	local axisX = CSGVector:new():init(isY_v1, isY_v2, 0):cross(axisZ):unit();
	local axisY = axisX:cross(axisZ):unit();
	local start_value = CSGVertex:new():init(s, axisZ:negated());
	local end_value = CSGVertex:new():init(e, axisZ:unit());
	local polygons = {};
	function point(stack, slice, normalBlend)
		local angle = slice * math.pi * 2;
		local out = axisX:times(math.cos(angle)):plus(axisY:times(math.sin(angle)));
		local pos = s:plus(ray:times(stack)):plus(out:times(r));
		local normal = out:times(1 - math.abs(normalBlend)):plus(axisZ:times(normalBlend));
		return CSGVertex:new():init(pos, normal);
	end
	local i;
	for i = 0,slices-1 do
		local t0 = i / slices;
		local t1 = (i + 1) / slices;
		table.insert(polygons,CSGPolygon:new():init({start_value:clone(), point(0, t0, -1), point(0, t1, -1)}));
		table.insert(polygons,CSGPolygon:new():init({point(0, t1, 0), point(0, t0, 0), point(1, t0, 0), point(1, t1, 0)}));
		table.insert(polygons,CSGPolygon:new():init({end_value:clone(), point(1, t1, 1), point(1, t0, 1)}));
	end
  return CSG.fromPolygons(polygons);
end
function CSG.toMesh(csg,r,g,b)
	if(not csg)then return end
	local vertices = {};
	local indices = {};
	local normals = {};
	local colors = {};
	for __,polygon in ipairs(csg.polygons) do
		local start_index = #vertices+1;
		for __,vertex in ipairs(polygon.vertices) do
			table.insert(vertices,{vertex.pos.x,vertex.pos.y,vertex.pos.z});
			table.insert(normals,{vertex.normal.x,vertex.normal.y,vertex.normal.z});
			table.insert(colors,{r,g,b});
		end
		local size = #(polygon.vertices) - 1;
		for i = 2,size do
			table.insert(indices,start_index);
			table.insert(indices,start_index + i-1);
			table.insert(indices,start_index + i);
		end
	end
	return vertices,indices,normals,colors;
end
function CSG.saveAsSTL(csg,output_file_name)
	if(not csg)then return end
	ParaIO.CreateDirectory(output_file_name);
	local function write_face(file,vertex_1,vertex_2,vertex_3)
		local a = vertex_3 - vertex_1;
		local b = vertex_3 - vertex_2;
		local normal = a*b;
		normal:normalize();
		if(isYUp) then
			file:WriteString(string.format(" facet normal %f %f %f\n", normal[1], normal[2], normal[3]));
			file:WriteString(string.format("  outer loop\n"));
			file:WriteString(string.format("  vertex %f %f %f\n", vertex_1[1], vertex_1[2], vertex_1[3]));
			file:WriteString(string.format("  vertex %f %f %f\n", vertex_2[1], vertex_2[2], vertex_2[3]));
			file:WriteString(string.format("  vertex %f %f %f\n", vertex_3[1], vertex_3[2], vertex_3[3]));
		else
			-- invert y,z and change the triangle winding
			file:WriteString(string.format(" facet normal %f %f %f\n", normal[1], normal[3], normal[2]));
			file:WriteString(string.format("  outer loop\n"));
			file:WriteString(string.format("  vertex %f %f %f\n", vertex_1[1], vertex_1[3], vertex_1[2]));
			file:WriteString(string.format("  vertex %f %f %f\n", vertex_3[1], vertex_3[3], vertex_3[2]));
			file:WriteString(string.format("  vertex %f %f %f\n", vertex_2[1], vertex_2[3], vertex_2[2]));
		end
		file:WriteString(string.format("  endloop\n"));
		file:WriteString(string.format(" endfacet\n"));
	end
	local file = ParaIO.open(output_file_name, "w");
	if(file:IsValid()) then
		local name = "ParaEngine";
		file:WriteString(string.format("solid %s\n",name));

		local vertices,indices,normals,colors = CSG.toMesh(csg);
		local size = #indices;
		local k;
		for k = 1,size do
			local t = math.mod(k,3);
			if(t == 0)then
				local v1 = vertices[indices[k-2]];    
				local v2 = vertices[indices[k-1]];  
				local v3 = vertices[indices[k]];  
				if(v1 and v2 and v3)then
					write_face(file,vector3d:new(v1[1],v1[2],v1[3]),vector3d:new(v2[1],v2[2],v2[3]),vector3d:new(v3[1],v3[2],v3[3]));
				end
			end
		end
		file:WriteString(string.format("endsolid %s\n",name));
		file:close();
		return true;
	end
end