/**
 * Title: menu component for ADI
 * Author: LiXizhi
 * Date: 2018.2.5 
 * Desc: 
 */
define([
<<<<<<< Updated upstream
    'app', 
    'text!wikimod/adi/component/menu/menu.template.html',
    'jss',
    'jss-preset-default',
], function (app, template, jss, preset) {
    console.log(jss);
    console.log(preset);

    var css;

    function create(){
        jss.create(preset.default());

        // Create your style.
        const style = {
            myButton: {
                color: 'green'
=======
    'app',
    'text!wikimod/adi/component/menu/menu.template.html',
    'components/editorMode',
], function (app, template_text) {
    function registerComponent(wikiBlock){
        console.log(wikiBlock);

        app.registerComponent("adiMenu", {
            require: {
                editorMode : "^editorMode",
            },
            template: template_text,
            bindings: {
                viewEditorClick: "&",
                menu: "<",
                bgcolor: "@",
            },
            controller: function(){
                // this.editorMode = wikiBlock.editorMode;
                console.log(this.editorMode);
                console.log(this);
                console.log(this.menu);
>>>>>>> Stashed changes
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
        controller: function(){
            create();
            this.css = css;
            console.log(this);
            console.log(this.menu);
        }
    });
});
