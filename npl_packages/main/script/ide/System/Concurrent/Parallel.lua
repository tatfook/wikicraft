--[[
Title: Parallel
Author(s): LiXizhi@yeah.net
Date: 2016/7/5
Desc: parallel async task in one thread
use the lib:
------------------------------------------------------------
NPL.load("(gl)script/ide/System/Concurrent/Parallel.lua");
local Parallel = commonlib.gettable("System.Concurrent.Parallel");
Parallel:new():RunManyTimes(function(count, p)
	if(count%10 == 2) then
		commonlib.TimerManager.SetTimeout(function()
			echo(count)
			p:Next();
		end, 20)
	else
		echo(count)
		p:Next();
	end
end, 100, 10):OnFinished(function(total)
	echo("finished "..total);
end);
------------------------------------------------------------
]]
local Parallel = commonlib.inherit(nil,  commonlib.gettable("System.Concurrent.Parallel"));


function Parallel:ctor()
end

function Parallel:init()
	return self;
end

-- run functions many times. Please note, this function does not create real system thread. 
-- you need to make sure func is reentrant on the same thread. 
-- @param func: function(count, self) end, where count is the current number of times, self is the parallel object itself. This function 
-- must call p:Next() when the job is finished. 
-- @param total_times: total number of times to run the func. 
-- @param max_concurrent_jobs: we will ensure there are at most max_concurrent_jobs. 
-- default value is 1, which will only start one when the next is finished. 
function Parallel:RunManyTimes(func, total_times, max_concurrent_jobs)
	self.total_times = total_times or 1;
	self.max_concurrent_jobs = max_concurrent_jobs or 1;
	self.func = func;
	self.count = 0;
	self.finished = 0;
	self.unfinished = 0;
	self:Next(0);
	return self;
end

function Parallel:OnFinished(callback)
	self.finished_callback = callback;
	return self;
end

function Parallel:Finished()
	if(self.finished_callback) then
		self.finished_callback(self.finished);
	end
end

-- @param finished_count: if nil, default to 1. number of newly finished count. 
function Parallel:Next(finished_count)
	finished_count = finished_count or 1;
	self.unfinished = self.unfinished - finished_count;
	self.finished = self.finished + finished_count;

	if(self.finished >= self.total_times) then
		self:Finished();
	elseif(self.unfinished < self.max_concurrent_jobs and not self.recursive) then
		self.recursive = true;
		while(true) do
			local free_jobs_count = math.min(self.max_concurrent_jobs - self.unfinished, self.total_times - self.count);
			if(free_jobs_count <=0) then
				break;
			end
			for i=1, free_jobs_count do
				self.unfinished = self.unfinished + 1;
				self.count = self.count + 1;
				if(self.func) then
					self.func(self.count, self);
				end
			end
		end
		self.recursive = false;
	end
	return self;
end
	
