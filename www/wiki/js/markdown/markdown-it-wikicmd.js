/**
 * Author: LiXizhi
 * Date: 2016.11.24
 * Desc: markdown wiki command parser
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.mardownit_wikicmd_plugin = factory());
}(this, (function () { 'use strict';

function mardownit_wikicmd_plugin(md, options) {
    options = options || {};

};

return mardownit_wikicmd_plugin;

})));
