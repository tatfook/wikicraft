/**
 * Title  : editor mode component
 * Author : big
 * Date   : 2018.2.12 Monday
 * Desc   : 
 */

 define([
    'app',
 ], function(app) {
    'use strict';

    app.registerComponent("editorMode", {
        template: "",
        controller : function(){
            console.log(this);
            console.log("hello world!");
        }
    });

 });