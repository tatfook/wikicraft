--[[
Title: npl HTTP server
Author: LiXizhi
Date: 2015/6/8
Desc: 
-----------------------------------------------
NPL.load("(gl)script/apps/WebServer/npl_http.lua");
local npl_http = commonlib.gettable("WebServer.npl_http");
-----------------------------------------------
]]
NPL.load("(gl)script/ide/event_mapping.lua");
NPL.load("(gl)script/apps/WebServer/npl_request.lua");
NPL.load("(gl)script/apps/WebServer/npl_common_handlers.lua");
local NPLReturnCode = commonlib.gettable("NPLReturnCode");
local common_handlers = commonlib.gettable("WebServer.common_handlers");
local request = commonlib.gettable("WebServer.request");
local WebServer = commonlib.gettable("WebServer");

local npl_http = commonlib.gettable("WebServer.npl_http");

-- In HTTP1.1's persistent connection: 
-- in case the client send multiple requests on the same connection without waiting for the previous message to return
-- the server also need to pipeline all requests. This feature is currently disabled. 
local enable_http_pipeline = false;

-- keep statistics
local stats = {
	request_received = 0,
}
local common_headers = {
	["Server"] = "NPL/1.1",
};

function npl_http.LoadBuildinHandlers()
	NPL.load("(gl)script/apps/WebServer/npl_common_handlers.lua");
	NPL.load("(gl)script/apps/WebServer/npl_file_handler.lua");
	NPL.load("(gl)script/apps/WebServer/npl_script_handler.lua");
	NPL.load("(gl)script/apps/WebServer/npl_page_handler.lua");
	-- TODO: add your buildin handlers here. 
end

function npl_http.LoadNPLRuntimeConfig(config)
	if(not config) then
		return;
	end
	-- set NPL attributes before starting the server. 
	local att = NPL.GetAttributeObject();
	if(config.TCPKeepAlive) then
		att:SetField("TCPKeepAlive", config.TCPKeepAlive==true);
	end
	if(config.KeepAlive) then
		att:SetField("KeepAlive", config.KeepAlive==true);
	end
	if(config.IdleTimeout) then
		att:SetField("IdleTimeout", config.IdleTimeout==true);
	end
	if(config.IdleTimeoutPeriod) then
		att:SetField("IdleTimeoutPeriod", tonumber(config.IdleTimeoutPeriod));
	end
	if(config.MaxPendingConnections) then
		att:SetField("MaxPendingConnections", tonumber(config.MaxPendingConnections));
	end
	if(config.LogLevel) then
		att:SetField("LogLevel", tonumber(config.LogLevel) or 1);
	end
	local npl_queue_size = config.npl_queue_size;
	if(npl_queue_size) then
		__rts__:SetMsgQueueSize(npl_queue_size);
	end

	-- whether use compression on incoming connections, the current compression method is super light-weighted and is mostly for data encrption purposes. 
	local compress_incoming;
	if (config.compress_incoming and config.compress_incoming=="true") then
		compress_incoming = true;
	else
		compress_incoming = false;
	end
	NPL.SetUseCompression(compress_incoming, false);
	
	if(config.CompressionLevel) then
		att:SetField("CompressionLevel", tonumber(config.CompressionLevel));
	end
	if(config.CompressionThreshold) then
		att:SetField("CompressionThreshold", tonumber(config.CompressionThreshold));
	end
	if(config.HTTPCompressionThreshold) then
		npl_http.HTTPCompressionThreshold = config.HTTPCompressionThreshold;
	end
end

-- Start a garbage collection timer, that does a full garbage collection of all worker threads every few seconds. 
function npl_http.LoadGCConfig(config)
	if(not config) then return end
	local interval = config.gc_interval;
	-- TODO: start a timer to go explicit GC.
end

function npl_http.GetCompressionThreshold()
	return npl_http.HTTPCompressionThreshold or 12000;
end

