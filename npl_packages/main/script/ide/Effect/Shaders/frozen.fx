
#define ALPHA_TESTING_REF 0.5
#define MAX_LIGHTS_NUM 4

float4x4 mWorldViewProj:worldviewprojection;
float4x4 mWorldView: worldview;
float4x4 world: world;

float3 sun_vec:sunvector;
float3 g_EyePositionW	:worldcamerapos;


struct vs_in
{
	float4 pos :POSITION;
	float3 normal :NORMAL;
	float3 texcoord	:TEXCOORD;
};

struct vs_out
{
	float4 positionSS	:POSITION;
	float2 texcoord		:TEXCOORD0;
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

vs_out mainVS(vs_in i)
{
	vs_out o;
	o.positionSS = mul(i.pos,mWorldViewProj);
	o.texcoord = i.texcoord;
	float3 worldPos = mul(i.pos,world);
	float3 worldNormal = mul(i.normal,world);
	float3 eveVec = normalize(g_EyePositionW - worldPos);
	return o;
}


float4 mainPS(vs_out i):COLOR
{
	float4 baseColor = tex2D(tex0Sampler,i.texcoord);
	clip(baseColor.w-ALPHA_TESTING_REF);

	float gray = dot(baseColor.xyz,float3(0.3, 0.59, 0.11));
	gray *= gray;
	baseColor.xyz = lerp(float3(0,0.3,0.71),float3(1,1,1),gray);	

	float4 ice = tex2D(tex1Sampler,i.texcoord);
	float3 finalColor = lerp(baseColor,ice.xyz,ice.x);
	return float4(finalColor,1);
}


technique SimpleMesh_vs30_ps30
{
	pass P0
	{
		VertexShader = compile vs_2_0 mainVS();
		PixelShader  = compile ps_2_0 mainPS();
	}
}