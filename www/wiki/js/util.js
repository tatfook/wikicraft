/**
 * Created by wuxiangan on 2016/10/11.
 */

var util = {
    stack:[],   // 堆栈操作模拟
    id:0,       // ID产生器 局部唯一性
};

util.getId = function () {
    this.id = this.id > 1000000 ? 0 : this.id+1;
    return this.id;
}

util.setAngularServices = function(angularServices) {
    this.angularServices = angularServices;
}

util.getAngularServices = function() {
    return this.angularServices;
}

util.setSelfServices = function (selfServices) {
    this.selfServices = selfServices;
}

util.getSelfServices = function () {
    return this.selfServices;
}

util.setScope = function ($scope) {
    this.angularServices.$scope = $scope;
}

util.getScope = function () {
    return this.angularServices.$scope;
}

util.setParams = function (params) {
    this.params = params;
}

util.getParams = function () {
    return this.params;
}

util.setFunction = function (func) {
    this.func = func;
}

util.getFunction = function () {
    return this.func;
}

// stack
util.push = function (obj) {
    this.stack.push(obj);
}

util.pop = function () {
    return this.stack.pop();
}

util.stringTrim = function (str) {
    return str ? str.replace(/(^\s*)|(\s*$)/g,'') : str;
}

util.getCurrentDateString = function () {
    var date = new Date();
    return date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

// GET PUT POST DELETE
util.http = function(method, url, params, callback) {
    var $http = this.angularServices.$http;
    var httpRespone = undefined;

    // 在此带上认证参数
    if (method == 'POST') {
        httpRespone = $http({method:method,url:url,data:params}); //$http.post(url, params);
    } else {
        httpRespone = $http({method:method,url:url,params:params});
    }
    httpRespone.then(function (response) {
        var data = response.data;
        console.log(data);
        if (data.error.id == 0) {
            console.log(data.data);
            callback && callback(data.data);
        } else {
            console.log(data);
        }
    }).catch(function (response) {
        console.log(response.data);
    });
}

util.stringToJson = function (str) {
    var obj = {};
    try {
        obj = JSON.parse(str);
    } catch (e) {

    }
    return obj;
}