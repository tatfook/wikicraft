/*
 * @Author: ZhangKaitlyn 
 * @Date: 2018-01-19
 * @Last Modified by: none
 * @Last Modified time: 2018-01-29 18:30:52
 */
define([
    'app', 
    'helper/util',
    'helper/mdconf',
    'text!wikimod/page/html/tags.html'
], function (app, util, mdconf, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("pageTagsCtrl", ['$rootScope', '$scope', 'Message', 'Account', function ($rootScope, $scope, Message, Account) {
            const modCmd = "```@page/js/tags";
            var thisInBlockIndex;
            var thisContainerId;
			wikiBlock.init({
				scope:$scope,
				params_template:{
                    is_leaf: true,
					pageTags:{
                        is_leaf: true,
                        require: false,
                        tags:[]
                    }
				}
            });
            $scope.tags = {};
            $scope.tags.tags = Array.from($scope.params && $scope.params.tags || []);
            
            // 获取当前模块的index和containerId
            var getBlockIndex = function(){
                if (thisInBlockIndex >= 0) {
                    return thisInBlockIndex;
                }
                var blockList = wikiBlock.blockList;
                for(var i = 0; i<blockList.length; i++){
                    var modReg = new RegExp(modCmd);
                    if (modReg.test(blockList[i].content)) {
                        break;
                    }
                }
                thisInBlockIndex = i;
                thisContainerId = blockList[i].blockCache.containerId;
                return i;
            };

            var modifyTagsMd = function(){
                var newItemObj = {
                    index: getBlockIndex(),
                    containerId: thisContainerId,
                    content: modCmd + "\n" + mdconf.jsonToMd({
                        "tags": $scope.tags.tags
                    }) + "\n```\n",
                    isTopContent: true
                }
                $rootScope.$broadcast("changeProfileMd", newItemObj);
                util.post(config.apiUrlPrefix + 'pages/updateTags', {
                    tags: $scope.tags.tags,
                    url: "/" + $scope.userinfo.username
                }, function(data){
                    console.log(data);
                }, function(err){
                    console.log(err);
                })
            };

            $scope.editTags = function(value){
                $scope.tagEditing = value;
                if (value == false) {
                    modifyTagsMd();
                }
            }
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});