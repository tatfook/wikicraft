/**
 * Created by wuxiangan on 2017/2/21.
 */

define([
    'app',
    'helper/util'
], function (app, util) {
    var dataSourceObj = {
        dataSourceMap:{},
        dataSourceList:undefined,
    };

    dataSourceObj.registerDataSource = function (name, obj) {
        dataSourceObj.dataSourceMap[name] = obj;
    };

    dataSourceObj.getDataSource = function (name) {
        return dataSource.dataSourceMap[name];
    }

    dataSourceObj.getDataSourceById = function(dataSourceId) {
        for (var i = 0; dataSourceObj.dataSourceList.length; i++) {
            var dataSource = dataSourceObj.dataSourceList[i];
            if (dataSource._id == dataSourceId) {
                return dataSourceObj.getDataSource(dataSource.name);
            }
        }
        return undefined;
    }

    dataSourceObj.init = function (dataSourceFactory, dataSourceList) {
        dataSourceObj.dataSourceList = dataSourceList;

        var _init = function(dataSource, dataSourceInstance) {
            if (!dataSourceInstance)
                return;
            dataSourceInstance.init(dataSource, function () {
                console.log(dataSource.name + " data source init success");
                dataSourceObj.registerDataSource(dataSource.name, dataSourceInstance);
            }, function () {
                console.log(dataSource.name + " data source init failed");
            });
        }

        for (var i = 0; i < dataSourceList.length; i++) {
            var dataSource = dataSourceList[i];
            var dataSourceInstance = dataSourceFactory[dataSource.type];
            dataSourceInstance = dataSourceInstance && dataSourceInstance();
            _init(dataSource, dataSourceInstance);
        }
    }

    return dataSourceObj;
    /*
    var innerServerDS = {
        writeFile: function (params, cb, errcb) {
            util.post(config.apiUrlPrefix + 'website_pages/upsert', params, cb, errcb);
        },
        getContent: function (params, cb, errcb) {
            util.post(config.apiUrlPrefix + 'website_pages/getWebsitePageById', params, function (data) {
                cb && cb(data.content);
            }, errcb);
        },
        deleteFile: function (params, cb, errcb) {
            util.post(config.apiUrlPrefix + 'website_pages/deleteByPageId', params, cb, errcb);
        },
        rollbackFile: function (params, cb, errcb) {
            //cb && cb();
        }
    };
    
    var dataSourceMap = {};

    function registerDataSource(name, ds, enable) {
        dataSourceMap[name] = {dataSource:ds, enable: (enable == undefined || enable) ? true : false};
    }

    function getDataSource(dsList) {
        var dataSource = {};

        if (!dsList) {
            dsList = [];
            for (var key in dataSourceMap) {
                dsList.push(key);
            }
        }
        for (var i = 0; i < dsList.length; i++) {
            dataSource[dsList[i]] = dataSourceMap[dsList[i]].dataSource;
        }

        function execFn(fnName, params, cb, errcb) {
            var isOK = {};
            var isError = false;

            function isAllOK(key, isErr) {
                return function () {
                    isOK[key] = true;

                    if (isErr)
                        isError = true;

                    for (var i = 0; i < dsList.length; i++) {
                        if (!isOK[dsList[i]])
                            break;
                    }

                    if (i == dsList.length) {
                        if (isError)
                            errcb && errcb();
                        else
                            cb && cb();
                    }
                }
            }

            for (var key in dataSource) {
                if (dataSourceMap[key].enable) {
                    dataSource[key] && dataSource[key][fnName] && dataSource[key][fnName](angular.copy(params), isAllOK(key, false), isAllOK(key, true));
                }
            }
        }

        return {
            isDataSourceExist: function (dsName) {
                return dataSource[dsName] ? true : false;
            },
            getSingleDataSource: function (dsName) {
                return dataSource[dsName];
            },

            //    param:{path,content,message,branch}
            writeFile: function (params, cb, errcb) {
                execFn("writeFile", params, cb, errcb);
            },
            // param:{path,ref}
            getContent: function (params, cb, errcb) {
                execFn("getContent", params, cb, errcb);
            },
            // param:{path,message,sha,branch}
            deleteFile: function (params, cb, errcb) {
                execFn("deleteFile", params, cb, errcb);
            },
            // param:{path,content,message,branch}
            uploadImage: function (params, cb, errcb) {
                execFn("uploadImage", params, cb, errcb);
            },
            getRawContentUrlPrefix: function (params) {
                //execFn("getRawContentUrlPrefix", params);
            },
        };
    }

    // 注册内容server
    registerDataSource('innerServer', innerServerDS);
    
    // 提供全局注册数据源函数
    app.registerDataSource = registerDataSource;

    // 提供获取数据源函数
    app.getDataSource = getDataSource;

    return {
        registerDataSource:registerDataSource,
        getDataSource:getDataSource,
        getRawDataSource: function (dsName) {
            return dataSourceMap[dsName] && dataSourceMap[dsName].dataSource
        },
        getDataSourceEnable: function (dsName) {
            return dataSourceMap[dsName] && dataSourceMap[dsName].enable;
        },
        setDataSourceEnable: function (dsName, enable) {
            if (dataSourceMap[dsName])
                dataSourceMap[dsName].enable = enable;
        },
        getDefaultDataSource:function () {
            return dataSourceMap[this.defaultDataSourceName] && dataSourceMap[this.defaultDataSourceName].dataSource;
        }
    };
    */
});