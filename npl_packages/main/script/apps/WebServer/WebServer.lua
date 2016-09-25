--[[
Title: NPL Web Server (HTTP)
Author: LiXizhi
Date: 2011-6-24 (ws_api httpd), 2015.6.8 (npl) 
Desc: NPL web server. 

## Start web server
the default admin web server can be started with 
```
npl script/apps/WebServer/WebServer.lua
```

functions:
	Start("script/apps/WebServer/admin")
	IsStarted()
	site_url()

### Command Line Params
- root: root folder
- ip: default to "0.0.0.0"
- port: default to "8099"
- package: commar separated list of packages like "npl_packages/paracraftwiki/"

Examples:
```
npl bootstrapper="script/apps/WebServer/WebServer.lua"  port="8099" root="paracraftwiki/" package="npl_packages/paracraftwiki/"
```

-----------------------------------------------
NPL.load("(gl)script/apps/WebServer/WebServer.lua");
WebServer:Start("script/apps/WebServer/admin", "0.0.0.0", 8099);
WebServer:Start("script/apps/WebServer/test", "0.0.0.0", 8099);
WebServer:StartDeprecatedHttpd("script/apps/WebServer/test/webserver.config.xml");

-- alternatively to start in another thread. NPL state(gl or anything else) must be created beforehand
NPL.activate("(gl)script/apps/WebServer/WebServer.lua", {type="StartServerAsync", configfile="script/apps/WebServer/test/Sample.WebServer.config.xml"});
-----------------------------------------------
]]
if(not WebServer) then  WebServer = {} end

NPL.load("(gl)script/ide/commonlib.lua");

WebServer.config = {
	public_files = "config/NPLPublicFiles.xml",
};

WebServer.server_configs = {}

local _webdir;

-- internal rules
local internal_rules = {
	["npl_code_wiki"] = {
		{match = "^[^%.]+$", with="WebServer.redirecthandler", params={"/index.page"}},
		{match = "%.page$", with="WebServer.npl_page_handler", params="script/apps/WebServer/admin/"},
		{match = ".", with="WebServer.filehandler", params={baseDir = "script/apps/WebServer/admin/"}},
	},
}

-- get web root directory without trailing /
function WebServer:webdir()
	return _webdir
end

-- set web root directory. usually same as the configuration file's parent directory
function WebServer:setwebdir(dir)
	_webdir = dir;
	LOG.std(nil, "info", "WebServer", "web root directory is changed to : %s", dir);
end

function WebServer:GetLogger()
	if(not WebServer.logger) then
		NPL.load("(gl)script/apps/WebServer/log_service.lua");
		local log_service = commonlib.gettable("WebServer.log_service");
		WebServer.logger = log_service:GetLogger("access"):SetParams(self.config.AccessLog, self.config.max_log_lines);
	end
	return WebServer.logger;
end

