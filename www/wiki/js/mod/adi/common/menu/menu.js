/**
 * Title: menu component for ADI
 * Author: LiXizhi
 * Date: 2018.2.5 
 * Desc: 
 */
define([
    'app', 
    'text!wikimod/adi/component/menu/menu.template.html',
], function (app, template) {

    var classes = app.createStyleSheet({
        "menu-item-style0": {
            padding: '10px'
        },
        "menu-item-style1": {
            padding: '20px'
        },
    });

    app.registerComponent("adiMenu", {
        template: template,
        bindings: {
            menu: "<",
            theme: "<",
        },
        controller: function(){
            this.classes = classes;
            this.editorMode = app.isEditMode(); 
        }
    });
});
