--[[
Title: file handler
Author: LiXizhi
Date: 2015/6/8
Desc: disk file is served first, then files in zip/pkg. 
by default, all static files are served asynchrnously in a separate thread and cached in memory. 
if file is over 12KB, it will be compressed if its mimetype is plain text. 
-----------------------------------------------
NPL.load("(gl)script/apps/WebServer/npl_file_handler.lua");

```
<!--filehandler example, base dir is where the root file directory is. 
@param %CD%:  means current file's directory, 
@param nocache: boolean, whether to disable static file caching on server. by default, cache is always enabled for static files. 
-->
<rule match="." with="WebServer.filehandler" params='{baseDir = "%CD%" }'></rule>
```
-----------------------------------------------
]]
NPL.load("(gl)script/ide/commonlib.lua");
NPL.load("(gl)script/ide/Files.lua");
NPL.load("(gl)script/ide/socket/url.lua");
NPL.load("(gl)script/apps/WebServer/mimetypes.lua");
NPL.load("(gl)script/apps/WebServer/npl_request.lua");
NPL.load("(gl)script/apps/WebServer/npl_common_handlers.lua");
NPL.load("(gl)script/apps/WebServer/mem_cache.lua");
local mem_cache = commonlib.gettable("WebServer.mem_cache");
local common_handlers = commonlib.gettable("WebServer.common_handlers");
local request = commonlib.gettable("WebServer.request");
local mimetypes = commonlib.gettable("WebServer.mimetypes");
local url = commonlib.gettable("commonlib.socket.url")
local lfs = commonlib.Files.GetLuaFileSystem();
local WebServer = commonlib.gettable("WebServer");

local handlerThreadName = "wfh"; -- web file handler thread's npl thread name
local targetFile = string.format("(%s)%s", handlerThreadName, "script/apps/WebServer/npl_file_handler.lua");
local npl_thread_name = __rts__:GetName();
-- default to 12KB
local minCompressSize = 12000;
-- default to 10MB
local maxCachedFileSize = 10*1000000;

-----------------------------------------------------------------------------
-- NPL File handler
----------------------------------------------------------------------------
WebServer.encodings = WebServer.encodings or {}

-- gets the encoding from the filename's extension
local function encodingfrompath(path)
	local _,_,exten = string.find(path, "%.([^.]*)$")
	if exten then
		return WebServer.encodings[exten]
	else
		return nil
	end
end

local function in_base(path)
  local l = 0
  if path:sub(1, 1) ~= "/" then path = "/" .. path end
  for dir in path:gmatch("/([^/]+)") do
    if dir == ".." then
      l = l - 1
    elseif dir ~= "." then
      l = l + 1
    end
    if l < 0 then return false end
  end
  return true
end

-- we will compress it with gzip when its size is over this number of bytes.
local HTTPCompressionThreshold = 12000;

local firstCallData;
local function getFirstInvocationDate()
	if(not firstCallData) then
		firstCallData = os.date("!%a, %d %b %Y %H:%M:%S GMT");
	end
	return firstCallData;
end

local function GetDateString(nValue)
	if(nValue and nValue~=0) then
		return os.date("!%a, %d %b %Y %H:%M:%S GMT", nValue)
	else
		return getFirstInvocationDate()
	end
end

local memcache;
local function MemCache()
	memcache = memcache or mem_cache:new();
	return memcache;
end

-- @param req: request object
-- @param file_size: total file size
-- @return from, range:  if no range is specified, from is 0, range is nil
local function GetFileRange(req, file_size)
	local from = 0;
	local range_len;
	-- check if only range of data is requested.
	local range = req.headers["range"]
	if range then 
		local s,e, r_A, r_B = string.find(range, "(%d*)%s*-%s*(%d*)")
		if s and e then
			r_A = tonumber(r_A)
			r_B = tonumber(r_B)
			if r_A then
				from = r_A;
				if r_B then 
					range_len = r_B + 1 - r_A
				end
			else
				if r_B then 
					from = (file_size or 0) - r_B;
				end
			end
		end	
	end
	return from, range_len;
end

