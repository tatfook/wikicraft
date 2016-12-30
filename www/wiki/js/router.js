/**
 * Created by wuxiangan on 2016/12/19.
 */

define(['app', 'require'], function (app, require) {
    console.log("router");
    app.config(function ($stateProvider, $urlRouterProvider, $controllerProvider) {
        //$urlRouterProvider.otherwise('/');
        var templatePathPrefix = config.htmlPath;
        var controllerPathPrefix = config.jsPath + 'app/controller/';
        var routerMap = {
            'test':{
                url:'/test',
                templateUrl:templatePathPrefix + 'test.page',
                controllerPath:controllerPathPrefix + 'testController.js',
                controllerName:'testController',
            },
            'login':{},
            'home':{},

            'userCenter':{},
            'userpage': {},

            'website':{},
            'createWebsite':{},
            'editWebsite': {},
            'preview':{},

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
            var controllerPath = obj.controllerPath || (controllerPathPrefix + controllerName + '.js');

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
                    $controllerProvider.register(controllerName, controller);
                    deferred.resolve();
                });
                return deferred.promise;
            }
        }
    });
});