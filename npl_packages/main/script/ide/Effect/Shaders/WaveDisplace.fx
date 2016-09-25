


float2 screenParam;
float2 center;
float time;
//x:amp; y:velocity z:radius; w:freq
float4 waveParams = float4(1,1,0.15,1);
float minRadius;

texture sourceTexture;
sampler sourceSpl:register(s0) = sampler_state
{
    Texture = <sourceTexture>;
    MinFilter = Linear;
    MagFilter = Linear;
    AddressU = clamp;
    AddressV = clamp;
};


void FullScreenQuadVS(float3 iPosition:POSITION,
	out float4 oPosition:POSITION,
	inout float2 texCoord:TEXCOORD0)
{
	oPosition = float4(iPosition,1);
	texCoord += 0.5 / screenParam;
}

float4 WavePS(float2 texCoord:TEXCOORD0):COLOR
{
	float2 displaceDir = texCoord - center;
	float len = length(displaceDir);
	float deltaTime = max(0,time - len / waveParams.y);
	float wave = abs(waveParams.x * sin(waveParams.w * deltaTime));
	float att = saturate( 1- len/waveParams.z);
	displaceDir *= wave*att;
	//uncomment to pack data into [0,1] when use 8bit render target
	//displaceDir = displaceDir * 0.5 + 0.5;
	return float4(displaceDir,0,1);
}

float4 Pie(float2 texCoord:TEXCOORD0):COLOR
{
	float2 displaceDir = texCoord - center;
	float2 dir = normalize(displaceDir);
	
	float len = length(displaceDir);
	float deltaTime = max(0,time - len / waveParams.y);
	float wave = abs(waveParams.x * sin(waveParams.w * deltaTime));
	float att = saturate( 1- len/waveParams.z);
	
	float pie = saturate(dot(float2(1,0),dir));
	displaceDir *= wave*att * pie;
	
	return float4(displaceDir,0,1);
}

float4 Fan(float2 texCoord:TEXCOORD0):COLOR
{
	float2 displaceDir = texCoord - center;
	float2 dir = normalize(displaceDir);
	
	float len = length(displaceDir);
	float deltaTime = max(0,time - len / waveParams.y);
	float att = saturate( 1- len/waveParams.z);
	
	float pie = saturate(dot(float2(1,0),dir));
	
	displaceDir *= att * pie;
	
	return float4(displaceDir,0,1);
}

technique Default
{
    pass P0
    {
		VertexShader = compile vs_1_1 FullScreenQuadVS();
        PixelShader = compile ps_2_0 WavePS();
    }
}