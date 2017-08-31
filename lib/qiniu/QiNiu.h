#pragma once

#include "qiniu/rs.h"

namespace ParaEngine
{
	class CQiNiu
	{
	public: 
		char* getUploadToken(int expires);
		char* getDownloadUrl(const char *, const char *, int);

		static CQiNiu* init();  
		static CQiNiu* getInstance();

	protected:

	private:
		CQiNiu();

		const char* const m_accessKey = "LYZsjH0681n9sWZqCM4E2KmU6DsJOE7CAM4O3eJq";
		const char* const m_secretKey = "IHdepXixI3ZHsQeH662Tf5CPhqWnFpXxc2GF2UXf";
		const char* const m_bucket = "keepwork";
		Qiniu_Mac m_mac;

		static bool s_isInited;
		static CQiNiu* s_instance; 
	};
}
