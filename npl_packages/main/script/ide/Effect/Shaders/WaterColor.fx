

float2 screenParam = float(1024,268);
float2 textureSize float(1024,268);

texture sourceTexture0;
sampler sourceSpl:register(s0) = sampler_state
{
    Texture = <sourceTexture0>;
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


void m2(inout float4 a,inout float4 b)
{
	float4 t = a;
	a = min(t,b);
	b = max(t,b);
}

void m3(inout float4 a,inout float4 b,inout float4 c)
{
	m2(b,c);
	m2(a,c);
	m2(a,b);
}

void m4(inout float4 a,inout float4 b,inout float4 c,inout float4 d)
{
	m2(a,b);
	m2(c,d);
	m2(a,c);
	m2(b,d);
}

void m5(inout float4 a,inout float4 b,inout float4 c,inout float4 d, inout float4 e)
{
	m2(a,b);
	m2(c,d);
	m2(a,c);
	m2(a,e);
	m2(d,e);
	m2(b,e);
}

void m6(inout float4 a,inout float4 b,inout float4 c,inout float4 d, inout float4 e,inout float4 f)
{
	m2(a,d);
	m2(b,e);
	m2(c,f);
	m2(a,b);
	m2(a,c);
	m2(e,f);
	m2(d,f);
}

float4 WaterColorPS(float2 texCoord:TEXCOORD0):COLOR
{
	return float4(1,1,1,1);
	float4 samplers[9];
	
	for(float dx = -1;dx <=1;dx++)
	{
		for(float dy = -1;dy <= 1;dy++)
		{
			samplers[dx*3 + dy + 4] = tex2D(sourceSpl,texCoord + float2(1.5*dx/textureSize.x,2.0*dy/textureSize.y));
		}
	}

	m6(samplers[0],samplers[1],samplers[2],samplers[3],samplers[4],samplers[5]);
	m5(samplers[1],samplers[2],samplers[3],samplers[4],samplers[6]);
	m4(samplers[2],samplers[3],samplers[4],samplers[7]);
	m3(samplers[3],samplers[4],samplers[8]);
	return samplers[4];
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
        PixelShader = compile ps_2_0 WaterColorPS();
    }
}