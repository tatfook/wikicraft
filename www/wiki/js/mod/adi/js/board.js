define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/board.html',
    'pako',
    '/wiki/js/mod/adi/assets/board.min.js?bust=3',
], function (app, util, htmlContent, pako) {
    jscolor.dir = "/wiki/js/mod/adi/assets/images/";

    var initEditor = function (data, callback) {
        if (!mxClient.isBrowserSupported()) {
            document.querySelector("#mx-client").innerHTML("Browser is not supported!");
        }

        var mxClientHeight = $(window).height();
        var mxClientWidth  = $("#mx-client").outerWidth();

        $("#mx-client").css({
            "width"  : mxClientWidth + "px",
            "height" : mxClientHeight + "px",
        });

        mxResources.loadDefaultBundle = false;

        var bundle = mxResources.getDefaultBundle(RESOURCE_BASE, mxLanguage) || mxResources.getSpecialBundle(RESOURCE_BASE, mxLanguage);

        mxUtils.getAll([bundle, STYLE_PATH + '/default.xml'], function (xhr) {
            mxResources.parse(xhr[0].getText());

            var themes = new Object();
            themes[Graph.prototype.defaultThemeName] = xhr[1].getDocumentElement();

            var ui = new Board(new Editor(urlParams['chrome'] == '0', themes), document.querySelector("#mx-client"));

            if (data && data.length > 0 && data.replace(/[\ \r\n]+/g, "") != "blank") {
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
            mxResources.parse(xhr[0].getText());

            var themes = new Object();
            themes[Graph.prototype.defaultThemeName] = xhr[1].getDocumentElement();

            var graph = new Graph(container, null, null, null, themes);

            var mxGraphModelData;

            if (wikiBlock.modParams) {
                mxGraphModelData = graph.getDecompressData(wikiBlock.modParams);
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

                if (typeof(wikiBlock.modParams) == "string" && wikiBlock.modParams.length == 0 || wikiBlock.modParams.replace(/[\ \r\n]+/g, "") == "blank") {
                    $scope.mxClientStart = true;
                    $scope.startNotice   = "点击此处开始编辑";
                    $scope.$apply();
                } else {
                    initPreview(wikiBlock, function (svg) {
                        $scope.preview = $sce.trustAsHtml(svg);
                        $scope.$apply();
                    });
                    
                }
            } else {
                initPreview(wikiBlock, function (svg) {
                    $scope.preview = $sce.trustAsHtml(svg);
                    $scope.$apply();
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
                    "backdrop"       : "static",
                    "keyboard"       : false,
                })
                .result.then(function () {
                    var compressData = $scope.ui.getCurrentCompressData();

                    if(compressData){
                        wikiBlock.applyModParams(compressData);
                    }else{
                        wikiBlock.applyModParams("blank");
                    }
                }, function (params) {
                    
                });

                setTimeout(function () {
                    initEditor(wikiBlock.modParams, function (ui) {
                        $scope.ui = ui;
                        $scope.$apply();
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