/**
 * Created by wuxiangan on 2016/12/20.
 */

define([
    'jquery',
], function ($,Loading) {
    var util = {
        colorList:["rgb(145,185,114)","rgb(185,150,114)","rgb(185,114,178)","rgb(185,127,114)","rgb(114,185,160)","rgb(114,134,185)"],
        stack:[],   // 堆栈操作模拟
        id:0,       // ID产生器 局部唯一性
        lastUrlObj:{}, // 记录最近一次URL信息
    };
    // 获取一个随机颜色
    util.getRandomColor = function (index) {
        index = index || 0;
        index %= this.colorList.length;
        return this.colorList[index];
    }

    util.getId = function () {
        this.id = this.id > 1000000 ? 0 : this.id+1;
        return this.id;
    }

    // $html
    util.html = function(selector, htmlStr, $scope, isCompile) {
        isCompile = isCompile == undefined ? true : isCompile;
        htmlStr = htmlStr||'<div></div>';
        $scope = $scope || util.angularServices.$rootScope;

        if (isCompile) {
            var $compile = util.angularServices.$compile;
            htmlStr = $compile(htmlStr)($scope);
        }

        $(selector).html(htmlStr);
        setTimeout(function () {
            $scope.$apply();
        });
    }

    util.compile = function (htmlStr, $scope) {
        var $compile = util.angularServices.$compile;
        $scope = $scope || util.angularServices.$rootScope;
        htmlStr = $compile(htmlStr||'<div></div>')($scope);
        return htmlStr;
    }

    util.$apply = function ($scope) {
        $scope = $scope || util.angularServices.$rootScope;
        setTimeout(function () {
            $scope.$apply();
        });
    }

    // 将字符串url解析成{sitename, pagename}对象
    util.parseUrl = function () {
        var hostname = config.hostname || window.location.hostname;
        var pathname = window.location.pathname;

        if(config.islocalWinEnv()) {
            pathname = window.location.hash ? window.location.hash.substring(1) : '/';
            if (pathname.indexOf('?') >= 0) {
                pathname = pathname.substring(0, pathname.indexOf('?'));
            }
            /*
            var $location = util.getAngularServices().$location;
            if ($location) {
                pathname = $location.path();
            } else {
                pathname = window.location.hash ? window.location.hash.substring(1) : '/';
            }
            */
        }
        pathname = decodeURI(pathname);

        var username = config.isOfficialDomain(hostname) ? undefined : hostname.match(/([\w-]+)\.[\w]+\.[\w]+/);
        var sitename = '';
        var pagename = '';
        var pagepath = '';
        var domain = '';

        // 排除IP访问
        if (hostname.split(':')[0].match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
            username = undefined;
        }

        var paths = pathname.split('/');
        if (username) {
            username = username[1];
            var splitIndex = username.indexOf('-');
            if (splitIndex > 0) {
                sitename = username.substring(splitIndex + 1);
                username = username.substring(0, splitIndex);
                pagename = paths[paths.length-1];
                pagepath = '/' + username + '/' + sitename + pathname;
            } else {
                sitename = paths.length > 1 ? paths[1] : undefined;
                pagename = paths[paths.length-1];
                pagepath = '/' + username + pathname;
            }
        } else {
            username = paths.length > 1 ? paths[1] : undefined;
            sitename = paths.length > 2 ? paths[2] : undefined;
            pagename = paths.length > 3 ? paths[3] : undefined;
            pagepath = pathname;
        }
        if (username != "wiki" && !pagename) {
            pagename = "index";
            pagepath += (pagepath[pagepath.length-1] == "/" ? "" : "/") + pagename;
        }
        domain = hostname;

        return {domain:domain, username:username, sitename:sitename, pagename:pagename, pathname:pathname, pagepath: pagepath};
    }

    util.setLastUrlObj = function (urlObj) {
        this.lastUrlObj = urlObj;
    }

    util.getLastUrlObj = function () {
        return this.lastUrlObj;
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
    util.http = function(method, url, params, callback, errorCallback) {
        var $http = this.angularServices.$http;
        var httpRespone = undefined;
        //Loading.showLoading();
        // 在此带上认证参数
        if (method == 'POST') {
            httpRespone = $http({method:method,url:url,data:params}); //$http.post(url, params);
        } else {
            httpRespone = $http({method:method,url:url,params:params});
        }
        httpRespone.then(function (response) {
            var data = response.data;
            //console.log(data);
            // debug use by wxa
            if (!data.error) {
                console.log(url);
            }
            if (data.error.id == 0) {
                //console.log(data.data);
                callback && callback(data.data);
            } else {
                console.log(data);
                errorCallback && errorCallback(data.error);
            }
            //Loading.hideLoading();
        }).catch(function (response) {
            console.log(response);
            //Loading.hideLoading();
            // 网络错误
            errorCallback && errorCallback(response.data);
        });
    }

    util.post = function (url, params, callback, errorCallback) {
        this.http("POST", url, params, callback, errorCallback);
    }

    util.get = function (url, params, callback, errorCallback) {
        this.http("GET", url, params, callback, errorCallback);
    }

    util.pagination = function (page, params, pageCount) {
        params.page = params.page || 0;
        page = page || 1;
        pageCount = pageCount || 1000000; // 页总数设置无线大

        if (params.page == page || page < 1 || page > pageCount) {
            return false;              // 不翻页
        }
        params.page = page;

        return true;
    }

    util.goUserSite = function (url, isOpen) {
        url = "http://" + config.apiHost + url;
        if (isOpen) {
            window.open(url);
        } else {
            window.location.href = url;
        }
    }

    // 跳转
    util.go = function (url, isOpen) {
        if (url[0] != '/' && url.indexOf('://') < 0) {
            url = "/wiki/" + url;
        }

        url = util.humpToSnake(url);
        if (config.islocalWinEnv()) {
            url = config.frontEndRouteUrl + '#' + url;
        } else if (url.indexOf('://') < 0){
            url = "http://" + config.apiHost + url;
        }

        if (isOpen) {
            window.open(url);
        } else {
            window.location.href = url;
        }
    }

    // 跳转至mod页
    util.goMod = function (path, isOpen) {
        path = util.humpToSnake(path);
        util.go("/wiki/js/mod/" + path, isOpen);
    }

    util.isOfficialPage = function () {
        var urlObj = util.parseUrl();
        var pathname = urlObj.pathname;
        var domain = urlObj.domain;
        if (config.isOfficialDomain(domain) && (pathname.indexOf('/wiki/') == 0 || pathname == '/')) {
            return true;
        }
        return false;
    }
    // 是否是编辑器页
    util.isEditorPage = function () {
        var pathname = util.parseUrl().pathname;
        pathname = util.snakeToHump(pathname);
        if (pathname == "/wiki/wikiEditor") {
            return true;
        }
        return false;
    }

    // 执行批量  function(finishCB){}
    util.batchRun = function(fnList,finish) {
        var isCall = [];
        var _isFinish = function () {
            if (isCall.length != fnList.length)
                return false;

            for (var i = 0; i < isCall.length; i++) {
                if (!isCall[i])
                    return false;
            }

            finish && finish();
            return true;
        }

        var _finish = function (index) {
            isCall[index] = true;
            _isFinish();
        }

        for (var i = 0; i < fnList.length; i++) {
            isCall.push(false);
            (function (index) {
                fnList[index] && (fnList[index])(function () {
                    _finish(index);
                });
            })(i);
        }
    }

    // 顺序执行 function(cb,errcb){}
    util.sequenceRun = function (fnList, delay, cb, errcb) {
        delay = delay == undefined ? 1000 : delay;
        var index = 0;
        var retryCount = {};
        var _sequenceRun = function () {
            if (fnList.length <= index) {
                cb && cb();
                return;
            }
            var indexStr = "retry_" + index;
            // 失败次数过多
            if (retryCount[indexStr] && retryCount[indexStr]> 3) {
                errcb && errcb();
                return;
            }

            var fn = fnList[index];
            fn && fn(function () {
                index++;
                _sequenceRun();
                //setTimeout(_sequenceRun,delay);
            }, function () {
                retryCount[indexStr] = retryCount[indexStr] ? (retryCount[indexStr] +1) : 1;
                setTimeout(_sequenceRun,delay);
            });
        };

        _sequenceRun();
    };

    // 书写格式转换
    // 下划线转驼峰
    util.snakeToHump = function (str) {
        if (!str) {
            return str;
        }
        var wordsList = str.split('_');
        var resultStr = wordsList[0];
        for (var i = 1; i < wordsList.length; i++) {
            var word = wordsList[i];
            if (word[0] >= 'a' && word[0] <= 'z') {
                resultStr += word[0].toUpperCase() + word.substring(1);
            } else {
                resultStr += word;
            }
        }
        return resultStr;
    }
    // 驼峰转下划线
    util.humpToSnake = function (str) {
        if (!str) {
            return str;
        }
        var resultStr = "";
        for (var i = 0; i < str.length; i++) {
            if (str[i] >= "A" && str[i] <= "Z") {
                resultStr += '_' + str[i].toLowerCase();
            } else {
                resultStr += str[i];
            }
        }
        return resultStr;
    }

    config.util = util;
    return util;
});