--[[
Title: npl server file api environment
Author: LiXizhi
Date: 2015/6/8
Desc: this class defines functions that can be used inside npl server page file
Following objects and functions can be used inside page script:
	request:   current request object: headers and cookies
	response:   current response object: send headers or set cookies, etc.
	echo(text):   output html
	__FILE__: current filename
	page: the current page (parser) object
	_GLOBAL: the _G itself

following are exposed via meta class:
	include(filename, bReload):  inplace include another script
	include_once(filename):  include only once, mostly for defining functions
	gettable(tabNames): similar to commonlib.gettable() but in page scope.
	createtable(tabNames, init_params): similar to commonlib.createtable() but in page scope.
	inherit(baseClass, new_class): -- same as commonlib.inherit()
	print(...):  output html with formated string.   
	nplinfo():   output npl information.
	exit(text), die():   end the request
	dirname(__FILE__):   get directory name
	site_config(): get the web site configuration table
	site_url(path, scheme): 
	addheader(name, value):
	file_exists(filename):
	log(obj)
	sanitize(text)  escape xml '<' '>' 
	json_encode(value, bUseEmptyArray)   to json string
	json_decode(str)  decode from json string
	xml_encode(value)    to xml string
	include_pagecode(code, filename):  inplace include page code. 
	get_file_text(filename) 
	util.GetUrl(url, function(err, msg, data) end): 
	util.parse_str(query_string): 
	err, msg = yield(bExitOnError)  pause execution until resume() is called.
	resume(err, msg)  in async callback, call this function to resume execution from last yield() position.
	

I may consider reimplement some handy functions from php reference below. 
However, the exposed request and response object already contains everything you need. 
References: 
	http://php.net/manual/en/function.header.php
	http://php.net/manual/en/reserved.variables.server.php
	http://php.net/manual/en/features.http-auth.php
-----------------------------------------------
NPL.load("(gl)script/apps/WebServer/npl_page_env.lua");
local npl_page_env = commonlib.gettable("WebServer.npl_page_env");
local env = npl_page_env:new(req, res);
-----------------------------------------------
]]
NPL.load("(gl)script/ide/System/Core/Filters.lua");
NPL.load("(gl)script/ide/System/os/GetUrl.lua");
NPL.load("(gl)script/ide/Json.lua");
NPL.load("(gl)script/apps/WebServer/npl_util.lua");
NPL.load("(gl)script/ide/Encoding.lua");
NPL.load("(gl)script/ide/System/Database/TableDatabase.lua");
local TableDatabase = commonlib.gettable("System.Database.TableDatabase");
local npl_http = commonlib.gettable("WebServer.npl_http");
local npl_page_env = commonlib.gettable("WebServer.npl_page_env");
-- static private implementation object. 
local env_imp = commonlib.gettable("WebServer.env_imp");
local util = commonlib.gettable("WebServer.util");
local tostring = tostring;

npl_page_env.__index = npl_page_env;

-- SECURITY: expose global _G to server env, this can be useful and dangourous.
setmetatable(npl_page_env, {__index = _G});



-- expose: request, response, echo and print to npl script. 
function npl_page_env:new(request, response)
	local o = {
		request = request,
		response = response,
		echo = function(text)
			if(text~=nil and text~="") then
				response:sendsome(tostring(text));
			end
		end,
		util = util,
		resume = function(err, msg)
			local self = getfenv(1);
			return env_imp.resume(self, err, msg);
		end,
		page_stack = {},
	};
	o._GLOBAL = o;
	setfenv(o.resume, o);
	setmetatable(o, self);
	return o;
end

-- exposing table database
npl_page_env.TableDatabase = TableDatabase;

