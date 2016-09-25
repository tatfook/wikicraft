--[[
Title: Concurrent.onlyOnce
Author(s): LiXizhi@yeah.net
Date: 2016/7/6
Desc: inspired by https://github.com/caolan/async
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/ide/System/Concurrent/onlyOnce.lua");
local onlyOnce = commonlib.gettable("System.Concurrent.onlyOnce");
local once = commonlib.gettable("System.Concurrent.once");
local noop = commonlib.gettable("System.Concurrent.noop");
------------------------------------------------------------
]]
local Concurrent = commonlib.gettable("System.Concurrent");

-- make a function that can only be called once
-- throw fatal exception, if called more than once
function Concurrent.onlyOnce(fn)
    return function(...) 
        if (not fn) then assert(false, "Callback was already called."); end
        local callFn = fn;
        fn = nil;
        callFn(...);
    end;
end

-- make a function that can only be called once
-- do nothing if called more than once.
function Concurrent.once(fn)
    return function(...) 
        if (not fn) then return end
        local callFn = fn;
        fn = nil;
        callFn(...);
    end;
end

-- no operation
function Concurrent.noop()
end