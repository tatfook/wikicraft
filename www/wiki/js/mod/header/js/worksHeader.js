
define(['app', 'text!wikimod/header/pages/worksHeader.page'], function (app, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("worksHeaderController", function ($scope, $auth, Account, Message) {
        });
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        }
    }
});