-- set request handler according to configuration
function npl_http.LoadConfig(config)
	-- set a really big message queue for http server. 
	local MsgQueueSize = config.MsgQueueSize or 20000;
	__rts__:SetMsgQueueSize(MsgQueueSize);
	LOG.std(nil, "system", "NPL", "NPL input queue size is changed to %d", MsgQueueSize);

	LOG.SetLogLevel(config.log_level);
	npl_http.LoadNPLRuntimeConfig(config.NPLRuntime);
	npl_http.LoadGCConfig(config.gc);

	npl_http.LoadBuildinHandlers();

	-- normalizes the configuration
    config.server = config.server or {}
    local vhosts_table = {}

	NPL.load("(gl)script/apps/WebServer/rules.lua");
	local Rules = commonlib.gettable("WebServer.Rules");

	if config.defaultHost then
        vhosts_table[""] = {rule = common_handlers.patternhandler(Rules:new():init(config.defaultHost.rules)), allow = config.defaultHost.allow};
    end

    if type(config.virtualhosts) == "table" then
        for hostname, host in pairs(config.virtualhosts) do
			vhosts_table[hostname] = {rule= common_handlers.patternhandler(Rules:new():init(host.rules)),allow = host.allow};
        end
    end

	npl_http.SetRequestHandler(common_handlers.vhostshandler(vhosts_table));
end

-- it will replace value
function npl_http.SetCommonHeader(h, v)
	if(not h) then
		return 
	end
	common_headers[h] = v;
end

function npl_http.GetCommonHeaders()
	return common_headers;
end


-- start server with config
--  do not call this directly, use WebServer.Start() to start your server. 
function npl_http.start(config)
	npl_http.LoadConfig(config);
	LOG.std(nil, "system", "WebServer", "NPL Web Server is started. ");
	NPL.AddPublicFile("script/apps/WebServer/npl_http.lua", -10);
	NPL.StartNetServer(tostring(config.server.ip or ""), tostring(config.server.port or 8080));
	if(enable_http_pipeline) then
		NPL.RegisterEvent(0, "_n_npl_http_network", ";npl_http_event();");
	end
end

-- replace the default request handler
-- @param handler: function(req, response) end, 
function npl_http.SetRequestHandler(handler)
	npl_http.request_handler = handler;
end

function npl_http.handleRequest(req)
	stats.request_received = stats.request_received + 1;
	WebServer:GetLogger():log("%s \"%s %s\" \"%s\"", req:getpeername(), req:GetMethod(), req:url(), req:header("User-Agent") or "");

	if(npl_http.request_handler) then
		local result = npl_http.request_handler(req, req.response);

		while(result == "reparse") do
			req.params = nil;
			req:parse_url();
			
			result = npl_http.request_handler(req, req.response);
		end

		req.response:finish();
	else
		-- no handler set? send test message. 
		req.response:send_xml(format("<html><body>hello world. req: %d. input is %s</body></html>", stats.request_received, req:tostring()));
	end
end

local connections = {};

function npl_http_event()
	local msg = msg;
	local code = msg.code;
	if(code == NPLReturnCode.NPL_ConnectionDisconnected) then
		local nid = msg.tid or msg.nid;
		if(connections[nid]) then
			local req = connections[nid];
			req.response:SetOnFinished(nil);
			req.response:SetFinished();
			connections[nid] = nil;
			LOG.std(nil, "warn", "npl_http", "connection %s ended prematurally", nid);
		end
		LOG.std(nil, "info", "npl_http", "connection %s ended", nid);
	end
end

function npl_http.OnFinishedCallback(response)
	local req = response.req.next_req;
	if(not req) then
		connections[response:GetNid()] = nil;
	else
		response.req.next_req = nil;
		connections[response:GetNid()] = req;
		npl_http.handleRequest(req);
	end
end

local function activate()
	if(enable_http_pipeline) then
		local req = request:new():init(msg);
		local last_req = connections[req.nid];
		if(not last_req) then
			connections[req.nid] = req;
			req.response:SetOnFinished(npl_http.OnFinishedCallback);
			npl_http.handleRequest(req);
		else
			-- append request
			last_req.next_req = req;
		end
	else
		local req = request:new():init(msg);
		npl_http.handleRequest(req);
	end
end
NPL.this(activate)