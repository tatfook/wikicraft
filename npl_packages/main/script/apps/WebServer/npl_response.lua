--[[
Title: npl HTTP response
Author: LiXizhi
Date: 2015/6/8
Desc: 
-----------------------------------------------
NPL.load("(gl)script/apps/WebServer/npl_response.lua");
local response = commonlib.gettable("WebServer.response");
response:status(200):send({message="json message"});
response:sendsome();
response:send_xml();
response:send_json();
response:set_header(h, v);
response:SetReturnCode("forbidden");  -- one of the status_strings keys
response:Begin();
response:End();
-----------------------------------------------
]]
NPL.load("(gl)script/apps/WebServer/npl_util.lua");
NPL.load("(gl)script/apps/WebServer/npl_http.lua");
local npl_http = commonlib.gettable("WebServer.npl_http");
local util = commonlib.gettable("WebServer.util");
local tostring = tostring;
local type = type;
local date = os.date;

local response = commonlib.inherit(nil, commonlib.gettable("WebServer.response"));


local status_strings = {
	ok ="HTTP/1.1 200 OK",
	created ="HTTP/1.1 201 Created",
	accepted ="HTTP/1.1 202 Accepted",
	no_content = "HTTP/1.1 204 No Content",
	multiple_choices = "HTTP/1.1 300 Multiple Choices",
	moved_permanently = "HTTP/1.1 301 Moved Permanently",
	moved_temporarily = "HTTP/1.1 302 Moved Temporarily",
	not_modified = "HTTP/1.1 304 Not Modified",
	bad_request = "HTTP/1.1 400 Bad Request",
	unauthorized = "HTTP/1.1 401 Unauthorized",
	forbidden = "HTTP/1.1 403 Forbidden",
	not_found = "HTTP/1.1 404 Not Found",
	conflict = "HTTP/1.1 409 Conflict",
	internal_server_error = "HTTP/1.1 500 Internal Server Error",
	not_implemented = "HTTP/1.1 501 Not Implemented",
	bad_gateway = "HTTP/1.1 502 Bad Gateway",
	service_unavailable = "HTTP/1.1 503 Service Unavailable",
};

-- default status line
response.statusline = status_strings.ok;
-- table of name, value pairs
response.headers = nil;
-- forcing text context
response.content = nil;

function response:ctor()
	self.headers = {};
end

-- response can be reused by calling this function. 
function response:init(req)
	self.req = req;
	-- reset send buffer
	self.buffer = nil;
	return self;
end

-- make a xml rpc response
-- @param xml: xml/html root node or text. 
-- @param return_code: nil if default to "ok"(200)
function response:send_xml(xml, return_code, headers)
	self:SetReturnCode(return_code);
	self.headers = headers or self.headers;

	if(type(xml) == "table") then
		self:sendsome([[<?xml version="1.0" encoding="utf-8"?>]]);
		self:sendsome(commonlib.Lua2XmlString(xml));
	else
		self.content = xml;
	end
	self:finish();	self:End();
end

-- make a json response
-- @param return_code: nil if default to "ok"(200)
function response:send_json(json, return_code, headers)
	self:set_header('Content-Type', 'application/json');
	if(type(json) == "table") then
		json = commonlib.Json.Encode(json)
	end
	self:SetReturnCode(return_code);
	self.headers = headers or self.headers;
	self.content = json;
	self:finish();	self:End();
end

function response:SetReturnCode(return_code)
	self.statusline = status_strings[return_code or "ok"] or status_strings["not_found"];
	return self;
end

-- Set the headers to prevent caching for the different browsers.
-- Different browsers support different nocache headers, so several
-- headers must be sent so that all of them get the point that no
-- caching should occur.
function response:nocache_headers()
	self:set_header("Expires", 'Wed, 11 Jan 1984 05:00:00 GMT');
	self:set_header("Cache-Control", 'no-cache, must-revalidate, max-age=0');
	self:set_header("Pragma", 'no-cache');
	self:set_header('Last-Modified', nil);
end

-- it will replace value
function response:set_header(h, v)
	if(not h) then
		return 
	end
	self.headers[h] = v;
end

-- there can be duplicated names 
function response:add_header(h, v)
	if(not h) then
		return 
	end
    if string.lower(h) == "status" then
        self.statusline = "HTTP/1.1 "..v
    else
        local prevval = self.headers[h]
        if (prevval  == nil) then
            self.headers[h] = v
        elseif type(prevval) == "table" then
            table.insert(prevval, v)
        else
            self.headers[h] = {prevval, v}
        end
    end
	return self;
