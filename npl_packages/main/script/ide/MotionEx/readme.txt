-------------------------动画文件格式
script/ide/MotionEx/Motion.xml
-------------------------MotionPlayer.lua 抽象实现了动画播放的机制
--动画播放
MotionPlayer:Play()
--动画停止到最前面
MotionPlayer:Stop()
--动画停止到最后面
MotionPlayer:End()
--动画暂停
MotionPlayer:Pause()
--动画继续播放
MotionPlayer:Resume()
--动画跳转到指定的时间，单位毫秒
MotionPlayer:GoToTime(time)
--动画跳转到指定的时间time_str = "00:00:10.5"
MotionPlayer:GoToByTimeStr(time_str)
-------------------------MotionLineBase.lua:动画线的基类
继承这个类主要重写的方法：
--@param root_time:毫秒，MotionPlayer运行的总时间
--@param local_time:毫秒，MotionLineBase当前运行的时间
--@param root_max_time:毫秒，MotionLineBase运行的总时间
MotionLineBase:__GoToTime(root_time,local_time,local_max_time)

MotionLineBase:__Play()
MotionLineBase:__Reset()
MotionLineBase:__Stop()
MotionLineBase:__End()
-------------------------MotionLine.lua:继承了MotionLineBase.lua，实现了具体关键帧动画的逻辑
一条MotionLine 是有多个KeyFrame组成，按时间从小到大排序
每个KeyFrame可以自定义自己的更新属性：keyFrame = { KeyTime = "00:00:01.5", FrameType = "", x = 0, y = 0 ...};
运算原理：
--获取当前时间下的关键帧
local curKeyFrame,nextKeyFrame = self:GetRuntimeKeyFrame(localtime);
--如果没有到最后一帧
if(curKeyFrame and nextKeyFrame)then
	--查找下一关键帧的类型
	local frametype = nextKeyFrame["FrameType"];
	if(frametype == "None" or frametype == "none"  or frametype == ""  or frametype == nil)then
		--如果是空，不运算，直接返回
		return value of curKeyFrame
	else
		--计算有效的差值
		local change_value = nextKeyFrame.x - curKeyFrame.y;
		返回计算结果
	end
else
	--运行到最后一帧
	if(curKeyFrame)then
		return value of curKeyFrame
	end
end
-------------------------MotionRender.lua:针对具体动画类型的更新
-------------------------MotionTypes.lua:差值运算公式
