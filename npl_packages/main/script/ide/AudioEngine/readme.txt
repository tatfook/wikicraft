---++ Audio Engine Extension
| Author | LiXizhi |
| Date	 | 2010/6/28 |

---+++ Overview
The audio engine is a wrapper around the low level API in the ParaAudio global table, (which in turn wraps around OpenAL API). 

The audio engine uses a simple garbage collection routine to unload out of range and stopped audio sources. 

if the audio resource has inmemory attribute to true, it will not be garbage collected. 
It is recommended that only very frequently used sound needs to be in memory, 
all other sounds should be taken care of by the garbage collection routine. 

---+++ Garbage Collection Routine
Whenever a new sound is played, we will run the the GarbageCollection routine in auto mode. 
Auto mode will perform a forced garbage collection only if the active sounds is larger than GarbageCollectThreshold value.
GarbageCollectThreshold is usually the max number of concurrent sound allowed in the scene. It is good to set something like 5-16.

Also, there is a very slow timer(10 seconds per tick), which will force GarbageCollection routine to run. 

A sound is moved to the active queue when it is played, and moved out of the queue if any of the following is true.
   * it is stopped, at the time of garbage collection. 
   * it is out of range(only for 3d sound, where maxdistance smaller than camera to source distance), at the time of garbage collection. 

---+++ Sound Bank File
Sound bank file is an xml file that specify the default play back property of a given sound resource. 
For example, whether the sound is streamed, whether it will remain in memory after stopped, etc.
They also gives shortcut name to sound resources and organize them in categories. 

the following is from SampleSoundBank.xml file. 
<verbatim>
<pe:mcml>
  <!--if no stream or loop attribute is specified on AudioSource node inside the SoundBank, 
  the one on the parent SoundBank attribute will be used. All properties can be overriden by child AudioSource nodes. 
  stream: true to stream content from file, false to load to memory at one time. 
  loop: true to loop play by default. 
  inmemory: if true, the audio will still be in memory after stopped or out of range. So the next time, it can be played fast. 
  delayload: if true, we will not preload to memory for non-streaming sound. instead, we will load on first use. 
  --> 
  <SoundBank name="MyStreamBank" stream="true" loop="true" inmemory="false" delayload="true">
    <AudioSource name="bg_theme_alien" file="Audio/cAudioTheme1.ogg" />
    <AudioSource name="bg_theme_short" file="Audio/Example2.wav" stream="false" inmemory="true"/>
  </SoundBank>
  <SoundBank name="MyUISoundBank" stream="false" loop="false" inmemory="false" delayload="true">
    <AudioSource name="btn1" file="Audio/Kids/Button01.wav" inmemory="true"/>
    <AudioSource name="btn2" file="Audio/Kids/Button02.wav" />
  </SoundBank>
  <SoundBank name="MyEnvironmentSoundBank" stream="false" loop="false" inmemory="true" delayload="true">
    <AudioSource name="Water" file="Audio/Kids/Water.wav" loop="true" inmemory="true"/>
  </SoundBank>
  <SoundBank name="My3DSoundBank" stream="false" loop="false" inmemory="false" delayload="true">
    <AudioSource name="ThrowBall" file="Audio/Example.wav" loop="false" mindistance="1" maxdistance="30"/>
    <AudioSource name="FireWork" file="Audio/Example2.wav" loop="false" mindistance="1" maxdistance="20"/>
  </SoundBank>
</pe:mcml>
</verbatim>

---+++ Audio API Guide
Before using the high level API, one needs to load from sound bank file or create one programmatically. 
<verbatim>
NPL.load("(gl)script/ide/AudioEngine/AudioEngine.lua");
local AudioEngine = commonlib.gettable("AudioEngine");

-- call this on start
AudioEngine.Init()

-- set max concurrent sounds
AudioEngine.SetGarbageCollectThreshold(5)

-- load wave description resources
AudioEngine.LoadSoundWaveBank("script/ide/AudioEngine/SampleSoundBank.xml");

-- play 2d sound
AudioEngine.CreateGet("bg_theme_alien"):play2d();

-- play 3d sound
local audio_src = AudioEngine.CreateGet("ThrowBall")
audio_src:play3d(x,y,z, true)

-- or programmatically create code driven audio resource
local audio_src = AudioEngine.CreateGet("CodeDriven1")
audio_src.file = "Audio/Example.wav"
audio_src:play(); -- then play with default.
</verbatim>

For more information, please see AudioEngine.lua