end


-- if one calls SetContent instead of send(), any previously buffered send text will be ignored. 
function response:SetContent(text)
	self.content = text;
	return self;
end

-- send response and finish the request now. 
-- @param bUseEmptyArray: by default, empty table is serialized to json as object {}. 
-- calling this function will be serialized to json as array[]
-- @param pure HTML text or json table
function response:send(text, bUseEmptyArray)
	if(type(text) == "table") then
		self:set_header('Content-Type', 'application/json');
		self:SetContent(nil); -- discard any previous text
		text = commonlib.Json.Encode(text, bUseEmptyArray);
	end
	self:sendsome(text);
	self:finish();	self:End();
end

-- set return code and return response object.
function response:status(code)
	if(type(code) == "number") then
		self.statusline = "HTTP/1.1 "..tostring(code);
	else
		self:SetReturnCode(code);
	end
	return self;
end

-- cache string and send it until finish() is called.
-- it is optimized to call send() many times during a single request. 
-- @param text: string or a table of text lines. 
function response:sendsome(text)
	if(type(text) == "string") then
		local content = self.content;
		if(not content) then
			content = {};
			self.content = content;
		elseif(type(content) == "string") then
			self.content = {self.content};
			content = self.content;
		end
		content[#content + 1] = text;
	elseif(type(text) == "table") then
		local content = self.content;
		if(not content) then
			content = text;
			self.content = content;
		else
			if(type(content) == "string") then
				self.content = {self.content};
				content = self.content;
			end
			for i = 1, #text do
				content[#content + 1] = text[i];
			end
		end
	end
end

local plainTextTypes = {
["application/javascript"] = true,
["application/json"] = true,
["text/css"] = true,
["text/html; charset=utf-8"] = true,
};

function response:isContentTypePlainText(contentType)
	return contentType and (plainTextTypes[contentType] or contentType:match("^text"));
end
-- sends prebuilt content to the client
-- 		if possible, sets Content-Length: header field
-- uses:
--		self.content : content data to send
-- sets:
--		self.keep_alive : if possible to keep using the same connection
function response:send_response()
	if(self.req:GetMethod() == "HEAD") then
		self.content = "";
	else
		if(not self.content and self.buffer) then
			self.content = table.concat(self.buffer);
		end	
	end
	
	if self.content then
		if not self.sent_headers then
			if (type(self.content) == "table" and not self.chunked) then
				self.content = table.concat(self.content)
			end
			if type(self.content) == "string" then
				self.headers["Content-Length"] = #(self.content)
			end
		end
	else
		if not self.sent_headers then
			self.statusline = "HTTP/1.1 204 No Content"
			self.headers["Content-Length"] = 0
		end
	end
	
    if self.chunked then
        self:add_header("Transfer-Encoding", "chunked")
    end
    
	for h,v in pairs(npl_http.GetCommonHeaders()) do
		self:set_header(h, v);
	end

	if self.chunked or ((self.headers["Content-Length"] and self.req.headers["Connection"])) then
		self:set_header("Connection", "keep-alive");
		self.keep_alive = true
	else
		self.keep_alive = nil
	end
	
	if self.content then
		if type(self.content) == "table" then
			for _, v in ipairs(self.content) do 
				self:send_data(v) 
			end
		else
			-- compress if content-type is text-based 
			if (not self.sent_headers and NPL.Compress) then
				local minCompressSize = npl_http.GetCompressionThreshold();
				local cSize = self.headers["Content-Length"];
				if(cSize and cSize > minCompressSize and not self.headers["Content-Encoding"]) then
					if(self:isContentTypePlainText(self.headers["Content-Type"])) then
						local acceptEncoding = self.req.headers["Accept-Encoding"];
						if(acceptEncoding and acceptEncoding:match("gzip")) then
							local dataIO = {content=self.content, method="gzip"};
							if(NPL.Compress(dataIO)) then
								self.headers["Content-Encoding"] = "gzip";
								self.content = dataIO.result;
								self.headers["Content-Length"] = #(self.content);
							end
						end
					end
				end
			end

			self:send_data(self.content)
		end
	else
		self:send_headers()
	end
	
	if self.chunked then
		self.sendInternal("0\r\n\r\n")
	end

	if(not self.keep_alive) then
		self:CloseAfterSend();
	end

	-- test non-keep alive. 
	--if(not self.chunked and self.headers["Content-Length"]) then
		--self:CloseAfterSend();
	--end
end

-- sends the response headers directly to client 
-- uses:
--		self.sent_headers : if true, headers are already sent, does nothing
--		self.statusline : response status, if nil, sends 200 OK
--		self.headers : table of header fields to send
function response:send_headers()
	if (self.sent_headers) then
		return
	end
	
	local out = {};
	out[#out+1] = self.statusline;
	out[#out+1] = "\r\n";
	if(self.headers) then
		for name, value in pairs(self.headers) do
			if(type(value) == "table") then
				-- mostly for Set-Cookie
				for i=1, #value do
					out[#out+1] = format("%s: %s\r\n", name, value[i]);
				end
			else
				out[#out+1] = format("%s: %s\r\n", name, value);
			end
		end
	end
	out[#out+1] = "\r\n";
	self:sendInternal(table.concat(out));

	self.sent_headers = true;
end

-- sends content directly to client. sends headers first, if not
-- @param data : content data to send
function response:send_data(data)
	if (not self.sent_headers) then
		self:send_headers(res);
	end

	if (not data or data == "") then
		return
	end

	if data then
		if self.chunked then
			self.sendInternal(string.format("%X\r\n", #(data)));
			self.sendInternal(data);
			self.sendInternal("\r\n");
		else
			self:sendInternal(data);
		end
	end
end

local function optional(what, name)
	if name ~= nil and name ~= "" then
		return format("; %s=%s", what, name)
	else
		return ""
	end
end

local function make_cookie(name, value)
	local options = {}
	if type(value) == "table" then
		options = value
		value = value.value
	end
	local cookie = name .. "=" .. util.url_encode(value)
	if options.expires then
		local t = date("!%A, %d-%b-%Y %H:%M:%S GMT", options.expires)
		cookie = cookie .. optional("expires", t)
	end
	cookie = cookie .. optional("path", options.path)
	cookie = cookie .. optional("domain", options.domain)
	cookie = cookie .. optional("secure", options.secure)
	return cookie
end

function response:set_cookie(name, value)
	local cookie = self.headers["Set-Cookie"]
	if type(cookie) == "table" then
		table.insert(self.headers["Set-Cookie"], make_cookie(name, value))
	elseif type(cookie) == "string" then
		self.headers["Set-Cookie"] = { cookie, make_cookie(name, value) }
	else
		self.headers["Set-Cookie"] = make_cookie(name, value)
	end
end

function response:redirect(path)
	-- TODO:
end

function response:delete_cookie(name, path)
	self:set_cookie(name, { value =  "xxx", expires = 1, path = path })
end

-- drop this request, so that nothing is sent to client at the moment. 
-- we use this function to delegate a request from one thread to another in npl script handler
function response:discard()
	self:SetFinished();
end

-- set on finished callback
function response:SetOnFinished(callbackFunc)
	self.onFinished = callbackFunc;
end

-- call this to actually make this request finished.  It will invoke OnFinished callback. 
function response:SetFinished()
	self.finished = true;
	if(self.onFinished) then
		self.onFinished(self);
	end
end

-- call this function to actually send cached response to client.
-- this function is automatically called when page handler is finished. 
-- Please note, calling finish() between Begin() and End() has no effect. 
function response:finish()
	if(not self.finished and not self.is_begin) then
		self:send_response();
		self:SetFinished();
	end
end

-- we will enter asynchronous mode, and the response is sent when self:End() is called. 
-- Please note, it is up to you, to call End() function. Forgetting doing so, the client will no longer receive any response from current connection. 
-- For example, in the page handler, we may wait for another async http call, before calling End().
function response:Begin()
	self.is_begin = true;
end

-- finish and send the asynchronous response. 
-- @param bIgnoreFinish: if true, we will not call finish to send the actual response. default to nil.
function response:End(bIgnoreFinish)
	if(self.is_begin) then
		self.is_begin = false;
		if(not bIgnoreFinish) then
			self:finish();
		end
	end
end

function response:GetNid()
	return self.req.nid;
end

function response:GetAddress()
	-- if file name is "http",  the message body is raw http stream
	if(not self.addr) then
		self.addr = format("%s:http", self.req.nid);
	end
	return self.addr;
end

function response:CloseAfterSend()
	NPL.reject({nid = self.req.nid, reason = -1});
end

-- private: 
function response:sendInternal(text)
	return NPL.activate(self:GetAddress(), text);
end
