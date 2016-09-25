--[[
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/sqlite/examples/function.lua");
------------------------------------------------------------
]]
NPL.load("(gl)script/sqlite/sqlite3.lua");

db = sqlite3.open_memory()

assert( db:exec([[
  
  CREATE TABLE test (col1, col2);
  
  INSERT INTO test VALUES (1, 2);
  INSERT INTO test VALUES (2, 4);
  INSERT INTO test VALUES (3, 6);
  INSERT INTO test VALUES (4, 8);
  INSERT INTO test VALUES (5, 10);

]]))


assert( db:set_function("my_sum", 2, function(a, b)
  return a + b
end))


for col1, col2, sum in db:cols("SELECT *, my_sum(col1, col2) FROM test") do
  print(col1, col2, sum)
end


db:close();