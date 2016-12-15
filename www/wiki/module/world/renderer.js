/**
 * Author:LiXizhi
 * Date: 2016.12.13
 * Desc: renderer class for this mod
 */
define(function () {
    'use strict';

    var renderer = {};

    renderer.render = function (cmdName, params, isEditor) {
        return "<p>This is from a renderer class: " + (params || "") + " </p>"
    }
    return renderer;
});

