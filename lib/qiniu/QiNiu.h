#pragma once

#include "qiniu/rs.h"

namespace ParaEngine
{
	class CQiNiu
	{
	public: 
		char* getUploadToken(const char* callback_url, int expires);
		char* getDownloadUrl(const char *, const char *, int);
		int   deleteFile(const char*, const char*);

		static CQiNiu* init();  
		static CQiNiu* getInstance();

		const char* m_bucket;
		const char* m_accessKey;
		const char* m_secretKey;
	protected:

	private:
		CQiNiu();

		//const char* const m_bucket = "keepwork";
		Qiniu_Mac m_mac;
		//Qiniu_Io_PutRet m_putRet;
		//Qiniu_Client m_client;
		//Qiniu_RS_PutPolicy m_putPolicy;
		//Qiniu_Io_PutExtra m_putExtra;
			

		static bool s_isInited;
		static CQiNiu* s_instance; 
	};
}
