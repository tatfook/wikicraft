/**
 * Created by wuxiangan on 2017/2/24.
 */

define([
    'app',
    'helper/util',
    'text!html/wikiBlock.html',
], function (app, util, htmlContent) {

    app.registerController('wikiBlockController',['$scope', '$uibModalInstance','Message', function ($scope, $uibModalInstance, Message) {
        $scope.totalItems = 0;
        $scope.currentPage = 1;
        $scope.pageSize = 6;

        $scope.wikiBlockList = [
            /*
            {_id: 1, name: 'personalHeader', type:'header', url:'@personal/js/personalHeader', desc:'个人网站头部', logo:'test.jpg'},
            {_id: 2, name: 'static', type:'header', url:'@personal/js/personalStatics', desc:'个人网站统计信息', logo:'test.jpg'},
            {_id: 3, name: 'test', url:'@personal/js/test', desc:'test', logo:'test.jpg'},
            {_id: 4, name: 'test1', url:'@personal/js/test1', desc:'test1', logo:'test.jpg'},
            {_id: 5, name: 'test2', url:'@personal/js/test2', desc:'test2', logo:'test.jpg'},
            */
        ];

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        }

        $scope.selectWikiBlock = function (wikiBlock) {
            //console.log(wikiBlock);
            // 增加模块使用计数
            util.post(config.apiUrlPrefix + 'wiki_module/updateUseCount', {moduleId:wikiBlock._id});
            $uibModalInstance.close(wikiBlock);
        }

        $scope.sitePageChanged = function () {
            getWikiBlockList($scope.labelItem);
        };

        function getWikiBlockList(type) {
            var params = {page:$scope.currentPage, pageSize:$scope.pageSize};
            var url = config.apiUrlPrefix;
            if (type == "hot") {
                // 获取热门wiki module
                url += 'wiki_module/getHot';
            } else if (type == "favorite") {
                // 获取个人收藏
                url += 'wiki_module_favorite/getByUserId';
                params.userId = $scope.user._id;
            } else if (type == "classify") {
                // 获取分类
                url += 'wiki_module/getClassify';
                params.classifyName = $scope.classifyName;
                //params.classifyName = classifyName;
            } else if (type == "name") {
                // 获取通过模块名
                url += 'wiki_module/getByName';
				console.log("-----------------1");
                params.moduleName = $scope.moduleName;
            } else {
                // 获取所有
                url += 'wiki_module/get';
            }
            util.post(url, params, function (data) {
                $scope.wikiBlockList = data.moduleList;
                $scope.totalItems = data.total;
            });
        }

        function init() {
			console.log("-----------------");
            util.post(config.apiUrlPrefix + 'wiki_module_classify/get',{}, function (data) {
                $scope.moduleClassifyList = data;
            });
			$scope.getHot();
        }

        $scope.$watch('$viewContentLoaded', init);
        
        $scope.getWikiBlockLogoUrl = function (wikiBlock) {
            //console.log(wikiBlock.logoUrl);
            if (!wikiBlock.logoUrl) {
                return $scope.imgsPath + 'wiki_wiki_block_default.png';
            } else {
                if (wikiBlock.logoUrl[0] == '/') {
                    return wikiBlock.logoUrl;
                } else {
                    return config.wikiModPath + wikiBlock.logoUrl;
                }
            }
        }
        // 点击标签项
        $scope.clickLableItem = function (labelItem) {
            $scope.labelItem = labelItem;
            $scope.currentPage = 1;
			getWikiBlockList(labelItem);

        }

        $scope.favoriteWikiBlock = function (moduleId) {
            var target=$(event.target);
            var isFavorite = true;
            if (target.hasClass("glyphicon-star")) {
                // 取消收藏
                util.post(config.apiUrlPrefix + 'wiki_module_favorite/unfavorite', {userId:$scope.user._id, moduleId:moduleId}, function () {
                    Message.info("取消收藏");
                });
                if ($scope.labelItem == 'favorite') {
                    var wikiBlockList = [];
                    for (var i = 0; i < $scope.wikiBlockList.length; i++) {
                        if ($scope.wikiBlockList[i]._id != moduleId) {
                            wikiBlockList.push($scope.wikiBlockList[i]);
                        }
                        $scope.wikiBlockList = wikiBlockList;
                    }
                }
            } else {
                // 收藏模块
                util.post(config.apiUrlPrefix + 'wiki_module_favorite/favorite', {userId:$scope.user._id, moduleId:moduleId}, function () {
                    Message.info("收藏成功");
                });
            }
            target.toggleClass("glyphicon-star");
            target.toggleClass("glyphicon-star-empty");
        }
        // 获得全部
        $scope.getAll = function () {
            $scope.labelItem = 'all';
            $scope.currentPage = 1;
            getWikiBlockList('all');
        }
        // 获取用户收藏
        $scope.getFavorite = function () {
            $scope.labelItem = 'favorite';
            $scope.currentPage = 1;
            getWikiBlockList('favorite');
        }
        // 获得热门
        $scope.getHot = function () {
            $scope.labelItem = 'hot';
            $scope.currentPage = 1;
            getWikiBlockList('hot');
        }
        // 分类获取
        $scope.getClassify = function (classifyName) {
            $scope.classifyName = classifyName;
            $scope.currentPage = 1;
            $scope.labelItem = 'classify';
            getWikiBlockList('classify');
        }
        // 通过模块名搜索
        $scope.getByName = function () {
            $scope.currentPage = 1;
            $scope.labelItem = 'name';
            getWikiBlockList('name');
        }
        // 回车搜索
        $(document).keyup(function (event) {
            if(event.keyCode=="13" && $("#modelSearch").is(":focus")){
                $scope.getByName();
            }
        });
    }]);
    
    return htmlContent;
});
