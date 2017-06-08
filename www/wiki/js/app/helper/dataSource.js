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
		defaultSitename:"__keepwork__",

        init: function (dataSourceCfgList, defaultSitename) {
            if (this.isInitFinish) {
                return;
            }

            var self = this;
            self.dataSourceCfgList = dataSourceCfgList;
            self.defaultSitename = defaultSitename || self.defaultSitename;

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
                self.registerDataSource(dataSourceCfg.sitename, dataSourceInstance);
                dataSourceInstance.init(dataSourceCfg, function () {
                    console.log(dataSourceCfg.dataSourceName + " data source init success");
                    initFinish(i);
                }, function () {
                    console.log(dataSourceCfg.dataSourceName + " data source init failed");
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

        registerDataSource: function (sitename, obj) {
            this.dataSourceInstMap[sitename] = obj;
        },

        getDataSourceBySitename: function (sitename) {
			//console.log(this.defaultSitename);
            return this.dataSourceInstMap[sitename] || this.dataSourceInstMap[this.defaultSitename];
        },

        setDefaultSitename: function (sitename) {
            this.defaultSitename = sitename;
        },
        getDefaultDataSource: function () {
            return this.getDataSourceBySitename(this.defaultSitename);
        },
    };

    dataSource = {
        // 默认用户
        defaultUsername:undefined,
        // 数据示例构造器
        dataSourceFactory: {},
        // 用户数据源映射
        dataSourceUserMap: {},
        // 当前数据源
        currentDataSource:undefined,
    };

    dataSource.registerDataSourceFactory = function (typ, factory) {
        dataSource.dataSourceFactory[typ] = factory;
    };

    dataSource.getUserDataSource = function (name) {
        if (!dataSource.dataSourceUserMap[name]) {
            dataSource.dataSourceUserMap[name] = angular.copy(dataSourceObj);
        }
        return dataSource.dataSourceUserMap[name];
    }

	dataSource.getDataSource = function(username, sitename) {
		//console.log(dataSource.dataSourceUserMap);
		return this.getUserDataSource(username).getDataSourceBySitename(sitename)
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
