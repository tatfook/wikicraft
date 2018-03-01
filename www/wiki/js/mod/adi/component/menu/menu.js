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

    let menuStyle = {
        "menu-item-style0": {
            padding: '10px'
        },
        "menu-item-style1": {
            padding: '20px'
        },
    };

    app.registerComponent("adiMenu", {
        template : template,
        // require  : {
        //     'adiHeader' : '^adiHeader'
        // },
        bindings : {
            params: "<"
        },
        controller: function(){
            // console.log(11122334445566)
            console.log(this);
            
            // this.classes = classes;
            // this.editorMode = app.isEditMode(); 
        }
    });
});
