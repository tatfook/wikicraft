/**
 * Created by wuxiangan on 2016/10/11.
 */

var util = {};

util.stringTrim = function (str) {
    return str ? str.replace(/(^\s*)|(\s*$)/g,'') : str;
}


util.getCurrentDateString = function () {
    var date = new Date();
    return date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

// GET PUT POST DELETE
util.http = function($http, method, url, params, callback) {
    var httpRespone = undefined;
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