
float2 screenParam = float2(1024,768);
float scanLine = 0;
float side = 0;
float scratchAmount = 0.85;
float ScratchPersistence = 15;

texture sourceTexture0;
sampler sourceSpl:register(s0) = sampler_state
{
    Texture = <sourceTexture0>;
    MinFilter = Linear;
    MagFilter = Linear;
    AddressU = clamp;
    AddressV = clamp;
};

texture noiseTexture1;
sampler noiseSpl:register(s1) = sampler_state
{
    Texture = <noiseTexture1>;
    MinFilter = Linear;
    MagFilter = Linear;
    AddressU = Wrap;
    AddressV = Wrap;
};

void FullScreenQuadVS(float3 iPosition:POSITION,
	out float4 oPosition:POSITION,
	inout float2 texCoord:TEXCOORD0)
{
	oPosition = float4(iPosition,1);
	texCoord += 0.5 / screenParam;
}

float4 FilmScratchPS(float2 texCoord:TEXCOORD0):COLOR
{
	float3 color = tex2D(sourceSpl,texCoord);
	float2 noiseTexCoord = float2(texCoord.x + side,scanLine);
	float scratch = tex2D(noiseSpl,noiseTexCoord).x;
	scratch = ScratchPersistence*(scratch - scratchAmount);
	scratch = saturate(1.0 - abs(1.0f - scratch));
	color = color * (1+scratch);
	return float4(color,1);
}

technique Default
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
        PixelShader = compile ps_2_0 FilmScratchPS();
    }
}