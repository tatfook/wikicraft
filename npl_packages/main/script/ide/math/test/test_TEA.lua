--[[
NPL.load("(gl)script/ide/math/test/test_TEA.lua");
test_TEA();
]]
NPL.load("(gl)script/ide/math/TEA.lua");

-- Test passed 2008.5.9 By LiXizhi
function test_TEA()
	local lib = commonlib.LibStub("TEA")
	
	local s0 = 'message digest'
	local s1 = 'abcdefghijklmnopqrstuvwxyz'
	local s2 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	local s3 = '12345678901234567890123456789012345678901234567890123456789012345678901234567890'

	local k0 = lib:GenerateKey(s0)
	local k1 = lib:GenerateKey(s1)
	local k2 = lib:GenerateKey(s2)
	local k3 = lib:GenerateKey(s3)

	assert(lib:Decrypt(lib:Encrypt(s0, k3), k3) == s0)
	assert(lib:Decrypt(lib:Encrypt(s1, k2), k2) == s1)
	assert(lib:Decrypt(lib:Encrypt(s2, k1), k1) == s2)
	assert(lib:Decrypt(lib:Encrypt(s3, k0), k0) == s3)
	
	log("TEA test succeeded\n")
end