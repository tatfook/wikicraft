define([
    'app',
    'helper/util',
    'text!wikimod/board/main.html',
    'pako',
    '/wiki/js/mod/board/board.min.js?bust=3',
], function (app, util, htmlContent, pako) {
    jscolor.dir = "/wiki/js/mod/board/assets/images/";

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

    function registerController(wikiBlock) {
        app.registerController("boardController", ['$scope', '$uibModal', '$sce', function ($scope, $uibModal, $sce) {
			function init() {
                wikiBlock.modParams = wikiBlock.blockCache.wikiBlock.modParams;

				if (wikiBlock.editorMode) {
					$scope.mxClientEdit = true;
					
					initEditMode();
				} else {
					initPreview(wikiBlock, function (svg) {
						$scope.preview = $sce.trustAsHtml(svg);
						util.$apply();
					});
				}
            }
            
            init();

			wikiBlock.init({scope:$scope});
			$scope.onParamsChange = function() {
				init();
				util.$apply();
			}

            $scope.edit = function () {
                if (!wikiBlock.editorMode) {
                    return;
                }

                $uibModal.open({
                    "animation"      : false,
                    "ariaLabeledBy"  : "title",
                    "ariaDescribedBy": "body",
                    "template"       : "<div id='mx-client'><div class='mx-client-close' ng-click='close()'>关闭</div></div>",
                    "controller"     : "boardEditorController",
                    "size"           : "lg",
                    "openedClass"    : "mx-client-modal",
                    "backdrop"       : "static",
                    "keyboard"       : false,
                    "resolve"        : {
                        "wikiBlock" : function(){
                            return wikiBlock;
                        }
                    }
                })
                .result.then(function (ui) {
                    var compressData = ui.getCurrentCompressData();

                    if(compressData){
                        wikiBlock.applyModParams(compressData);
                        wikiBlock.modParams = compressData;
                    }else{
                        wikiBlock.applyModParams("blank");
                        wikiBlock.modParams = "blank";
                    }

                    initEditMode();
                }, function (params) {});
            };

            function initEditMode(){
				if (typeof(wikiBlock.modParams) != "string") {
					wikiBlock.modParams = "";
				}
                var modParams = wikiBlock.modParams.replace(/[\ \r\n]+/g, "");
                
                if (typeof(modParams) == "string" && modParams.length == 0 || modParams == "blank") {
                    $scope.mxClientStart = true;
                    $scope.startNotice   = "点击此处开始编辑";
                    $scope.preview = "";
                    util.$apply();
                } else {
                    $scope.mxClientStart = false;
                    initPreview(wikiBlock, function (svg) {
                        $scope.preview = $sce.trustAsHtml(svg);
                        util.$apply();
                    });
                }
            }
        }])

        app.registerController("boardEditorController", ['$scope', '$uibModalInstance', 'wikiBlock', function ($scope, $uibModalInstance, wikiBlock) {           
            $scope.close = function () {
                $uibModalInstance.close($scope.ui);
            }

            $scope.$watch('$viewContentLoaded', function(){
                setTimeout(function () {
					if (typeof(wikiBlock.modParams) != "string") {
						wikiBlock.modParams = "";
					}
                    initEditor(wikiBlock.modParams, function (ui) {
                        $scope.ui = ui;
                        $scope.$apply();
                    });
                }, 0)
            });
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        },
    };
});
