/**
 * Title : logo component
 * Author : big
 * Date : 2018.2.12 Monday
 * Desc : 
 */

define([
    'app',
    'text!wikimod/adi/component/logo/logo.template.html'
], function(app, template) {
    'use strict';
    
    app.registerComponent("adiLogo", {
        template : template,
        bindings : {

        },
        controller : function(){
            console.log(this);
        }
    });
});