define(function () {
    function registerController(wikiBlock) {
        app.registerController("boardController", ['$scope', '$uibModal', '$timeout',function ($scope, $uibModal, $timeout) {

            var __id = 0;
            var genId = function () {
                return Date.now() + (++__id);
            };
            
            require(['fabric'], function (fabric) {
                var cvs_show = $scope.scopeElements.cvs_show;

                var _add = fabric.Canvas.prototype.add;
                fabric.Canvas.prototype.add = function () {
                    _add.apply(this, arguments);
                    if (!this.shapes) {
                        this.shapes = {};
                    }
                    var shape = arguments[0];
                    this.shapes[shape.id] = shape;
                };

                var _init = fabric.Object.prototype.initialize;
                fabric.Object.prototype.initialize = function () {
                    if (!this.id) {
                        this.id = genId();
                    }
                    _init.apply(this, arguments);
                };
                
                var _toObject = fabric.Object.prototype.toObject;
                fabric.Object.prototype.toObject = function () {
                    //return fabric.util.object.extend(fabric.Object.prototype.toObject.call(this), {
                    //    id: this.id,
                    //    link: this.link ? this.link.id : undefined,
                    //    point0: this.point0 ? this.point0.id : undefined,
                    //    point1: this.point1 ? this.point1.id : undefined
                    //});
                    var json = _toObject.apply(this, arguments);
                    json.id = this.id;
                    if (this.link) {
                        json.link = this.link;
                    }
                    if (this.port0) {
                        json.port0 = this.port0;
                    }
                    if (this.port1) {
                        json.port1 = this.port1;
                    }
                    if (this.link_line) {
                        json.link_line = this.link_line;
                    }
                    if (this.link_ports) {
                        json.link_ports = this.link_ports;
                    }
                    if (this.bindat) {
                        json.bindat = this.bindat;
                    }
                    return json;
                };

                // 连接线
                fabric.Link = fabric.util.createClass(fabric.Line, {
                    type: 'link',
                    initialize: function (ary, options) {
                        options || (options = {});
                        options.stroke = options.stroke || '#1b1b1b';
                        options.strokeWidth = options.strokeWiddth || 3;
                        options.lockScalingX = true;
                        options.lockScalingY = true;
                        options.lockRotation = true;
                        options.hasBorders = false;
                        options.hasControls = false;
                        options.perPixelTargetFind = true;
                        //options.selectable = false;
                        options.fill = options.fill || options.stroke;
                        //this._lineStrokeWidth = options.strokeWidth;
                        //options.strokeWidth = this._lineStrokeWidth + 6;
                        //this._stroke = options.stroke;
                        //options.stroke = 'transparent';
                        this.callSuper('initialize', ary, options);
                        //this.set('point1', new fabric.Circle({
                        //    fill: '#5b9bd5',
                        //    strokeWidth: 1,
                        //    stroke: '#41719c',
                        //    radius: 10
                        //}));
                        //this.set('point2', new fabric.Circle({
                        //    fill: '#5b9bd5',
                        //    strokeWidth: 1,
                        //    stroke: '#41719c',
                        //    radius: 10,
                        //    left: 100,
                        //    top: 50
                        //}));

                        this.on('moving', function (evt) {
                            if (this.port0) {
                                var p0 = this.canvas.shapes[this.port0];
                                if (p0) {
                                    var oldCenterX = (this.x1 + this.x2) / 2,
                                        oldCenterY = (this.y1 + this.y2) / 2,
                                        center = this.getCenterPoint(),
                                        deltaX = center.x - oldCenterX,
                                        deltaY = center.y - oldCenterY;
                                    p0.set({
                                        'left': this.x1 + deltaX - p0.radius,
                                        'top': this.y1 + deltaY - p0.radius
                                    }).setCoords();
                                    var p1 = this.canvas.shapes[this.port1];
                                    if (p1) {
                                        p1.set({
                                            'left': this.x2 + deltaX - p1.radius,
                                            'top': this.y2 + deltaY - p1.radius
                                        }).setCoords();
                                    }
                                }
                                this.set({
                                    'x1': this.x1 + deltaX,
                                    'y1': this.y1 + deltaY
                                });
                                this.set({
                                    'x2': this.x2 + deltaX,
                                    'y2': this.y2 + deltaY
                                });

                                //this.set({
                                //    'left': (this.x1 + this.x2) / 2,
                                //    'top': (this.y1 + this.y2) / 2
                                //});

                                if (!window.__selected_linkline) {
                                    window.__selected_linkline = this;
                                    var mouseuphandler = function(){
                                        var linkline = window.__selected_linkline;
                                        if (linkline) {
                                            var p0 = linkline.canvas.shapes[linkline.port0],
                                                p1 = linkline.canvas.shapes[linkline.port1];
                                            if (p0 && p1) {
                                                var p0_center = p0.getCenterPoint(),
                                                    p1_center = p1.getCenterPoint(),
                                                    p0_shape = null,
                                                    p1_shape = null;
                                                for (var k in linkline.canvas.shapes) {
                                                    var shape = linkline.canvas.shapes[k];
                                                    if (shape != linkline && shape != p0 && shape != p1) {
                                                        if (!p0_shape && shape.containsPoint(p0_center)) {
                                                            p0_shape = shape;
                                                        } else if (p1_shape && shape.containsPoint(p1_center)) {
                                                            p1_shape = shape;
                                                        }
                                                        if (p0_shape && p1_shape) {
                                                            break;
                                                        }
                                                    }
                                                }
                                                if (p0_shape) {
                                                    if (p0_shape.id != p0.bindat) {
                                                        p0.bindTo(p0_shape);
                                                    }
                                                    p0.adjustBindPos();
                                                    p0.canvas.renderAll();
                                                } else {
                                                    p0.unbind();
                                                }
                                                if (p1_shape) {
                                                    if (p1_shape.id != p1.bindat) {
                                                        p1.bindTo(p1_shape);
                                                    }
                                                    p1.adjustBindPos();
                                                    p1.canvas.renderAll();
                                                } else {
                                                    p1.unbind();
                                                }
                                            }
                                            delete window.__selected_linkline;
                                        }
                                        document.removeEventListener('mouseup', mouseuphandler);
                                    };
                                    document.addEventListener('mouseup', mouseuphandler);
                                }
                            }
                        });

                        this.on('mousedown', function () {
                            this.bringToFront();
                            var p0 = this.canvas.shapes[this.port0];
                            if (p0) {
                                p0.bringToFront();
                            }
                            var p1 = this.canvas.shapes[this.port1];
                            if (p1) {
                                p1.bringToFront();
                            }
                            //this.canvas.renderAll();
                        });
                    },
                    toObject: function () {
                        return fabric.util.object.extend(this.callSuper('toObject'), {
                            //customAttribute: this.get('customAttribute')
                        });
                    },
                    _render: function (ctx) {
                        this.callSuper('_render', ctx);
                    }
                });
                fabric.Link.fromObject = function (object, callback, forceAsync) {
                    //return fabric.Object._fromObject('Link', object, callback, forceAsync, 'line');
                    //return fabric.Line.fromObject.apply(this, arguments);
                    function _callback(instance) {
                        delete instance.points;
                        callback && callback(instance);
                    };
                    var options = fabric.util.object.clone(object, true);
                    options.points = [object.x1, object.y1, object.x2, object.y2];
                    var link = fabric.Object._fromObject('Link', options, _callback, forceAsync, 'points');
                    if (link) {
                        delete link.points;
                    }
                    return link;
                };
                // 连接线端点
                fabric.LinkPort = fabric.util.createClass(fabric.Circle, {
                    type: 'link-port',
                    initialize: function (options, link, portIndex) {
                        options || (options = {});
                        options.lockScalingX = true;
                        options.lockScalingY = true;
                        options.lockRotation = true;
                        options.hasBorders = false;
                        options.hasControls = false;
                        //options.selectable = false;
                        options.radius = 4;
                        options.strokeWidth = 2;
                        options.stroke = '#1b1b1b';
                        options.fill = '#1b1b1b';
                        this.callSuper('initialize', options);
                        if (link) {
                            this.set({link_line: link.id});
                            var left = 0, top = 0;
                            if (portIndex) {
                                left = link.x2 - options.radius;
                                top = link.y2 - options.radius;
                                link.port1 = this.id;
                            } else {
                                left = link.x1 - options.radius;
                                top = link.y1 - options.radius;
                                link.port0 = this.id;
                            }
                            this.set({
                                left: left,
                                top: top
                            });
                        }
                        this.on('moving', function (evt) {
                            var link_line = this.canvas.shapes[this.link_line];
                            if (link_line) {
                                //var x = evt.e.offsetX, y = evt.e.offsetY;
                                //if (link_line.port0 == this.id) {
                                //    link_line.set({
                                //        x1: x,
                                //        y1: y
                                //    });
                                //} else if (link_line.port1 == this.id) {
                                //    link_line.set({
                                //        x2: x,
                                //        y2: y
                                //    });
                                //}
                                //link_line.setCoords();

                                this.adjustLinkLine();

                                if (window.__selected_linkport != this) {
                                    window.__selected_linkport = this;
                                    var mouseup_handler = function () {
                                        var port = window.__selected_linkport;
                                        if (port) {
                                            for (var k in port.canvas.shapes) {
                                                var shape = port.canvas.shapes[k];
                                                if (shape.type == 'group') {
                                                    if (shape.containsPoint(port.getCenterPoint())) {
                                                        port.bindTo(shape);
                                                        port.canvas.renderAll();
                                                        break;
                                                    }
                                                }
                                            }
                                            delete window.__selected_linkport;
                                        }
                                        document.removeEventListener('mouseup', mouseup_handler);
                                    };
                                    document.addEventListener('mouseup', mouseup_handler);
                                }
                            }
                        });

                        this.adjustLinkLine = function () {
                            var link_line = this.canvas.shapes[this.link_line];
                            if (link_line) {
                                var center = this.getCenterPoint(),
                                    x = center.x, y = center.y;
                                if (link_line.port0 == this.id) {
                                    link_line.set({
                                        x1: x - this.strokeWidth / 2,
                                        y1: y - this.strokeWidth / 2
                                    });
                                    var port1 = this.canvas.shapes[link_line.port1];
                                    if (port1) {
                                        var center1 = port1.getCenterPoint();
                                        link_line.set({
                                            x2: center1.x - this.strokeWidth / 2,
                                            y2: center1.y - this.strokeWidth / 2
                                        });
                                    }
                                } else if (link_line.port1 == this.id) {
                                    link_line.set({
                                        x2: x - this.strokeWidth / 2,
                                        y2: y - this.strokeWidth / 2
                                    });
                                    var port0 = this.canvas.shapes[link_line.port0];
                                    if (port0) {
                                        var center0 = port0.getCenterPoint();
                                        link_line.set({
                                            x1: center0.x - this.strokeWidth / 2,
                                            y1: center0.y - this.strokeWidth / 2
                                        });
                                    }
                                }
                                link_line.setCoords();
                            }
                        };

                        this.setPos = function (x, y) {
                            this.set({
                                left: x,
                                top: y
                            }).setCoords();
                            this.adjustLinkLine();
                            return this;
                        };

                        this.bindTo = function (obj) {
                            this.unbind();
                            if (!obj.link_ports) {
                                obj.link_ports = {};
                            }
                            obj.link_ports[this.id] = 1;
                            this.bindat = obj.id;
                            this.adjustBindPos();
                            var _this = this;
                            var unbind_handler = function () {
                                if (window.__selected_linkport == _this) {
                                    if (!obj.containsPoint(_this.getCenterPoint())) {
                                        _this.unbind();
                                        document.removeEventListener('mouseup', unbind_handler);
                                    }
                                }
                            };
                            document.addEventListener('mouseup', unbind_handler);
                            return this;
                        };

                        this.adjustBindPos = function () {
                            var link = this.canvas.shapes[this.link_line];
                            if (link) {
                                var otherPort = this.canvas.shapes[link.port0 == this.id ? link.port1 : link.port0];
                                if (otherPort) {
                                    if (this.bindat) {
                                        var shape = this.canvas.shapes[this.bindat];
                                        if (shape) {
                                            var center = shape.getCenterPoint(),
                                                otherShape = null,
                                                x0 = parseInt(center.x), y0 = parseInt(center.y),
                                                x1 = parseInt(otherPort.left), y1 = parseInt(otherPort.top),
                                                coords = shape.getCoords(),// 四个控制角的坐标
                                                p = null, len = null;// p:相交点，len:相交点与另一个端点的距离。最终要取得的是离另一个端点较近的相交点
                                            if (otherPort.bindat) {
                                                otherShape = this.canvas.shapes[otherPort.bindat];
                                                if (otherShape) {
                                                    var centerOther = otherShape.getCenterPoint();
                                                    x1 = parseInt(centerOther.x);
                                                    y1 = parseInt(centerOther.y);
                                                    var coordsOther = otherShape.getCoords();
                                                    for (var i = 0; i < coordsOther.length; i++) {
                                                        var p2 = coordsOther[i], p3 = coordsOther[i + 1];
                                                        if (!p3) {
                                                            p3 = coordsOther[0];
                                                        }
                                                        var x2 = parseInt(p2.x), y2 = parseInt(p2.y),
                                                            x3 = parseInt(p3.x), y3 = parseInt(p3.y);
                                                        // 求两条线的相交点
                                                        // 如果分母为0 则平行或共线, 不相交  
                                                        var denominator = (y1 - y0) * (x3 - x2) - (x0 - x1) * (y2 - y3);
                                                        if (denominator != 0) {
                                                            // 线段所在直线的交点坐标 (x , y)      
                                                            var x = ((x1 - x0) * (x3 - x2) * (y2 - y0)
                                                                        + (y1 - y0) * (x3 - x2) * x0
                                                                        - (y3 - y2) * (x1 - x0) * x2) / denominator,
                                                                y = -((y1 - y0) * (y3 - y2) * (x2 - x0)
                                                                        + (x1 - x0) * (y3 - y2) * y0
                                                                        - (x3 - x2) * (y1 - y0) * y2) / denominator;
                                                            x = parseInt(x);
                                                            y = parseInt(y);
                                                            var minX = Math.min(x2, x3),
                                                                maxX = x2 == minX ? x3 : x2,
                                                                minY = Math.min(y2, y3),
                                                                maxY = y2 == minY ? y3 : y2;
                                                            if (x >= minX && x <= maxX && y >= minY && y <= maxY) {// 点在形状的边框线范围内才算是真正的相交
                                                                var l = Math.sqrt(Math.pow(x - x0, 2) + Math.pow(y - y0, 2)); // 相交点与连接线另一个端点的距离
                                                                if (len == null || l < len) {
                                                                    len = l;
                                                                    p = { x: x - otherPort.radius, y: y - otherPort.radius };
                                                                }
                                                            }
                                                        }
                                                    }
                                                    if (p) {
                                                        otherPort.setPos(p.x, p.y);
                                                    }
                                                }
                                            }
                                            p = len = null;//重置
                                            if (otherShape) {
                                                var otherShapeCenter = otherShape.getCenterPoint();
                                                x1 = otherShapeCenter.x;
                                                y1 = otherShapeCenter.y;
                                            } else {
                                                var otherPortCenter = otherPort.getCenterPoint();
                                                x1 = otherPortCenter.x;
                                                y1 = otherPortCenter.y;
                                            }
                                            for (var i = 0; i < coords.length; i++) {
                                                var p2 = coords[i], p3 = coords[i + 1];
                                                if (!p3) {
                                                    p3 = coords[0];
                                                }
                                                var x2 = parseInt(p2.x), y2 = parseInt(p2.y),
                                                    x3 = parseInt(p3.x), y3 = parseInt(p3.y);
                                                // 求两条线的相交点
                                                // 如果分母为0 则平行或共线, 不相交  
                                                var denominator = (y1 - y0) * (x3 - x2) - (x0 - x1) * (y2 - y3);
                                                if (denominator != 0) {
                                                    // 线段所在直线的交点坐标 (x , y)      
                                                    var x = ((x1 - x0) * (x3 - x2) * (y2 - y0)
                                                                + (y1 - y0) * (x3 - x2) * x0
                                                                - (y3 - y2) * (x1 - x0) * x2) / denominator,
                                                        y = -((y1 - y0) * (y3 - y2) * (x2 - x0)
                                                                + (x1 - x0) * (y3 - y2) * y0
                                                                - (x3 - x2) * (y1 - y0) * y2) / denominator;
                                                    x = parseInt(x);
                                                    y = parseInt(y);
                                                    var minX = Math.min(x2, x3),
                                                        maxX = Math.max(x2, x3),
                                                        minY = Math.min(y2, y3),
                                                        maxY = Math.max(y2, y3);
                                                    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {// 点在形状的边框线范围内才算是真正的相交
                                                        var l = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2)); // 相交点与连接线另一个端点的距离
                                                        if (len == null || l < len) {
                                                            len = l;
                                                            p = { x: x - this.radius, y: y - this.radius };
                                                        }
                                                    }
                                                }
                                            }
                                            if (p) {
                                                this.setPos(p.x, p.y);
                                            }
                                        }
                                    }
                                }
                            }
                            return this;
                        };

                        this.unbind = function () {
                            if (this.bindat) {
                                var shape = this.canvas.shapes[this.bindat];
                                if (shape && shape.link_ports) {
                                    delete shape.link_ports[this.id];
                                }
                                delete this.bindat;
                            }
                        };


                    },
                    toObject: function () {
                        return fabric.util.object.extend(this.callSuper('toObject'), {
                            //customAttribute: this.get('customAttribute')
                        });
                    },
                    _render: function (ctx) {
                        this.callSuper('_render', ctx);
                    }
                });

                fabric.LinkPort.fromObject = function (object, callback, forceAsync) {
                    return fabric.Object._fromObject('LinkPort', object, callback, forceAsync);
                    //return fabric.Circle.fromObject.apply(this, arguments);
                };

                var init_show = function (width, height, data) {
                    //cvs_show.dataset.width = width;
                    //cvs_show.dataset.height = height;
                    //cvs_show.dataset.data = JSON.stringify(data);
                    var body_show = new fabric.StaticCanvas(cvs_show, { width: width, height: height });
                    //var body_show = new fabric.StaticCanvas(cvs_show);
                    cvs_show.style.width = cvs_show.style.height = 'auto';
                    body_show.clear();
                    data = JSON.parse(JSON.stringify(data)); // loadFromJSON() 会改变数据，为了不影响后面的操作，此处重新生成一个JSON用于loadFromJSON()
                    body_show.loadFromJSON(data, function () {
                        body_show.renderAll();
                    }, function (o, obj) {
                        //console.log(o, obj);
                    });
                };
                
                //var show_w = parseInt(cvs_show.dataset.width), show_h = parseInt(cvs_show.dataset.height);
                if (wikiBlock.modParams) {
                    if (typeof (wikiBlock.modParams) == 'string') {
                        wikiBlock.modParams = JSON.parse(wikiBlock.modParams);
                    }
                    var show_w = wikiBlock.modParams.w, show_h = wikiBlock.modParams.h;
                    if (show_w && show_h) {
                        //var data_show = cvs_show.dataset.data;
                        var data_show = wikiBlock.modParams.data;
                        if (data_show) {
                            //data_show = JSON.parse(data_show);
                            init_show(show_w, show_h, data_show);
                        }
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
                            var g2 = initGroup(shape, text, body);
                            ['id', 'link', 'port0', 'port1', 'link_line', 'link_ports', 'bindat'].forEach(function (T) {
                                if (g[T]) {
                                    g2[T] = g[T];
                                }
                            });
                            body.add(g2);
                        }
                        this._scaling_ = false;
                    });
                    g.on('moving', function (options) {
                        if (this.link_ports) {// 如果与一个连接线绑定在一起，则需同时移动连接线的端点
                            for (var link_port in this.link_ports) {
                                var port = this.canvas.shapes[link_port];
                                if (port) {
                                    this.setCoords();
                                    port.adjustBindPos();
                                    
                                    //var link = this.canvas.shapes[port.link_line];
                                    //if (link) {
                                    //    var otherPort = this.canvas.shapes[link.port0 == link_port ? link.port1 : link.port0];
                                    //    if (otherPort) {
                                    //        this.setCoords();
                                    //        var center = this.getCenterPoint(),
                                    //            x0 = center.x, y0 = center.y,
                                    //            x1 = otherPort.left, y1 = otherPort.top,
                                    //            coords = this.getCoords(),// 四个控制角的坐标
                                    //            p = null, len = null;// p:相交点，len:相交点与另一个端点的距离。最终要取得的是离另一个端点较近的相交点
                                    //        for (var i = 0; i < coords.length; i++) {
                                    //            // 已知两条直线上的四个点，求两条直线相交点的公式
                                    //            // y = ( (y0-y1)*(y3-y2)*x0 + (y3-y2)*(x1-x0)*y0 + (y1-y0)*(y3-y2)*x2 + (x2-x3)*(y1-y0)*y2 ) / ( (x1-x0)*(y3-y2) + (y0-y1)*(x3-x2) );
                                    //            // x = x2 + (x3 - x2) * (y - y2) / (y3 - y2);
                                    //            var p2 = coords[i], p3 = coords[i + 1];
                                    //            if (!p3) {
                                    //                p3 = coords[0];
                                    //            }
                                    //            var x2 = p2.x, y2 = p2.y,
                                    //                x3 = p3.x, y3 = p3.y;
                                    //            //var y = ((y0 - y1) * (y3 - y2) * x0 + (y3 - y2) * (x1 - x0) * y0 + (y1 - y0) * (y3 - y2) * x2 + (x2 - x3) * (y1 - y0) * y2) / ((x1 - x0) * (y3 - y2) + (y0 - y1) * (x3 - x2));

                                    //            //if (!isNaN(y)) {
                                    //            //    var x = x2 + (x3 - x2) * (y - y2) / (y3 - y2);
                                    //            //    if (!isNaN(x)) {
                                    //            //        var minX = Math.min(x2, x3),
                                    //            //            maxX = x2 == minX ? x3 : x2,
                                    //            //            minY = Math.min(y2, y3),
                                    //            //            maxY = y2 == minY ? y3 : y2;
                                    //            //        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {// 点在形状的边框线范围内才算是真正的相交
                                    //            //            var l = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2)); // 相交点与连接线另一个端点的距离
                                    //            //            if (len == null || l < len) {
                                    //            //                len = l;
                                    //            //                p = { x: x, y: y };
                                    //            //            }
                                    //            //        }
                                    //            //    }
                                    //            //}

                                    //            /** 1 解线性方程组, 求线段交点. **/
                                    //            // 如果分母为0 则平行或共线, 不相交  
                                    //            var denominator = (y1 - y0) * (x3 - x2) - (x0 - x1) * (y2 - y3);
                                    //            if (denominator != 0) {
                                    //                // 线段所在直线的交点坐标 (x , y)      
                                    //                var x = ((x1 - x0) * (x3 - x2) * (y2 - y0)
                                    //                            + (y1 - y0) * (x3 - x2) * x0
                                    //                            - (y3 - y2) * (x1 - x0) * x2) / denominator,
                                    //                    y = -((y1 - y0) * (y3 - y2) * (x2 - x0)
                                    //                            + (x1 - x0) * (y3 - y2) * y0
                                    //                            - (x3 - x2) * (y1 - y0) * y2) / denominator;
                                    //                var minX = Math.min(x2, x3),
                                    //                    maxX = x2 == minX ? x3 : x2,
                                    //                    minY = Math.min(y2, y3),
                                    //                    maxY = y2 == minY ? y3 : y2;
                                    //                if (x >= minX && x <= maxX && y >= minY && y <= maxY) {// 点在形状的边框线范围内才算是真正的相交
                                    //                    var l = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2)); // 相交点与连接线另一个端点的距离
                                    //                    if (len == null || l < len) {
                                    //                        len = l;
                                    //                        p = { x: x, y: y };
                                    //                    }
                                    //                }
                                    //            }
                                    //        }
                                    //        if (p) {
                                    //            //console.log(p);
                                    //            port.setPos(p.x, p.y);
                                    //            this.setCoords();
                                    //        }
                                    //    }
                                    //}
                                }
                            }
                        }
                    });
                    if (!text._boundExitedEvent) {
                        text._boundExitedEvent = true;
                        text.on('editing:exited', function () {
                            body.remove(text);
                            body.remove(shape);
                            var g2 = initGroup(shape, text, body);
                            ['id', 'link', 'port0', 'port1', 'link_line', 'link_ports', 'bindat'].forEach(function (T) {
                                if (g[T]) {
                                    g2[T] = g[T];
                                }
                            });
                            body.add(g2);
                        });
                    }
                };

                var initGroup = function (shape, text, body) {
                    var g = new fabric.Group([shape, text], {});
                    bindGroupEvent(g, body);
                    return g;
                };

                if (!wikiBlock.editorMode) {
                    return true;
                }
                $scope.onclick = function () {
                    $uibModal.open({
                        template: `
                            <div class ="modal-header" style="display:flex;display:-webkit-flex;align-items:center;-webkit-align-items:center">
                                <h3 class ="modal-title" style="min-width:100px;flex:1;">画板</h3>
                                <div>
                                    <div ng-repeat="item in editItems" class ="pull-left" style="margin-right:25px;">
                                        <div ng-switch="item">
                                            <div ng-switch-when="fill">
                                                填充色：<color-selector onchange="fillColorChanged" value="selectedShape.type == 'group' ? selectedShape._objects[0].fill : selectedShape.fill"></color-selector>
                                            </div>
                                            <div ng-switch-when="stroke">
                                                边框色：<color-selector onchange="strokeColorChanged" value="selectedShape.type == 'group' ? selectedShape._objects[0].stroke : selectedShape.stroke"></color-selector>
                                            </div>
                                            <div ng-switch-when="color">
                                                字体色：<color-selector onchange="fontColorChanged" value="selectedShape.type == 'group' ? selectedShape._objects[1].fill : selectedShape.fill"></color-selector>
                                            </div>
                                            <div ng-switch-when="fontSize">
                                                字体大小：<number-selector onchange="fontSizeChanged" min="'13'" max="'29'" step="'2'" unit="'px'" value="selectedShape.type == 'group' ? selectedShape._objects[1].fontSize : selectedShape.fontSize"></number-selector>
                                            </div>
                                        </div>
                                    </div>
                                    <div ng-show="selectedShape" class ="pull-left">
                                        <span class ="glyphicon glyphicon-trash" ng-click="removeShape()" style="font-size:20px;line-height:24px;"></span>
                                    </div>
                                    <div class="pull-left" style="margin-left:10px;">
                                        <button type="button" class="close" style="margin-top:0;" data-dismiss="modal" ng-click="cancel()"><span aria-hidden="true">&times;</span></button>
                                    </div>
                                </div>
                            </div>
                            <div class ="modal-body" style="display:flex;display:-webkit-flex;padding:0;">
                                <div style="width:200px;min-width:200px;background-color:#FFF;margin-top:20px;padding:0 3px 0 5px;">
                                    <div style="display:flex;display:-webkit-flex;flex-wrap:wrap;-webkit-flex-wrap:wrap;-moz-flex-wrap:wrap;-ms-flex-wrap:-o-wrap">
                                        <div ng-repeat="item in items" ng-click="itemClick()" style="flex-basis:50%;-webkit-flex-basis:50%;-moz-flex-basis:50%;-ms-flex-basis:50%;-o-flex-basis:50%;text-align:center;margin-bottom:20px;">
                                            <button ng-style="item.style" type="button" title="{{item.name}}" class ="btn btn-default btn-lg" style="width:90px;height:50px;padding:0px;border-radius:0px;background-color:#DCDCDC;">
                                                <span style="display:inline-block;width:42px;height:30px;background-image:url('/wiki/js/mod/board/shapes.png');" ng-style="{backgroundPosition:-$index*42+'px 0px'}"></span>
                                            </button>
                                            <br/>{{item.name}}
                                        </div>
                                    </div>
                                </div>
                                <div style="flex-basis:100%;-webkit-flex-basis:100%;-moz-flex-basis:100%;-ms-flex-basis:100%;-o-flex-basis:100%;overflow:auto;">
                                    <canvas scope-element="cvs"></canvas>
                                </div>
                            </div>
                            <div class ="modal-footer">
                                <button class ="btn btn-default" type="button" data-dismiss="modal" ng-click="cancel()">取消</button>
                                <button class ="btn btn-primary" type="button" ng-click="save()">保存</button>
                            </div>
                        `,
                        size: 'xxl',
                        backdrop: 'static',
                        keyboard: false,
                        controller: ['$scope', '$uibModalInstance', '$timeout',function ($scope, $uibModalInstance, $timeout) {
                            $scope.cancel = function () {
                                $uibModalInstance.dismiss('cancel');
                            };

                            $scope.items = [
                                {
                                    name: '方形', className: 'Rect', ico: '',
                                    options: { fill: '#facd89', strokeWidth: 1, stroke: '#8f82bc', width: 100, height: 40, offset: { x: -50, y: -20 } },
                                    edit: ['fill', 'stroke', 'color', 'fontSize']
                                },
                                {
                                    name: '三角形', className: 'Triangle', ico: '',
                                    options: { fill: '#facd89', strokeWidth: 1, stroke: '#8f82bc', width: 60, height: 52, offset: { x: -30, y: -26 } },
                                    edit: ['fill', 'stroke', 'color', 'fontSize']
                                },
                                {
                                    name: '圆形', className: 'Circle', ico: '',
                                    options: { fill: '#facd89', strokeWidth: 1, stroke: '#8f82bc', radius: 40, offset: { x: -40, y: -40 } },
                                    edit: ['fill', 'stroke', 'color', 'fontSize']
                                },
                                {
                                    name: '椭圆形', className: 'Ellipse', ico: '',
                                    options: { fill: '#facd89', strokeWidth: 1, stroke: '#8f82bc', rx: 50, ry: 30, offset: { x: -50, y: -30 } },
                                    edit: ['fill', 'stroke', 'color', 'fontSize']
                                },
                                {
                                    name: '直线', className: 'Line', ico: '',
                                    options: [[0, 0, 120, 0], { strokeWidth: 2, stroke: '#8f82bc', lockScalingY: true, x1: 100, y1: 100, x2: 300, y2: 100, offset: { x: -60, y: 0 } }],
                                    edit: ['stroke', 'color', 'fontSize']
                                },
                                {
                                    name: '文本', className: 'IText', ico: '',
                                    options: ['', { fontFamily: 'verdana', fontSize: 29, fill: '#1b1b1b', originX: 'left', centerTransform: true, offset: { x: 0, y: -14 } }],
                                    edit: ['color', 'fontSize']
                                },
                                {
                                    name: '连接线', className: 'Link', ico: '',
                                    options: [200, {}],
                                    edit: ['stroke']
                                }
                            ];

                            var selected_item = null;

                            $scope.itemClick = function () {
                                selected_item = this.item;
                                this.item.style={
                                    "border":"3px solid #3977AD"
                                };
                            };

                            var body = null;

                            $timeout(function () {
                                var cvs = $scope.scopeElements.cvs, parentEle = cvs.parentElement;

                                var body_w = (wikiBlock.modParams && wikiBlock.modParams.w) || (parentEle.offsetWidth-1),
                                    body_h = (wikiBlock.modParams && wikiBlock.modParams.h) || (parentEle.offsetHeight-1);

                                body = new fabric.Canvas(cvs, { width: body_w, height: body_h, backgroundColor: '#f7f7f7' });
                                body.preserveObjectStacking = true;
                                body.renderAll();

                                body.on('object:selected', function (opt) {
                                    var target = opt.target,
                                        shape = target;
                                    if (target.type == 'group') {
                                        shape = target._objects[0];
                                    }
                                    var className = shape.type,
                                        classDefine = null;
                                    className = className.replace('\-', '');
                                    for (var i = 0; i < $scope.items.length; i++) {
                                        var item = $scope.items[i];
                                        if (item.className.toLowerCase() == className) {
                                            classDefine = item;
                                            break;
                                        }
                                    }

                                    if (classDefine) {
                                        $scope.editItems = classDefine.edit;
                                        $scope.selectedShape = target;
                                    } else {
                                        $scope.editItems = [];
                                        $scope.selectedShape = null;
                                    }
                                    $scope.$apply();
                                });

                                body.on('selection:cleared', function () {
                                    $scope.editItems = [];
                                    $scope.selectedShape = null;
                                    $timeout(function () {
                                        $scope.$apply();
                                    });
                                });

                                $scope.fillColorChanged = function (color) {
                                    var obj = body.getActiveObject();
                                    if (obj) {
                                        var shape = obj;
                                        if (shape.type == 'group') {
                                            shape = shape._objects[0];
                                        }
                                        shape.set({
                                            fill: color
                                        });
                                        body.renderAll();
                                    }
                                };

                                $scope.strokeColorChanged = function (color) {
                                    var obj = body.getActiveObject();
                                    if (obj) {
                                        var shape = obj;
                                        if (shape.type == 'group') {
                                            shape = shape._objects[0];
                                        }
                                        shape.set({
                                            stroke: color
                                        });
                                        if (shape.type == 'link') {
                                            var p0 = body.shapes[shape.port0],
                                                p1 = body.shapes[shape.port1];
                                            if (p0) {
                                                p0.set({
                                                    fill: color,
                                                    stroke: color
                                                });
                                            }
                                            if (p1) {
                                                p1.set({
                                                    fill: color,
                                                    stroke: color
                                                });
                                            }
                                        }
                                        body.renderAll();
                                    }
                                };

                                $scope.fontColorChanged = function (color) {
                                    var obj = body.getActiveObject();
                                    if (obj) {
                                        var shape = obj;
                                        if (shape.type == 'group') {
                                            shape = shape._objects[1];
                                        }
                                        shape.set({
                                            fill: color
                                        });
                                        body.renderAll();
                                    }
                                };

                                $scope.fontSizeChanged = function (val) {
                                    var obj = body.getActiveObject();
                                    if (obj) {
                                        var shape = obj;
                                        if (shape.type == 'group') {
                                            shape = shape._objects[1];
                                        }
                                        shape.set({
                                            fontSize: val
                                        });
                                        body.renderAll();
                                    }
                                };

                                $scope.removeShape = function () {
                                    var activeObj = body.getActiveObject(),
                                        activeGroup = body.getActiveGroup();
                                    $scope.editItems = [];
                                    $scope.selectedShape = null;
                                    $timeout(function () {
                                        if (activeObj) {
                                            body.remove(activeObj);
                                        } else {
                                            var objectsInGroup = activeGroup.getObjects();
                                            body.discardActiveGroup();
                                            objectsInGroup.forEach(function (object) {
                                                body.remove(object);
                                            });
                                        }
                                    });
                                };

                                //if (cvs_show.dataset.data) {
                                //    body.loadFromJSON(JSON.parse(cvs_show.dataset.data), function () {
                                //        body.renderAll();
                                //        body.getObjects().forEach(function (T) {
                                //            if (T.type == 'group') {
                                //                bindGroupEvent(T, body);
                                //            }
                                //        });
                                //    }, function (obj, o) {
                                //        //console.log(obj, o);
                                //    });
                                //}
                                if (wikiBlock.modParams && wikiBlock.modParams.data) {
                                    var data = JSON.parse(JSON.stringify(wikiBlock.modParams.data));
                                    body.loadFromJSON(data, function () {
                                        
                                        body.shapes = {};
                                        body.getObjects().forEach(function (T) {
                                            if (T.id) {
                                                body.shapes[T.id] = T;
                                            }
                                            if (T.type == 'group') {
                                                bindGroupEvent(T, body);
                                            }
                                        });
                                        body.renderAll();
                                    }, function (obj, o) {
                                        //console.log(obj, o);
                                    });
                                }

                                var genGroup = function (shape) {
                                    var text = new fabric.IText('', {
                                        fontFamily: 'verdana',
                                        fontSize: 17,
                                        fill: '#1b1b1b',
                                        originX: 'center',
                                        originY: 'center',
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
                                        if (opt.offset) {
                                            opt.left = options.e.offsetX + opt.offset.x;
                                            opt.top = options.e.offsetY + opt.offset.y;
                                        }
                                        var shape = null, c = fabric[selected_item.className];
                                        if (obj != opt && obj.length > 1) {
                                            var params0 = obj[0];
                                            if (typeof (params0) == 'number') {
                                                var w = obj[0],
                                                    x0 = options.e.offsetX - w / 2,
                                                    y0 = options.e.offsetY,
                                                    x1 = x0 + w,
                                                    y1 = y0;
                                                params0 = [x0, y0, x1, y1];
                                            }
                                            if (obj.length == 2) {
                                                shape = new c(params0, opt);
                                            } else if (obj.length == 3) {
                                                shape = new c(params0, obj[1], opt);
                                            }
                                        } else {
                                            shape = new c(opt);
                                        }

                                        if (shape) {
                                            if (selected_item.className != 'IText' && selected_item.className != 'Link') {
                                                shape = genGroup(shape);
                                            }
                                            body.add(shape);
                                            if (selected_item.className == 'Link') {
                                                var port0 = new fabric.LinkPort({}, shape, 0);
                                                body.add(port0);
                                                var port1 = new fabric.LinkPort({}, shape, 1);
                                                body.add(port1);
                                                port0.bringToFront();
                                                port1.bringToFront();
                                            }
                                            body.setActiveObject(shape);
                                            if (selected_item.className == 'IText') {
                                                shape.enterEditing();
                                            }
                                            body.renderAll();
                                        }

                                        selected_item.style={};
                                        selected_item = null;
                                    }
                                });
                            });

                            $scope.save = function () {
                                body.deactivateAll().renderAll();
                                //init_show(body.width, body.height, body.toJSON());
                                wikiBlock.applyModParams(JSON.stringify({ w: body.width, h: body.height, data: body.toJSON() }));
                                $uibModalInstance.close("link");
                                //console.log(fabric);
                            };

                        }],
                    }).result.then(function (provider) {
                    
                    }, function (text, error) {
                    
                    });

                };
            });
            
        }]);
    };

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return `
                <div ng-controller="boardController" ng-click="onclick()" style="min-height:100px;border: 1px solid #DCDCDC;text-align: center;">
                    <canvas scope-element="cvs_show" style="max-width:100%"></canvas>
                </div>
                `;
        }
    };
});