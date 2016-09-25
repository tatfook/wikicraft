--[[
Title: Async.waterfall
Author(s): LiXizhi@yeah.net
Date: 2016/7/6
Desc: inspired by https://github.com/caolan/async
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/ide/System/Concurrent/Async.lua");
local Async = commonlib.gettable("System.Concurrent.Async");

Async.waterfall({
    function(callback)
        callback(nil, 'one', 'two');
    end,
    function(arg1, arg2, callback) 
        assert(arg1  == 'one' and arg2 == 'two');
        callback(nil, 'three');
    end,
    function(arg1, callback) 
		assert(arg1  == 'three');
        callback(nil, 'done');
    end
}, function (err, result)
	assert(result == 'done');
	echo(result);
end);
------------------------------------------------------------
]]
NPL.load("(gl)script/ide/System/Concurrent/onlyOnce.lua");
local onlyOnce = commonlib.gettable("System.Concurrent.onlyOnce");
local once = commonlib.gettable("System.Concurrent.once");
local noop = commonlib.gettable("System.Concurrent.noop");

local Async = commonlib.gettable("System.Concurrent.Async");

-- Runs the `tasks` array of functions in series, each passing their results to
-- the next in the array. However, if any of the `tasks` pass an error to their
-- own callback, the next function is not executed, and the main `callback` is
-- immediately called with the error.
-- @static
-- @param tasks: table array of functions.
-- @param callback: an optional callback(err, [results]) to run once all the
--  functions have completed. This will be passed the results of the last task's callback.
function Async.waterfall(tasks, callback)
	callback = once(callback or noop);
    if (not tasks) then return callback("First argument to waterfall must be an array of functions"); end
    if (#tasks == 0) then return callback() end
    local taskIndex = 0;

	local function nextTask(...) 
        if (taskIndex == #tasks) then
            return callback(nil, ...);
        end

		local taskCallback = onlyOnce(function(err, ...)
			if (err) then
				return callback(err, ...);
			end
			nextTask(...);
		end);

		taskIndex = taskIndex + 1;
        local task = tasks[taskIndex];
		local arg = {...};
		arg[select("#", ...) + 1] = taskCallback;
		task(unpack(arg));
    end
    nextTask();
end