--[[
Title: JSON Web Tokens
Author(s): LiXizhi, Reference https://github.com/x25/luajwt
Date: 2016/6/8
Desc: 
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/ide/System/Encoding/jwt.lua");
local jwt = commonlib.gettable("System.Encoding.jwt");
local key = "example_key"
local payload = {
    iss = "12345678",
    nbf = os.time(),
    exp = os.time() + 3600,
}
-- encode
local alg = "MD5" -- (default)
local token, err = jwt.encode(payload, key, alg)
-- token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIx(cutted)...
-- decode and validate
local validate = true -- validate signature, exp and nbf (default: true)
local decoded, err = jwt.decode(token, key, validate)
-- decoded: { ["iss"] = 12345678, ["nbf"] = 1405108000, ["exp"] = 1405181916 }
-- only decode
local unsafe, err = jwt.decode(token)
-- unsafe:  { ["iss"] = 12345678, ["nbf"] = 1405108000, ["exp"] = 1405181916 }
------------------------------------------------------------
]]
NPL.load("(gl)script/ide/System/Encoding/base64.lua");
NPL.load("(gl)script/ide/Json.lua");
NPL.load("(gl)script/ide/System/Encoding/hmac.lua");
local hmac = commonlib.gettable("System.Encoding.hmac");
local Encoding = commonlib.gettable("System.Encoding");
local type = type;

local jwt = commonlib.gettable("System.Encoding.jwt");

local alg_sign = {
	['HS256'] = function(data, key) return hmac.digest('sha256', data, key) end,
	['HS384'] = function(data, key) return hmac.digest('sha384', data, key) end,
	['HS512'] = function(data, key) return hmac.digest('sha512', data, key) end,
	['HS1'] = function(data, key) return hmac.digest('sha1', data, key) end,
	['MD5'] = function(data, key) return hmac.digest('md5', data, key) end,
}

local alg_verify = {
	['HS256'] = function(data, signature, key) return signature == alg_sign['HS256'](data, key) end,
	['HS384'] = function(data, signature, key) return signature == alg_sign['HS384'](data, key) end,
	['HS512'] = function(data, signature, key) return signature == alg_sign['HS512'](data, key) end,
	['HS1'] = function(data, signature, key) return signature == alg_sign['HS1'](data, key) end,
	['MD5'] = function(data, signature, key) return signature == alg_sign['MD5'](data, key) end,
}

local function b64_encode(input)	
	local result = Encoding.base64(input)
	result = result:gsub('+','-'):gsub('/','_'):gsub('=','')
	return result
end

local function b64_decode(input)
	local reminder = #input % 4
	if reminder > 0 then
		local padlen = 4 - reminder
		input = input .. string.rep('=', padlen)
	end
	input = input:gsub('-','+'):gsub('_','/')
	return Encoding.unbase64(input)
end

local function tokenize(str, div, len)
	local result, pos = {}, 0

	for st, sp in function() return str:find(div, pos, true) end do

		result[#result + 1] = str:sub(pos, st-1)
		pos = sp + 1

		len = len - 1

		if len <= 1 then
			break
		end
	end

	result[#result + 1] = str:sub(pos)

	return result
end

-- @param data: any table object. {exp=os.time()+3600, nbf=os.time()}, expire time can be set. 
-- @param key: string secret key
-- @param alg: hash function algorithm. if nil default to "MD5", others are "HS1", "HS256"
-- @param expireFromNow: number of seconds to expire from current time. 3600 means 1 hour.
-- if this is not nil, we will automatically set data.exp if not set. 
-- @return data, err: 
function jwt.encode(data, key, alg, expireFromNow)
	if type(data) ~= 'table' then return nil, "Argument #1 must be table" end
	if type(key) ~= 'string' then return nil, "Argument #2 must be string" end

	alg = alg or "MD5" 

	if(expireFromNow and not data.exp) then
		data.exp = os.time() + expireFromNow;
	end
	if not alg_sign[alg] then
		return nil, "Algorithm not supported"
	end

	local header = { typ='JWT', alg=alg }
	local segments = {
		b64_encode(commonlib.Json.Encode(header)),
		b64_encode(commonlib.Json.Encode(data))
	}
	local signing_input = table.concat(segments, ".")
	local signature = alg_sign[alg](signing_input, key)
	segments[#segments+1] = b64_encode(signature)
	return table.concat(segments, ".")
end


-- @param verify: whether to validate signature, exp and nbf (default: true)
-- @return decoded, err
function jwt.decode(data, key, verify)
	if key and verify == nil then verify = true end
	if type(data) ~= 'string' then return nil, "Argument #1 must be string" end
	if verify and type(key) ~= 'string' then return nil, "Argument #2 must be string" end

	local token = tokenize(data, '.', 3)

	if #token ~= 3 then
		return nil, "Invalid token"
	end

	local headerb64, bodyb64, sigb64 = token[1], token[2], token[3]

	local header, body, sig = {}, {}, b64_decode(sigb64);
	if ( not NPL.FromJson(b64_decode(headerb64), header) or not NPL.FromJson(b64_decode(bodyb64), body)) then
		return nil, "Invalid json"
	end

	if verify then
		if not header.typ or header.typ ~= "JWT" then
			return nil, "Invalid typ"
		end

		if not header.alg or type(header.alg) ~= "string" then
			return nil, "Invalid alg"
		end

		if body.exp and type(body.exp) ~= "number" then
			return nil, "exp must be number"
		end

		if body.nbf and type(body.nbf) ~= "number" then
			return nil, "nbf must be number"
		end

		if not alg_verify[header.alg] then
			return nil, "Algorithm not supported"
		end

		if not alg_verify[header.alg](headerb64 .. "." .. bodyb64, sig, key) then
			return nil, "Invalid signature"
		end
		if(body.exp or body.nbf) then
			local time = os.time(); -- time seconds since epoch
			if body.exp and time>= body.exp then
				return nil, "Not acceptable by exp"
			end

			if body.nbf and time < body.nbf then
				return nil, "Not acceptable by nbf"
			end
		end
	end
	return body
end