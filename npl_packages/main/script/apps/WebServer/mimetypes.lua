--[[
Title: mimetypes
Author: LiXizhi
Date: 2015/6/12
Desc: 
-----------------------------------------------
NPL.load("(gl)script/apps/WebServer/mimetypes.lua");
local mimetypes = commonlib.gettable("WebServer.mimetypes");
mimetypes:guess_type("*.html");
-----------------------------------------------
]]

local mimetypes = commonlib.gettable("WebServer.mimetypes");

mimetypes.types_map = {
	["html"] = "text/html",
	["htm"] = "text/html",
	["page"] = "text/html",
	["lua"] = "text/html",
	["css"] = "text/css",
	["js"] = "application/javascript",
	["woff"] = "application/octet-stream",
	["woff2"] = "application/octet-stream",
	["ttf"] = "application/octet-stream",
};

-- gets the mimetype from the filename's extension
-- @param path: filepath 
function mimetypes:guess_type(path, bStrict)
	local extension = string.match (path, "%.([^.]*)$")
	if extension then
		return self.types_map[extension];
	else
		return nil
	end
end
