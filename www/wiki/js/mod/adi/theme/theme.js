define([
    'app',
    'jquery',
    'text!wikimod/adi/theme/theme.template.html',
], function(app, $, template) {
    'use strict';

    let styles = {
        "classic" : {
            "font" : [
                {'font-size' : '10px'},
                {'font-size' : '11px'},
                {'font-size' : '12px'},
                {'font-size' : '13px'},
                {'font-size' : '14px'},
            ],
            "color" : [
                {'color' : 'white'},
                {'color' : 'blue'},
                {'color' : 'green'},
                {'color' : 'yellow'},
                {'color' : 'cyan'},
            ],
            "bgcolor" : [
                {'background-color' : '#327abf'}
            ]
        },
        "horizon" : {
            "font" : [
                {'font-size' : '10px'},
                {'font-size' : '11px'},
                {'font-size' : '12px'},
                {'font-size' : '13px'},
                {'font-size' : '14px'},
            ],
            "color" : [
                {'color' : 'red'},
                {'color' : 'blue'},
                {'color' : 'green'},
                {'color' : 'yellow'},
                {'color' : 'cyan'},
            ],
            "bgcolor" : [
                {'background-color' : 'yellow'}
            ]
        }
    }

    app.registerComponent("adiTheme", {
        template : template,
        bindings : {
            params  : "<",
        },
        controller : function($scope){
            $scope.$watch('$ctrl.params', function(newParams, oldParams){
                $('[data-jss]').remove();

                let themeId = newParams.theme.id;

                if(themeId && styles[themeId]){
                    app.generateClassSheet('font', styles[themeId].font).attach();
                    app.generateClassSheet('color', styles[themeId].color).attach();
                    app.generateClassSheet('bgcolor', styles[themeId].bgcolor).attach();
                }
            });
        }
    });
});