-- internal function: never call this in page code
function npl_page_env:push_page(page)
	self.page_stack[#(self.page_stack)+1] = page;
end

-- internal function: never call this in page code
function npl_page_env:pop_page(page)
	self.page_stack[#(self.page_stack)] = nil;
end

-- handy function to output using current request context
-- @param text: string or number or nil or boolean. 
function env_imp:echo(text)
	self.echo(text);
end

function env_imp:print(...)
	env_imp.echo(self, string.format(...));
end

-- same as self.echo(string.format(...))
function npl_page_env.print(...)
	local self = getfenv(2);
	env_imp.print(self, ...);
end

function env_imp:nplinfo()
	env_imp.echo(self, "<p>NPL web server v1.0</p>");
	env_imp.echo(self, format("<p>site url: %s</p>", env_imp.site_url(self) or ""))
	env_imp.echo(self, format("<p>your ip: %s</p>", self.request:getpeername() or ""))
	env_imp.echo(self, "<p>");
	env_imp.echo(self, commonlib.serialize(self.request.headers, true):gsub("\n", "<br/>"));
	env_imp.echo(self, "</p>");
end

-- similar to phpinfo()
-- output everything about the environment and the request including all request headers.
function npl_page_env.nplinfo()
	local self = getfenv(2);
	return env_imp.nplinfo(self);
end

function env_imp:exit(msg)
	-- the caller use xpcall with custom error function, so caller will catch it gracefully and end the request
	self.is_exit_call = true;
	self.exit_msg = msg;
	error("exit_call");
end

-- similar to php.exit()
-- Output a message and terminate the current script
-- @param msg: output this message. usually nil. 
function npl_page_env.exit(msg)
	local self = getfenv(2);
	env_imp.exit(self, msg);
end

-- alias for exit()
npl_page_env.die = npl_page_env.exit;


function env_imp:dirname(filename)
	filename = filename or self.__FILE__;
	local dir = filename:gsub("[^/]+$", "");
	return dir;
end

-- similar to php.dirname() however with the trailing /
-- get the directory name of the given file with the trailing /. 
-- @param filename: if nil, self.__FILE__ is used. 
function npl_page_env.dirname(filename)
	local self = getfenv(2);
	return env_imp.dirname(self, filename);
end

function env_imp:getfilepath(filename)
	local firstByte = filename:byte(1);
	
	if(firstByte == 46) then 
		local secondByte = filename:byte(2);
		if(secondByte == 47) then
			-- begin with './', relative to current file
			filename = env_imp.dirname(self, self.__FILE__)..filename:sub(3, -1);
		elseif(secondByte == 46) then
			if(filename:byte(3) == 47) then
				local parentDir = env_imp.dirname(self, self.__FILE__);
				parentDir = parentDir:gsub("([^/]+)/$", "");
				filename = filename:sub(4, -1);
				while (filename:match("^%.%./")) do
					parentDir = parentDir:gsub("([^/]+)/$", "");
					filename = filename:sub(4, -1);
				end
				filename = parentDir..filename;
			end
		end
	elseif(firstByte == 47) then
		-- begin with '/', relative to web root directory
		filename = WebServer:webdir()..filename;
	elseif(not string.find(filename, "/")) then
		filename = env_imp.dirname(self, self.__FILE__)..filename;
	else
		filename = filename:gsub("/[/]+", "/");
	end
	return filename;
end


-- @param filename: file path, relative or absolute. 
-- begin with './', relative to current file
-- begin with '/', relative to web root directory
-- begin with '../../../', up several directory to current file
-- no "/" in filename, relative to current file
-- otherwise, filename is absolute path. 
function npl_page_env.getfilepath(filename)
	local self = getfenv(2);
	return env_imp.getfilepath(self, filename);
end

function env_imp:file_exists(filename)
	filename = env_imp.getfilepath(self, filename);
	return ParaIO.DoesFileExist(filename, true);
end

-- Checks whether a file exists
function npl_page_env.file_exists(filename)
	local self = getfenv(2);
	return env_imp.file_exists(self, filename);
end

-- private: add file to be already included
function env_imp:add_include_file(filename)
	-- self.__includes mapping from filename to true
	local includes = self.__includes;
	if(not includes) then
		includes = {}
		self.__includes = includes;
	end
	if(not includes[filename]) then
		includes[filename] = true;
	end
end

-- private: return true if file is already included in the environment. 
function env_imp:has_include_file(filename)
	return (self.__includes and self.__includes[filename]);
end

function env_imp:include(filename, bReload)
	filename = env_imp.getfilepath(self, filename);
	local page, bNewlyLoaded = self.page.page_manager:get(filename);
	if(page) then
		if(bReload and not bNewlyLoaded) then
			self.page.page_manager:refresh(filename);
		end
		env_imp.add_include_file(self, filename);
		if(not page:get_error_msg()) then
			return page:run(self);
		else
			LOG.std(nil, "error", "npl_env", "include() failed: error parse file %s: %s", filename, page:get_error_msg() or "");
			env_imp.exit(self, page:get_error_msg());
		end
	else
		LOG.std(nil, "error", "npl_env", "include() failed for file %s", filename);
		env_imp.exit(self, string.format("include() failed for file %s", filename));
	end
end

-- similar to php.include: http://php.net/manual/en/function.include.php
-- The include statement includes and evaluates the specified file and return its result if any.
-- the included file share the same global environment as the caller. Unlike php, if you include another file 
-- inside a function, upvalues are NOT shared due to the lexical scoping nature of lua. 
-- Please note that exit() call will fallthrough all nested include and terminate the request.
-- e.g.
--		include(dirname(__FILE__).."test_include.page");
--		include("test_include.page");  -- identical to above
-- @param filename: if no parent directory is specified, we will assume it is from the containing file's parent directory. 
--      if filename begins with "/", it will append the web root directory. 
-- @param bReload: true to reload the file. default to nil. files will be loaded only once.
-- @return: result of the included function. 
function npl_page_env.include(filename, bReload)
	local self = getfenv(2);
	return env_imp.include(self, filename, bReload);
end

function env_imp:include_once(filename)
	filename = env_imp.getfilepath(self, filename);
	if(not env_imp.has_include_file(self, filename)) then
		return env_imp.include(self, filename);
	end
end

-- same as include(), expect that this function only takes effect on first call for a given env.
function npl_page_env.include_once(filename)
	local self = getfenv(2);
	return env_imp.include_once(self, filename);
end

function env_imp:include_pagecode(code, filename)
	filename = filename or (self.__FILE__.."#pagecode");
	local page = self.page.page_manager:get_by_code(code, filename);
	if(page) then
		env_imp.add_include_file(self, filename);
		if(not page:get_error_msg()) then
			return page:run(self);
		else
			LOG.std(nil, "error", "npl_env", "include_pagecode() failed: error parse file %s: %s", filename, page:get_error_msg() or "");
			env_imp.exit(self, page:get_error_msg());
		end
	end
end

-- include a given page code. 
-- @param code: the actual code string to include. 
-- @param filename: nil to default to current file. only used for displaying error
function npl_page_env.include_pagecode(code, filename)
	local self = getfenv(2);
	return env_imp.include_pagecode(self, code, filename)
end

function env_imp:site_url(filename, scheme)
	return npl_page_env.site_url(filename, scheme);
end

-- return the site url like http://localhost:8080/
function npl_page_env.site_url(filename, scheme)
	return WebServer:site_url(filename, scheme);
end

function env_imp:site_config(name)
	return npl_page_env.site_config(name);
end

-- @param name: if nil, the root config table is returned. 
function npl_page_env.site_config(name)
	if(not name) then
		return WebServer.config;
	else
		commonlib.gettable(name, WebServer.config)
	end
end

function env_imp:addheader(name, value)
	self.response:add_header(name, value);
end

-- add header, only possible when header is not sent yet. 
function npl_page_env.addheader(name, value)
	local self = getfenv(2);
	return env_imp.addheader(self, name, value);
end

function env_imp:setheader(name, value)
	self.response:set_header(name, value);
end

-- set header (replace previously set values), only possible when header is not sent yet. 
function npl_page_env.setheader(name, value)
	local self = getfenv(2);
	return env_imp.setheader(self, name, value);
end

function env_imp:log(...)
	return npl_page_env.log(...);
end

-- simple log any object, same as echo. 
function npl_page_env.log(...)
	commonlib.echo(...);
end

function env_imp:sanitize(text)
	return npl_page_env.sanitize(text);
end

-- Sanitizes all HTML tags
function npl_page_env.sanitize(text)
	if(text) then
		return util.sanitize(text);
	end
end


function env_imp:json_encode(value, bUseEmptyArray)
	return npl_page_env.json_encode(value, bUseEmptyArray);
end

-- Returns a string containing the JSON representation of value. 
-- @param bUseEmptyArray: by default, empty table is serialized to json as object {}. 
-- calling this function will be serialized to json as array []
function npl_page_env.json_encode(value, bUseEmptyArray)
	return commonlib.Json.Encode(value, bUseEmptyArray);
end

function env_imp:json_decode(value)
	return npl_page_env.json_decode(value);
end

-- json decode
function npl_page_env.json_decode(value)
	return commonlib.Json.Decode(value);
end

function env_imp:xml_encode(value)
	return npl_page_env.xml_encode(value);
end

-- Returns a string containing the Xml representation of value. 
function npl_page_env.xml_encode(value)
	return commonlib.Lua2XmlString(value);
end

function env_imp:get_file_text(filename)
	local file = ParaIO.open(filename, "r");
	local text;
	if(file and file:IsValid()) then
		text = file:GetText();
		file:close();
	end
	return text;
end

-- get file text
function npl_page_env.get_file_text(filename)
	local self = getfenv(2);
	return env_imp.get_file_text(self, filename);
end

function env_imp:yield(bExitOnError)
	if(self.co) then
		self.response:Begin();
		local err, msg = coroutine.yield(self);
		self.response:End(true);
		if(err and bExitOnError) then
			self.response:sendsome(tostring(msg));
			env_imp.exit(self);
		end
		return err, msg;
	end
end

function env_imp:restore_page_env()
	-- restore all parent page stack env to self
	for _, page in ipairs(self.page_stack) do
		if(page.code_func) then
			setfenv(page.code_func, self);
		end
	end
end

-- yield control until all async jobs are completed
-- @param bExitOnError: if true, this function will handle error 
-- @return err, msg: err is true if there is error. 
function npl_page_env.yield(bExitOnError)
	local self = getfenv(2);
	local err, msg = env_imp.yield(self, bExitOnError);
	env_imp.restore_page_env(self);
	return err, msg;
end

-- resume from where jobs are paused last. 
-- @param err: if there is error, this is true, otherwise it is nil.
-- @param msg: error message in case err=true
function env_imp:resume(err, msg)
	if(self.co) then
		local res, err, msg = coroutine.resume(self.co, err, msg);
		if(res) then
			if(not err and msg=="finished") then
				self.response:finish();
			end
		else
			self.response:sendsome(tostring(err));
			self.response:finish();
		end
	end
end

function env_imp:gettable(tabNames)
	return commonlib.gettable(tabNames, self);
end

-- similar to commonlib.gettable(tabNames) but in page scope.
-- @param tabNames: table names like "models.users"
function npl_page_env.gettable(tabNames)
	local self = getfenv(2);
	return env_imp.gettable(self, tabNames);
end

function env_imp:createtable(tabNames, init_params)
	return commonlib.createtable(tabNames, self);
end

-- similar to commonlib.createtable(tabNames) but in page scope.
-- @param tabNames: table names like "models.users"
function npl_page_env.createtable(tabNames, init_params)
	local self = getfenv(2);
	return env_imp.createtable(self, tabNames, init_params);
end

-- same as commonlib.inherit()
function npl_page_env.inherit(baseClass, new_class, ctor)
	return commonlib.inherit(baseClass, new_class, ctor);
end
