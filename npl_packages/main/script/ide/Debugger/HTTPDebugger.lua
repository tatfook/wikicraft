--[[
Title: HTTP debugger
Author(s): LiXizhi, inspired by RemDebug 1.0
Date: 2016/4/13
Desc: 
HTTP debugger is used by NPL extensions for visual studio code and the NPL code wiki for debugging purposes. 
For more information, please see IPCDebugger

# How to start debugger
One can either start programmatically, or simply start NPL code wiki and goto menu tools::debugger
Use Lib:
-------------------------------------------------------
NPL.load("(gl)script/ide/Debugger/HTTPDebugger.lua");
local HTTPDebugger = commonlib.gettable("commonlib.Debugger.HTTPDebugger")
commonlib.Debugger.HTTPDebugger.Start();
------------------------------------------------------
]]
NPL.load("(gl)script/ide/Debugger/IPCDebugger.lua");
NPL.load("(gl)script/ide/STL.lua");

local HTTPDebugger = commonlib.inherit(commonlib.gettable("IPCDebugger"), commonlib.gettable("commonlib.Debugger.HTTPDebugger"));
-- whether to dump messages to log.txt
local debug_debugger = true;

-- call this at any time to start debugger at default ip:port
-- @param ip: if nil, it is "localhost"
-- @param port: if nil, 8099, same as NPL admin web server
function HTTPDebugger.Start(ip, port)
	port = port or 8099
	NPL.load("(gl)script/apps/WebServer/WebServer.lua");
	WebServer:Start("script/apps/WebServer/admin", ip or "localhost", port);
	ParaGlobal.ShellExecute("open", format("http://localhost:%s/debugger", tostring(port)), "", "", 1);
end

-- start the debug engine. It will begin waiting for incoming debug request from the debugger UI.
-- Note: start the debug engine only start a 100ms timer that polls the "debugger IPC queue". 
-- So there is no performance impact to the runtime until we explicitly enable debug hook of the NPL runtime. 
-- @param input_queue_name: the input IPC queue name, default to "NPLDebug"
function HTTPDebugger.StartDebugEngine(input_queue_name)
end

-- output message queue: these messages are polled by the debugger IDE at regular interval.
function HTTPDebugger.GetOutputMsgList()
	HTTPDebugger.output_queue = HTTPDebugger.output_queue or commonlib.List:new();
	return HTTPDebugger.output_queue;
end

-- send a debug event message to the remote debug engine via the output_queue
function HTTPDebugger.Write(msg)
	if(debug_debugger) then
		LOG.std(nil, "info", "debugger_write", msg);
	end

	local output_queue = HTTPDebugger.GetOutputMsgList();
	output_queue:add({
			method = "debug",
			type = msg.type,
			param1 = msg.param1,
			param2 = msg.param2,
			filename = msg.filename,
			code = msg.code,
		});
end

-- read the next debug message. 
-- @return the message table or nil
function HTTPDebugger.WaitForDebugEvent()
	local thread = __rts__;
	
	local debug_msg;
	while (not debug_msg) do
		local nSize = thread:GetCurrentQueueSize();
		local processed;
		for i=0, nSize-1 do
			local msg = thread:PeekMessage(i, {filename=true});
			if(msg.filename == "script/ide/Debugger/HTTPDebugger.lua") then
				debug_msg = i;
				break;
			elseif(msg.filename == "script/apps/WebServer/npl_http.lua") then
				-- process all http message, since our debugger UI is written in HTTP.
				thread:PopMessageAt(i, {process = true});
				processed = true;
				break;
			end
		end

		if(not processed and debug_msg == nil) then
			local attr = ParaEngine.GetAttributeObject();
			if(attr:GetField("HasClosingRequest", false) == true) then
				-- if there is a closing request, send a fake detach message. 
				LOG.std(nil, "info", "HTTPDebugger", "closing request is seen, we will detach prematurely");
				local out_msg = {filename="exit"};
				HTTPDebugger.Write(out_msg);
				return out_msg;
			end
			if(thread:GetCurrentQueueSize() == nSize) then
				thread:WaitForMessage(nSize);
			end
		end
	end

	if(debug_msg) then
		local msg = thread:PopMessageAt(debug_msg, {filename=true, msg=true});
		local out_msg = msg.msg;
		if(debug_debugger) then
			LOG.std(nil, "info", "SyncDebugMsg", out_msg);
		end
		return out_msg
	end
end

-- async break request
function HTTPDebugger.BreakAsync(type, param1, param2, msg, from)
	HTTPDebugger.GetOutputMsgList():clear();
	HTTPDebugger.pause();
end

-- async attach a remote IPC debugger to this NPL state and break it  
function HTTPDebugger.AttachAsync(type, param1, param2, msg, from)
	HTTPDebugger.GetOutputMsgList():clear();
	-- attach debug hook
	HTTPDebugger.Attach();
end

-- this is only called when program is not paused. 
local function activate()
	HTTPDebugger.SetDebugger(HTTPDebugger);

	LOG.std(nil, "info", "debugger", msg);
	local command = msg.filename;
	if(command == "pause") then
		HTTPDebugger.BreakAsync();
	elseif(command == "attach") then
		HTTPDebugger.AttachAsync();
	elseif(command == "setb") then
		HTTPDebugger.SetBreakpointAsync(msg.code.filename, msg.code.line);
	elseif(command == "delb") then
		HTTPDebugger.RemoveBreakpointAsync(msg.code.filename, msg.code.line);
	elseif(command == "listb") then
		HTTPDebugger.ListBreakpoints();
	elseif(command == "exec") then
		-- TODO: evaluate when still running
	end
end
NPL.this(activate)