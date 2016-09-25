==============================================
Title:		Sqlite3 for ParaEngine
Author:		LiXizhi
Note:		Lua Sqlite wrapper in ParaEngine is mainly based on the work of Michael Roth <mroth@nessie.de>, 2005.
			The wrapper code is free, please read the original author's license in other files of the sqlite folder. 
version:	0.9
date:		2006/5/5
==============================================

Changes
============
 - 2010.5.23: stmt_class.exec() added a wait on busy server parameter. This is the default behavior for localserver. see sqlite3.lua line 725


Description
============
Sqlite3 is the local database solution in ParaEngine. 


Guide
======
call NPL.load("(gl)script/sqlite/sqlite3.lua"); before one can use the sqlite3 wrapper. 
Take a look at the standalone samples at script/sqlite/examples/ folder. 
Read the documentation of both sql, sqlite3 and lua-sqlite3.  
The documentation of lua-sqlite3 is at script/sqlite/documentation.html

There are some tests files written by the author at
NPL.load("(gl)script/sqlite/tests.lua");
NPL.load("(gl)script/sqlite/examples/simple.lua");
NPL.load("(gl)script/sqlite/examples/statement.lua");
Just put the above line of code in any script that got run once, and check the ParaEngine's log file for test result.

Internally, ParaEngine use luaopen_sqlite3() to dynamically load the sqlite3 related HAPI, please refer to script/sqlite/libluasqlite3-loader.lua
for more information.

Tools
============
SQLite Analyzer: a third party tool for database query with GUI.
<Hint> one can use NPL/LUA to write its own tools with GUI.