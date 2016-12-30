/**
 * Created by wuxiangan on 2016/12/28.
 */


define([], function () {
    var render = {};
    console.log(angular.injector())
    render.render = function (cmdName, moduleParams, render) {
        cmdName = cmdName.replace(/\./g,'/');
        var modulePath = config.wikiModPath + cmdName + '.js';
        require([modulePath], function (module) {
            render(module.render(cmdName, moduleParams));
        });
        //render("<p>This is from a renderer class: " + (params || "") + " </p>");
    };

    return render;
});