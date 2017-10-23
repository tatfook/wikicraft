#include "stdafx.h"

#include "QiNiu.h"

// 前向声明
void WriteLog(const char* str);

ParaEngine::CQiNiu::CQiNiu()
{
	this->m_mac.accessKey = this->m_accessKey;
	this->m_mac.secretKey = this->m_secretKey;
}

char* ParaEngine::CQiNiu::getUploadToken(int expires) {
	Qiniu_RS_PutPolicy putPolicy;
	static char strbuf[1024] = {'\0'};
	char *uptoken = NULL;

	Qiniu_Mac mac;
	mac.accessKey = this->m_accessKey;
	mac.secretKey = this->m_secretKey;

	//简单上传凭证
	Qiniu_Zero(putPolicy);
	putPolicy.scope = this->m_bucket;
	if (expires > 0) {
		putPolicy.expires = expires;
	} else {
		putPolicy.expires = 3600 * 24 * 7; // 7 day
	}
	uptoken = Qiniu_RS_PutPolicy_Token(&putPolicy, &mac);

	//WriteLog(uptoken);
	strcpy(strbuf, uptoken);

	Qiniu_Free(uptoken);
	//WriteLog(strbuf);

	return strbuf;
}

char* ParaEngine::CQiNiu::getDownloadUrl(const char* domain, const char* key, int expires) {
	char* url = 0;
    char* baseUrl = 0;
	static char strbuf[1024] = {'\0'};

	//WriteLog(domain);
	//WriteLog(key);

    Qiniu_RS_GetPolicy getPolicy;
    Qiniu_Zero(getPolicy);

	if (expires > 0) {
		getPolicy.expires = expires;
	} else {
		getPolicy.expires = 3600 * 24 * 7 * 365 * 100; // 100 year
	}
	
	Qiniu_Mac mac;
	mac.accessKey = this->m_accessKey;
	mac.secretKey = this->m_secretKey;

    baseUrl = Qiniu_RS_MakeBaseUrl(domain, key);
    url = Qiniu_RS_GetPolicy_MakeRequest(&getPolicy, baseUrl, &mac);
	
	//WriteLog(url);
	strcpy(strbuf, url);

    Qiniu_Free(baseUrl);
    Qiniu_Free(url);

    return strbuf;
}

int ParaEngine::CQiNiu::deleteFile(const char* bucket, const char* key) {
	Qiniu_Mac mac;
	mac.accessKey = this->m_accessKey;
	mac.secretKey = this->m_secretKey;
	
	Qiniu_Client client;
	Qiniu_Client_InitMacAuth(&client, 1024, &mac);
	Qiniu_Error error = Qiniu_RS_Delete(&client, bucket, key);
	if (error.code != 200) {
		//WriteLog(itoa(error.code));
		WriteLog(error.message);
		return -1;
	}

	return 0;
}

bool ParaEngine::CQiNiu::s_isInited = false;
ParaEngine::CQiNiu* ParaEngine::CQiNiu::s_instance = new ParaEngine::CQiNiu();


ParaEngine::CQiNiu* ParaEngine::CQiNiu::init() {
	if (ParaEngine::CQiNiu::s_isInited) {
		return ParaEngine::CQiNiu::s_instance;
	}

	ParaEngine::CQiNiu::s_isInited = true;

	//  初始化七牛组件
	Qiniu_Global_Init(-1);
	
	return ParaEngine::CQiNiu::s_instance;
}

ParaEngine::CQiNiu* ParaEngine::CQiNiu::getInstance() {
	return ParaEngine::CQiNiu::s_instance;
}
