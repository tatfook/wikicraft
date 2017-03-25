define(function () {
    function registerController(wikiBlock) {
        app.registerController("modelController", function ($scope, $uibModal, $timeout) {

            function convert16_32(rgb) {
                var a = (rgb & 0xF000) << 16;
                var r = (rgb & 0x0F00) << 12;
                var g = (rgb & 0x00F0) << 8;
                var b = (rgb & 0x000F) << 4;

                v = (a | r) | (g | b);
                return v;

            }
            function parseText(txt) {
                var data = Lua.eval(txt)
                if(data && data.length > 0){
                    return data[0];
                }
            }
            function parseBlockModel() {
                var blockmodel = $('pe\\:model', wikiBlock.modParams);
                if (blockmodel && blockmodel[0])
                {
                    var url = blockmodel[0].innerText;
                    console.log("=========url", url);
                    $.get(url)
                      .done(function (d) {
                          console.log(d);
                      })
                    return true;
                }
                return false;

            }
            function parseBlockNode() {
                var block_node = $('pe\\:blocks', wikiBlock.modParams);
                if (block_node && block_node[0]) {
                    var txt = block_node[0].innerText;

                    var blocks_list = parseText(txt);
                    create_meshes(blocks_list);
                }
            }
            function create_meshes(blocks_list) {
                if (!blocks_list) {
                    return;
                }
                for (var i = 0; i < blocks_list.length; i++) {
                    var block = blocks_list[i];
                    if (block.length > 4) {
                        var x = block[0];
                        var y = block[1];
                        var z = block[2];
                        var block_id = block[3];
                        var color = block[4];
                        $scope.view.createMesh(x, y, z, block_id, convert16_32(color));
                    }
                }
            }
            require(["THREE", "THREE_OrbitControls", "THREE_TransformControls", "THREE_ThreeJsView"], function () {
                var container = $scope.scopeElements.container;
                $scope.view = new THREE.ThreeJsView(container);

                if (!parseBlockModel()) {
                    parseBlockNode();
                }
                
            });
                
        })
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