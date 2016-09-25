--[[
Title: Log service
Author(s): LiXizhi
Date: 2016/9/4
Desc: it may be called from any thread, which will automatically redirect 
to the logger thread, and when log file is too big, it will automatically switch to another file
and backup previous one with a proper date in the same folder.
-----------------------------------------------
NPL.load("(gl)script/apps/WebServer/log_service.lua");
local log_service = commonlib.gettable("WebServer.log_service");
local logger = log_service:GetLogger("access"):SetParams("log/access.log", 1000000);
logger:log("%s, this is a log", "hello");
-----------------------------------------------
]]
NPL.load("(gl)script/ide/commonlib.lua");
NPL.load("(gl)script/ide/timer.lua");

local tostring = tostring;
local format = format;
local type = type;
local logger_thread_name = "log";
local this_thread_name = __rts__:GetName();
local log_address = format("(%s)script/apps/WebServer/log_service.lua", logger_thread_name);
local log_service = commonlib.gettable("WebServer.log_service");

local logger_class = commonlib.inherit();

function logger_class:ctor()
	self.name = "access";
	self.filename = "log/access.log";
	self.max_lines = 1000000;
	self.count = 0;
end

function logger_class:init(name)
	self.name = name or self.name;
	return self;
end

-- @param filename: default to "log/access.log"
-- @param max_lines: we will change to another file if max line is reached. default to 1 million lines
-- @return self;
function logger_class:SetParams(filename, max_lines)
	if(this_thread_name ~= logger_thread_name) then
		self:send({action="SetParams", filename=filename, max_lines=max_lines});	
	else
		self.filename = filename or self.filename;
		local fileInfo = {};
		if(ParaIO.GetFileInfo(self.filename, fileInfo)) then
			-- estimate count by file size, suppose each line is 256 bytes.
			self.count = math.floor(fileInfo.size / 256);
		end

		ParaIO.CreateDirectory(self.filename:gsub("[^/]+$", "") or "");
		self:logger():SetLogFile(self.filename);

		self.max_lines = max_lines or self.max_lines;
		LOG.std(nil, "info", "logger", "log file set at %s, max lines: %d", self.filename, self.max_lines);
	end	
	return self;
end

-- private
function logger_class:send(msg)
	msg.name = self.name;
	return NPL.activate(log_address, msg);
end

-- private
function logger_class:logger()
	return commonlib.servicelog.GetLogger(self.name)
end

-- we will move current log file to a new place with current date and time appended to filename
-- whenever the file size is very big or with too many lines. 
function logger_class:TryBackupLogFile()
	if(self.count > self.max_lines) then
		self.count = 0;
		self:logger():SetLogFile("log/null");
		local backupfile = self.filename .. "." .. ParaGlobal.GetDateFormat("yyyy-MM-dd") .. "-" .. ParaGlobal.GetTimeFormat("HH-mm-ss")..".log";
		ParaIO.MoveFile(self.filename, backupfile);
		self:logger():SetLogFile(self.filename);
		LOG.std(nil, "info", "logger", "log file %s is too big and moved to %s", self.filename, backupfile);
	end
end

-- public: write log message
function logger_class:log(...)
	if(this_thread_name ~= logger_thread_name) then
		NPL.activate(log_address, {action="log", args={...}});
	else
		self.count = self.count + 1;
		self:TryBackupLogFile();
		commonlib.servicelog(self.name, ...);
	end
end

----------------------------------
-- log_service
----------------------------------
local loggers_pool = {};
function log_service:GetLogger(logger_name)
	local logger = loggers_pool[logger_name or ""];
	if(not logger) then
		logger = logger_class:new():init(logger_name);
		loggers_pool[logger_name or ""] = logger;
		log_service:ConnectToLoggerThread(logger_name);
	end
	return logger;
end

-- private:
local logThreadLoaded;
function log_service:ConnectToLoggerThread(logger_name)
	if(this_thread_name ~= logger_thread_name and not logThreadLoaded) then
		logThreadLoaded = true;
		NPL.CreateRuntimeState(logger_thread_name, 0):Start();
		NPL.activate(log_address, {action="connect", name=logger_name, from_thread = this_thread_name});
	end
end

local function activate()
	local msg = msg;
	local action = msg.action;
	if(action == "log") then
		-- write to log file
		local logger = log_service.GetLogger(msg.name);
		logger:log(unpack(msg.args));
	elseif(action=="SetParams") then
		local logger = log_service.GetLogger(msg.name);
		logger:SetParams(msg.filename, msg.max_lines);
	elseif(action=="connect") then
		LOG.std(nil, "info", "log_service", "thread `%s` connected", msg.from_thread or "");
	end
end
NPL.this(activate);