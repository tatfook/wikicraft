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