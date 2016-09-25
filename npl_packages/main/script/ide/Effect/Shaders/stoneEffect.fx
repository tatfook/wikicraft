

#define ALPHA_TESTING_REF 0.5
#define MAX_LIGHTS_NUM 4

float4x4 mWorldViewProj:worldviewprojection;
float4x4 mWorldView: worldview;
float4x4 world: world;

float3 sun_vec:sunvector;
float3	colorAmbient:ambientlight;

float transitionFactor :transitionFactor = 0;

float4   g_fogParam : fogparameters; // (fogstart, fogrange, fogDensity, reserved)
float4    g_fogColor : fogColor;
bool g_bEnableFog		:fogenable = false;

struct vs_in
{
	float4 pos :POSITION;
	float3 normal :NORMAL;
	float3 texcoord	:TEXCOORD;
};

struct vs_out
{
	float4 positionSS	:POSITION;
	float4 texcoord		:TEXCOORD0;
	float4 lightParam   :TEXCOORD1;
};


Texture2D tex0 :TEXTURE;
sampler2D tex0Sampler :register(s0) = sampler_state
{
	Texture = (tex0);
};

Texture2D tex1 :TEXTURE;
sampler2D tex1Sampler :register(s1) = sampler_state
{
	Texture = (tex1);
};


half CalcFogFactor( half d )
{
    half fogCoeff = 0;
	fogCoeff = (d - g_fogParam.x)/g_fogParam.y;
    return saturate( fogCoeff);
}


vs_out mainVS(vs_in i)
{
	vs_out o;
	o.positionSS = mul(i.pos,mWorldViewProj);
	o.texcoord.xy = i.texcoord;
	o.texcoord.zw = i.texcoord * 2;

	float3 worldNormal = mul(i.normal,world);
	float lightFactor = saturate(dot(sun_vec,worldNormal));
	float3 diff = float3(1,1,0.8) * lightFactor;

	float3 groundColor = max((colorAmbient - float3(0.15,0.10,0.05)),float3(0.05,0.05,0.05));
	float3 amb = lerp(groundColor,colorAmbient,lightFactor);
	diff += amb;

	float4 camPos = mul(i.pos,mWorldView);
	float fog = CalcFogFactor(camPos.z);

	o.lightParam = float4(diff,fog);
	return o;
}


float4 mainPS(vs_out i):COLOR
{
	float4 baseColor = tex2D(tex0Sampler,i.texcoord.xy);
	clip(baseColor.w-ALPHA_TESTING_REF);


	float3 noise = tex2D(tex1Sampler,i.texcoord.xy);
	float3 noise2 = tex2D(tex1Sampler,i.texcoord.zw);

	float gray = dot(baseColor.xyz,float3(0.3, 0.59, 0.11));
	float3 stoneColor = float3(gray,gray,gray);	
	
	stoneColor *= (noise2 - 0.5) * 0.35 + 1;

	float2 transitionWeight = saturate((float2(noise.x,noise2.x) - transitionFactor) * float2(2,4));
	transitionWeight.y = frac(transitionWeight.y);

	float3 finalColor = lerp(stoneColor,baseColor.xyz,transitionWeight.x);
	finalColor += transitionWeight.y * noise * 0.2;
	finalColor *= i.lightParam.xyz;

	float alpha = 1;
	if(g_bEnableFog)
	{
		float fog = i.lightParam.w;
		finalColor = lerp(finalColor.xyz,g_fogColor.xyz,fog);
		fog = saturate((fog - 0.8) * 16);
		alpha = lerp(1,0,fog);
	}

	return float4(finalColor,alpha);
}


technique SimpleMesh_vs30_ps30
{
	pass P0
	{
		VertexShader = compile vs_2_0 mainVS();
		PixelShader  = compile ps_2_0 mainPS();
	}
}