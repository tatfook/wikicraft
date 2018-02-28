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
    const createGenerateClassName = () => {
        let counter = 0
      
        return (rule, sheet) => `pizza--${rule.key}-${counter++}`
    }

    jss.default.setup({createGenerateClassName})

    function register(block, style){
        var css;
        jss.create(preset.default());

        function create(){
            const styles = {
                button: {
                    fontSize: 12,
                },
                ctaButton: {
                    extend: 'button',
                    // '&:hover': {
                    // background: color('blue')
                    //     .darken(0.3)
                    //     .hex()
                    // }
                },
                '@media (min-width: 1024px)': {
                    button: {
                    width: 200
                    }
                }
            }
            
            sheet = jss.default.createStyleSheet(styles)
            return sheet;
        }
    
        app.registerComponent("adiMenu", {
            template: template,
            bindings: {
                viewEditorClick: "&",
                menu: "<",
                bgcolor: "@",
            },
            controller: function($scope){
                var sheet = create();
                this.css = sheet.toString();

                setTimeout(function(){
                    $scope.$ctrl.css = "";
                    console.log($scope.$ctrl.css);
                    $scope.$apply();
                }.bind(this), 5000);
                // console.log(css);
            }
        });
    }

    return register;
});
