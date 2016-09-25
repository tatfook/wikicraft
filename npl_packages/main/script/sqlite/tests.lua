--[[
Desc: test results can be found in the log file of ParaEngine.
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/sqlite/tests.lua");
------------------------------------------------------------
]]

NPL.load("(gl)script/sqlite/lunit.lua");
NPL.load("(gl)script/sqlite/tests-sqlite3.lua");
NPL.load("(gl)script/sqlite/tests-luasql.lua");

lunit.run()

