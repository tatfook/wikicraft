
NPL.load("(gl)script/ide/commonlib.lua")
NPL.load("(gl)script/ide/System/Concurrent/rpc.lua")

local rpc = commonlib.gettable("System.Concurrent.Async.rpc")

rpc:new():init("qiniu_sdk.qiniu_sdk", function(self, params) 
	if type(params) ~= "table" then
		return
	end

	local obj = {}

	obj.cmd = params.cmd
	obj.bucket = params.bucket
	obj.domain = params.domain
	obj.key = params.key
	obj.expires = params.expires
	obj.callback_url = params.callback_url

	NPL.call("lib/libQiNiuPlugin.so", obj)

	--log(msg)

	return msg
end, "lib/qiniu_sdk.lua")

