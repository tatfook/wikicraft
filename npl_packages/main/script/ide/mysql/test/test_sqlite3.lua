--[[
Title: test lua sqlite3 interface
Author(s): 
Date: 2013/1/31
Desc: 
Use Lib:
-------------------------------------------------------
NPL.load("(gl)script/ide/mysql/test/test_sqlite3.lua");
local tests = commonlib.gettable("commonlib.sqlite3.tests");
tests.GeneralTest()
-------------------------------------------------------
]]

NPL.load("(gl)script/ide/mysql/sqlite3.lua");
local luasql = commonlib.luasql;

local tests = commonlib.gettable("commonlib.sqlite3.tests");

function tests.GeneralTest()
	local env, con, res, row;

	-- create environment object
	env = assert (luasql.sqlite3())
	-- connect to data source
	-- env:connect(databasename[,username[,password[,hostname[,port]]]])
	con = assert (env:connect("database/test.db"))

	-- reset our table
	res = con:execute"DROP TABLE people"
	res = assert (con:execute[[
	  CREATE TABLE people(
		name  varchar(50),
		email varchar(50)
	  )
	]])
	-- add a few elements
	local list = {
	  { name="Jose das Couves", email="jose@couves.com", },
	  { name="Manoel Joaquim", email="manoel.joaquim@cafundo.com", },
	  { name="Maria das Dores", email="maria@dores.com", },
	}
	local i,p;
	for i, p in pairs (list) do
	  res = assert (con:execute(string.format([[
		INSERT INTO people
		VALUES ('%s', '%s')]], p.name, p.email)
	  ))
	end
	-- retrieve a cursor
	cur = assert (con:execute"SELECT name, email from people")
	-- print all rows
	row = cur:fetch ({}, "a")	-- the rows will be indexed by field names
	while row do
	  echo(string.format("Name: %s, E-mail: %s", row.name, row.email))
	  row = cur:fetch (row, "a")	-- reusing the table of results
	end
	-- close everything
	cur:close()
	con:close()
	env:close()
end