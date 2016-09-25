--[[
Title: test concurrency
Author(s): LiXizhi
Date: 2015/8/12
Desc: 
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/ide/System/test/test_concurrency.lua");
test_concurrency:testRuntimeError()
test_concurrency:testLongTask()
test_concurrency:testMessageQueueFull()
test_concurrency:testMemorySize()
------------------------------------------------------------
]]
-- define a new class
local test_concurrency = commonlib.gettable("System.Core.Test.test_concurrency");

function test_concurrency:testRuntimeError()
	NPL.this(function() 
		local msg = msg; -- important to keep a copy on stack since we go preemptive.
		local i=0;
		while(true) do
			i = i + 1;
			echo(tostring(msg.name)..i);
			if(i==40) then
				error("test runtime error");
			end
		end
	end, {PreemptiveCount = 100, MsgQueueSize=10, filename="tests/testRuntimeError"});
	NPL.activate("tests/testRuntimeError", {name="1"});
	NPL.activate("tests/testRuntimeError", {name="1000"});
end

-- dummy() function force JIT compiled code to count one instruction.
function test_concurrency:testPreemptiveCount()
	NPL.this(function() 
		local msg = msg;
		while(true) do
			dummy();
		end
	end, {PreemptiveCount = 100, MsgQueueSize=10, filename="tests/testPreemptiveCount"});
	NPL.activate("tests/testPreemptiveCount", {name="1"});
end

function test_concurrency:testClearMessage()
	NPL.this(function() 
		local msg = msg;
		echo(msg); 
		local i=0;
		while(true) do
			dummy();
			i=i+1;
			if(i==1000) then
				echo("cleared")

				commonlib.TimerManager.SetTimeout(function()
					NPL.activate("tests/testClearMessage", {name="2"});
				end, 1000);

				NPL.this(nil, {clear=true, filename="tests/testClearMessage"});
			end
		end
	end, {PreemptiveCount = 100, MsgQueueSize=10, filename="tests/testClearMessage"});
	NPL.activate("tests/testClearMessage", {name="1"});
	NPL.activate("tests/testClearMessage", {name="should not be called"});
end

function test_concurrency:testLongTask()
	NPL.this(function() 
		local msg = msg; -- important to keep a copy on stack since we go preemptive.
		local i=0;
		while(true) do
			i = i + 1;
			echo(i);
		end
	end, {PreemptiveCount = 100, MsgQueueSize=10, filename="tests/testLongTask"});
	NPL.activate("tests/testLongTask", {name="1"});
end

function test_concurrency:testMessageQueueFull()
	NPL.this(function() 
		local msg = msg; -- important to keep a copy on stack since we go preemptive.
		local i=0;
		for i=1, 1000 do
			i = i + 1;
		end
		echo({"finished", msg});
	end, {PreemptiveCount = 100, MsgQueueSize=3, filename="tests/testMessageQueueFull"});
	for i=1, 10 do
		NPL.activate("tests/testMessageQueueFull", {index=i});	
	end
	-- result: only the first three calls will finish.
end

function test_concurrency:testMemorySize()
	__rts__:SetMsgQueueSize(100000);
	for i=1, 10000 do
		NPL.this(function() 
			local msg = msg; -- important to keep a copy on stack since we go preemptive.
			for i=1, math.random(1,1000) do
				msg.i = i;	
			end
			echo(msg);
		end, {PreemptiveCount = 10, MsgQueueSize=1000, filename="tests/testMemorySize"..i});
		NPL.activate("tests/testMemorySize"..i, {index=i});	
	end
	-- TODO: use a timer to check when it will finish. 
end

function test_concurrency:testThroughput()
	__rts__:SetMsgQueueSize(100000);
	for i=1, 10000 do
		NPL.this(function() 
			local msg = msg;
			while(true) do
				echo(msg)
			end
		end, {PreemptiveCount = 10, MsgQueueSize=3, filename="tests/testThroughput"..i});
		NPL.activate("tests/testThroughput"..i, {index=i});	
	end
end