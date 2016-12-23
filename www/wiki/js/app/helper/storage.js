/**
 * Created by wuxiangan on 2016/12/20.
 */

define(['angular', 'storage'], function (angular, storage) {
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
        return angular.fromJson(storage.localStorage.getItem(key));
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
        return angular.fromJson(storage.sessionStorage.getItem(key));
    }

    storage.sessionStorageRemoveItem = function (key) {
        storage.sessionStorage.removeItem(key);
    }

    storage.sessionStorageClear = function () {
        storage.sessionStorage.clear();
    }

    return storage;
});