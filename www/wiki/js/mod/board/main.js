define(function () {
    function registerController(wikiBlock) {
        app.registerController("boardController", function ($scope, $uibModal) {
            var style = {};
            $scope.boardStyle = {};
            if (wikiBlock.modParams) {
                style = wikiBlock.modParams.style;
            }
            if (!style.height) {
                style.height = '500px';
            }
            $scope.boardStyle = style;

            $scope.onclick = function () {
                $uibModal.open({
                    template: `
                            <div class="modal-header">
                                <h3 class="modal-title">绘图</h3>
                            </div>
                            <div class="modal-body">
                                This is a Dialog
                            </div>
                            <div class ="modal-footer">
                                <button class ="btn btn-warning" type="button" data-dismiss="modal" ng-click="cancel()">取消</button>
                                <button class="btn btn-primary" type="button" ng-click="save()">保存</button>
                            </div>
                        `,
                    size: 'xxs',
                    backdrop: 'static',
                    keyboard:false,
                    controller: function ($scope, $uibModalInstance) {
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss('cancel');
                        };
                        //$uibModalInstance.close("link");
                    }
                }).result.then(function (provider) {
                    
                }, function (text, error) {
                    
                });

            };

            
        });
    };

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return `
                <div ng-controller="boardController" ng-style="boardStyle" ng-click="onclick()"></div>
                `;
        }
    };
});