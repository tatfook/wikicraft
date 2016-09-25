--[[
Title: npl HTTP request
Author: LiXizhi
Date: 2015/6/8
Desc: 
Methods:
	request:get(name)    get/post param value
	request:getparams()
	request:url()
	request:getpeername()   ip address
	request:get_cookie(name)
	request:GetNid()
	request:discard()
	request:GetHost()
	request:GetMethod()
-----------------------------------------------
NPL.load("(gl)script/apps/WebServer/npl_request.lua");
local request = commonlib.gettable("WebServer.request");
-----------------------------------------------
]]
NPL.load("(gl)script/ide/Json.lua");
NPL.load("(gl)script/ide/LuaXML.lua");
NPL.load("(gl)script/apps/WebServer/npl_response.lua");
NPL.load("(gl)script/ide/socket/url.lua");
NPL.load("(gl)script/apps/WebServer/npl_util.lua");
local util = commonlib.gettable("WebServer.util");
local url = commonlib.gettable("commonlib.socket.url")
local response = commonlib.gettable("WebServer.response");

local tostring = tostring;
local lower = string.lower;
local type = type;

local request = commonlib.inherit(nil, commonlib.gettable("WebServer.request"));

-- command method
request.cmd_mth = "GET";
-- relative path
request.relpath = "";

-- whether to dump all incoming stream;
request.dump_stream = false;

function request:ctor()
	self.response = response:new():init(self);
end

-- get the response object. 
function request:GetResponse()
	return self.response;
end

-- get the nid where the request is from. 
function request:GetNid()
	return self.nid;
end

function request:errorEvent(msg)
    msg = tostring(msg)
	LOG.std(nil, "error", "npl_http", "NPLWebServer Error nid:%s: %s", tostring(self.nid), msg);
	self.response:send(string.format ([[
<html><head><title>NPL_http Error!</title></head>
<body>
<h1>NPL_http Error!</h1>
<p>%s</p>
</body></html>
]], string.gsub (msg, "\n", "<br/>\n")));
end

function request:tostring()
	return commonlib.serialize_compact(self.headers);
end

function request:redirect(d)
	self.headers ["Location"] = d
	self.statusline = "HTTP/1.1 302 Found"
	self.content = "redirect"
end

-- original request url
function request:url()
	return self.headers.url or self.relpath;
end

function request:parse_url()
	local def_url = string.format ("http://%s%s", self.headers.host or "", self.cmd_url or "")
	self.parsed_url = url.parse (def_url or '')
	self.parsed_url.port = self.parsed_url.port or 0
	self.built_url = url.build (self.parsed_url)
	self.relpath = url.unescape (self.parsed_url.path or '')
	--self.relpath = self.headers.url;
	--self.built_url = string.format ("http://%s%s", self.headers.host or "", self.headers.cmd_url or "")
end

-- headers actually is the raw message containing everything.
-- just incase one wants to clone the request and forward it to some other threads or network process. 
function request:GetMsg()
	return self.headers;
end

-- get url parameters: both url post/get are supported
-- return a table of name, value pairs
function request:getparams()
	if (not self.params) then 
		if(self.headers.body~="") then
			if(self:IsJsonBody()) then
				-- please note: this will overwrite parameters in url.
				self.params = commonlib.Json.Decode(self.headers.body) or self.params or {};
			else
				self.params = util.parse_str(self.headers.body, self.params);	
			end
		end
		if (self.parsed_url.query) then 
			self.params = util.parse_str(self.parsed_url.query, self.params);	
		end
		self.params = self.params or {};
	end
	return self.params;
end

function request:IsJsonBody()
	local contentType =self.headers["Content-Type"];
	if(contentType and contentType:match("^application/json")) then
		return true;
	end
end


-- get host name from header. usually checking for the http origin for cross-domain request or not. 
function request:GetHost()
	return self.headers.Host;
end

-- in headers  'GET', 'HEAD', 'POST', 'PUT', 'OPTIONS' etc
function request:GetMethod()
	return self.headers.method;
end

-- get the value of given header
-- @param name: "method", "Host", or any of other custom header fields
function request:header(name)
	return self.headers[name];
end

-- get a given url get/post param by name
-- @param name: if name is nil or 'json', we will return table object passed in from headers.body (json http post)
-- if you post data as json, you can also access json encoded html body directly with key name. 
function request:get(name)
	if(not name or name=="json") then
		return commonlib.Json.Decode(self.headers.body);
	else
		local params = self:getparams();
		if(params) then
			return params[name];
		end
	end
end

-- get ip address as string
function request:getpeername()
	self.ip = self.ip or NPL.GetIP(self.nid);
	return self.ip;
end

-- drop this request, so that nothing is sent to client at the moment. 
-- we use this function to delegate a request from one thread to another in npl script handler
function request:discard()
	self.response:discard();
end

-- send/route the request to another processor: possibly another npl file in another thread or another machine. 
function request:send(address)
	self:discard();
	local msg = self.headers;
	NPL.activate(address, self.headers);
	-- TODO: add cross machine routing, since nid will change.  
end

-- get cookies or a given cookie entry value by name
-- @param name: if nil, entire cookies table is returned. if string, only cookies value of the given name is returned. 
function request:get_cookie(name)
	if(not self.cookies) then
		self.cookies = {};
		if(self.headers.Cookie) then
			local cookies = string.gsub(";" .. (self.headers.Cookie) .. ";", "%s*;%s*", ";")
			setmetatable(self.cookies, { __index = function (tab, name)
				local pattern = ";" .. name .."=(.-);"
				local cookie = string.match(cookies, pattern)
				cookie = util.url_decode(cookie)
				rawset(tab, name, cookie)
				return cookie
			end})
		end
	end
	if(not name) then
		return self.cookies;
	else
		return self.cookies[name];
	end
end

-- clear all cookies in case of rpc request, etc. 
function request:clear_cookie()
	if(self.cookies) then
		self.cookies = {};
	end
	if(self.headers.Cookie) then
		self.headers.Cookie = nil;
	end
end

-- mapping from lower case to case-sensitive headers
local lowercase_headers = {
["connection"] = "Connection",
["accept-encoding"] = "Accept-Encoding",
["cache-control"] = "Cache-Control",
["if-modified-since"] = "If-Modified-Since",
["user-agent"] = "User-Agent",
["referer"] = "Referer",
["content-type"] = "Content-Type",
["method"] = "method",
["host"] = "Host",
}

-- from case insensitive to case sensitive. 
function request:NormalizeHeaders(headers)
	local values;
	for name, value in pairs(headers) do
		local rightName = lowercase_headers[lower(name)];
		if(rightName and rightName~=name) then
			values = values or {};
			values[name] = rightName;
		end
	end
	if(values) then
		for name, newName in pairs(values) do
			headers[newName] = headers[name];
			headers[name] = nil;
		end
	end
	return headers;
end

-- request can be reused by calling this function. 
-- the request object is returned if succeed.
function request:init(msg)
	if(msg) then
		if(self.dump_stream) then
			echo(msg);
		end
		self.nid = msg.tid or msg.nid;
		self.headers= self:NormalizeHeaders(msg);
		self.cmd_url = msg.url;
		self.cmd_mth = msg.method;
		self:parse_url();
		self.response:init(self);	
		return self;
	end
end
