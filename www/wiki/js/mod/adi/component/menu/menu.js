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
    function registerComponent(wikiBlock){
        console.log(wikiBlock);

        app.registerComponent("adiMenu", {
            template: template_text,
            bindings: {
                viewEditorClick: "&",
                menu: "<",
                bgcolor: "@",
            },
            controller: function(){
                this.editorMode = wikiBlock.editorMode;
                console.log(this);
                console.log(this.menu);
            }
        });
    }
    
    return {
        register: function(wikiBlock){
            registerComponent(wikiBlock)
        }
    }
});
