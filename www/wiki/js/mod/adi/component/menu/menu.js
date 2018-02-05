/**
 * Title: menu component for ADI
 * Author: LiXizhi
 * Date: 2018.2.5 
 * Desc: 
 */
define([
    'app', 
    'text!wikimod/adi/component/menu/menu.template.html'
], function (app, template_text) {
    app.component("adiMenu", {
        require :  { editorMode: '^editorMode' },
        template: template_text,
        bindings: {
            viewEditorClick: "&",
            menu: "<",
        },
        controller: function(){

        }
    });
});
