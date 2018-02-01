define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/board.html',
    'pako',
    'helper/mdconf',
    '/wiki/js/mod/adi/assets/board.min.js?bust=3',
], function (app, util, htmlContent, pako, mdconf) {
	var initObj = {
		styles : [],
		params_template : {
			diagram_board:{
				is_leaf      : true,
				type         : "modal",
				editable     : true,
				is_card_show : true,
				is_mod_hide  : false,
				name         : "绘图板",
				button_name  : "打开绘图板",
				svg          : "",
				compress     : "",
				require      : true,
			},
		}
	};

	function getEditorParams(modParams) {
		modParams = modParams || {};

		var params_template = initObj.params_template;
		for (var key in params_template) {
			if (key == "design") {
				modParams.design = modParams.design || {};
				modParams.design.text = params_template[key].text;
			} else {
				modParams[key] = modParams[key] || {};
				modParams[key]["$data"] = params_template[key];
				modParams[key]["text"] = modParams[key]["text"] || params_template[key]["text"];
			}
		}

		return modParams;
	}

	function getStyleList() {
		return initObj.styles;
	}

    jscolor.dir = "/wiki/js/mod/adi/assets/images/";

    var initEditor = function (wikiBlock, callback) {
        if (!mxClient.isBrowserSupported()) {
            if(typeof("callback") == "function"){
                callback(false);
            }
        }

        var boardEditorContainer = document.querySelector("#mx-client");
        var boardEditorHeight    = window.innerHeight;
        var boardEditorWidth     = window.innerWidth;

        boardEditorContainer.style.height = boardEditorHeight + "px";
        boardEditorContainer.style.width  = boardEditorWidth + "px";

        getThemes(function (themes) {
            var boardEditor = new Board(new Editor(urlParams['chrome'] == '0', themes), boardEditorContainer); //初始化画板编辑器
            var compress    = wikiBlock.modParams.diagram_board.compress;

            if(typeof(compress) == "string" && compress.length > 4){
                // if (data && data.replace(/[\ \r\n]+/g, "").length > 0 && data.replace(/[\ \r\n]+/g, "") != "blank") {
                //     doc = ui.editor.graph.getDecompressData(data);

                //     ui.editor.setGraphXml(doc.documentElement);
                // }
            }

            if(typeof(callback) == "function"){
                callback(true, boardEditor);
            }

        }, callback);
    }

    var initPreview = function (wikiBlock, callback) {
        // if (!mxClient.isBrowserSupported()) {
        //     return "Browser is not supported!";
        // }

        // var container = document.createElement("div");

        // mxResources.loadDefaultBundle = false;

        // var bundle = mxResources.getDefaultBundle(RESOURCE_BASE, mxLanguage) || mxResources.getSpecialBundle(RESOURCE_BASE, mxLanguage);

        // mxUtils.getAll([bundle, STYLE_PATH + '/default.xml'], function (xhr) {
        //     mxResources.parse(xhr[0].getText());

        //     var themes = new Object();
        //     themes[Graph.prototype.defaultThemeName] = xhr[1].getDocumentElement();

        //     var graph = new Graph(container, null, null, null, themes);

        //     var mxGraphModelData;

        //     if (wikiBlock.modParams.diagram_board && wikiBlock.modParams.diagram_board.data) {
        //         var data = "<diagram version=\"0.0.1\">" + wikiBlock.modParams.diagram_board.data + "</diagram>";
        //         mxGraphModelData = graph.getDecompressData(data);
        //     }

        //     var decoder = new mxCodec(mxGraphModelData);
        //     var node    = mxGraphModelData.documentElement;

        //     graph.centerZoom = false;
        //     graph.setTooltips(false);
        //     graph.setEnabled(false);

        //     decoder.decode(node, graph.getModel());

        //     var svg = container.querySelector("svg");
        //     svg.style.backgroundImage = null;

        //     if (typeof (callback) == "function") {
        //         callback(container.innerHTML);
        //     }
        // });
    }

    function convertMxToSvg(boardEditor, mxData, callback){
        if(mxData){
            var graphContainer = document.createElement("div");

            getThemes(function(themes){
                var graph   = new Graph(graphContainer, null, null, null, themes);
                var decoder = new mxCodec(mxData);
                var node    = mxData.documentElement;

                graph.centerZoom = false;
                graph.setTooltips(false);
                graph.setEnabled(false);

                decoder.decode(node, graph.getModel());

                var svg = graphContainer.querySelector("svg");
                svg.style.backgroundImage = null;

                if(typeof(callback) == "function"){
                    callback(svg);
                }
            });
        }else{
            if(typeof(callback) == "function"){
                callback(false);
            }
        }
    }

    function getThemes(successCallback, failCallback){
        mxResources.loadDefaultBundle = false;

        var bundle = mxResources.getDefaultBundle(RESOURCE_BASE, mxLanguage) || mxResources.getSpecialBundle(RESOURCE_BASE, mxLanguage);

        mxUtils.getAll([bundle, STYLE_PATH + '/default.xml'], function (xhr) {
            var i18n  = xhr[0].getText();
            var theme = xhr[1].getDocumentElement(); 

            mxResources.parse(i18n);

            if(typeof(successCallback) == "function"){
                successCallback({"default" : theme});
            }
        }, function () {
            if(typeof(failCallback) == "function"){
                failCallback(false);
            }
        });
    }

    function render(wikiBlock) {
		var $scope = wikiBlock.$scope;
		var $rootScope = app.ng_objects.$rootScope;
		var $uibModal = app.ng_objects.$uibModal;
		var $sce = app.ng_objects.$sce;

		$scope.mode = wikiBlock.mode;
		$scope.params = wikiBlock.modParams = getEditorParams(wikiBlock.modParams);

		if (wikiBlock.mode) {
			var boardData = (wikiBlock.modParams && wikiBlock.modParams.diagram_board && wikiBlock.modParams.diagram_board.data) ? wikiBlock.modParams.diagram_board.data : "";

			if (typeof(boardData) == "string" && boardData.length == 0 || boardData == "blank") {
				$scope.preview = $sce.trustAsHtml("<div class=\"mx-client-start\">点击此处开始编辑</div>");
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


		$scope.options = {
			"animation"      : true,
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
		}

		$scope.error   = function(){},

		$scope.success = function(boardEditor){
			var compressData = boardEditor.getCurrentCompressData();
			var mxData       = boardEditor.editor.getGraphXml();

			convertMxToSvg(boardEditor, mxData, function(svg){
				if(svg){
					// console.log(svg);
					// console.log(wikiBlock.modParams);

					

					// $scope.params.diagram_board.compress = "http://www.baidu.com";
					// $scope.params.diagram_board.svg      = "http://www.qq.com";

					// $scope.applyAttrChange();
				}
			});

			// var diagram_board = mdconf.jsonToMd({"diagram_board":{"data":compressData}});
		}


		return htmlContent;
	}

	app.registerController("boardEditorController", ['$scope', '$uibModalInstance', 'wikiBlock', function ($scope, $uibModalInstance, wikiBlock) {
		$scope.close = function () {
			$uibModalInstance.close($scope.boardEditor);
		}

		$scope.$watch('$viewContentLoaded', function(){
			initEditor(wikiBlock, function (beSuccess, boardEditor) {
				$scope.boardEditor = boardEditor;
				$scope.$apply();
			});
		});
	}]);

    return {
        render: render,
		getEditorParams: getEditorParams,
		getStyleList: getStyleList,
    };
});
