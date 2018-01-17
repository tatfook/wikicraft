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

            console.log($scope.modParams);

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

            var getShowHeight = function () {
                console.log($scope.user.vipInfo.endDate);
                // {
                // ["vipLevel"]=0,
                // ["username"]="testv2",
                // ["startDate"]="2017-12-07",
                // ["isValid"]=true,
                // ["endDate"]="2018-02-07",
                // }
                if (!containerElement || ($scope.user && $scope.user.vipInfo.endDate)){
                    return "auto";
                }

                console.log()
                return "85px";
            }

            var readable = function () {
                var mdwiki = config.shareMap["mdwiki"];

                containerId = mdwiki.getMdWikiContentContainerId();
                container   = $("#"+ containerId);

                // container
                console.log(container);
                console.log("----------");
                for(var x in container){
                    console.log(container[x]);
                }

                // container.css({
                //     "height"   : getShowHeight(),
                //     "position" : "relative",
                //     "overflow" : "hidden"
                // });
            };

            var init = function () {
                var mdwiki = config.shareMap["mdwiki"];

                if(wikiBlock.editorMode){

                }else{
                    readable();
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