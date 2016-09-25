--[[
Title: TestMotionPlayer
Author(s): Leio
Date: 2010/06/12
Desc: 
------------------------------------------------------------
NPL.load("(gl)script/ide/MotionEx/Test/TestMotionPlayer.lua");
local TestMotionPlayer = commonlib.gettable("MotionEx.TestMotionPlayer");
local time_str = "00:00:02";
--TestMotionPlayer.Play(time_str);
TestMotionPlayer.Play2(time_str);

NPL.load("(gl)script/ide/MotionEx/Test/TestMotionPlayer.lua");
local TestMotionPlayer = commonlib.gettable("MotionEx.TestMotionPlayer");
TestMotionPlayer.TestFollowCamera();
------------------------------------------------------------
--]]
NPL.load("(gl)script/ide/MotionEx/MotionLine.lua");
NPL.load("(gl)script/ide/MotionEx/MotionPlayer.lua");


local MotionLine = commonlib.gettable("MotionEx.MotionLine");
local MotionPlayer = commonlib.gettable("MotionEx.MotionPlayer");
local TestMotionPlayer = commonlib.gettable("MotionEx.TestMotionPlayer");
function TestMotionPlayer.Play(time_str)
	local type = "camera";
	local motionLine = MotionLine:new{
		type = type,
	}
	local keyFrames = {
		{ KeyTime = "00:00:00", CameraObjectDistance = 8, CameraLiftupAngle = 0, CameraRotY = -1.3, },
		{ KeyTime = "00:00:01", CameraObjectDistance = 8, CameraLiftupAngle = 0.6, CameraRotY = -1.3, FrameType = "easeInQuad"},
		{ KeyTime = "00:00:02", CameraObjectDistance = 8, CameraLiftupAngle = 0, CameraRotY = -1.3, },
		{ KeyTime = "00:00:03", CameraObjectDistance = 8, CameraLiftupAngle = 0.6, CameraRotY = -1.3, },
	};
	motionLine:AddKeyFrames(keyFrames);
	local motionPlayer = MotionPlayer:new();
	motionPlayer:AddMotionLine(motionLine);
	motionPlayer:Play();
	--motionPlayer:GoToByTimeStr(time_str)
end
function TestMotionPlayer.Play2(time_str)
	local type = "camera";
	local motionLine = MotionLine:new{
		type = type,
	}
	local keyFrames = {
		{ duration = 0, CameraObjectDistance = 8, CameraLiftupAngle = 0, CameraRotY = -1.3, },
		{ duration = 1000, CameraObjectDistance = 8, CameraLiftupAngle = 0.6, CameraRotY = -1.3, FrameType = "easeInQuad"},
		{ duration = 1000, CameraObjectDistance = 8, CameraLiftupAngle = 0, CameraRotY = -1.3, },
		{ duration = 1000, CameraObjectDistance = 8, CameraLiftupAngle = 0.6, CameraRotY = -1.3, },
	};
	keyFrames = MotionLine.ChageToKeyFrames(keyFrames)
	motionLine:AddKeyFrames(keyFrames);
	local motionPlayer = MotionPlayer:new();
	motionPlayer:AddMotionLine(motionLine);
	motionPlayer:Play();
	--motionPlayer:GoToByTimeStr(time_str)
end
function TestMotionPlayer.TestFollowCamera()
	NPL.load("(gl)script/ide/Storyboard/Storyboard.lua");
	NPL.load("(gl)script/ide/Display3D/SceneManager.lua");
	NPL.load("(gl)script/ide/Display3D/SceneNode.lua");
	local scene = CommonCtrl.Display3D.SceneManager:new{
		type = "miniscene" --"scene" or "miniscene"
	}	;
	local rootNode = CommonCtrl.Display3D.SceneNode:new{
		root_scene = scene,
	}
	local container_node = CommonCtrl.Display3D.SceneNode:new{
		node_type = "container",
		x = 0,
		y = 0,
		z = 0,
		visible = true,
	};
	local node_1 = CommonCtrl.Display3D.SceneNode:new{
		x = 255,
		y = 0,
		z = 255,
		assetfile = "model/06props/shared/pops/muzhuang.x",
	};
	container_node:AddChild(node_1);
	rootNode:AddChild(container_node);

	local target = node_1:GetEntityID();
	local type = "entity";
	local scene_name = "container"..scene.uid;
	local motionLine = MotionLine:new{
		type = type,
		target = target,
		scene = scene_name,
	}

	local keyFrames = {
		{ KeyTime = "00:00:00",},
		{ KeyTime = "00:00:01", x = 250, },
		{ KeyTime = "00:00:02", x = 270, FrameType = "easeInExpo"},
	};
	motionLine:AddKeyFrames(keyFrames);
	local motionPlayer = MotionPlayer:new();
	motionPlayer:AddMotionLine(motionLine);

	local type = "camera";
	local motionLine = MotionLine:new{
		type = type,
		target = target,
	}
	local keyFrames = {
		{ KeyTime = "00:00:00", FollowTarget = target, CameraObjectDistance = 4.567586, CameraLiftupAngle = 1.026639, CameraRotY = -0.469392, },
		{ KeyTime = "00:00:00.5", FollowTarget = target, CameraObjectDistance = 4.567586, CameraLiftupAngle = 0.636639, CameraRotY = -2.079392, FrameType = "easeNone"},
	};
	motionLine:AddKeyFrames(keyFrames);
	--motionPlayer:AddMotionLine(motionLine);

	motionPlayer:Play();
end