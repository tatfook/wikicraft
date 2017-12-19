
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


local strings = {
	name = "strings"
}

function strings:new(str) 

	return obj
end

function strings.indexOf(self, substr) 
	return string_indexOf(tostring(self), substr)
end

function strings.trim(self, pattern, pos)
	return string_trim(tostring(self), pattern, pos)
end

function strings.substring(self, s, e)
	return string_substring(tostring(self), s, e)
end

function strings.split(self, sep)
	return string_split(tostring(self), sep)
end

function strings.match(self, pattern)
	return string_match(tostring(self), pattern)
end

function strings.replace(self, pattern, dststr)
	return string_replace(tostring(self), pattern, dststr)
end

local string_meta_table = getmetatable("")
strings = setmetatable(strings, {
	__call = function(self, str)
		self.str = tostring(str)
		return self
	end,
	__tostring = function(self)
		return self.str
	end,
	__index = function(self, key)
		return function(self, ...) 
			local func =  string_meta_table.__index[key]
			return func(self.str, ...)
		end
	end,
	__concat = function(s1, s2) 
		return tostring(s1) .. tostring(s2)
	end,
	__add = function(s1, s2)
		return tostring(s1) .. tostring(s2)
	end,
	__eq = function(s1, s2) 
		return tostring(s1) == tostring(s2)
	end,
})

function strings.test()
	local str = strings(" hello world")
	local s = "this " .. str
	print(s)
	print(str)
	print(str:trim())
	print(str:byte(1))
	print(str.byte(str, 1))
	print(strings.trim(" ds "))
end

return strings

--local string_meta_table = getmetatable("")
--local string_meta_table__index = string_meta_table.__index
---- 增加字符串索引访问接口
--string_meta_table.__index = function(self, key) 
	--if type(key) == "number" and key > 0 and key < #self then
		--return string.char(string.byte(self, key))
	--end

	--if key == "indexOf" then
		--return function(substr) return string_indexOf(self, substr) end
	--elseif key == "trim" then
		--return function(pattern, pos) return string_trim(self, pattern, pos) end
	--elseif key == "substring" then
		--return function(s, e) return string_substring(self, s, e) end
	--elseif key == "split" then
		--return function(sep) return string_split(self, sep) end
	--elseif key == "match" then
		--return function(pattern) return string_match(self, pattern) end
	--elseif key == "replace" then
		--return function(pattern, dststr) return string_replace(self, pattern, dststr) end
	--else
		--return string_meta_table__index[key];
	--end
	--return nil
--end

--string_meta_table.__add = function(str1, str2) 
	--return str1 .. str2
--end

