

float2 screenParam :register(c0);

texture sourceTexture;
sampler sourceSpl:register(s0) = sampler_state
{
	Texture = <sourceTexture>;
	MinFilter = Linear;
	MagFilter = Linear;
	AddressU  = clamp;
	AddressV = clamp;
};

texture displacementTexture;
sampler displaceSpl:register(s1) = sampler_state
{
	Texture = <displacementTexture>;
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

float4 PostRefractionPS(float2 texCoord:TEXCOORD0):COLOR0
{
	float2 offset = tex2D(displaceSpl,texCoord).xy;
	//offset = offset *2 -1;
	texCoord += offset*0.1;
	return tex2D(sourceSpl,texCoord);
}


technique Default
{
	pass P0
	{
		VertexShader = compile vs_1_1 FullScreenQuadVS();
		PixelShader = compile ps_2_0 PostRefractionPS();
	}
}
