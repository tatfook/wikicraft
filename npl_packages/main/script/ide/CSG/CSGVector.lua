--[[
Title: CSGVector
Author(s): leio
Date: 2016/3/29
Desc: 
Represents a plane in 3D space.
-------------------------------------------------------
NPL.load("(gl)script/ide/CSG/CSGVector.lua");
local CSGVector = commonlib.gettable("CSG.CSGVector");

local v1 = CSGVector:new():init(1,1,1);
local v2 = CSGVector:new():init(2,2,2);
echo(v1:plus(v2));
echo(v1:minus(v2));
-------------------------------------------------------
]]
local CSGVector = commonlib.inherit(nil, commonlib.gettable("CSG.CSGVector"));
function CSGVector:ctor()
	self.x = 0;
	self.y = 0;
	self.z = 0;
end
function CSGVector:init(x,y,z)
	if y == nil then
        self.x = x[1]
        self.y = x[2]
        self.z = x[3]        
    else
        self.x = x
        self.y = y
        self.z = z
    end
	return self;
end
function CSGVector:clone()
	return CSGVector:new():init(self.x,self.y,self.z);
end
function CSGVector:negated()
	return CSGVector:new():init(-self.x,-self.y,-self.z);
end
function CSGVector:plus(a)
	return CSGVector:new():init(self.x + a.x,self.y + a.y,self.z + a.z);
end
function CSGVector:minus(a)
	return CSGVector:new():init(self.x - a.x,self.y - a.y,self.z - a.z);
end
function CSGVector:times(a)
	return CSGVector:new():init(self.x * a,self.y * a,self.z * a);
end
function CSGVector:dividedBy(a)
	return CSGVector:new():init(self.x / a,self.y / a,self.z / a);
end
function CSGVector:dot(a)
	return self.x * a.x + self.y * a.y + self.z * a.z;
end
function CSGVector:lerp(a,t)
	return self:plus(a:minus(self):times(t));
end
function CSGVector:length()
	return math.sqrt(self:dot(self));
end
function CSGVector:unit()
	return self:dividedBy(self:length());
end
function CSGVector:cross(a)
	return CSGVector:new():init( 
		self.y * a.z - self.z * a.y,
		self.z * a.x - self.x * a.z,
		self.x * a.y - self.y * a.x);
end