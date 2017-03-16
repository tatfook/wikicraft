/**
 * Created by wuxiangan on 2016/12/19.
 */

define(['app', 'require'], function (app, require) {
    console.log("router");
    app.config(['$stateProvider', '$urlRouterProvider',function ($stateProvider, $urlRouterProvider) {
        //$urlRouterProvider.otherwise('/');
        var templatePathPrefix = config.htmlPath;
        var controllerPathPrefix = 'controller/';
        var routerMap = {
            'test':{
                url:'/test',
                controllerPath:controllerPathPrefix + 'testController',
                controllerName:'testController',
            },

            'login':{},
            'home':{},
            'wikiEditor':{},
            'userCenter':{},
            'gitVersion':{},
            'siteshow':{},

            'preview':{},
            'worksApply':{},
            'knowledge':{},
            'VIP':{},
            'VIPLevel':{},
            'findPwd': {},
            'kaitlynUser':{},
        };

        for (var key in routerMap) {
            var obj = routerMap[key] || {};
            var url = obj.url || ('/' + key);
            var controllerName = obj.controllerName || (key + 'Controller');
            var controllerPath = obj.controllerPath || (controllerPathPrefix + controllerName);

            var routeObj = {
                url:url,
                templateUrl: templatePathPrefix + key + '.html',
                //controller:controllerName,
                resolve:{
                    resolveData: requireModule(controllerPath, controllerName, routeObj),
                },
            };
            $stateProvider.state(key, routeObj);
        };

        function requireModule(controllerPath, controllerName, routeObj) {
            return function ($q) {
                var deferred = $q.defer();
                require([controllerPath], function (htmlContent) {
                    //console.log(htmlContent);
                    //routeObj.template = htmlContent;
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }]);
});