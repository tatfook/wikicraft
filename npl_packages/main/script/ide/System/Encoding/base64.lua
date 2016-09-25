--[[
Title: base64
Author(s): LiXizhi
Desc: 
Use Lib:
-------------------------------------------------------
NPL.load("(gl)script/ide/System/Encoding/base64.lua");
local Encoding = commonlib.gettable("System.Encoding");

assert(Encoding.base64("hello world")=="aGVsbG8gd29ybGQ=");
assert(Encoding.unbase64("aGVsbG8gd29ybGQ=")=="hello world");
-------------------------------------------------------
]]
NPL.load("(gl)script/ide/math/bit.lua");
local Encoding = commonlib.gettable("System.Encoding");

local string_char = string.char;

local bytes = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

local endings = { '', '==', '=' };

local function enc1(x) 
    local r,b='',x:byte()
    for i=8,1,-1 do r=r..(b%2^i-b%2^(i-1)>0 and '1' or '0') end
    return r;
end
local function enc2(x)
    if (#x < 6) then return '' end
    local c=0
    for i=1,6 do c=c+(x:sub(i,i)=='1' and 2^(6-i) or 0) end
    return bytes:sub(c+1, c+1);
end

-- encoding
function Encoding.base64(data)
    return ((data:gsub('.', enc1)..'0000'):gsub('%d%d%d?%d?%d?%d?', enc2)..endings[#data%3+1])
end

local ibytes = {
	['A'] = 00, ['B'] = 01, ['C'] = 02, ['D'] = 03, ['E'] = 04, ['F'] = 05, 
	['G'] = 06, ['H'] = 07, ['I'] = 08, ['J'] = 09, ['K'] = 10, ['L'] = 11, 
	['M'] = 12, ['N'] = 13, ['O'] = 14, ['P'] = 15, ['Q'] = 16, ['R'] = 17, 
	['S'] = 18, ['T'] = 19, ['U'] = 20, ['V'] = 21, ['W'] = 22, ['X'] = 23, 
	['Y'] = 24, ['Z'] = 25, ['a'] = 26, ['b'] = 27, ['c'] = 28, ['d'] = 29, 
	['e'] = 30, ['f'] = 31, ['g'] = 32, ['h'] = 33, ['i'] = 34, ['j'] = 35, 
	['k'] = 36, ['l'] = 37, ['m'] = 38, ['n'] = 39, ['o'] = 40, ['p'] = 41, 
	['q'] = 42, ['r'] = 43, ['s'] = 44, ['t'] = 45, ['u'] = 46, ['v'] = 47, 
	['w'] = 48, ['x'] = 49, ['y'] = 50, ['z'] = 51, ['0'] = 52, ['1'] = 53, 
	['2'] = 54, ['3'] = 55, ['4'] = 56, ['5'] = 57, ['6'] = 58, ['7'] = 59, 
	['8'] = 60, ['9'] = 61, ['+'] = 62, ['/'] = 63, ['='] = 64
}

local function dec1(x)
    if (x == '=') then return '' end
    local r,f='', ibytes[x];
    for i=6,1,-1 do r=r..(f%2^i-f%2^(i-1)>0 and '1' or '0') end
    return r;
end

local function dec2(x)
    if (#x ~= 8) then return '' end
    local c=0
    for i=1,8 do c=c+(x:sub(i,i)=='1' and 2^(8-i) or 0) end
    return string_char(c)
end

-- decoding
function Encoding.unbase64(data)
    data = data:gsub('[^'..bytes..'=]', '')
    return (data:gsub('.', dec1):gsub('%d%d%d?%d?%d?%d?%d?%d?', dec2))
end