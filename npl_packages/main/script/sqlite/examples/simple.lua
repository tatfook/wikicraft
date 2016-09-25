--[[
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/sqlite/examples/simple.lua");
------------------------------------------------------------
]]
NPL.load("(gl)script/sqlite/sqlite3.lua");

db = sqlite3.open_memory()
--db = sqlite3.open("temp/examples_simple.db")

db:exec([[
  CREATE TABLE test (
    id		INTEGER PRIMARY KEY,
    content	VARCHAR
  );
  
  INSERT INTO test VALUES (NULL, 'Hello World');
  INSERT INTO test VALUES (NULL, 'Hello ParaEngine');
  INSERT INTO test VALUES (NULL, 'Hello Sqlite3')
]])


for row in db:rows("SELECT * FROM test") do
  print(row.id, row.content)
end

db:close();

