define(function () {
    function registerController(wikiBlock) {
        app.registerController("modelController", function ($scope, $uibModal, $timeout) {
            console.log("========================modelController", 0xffffff);

            function convert16_32(rgb) {
                var a = (rgb & 0xF000) << 16;
                var r = (rgb & 0x0F00) << 12;
                var g = (rgb & 0x00F0) << 8;
                var b = (rgb & 0x000F) << 4;

                v = (a | r) | (g | b);
                return v;

            }

            require(["THREE", "THREE_OrbitControls", "THREE_TransformControls", "THREE_ThreeJsView"], function () {
                var container = $scope.scopeElements.container;
                var view = new THREE.ThreeJsView(container);

                var xmlNodes = $('pe\\:blocks', wikiBlock.modParams);
                if (xmlNodes && xmlNodes[0]) {
                    var txt = xmlNodes[0].innerText;
                    if (txt) {
                        var data = Lua.eval(txt)
                        var blocks_list = data[0]
                        for (var i = 0; i < blocks_list.length; i++) {
                            var block = blocks_list[i];
                            if (block.length > 4) {
                                var x = block[0];
                                var y = block[1];
                                var z = block[2];
                                var block_id = block[3];
                                var color = block[4];
                                view.createMesh(x, y, z, block_id, convert16_32(color));
                            }
                        }
                    }
                    
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