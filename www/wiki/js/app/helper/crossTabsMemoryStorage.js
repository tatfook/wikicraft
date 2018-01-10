/**
 * Created by Rango Yuan on 2017/11/27.
 * crossTabsMemoryStorage is for fixing sessionStorage
 * https://truongtx.me/2014/06/16/cross-tab-communication-using-html5-dom-storage
 */

define([], function() {
    if (window.crossTabsMemoryStorage) return window.crossTabsMemoryStorage;

    return window.crossTabsMemoryStorage = (function() {
        var crossTabsMemoryStorage = {
            id: Date.now() + '_' + Math.random(),
            _getMemoryKey: '_crossTabsMemoryStorageGetMemoryKey',
            _publishMemoryKey: '_crossTabsMemoryStoragePublishMemoryKey',
            _sessionStorageTempKey: '_crossTabsMemoryStorageTempKey', //it's for keeping sessionStorage feature, can still get data after reload page
            data: {},
            updateCallbacks: [],
            onUpdate: function(func) {
                this.updateCallbacks.push(func);
            },
            getData: function() {
                return this.data;
            },
            setData: function(data) {
                var me = this;
                for (key in data) me.data[key] = data[key];
                me.updateCallbacks.forEach(function(callback) {
                    callback(me.data);
                });
            },
            setItem: function(key, value) {
                var item = {};
                item[key] = value;
                this.setData(item);
                this.sendData();
            },
            getItem: function(key) {
                return this.data[key];
            },
            removeItem: function(key) {
                this.setItem(key, null);
            },
            clear: function() {
                for (key in this.data) this.data[key] = null;
                this.sendData();
            },
            sendData: function(to) {
                var me = this;
                localStorage.setItem(me._publishMemoryKey, JSON.stringify({
                    from: me.id,
                    to: to,
                    data: me.data
                }));
                localStorage.removeItem(me._publishMemoryKey);
                to  ? console.log('Tab ' + to + ' asked for the memoryStorage -> ' + me.id + ' send it')
                    : console.log(me.id + ' publish data');  
            },
            revealDataFromSessionStorage: function() {
                var me = this;
                var data = window.sessionStorage.getItem(this._sessionStorageTempKey);
                if (!data) return;
                try {
                    data = JSON.parse(data);
                    for (key in data) me.data[key] = data[key];
                } catch(e) {}
            },
            saveDataToSessionStorage: function() {
                var me = this;
                window.sessionStorage.setItem(this._sessionStorageTempKey, JSON.stringify(this.data));
            },
            init: function() {
                var me = this;
                me.revealDataFromSessionStorage();
                window.addEventListener('storage', function(event) {
                    if (event.key == me._getMemoryKey) {
                        // console.log('Some tab asked for the Memory -> send it');
                        var to = event.newValue;
                        if (to) {
                            localStorage.removeItem(me._getMemoryKey);
                            me.sendData(to);
                        }
                    }
                    if (event.key == me._publishMemoryKey) {
                        // console.log('Some tab published Memory > store it');
                        var msg;
                        try {
                            //try catch for IE11
                            msg = JSON.parse(event.newValue);
                        } catch (e) {
                            return;
                        }
                        if (!msg) return;
                        if (msg.to && msg.to != me.id) return;
                        console.log('Current tab get Memory from ' + msg.from, msg);
                        me.setData(msg.data);
                    }
                });

                window.addEventListener('beforeunload', function() {
                    me.saveDataToSessionStorage();
                });

                me.getMemoryFromOtherTabs();
                return this;
            },
            getMemoryFromOtherTabs: function() {
                localStorage.setItem(this._getMemoryKey, this.id);
            }
        }

        return crossTabsMemoryStorage.init();
    }());
});