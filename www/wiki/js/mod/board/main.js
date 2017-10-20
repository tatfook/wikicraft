define([
    'app',
    'helper/util',
    'text!wikimod/board/main.html',
    'pako',
    '/wiki/js/mod/board/assets/graph.min.js?bust=1',
], function (app, util, htmlContent, pako) {
    jscolor.dir = "/wiki/js/mod/board/assets/images/";

    var initEditor = function (data, callback) {
        if (!mxClient.isBrowserSupported()) {
            document.querySelector("#mx-client").innerHTML("Browser is not supported!");
        }

        var mxClientHeight = $(window).height() - 160;
        var mxClientWidth  = $("#mx-client").outerWidth();

        $("#mx-client").css({
            "width"  : mxClientWidth + "px",
            "height" : mxClientHeight + "px",
        });

        var editorUiInit = EditorUi.prototype.init;

        EditorUi.prototype.init = function () {
            editorUiInit.apply(this, arguments);

            this.actions.get('export').setEnabled(false);
            this.actions.get('import').setEnabled(false);
            this.actions.get('open').setEnabled(false);
            this.actions.get('save').setEnabled(false);
            this.actions.get('saveAs').setEnabled(false);
        };

        // Adds required resources (disables loading of fallback properties, this can only
        // be used if we know that all keys are defined in the language specific file)
        mxResources.loadDefaultBundle = false;

        var bundle = mxResources.getDefaultBundle(RESOURCE_BASE, mxLanguage) || mxResources.getSpecialBundle(RESOURCE_BASE, mxLanguage);

        // Fixes possible asynchronous requests
        mxUtils.getAll([bundle, STYLE_PATH + '/default.xml'], function (xhr) {
            // Adds bundle text to resources
            mxResources.parse(xhr[0].getText());

            // Configures the default graph theme
            var themes = new Object();
            themes[Graph.prototype.defaultThemeName] = xhr[1].getDocumentElement();

            // Main
            var ui = new EditorUi(new Editor(urlParams['chrome'] == '0', themes), document.querySelector("#mx-client"));

            if (data && data.length > 0) {
                doc = ui.editor.graph.getDecompressData(data);

                ui.editor.setGraphXml(doc.documentElement);
            }

            if (typeof (callback) == "function") {
                callback(ui);
            }

        }, function () {
            document.querySelector("#mx-client").innerHTML = '<center style="margin-top:10%;">Error loading resource files. Please check browser console.</center>';
        });
    }

    var initPreview = function (wikiBlock, callback) {
        if (!mxClient.isBrowserSupported()) {
            return "Browser is not supported!";
        }

        var container = document.createElement("div");

        mxResources.loadDefaultBundle = false;

        var bundle = mxResources.getDefaultBundle(RESOURCE_BASE, mxLanguage) || mxResources.getSpecialBundle(RESOURCE_BASE, mxLanguage);

        mxUtils.getAll([bundle, STYLE_PATH + '/default.xml'], function (xhr) {
            // Adds bundle text to resources
            mxResources.parse(xhr[0].getText());

            // Configures the default graph theme
            var themes = new Object();
            themes[Graph.prototype.defaultThemeName] = xhr[1].getDocumentElement();

            var graph = new Graph(container, null, null, null, themes);

            if (wikiBlock.modParams) {
                var mxGraphModelData = graph.getDecompressData(wikiBlock.modParams);
            }

            var decoder = new mxCodec(mxGraphModelData);
            var node    = mxGraphModelData.documentElement;

            graph.centerZoom = false;
            graph.setTooltips(false);
            graph.setEnabled(false);

            decoder.decode(node, graph.getModel());

            var svg = container.querySelector("svg");
            svg.style.backgroundImage = null;

            if (typeof (callback) == "function") {
                callback(container.innerHTML);
            }
        });
    }

    function registerController(wikiBlock) {
        app.registerController("boardController", ['$scope', '$uibModal', '$sce', function ($scope, $uibModal, $sce) {
            if (wikiBlock.editorMode) {
                $scope.mxClientEdit = true;

                if (typeof (wikiBlock.modParams) == "string" && wikiBlock.modParams.length == 0) {
                    $scope.mxClientStart = true;
                    $scope.startNotice   = "点击此处开始编辑";
                } else {
                    initPreview(wikiBlock, function (svg) {
                        $scope.preview = $sce.trustAsHtml(svg);
                    });
                    
                }
            } else {
                initPreview(wikiBlock, function (svg) {
                    $scope.preview = $sce.trustAsHtml(svg);
                });
            }

            $scope.edit = function () {
                if (!wikiBlock.editorMode) {
                    return;
                }

                $uibModal.open({
                    "animation"      : true,
                    "ariaLabeledBy"  : "title",
                    "ariaDescribedBy": "body",
                    "template"       : "<div id='mx-client'><div class='mx-client-close' ng-click='close()'>关闭</div></div>",
                    "controller"     : "mxController",
                    "size"           : "lg",
                    "openedClass"    : "mx-client-modal",
                })
                .result.then(function () {
                    var compressData = $scope.ui.getCurrentCompressData();

                    //console.log(compressData);
                    wikiBlock.applyModParams(compressData);
                }, function (params) {
                    
                });

                setTimeout(function () {
                    initEditor(wikiBlock.modParams, function (ui) {
                        $scope.ui = ui;
                    });
                }, 500)
            };
        }])

        app.registerController("mxController", ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
            $scope.close = function () {
                $uibModalInstance.close();
            }
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        },
    };
});
