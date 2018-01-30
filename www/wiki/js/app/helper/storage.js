/**
 * Created by wuxiangan on 2016/12/20.
 */

define([
    'angular',
    'helper/crossTabsMemoryStorage'
], function (angular, crossTabsMemoryStorage) {
    var fakeStorage = {};
    fakeStorage.setItem = function (key,value) {
        fakeStorage.key = value;
    }

    fakeStorage.getItem = function (key) {
        return fakeStorage[key];
    }

    fakeStorage.removeItem = function (key) {
        fakeStorage[key] = undefined;
    }

    fakeStorage.clear = function () {
        //
    }

    var storage = {};
    storage.localStorage = window.localStorage || fakeStorage;
    storage.sessionStorage = crossTabsMemoryStorage;

    storage.localStorageSetItem = function (key, value) {
        storage.localStorage.setItem(key, angular.toJson(value));
    }

    storage.localStorageGetItem = function (key) {
        try {
            return angular.fromJson(storage.localStorage.getItem(key));
        } catch (e) {
            // console.log(e);
            return undefined;
        }
        //return angular.fromJson(storage.localStorage.getItem(key));
    }

    storage.localStorageRemoveItem = function (key) {
        storage.localStorage.removeItem(key);
    }

    storage.localStorageClear = function () {
        storage.localStorage.clear();
    }

    storage.sessionStorageSetItem = function (key, value) {
        storage.sessionStorage.setItem(key, angular.toJson(value));
    }

    storage.sessionStorageGetItem = function (key) {
        try {
            return angular.fromJson(storage.sessionStorage.getItem(key));
        } catch (e) {
            // console.log(e);
            return undefined;
        }
        //return angular.fromJson(storage.sessionStorage.getItem(key));
    }

    storage.sessionStorageRemoveItem = function (key) {
        storage.sessionStorage.removeItem(key);
    }

    storage.sessionStorageClear = function () {
        storage.sessionStorage.clear();
    }

    // In the following line, you should include the prefixes of implementations you want to test.
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    // DON'T use "var indexedDB = ..." if you're not in a function.
    // Moreover, you may need references to some window.IDB* objects:
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

    var indexedDB = {
        name:"keepwork",
        version: 1,
        isOpen: false,
        storeList:[
            {
                storeName:"sitepage",
                storeKey:"url",
            },
        ],
        openCallbackList:[],
    }

    // 打开数据库
    indexedDB.open = function (cb, errcb) {
        if (indexedDB.isOpen) {
            cb && cb();
            return;
        }

        var db = window.indexedDB.open(indexedDB.name || 'keepwork', indexedDB.version || 1);
        var _openFinish = function () {
            for (var i = 0; i < indexedDB.openCallbackList.length; i++) {
                var callback = indexedDB.openCallbackList[i];
                callback && callback();
            }
            indexedDB.openCallbackList = [];
        };

        db.onerror = function (e) {
            // console.log("index db open error");
            errcb && errcb();
        }
        
        db.onsuccess = function (e) {
            // console.log('index db open success');
            indexedDB.indexDB = e.target.result;
            indexedDB.isOpen = true;
            _openFinish();

            cb && cb();
        }

        db.onupgradeneeded = function (e) {
            indexedDB.indexDB = e.target.result;
            // console.log('index db onupgradeneeded');

            for (var i = 0; i < indexedDB.storeList.length; i++) {
                var store = indexedDB.storeList[i];
                if (!indexedDB.indexDB.objectStoreNames.contains(store.storeName)) {
                    indexedDB.indexDB.createObjectStore(store.storeName,{keyPath:store.storeKey});
                }
            }

            indexedDB.isOpen = true;
            _openFinish();
        }
    }

    // 注册打开回调
    indexedDB.registerOpenCallback = function (cb) {
        if (indexedDB.isOpen) {
            cb && cb();
            return;
        }

        indexedDB.openCallbackList.push(cb);
    }

    // 关闭数据库
    indexedDB.close = function () {
        indexedDB.indexDB.close();
    }

    // 删除数据库
    indexedDB.delete = function () {
        window.indexedDB.deleteDatabase(this.name);
    }

    // 获取store 全部记录
    indexedDB.getAllItem = function (storeName, cb, errcb, finish) {
        //console.log(storeName, indexedDB.indexDB);
        var transaction=indexedDB.indexDB.transaction([storeName], 'readwrite');
        var store=transaction.objectStore(storeName);
        var request = store.openCursor();
        request.onsuccess = function(e) {
            var cursor = e.target.result
            if (cursor) {
                cb && cb(cursor.value);
                cursor.continue();
            } else {
                finish && finish();
            }
        }
        request.onerror = function (e) {
            errcb && errcb();
        }
    }

    indexedDB.getItem = function (storeName, key,  cb, errcb) {
        var transaction=indexedDB.indexDB.transaction([storeName], 'readwrite');
        var store=transaction.objectStore(storeName);
        var request=store.get(key);
        request.onsuccess=function(e){
            cb && cb(e.target.result);
        };
        request.onerror = function () {
            errcb && errcb();
        }
    }

    indexedDB.setItem = function (storeName, value,  cb, errcb) {
        var transaction=indexedDB.indexDB.transaction([storeName], 'readwrite');
        var store=transaction.objectStore(storeName);
        var request=store.put(value);
        request.onsuccess=function(e){
            cb && cb(e.target.result);
        };
        request.onerror = function () {
            errcb && errcb();
        }
    }

    indexedDB.deleteItem = function (storeName, key,  cb, errcb) {
        var transaction=indexedDB.indexDB.transaction([storeName], 'readwrite');
        var store=transaction.objectStore(storeName);
        var request=store.delete(key);
        request.onsuccess=function(e){
            cb && cb(e.target.result);
        };

        request.onerror = function () {
            errcb && errcb();
        }
    }

    indexedDB.clearAllItem = function (storeName, cb, errcb) {
        var transaction=indexedDB.indexDB.transaction([storeName], 'readwrite');
        var store=transaction.objectStore(storeName);
        var request=store.clear();
        request.onsuccess=function(e){
            cb && cb(e.target.result);
        };
        request.onerror = function () {
            errcb && errcb();
        }
    }

    storage.indexedDBOpen = function (cb, errcb) {
        indexedDB.open(cb, errcb);
    }

    storage.indexedDBClose = function () {
        indexedDB.close();
    }

    storage.indexedDBDelete = function () {
        indexedDB.delete();
    }

    storage.indexedDBGet = function (storeName, cb, errcb, finish) {
        indexedDB.getAllItem(storeName, cb, errcb, finish);
    }

    storage.indexedDBGetItem = function (storeName, key, cb, errcb) {
        indexedDB.getItem(storeName, key, cb, errcb);
    }
    
    storage.indexedDBSetItem = function (storeName, value, cb, errcb) {
        indexedDB.setItem(storeName, value, cb, errcb);
    }

    storage.indexedDBDeleteItem = function (storeName, key, cb, errcb) {
        indexedDB.deleteItem(storeName, key, cb, errcb);
    }

    storage.indexedDBClear = function (storeName, cb, errcb) {
        indexedDB.clearAllItem(storeName, cb, errcb);
    }

    storage.indexedDBRegisterOpenCallback = function (cb) {
        indexedDB.registerOpenCallback(cb);
    }

    // 打开数据库
    storage.indexedDBOpen();

    return storage;
});
