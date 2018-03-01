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
            this.componentMode              = 'component';
            this.generateComponentClassName = app.generateComponentClassName.bind(this);
            this.componentStyleName         = "component-menu-style";
            this.menuStyle                  = {
                "list" : {
                    "list-style-type"  : "none",
                    "width"            : "100%",
                    "height"           : "50px",
                },
                "list > li" : {
                    "float"                 : "left",
                    "height"                : "50px",
                    "color"                 : "white",
                    "text-align"            : "center",
                    "line-height"           : "50px",
                    "padding"               : "0 30px",
                    "background-image"      : 'url("/wiki/js/mod/adi/assets/imgs/menu-button-bg.png")',
                    "background-repeat"     : "no-repeat",
                    "background-position-x" : "100%",
                    "position"              : "relative",
                    "font-size"             : "17px"
                },
                "div" : {
                    'font-size' : '20px'
                }
            };

            this.css = app.generateClassStyle(this.componentStyleName, this.menuStyle);
        }
    });
});
