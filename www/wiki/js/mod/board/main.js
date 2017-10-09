define([
    'app',
    'helper/util',
    'text!wikimod/board/main.html',
    '/wiki/js/mod/board/assets/mx_client.js',
], function (app, util, htmlContent) {
    var initEditor = function (callback) {
        var mxClientHeight = $(window).height() - 160;
        var mxClientWidth = $("#mx-client").outerWidth();

        $("#mx-client").css({
            "width": mxClientWidth + "px",
            "height": mxClientHeight + "px",
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
            var editor = new EditorUi(new Editor(urlParams['chrome'] == '0', themes), document.querySelector("#mx-client"));

            if (typeof (callback) == "function") {
                callback(editor);
            }

        }, function () {
            document.body.innerHTML = '<center style="margin-top:10%;">Error loading resource files. Please check browser console.</center>';
        });
    }

    var initPreview = function (wikiBlock) {
        if (!mxClient.isBrowserSupported()) {
            // Displays an error message if the browser is not supported.
            mxUtils.error('Browser is not supported!', 200, false);
        } else {
            var container = document.createElement("div");
            var data      = wikiBlock.modParams;

            // Disables the built-in context menu
            mxEvent.disableContextMenu(container);

            var graph = new mxGraph(container);
            graph.setEnabled(false);

            new mxRubberband(graph);

            var paraent = graph.getDefaultParent();

            graph.getModel().beginUpdate();

            var doc   = mxUtils.parseXml(data);
            var model = new mxGraphModel();
            var codec = new mxCodec(doc);

            codec.decode(doc.documentElement, model);

            var children = model.getChildren(model.getChildAt(model.getRoot(), 0));

            graph.importCells(children);

            graph.getModel().endUpdate();

            return container.innerHTML;
        }
    }

    function registerController(wikiBlock) {
        app.registerController("boardController", ['$scope', '$uibModal', '$sce', function ($scope, $uibModal, $sce) {
            if (wikiBlock.editorMode) {
                $scope.mxClientEdit = true;

                if (typeof (wikiBlock.modParams) == "string" && wikiBlock.modParams.length == 0) {
                    $scope.mxClientStart = true;
                    $scope.startNotice = "点击此处开始编辑";
                } else {
                    $scope.preview = $sce.trustAsHtml(initPreview(wikiBlock));
                }
            } else {
                $scope.preview = $sce.trustAsHtml(initPreview(wikiBlock));
            }

            $scope.edit = function () {
                if (!wikiBlock.editorMode) {
                    return;
                }

                $uibModal.open({
                    "animation": true,
                    "ariaLabeledBy": "title",
                    "ariaDescribedBy": "body",
                    "template": "<div id='mx-client'><span class='mx-client-close ng-scope' ng-click='close()'>+</span></div>",
                    "controller": "mxController",
                    "size": "lg",
                    "openedClass": "mx-client-modal",
                })
                .result.then(function (params) {
                    var data = $scope.editor.returnXml();
                    wikiBlock.applyModParams(data);
                }, function (params) {
                    console.log($scope.editor);
                });

                setTimeout(function () {
                    initEditor(function (editor) {
                        $scope.editor = editor;
                    });
                }, 500)
            };
        }])

        app.registerController("mxController", ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
            $scope.close = function () {
                $uibModalInstance.close();
            }
        }]);

        //app.directive('compile', ['$compile', function ($compile) {
        //    return function (scope, element, attrs) {
        //        scope.$watch(
        //            function (scope) {
        //                // watch the 'compile' expression for changes
        //                return scope.$eval(attrs.compile);
        //            },
        //            function (value) {
        //                // when the 'compile' expression changes
        //                // assign it into the current DOM
        //                element.html(value);

        //                // compile the new DOM and link it to the current
        //                // scope.
        //                // NOTE: we only compile .childNodes so that
        //                // we don't get into infinite loop compiling ourselves
        //                $compile(element.contents())(scope);
        //            }
        //        );
        //    };
        //}])
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        },
    };
});