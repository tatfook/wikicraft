--[[
Title: fetch url
Author(s): LiXizhi
Date: 2016/1/25
Desc: helper class to get url content. It offers no progress function. 
For large files with progress, please use NPL.AsyncDownload. 
However, this function can be useful to get URL headers only for large HTTP files. 
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/ide/System/os/GetUrl.lua");
-- get headers only with "-I" option. 
System.os.GetUrl("https://github.com/LiXizhi/HourOfCode/archive/master.zip", function(err, msg, data)  echo(msg) end, "-I");
System.os.GetUrl("https://github.com/LiXizhi/HourOfCode/archive/master.zip", echo);
System.os.GetUrl({url = string, json = true, form = {key=value, } }, function(err, msg, data)		echo(data)	end);
------------------------------------------------------------
]]
NPL.load("(gl)script/ide/Json.lua");
local os = commonlib.gettable("System.os");

local npl_thread_name = __rts__:GetName();
if(npl_thread_name == "main") then
	npl_thread_name = "";
end

local function GetUrlSync(url)
	local c = cURL.easy_init()
	local result;
	-- setup url
	c:setopt_url(url)
	-- perform, invokes callbacks
	c:perform({writefunction = function(str) 
			if(result) then
				result = result..str;
			else
				result = str;
			end	
			end})
	return result;
end

----------------------------------------
-- url request 
----------------------------------------
local requests = {};
local Request = commonlib.inherit(nil, {});

local id = 0;

function Request:init(options, callbackFunc)
	id = (id + 1)%100;
	self.id = id;
	self.options = options;
	if(options.json) then
		self:SetHeader('content-type', 'application/json');
	end
	if(options.qs) then
		options.url = NPL.EncodeURLQuery(options.url, options.qs);
	end
	self.callbackFunc = callbackFunc;
	self.url = options.url or "";
	requests[self.id] = self;
	return self;
end

-- @param value: if nil, key is added as a headerline.
function Request:SetHeader(key, value)
	local headers = self.options.headers; 
	if(not headers) then
		headers = {};
		self.options.headers = headers;
	end
	if(value) then
		headers[key] = value;
	else
		headers[#headers+1] = key;
	end
end

function Request:SetResponse(msg)
	self.response = msg;
	if(msg and msg.data) then
		if(self.options.json and msg.header) then
			if(type(msg.data) == "string") then
				msg.data = commonlib.Json.Decode(msg.data) or msg.data;
			end
		end
	end
end

function Request:InvokeCallback()
	if(self.response and self.callbackFunc) then
		self.callbackFunc(self.response.rcode, self.response, self.response.data);
	end
end

----------------------------------
-- os function
----------------------------------
function CallbackURLRequest__(id)
	local request = requests[id];
	if(request) then
		if(request.id == id) then
			request:SetResponse(msg);
			request:InvokeCallback();
		end
		requests[id] = nil;
	end
end

local function GetUrlOptions(url, option)
	local options;
	if(type(url) == "table") then
		options = url;
		url = options.url;
	else
		options = {};
	end
	if(option) then
		url = option.." "..url;
	end
	options.url = url;
	return options;
end

-- return the content of a given url. 
-- e.g.  echo(NPL.GetURL("www.paraengine.com"))
-- @param url: url string or a options table of {url=string, form={key=value}, headers={key=value, "line strings"}, json=bool, qs={}}
-- if .json is true, code will be decoded as json.
-- if .qs is query string table
-- @param callbackFunc: a function(err, msg, data) end, 
--  where msg is the raw HTTP message {header, code=0, rcode=200, data}
--  if nil, the function will not return until result is returned(sync call).
-- @param option: mostly nil. "-I" for headers only
-- @return: return nil if callbackFunc is a function. or the string content in sync call. 
function os.GetUrl(url, callbackFunc, option)
	local options = GetUrlOptions(url, option);

	if(not callbackFunc) then
		-- NOT recommended
		return GetUrlSync(options.url);
	end
	
	local req = Request:new():init(options, callbackFunc);

	-- async call. 
	NPL.AppendURLRequest(options, format("(%s)CallbackURLRequest__(%d)", npl_thread_name, req.id), nil, "r");
end