--[[
NPL.load("(gl)script/ide/math/test/test_MD5.lua");
test_MD5();
]]
NPL.load("(gl)script/ide/math/MD5.lua");

-- Test passed 2008.5.9 By LiXizhi
function test_MD5()
	local lib = commonlib.LibStub("MD5")
	
	local s0 = "message digest"
	local s1 = "abcdefghijklmnopqrstuvwxyz"
	local s2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	local s3 = "12345678901234567890123456789012345678901234567890123456789012345678901234567890"

	commonlib.log("lib:MD5(%q)=%q  == 'd41d8cd98f00b204e9800998ecf8427e'\n", "", lib:MD5(""))
	commonlib.log("lib:MD5(%q)=%q  == 'f96b697d7cb7938d525a2f31aaf161d0'\n", s0, lib:MD5(s0))
	commonlib.log("lib:MD5(%q)=%q  == 'c3fcd3d76192e4007dfb496cca67e13b'\n", s1, lib:MD5(s1))
	commonlib.log("lib:MD5(%q)=%q  == 'd174ab98d277d9f5a5611c2c9f419d9f'\n", s2, lib:MD5(s2))
	commonlib.log("lib:MD5(%q)=%q  == '57edf4a22be3c955ac49da2e2107b67a'\n", s3, lib:MD5(s3))
	
	log("MD5 test succeeded\n")
end