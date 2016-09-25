--[[
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/sqlite/examples/smart.lua");
------------------------------------------------------------
]]
NPL.load("(gl)script/sqlite/sqlite3.lua");


db = sqlite3.open_memory()

db:exec([[ CREATE TABLE test (id, content) ]])

stmt = db:prepare([[ INSERT INTO test VALUES (:key, :value) ]])  

stmt:bind{  key = 1,  value = "Hello World"    }:exec()
stmt:bind{  key = 2,  value = "Hello Lua"      }:exec()
stmt:bind{  key = 3,  value = "Hello Sqlite3"  }:exec()

for row in db:rows("SELECT * FROM test") do
  print(row.id, row.content)
end

db:close();

