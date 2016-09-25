// Author: Clayman, initially ported by LiXizhi
// date: 2008/8/11
// company: ParaEngine
// file: script/shaders/MotionBlur.fx
// desc: radial and directional blur post processing effect. 

float3 screenParam = float3(1,512, 512);
float2 blurDirection = float2(1,1);
// blending from 0 to 1, if 0, minimum blur is used, 1 is full blur effect. 
float blendWeight = 1;
float2 blurStep = float2(0.02,0.005);
bool enableRadialBlur = true;
static float blurCount = 8;

texture downsampleTexture0: TEXTURE; 
sampler downsampleSpl:register(s0) = sampler_state
{
	Texture = <downsampleTexture0>;
	MinFilter = Linear;
	MagFilter = Linear;
	AddressU  = Mirror;
	AddressV = Mirror;
};

texture blurTexture1: TEXTURE; 
sampler blurSpl:register(s1) = sampler_state
{
	Texture = <blurTexture1>;
	MinFilter = Linear;
	MagFilter = Linear;
	AddressU  = clamp;
	AddressV = clamp;
};


void FullScreenQuadVS(float3 iPosition:POSITION,
	out float4 oPosition:POSITION,
	inout float2 texCoord:TEXCOORD0)
{
	oPosition = float4(iPosition,1);
	texCoord += 0.5 / screenParam.yz;
}

float4 RadialBlurPS(float2 texCoord:TEXCOORD0):COLOR0
{
	float2	dir = texCoord - float2(0.5,0.5);
	float len = length(dir);
	
	float4 finalColor = 0;
	for(int i=0;i<blurCount;i++)
	{
		float2 offset = texCoord - dir * i * blurStep.x * len;
		finalColor += tex2D(downsampleSpl,offset);
	}
	return finalColor/blurCount;
}


float4 DirectionBlurPS(float2 texCoord:TEXCOORD0):COLOR0
{	
	float4 finalColor = 0;
	for(int i=0;i<blurCount;i++)
	{
		float2 offset = texCoord - blurDirection * i * blurStep.y;
		finalColor += tex2D(downsampleSpl,offset);
	}
	return finalColor/blurCount;
}

float4 BlendPS(float2 texCoord:TEXCOORD0):COLOR0
{
	float weight = blendWeight;
	if(enableRadialBlur)
	{
		float2 dir = texCoord - float2(0.5,0.5);
		float len = saturate(length(dir)*1.4142135 + 0.3);
		weight = len * blendWeight;
	}
	
	float3 color1 = tex2D(blurSpl,texCoord);
	return float4(color1,weight);
}


technique MotionBlur
{
	pass P0
	{
		cullmode = none;
		ZEnable = false;
		ZWriteEnable = false;
		AlphaBlendEnable = false;
		AlphaTestEnable = false;
		FogEnable = False;
		VertexShader = compile vs_1_1 FullScreenQuadVS();
		PixelShader = compile ps_2_0 RadialBlurPS();
	}
	
	pass P1
	{
		cullmode = none;
		ZEnable = false;
		ZWriteEnable = false;
		AlphaBlendEnable = false;
		AlphaTestEnable = false;
		FogEnable = False;
		VertexShader = compile vs_1_1 FullScreenQuadVS();
		PixelShader = compile ps_2_0 DirectionBlurPS();
	}
	
	pass P2
	{
		cullmode = none;
		ZEnable = false;
		ZWriteEnable = false;
		AlphaBlendEnable = true;
		SrcBlend = SRCALPHA;
		DestBlend = INVSRCALPHA;
		BlendOp = add;
		AlphaTestEnable = false;
		FogEnable = False;
		VertexShader = compile vs_1_1 FullScreenQuadVS();
		PixelShader = compile ps_2_0 BlendPS();
	}
}