--[[
Title: Test Audio Engine Extension
Author(s): LiXizhi
Date: 2010/6/28
Desc: This file can be used as a sample of using both RAW audio API and wrapped API. 
Use Lib:
-------------------------------------------------------
NPL.load("(gl)script/ide/AudioEngine/TestAudioEngine.lua");
-------------------------------------------------------
]]
NPL.load("(gl)script/ide/UnitTest/luaunit.lua");
NPL.load("(gl)script/ide/timer.lua");

TestRawAPI = {};

-- basic sound parameter and functions testing. 
function TestRawAPI:test_sound_params()
	--ParaAudio.PlayWaveFile("Audio/cAudioTheme1.ogg", 0);
	--ParaAudio.PlayWaveFile("Audio/SheWolf.mp3", 0);
	--ParaAudio.PlayWaveFile("Audio/Region_FireCavern.ogg", 0);
	

	-- create with streaming set to true
	local audio_src = ParaAudio.CreateGet("ogg_test", "Audio/cAudioTheme1.ogg", true);
	assert(audio_src.name == "ogg_test"); -- test name property
	-- test release sound from memory
	audio_src:release();
	assert(audio_src:IsValid() == false)
	-- after release, get will return invalid object
	audio_src = ParaAudio.Get("ogg_test");
	assert(audio_src:IsValid() == false);

	-- create again
	audio_src = ParaAudio.CreateGet("ogg_test", "Audio/cAudioTheme1.ogg", true);
	-- get should be same as CreateGet after creation
	audio_src = ParaAudio.Get("ogg_test");

	local x,y,z = ParaScene.GetPlayer():GetPosition();
	audio_src.MaxDistance = 10;
	-- play 3d sound at player's position. strength is 1, and looping to false. 
	audio_src:play3d(x,y+1.6, z, 1, false);
	
	assert(audio_src:isPlaying() == true)
	assert(audio_src:isStopped() == false)
	
	-- make the sound looping
	audio_src:loop(true);
	assert(audio_src:isLooping() == true)

	local x, y, z = audio_src:getPosition();

	commonlib.echo({
		Name = audio_src.name,
		TotalAudioTime = audio_src.TotalAudioTime,
		TotalAudioSize = audio_src.TotalAudioSize,
		CurrentAudioTime = audio_src.CurrentAudioTime,
		CurrentAudioPosition = audio_src.CurrentAudioPosition,
		Strength = audio_src.Strength,
		MinDistance = audio_src.MinDistance,
		MaxDistance = audio_src.MaxDistance,
		Pitch = audio_src.Pitch,
		Volume = audio_src.Volume,
		MinVolume = audio_src.MinVolume,
		MaxVolume = audio_src.MaxVolume,
		InnerConeAngle = audio_src.InnerConeAngle,
		OuterConeAngle = audio_src.OuterConeAngle,
		RolloffFactor = audio_src.RolloffFactor,
		position = {audio_src:getPosition()},
		velocity = {audio_src:getVelocity()},
		direction = {audio_src:getDirection()},
	})

	local mytimer = commonlib.Timer:new({callbackFunc = function(timer)
		-- pause the sound
		audio_src:pause();
		assert(audio_src:isPaused() == true)
		-- resume/play the sound
		audio_src:play();
	end})
	mytimer:Change(20000, nil);
end

-- play the same sound simultaneously. The same audio file must be loaded twice with different names.
function TestRawAPI:test_2D_play_same_sound_together()
	local audio_src = ParaAudio.CreateGet("ogg_test", "Audio/cAudioTheme1.ogg", true);
	local audio_src2 = ParaAudio.CreateGet("ogg_test2", "Audio/cAudioTheme1.ogg", true);

	audio_src:stop();
	audio_src2:stop();
	audio_src:play2d(false);

	-- play the second one after 10 seconds. 
	local mytimer = commonlib.Timer:new({callbackFunc = function(timer)
		audio_src2:play2d(false);
	end})
	mytimer:Change(10000, nil);
end

