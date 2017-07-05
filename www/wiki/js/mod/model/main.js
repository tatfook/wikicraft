define(function () {
    function registerController(wikiBlock) {
        app.registerController("modelController", ["$scope",function ($scope) {

            function convert16_32(rgb) {
                var a = (rgb & 0xF000) << 16;
                var r = (rgb & 0x0F00) << 12;
                var g = (rgb & 0x00F0) << 8;
                var b = (rgb & 0x000F) << 4;

                v = (a | r) | (g | b);
                return v;

            }
            function parseBmaxText(txt) {
                var data = Lua.eval(txt)
                if(data && data.length > 0){
                    return data[0];
                }
            }
            // Parse model node
            function parseModel() {
                var xmlDoc = $.parseXML(wikiBlock.modParams);
                var $xml = $(xmlDoc);
                var model_node = $xml.find("model");
                if (model_node) {
                    var url = model_node.attr("url");
                    var type = model_node.attr("type") ? model_node.attr("type") : "bmax";
                    var txt = model_node.text();
                    // load remote asset first.
                    if (url) {

                        $scope.JSZipUtils.getBinaryContent(url, function (err, data) {
                            if (err) {
                                return;
                            }
                            try {
                                $scope.JSZip.loadAsync(data)
                                .then(function (zip) {
                                    var filename;
                                    zip.folder("").forEach(function (relativePath, file) {
                                        // only find the first one
                                        if(!filename){
                                            filename = relativePath;
                                        }
                                    });
                                    return zip.file(filename).async("string");
                                })
                                .then(function success(txt) {
                                    if(type == "bmax"){
                                        parseOriginalBlockNode(txt);
                                    }else if( type == "stl"){
                                        create_meshes_stl(txt);
                                    }
                                }, function error(e) {
                                });
                            } catch (e) {
                            }
                        });
                        
                    } else {
                        // load raw text second.
                        if (type == "bmax") {
                            var blocks_list = parseBmaxText(txt);
                            create_meshes(blocks_list);
                        } else if (type == "stl") {
                            create_meshes_stl(txt);
                        }
                    }
                    return true;
                }
                return false;

            }
            // Parse pe:block
            function parseOriginalBlockNode(content) {
                var block_node = $('pe\\:blocks', content);
                if (block_node && block_node[0]) {
                    var txt = block_node[0].innerText;

                    var blocks_list = parseBmaxText(txt);
                    create_meshes(blocks_list);
                    return true;
                }
                return false;
            }
            function extend_box(box,v) {
                var min = box.min;
                var max = box.max;
                min.x = (v.x < min.x) ? v.x : min.x;
                min.y = (v.y < min.y) ? v.y : min.y;
                min.z = (v.z < min.z) ? v.z : min.z;

                max.x = (v.x > max.x) ? v.x : max.x;
                max.y = (v.y > max.y) ? v.y : max.y;
                max.z = (v.z > max.z) ? v.z : max.z;

                box.min.set(min.x, min.y, min.z);
                box.max.set(max.x, max.y, max.z);
            }
            function create_meshes(blocks_list) {
                if (!blocks_list) {
                    return;
                }
                var box = new THREE.Box3();
                var meshes = [];
                for (var i = 0; i < blocks_list.length; i++) {
                    var block = blocks_list[i];
                    if (block.length > 4) {
                        var x = block[0];
                        var y = block[1];
                        var z = block[2];
                        var block_id = block[3];
                        var color = block[4];
                        color = convert16_32(color);

                        var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
                        var material = new THREE.MeshLambertMaterial({ color: color });
                        var mesh = new THREE.Mesh(geometry, material);
                        mesh.position.set(x, y, z);
                        meshes.push(mesh);

                        extend_box(box, new THREE.Vector3(x, y, z));
                    }
                }
                var size = box.getCenter();
                for (var i = 0; i < meshes.length; i++) {
                    var mesh = meshes[i];
                    mesh.position.x = mesh.position.x - size.x;
                    mesh.position.y = mesh.position.y + 0.5;
                    mesh.position.z = mesh.position.z - size.z;
                    $scope.view.addMesh(mesh);
                }
            }
            function create_meshes_stl(stl_content) {
                if (!stl_content) {
                    return;
                }
                var loader = new THREE.STLLoader();
                var geometry = loader.parse(stl_content);
                var material = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, color: 0xff0000, vertexColors: THREE.VertexColors });
                var mesh = new THREE.Mesh(geometry, material);

                $scope.view.addMesh(mesh);

            }
            require(["THREE", "weblua", "jszip", "jszip-utils"], function (a, b, JSZip, JSZipUtils) {
                $scope.JSZip = JSZip;
                $scope.JSZipUtils = JSZipUtils;
                
                require(["THREE_OrbitControls", "THREE_TransformControls", "STLLoader", "THREE_ThreeJsView", "AxisMonitor"], function () {
                    if (!window.luavm_init) {
                        window.luavm_init = true;
                        Lua.initialize();
                    }
                    var container = $scope.scopeElements.container;
                    $scope.view = new THREE.ThreeJsView(container);

                    // parse original format first
                    if (!parseOriginalBlockNode(wikiBlock.modParams)) {
                        parseModel()
                    }
                   
                });
            });
                
        }])
    };

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return `
                <div ng-controller="modelController" style="min-height:300px;width:100%;border: 1px solid #DCDCDC;">
                <div scope-element="container"/>
                </div>
                `;
        }
    };
});