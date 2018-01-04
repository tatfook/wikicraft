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

    function registerController(wikiblock) {
        app.registerController("boardController", ['$scope', '$uibModal', '$sce', function ($scope, $uibModal, $sce) {
            $scope.editorMode = wikiblock.editorMode;

            if (wikiblock.editorMode) {
                var modParams = wikiblock.modParams.replace(/[\ \r\n]+/g, "");

                if (typeof(modParams) == "string" && modParams.length == 0 || modParams == "blank") {
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
                        success     : function(res){
                            console.log(res);
                            var compressData = $scope.ui.getCurrentCompressData();

                            if(compressData){
                                wikiblock.applyModParams(compressData);
                            }else{
                                wikiblock.applyModParams("blank");
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
                $uibModalInstance.close();
            }
        }]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
        },
    };
});