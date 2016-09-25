--[[
Title: test csg operation
Author(s): leio
Date: 2016/3/29
Desc: 
-------------------------------------------------------
NPL.load("(gl)script/ide/CSG/test/csg_test.lua");
local csg_test = commonlib.gettable("CSG.csg_test");
csg_test.test()
-------------------------------------------------------
]]
NPL.load("(gl)script/ide/CSG/CSG.lua");
local CSG = commonlib.gettable("CSG.CSG");

local csg_test = commonlib.gettable("CSG.csg_test");

local cube_center = {0,1,0};
local cube_radius = {10,2,1};

local sphere_center = {0,0,0};
local sphere_radius = 4;
local sphere_slices = 16;
local sphere_stacks = 8;

local cylinder_from = {0,-1,0};
local cylinder_to = {0,1,0};
local cylinder_radius = 10;
local cylinder_slices = 16;

local cube_options = {
	center = cube_center,
	radius = cube_radius,
}
local sphere_options = {
	center = sphere_center,
	radius = sphere_radius,
	slices = sphere_slices,
	stacks = sphere_stacks,
}
local cylinder_options = {
	from = cylinder_from,
	to = cylinder_to,
	radius = cylinder_radius,
	slices = cylinder_slices,
}
function csg_test.test()
	local cube = CSG.cube(cube_options);
	local sphere = CSG.sphere(sphere_options);
	local cylinder = CSG.cylinder(cylinder_options);

	CSG.saveAsSTL(cube,"test/cube.stl")
	CSG.saveAsSTL(sphere,"test/sphere.stl")
	CSG.saveAsSTL(cylinder,"test/cylinder.stl")

	CSG.saveAsSTL(cube:union(sphere),"test/cube_union_sphere.stl")
	CSG.saveAsSTL(cube:subtract(sphere),"test/cube_subtract_sphere.stl")
	CSG.saveAsSTL(cube:intersect(sphere),"test/cube_intersect_sphere.stl")

	CSG.saveAsSTL(cube:union(cylinder),"test/cube_union_cylinder.stl")
	CSG.saveAsSTL(cube:subtract(cylinder),"test/cube_subtract_cylinder.stl")
	CSG.saveAsSTL(cube:intersect(cylinder),"test/cube_intersect_cylinder.stl")

	CSG.saveAsSTL(sphere:union(cube),"test/sphere_union_cube.stl")
	CSG.saveAsSTL(sphere:subtract(cube),"test/sphere_subtract_cube.stl")
	CSG.saveAsSTL(sphere:intersect(cube),"test/sphere_intersect_cube.stl")

	CSG.saveAsSTL(sphere:union(cylinder),"test/sphere_union_cylinder.stl")
	CSG.saveAsSTL(sphere:subtract(cylinder),"test/sphere_subtract_cylinder.stl")
	CSG.saveAsSTL(sphere:intersect(cylinder),"test/sphere_intersect_cylinder.stl")

	CSG.saveAsSTL(cylinder:union(cube),"test/cylinder_union_cube.stl")
	CSG.saveAsSTL(cylinder:subtract(cube),"test/cylinder_subtract_cube.stl")
	CSG.saveAsSTL(cylinder:intersect(cube),"test/cylinder_intersect_cube.stl")

	CSG.saveAsSTL(cylinder:union(sphere),"test/cylinder_union_sphere.stl")
	CSG.saveAsSTL(cylinder:subtract(sphere),"test/cylinder_subtract_sphere.stl")
	CSG.saveAsSTL(cylinder:intersect(sphere),"test/cylinder_intersect_sphere.stl")
end