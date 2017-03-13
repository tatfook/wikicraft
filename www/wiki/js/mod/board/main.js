define(function () {
    function registerController(wikiBlock) {
        app.registerController("boardController", function ($scope, $uibModal, $timeout) {
            
            require(['fabric'], function (fabric) {
                var cvs_show = $scope.scopeElements.cvs_show;

                var init_show = function (width, height, data) {
                    cvs_show.dataset.width = width;
                    cvs_show.dataset.height = height;
                    cvs_show.dataset.data = JSON.stringify(data);
                    var body_show = new fabric.StaticCanvas(cvs_show, { width: width, height: height });
                    body_show.clear();
                    body_show.loadFromJSON(data, function () {
                        body_show.renderAll();
                    }, function (o, obj) {
                        //console.log(o, obj);
                    });
                };
                
                var show_w = parseInt(cvs_show.dataset.width), show_h = parseInt(cvs_show.dataset.height);
                if (show_w && show_h) {
                    var data_show = cvs_show.dataset.data;
                    if (data_show) {
                        data_show = JSON.parse(data_show);
                        init_show(show_w, show_h, data_show);
                    }
                }

                // 形状与IText组成一个Group，双击形状后需可编辑IText
                // 调整形状大小（即缩放）时，IText不应随之缩放
                var bindGroupEvent = function (g, body) {
                    var shape = g._objects[0], text = g._objects[1];//形状是Group中的第一个对象，IText是Group中的第二个对象
                    g.on('mousedown', function () {
                        var now = Date.now();
                        if (this._clickCnt && now - this._lstClick < 500) {
                            this._clickCnt++;
                        } else {
                            this._clickCnt = 1;
                        }
                        this._lstClick = now;
                        if (this._clickCnt >= 2) {// double click
                            this._restoreObjectsState();
                            body.remove(this);
                            body.add(shape);
                            body.add(text);
                            body.setActiveObject(text);//选中
                            text.enterEditing();// 可编辑
                        }
                    });
                    g.on('scaling', function () {
                        this._scaling_ = true;
                    });
                    g.on('mouseup', function () {//缩放组后，组内的文本（IText）也会绽放，不希望有此效果，因此重新创建组
                        if (this._scaling_) {
                            this._restoreObjectsState();
                            text.scaleX = text.scaleY = 1;
                            body.remove(this);
                            body.add(initGroup(shape, text, body));
                        }
                        this._scaling_ = false;
                    });
                    if (!text._boundExitedEvent) {
                        text._boundExitedEvent = true;
                        text.on('editing:exited', function () {
                            body.remove(text);
                            body.remove(shape);
                            body.add(initGroup(shape, text, body));
                        });
                    }
                };

                var initGroup = function (shape, text, body) {
                    var g = new fabric.Group([shape, text], {});
                    bindGroupEvent(g, body);
                    return g;
                };

                $scope.onclick = function () {
                    $uibModal.open({
                        template: `
                            <div class="modal-header">
                                <h3 class="modal-title">绘图</h3>
                            </div>
                            <div class ="modal-body" style="display:flex;display:-webkit-flex">
                                <div style="width:200px;min-width:200px;background-color:#444;">
                                    <div style="display:flex;display:-webkit-flex;flex-wrap:wrap;-webkit-flex-wrap:wrap;-moz-flex-wrap:wrap;-ms-flex-wrap:-o-wrap">
                                        <div ng-repeat="item in items" ng-click="itemClick()" style="flex-basis:33.3%;-webkit-flex-basis:33.3%;-moz-flex-basis:33.3%;-ms-flex-basis:33.3%;-o-flex-basis:33.3%;text-align:center">
                                            <button style="width:60px;height:60px">{{item.name}}</button>
                                        </div>
                                    </div>
                                </div>
                                <div style="flex-basis:100%;-webkit-flex-basis:100%;-moz-flex-basis:100%;-ms-flex-basis:100%;-o-flex-basis:100%;background-color:#f8f8f8">
                                    <canvas scope-element="cvs"></canvas>
                                </div>
                            </div>
                            <div class ="modal-footer">
                                <button class ="btn btn-warning" type="button" data-dismiss="modal" ng-click="cancel()">取消</button>
                                <button class="btn btn-primary" type="button" ng-click="save()">保存</button>
                            </div>
                        `,
                        size: 'xxl',
                        backdrop: 'static',
                        keyboard: false,
                        controller: function ($scope, $uibModalInstance, $timeout) {
                            $scope.cancel = function () {
                                $uibModalInstance.dismiss('cancel');
                            };

                            $scope.items = [
                                { name: '方形', className:'Rect', ico: '', options: { fill: '#5b9bd5', strokeWidth: 1, stroke: '#41719c', width: 100, height: 40, offset: {x:-50, y:-20} } },
                                { name: '三角形', className: 'Triangle', ico: '', options: { fill: '#5b9bd5', strokeWidth: 1, stroke: '#41719c', width: 60, height: 52, offset: { x: -30, y: -26 } } },
                                { name: '圆形', className: 'Circle', ico: '', options: { fill: '#5b9bd5', strokeWidth: 1, stroke: '#41719c', radius: 40, offset: {x:-40,y:-40} } },
                                { name: '椭圆形', className: 'Ellipse', ico: '', options: { fill: '#5b9bd5', strokeWidth: 1, stroke: '#41719c', rx: 50, ry: 30, offset: {x:-50, y:-30}} },
                                { name: '直线', className: 'Line', ico: '', options: [[0, 0, 120, 0], { strokeWidth: 2, stroke: 'blue', x1: 100, y1: 100, x2: 300, y2: 100, offset: { x: -60, y: 0 } }] },
                                { name: '文本', className: 'IText', ico: '', options: ['', { fontFamily: 'verdana', fontSize:28, fill: 'red', originX: 'left', centerTransform: true, offset: {x: 0, y: -14 } }] }
                            ];

                            var selected_item = null;

                            $scope.itemClick = function () {
                                selected_item = this.item;
                            };

                            var body = null;

                            $timeout(function () {
                                var cvs = $scope.scopeElements.cvs, parentEle = cvs.parentElement;

                                var body_w = parseInt(cvs_show.dataset.width) || parentEle.offsetWidth,
                                    body_h = parseInt(cvs_show.dataset.height) || parentEle.offsetHeight;

                                body = new fabric.Canvas(cvs, { width: body_w, height: body_h });

                                if (cvs_show.dataset.data) {
                                    body.loadFromJSON(JSON.parse(cvs_show.dataset.data), function () {
                                        body.renderAll();
                                        body.getObjects().forEach(function (T) {
                                            if (T.type == 'group') {
                                                bindGroupEvent(T, body);
                                            }
                                        });
                                    }, function (obj, o) {
                                        //console.log(obj, o);
                                    });
                                }

                                var genGroup = function (shape) {
                                    var text = new fabric.IText('', {
                                        fontFamily: 'verdana',
                                        fontSize: 16,
                                        fill: 'red',
                                        originX: 'center',
                                        originY:'center',
                                        centerTransform: true,
                                        left: shape.left + shape.width / 2,
                                        top: shape.top + (shape.type == 'line' ? -12 : shape.height / 2)
                                    });
                                    
                                    return initGroup(shape, text, body);
                                };

                                body.on('mouse:down', function (options) {
                                    if (selected_item) {
                                        var obj = selected_item.options;
                                        var opt = obj;
                                        if (obj instanceof Array) {
                                            opt = obj[obj.length - 1];
                                        }
                                        opt.left = options.e.offsetX + opt.offset.x;
                                        opt.top = options.e.offsetY + opt.offset.y;
                                        var shape = null, c = fabric[selected_item.className];
                                        if (obj != opt && obj.length > 1) {
                                            if (obj.length == 2) {
                                                shape = new c(obj[0], opt);
                                            } else if (obj.length == 3) {
                                                shape = new c(obj[0], obj[1], opt);
                                            }
                                        } else {
                                            shape = new c(opt);
                                        }

                                        if (shape) {
                                            if (selected_item.className != 'IText') {
                                                shape = genGroup(shape);
                                            }
                                            body.add(shape);
                                            body.setActiveObject(shape);
                                            if (selected_item.className == 'IText') {
                                                shape.enterEditing();
                                            }   
                                        }
                                        selected_item = null;
                                    }
                                });
                            });

                            $scope.save = function () {
                                body.deactivateAll().renderAll();
                                init_show(body.width, body.height, body.toJSON());
                                $uibModalInstance.close("link");
                            };

                        }
                    }).result.then(function (provider) {
                    
                    }, function (text, error) {
                    
                    });

                };
            });
            
        });
    };

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return `
                <div ng-controller="boardController" ng-click="onclick()" style="min-height:100px">
                    <canvas scope-element="cvs_show"></canvas>
                </div>
                `;
        }
    };
});