/**
 * Title: header component is a compound component of img, label and menu
 * Author: LiXizhi
 * Date: 2018.2.5 
 * Desc: 
 */
define([
    'app', 
    'text!wikimod/adi/component/menu/menu.template.html',
], function (app, template) {
  
    var classes = app.createStyleSheet({
        "header-menu-pos-style0": {
            padding: '10px'
        },
        "header-menu-pos-style1": {
            padding: '20px'
        },
    });

    app.registerComponent("adiHeader", {
        template: template,
        bindings: {
            params: "<",
            theme: "<",
        },
        controller: function(){
            app.someparams

            this.classes = classes;
            this.editorMode = app.isEditMode(); 
        }
    });
});
