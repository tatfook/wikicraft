/**
 * Title: menu component for ADI
 * Author: LiXizhi
 * Date: 2018.2.5 
 * Desc: 
 */
define([
    'app', 
    'text!wikimod/adi/component/menu/menu.template.html',
    'jss',
    'jss-preset-default',
], function (app, template, jss, preset) {
    function register(block, style){
        var css;

        function create(){
            jss.create(preset.default());
    
            // Create your style.
            const style = {
                myButton: {
                    color: 'green'
                }
            }
    
            // Compile styles, apply plugins.
            const sheet = jss.default.createStyleSheet(style)
    
            // If you want to render on the client, insert it into DOM.
            sheet.attach()
    
            // If you want to render server-side, get the css text.
            css = sheet.toString();
        }
    
        app.registerComponent("adiMenu", {
            template: template,
            bindings: {
                viewEditorClick: "&",
                menu: "<",
                bgcolor: "@",
            },
            controller: function($scope){
                create();
                this.css = css;
                console.log(this);
            }
        });
    }

    return register;
});
