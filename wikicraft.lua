NPL.load("(gl)script/apps/WebServer/WebServer.lua");
WebServer:Start("www/", "0.0.0.0", 8099);
-- WebServer:Start("script/apps/WebServer/admin", "0.0.0.0", 80);

NPL.this(function()  end);



