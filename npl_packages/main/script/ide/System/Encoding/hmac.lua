--[[
Title: hmac
Author(s): LiXizhi, reference https://github.com/kikito/sha1.lua
Desc: 
Use Lib:
-------------------------------------------------------
NPL.load("(gl)script/ide/System/Encoding/hmac.lua");
local hmac = commonlib.gettable("System.Encoding.hmac");
echo(hmac.digest(nil, "this is a message",   "my secret key", "hex"))
echo(hmac.digest("md5", "this is a message",   "my secret key"))
echo(hmac.digest("sha1", "this is a message",   "my secret key", "base64"))
-------------------------------------------------------
]]
NPL.load("(gl)script/ide/math/bit.lua");
NPL.load("(gl)script/ide/System/Encoding/base64.lua");
local Encoding = commonlib.gettable("System.Encoding");
local hmac = commonlib.gettable("System.Encoding.hmac");
local floor,modf = math.floor,math.modf;
local char,format,rep = string.char,string.format,string.rep;

local BLOCK_SIZE = 64; -- 512 bits

-- splits an 8-bit number into 8 bits, returning all 8 bits as booleans
local function byte_to_bits(b)
	local b = function(n)
		local b = floor(b/n)
		return b%2==1
	end
	return b(1),b(2),b(4),b(8),b(16),b(32),b(64),b(128)
end

-- builds an 8bit number from 8 booleans
local function bits_to_byte(a,b,c,d,e,f,g,h)
	local function n(b,x) return b and x or 0 end
	return n(a,1)+n(b,2)+n(c,4)+n(d,8)+n(e,16)+n(f,32)+n(g,64)+n(h,128)
end

-- bitwise "xor" function for 2 8bit numbers
local bxor = function(a,b)
  local A,B,C,D,E,F,G,H = byte_to_bits(b)
  local a,b,c,d,e,f,g,h = byte_to_bits(a)
  return bits_to_byte(
    A ~= a, B ~= b, C ~= c, D ~= d,
    E ~= e, F ~= f, G ~= g, H ~= h)
end

-- building the lookuptables ahead of time (instead of littering the source code
-- with precalculated values)
local xor_with_0x5c = {}
local xor_with_0x36 = {}
for i=0, 255 do
  xor_with_0x5c[char(i)] = char(bxor(i,0x5c))
  xor_with_0x36[char(i)] = char(bxor(i,0x36))
end

local function dump(hash)
  local hex = {}
  for i = 1, #hash do
    hex[i] = string.format("%02x", string.byte(hash, i))
  end
  return table.concat(hex)
end

local function GetHashFunc(algorithm)
	local hashFunc;
	if(algorithm == "sha1") then
		if(not Encoding.sha1) then
			NPL.load("(gl)script/ide/System/Encoding/sha1.lua");
		end
		hashFunc = Encoding.sha1;
	elseif(algorithm == "md5") then
		hashFunc = ParaMisc.md5
	end
	return hashFunc or ParaMisc.md5;
end
-- @param algorithm: hash function name: "sha1", "md5". if nil, default to md5
-- @param text: text to encode
-- @param key: secret key
-- @param format: "hex" or "base64". if nil it is raw format returned by hash function, could be binary
function hmac.digest(algorithm, text, key, format)
	local hashFunc = GetHashFunc(algorithm);

	if #key > BLOCK_SIZE then
		key = hashFunc(key);
	end
	
	local key_xord_with_0x36 = key:gsub('.', xor_with_0x36) .. rep(char(0x36), BLOCK_SIZE - #key)
	local key_xord_with_0x5c = key:gsub('.', xor_with_0x5c) .. rep(char(0x5c), BLOCK_SIZE - #key)

	if(not format) then
		format = "base64"
	elseif(format == "binary") then
		format = nil;
	end
	local result = hashFunc(key_xord_with_0x5c .. hashFunc(key_xord_with_0x36 .. text));

	if(format == "hex") then
		result = dump(result);
	elseif(format == "base64") then
		result = Encoding.base64(result)
	end
	return result;
end