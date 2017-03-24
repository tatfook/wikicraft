define(function () {
    function registerController(wikiBlock) {
        app.registerController("modelController", function ($scope, $uibModal, $timeout) {
            console.log("========================modelController",wikiBlock.modParams);
        })
    };

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return `
                <div ng-controller="modelController" style="min-height:300px;width:100%;border: 1px solid #DCDCDC;">
                <p>Hello Model</p>
                </div>
                `;
        }
    };
});