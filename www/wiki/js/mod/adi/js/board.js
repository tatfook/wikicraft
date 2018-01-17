define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/board.html',
    'pako',
    'helper/mdconf',
    'helper/dataSource',
    '/wiki/js/mod/adi/assets/board.min.js?bust=3',
], function (app, util, htmlContent, pako, mdconf, dataSource) {
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
            var compress    = wikiBlock.modParams.modal_board.compress;

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

                graphContainer.querySelector("svg").style.backgroundImage = null;

                if(typeof(callback) == "function"){
                    callback(graphContainer.innerHTML);
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

    function registerController(wikiBlock) {
        app.registerController("boardController", ['$scope', '$uibModal', '$sce', 'Account', '$http', function ($scope, $uibModal, $sce, Account, $http) {
            $scope.editorMode = wikiBlock.editorMode;

            wikiBlock.init({
                scope  : $scope,
				styles : [],
				params_template : {
                    modal_board:{
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
            });

            if (wikiBlock.editorMode) {
                console.log($scope.params);
                if ($scope.params.modal_board.svg.length >= 4 && $scope.params.modal_board.compress.length >= 4) {
                    $scope.$watch("params", function(){
                        util.get($scope.params.modal_board.svg, {}, function(data){
                            console.log(data);

                            // $scope.preview = $sce.trustAsHtml("");
                            // $scope.$apply();
                        })
                    })
                } else {
                    $scope.preview = $sce.trustAsHtml("<div class=\"mx-client-start\">点击此处开始编辑</div>");
                    $scope.$apply();
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

            $scope.error   = function(){};

            $scope.success = function(boardEditor){
                var compressData = boardEditor.getCurrentCompressData();
                var mxData       = boardEditor.editor.getGraphXml();

                convertMxToSvg(boardEditor, mxData, function(svg){
                    if(svg){
                        var defaultSiteDataSource = Account.getUser().defaultSiteDataSource;

                        var currentDataSource = dataSource.getDataSource(defaultSiteDataSource.username, defaultSiteDataSource.projectName);
                        
                        new Promise(function(resolve, reject){
                            var svgPath = "/board/" + Date.now() + ".svg";

                            currentDataSource.writeFile({
                                path           : svgPath,
                                commit_message : "upload svg",
                                content        : svg,
                                isShowLoading  : true,
                            }, function(data){
                                $scope.params.modal_board.svg = currentDataSource.rawBaseUrl + "/" + currentDataSource.username +
                                             "/" + currentDataSource.projectName + "/raw/master" + svgPath;

                                resolve(data);
                            }, function(data){});
                        }).then(function(data){
                            console.log(data)

                            var compressPath = "/board/" + Date.now() + ".diagram";

                            return new Promise(function(resolve, reject){
                                currentDataSource.writeFile({
                                    path           : compressPath,
                                    commit_message : "upload compress",
                                    content        : compressData,
                                    isShowLoading  : true,
                                }, function(data){
                                    $scope.params.modal_board.compress = currentDataSource.rawBaseUrl + "/" + currentDataSource.username +
                                                 "/" + currentDataSource.projectName + "/raw/master" + compressPath;
                                    
                                    resolve(data);
                                    $scope.applyAttrChange();
                                }, function(data){});
                            })
                        }).then(function(data){
                            console.log(data);
                        });
                    }
                });
            }
        }])

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
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        },
    };
});