--[[ Register the server configuration
-- @param config: {server={host="*", port=80}, defaultHost={rules={}, virtualhosts={hostname=host, }}}

-- Define here where Web HTTP documents scripts are located
local webDir = "./"

local simplerules = {

    { -- URI remapping example
      match = "^[^%./]*/$",
      with = WebServer.redirecthandler,
      params = {"index.lp"}
    }, 

    { -- cgiluahandler example
      match = {"%.lp$", "%.lp/.*$", "%.lua$", "%.lua/.*$" },
      with = WebServer.cgiluahandler.makeHandler (webDir)
    },
    
    { -- filehandler example
      match = ".",
      with = WebServer.filehandler,
      params = {baseDir = webDir}
    },
} 

WebServer:LoadConfig({
    server = {host = "*", port = 8080},
    
    defaultHost = {
    	rules = simplerules
    },

	virtualhosts = {
        ["www.sitename.com"] = simplerules
    }
});
]]
-- load config from a given file. 
-- @param filename: if nil, it will be "config/WebServer.config.xml". it can also be config table.
function WebServer:LoadConfig(filename)
	if(type(filename) == "table") then
		self.server_configs[#self.server_configs+1] = filename;
		return self:GetServerConfig();
	end

	filename = filename or "config/WebServer.config.xml"
	local xmlRoot = ParaXML.LuaXML_ParseFile(filename);
	if(not xmlRoot) then
		LOG.std(nil, "error", "WebServer", "failed loading NPL Web server config file %s", filename);
		return;
	end	
	LOG.std(nil, "system", "WebServer", "config file %s", filename);

	if(not self:webdir()) then
		-- set web directory if not set before
		self:setwebdir(filename:gsub("/[^/\\]+$", ""));
	end

	self.config.TCPKeepAlive = self.config.TCPKeepAlive == "true";
	self.config.KeepAlive = self.config.KeepAlive=="true";
	self.config.IdleTimeout = self.config.IdleTimeout=="true";
	self.config.IdleTimeoutPeriod = tonumber(self.config.IdleTimeoutPeriod) or 10000
	self.config.compress_incoming = self.config.compress_incoming=="true";
	self.config.debug = self.config.debug=="true"
	self.config.CacheDefaultExpire = self.config.CacheDefaultExpire or 86400;
	

	-- de-serialize string or table
	local function deserialize_data(data)
		if(type(data) == "string") then
			-- replace %CD% with current directory
			data = string.gsub(data, "%%CD%%", self:webdir());
			if(data:match("^{.*}$")) then
				data = NPL.LoadTableFromString(data);
			end
		end
		return data;
	end

	-- read custom config 
	local function LoadCustomConfig(node, targetTable)
		local fieldname = node.attr and node.attr.name;
		if(not fieldname) then return end

		if(node.name == "table") then
			local t = {};
			targetTable[fieldname] = t;
			for _, childnode in ipairs(node) do
				LoadCustomConfig(childnode, t);
			end
		elseif(node.name == "string") then
			targetTable[fieldname] = node[1];
		elseif(node.name == "number") then
			targetTable[fieldname] = tonumber(node[1]);
		elseif(node.name == "bool") then
			targetTable[fieldname] = node[1] == "true";
		end
	end
	for node in commonlib.XPath.eachNode(xmlRoot, "//WebServer/config") do
		for _, tablenode in ipairs(node) do
			LoadCustomConfig(tablenode, self.config);
		end
	end

	-- read all rules
	local rules_map = commonlib.copy(internal_rules);
	for node in commonlib.XPath.eachNode(xmlRoot, "//WebServer/rules") do
		if(node.attr and node.attr.id) then
			
			local rules = {id = node.attr.id};
			
			local rule_node;
			for rule_node in commonlib.XPath.eachNode(node, "/rule") do
				if(rule_node.attr) then
					local rule = {};
					rule.match = deserialize_data(rule_node.attr.match);
					rule.with = rule_node.attr.with;
					rule.params = deserialize_data(rule_node.attr.params);
					rules[#rules+1] = rule;
				end
			end
			if(#rules>0)then
				rules_map[rules.id] = rules;
				LOG.std(nil, "system", "WebServer", "rule id=%s is loaded with %d rules", rules.id, #rules);
			end
		end	
	end
	self.rules_map = rules_map;
	-- now read all servers, currently only one server exist
	for node in commonlib.XPath.eachNode(xmlRoot, "//WebServer/servers/server") do
		if(node.attr and node.attr.host) then
			local config = {
				server = {host=node.attr.host, port=tonumber(node.attr.port)},
			};
			-- use last one anyway
			self.config.polling_interval = tonumber(node.attr.polling_interval) or 10

			-- get default host
			local default_host_node = commonlib.XPath.selectNode(node, "/defaultHost");
			if(default_host_node and default_host_node.attr) then
				local defaultHost = {};
				if(default_host_node.attr.rules_id) then
					defaultHost.rules = rules_map[default_host_node.attr.rules_id];
					defaultHost.allow = deserialize_data(default_host_node.attr.allow);
					if(defaultHost.rules) then
						config.defaultHost = defaultHost;
						-- LOG.std(nil, "debug", "WebServer", "default host loaded rules_id %s", default_host_node.attr.rules_id);
					else
						LOG.std(nil, "warn", "WebServer", "rules_id %s not found in default host", default_host_node.attr.rules_id);
					end
				end
			end
			-- get virtual host
			local virtualhosts;
			for virtual_host_node in commonlib.XPath.eachNode(node, "/virtualhosts/host") do
				if(virtual_host_node.attr.name) then
					virtualhosts = virtualhosts or {};
					local host = {};
					virtualhosts[virtual_host_node.attr.name] = host;
					host.rules = rules_map[virtual_host_node.attr.rules_id];
					host.allow = deserialize_data(virtual_host_node.attr.allow);
					if(host.rules) then
						config.virtualhosts = virtualhosts;
					else
						LOG.std(nil, "warn", "WebServer", "rules_id %s not found in virtual host", virtual_host_node.attr.rules_id);
					end
				end
			end

			-- current only one server in the current thread is supported. 
			self.server_configs[#self.server_configs+1] = config;
			break;
			-- TODO: start it in another thread
			-- NPL.CreateRuntimeState(node.attr.host_state_name, 0):Start();
			-- init the REST interface
			-- NPL.activate("(web)script/apps/WebServer/WebServer.lua", {type="init", config=self.config})
		end
	end
	return self:GetServerConfig();
end

function WebServer:GetServerConfig()
	return self.server_configs[1];
end

-- stop a server that is started by StartServer;
function WebServer:StopServer()
	self.is_exiting = true;
end

local virtual_dirs = {};

-- add a global virtual directory, so that we can serve files inside that virtual directory as if file is there. 
-- this is a useful way when a application or mod wants to add their own pages to entire website. 
-- e.g.: WebServer:AddVirtualFile("/paracraft", "script/apps/Aries/Creator/Game/Website/");
-- @param virtual_directory: virtual directory as requested from the url.
-- @param directory: the actual filename. 
function WebServer:AddVirtualDirectory(virtual_directory, directory)
	virtual_dirs[virtual_directory] = directory;
end

function WebServer:GetVirtualDirectory(virtual_directory)
	return virtual_dirs;
end


-- get low-level server implementation. 
-- @param server_type: "httpd" or "npl_http". default to "npl_http"
--	"httpd" use socket.dll
--	"npl_http" use default npl network layer (recommended)
function WebServer:GetServer(server_type)
	if(server_type == "httpd") then
		NPL.load("(gl)script/apps/WebServer/httpd/httpd.lua");
		return WebServer.httpd;
	else
		NPL.load("(gl)script/apps/WebServer/npl_http.lua");
		return WebServer.npl_http;
	end
end

-- @param path: additional path used. 
-- @return something like "http://localhost:8080/"  it will return nil if server is not started yet.
function WebServer:site_url(path, scheme)
	if(self:IsStarted()) then
		if(not self.site_host_url) then
			local config = self:GetServerConfig();
			if(config and config.server) then
				local ip = config.server.ip;
				if(ip == "" or ip == "*" or ip == "0.0.0.0") then
					ip = "localhost";
				end
				self.site_host_url = format("http://%s:%s/", ip, tostring(config.server.port));
			end
		end
		if(not path) then
			return self.site_host_url;
		else
			if(scheme) then
				return self.site_host_url..path.."?"..scheme;
			else
				return self.site_host_url..path;
			end
		end
	end
end

-- @Deprecated: this will use the old httpd server (requires socket.dll)
--  use Start() instead.
-- start the web server based on configuration file
-- this function does not return until the web server exit. use StartServerAsync for async calls.
-- @param filename: if nil, it will be "config/WebServer.config.xml"
function WebServer:StartDeprecatedHttpd(filename, bIsAsync)
	-- load config
	local config = self:LoadConfig(filename);
	if(config) then
		self:GetServer("httpd").start(config, bIsAsync);
	end
end

-- check if already started
function WebServer:IsStarted()
	return self.is_started;
end

-- start npl web server in the given folder. 
-- @param root_dir: root directory or the path to the server configuration file. 
-- @param ip: nil to use config file setting in the directory. nil or "0.0.0.0" to listen to all ip. "" or "localhost" or "127.0.0.1" to listen to loopback.
-- @param port: nil to use config file setting. 
-- @param root_dir: document root directory. default to "script/apps/WebServer/test"
--   it will automatically search a file called "webserver.config.xml" at the document root if available. 
function WebServer:Start(root_dir, ip, port)
	if(self.is_started) then
		LOG.std(nil, "warn", "WebServer", "server can only be started once. duplicated calls to StartServer are ignored");
		return false;
	end
	self.is_started = true;

	local config_file;
	if(root_dir:match("%.xml$")) then
		config_file = root_dir;
	else
		local root_dir = root_dir or "script/apps/WebServer/test";
		root_dir = root_dir:gsub("/$", "");
		self:setwebdir(root_dir);
		config_file = root_dir.."/webserver.config.xml";
	end

	if(not ParaIO.DoesFileExist(config_file, true)) then
		LOG.std(nil, "info", "WebServer", "no config file found. You can create one at %s", config_file);
		config_file = "script/apps/WebServer/default.webserver.config.xml";
	end
	config = self:LoadConfig(config_file);
	if(config) then
		config.server.ip = ip or config.server.ip or "0.0.0.0";
		config.server.port = port or config.server.port or "8080"; -- if port is "0", we will not listen for incoming connection
		config.NPLRuntime = self.config.NPLRuntime;
		config.gc = self.config.gc;
		config.log_level = self.config.log_level;
		config.CacheDefaultExpire = self.config.CacheDefaultExpire;
		self:GetServer("npl_http").start(config);
		return true;
	end
end


-- only called in the rest thread to init rest_API
local function activate()
	local msg = msg;
	if(WebServer:IsStarted()) then
		return;
	end
	if(not msg) then
		local rootDir = ParaEngine.GetAppCommandLineByParam("root", "script/apps/WebServer/admin");
		local ip = ParaEngine.GetAppCommandLineByParam("ip", "0.0.0.0");
		local port = ParaEngine.GetAppCommandLineByParam("port", "8099");
		-- commar separated list of packages like "npl_packages/paracraftwiki/"
		local package = ParaEngine.GetAppCommandLineByParam("package", "");
		if(package and package~="" and package:match("/$")) then
			for folder in package:gmatch("[^;,]+") do
				NPL.load(folder);
			end
		end
		WebServer:Start(rootDir, ip, port);
		ParaGlobal.ShellExecute("open", format("http://localhost:%s/", port), "", "", 1);
	elseif(msg.type == "StartServerAsync") then
		WebServer:StartDeprecatedHttpd(msg.configfile, true);
	end
end
NPL.this(activate)