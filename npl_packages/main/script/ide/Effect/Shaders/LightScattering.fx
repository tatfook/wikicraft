/**
Author: Clayman, ported by LiXizhi
Company: ParaEngine 
Date: 2010.1.6
Desc: light scattering, many paramters can be adjusted at runtime. 
*/

float2 screenParam = float2(512, 512);
float2 lightPosition = float2(0.5,0.5);
float offset = 0.02;
float sunbeamLength = 0.5;
float3 lightColor = float3(1,0.8,0.2);
float exposure = 1.6;

float3 lumOff = float3(0.3086, 0.6094, 0.082);
static float sampleCount = 6;

texture sourceTexture0;
sampler sourceSpl:register(s0) = sampler_state
{
	Texture = <sourceTexture0>;
	MinFilter = Linear;
	MagFilter = Linear;
	AddressU  = clamp;
	AddressV = clamp;
};

texture lumTexture1;
sampler lumSpl:register(s1) = sampler_state
{
	Texture = <lumTexture1>;
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
	texCoord += 0.5 / screenParam;
}

float4 LumPS_1(float2 texCoord:TEXCOORD0):COLOR0
{
	float2 dir = lightPosition - texCoord;
	float len = length(dir);
	dir = normalize(dir);

	float att = -1/sunbeamLength;
	float lum = saturate(att * len + 1);
	float sum=0;
	for(int i=0; i<sampleCount;i++)
	{
		float deltaOffset = saturate(len - offset * i);
		float2 offsetTexCoord = texCoord + dir * deltaOffset;
		float3 sample = tex2D(sourceSpl,offsetTexCoord);
		float sampleLum = dot(sample,lumOff);

		sum += sampleLum / (sampleCount + 1);
	}
	
	lum *= sum;
	return float4(lum.xxx,1);
}

float4 Blend(float2 texCoord:TEXCOORD0):COLOR0
{
	float lum = tex2D(lumSpl,texCoord).x;
	float3 sunbeamColor = lightColor * lum * exposure;
	float3 diffuseColor = tex2D(sourceSpl,texCoord);
	diffuseColor += sunbeamColor;
	return float4(diffuseColor,1);
}

technique Default
{
	pass P0
	{
		cullmode = none;
		ZEnable = false;
		ZWriteEnable = false;
		FogEnable = False;
		VertexShader = compile vs_1_1 FullScreenQuadVS();
		PixelShader = compile ps_2_0 LumPS_1();
	}
	pass P1
	{
		cullmode = none;
		ZEnable = false;
		ZWriteEnable = false;
		FogEnable = False;
		PixelShader = compile ps_2_0 Blend();
	}
}
