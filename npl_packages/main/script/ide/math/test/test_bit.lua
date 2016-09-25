
--[[
NPL.load("(gl)script/ide/math/test/test_bit.lua");
test_Bit();
]]
NPL.load("(gl)script/ide/math/bit.lua");

-- Test passed 2008.5.9 By LiXizhi
function test_Bit()
	local bit = mathlib.bit;

	print ("bit.bits = " .. bit.bits)

	assert (bit.band (0, 0) == bit.cast (0))
	assert (bit.band (0, -1) == bit.cast (0))
	assert (bit.band (-1, -1) == bit.cast (-1))

	assert (bit.bor  (0, 0) == bit.cast (0))
	assert (bit.bor  (0, -1) == bit.cast (-1))
	assert (bit.bor  (-1, -1) == bit.cast (-1))

	assert (bit.bxor (0, 0) == bit.cast (0))
	assert (bit.bxor (0, -1) == bit.cast (-1))
	assert (bit.bxor (-1, -1) == bit.cast (0))

	assert (bit.bnot (0) == bit.cast (-1))
	assert (bit.bnot (-1) == bit.cast (0))

	assert (bit.lshift (0, 0) == bit.cast (0))
	assert (bit.lshift (-1, 0) == bit.cast (-1))

	assert (bit.rshift (0, 0) == bit.cast (0))
	
	-- This assertion is passed by LiXizhi. A fix with lua_Integer in c++ code. 
	assert (bit.rshift (-1, 0) == bit.cast (-1))
	assert (bit.arshift (-1, 0) == bit.cast (-1))

	for nb = 1, bit.bits do
	  local a = 2 ^ nb - 1
	  print ("nb = " .. nb .. ", a = " .. a)
	  assert (bit.band (a, 0)  == bit.cast (0))
	  assert (bit.band (a, 1)  == bit.cast (1))
	  assert (bit.band (a, -1) == bit.cast (a))
	  assert (bit.band (a, a)  == bit.cast (a))

	  assert (bit.bor (a, 0)  == bit.cast (a))
	  assert (bit.bor (a, 1)  == bit.cast (a))
	  assert (bit.bor (a, -1) == bit.cast (-1))
	  assert (bit.bor (a, a)  == bit.cast (a))

	  assert (bit.bxor (a, 0)  == bit.cast (a))
	  assert (bit.bxor (a, 1)  == bit.cast (a - 1))
	  assert (bit.bxor (a, -1) == bit.cast (-a - 1))
	  assert (bit.bxor (a, a)  == bit.cast (0))

	  assert (bit.bnot (a) == bit.cast (-1 - a))

	  if nb < bit.bits then
		assert (bit.lshift (a, 1) == bit.cast (a + a))
		assert (bit.lshift (1, nb) == bit.cast (2 ^ nb))
	  end

	  assert (bit.rshift (a, 1) == math.floor (a / 2))
	  if nb < bit.bits then
		assert (bit.rshift (a, nb) == bit.cast (0))
	  end
	  assert (bit.rshift (a, nb - 1) == bit.cast (1))

	  assert (bit.arshift (-1, 1) == bit.cast (-1))
	end

	print "All bitlib tests passed"

end

function FindLimits()
	-- bitlib test suite
-- (c) Reuben Thomas 2007-2008
-- See README for license

-- Prepend a binary 1 to a hex constant
function prepend_one (s)
  if s == "0" then
    return "1"
  elseif string.sub (s, 1, 1) == "1" then
    return "3" .. string.sub (s, 2)
  elseif string.sub (s, 1, 1) == "3" then
    return "7" .. string.sub (s, 2)
  elseif string.sub (s, 1, 1) == "7" then
    return "f" .. string.sub (s, 2)
  else
    return "1" .. s
  end
end

-- Invert a hex constant
local inverted = {
  ["0"] = "f", ["1"] = "e", ["2"] = "d", ["3"] = "c",
  ["4"] = "b", ["5"] = "a", ["6"] = "9", ["7"] = "8",
  ["8"] = "7", ["9"] = "6", ["a"] = "5", ["b"] = "4",
  ["c"] = "3", ["d"] = "2", ["e"] = "1", ["f"] = "0",
}
function invert_hex (s)
  for i = 1, #s do
    s = string.sub (s, 1, i - 1) .. inverted[string.sub (s, i, i)] .. string.sub (s, i + 1)
  end
  if string.sub (s, 1, 1) == "0" then
    s = "1" .. s
  end
  return s
end

-- Calculate number of bits in a float mantissa
local float_bits = 0
local float_max = "0"
local float_umax = "0"
local f = 1
repeat
  f = f * 2
  float_bits = float_bits + 1
  if f < f + 1 then
    float_max = prepend_one (float_max)
  end
  float_umax = prepend_one (float_umax)
until f >= f + 1
local float_min = invert_hex (float_max)
print ("#define BITLIB_FLOAT_BITS " .. float_bits)
print ("#define BITLIB_FLOAT_MAX  0x" .. float_max .. "L")
print ("#define BITLIB_FLOAT_MIN  (-0x" .. float_min .. "L)")
print ("#define BITLIB_FLOAT_UMAX 0x" .. float_umax .. "UL")

end