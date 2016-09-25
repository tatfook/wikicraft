--[[
Title: Unit Test Module read me file
Author(s): LiXizhi
Date: 2008/3/5
Desc: 
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/ide/UnitTest/readme.lua");
-------------------------------------------------------
]]

--[[

---++ Unit Test Module
The unit test module parses a test file, optionally replace test case input with user supplied ones, and finally output the test result to file and log. 

Test file markup: 
A test file may contain a group of test cases. Test cases can be declared in NPL comment block with the following format: 
<verbatim>
	%TESTCASE{"<test_case_name>", func = "<test_function>", input = <default_input>, output="<result_file>"}%
</verbatim>
The content inside TESTCASE is actually an NPL table, where 
   * test_case_name is test case name, test_function is the name of the function to be called for the test case. 
   * The test function is usually defined in the test file itself and should use global name. 
   * default_input is input to the test case function. 
   * result_file is where to save the test result. if this is nil, it will be saved to testfile.result

For an example test file, please see script/ide/UnitTest/sample_test_file.lua. 

<verbatim>
--[[
Title: Unit Test sample file
Author(s): LiXizhi
Date: 2008/3/5
Desc: 
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/ide/UnitTest/sample_test_file.lua");
test.Example_Test_Function()

-- result at temp/test_result.txt
%TESTCASE{"Example Test", func="test.Example_Test_Function", input={varInt = 1, 
	varString = "this is a string"}, output="temp/test_result.txt"}%
-- result at script/ide/UnitTest/sample_test_file.lua.result
%TESTCASE{"Example Test 2", func="test.Example_Test_Function", input={varInt2 = 2, 
	varString2 = "Another input"}}%
-------------------------------------------------------
]]

if(not test) then test ={} end

-- passed by LiXizhi 2008.3.5
function test.Example_Test_Function(input)
	log(commonlib.serialize(input).." Test Succeed\n")
end

</verbatim>

The result of "Example Test" will be saved to "temp/test_result.txt". It is in TWiki format which one can post to twiki topic.
<verbatim>
---+++ case 1
_case_: Example Test

Input:
<verbatim>
{
  ["varString"] = "this is a string",
  ["varInt"] = 1,
}
</verbatim>

_Result_:
<verbatim>
{
  ["varString"] = "this is a string",
  ["varInt"] = 1,
}
 Test Succeed
</verbatim>
</verbatim>

%T% To invoke unit test programmatically, use following code 
<verbatim>
-------------------------------------------------------
NPL.load("(gl)script/ide/UnitTest/unit_test.lua");
local test = commonlib.UnitTest:new();
if(test:ParseFile("script/ide/UnitTest/sample_test_file.lua")) then
	test:Run();
end
-- or one can call individually with user input. 
local test = commonlib.UnitTest:new();
if(test:ParseFile("script/ide/UnitTest/sample_test_file.lua")) then
	test:ClearResult();
	local i, count = 1, test:GetTestCaseCount()
	for i = 1, count do
		test:RunTestCase(i, {"any user input"});
	end
end
-------------------------------------------------------
</verbatim>

%T% To invoke unit test from a graphically user interface, please install the DeveloperApp. 
Alternatively, one can integrate unit testing UI in any place by calling unit_test_dlg.lua. 


]]
