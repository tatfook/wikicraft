define([
    'app',
    'jquery',
    'jss',
    'jss-preset-default',
    'text!wikimod/adi/theme/theme.template.html',
], function(app, $, jss, preset, template) {
    'use strict';

    let styles = {
        'classic' : {
            'font' : [
                [
                    {'font-size' : '10px'},
                    {'font-size' : '11px'},
                    {'font-size' : '12px'},
                    {'font-size' : '13px'},
                    {'font-size' : '14px'},
                ],
                [
                    
                ]
            ],
            'color' : [
                {'color' : 'red'},
                {'color' : 'blue'},
                {'color' : 'green'},
                {'color' : 'yellow'},
                {'color' : 'cyan'},
            ],
            'bgcolor' : [
                {'background-color' : '#327abf'}
            ]
        }
    }

    let styleName = 'classic';

    function genrerateClass(className, data){
        let setting = {createGenerateClassName : function(){
            let counter = 0
    
            return function(rule, sheet){
                return className + '-' + rule.key;//+ counter++;
            }
        }};
    
        jss.default.setup(setting);
        jss.create(preset.default());
    
        let sheet = jss.default.createStyleSheet(data).attach();

        return sheet.toString();
    }
    
    // let font  = genrerateClass('font', styles[styleName].font);
    // let color = genrerateClass('color', styles[styleName].color);
    
    // console.log(font);
    // console.log(color);

    // console.log($('[data-jss]'));

    app.registerComponent("adiTheme", {
        template : template,
        bindings : {
            theme  : "<",
        },
        controller : function($scope){
        }
    });
});