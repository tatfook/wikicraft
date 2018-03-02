/**
 * Title: header component is a compound component of img, label and menu
 * Author: LiXizhi
 * Date: 2018.2.5 
 * Desc: 
 */
define([
    'app', 
    'text!wikimod/adi/section/header/header.template.html',
    'wikimod/adi/component/menu/menu',
    'wikimod/adi/component/logo/logo'
], function (app, template) {
  
    let styles = {
        "header-style-0" : {
            container : {
                padding: '10px'
            },
            card : {
                padding: '30px'
            }
        },
        "header-style-1" : {
            button : {
                padding: '20px'
            }
        }
    };

    app.registerComponent("adiHeader", {
        template : template,
        bindings : {
            params : "<"
        },
        controller : function($scope){          
            this.componentMode     = "section";
            this.generateClassName = app.generateSectionClassName.bind(this);
            
            let designId = this.params.design.id;

            this.css = app.generateClassStyle(designId, styles[designId]);
        }
    });

    return styles;
});
