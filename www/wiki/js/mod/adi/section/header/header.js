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
        "header-pos-style-0" : {
            container : {
                padding: '10px'
            },
            card : {
                padding: '30px'
            }
        },
        "header-pos-style-1" : {
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
            $scope.tttt = 66666644445655;

            this.generateClassName = app.generateClassName.bind(this);
            // this.editorMode        = app.isEditMode();
            console.log();
            let sheet = app.generateClassSheet(this.params.desgin.id, headerPosStyle[this.params.desgin.id]);
            this.css  = sheet.toString();

            this.test = 666666;

            // this.classes = classes;
            // console.log(this.editorMode);
        }
    });
});
