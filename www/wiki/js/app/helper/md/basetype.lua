
local string_meta_table = getmetatable("")
local string_meta_table__index = string_meta_table.__index

-- 子串查找
local function string_indexOf(str, substr) 
	for i = 1, #str do
		if string.sub(str, i, i + #substr - 1) == substr  then
			return i
		end
	end
	return nil
end

-- 字符串裁剪
local function string_trim(str, pattern, pos)
	pattern = pattern or "%s"
	if pos == "left" then
		return string.match(str, '^[' .. pattern .. ']*(.*)$')
	elseif pos == "right" then
		return string.match(str, '^(.-)[' .. pattern .. ']*$')
	else
		return string.match(str, '^[' .. pattern .. ']*(.-)[' .. pattern .. ']*$')
	end
end

-- 子串
local function string_substring(str, s, e)
	return string.sub(str, s, e)
end

-- 分隔
local function string_split(str, sep)
	local list = {}
	local str = str .. sep

	for word in string.gmatch(str, '([^' .. sep .. ']*)' .. sep) do
		list[#list+1] = word
	end

	return list
end

-- 正则匹配
local function string_match(str, pattern) 
	return string.match(str, pattern)
end

-- 正则替换
local function string_replace(str, pattern, dststr)
	return string.gsub(str, pattern, dststr)
end

-- 增加字符串索引访问接口
string_meta_table.__index = function(self, key) 
	if type(key) == "number" and key > 0 and key < #self then
		return string.char(string.byte(self, key))
	end

	if key == "indexOf" then
		return function(substr) return string_indexOf(self, substr) end
	elseif key == "trim" then
		return function(pattern, pos) return string_trim(self, pattern, pos) end
	elseif key == "substring" then
		return function(s, e) return string_substring(self, s, e) end
	elseif key == "split" then
		return function(sep) return string_split(self, sep) end
	elseif key == "match" then
		return function(pattern) return string_match(self, pattern) end
	elseif key == "replace" then
		return function(pattern, dststr) return string_replace(self, pattern, dststr) end
	else
		return string_meta_table__index[key];
	end
	return nil
end

string_meta_table.__add = function(str1, str2) 
	return str1 .. str2
end

