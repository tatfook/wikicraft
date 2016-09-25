--[[
Title: more efficient class implementation with constructor
Author(s): LiXizhi, modified from http://lua-users.org/wiki/SimpleLuaClasses
Date: 2009/11/1
Desc: Implementation of class()

class() uses two tricks. It allows you to construct a class using the call notation (like Dog('fido') above) 
by giving the class itself a metatable which defines __call. It handles inheritance by copying the fields 
of the base class into the derived class. This isn't the only way of doing inheritance; we could make __index 
a function which explicitly tries to look a function up in the base class(es). But this method will give 
better performance, at a cost of making the class objects somewhat fatter. Each derived class does keep 
a field _base that contains the base class, but this is to implement is_a. 

Note1: that modification of a base class at runtime will not affect its subclasses. 
Note2: all functions are virtual
Note3: one must manually call base class init() function in its init function. 

Use Lib:
-------------------------------------------------------
NPL.load("(gl)script/ide/ObjectOriented/class.lua");

-- define a base class with constructor
local myBaseClass = commonlib.class(function(o)
	-- the constructor should initialize any dynamic table fields. 
	o = o or {};
	o.myTable = o.myTable or {name="myBaseClass"}
end)

function myBaseClass:__tostring()
  return commonlib.serialize(self.myTable);
end

local myDerivedClassA = commonlib.class(myBaseClass, {
	static_non_table_field = "default initializer", 
}, function(o)
	-- constructor should call base class 
	if(myBaseClass and myBaseClass.init) then myBaseClass.init(o); end	
	o.myTable.nameA = "A";
end)

local myDerivedClassB = commonlib.class(myDerivedClassA, {
	static_non_table_field_B = "default initializer", 
})

-- we can alternatively define constructor function as init() at a later time. 
function myDerivedClassB:init()
	-- constructor should call base class 
	if(myDerivedClassA and myDerivedClassA.init) then myDerivedClassA.init(self); end	
	self.myTable.nameB = "B";
end


local myB = myDerivedClassB();
myB.myTable.nameA = "A modified by B";
commonlib.echo(tostring(myB))
commonlib.echo(tostring(myDerivedClassA()))
commonlib.echo(tostring(myDerivedClassB()))

-------------------------------------------------------
]]

if(not commonlib) then commonlib={}; end

-- create a class with a constructor function 
-- @param base: the base class table. 
-- @param new_class: new class table. We usually define static and default non-table fields in it. 
-- @param ctor: the constructor function. it can also be defined later as new_class:init(), usually it can be set to call the init of its base class as well. 
function commonlib.class(base,new_class,ctor)
	-- a new class instance
	local c = new_class or {}     
	if not ctor and type(base) == 'function' then
		ctor = base
		base = nil
	elseif type(base) == 'table' then
		-- our new class is a shallow copy of the base class!
		for i,v in pairs(base) do
		  c[i] = v
		end
		c._base = base
	end
	-- the class will be the metatable for all its objects,
	-- and they will look up their methods in it.
	c.__index = c

	-- expose a ctor which can be called by <classname>(<args>)
	local mt = {}
	mt.__call = function(class_tbl,...)
		local obj = {}
		setmetatable(obj,c)
		if class_tbl.init then
			class_tbl.init(obj,...)
		else 
			-- make sure that any stuff from the base class is initialized!
			if base and base.init then
				base.init(obj,...)
			end
		end
		return obj
	end
	c.init = ctor
	c.is_a = function(self,klass)
		local m = getmetatable(self)
		while m do 
			if m == klass then return true end
			m = m._base
		end
		return false
	end
	setmetatable(c,mt)
	return c
end
