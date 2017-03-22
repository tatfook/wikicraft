/**
 * Created by wuxiangan on 2016/12/20.
 */

define(['angular'], function (angular) {
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
    storage.sessionStorage = window.sessionStorage || fakeStorage;

    storage.localStorageSetItem = function (key, value) {
        storage.localStorage.setItem(key, angular.toJson(value));
    }

    storage.localStorageGetItem = function (key) {
        try {
            return angular.fromJson(storage.localStorage.getItem(key));
        } catch (e) {
            console.log(e);
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
            console.log(e);
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

    storage.indexedDBOpen = function (option, cb, errcb) {
        var db = window.indexedDB.open(option.dbName || 'wikicraftDB', option.version || 1);
        storage.indexDBStoreName = option.storeName;

        db.onerror = function (e) {
            console.log("index db open error");
            errcb && errcb();
        }
        db.onsuccess = function (e) {
            storage.indexDB = e.target.result;
            console.log('onsuccess');
            cb && cb();
        }
        db.onupgradeneeded = function (e) {
            storage.indexDB = e.target.result;
            console.log('onupgradeneeded');
            if (!option.storeName || !option.storeKey) {
                console.log("opion error!!!");
                return;
            }
            if (!storage.indexDB.objectStoreNames.contains(option.storeName)) {
                storage.indexDB.createObjectStore(option.storeName,{keyPath:option.storeKey});
            }
        }
    }

    storage.indexedDBClose = function () {
        storage.indexDB.close();
    }

    storage.indexedDBDelete = function (dbName) {
        window.indexedDB.deleteDatabase(dbName || 'wikicraftDB');
    }

    storage.indexedDBGet = function (cb, errcb, finish) {
        var transaction=storage.indexDB.transaction([storage.indexDBStoreName],'readwrite');
        var store=transaction.objectStore(storage.indexDBStoreName);
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

    storage.indexedDBGetItem = function (key, cb, errcb) {
        var transaction=storage.indexDB.transaction([storage.indexDBStoreName],'readwrite');
        var store=transaction.objectStore(storage.indexDBStoreName);
        var request=store.get(key);
        request.onsuccess=function(e){
            cb && cb(e.target.result);
        };
        request.onerror = function () {
            errcb && errcb();
        }
    }
    
    storage.indexedDBSetItem = function (value, cb, errcb) {
        //console.log(storage.indexDBStoreName);
        var transaction=storage.indexDB.transaction([storage.indexDBStoreName],'readwrite');
        var store=transaction.objectStore(storage.indexDBStoreName);
        var request=store.put(value);
        request.onsuccess=function(e){
            //console.log(value);
            cb && cb(e.target.result);
        };
        request.onerror = function () {
            errcb && errcb();
        }
    }

    storage.indexedDBDeleteItem = function (key, cb, errcb) {
        var transaction=storage.indexDB.transaction(storage.indexDBStoreName,'readwrite');
        var store=transaction.objectStore(storage.indexDBStoreName);
        var request=store.delete(key);
        request.onsuccess=function(e){
            cb && cb(e.target.result);
        };
        request.onerror = function () {
            errcb && errcb();
        }
    }

    storage.indexedDBClearItem = function (cb, errcb) {
        var transaction=storage.indexDB.transaction(storage.indexDBStoreName,'readwrite');
        var store=transaction.objectStore(storage.indexDBStoreName);
        var request = store.clear();
        request.onsuccess=function(e){
            cb && cb(e.target.result);
        };
        request.onerror = function () {
            errcb && errcb();
        }
    }

    return storage;
});