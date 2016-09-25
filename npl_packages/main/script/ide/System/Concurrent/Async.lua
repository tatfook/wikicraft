--[[
Title: Async root file
Author(s): LiXizhi@yeah.net
Date: 2016/7/6
Desc: inspired by https://github.com/caolan/async
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/ide/System/Concurrent/Async.lua");
local Async = commonlib.gettable("System.Concurrent.Async");
------------------------------------------------------------
]]
NPL.load("(gl)script/ide/System/Concurrent/waterfall.lua");

local Async = commonlib.gettable("System.Concurrent.Async");

