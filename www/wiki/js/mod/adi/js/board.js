define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/board.html',
    'pako',
    'helper/mdconf',
    '/wiki/js/mod/adi/assets/board.min.js?bust=3',
], function (app, util, htmlContent, pako, mdconf) {
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

            if (data && data.replace(/[\ \r\n]+/g, "").length > 0 && data.replace(/[\ \r\n]+/g, "") != "blank") {
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

    var initPreview = function (wikiblock, callback) {
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

            if (wikiblock.modParams.diagram_board && wikiblock.modParams.diagram_board.data) {
                var data = "<diagram version=\"0.0.1\">" + wikiblock.modParams.diagram_board.data + "</diagram>";
                mxGraphModelData = graph.getDecompressData(data);
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

    function registerController(wikiblock) {
        app.registerController("boardController", ['$scope', '$uibModal', '$sce', function ($scope, $uibModal, $sce) {
            $scope.editorMode = wikiblock.editorMode;

            if (wikiblock.editorMode) {
                var boardData = (wikiblock.modParams.diagram_board && wikiblock.modParams.diagram_board.data) ? wikiblock.modParams.diagram_board.data : "";

                if (typeof(boardData) == "string" && boardData.length == 0 || boardData == "blank") {
                    $scope.mxClientStart = true;
                    $scope.startNotice   = "点击此处开始编辑";
                    $scope.$apply();
                } else {
                    initPreview(wikiblock, function (svg) {
                        $scope.preview = $sce.trustAsHtml(svg);
                        $scope.$apply();
                    });
                }
            } else {
                initPreview(wikiblock, function (svg) {
                    $scope.preview = $sce.trustAsHtml(svg);
                    $scope.$apply();
                });
            }

            wikiblock.init({
                scope  : $scope,
				styles : [],
				params_template : {
                    diagram_board:{
                        is_leaf      : true,
						type         : "diagram",
                        editable     : true,
						is_card_show : true,
						is_mod_hide  : false,
                        name         : "绘图板",
                        data         : "",
                        options      : {
                            "animation"      : true,
                            "ariaLabeledBy"  : "title",
                            "ariaDescribedBy": "body",
                            "template"       : "<div id='mx-client'><div class='mx-client-close' ng-click='close()'>关闭</div></div>",
                            "controller"     : "mxController",
                            "size"           : "lg",
                            "openedClass"    : "mx-client-modal",
                            "backdrop"       : "static",
                            "keyboard"       : false,
                        },
                        success     : function(ui){
                            var compressData = ui.getCurrentCompressData();

                            compressData = compressData.replace("<diagram version=\"0.0.1\">", "").replace("</diagram>", "");

                            var diagram_board = mdconf.jsonToMd({"diagram_board":{"data":compressData}});

                            if(compressData){
                                wikiblock.applyModParams(diagram_board);
                            }
                        },
                        error      : function(res){
                            console.log(res);
                        },
                    	require    : true,
                    },
				}
            });

            console.log($scope.params);
        }])

        app.registerController("mxController", ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
            $scope.close = function () {
                $uibModalInstance.close($scope.ui);
            }

            $scope.$watch('$viewContentLoaded', function(){
                setTimeout(function () {
                    initEditor(wikiblock.modParams.diagram_board.data, function (ui) {
                        $scope.ui = ui;
                        $scope.$apply();
                    });
                }, 0)
            });
        }]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
        },
    };
});