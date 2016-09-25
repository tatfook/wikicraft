

#define ALPHA_TESTING_REF 0.8
#define MAX_LIGHTS_NUM 4

float4x4 mWorldViewProj : worldviewprojection;
float4x4 mWorldView: worldview;
float4x4 world	: world;

float3 sun_vec : sunvector;

float3	colorDiffuse:materialdiffuse;
float3	colorAmbient:ambientlight;
float3	colorEmissive:materialemissive = float3(0,0,0);

int	g_locallightnum:locallightnum = 0;
float3	g_lightcolor[MAX_LIGHTS_NUM]	:	LightColors;
float3	g_lightparam[MAX_LIGHTS_NUM]	:	LightParams;
float4	g_lightpos[MAX_LIGHTS_NUM]		:	LightPositions;

float4   g_fogParam : fogparameters; // (fogstart, fogrange, fogDensity, reserved)
float4    g_fogColor : fogColor;

//------------------------------------------
// static branch boolean constants
bool g_bEnableSunLight	:sunlightenable = true;
bool g_bAlphaTesting	:alphatesting = false;
bool g_bEnableFog		:fogenable  = true;
bool g_bReflectionMap	:boolean5 = false;
bool g_bEnvironmentMap	:boolean6 = false;
float g_bReflectFactor	:reflectfactor;
float3 g_EyePositionW	:worldcamerapos;
float2 g_TexAnim		:ConstVector0; // TODO: for testing texture animation: x,y for translation
float g_opacity			:opacity = 1.f; 
//------------------------------------------


Texture2D tex0;
sampler2D tex0Sampler = sampler_state
{
	Texture = (tex0);
};

Texture2D tex1;
sampler2D tex1Sampler = sampler_state
{
	Texture = (tex1);
};


TextureCube tex2;
samplerCUBE texCubeSampler = sampler_state
{
	Texture = (tex2);
};


struct vs_in
{
	float4 pos	:POSITION;
	float3 normal	:NORMAL;
	float3 texcoord	:TEXCOORD0;
};


struct vs_out
{
	float4 positionSS	 :POSITION;
	float3 tex :TEXCOORD0;
	float3 tex1 :TEXCOORD1;
	float4 colorDiffuse :TEXCOORD2;
};

float CalcFogFactor( float d )
{
    float fogCoeff = 0;
	fogCoeff = (d - g_fogParam.x)/g_fogParam.y;
    return saturate( fogCoeff);
}

vs_out mainVS(vs_in i)
{
	vs_out o;
	
	o.positionSS = mul(i.pos,mWorldViewProj);
	float3 worldPos = mul(i.pos,world);
	float4 cameraPos = mul(i.pos, mWorldView ); 
	float3 worldNormal = mul(i.normal,world);


	if(g_bEnableSunLight)
	{
	    o.colorDiffuse.xyz = max(0,dot( sun_vec, worldNormal ))*colorDiffuse * 0.35;
		o.colorDiffuse.xyz += colorAmbient*0.9;
		
		//specular
		/*
		float3 eyeVec = normalize(g_EyePositionW - worldPos);
		float3 lightReflect = reflect(-sun_vec,worldNormal);
		float specular = saturate(dot(eyeVec,lightReflect));
		specular = pow(specular,32);
		o.colorDiffuse.xyz += specular * 0.2;
		*/
	}
	else
	{
		o.colorDiffuse.xyz = min(1,colorDiffuse + colorAmbient);
		o.colorDiffuse.w = 0;
	}


	// compute local lights
	for( int LightIndex = 0; LightIndex < g_locallightnum; ++LightIndex )
	{
		float3 toLight = g_lightpos[LightIndex].xyz - worldPos;
		float lightDist = length( toLight );
		// this dynamic braching helps for bigger models
		if(g_lightpos[LightIndex].w > lightDist)
		{
			float fAtten = 1 / dot(g_lightparam[LightIndex], float3(1,lightDist,lightDist*lightDist));
			float3 lightDir = normalize( toLight );
			o.colorDiffuse.xyz += max(0,dot( lightDir, worldNormal ) * g_lightcolor[LightIndex].xyz * fAtten);
		}
	}

	o.tex.xy = i.texcoord + g_TexAnim.xy;
	o.tex.z =  CalcFogFactor(cameraPos.z);

	if(g_bReflectionMap)
	{
		o.tex1.xy = (o.positionSS.xy + o.positionSS.w) * 0.5;
		o.tex1.z = o.positionSS.w;
	}
	else if(g_bEnvironmentMap)
	{
		// Obtain the eye vector in world (cube) space
		float3 eyeVector = normalize( worldPos-g_EyePositionW );

		// Compute the reflection vector and save to tex1
		o.tex1 = normalize(reflect(eyeVector, worldNormal));

		float fresnel = saturate(dot(-eyeVector,worldNormal) * 0.4 + 0.6);
		o.colorDiffuse.w = fresnel;
	}
	
	return o;
}

float4 mainPS(vs_out i) : COLOR 
{
	float4 result;

	float4 albedoColor = tex2D(tex0Sampler,i.tex.xy);
	
	if(g_bAlphaTesting)
	{
		clip(albedoColor.w-ALPHA_TESTING_REF);
	}
	
	
	float3 marbleColor = tex2D(tex1Sampler,i.tex.xy);
	//float gray = dot(albedoColor,float3(0.3, 0.59, 0.11));	
	///albedoColor.xyz = lerp(marbleColor.xyz, marbleColor.xyz * gray,0);
	albedoColor.xyz = marbleColor;

	if(g_bReflectionMap)
	{
		float4 reflection = tex2D(tex1Sampler, half2(1,1)-i.tex1.xy/i.tex1.z);
		albedoColor.xyz = lerp(albedoColor.rgb, reflection.rgb, g_bReflectFactor);
	}
	else if(g_bEnvironmentMap)
	{
		float3 envColor = texCUBE(texCubeSampler,i.tex1);

		/*
		float gray2 = dot(albedoColor,float3(0.3, 0.59, 0.11));
		float fe = saturate(i.colorDiffuse.w + (gray+gray2)*0.1);
		*/
		albedoColor.xyz = lerp(envColor,albedoColor,0.5);
	}
	albedoColor.xyz *= i.colorDiffuse.xyz;

	if(g_bEnableFog)
	{
		//calculate the fog factor
		half fog = i.tex.z;
		result.xyz = lerp(albedoColor.xyz, g_fogColor.xyz, fog);
		fog = saturate( (fog-0.8)*16 );
		result.w = lerp(albedoColor.w, 0, fog);
	}
	else
	{
		result = albedoColor;
	}

	result.xyz += colorEmissive;
	result.w *= g_opacity;
	return result;
}

////////////////////////////////////////////////////////////////////////////////
//
//                              Technique
//
////////////////////////////////////////////////////////////////////////////////
technique SimpleMesh_vs30_ps30
{
	pass P0
	{
		// shaders
		VertexShader = compile vs_2_0 mainVS();
		PixelShader  = compile ps_2_0 mainPS();
		ZWriteEnable = true;
		fogEnable = false;
	}
}
