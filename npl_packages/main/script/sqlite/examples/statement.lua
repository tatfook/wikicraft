--[[
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/sqlite/examples/statement.lua");
------------------------------------------------------------
]]
NPL.load("(gl)script/sqlite/sqlite3.lua");


db = sqlite3.open_memory()

db:exec([[ 

  CREATE TABLE test (
    id		INTEGER PRIMARY KEY,
    content	VARCHAR
  );
  
]])


local insert_stmt = assert( db:prepare("INSERT INTO test VALUES (NULL, ?)") )

function insert(data)
  insert_stmt:bind(data)
  insert_stmt:exec()
end


local select_stmt = assert( db:prepare("SELECT * FROM test") )

function select()
  for row in select_stmt:rows() do
    print(row.id, row.content)
  end
end


insert("Hello World")
print("First:")
select()

insert("Hello ParaEngine")
print("Second:")
select()

insert("Hello Sqlite3")
print("Third:")
select()
db:close();

