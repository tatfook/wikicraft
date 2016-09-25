--[[
Author: LiXizhi
Date: 2009-1-18
Desc: testing timer
-----------------------------------------------
NPL.load("(gl)script/ide/test/test_timer.lua");
-----------------------------------------------
]]
NPL.load("(gl)script/ide/LibStub.lua");

local mytimer = commonlib.Timer:new({
	callbackFunc = function(timer)
		commonlib.log(timer.id.." on timer\n")
	end});

-- %TESTCASE{"Test_Timer_ChangeTimer", func = "Test_Timer_ChangeTimer", input = {dueTime=0, period=5000},}%
function Test_Timer_ChangeTimer(input)
	mytimer:Change(input.dueTime, input.period)
end	
	
--passed 2009-1-18 LiXizhi
function Test_Timer_Common()
	-- start the timer after 0 milliseconds, and signal every 5000 millisecond
	mytimer:Change(0, 5000)
end	

function Test_Timer_StartOnce()
	-- start the timer after 5000 milliseconds, and stop it immediately.
	mytimer:Change(1000, nil)
end	

function Test_Timer_KillTimer()
	-- kill timer
	mytimer:Change(nil, nil)
end	
