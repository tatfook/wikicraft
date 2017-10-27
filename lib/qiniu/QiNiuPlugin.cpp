#include "stdafx.h"
#include "QiNiu.h"

/**
* Optional NPL includes, just in case you want to use some core functions see GetCoreInterface()
*/
#include "INPLRuntime.h"
#include "INPLRuntimeState.h"
#include "IParaEngineCore.h"
#include "IParaEngineApp.h"

using namespace ParaEngine;

#ifdef WIN32
#define CORE_EXPORT_DECL    __declspec(dllexport)
#else
#define CORE_EXPORT_DECL
#endif

// forward declare of exported functions. 
extern "C" {
	CORE_EXPORT_DECL const char* LibDescription();
	CORE_EXPORT_DECL int LibNumberClasses();
	CORE_EXPORT_DECL unsigned long LibVersion();
	CORE_EXPORT_DECL ParaEngine::ClassDescriptor* LibClassDesc(int i);
	CORE_EXPORT_DECL void LibInit();
	CORE_EXPORT_DECL void LibActivate(int nType, void* pVoid);
	CORE_EXPORT_DECL void LibInitParaEngine(ParaEngine::IParaEngineCore* pCoreInterface);
}
 
HINSTANCE Instance = NULL;

ClassDescriptor* QiNiuPlugin_GetClassDesc();
typedef ClassDescriptor* (*GetClassDescMethod)();

GetClassDescMethod Plugins[] = 
{
	QiNiuPlugin_GetClassDesc,
};

/** This has to be unique, change this id for each new plugin.
*/
#define QiNiu_CLASS_ID Class_ID(0x2b905a29, 0x47b409af)

class QiNiuPluginDesc:public ClassDescriptor
{
public:
	void* Create(bool loading = FALSE)
	{
		//return new CQiNiu();
		return CQiNiu::getInstance();
	}

	const char* ClassName()
	{
		return "IQiNiu";
	}

	SClass_ID SuperClassID()
	{
		return OBJECT_MODIFIER_CLASS_ID;
	}

	Class_ID ClassID()
	{
		return QiNiu_CLASS_ID;
	}

	const char* Category() 
	{ 
		return "QiNiu"; 
	}

	const char* InternalName() 
	{ 
		return "QiNiu"; 
	}

	HINSTANCE HInstance() 
	{ 
		extern HINSTANCE Instance;
		return Instance; 
	}
};

ClassDescriptor* QiNiuPlugin_GetClassDesc()
{
	static QiNiuPluginDesc s_desc;
	return &s_desc;
}

CORE_EXPORT_DECL const char* LibDescription()
{
	return "ParaEngine QiNiu Ver 1.0.0";
}

CORE_EXPORT_DECL unsigned long LibVersion()
{
	return 1;
}

CORE_EXPORT_DECL int LibNumberClasses()
{
	return sizeof(Plugins)/sizeof(Plugins[0]);
}

CORE_EXPORT_DECL ClassDescriptor* LibClassDesc(int i)
{
	if (i < LibNumberClasses() && Plugins[i])
	{
		return Plugins[i]();
	}
	else
	{
		return NULL;
	}
}

ParaEngine::IParaEngineCore* g_pCoreInterface = NULL;
ParaEngine::IParaEngineCore* GetCoreInterface()
{
	return g_pCoreInterface;
}

CORE_EXPORT_DECL void LibInitParaEngine(IParaEngineCore* pCoreInterface)
{
	g_pCoreInterface = pCoreInterface;
}

CORE_EXPORT_DECL void LibInit()
{
}

#ifdef WIN32
BOOL WINAPI DllMain(HINSTANCE hinstDLL,ULONG fdwReason,LPVOID lpvReserved)
#else
void __attribute__ ((constructor)) DllMain()
#endif
{
	// TODO: dll start up code here
#ifdef WIN32
	Instance = hinstDLL;				// Hang on to this DLL's instance handle.
	return (TRUE);
#endif
}

//extern "C" {
	/** this is an example of c function calling NPL core interface */
	void WriteLog(const char* str) {
		if(GetCoreInterface())
			GetCoreInterface()->GetAppInterface()->WriteToLog(str);
	}
//}

/** this is the main activate function to be called. Test with 
```	
	NPL.activate("this_file.dll", msg); 
```
or with synchronous invocation, use
```
	NPL.call("temp/QiNiuPlugin.dll", {cmd=abc}); 
	echo(msg);
```
*/

CORE_EXPORT_DECL void LibActivate(int nType, void* pVoid)
{
	CQiNiu* qiniu = CQiNiu::init();
	
	if(nType == ParaEngine::PluginActType_STATE)
	{
		NPL::INPLRuntimeState* pState = (NPL::INPLRuntimeState*)pVoid;
		const char* sMsg = pState->GetCurrentMsg();
		int nMsgLength = pState->GetCurrentMsgLength();

		NPLInterface::NPLObjectProxy input_msg = NPLInterface::NPLHelper::MsgStringToNPLTable(sMsg);
		NPLInterface::NPLObjectProxy output_msg;
		std::string output;
		const std::string& bucket = input_msg["bucket"];
		const std::string& sCmd = input_msg["cmd"];
		const double expires = input_msg["expires"];

		// bucket
		qiniu->m_bucket = bucket.c_str();

		//GetCoreInterface()->GetAppInterface()->WriteToLog("cmd:%s, expires:%d\n",sCmd.c_str(), (int)expires);
	
		if(sCmd == "getUploadToken"){
			output_msg["token"] = qiniu->getUploadToken(expires);
		} else if (sCmd == "getDownloadUrl") {
			const std::string& domain = input_msg["domain"];
			const std::string& key = input_msg["key"];
			const int expires = (int)((double)input_msg["expires"]);
			output_msg["download_url"] = qiniu->getDownloadUrl(domain.c_str(), key.c_str(), expires);	
		} else if (sCmd == "deleteFile") {
			const std::string& bucket = input_msg["bucket"];
			const std::string& key = input_msg["key"];
			output_msg["result"] = (double)qiniu->deleteFile(bucket.c_str(), key.c_str());
		}

		NPLInterface::NPLHelper::NPLTableToString("msg", output_msg, output);
		// example output 1: return result using async callback to any thread to remote address
		// pState->activate("script/test/echo.lua", output.c_str(), output.size());
		// example output 2: we can also write the result synchronously into a global msg variable.
		pState->call("", output.c_str(), output.size());
	}
}