-- move MONO sound source around the current player's location and circle overhead. 
-- a miniscene graph model is used to indicate the current audio source location. 
function TestRawAPI:test_3d_sound()
	local cx,cy,cz = ParaScene.GetPlayer():GetPosition();
	--[[
	{
		Audio_DistModel_NONE = 0, 
		Audio_DistModel_INVERSE_DISTANCE, 
		Audio_DistModel_INVERSE_DISTANCE_CLAMPED, 
		Audio_DistModel_LINEAR_DISTANCE, 
		Audio_DistModel_LINEAR_DISTANCE_CLAMPED, 
		Audio_DistModel_EXPONENT_DISTANCE, 
		Audio_DistModel_EXPONENT_DISTANCE_CLAMPED,
	};
	]]
	ParaAudio.SetDistanceModel(6); -- specify how sound attenuates

	NPL.load("(gl)script/ide/Display3D/SceneManager.lua");
	NPL.load("(gl)script/ide/Display3D/SceneNode.lua");
	local scene = CommonCtrl.Display3D.SceneManager:new();
	local rootNode = CommonCtrl.Display3D.SceneNode:new{root_scene = scene,	}
	local sound_node = CommonCtrl.Display3D.SceneNode:new{	x = cx,	y = cy,	z = cz,visible = true,
		assetfile = "model/06props/shared/pops/muzhuang.x",
	};
	rootNode:AddChild(sound_node);

	-- stream set to false. Most mp3, ogg are not mono sound, please use an editor for it.  
	-- please note in order to play 3d sound, the sound source must be MONO, stereo sound can not be moved. 
	local audio_src = ParaAudio.CreateGet("wav_example", "Audio/Example.wav", false);
	
	cy = cy+1.6;
	audio_src.MinVolume = 0;
	audio_src.MinDistance = 1;
	audio_src.MaxDistance = 20;
	audio_src:play3d(cx,cy, cz, 1, true);
	local radius = 10;
	local mytimer = commonlib.Timer:new({callbackFunc = function(timer)
		local t = timer.lastTick/1000;
		local x, y, z = cx + radius * math.sin(t), cy, cz + radius * math.cos(t);
		audio_src:move(x, y, z);
		sound_node:SetPosition(x,y,z);
		commonlib.echo({ position = {audio_src:getPosition()}, velocity = {audio_src:getVelocity()},direction = {audio_src:getDirection()},})
	end})
	mytimer:Change(0, 30);
end

TestAudioAPI = {};

function TestAudioAPI:setUp()
	NPL.load("(gl)script/ide/AudioEngine/AudioEngine.lua");
	AudioEngine.Init();
	AudioEngine.SetGarbageCollectThreshold(1);
	AudioEngine.LoadSoundWaveBank("script/ide/AudioEngine/SampleSoundBank.xml");
end

function TestAudioAPI:test_LoadSoundBank()
	AudioEngine.CreateGet("bg_theme_alien"):play();

	-- stop playing after 5 seconds
	local mytimer = commonlib.Timer:new({callbackFunc = function(timer)
		AudioEngine.CreateGet("bg_theme_alien"):stop();
	end})
	mytimer:Change(5000, nil);

	-- create a 3d sound at current player location. 
	-- Please note that sound must be MONO (NOT stereo) in order to play in 3d.
	local audio_src = AudioEngine.CreateGet("ThrowBall")
	local x,y,z = ParaScene.GetPlayer():GetPosition();
	audio_src:play3d(x,y,z, true)
	AudioEngine.CreateGet("btn1"):play2d();
	AudioEngine.CreateGet("btn2"):play2d();
	AudioEngine.CreateGet("btn3"):play2d();
end

function TestRawAPI:test_sound_GC()
	local audio_src = AudioEngine.CreateGet("Audio/cAudioTheme1.ogg");
	audio_src:play();
	if(not audio_src:isPlaying()) then
		audio_src:release();
	end
end

-- LuaUnit:run('TestRawAPI:test_sound_params');
-- LuaUnit:run('TestRawAPI:test_2D_play_same_sound_together')
LuaUnit:run('TestRawAPI:test_3d_sound');

-- LuaUnit:run('TestAudioAPI:test_LoadSoundBank');
