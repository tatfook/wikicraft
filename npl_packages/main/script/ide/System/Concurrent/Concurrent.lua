--[[
Title: Concurrent
Author(s): LiXizhi@yeah.net
Date: 2016/6/24
Desc: Implement several concurrency model in NPL. 

### Preemptive NPL Neuron File Actication
By default NPL activate function is non-preemptive, it is the programmer's job to finish 
execution within reasonable time slice. The default non-preemptive mode gives the programmer 
full control of how code is executed and different neuron files can easily share data using global tables in the same thread.

On the other hand, NPL also allows you to do preemptive activation, in which the NPL runtime will count
virtual machine instructions until it reaches a user-defined value (such as 1000) and then 
automatically yield(pause) the activate function. The function will be resumed automatically
in the next time slice. NPL time slice is by default about 16ms (i.e. 60FPS). 

To make file activate function preemptive, simply pass a second parameter `{PreemptiveCount, MsgQueueSize, [filename|name], clear}` to `NPL.this` like below:
- PreemptiveCount: is the number of VM instructions to count before it yields. If nil or 0, it is non-preemptive.
JIT-complied code by default does not count as instructions, so call `dummy()` to force one instruction count, but do not call it in tight loop.
- MsgQueueSize: Max message queue size of this file, if not specified, it is same as the NPL thread's message queue size. 
- filename|name: virtual filename, if not specified, the current file being loaded is used. 
- clear: clear all memory used by the file, including its message queue. Normally one never needs to clear. 
A neuron file without messages takes less than 100 bytes of memory (mostly depending on the length's of its filename)

```lua
-- this is a demo of how to use preemptive activate function. 
NPL.this(function() 
	local msg = msg; -- important to keep a copy on stack since we go preemptive.
	local i=0;
	while(true) do
		i = i + 1;
		echo(tostring(msg.name)..i);
		dummy(); -- this always count as one instruction.
		if(i==400) then
			error("test runtime error");
		end
	end
end, {PreemptiveCount = 100, MsgQueueSize=10, filename="yourfilename.lua"});
```
You can test your code with:
```lua
NPL.activate("yourfilename.lua", {name="hi"});
```
Facts about preemptive activate function:
- It allows you to run tens of thousands of jobs concurrently in the same system thread. 
Each running job has its own stack and the memory overhead is about 450bytes. 
A neuron file without pending messages takes less than 100 bytes of memory (mostly depending on the length's of its filename).
The only limitation to the number of concurrent jobs is your system memory.
- There is a slight performance penalty on program speed due to counting VM instructions. 
- With preemptive activate function, the programmer should pay attention when 
making changes to shared data in the thread, since your function may be paused at any instruction.
The golden rule here is never make any changes to shared data, but use messages to exchange data.
- C/C++ API call is counted as one instruction, so if you call ParaEngine.Sleep(10), 
it will block all concurrent jobs on that NPL thread for 10 seconds. 
- Code in async callbacks (such as timer, remote api call) in activate function are NOT preemptive. 
Because callbacks are invoked from the context of other concurrent activate functions.

### References
see also `script/ide/System/test/test_concurrency.lua` for tests cases.

use the lib:
------------------------------------------------------------
NPL.load("(gl)script/ide/System/Concurrent/Concurrent.lua");
local Concurrent = commonlib.gettable("System.Concurrent");
------------------------------------------------------------
]]
local Concurrent = commonlib.gettable("System.Concurrent");

local env_imp = {};
local npl_page_env = {};
npl_page_env.__index = npl_page_env;

-- SECURITY: expose global _G to server env
setmetatable(npl_page_env, {__index = _G});

-- expose: msg in global. 
function npl_page_env:new(msg)
	local o = {
		msg = msg,
	};
	o._GLOBAL = o;
	setmetatable(o, self);
	return o;
end

local function CreateCoroutine(funcActivate, preemptiveInstructionCount)
	local env = npl_page_env:new()
	setfenv(funcActivate, env);
	local co = coroutine.create(function(f, msg)
		while f do
			env.msg = msg;
			local res, err = pcall(f, msg);
			if(not res) then
				LOG.std(nil, "error", "category", "activation error:"..tostring(err));
			end
			f, msg = coroutine.yield("finished");
		end
	end);
end

-- @param funcActivate: the actual activate function. 
-- @param preemptiveInstructionCount: default to 2000
function Concurrent.MakeActivate(funcActivate, preemptiveInstructionCount)
	local isProcessing = false;
	local co;
	-- return a coroutine wrapper that will yield every 
	return function()
		co = co or CreateCoroutine(funcActivate, preemptiveInstructionCount);
		
		local res, err = coroutine.resume(co, funcActivate, msg);
		if(res) then
			if(err == "processing") then
				if(not isProcessing) then
					isProcessing = true;
				end
			elseif(err == "finished") then
				if(isProcessing) then
					isProcessing = false;
				end
			end
		else
			LOG.std(nil, "error", "category", "activation error:"..tostring(err));
		end
	end
end

