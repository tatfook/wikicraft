define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/vipread.html',
], function (app, util, htmlContent) {

    function registerController(wikiBlock) {
        app.registerController("vipreadController", ['$scope','$sce', 'Account', 'modal', function ($scope, $sce, Account, modal) {
            var containerId, container, containerHeight;

            $scope.modParams  = wikiBlock.modParams;
            $scope.editorMode = wikiBlock.editorMode;
            $scope.isVip      = false;

            wikiBlock.init({
                scope  : $scope,
				styles : [],
				params_template : {
                    switch_vipread:{
                        is_leaf      : true,
						type         : "switch",
                        editable     : true,
						is_card_show : true,
						is_mod_hide  : false,
                        name         : "阅读权限",
                        text         : "",
                        require      : true,
                        module_kind  : "vip",
                        desc         : "本网页内容，仅限VIP用户浏览全部"
                    },
				}
            });

            var shield = function () {
                var mdwiki = config.shareMap["mdwiki"];
                
                if(!$scope.params.switch_vipread.is_mod_hide){
                    if($scope.isVip){
                        document.querySelector("#" + wikiBlock.containerId).style.display = "none";
                    }else{
                        containerId = mdwiki.getMdWikiContentContainerId();
                        container   = $("#" + containerId);
                        vipBlock    = document.querySelector("#" + wikiBlock.containerId);

                        var innerElement = container[0];

                        for(var i = 0; i < innerElement.childNodes.length; i++){
                            if(innerElement.childNodes[i].id == wikiBlock.containerId){
                                innerElement.childNodes[i].remove();
                            }
                        }

                        container.css({"height":"300px", "overflow":"hidden"});

                        // for(var i = 0; i < innerElement.childNodes.length; i++){
                        //     if(i >= 1){
                        //         innerElement.childNodes[i].style.display = "none";
                        //     }else{
                        //         innerElement.childNodes[i].style.maxHeight = "150px";
                        //         innerElement.childNodes[i].style.overflow = "hidden";
                        //     }
                        // }

                        innerElement.prepend(vipBlock);
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