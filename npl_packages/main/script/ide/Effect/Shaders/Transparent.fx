
#define ALPHA_TESTING_REF 0.5
#define MAX_LIGHTS_NUM 4

float4x4 mWorldViewProj:worldviewprojection;
float4x4 mWorldView: worldview;
float4x4 world: world;

float3 sun_vec:sunvector;
float3 g_EyePositionW	:worldcamerapos;
float3 diffuseColor  = float3(1,1,1);

struct vs_in
{
	float4 pos :POSITION;
	float3 normal :NORMAL;
	float2 texcoord	:TEXCOORD;
};

struct vs_out
{
	float4 positionSS	:POSITION;
	float3 texcoord	:TEXCOORD0;
};

Texture2D tex0 :TEXTURE;
sampler2D tex0Sampler :register(s0) = sampler_state
{
	Texture = (tex0);
};


vs_out mainVS(vs_in i)
{
	vs_out o;
	o.positionSS = mul(i.pos,mWorldViewProj);
	o.texcoord.xy = i.texcoord;
	float3 worldPos = mul(i.pos,world);
	float3 worldNormal = mul(i.normal,world);
	float3 eveVec = normalize(g_EyePositionW - worldPos);
	o.texcoord.z = 1- saturate(dot(eveVec,worldNormal));
	return o;
}


float4 mainPS(vs_out i):COLOR
{
	float4 texColor = tex2D(tex0Sampler,i.texcoord.xy);
	clip(texColor.a - ALPHA_TESTING_REF);

	
	float diff = i.texcoord.z;
	if(diff < 0.5)
		diff = 0;
	else
		diff = 2*diff - 1;

	return float4(diffuseColor*texColor.xyz , diff+0.25);
}


technique SimpleMesh_vs30_ps30
{
	pass P0
	{
		VertexShader = compile vs_2_0 mainVS();
		PixelShader  = compile ps_2_0 mainPS();
	}
}