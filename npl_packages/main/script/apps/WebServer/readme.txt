---+ NPL Web Server (HTTP)
| author | LiXizhi |
| date | 2011.6.28 |

---++ introduction
NPL web server has two implementations. 
The old implementation called httpd.lua uses luasocket(socket.dll) for tcp functions. It uses copas (coroutines) to handle all requests using the same thread. 
The new implementation uses NPL's own async messaging system. It is both faster and more flexiable.

---++ Website Examples
   - "script/apps/WebServer/admin" is a NPL based web site framework similar to the famous WordPress.org. It is recommended that you xcopy all files in it to your own web root directory and work from there. 
   - "script/apps/WebServer/test" is a test site, where you can see the test code. 

---+++ starting a web server programmatically
Starting from a web root directory
<verbatim>
	NPL.load("(gl)script/apps/WebServer/WebServer.lua");
	WebServer:Start("script/apps/WebServer/test");
</verbatim>

There can be a "webserver.config.xml" file in the web root directory. see below.
if no config file is found, default.webserver.config.xml is used, which will serve *.lua, *.page, and all static files in the root directory. 

---+++ starting a web server from shell loop
e.g. bootstrapper="script/apps/WebServer/shell_loop_webserver.lua"
e.g. bootstrapper="script/apps/WebServer/shell_loop_webserver.lua" config="script/apps/WebServer/test/webserver.config.xml"
| config | can be omitted which defaults to config/WebServer.config.xml |

---++ Web Server configuration file
More info, see script/apps/WebServer/test/webserver.config.xml
<verbatim>
  <!--which HTTP ip and port this server listens to. -->
  <servers>
    <!-- currently only one server per thread is supported. In future we will support multiple. 
    @param host: which ip port to listen to. if * it means all.
    @thread_name: which NPL host_state_name (thread) this server runs on. if "" or omitted, it means the calling thread. 
     one thread can only host one http server. 
    -->
    <server host="*" port="8080" host_state_name="">
      <defaultHost rules_id="simple_rule"></defaultHost>
      <virtualhosts>
        <host name="www.sitename.com" rules_id="simple_rule"></host>
      </virtualhosts>
    </server>
  </servers>

  <!--rules used when starting a web server. Multiple rules with different id can be defined. --> 
  <rules id="simple_rule">
    <!--URI remapping example-->
    <rule match="^[^%./]*/$" with="WebServer.redirecthandler" params='{"readme.txt"}'></rule>
    <!--cgiluahandler example-->
    <!--<rule match='{"%.lp$", "%.lp/.*$", "%.lua$", "%.lua/.*$" }' with="WebServer.cgiluahandler.makeHandler" params='web/test'></rule>-->
    <!--filehandler example, base dir is where the root file directory is. -->
    <rule match="." with="WebServer.filehandler" params='{baseDir = "%CD%"}'></rule>
  </rules>

</verbatim>

Each server can have a default host and multiple virtual hosts.  Each host must be associated with a rule_id.
The rule_id is looked up in the rules node, which contains multiple rules specifying how request url is mapped to their handlers. 
Each rule contains three attributes: match, with and params. 
   * "match" is a regular expresion string or a array table of reg strings like shown in above sample code. 
   * "with" is a handler function which will be called when url matches "match". 
More precisely, it is handler function maker, that returns the real handler function(request, response) end.
When rules are compiled at startup time, these maker functions are called just once to generate the actual handler function. 
   * "params" is an optional string or table that will be passed to the handler maker function to generate the real handler function.

The rules are applied in sequential order as they appeared in the config file. 
So they are usually defined in the order of redirectors, dynamic scripts, file handlers. 

---++ Handler Makers
Some common handlers are implemented in common_handlers.lua. Some of the most important ones are listed below

---++ WebServer.redirecthandler
It is the url redirect handler. it generate a handler that replaces "match" with "params"
<verbatim>
	<rule match="^[^%./]*/$" with="WebServer.redirecthandler" params='{"readme.txt"}'></rule>
</verbatim>
The above will redirect "http://localhost:8080/" to "http://localhost:8080/readme.txt".

---++ WebServer.filehandler  
It generate a handler that serves files in the directory specified in "params" or "params.baseDir".
<verbatim>
	<rule match="." with="WebServer.filehandler" params='{baseDir = "script/apps/WebServer"}'></rule>
	alternatively:
	<rule match="." with="WebServer.filehandler" params='script/apps/WebServer'></rule>
</verbatim>
The above will map "http://localhost:8080/readme.txt" to the disk file "script/apps/WebServer/readme.txt"


---++ (Deprecated for npl_http) WebServer.makeGenericHandler  
wsapi serves web requests using NPL script files from a specified directory. Both file and pkg files are supported. 
If file is modified, the module will be reloaded automatically without restarting the server. 

<verbatim>
	<rule match="%.lua$" with="WebServer.makeGenericHandler" params='{docroot="script/apps/WebServer/test", params={}, extra_vars=nil}'></rule>
</verbatim>
The above will map "http://localhost:8080/helloworld.lua" to the script file "script/apps/WebServer/test/helloworld.lua"

where "helloworld.lua" is a wsapi application mod file that must contain a run(wsapi_env) function. 
The run function takes an environment and return the status code, response headers and an output iterator.
A very simple application is the following(see helloworld.lua):
<verbatim>
module(..., package.seeall)
function run(wsapi_env)
	local headers = { ["Content-type"] = "text/html" }

	local function hello_text()
		coroutine.yield("<html><body>")
		coroutine.yield("<p>Hello from NPL/ParaEngine Wsapi!</p>")
		coroutine.yield("<p>PATH_INFO: " .. wsapi_env.PATH_INFO .. "</p>")
		coroutine.yield("<p>SCRIPT_NAME: " .. wsapi_env.SCRIPT_NAME .. "</p>")
		coroutine.yield("</body></html>")
	end

	return 200, headers, coroutine.wrap(hello_text)
end
</verbatim>

---++ WebServer.npl_script_handler 
Currently it is the same as WebServer.makeGenericHandler. 
In future we will support remote handlers that runs in another thread asynchrounously. 
So it is recommended for user to use this function instead of WebServer.makeGenericHandler
serving request using npl files to generate dynamic response. This is very useful for REST-like web service in XML or json format. 
<verbatim>
	<rule match="%.lua$" with="WebServer.npl_script_handler" params='script/apps/WebServer/test'></rule>
	alternatively:
	<rule match="%.lua$" with="WebServer.npl_script_handler" params='{docroot="script/apps/WebServer/test"}'></rule>
</verbatim>
The above will map "http://localhost:8080/helloworld.lua" to the script file "script/apps/WebServer/test/helloworld.lua"

---++ TODO: WebServer.cgiluahandler.makeHandler
http://www.fastcgi.com/drupal/#TheDevKit

---++ Change log
	- 2015.6.8: added npl_http implementation. deprecated old httpd implementation. 
	- 2011.6.28: httpd implementation added. 
