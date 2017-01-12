/**
 * Created by wuxiangan on 2016/12/19.
 */

define(['app', 'require'], function (app, require) {
    console.log("router");
    app.config(['$stateProvider', '$urlRouterProvider', '$controllerProvider',function ($stateProvider, $urlRouterProvider, $controllerProvider) {
        //$urlRouterProvider.otherwise('/');
        var templatePathPrefix = config.htmlPath;
        var controllerPathPrefix = 'controller/';
        var routerMap = {
            'test':{
                url:'/test',
                templateUrl:templatePathPrefix + 'test.html',
                controllerPath:controllerPathPrefix + 'testController',
                controllerName:'testController',
            },
            'testEditor':{},

            'login':{},
            'home':{},

            'userCenter':{},
            'userpage': {},

            'website':{},
            'createWebsite':{},
            'editWebsite': {},
            'preview':{},
            'wikiEditor':{},
            
            'gitVersion':{},

            'siteshow':{},
            'usershow':{},
            'worksApply':{},

            // temp
            'game':{},
        };

        for (var key in routerMap) {
            var obj = routerMap[key] || {};
            var url = obj.url || ('/' + key);
            var templateUrl = obj.templateUrl || (templatePathPrefix + key + ".html");
            var controllerName = obj.controllerName || (key + 'Controller');
            var controllerPath = obj.controllerPath || (controllerPathPrefix + controllerName);

            $stateProvider.state(key, {
                url:url,
                templateUrl:templateUrl,
                controller:controllerName,
                resolve:{
                    resolveData: requireModule(controllerPath, controllerName),
                },
            });
        };

        function requireModule(controllerPath, controllerName) {
            return function ($q) {
                var deferred = $q.defer();
                require([controllerPath], function (controller) {
                    //console.log(controller);
                    controller && $controllerProvider.register(controllerName, controller);
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    }]);
});