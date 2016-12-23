/**
 * Created by wuxiangan on 2016/12/22.
 */


//
(function () {
    config.registerPreloadModule(config.jsPath + 'test.js');
    if (typeof define == "undefined") {
        return ;
    }
    define([], function () {
        console.log("-----------------");
        return {key:"test"}
    });
})();