local fileInfo = {};
-- main handler
local function filehandler(req, res, baseDir, nocache, BrowserCacheExpire)
	if req.cmd_mth ~= "GET" and req.cmd_mth ~= "HEAD" then
		return WebServer.common_handlers.err_405(req, res)
	end

	if not in_base(req.relpath) then
		return WebServer.common_handlers.err_403(req, res)
	end

	local path;
	if(baseDir == "") then
		path = req.relpath:gsub("^/", "");
	else
		path = baseDir..req.relpath:gsub("^/", "");
	end

	res.headers["Content-Type"] = mimetypes:guess_type(path);
	
	--if(nocache) then
		--res.headers['Expires'] = 'Wed, 11 Jan 1984 05:00:00 GMT';
		--res.headers['Cache-Control'] = 'no-cache, must-revalidate, max-age=0';
		--res.headers['Pragma'] = 'no-cache';
	--end
	if(BrowserCacheExpire) then
		res.headers['Cache-Control'] = 'max-age='..tostring(BrowserCacheExpire);
	end
	
	if (not ParaIO.GetFileInfo(path, fileInfo)) then
		return WebServer.common_handlers.err_404(req, res);
	end
	
	if (fileInfo.mode == "directory") then
		req.parsed_url.path = req.parsed_url.path .. "/"
		res.statusline = "HTTP/1.1 301 Moved Permanently"
		res.headers["Location"] = url.build(req.parsed_url)
		res.content = "redirect"
		return res
	end

	-- no need to send content if not modified
	res.headers["Last-Modified"] = GetDateString(fileInfo.modification);

	local lms = req.headers["If-Modified-Since"] or 0
	local lm = res.headers["Last-Modified"] or 1
	if lms == lm then
		res.headers["Content-Length"] = 0
		res.statusline = "HTTP/1.1 304 Not Modified"
		res.content = ""
        res.chunked = false
        res:send_headers()
    	return res
	end

	res.headers["Content-Encoding"] = encodingfrompath(path)

	
	local pathLowered = string.lower(path);
	local memItem = MemCache():get(pathLowered);
	if(memItem and memItem.size == fileInfo.size and fileInfo.modification == memItem.modification) then
		-- fetch from cache
		res.headers["Content-Encoding"] = res.headers["Content-Encoding"] or memItem.encoding;
		local content_size = memItem.csize or memItem.size;
		res.headers["Content-Length"] = content_size;

		if req.cmd_mth == "GET" then
			local from, range_len = GetFileRange(req, content_size);
			if range_len then
				res.statusline = "HTTP/1.1 206 Partial Content"
				res.headers["Content-Length"] = range_len;
				res:send_data(memItem.data:sub(from, from + range_len));
			else
				res:send_data(memItem.data);
			end
		else
			res.content = "";
			res:send_headers();
		end
	else
		-- no cache, fetch from disk and add to local cache
		res.headers["Content-Length"] = fileInfo.size;

		local file = ParaIO.open(path, "rb")
		if (not file:IsValid()) then
			file:close();
			return WebServer.common_handlers.err_404(req, res)
		else
			local data;
			if(not nocache and fileInfo.size < maxCachedFileSize) then
				data = file:GetText(0, -1);
				-- try compress the file before it is saved in mem cache
				if(fileInfo.size >= minCompressSize and res:isContentTypePlainText(res.headers["Content-Type"]) and not res.headers["Content-Encoding"]) then
					local acceptEncoding = req.headers["Accept-Encoding"];
					if(acceptEncoding and acceptEncoding:match("gzip")) then
						local dataIO = {content=data, method="gzip"};
						if(NPL.Compress(dataIO)) then
							res.headers["Content-Encoding"] = "gzip";
							data = dataIO.result;
							res.headers["Content-Length"] = #(data);
						end
					end
				end
				local memItem = {
					size = fileInfo.size, -- original size
					csize = res.headers["Content-Length"], -- compressed size
					encoding = res.headers["Content-Encoding"],
					modification = fileInfo.modification,
					data = data,
				}
				MemCache():set(pathLowered, memItem);

				LOG.std(nil, "debug", "npl_file_handler", "file: %s added to mem cache", pathLowered);
				-- TODO: cache at most 1000 recent items. 
			end
	
			if req.cmd_mth == "GET" then
				local from, range_len = GetFileRange(req, fileInfo.size);
				if range_len then
					res.statusline = "HTTP/1.1 206 Partial Content"
					res.headers["Content-Length"] = range_len
				end
				if(not data) then
					data = file:GetText(from, range_len or -1);
				elseif(range_len) then
					data = data:sub(from, from + range_len);
				end
				res:send_data(data);
			else
				res.content = "";
				res:send_headers();
			end
			file:close();
			return res	
		end
	end
end

local nplThreadLoaded;
local function CheckLoadFileThread()
	if(not nplThreadLoaded) then
		nplThreadLoaded = true;
		NPL.CreateRuntimeState(handlerThreadName, 0):Start();
		LOG.std(nil, "info", "npl_file_handler", "npl file handler thread(%s) is started", handlerThreadName);
	end
end


-- public: file handler maker. it returns a handler that serves files in the baseDir dir
-- @param baseDir: the directory from which to serve files. "%world%" is current world directory
-- @return the actual handler function(request, response) end
function WebServer.filehandler(baseDir)
	local nocache;
	local BrowserCacheExpire = WebServer.config.CacheDefaultExpire;
	if type(baseDir) == "table" then 
		nocache = baseDir.nocache;
		baseDir = baseDir.baseDir;
		BrowserCacheExpire = baseDir.BrowserCacheExpire or BrowserCacheExpire;
	end
	
	local bReplaceWorldDir;
	if(type(baseDir) == "string") then
		if(baseDir:match("^%%world%%")) then
			bReplaceWorldDir = true;
		end
		if( baseDir~="" and not baseDir:match("/$") ) then
			baseDir = baseDir .. "/";
		end
	end
	return function(req, res)
		local baseDir_ = baseDir;
		if(bReplaceWorldDir) then
			baseDir_ = baseDir_:gsub("^%%world%%", ParaWorld.GetWorldDirectory());
		end
		if(npl_thread_name == handlerThreadName) then
			return filehandler(req, res, baseDir_, nocache, BrowserCacheExpire)	
		else
			req:discard();
			CheckLoadFileThread();
			-- redirect request to handler thread.
			local msg = {
				req = req:GetMsg(), 
				baseDir = baseDir_,
				nocache = nocache, 
				BrowserCacheExpire = BrowserCacheExpire, 
			};
			NPL.activate(targetFile, msg);
		end
	end
end

local function activate()
	local req = request:new():init(msg.req);
	local result = filehandler(req, req.response, msg.baseDir, msg.nocache, msg.BrowserCacheExpire);
	req.response:finish();
end
NPL.this(activate)