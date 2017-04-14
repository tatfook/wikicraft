/**
 * Created by wuxiangan on 2017/2/21.
 */

define([
    'helper/util'
], function (util) {
    var innerServerDS = {
        writeFile: function (params, cb, errcb) {
            util.post(config.apiUrlPrefix + 'website_page/upsert', params, cb, errcb);
        },
        getContent: function (params, cb, errcb) {
            util.post(config.apiUrlPrefix + 'website_page/getByUrl', params, function (data) {
                cb && cb(data.content);
            }, errcb);
        },
        getRawContent: function (params, cb, errcb) {
            util.post(config.apiUrlPrefix + 'website_page/getByUrl', {url:'/' + params.url}, function (data) {
                cb && cb( data && (data.content || ''));
            }, errcb);
        },
        deleteFile: function (params, cb, errcb) {
            util.post(config.apiUrlPrefix + 'website_page/deleteByUrl', params, cb, errcb);
        },
        rollbackFile: function (params, cb, errcb) {
            //cb && cb();
        },
    }

    var dataSourceObj = {
        isInitFinish:false,
        initFinishCallbackList:[],
        dataSourceMap:{},
        dataSourceList:undefined,
        defaultDataSourceId:undefined,
    };

    dataSourceObj.registerInitFinishCallback = function (callback) {
        if (dataSourceObj.isInitFinish) {
            callback && callback();
        } else {
            dataSourceObj.initFinishCallbackList.push(callback);
        }
    }

    dataSourceObj.registerDataSource = function (name, obj) {
        dataSourceObj.dataSourceMap[name] = obj;
    };

    dataSourceObj.getDataSource = function (name) {
        return dataSourceObj.dataSourceMap[name];
    }

    dataSourceObj.getDataSourceById = function(dataSourceId) {
        // 当数据源id不存在时, 返回inner server 存贮
        if (dataSourceId == 0) {
            return innerServerDS;
        }

        for (var i = 0; i < dataSourceObj.dataSourceList.length; i++) {
            var dataSource = dataSourceObj.dataSourceList[i];
            if (dataSource._id == dataSourceId) {
                return dataSourceObj.getDataSource(dataSource.name);
            }
        }
        return undefined;
    }

    dataSourceObj.setDefaultDataSourceId = function (dataSourceId) {
        dataSourceObj.defaultDataSourceId = dataSourceId;
    }

    dataSourceObj.getDefaultDataSource = function () {
        return dataSourceObj.getDataSourceById(dataSourceObj.defaultDataSourceId);
    }

    dataSourceObj.init = function (dataSourceFactory, dataSourceList, defaultDataSourceId) {
        dataSourceObj.dataSourceList = dataSourceList;
        dataSourceObj.defaultDataSourceId = defaultDataSourceId;

        var isInited = [];
        
        var initFinish = function (index) {
            isInited[index] = true;
            if (isInited.length == dataSourceList.length) {
                for (var i = 0; i < isInited.length; i++) {
                    if (!isInited[i]) {
                        return;
                    }
                }

                for (var i = 0; i < dataSourceObj.initFinishCallbackList.length; i++) {
                    var callback = dataSourceObj.initFinishCallbackList[i];
                    callback && callback();
                    dataSourceObj.initFinishCallbackList = [];
                }
                dataSourceObj.isInitFinish = true;
            }
        }

        var _init = function(dataSource, dataSourceInstance, i) {
            if (!dataSourceInstance) {
                initFinish(i);
                return;
            }
            dataSourceInstance.init(dataSource, function () {
                console.log(dataSource.name + " data source init success");
                dataSourceObj.registerDataSource(dataSource.name, dataSourceInstance);
                initFinish(i);
            }, function () {
                console.log(dataSource.name + " data source init failed");
                initFinish(i);
            });
        }

        for (var i = 0; i < dataSourceList.length; i++) {
            isInited.push(false);
            var dataSource = dataSourceList[i];
            var dataSourceInstance = dataSourceFactory[dataSource.type];
            dataSourceInstance = dataSourceInstance && dataSourceInstance();
            _init(dataSource, dataSourceInstance, i);
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