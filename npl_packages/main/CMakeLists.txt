# Author: LiXizhi
# Email: lixizhi@yeah.net
# Date: 2015.4.8
# Desc: 

cmake_minimum_required(VERSION 2.8)

project (NPLPackageMain)

# since the project is for documentation only, we will turn relative path on. 
set(CMAKE_USE_RELATIVE_PATHS ON CACHE INTERNAL "" FORCE)

##############################
file (GLOB_RECURSE NPLPackageMain_NPL_FILES ${PROJECT_SOURCE_DIR}/script/*.lua)
SOURCE_GROUP("script\\" FILES ${NPLPackageMain_NPL_FILES})
list(APPEND NPLPackageMain_SRCS ${NPLPackageMain_NPL_FILES})

##############################
file (GLOB_RECURSE NPLPackageMain_XML_FILES ${PROJECT_SOURCE_DIR}/script/*.xml)
SOURCE_GROUP("xml\\" FILES ${NPLPackageMain_XML_FILES})
list(APPEND NPLPackageMain_SRCS ${NPLPackageMain_XML_FILES})

file (GLOB_RECURSE NPLPackageMain_HTML_FILES ${PROJECT_SOURCE_DIR}/script/*.html)
SOURCE_GROUP("html\\" FILES ${NPLPackageMain_HTML_FILES})
list(APPEND NPLPackageMain_SRCS ${NPLPackageMain_HTML_FILES})

file (GLOB_RECURSE NPLPackageMain_PAGE_FILES ${PROJECT_SOURCE_DIR}/script/*.page)
SOURCE_GROUP("page\\" FILES ${NPLPackageMain_PAGE_FILES})
list(APPEND NPLPackageMain_SRCS ${NPLPackageMain_PAGE_FILES})

##############################
# doc
file (GLOB_RECURSE NPLPackageMain_DOC_FILES ${PROJECT_SOURCE_DIR}/Documentation/*.*)
SOURCE_GROUP("Documetation\\" FILES ${NPLPackageMain_DOC_FILES})
list(APPEND NPLPackageMain_SRCS ${NPLPackageMain_DOC_FILES})

##############################
add_custom_target(NPLPackageMain 
	COMMAND ${CMAKE_SOURCE_DIR}/RunNPLCodeWiki.bat
	# WORKING_DIRECTORY "../redist/"
	COMMENT "npl code wiki ..."
	SOURCES ${NPLPackageMain_SRCS})