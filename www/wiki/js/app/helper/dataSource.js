/**
 * Created by wuxiangan on 2017/2/21.
 */

define(['app', 'helper/util'], function (app, util) {
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

    function registerDataSource(name, ds) {
        dataSourceMap[name] = ds;
    }

    function getDataSource(dsList) {
        var dataSource = {};
        for (var i = 0; i < dsList.length; i++) {
            dataSource[dsList[i]] = dataSourceMap[dsList[i]];
        }

        function execFn(fnName, params, cb, errcb) {
            for (var key in dataSource) {
                //console.log(key);
                //console.log(fnName);
                //console.log(dataSource[key]);
                dataSource[key][fnName] && dataSource[key][fnName](params, cb, errcb);
            }
        }

        return {
            getSingleDataSource: function (dsName) {
                return dataSource[dsName];
            },
            writeFile: function (params, cb, errcb) {
                execFn("writeFile", params, cb, errcb);
            },

            getContent: function (params, cb, errcb) {
                execFn("getContent", params, cb, errcb);
            },

            deleteFile: function (params, cb, errcb) {
                execFn("deleteFile", params, cb, errcb);
            },

            uploadImage: function (params, cb, errcb) {
                execFn("uploadImage", params, cb, errcb);
            },

            rollbackFile: function (params, cb, errcb) {
                execFn("rollbackFile", params, cb, errcb);
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
    };
});