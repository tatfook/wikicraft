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
  
    let headerPosStyle = {
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
            params : "<",
            theme  : "<",
        },
        controller : function($scope){
            console.log(this)
            console.log($scope);
            
            this.generateClassName = app.generateSectionClassName.bind(this);
            
            let sheet = app.generateClassSheet(this.params.desgin.id, headerPosStyle[this.params.desgin.id]);
            this.css  = sheet.toString();
        }
    });
});
