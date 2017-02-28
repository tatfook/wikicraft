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
                            <div class ="modal-body" style="display:flex">
                                <div style="min-width:200px"></div>
                                <div style="flex-basis:100%">
                                    <canvas scope-element="cvs" width="800" height="300"></canvas>
                                </div>
                            </div>
                            <div class ="modal-footer">
                                <button class ="btn btn-warning" type="button" data-dismiss="modal" ng-click="cancel()">取消</button>
                                <button class="btn btn-primary" type="button" ng-click="save()">保存</button>
                            </div>
                        `,
                    size: 'xxs',
                    backdrop: 'static',
                    keyboard:false,
                    controller: function ($scope, $uibModalInstance, $timeout) {
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss('cancel');
                        };
                        
                        $timeout(function () {
                            console.log('BBBBBBBBBb');
                            console.log($scope.cvs);
                        });
                        
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