define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/permissions.html',
], function (app, util, htmlContent) {

    function registerController(wikiBlock) {
        app.registerController("permissionsController", ['$scope','$sce', 'Account', 'modal', function ($scope, $sce, Account, modal) {
            var containerId, container, containerHeight;

            $scope.modParams  = wikiBlock.modParams;
            $scope.editorMode = wikiBlock.editorMode;
            $scope.isVip      = false;

            wikiBlock.init({
                scope  : $scope,
				styles : [],
				params_template : {
                    text_permissions:{
                        is_leaf      : true,
						type         : "text",
                        editable     : true,
						is_card_show : true,
						is_mod_hide  : false,
                        name         : "阅读权限",
                        text         : "",
                        require      : true,
                        module_kind  : "vip"
                    },
				}
            });

            var shield = function () {
                var mdwiki = config.shareMap["mdwiki"];
                
                if(!$scope.params.text_permissions.is_mod_hide){
                    if($scope.isVip){
                        document.querySelector("#" + wikiBlock.containerId).style.display = "none";
                    }else{
                        containerId = mdwiki.getMdWikiContentContainerId();
                        container   = $("#"+ containerId);
        
                        var innerElement = container[0];
        
                        for(var i=0;i < innerElement.childNodes.length;i++){
                            innerElement.childNodes[i].style.display = "none";
                        }
        
                        document.querySelector("#" + wikiBlock.containerId).style.display = "block";
                    }
                }else{
                    document.querySelector("#" + wikiBlock.containerId).style.display = "none";
                }
            };

            var init = function () {
                var mdwiki = config.shareMap["mdwiki"];

                if(wikiBlock.editorMode){

                }else{
                    shield();
                }
            };

            $scope.goLoginModal = function () {
                modal('controller/loginController', {
                    controller: 'loginController',
                    size: 'lg',
                    backdrop: true
                }, function (result) {
                    $scope.user = result;
                    $scope.isLogin = true;
                    init();
                }, function (result) {
                    $scope.isLogin = false;
                    init();
                });
            };

            $scope.$watch("$viewContentLoaded", function () {
                if (Account.isAuthenticated()){
                    $scope.user    = Account.getUser();
                    $scope.isLogin = true;

                    if($scope.user.vipInfo.endDate){
                        $scope.isVip = true;
                    }
                }

                init();
            });
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        }
    }
});