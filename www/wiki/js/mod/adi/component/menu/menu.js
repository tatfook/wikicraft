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
    app.registerComponent("adiMenu", {
        template : template,
        // require  : {
        //     'adiHeader' : '^adiHeader'
        // },
        bindings : {
            menu: "<"
        },
        controller: function(){
            this.generateComponentClassName = app.generateComponentClassName.bind(this);
            this.componentStyleName         = "component-menu-style";
            this.menuStyle                  = {
                'list': {
                    'padding' : '10px',
                },
                'div':{
                    'font-size' : '20px'
                }
            };

            let componentMenuStyle = app.generateClassSheet(this.componentStyleName, this.menuStyle);
            
            this.css = componentMenuStyle.toString();
        }
    });
});
