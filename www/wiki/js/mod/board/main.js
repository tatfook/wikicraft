define([
    'app',
    'helper/util',
    'text!wikimod/board/main.html',
    '/wiki/js/mod/board/assets/mx_client.js',
], function (app, util, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("boardController", ['$scope', function ($scope) {

            console.log(wikiBlock.editorMode);

            if (wikiBlock.editorMode) {
                return true;
            }

            var editorUiInit = EditorUi.prototype.init;

            EditorUi.prototype.init = function () {
                editorUiInit.apply(this, arguments);

                this.actions.get('export').setEnabled(false);

                // Updates action states which require a backend
                return;
                if (!Editor.useLocalStorage) {
                    console.log(OPEN_URL);

                    mxUtils.post(OPEN_URL, '', mxUtils.bind(this, function (req) {
                        var enabled = req.getStatus() != 404;
                        console.log(enabled);
                        this.actions.get('open').setEnabled(enabled || Graph.fileSupport);
                        this.actions.get('import').setEnabled(enabled || Graph.fileSupport);
                        this.actions.get('save').setEnabled(enabled);
                        this.actions.get('saveAs').setEnabled(enabled);
                        this.actions.get('export').setEnabled(enabled);
                    }));
                }
            };

            // Adds required resources (disables loading of fallback properties, this can only
            // be used if we know that all keys are defined in the language specific file)
            mxResources.loadDefaultBundle = false;

            var bundle = mxResources.getDefaultBundle(RESOURCE_BASE, mxLanguage) || mxResources.getSpecialBundle(RESOURCE_BASE, mxLanguage);

            // Fixes possible asynchronous requests
            mxUtils.getAll([bundle, STYLE_PATH + '/default.xml'], function (xhr) {
                console.log(xhr);

                // Adds bundle text to resources
                mxResources.parse(xhr[0].getText());

                // Configures the default graph theme
                var themes = new Object();
                themes[Graph.prototype.defaultThemeName] = xhr[1].getDocumentElement();

                // Main
                new EditorUi(new Editor(urlParams['chrome'] == '0', themes));

                var mxClientHeight = $(window).height() - 160;
                var mxClientWidth  = $(window).width();

                $(document).ready(function () {
                    console.log($("#mx-client"));

                    $("#mx-client").css({
                        "width": mxClientWidth + "px",
                        "height": mxClientHeight + "px",
                    });

                    $(window).scrollTop(0)
                });
            }, function () {
                document.body.innerHTML = '<center style="margin-top:10%;">Error loading resource files. Please check browser console.</center>';
            });
        }])
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        },
    };
});