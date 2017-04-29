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
            util.post(config.apiUrlPrefix + 'website_page/getByUrl', {url: '/' + params.url}, function (data) {
                cb && cb(data && (data.content || ''));
            }, errcb);
        },
        deleteFile: function (params, cb, errcb) {
            util.post(config.apiUrlPrefix + 'website_page/deleteByUrl', params, cb, errcb);
        },
        rollbackFile: function (params, cb, errcb) {
            //cb && cb();
        },
    };

    var dataSourceObj = {
        isInitFinish: false,
        initFinishCallbackList: [],
        dataSourceInstMap: {}, // 数据实例映射
        dataSourceCfgList: undefined,
        defaultDataSourceId: undefined,

        init: function (dataSourceCfgList, defaultDataSourceId) {
            var self = this;
            self.dataSourceCfgList = dataSourceCfgList;
            self.defaultDataSourceId = defaultDataSourceId;

            var isInited = [];

            var initFinish = function (index) {
                isInited[index] = true;
                if (isInited.length == dataSourceCfgList.length) {
                    for (var i = 0; i < isInited.length; i++) {
                        if (!isInited[i]) {
                            return;
                        }
                    }
                    //console.log(self.initFinishCallbackList);
                    for (var i = 0; i < self.initFinishCallbackList.length; i++) {
                        var callback = self.initFinishCallbackList[i];
                        callback && callback();
                    }
                    self.initFinishCallbackList = [];
                    self.isInitFinish = true;
                    console.log("-----data source init finished-----");
                }
            }

            var _init = function (dataSourceCfg, dataSourceInstance, i) {
                if (!dataSourceInstance) {
                    console.log("data source instance is null");
                    initFinish(i);
                    return;
                }
                dataSourceInstance.init(dataSourceCfg, function () {
                    console.log(dataSourceCfg.name + " data source init success");
                    self.registerDataSource(dataSourceCfg.name, dataSourceInstance);
                    initFinish(i);
                }, function () {
                    console.log(dataSourceCfg.name + " data source init failed");
                    initFinish(i);
                });
            }

            for (var i = 0; i < dataSourceCfgList.length; i++) {
                isInited.push(false);
                var dataSourceCfg = dataSourceCfgList[i];
                var dataSourceInstance = dataSource.dataSourceFactory[dataSourceCfg.type];
                dataSourceInstance = dataSourceInstance && dataSourceInstance();
                _init(dataSourceCfg, dataSourceInstance, i);
            }
        },
        
        registerInitFinishCallback: function (callback) {
            var self = this;
            if (self.isInitFinish) {
                callback && callback();
            } else {
                self.initFinishCallbackList.push(callback);
            }
        },

        registerDataSource: function (name, obj) {
            this.dataSourceInstMap[name] = obj;
        },

        getDataSource: function (name) {
            return this.dataSourceInstMap[name];
        },

        getDataSourceById: function (dataSourceId) {
            var self = this;
            // 当数据源id不存在时, 返回inner server 存贮
            if (dataSourceId == 0) {
                return innerServerDS;
            }

            for (var i = 0; i < self.dataSourceCfgList.length; i++) {
                var dataSourceCfg = self.dataSourceCfgList[i];
                if (dataSourceCfg._id == dataSourceId) {
                    return self.getDataSource(dataSourceCfg.name);
                }
            }
            return undefined;
        },
        setDefaultDataSourceId: function (dataSourceId) {
            this.defaultDataSourceId = dataSourceId;
        },
        getDefaultDataSource: function () {
            return this.getDataSourceById(this.defaultDataSourceId);
        },
    };

    dataSource = {
        // 默认用户
        defaultUsername:undefined,
        // 数据示例构造器
        dataSourceFactory: {},
        // 用户数据源映射
        dataSourceUserMap: {},
    };

    dataSource.registerDataSourceFactory = function (typ, factory) {
        dataSource.dataSourceFactory[typ] = factory;
    }

    dataSource.getUserDataSource = function (name) {
        if (!dataSource.dataSourceUserMap[name]) {
            dataSource.dataSourceUserMap[name] = angular.copy(dataSourceObj);
        }
        return dataSource.dataSourceUserMap[name];
    }

    dataSource.setDefaultUsername = function (username) {
        this.defaultUsername = username;
    }

    dataSource.getDefaultDataSource = function () {
        if (!this.defaultUsername) {
            return undefined;
        }

        return this.getUserDataSource(this.defaultUsername).getDefaultDataSource();
    };
    return dataSource;
});