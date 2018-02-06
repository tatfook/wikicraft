/**
 * Created by wuxiangan on 2017/2/24.
 */

define([
    'app',
    'Fuse',
    'helper/util',
    'text!html/wikiBlock.html',
], function (app, Fuse, util, htmlContent) {
    app.registerController('wikiBlockController',['$scope', '$uibModalInstance','Message', function ($scope, $uibModalInstance, Message) {
        $scope.totalItems = 0;
        $scope.currentPage = 1;
        $scope.pageSize = 10000;
        $scope.moduleQueryStr = '';
        $scope.subClassifyShowTurnOn = {};

        $scope.wikiBlockListDataStore = [];
        $scope.modClassifyList = [];
        $scope.wikiBlockListFilteredToDisplay = [];
        $scope.filterQueryStr = '';
        $scope.filterNavType = 'all';
        var postCacheInfo = {};

        $scope.$watch('$viewContentLoaded', function() {
            getClassifyData(updateClassifyListView);
            getWikiBlockData('all', function() {
                getWikiBlockData('favorite', resetFilter);
            });
        });

        function resetFilter() {
            setFilterNavType('all');
        }

        function setFilterNavType(type) {
            $scope.filterNavType = type;
            $scope.filterQueryStr = '';
            clearQueryInput();
            updateContentView();
        }

        function clearQueryInput() {
            $scope.moduleQueryStr = '';
        }

        function setFilterQueryStr(queryStr) {
            queryStr && (queryStr = queryStr.replace(/\s/g, ''));
            $scope.filterNavType = 'all';
            $scope.filterQueryStr = queryStr;
            updateContentView();
        }

        $scope.queryInputKeyup = function(event) {
            event.keyCode == "13" && $scope.searchWikiBlock();
        }

        $scope.unwatchModuleQueryStr && $scope.unwatchModuleQueryStr();
        $scope.unwatchModuleQueryStr = $scope.$watch('moduleQueryStr', function(newVal, oldVal) {
            newVal != oldVal && $scope.searchWikiBlock();
        })

        $scope.searchWikiBlock = function() {
            setFilterQueryStr($scope.moduleQueryStr);
        }

        $scope.showFavorite = function() {
            getWikiBlockData('favorite', function() {
                setFilterNavType('favorite');
            })
        }

        $scope.showAll = function() {
            setFilterNavType('all');
        }

        $scope.showByClassifyName = function(classifyName, subClassifyName) {
            !subClassifyName && toggleSubClassifyDisplay(classifyName);

            var navType = subClassifyName ? classifyName + '>' + subClassifyName : classifyName;
            setFilterNavType(navType);
        }

        $scope.displaySubClassify = function(itemClassifyName, itemSubClassifyName) {
            if (!$scope.filterNavType) return false;
            var classifyNames = $scope.filterNavType.split('>');
            var classifyName = classifyNames[0];
            return classifyName == itemClassifyName;
        }

        function toggleSubClassifyDisplay(classifyName) {
            $scope.subClassifyShowTurnOn[classifyName] = !$scope.subClassifyShowTurnOn[classifyName]
        }

        function updateClassifyListView() {
            //TODO: display classify list view
        }

        function updateContentView() {
            var sortIndexFn = function(x, y) {
                return x.sortIndex < y.sortIndex ? -1 : 1;
            }

            var classifySortIndexFn = function(x, y) {
                return x.classifySortIndex < y.classifySortIndex ? -1 : 1;
            }

            if ($scope.filterNavType !== 'all' && $scope.filterNavType !== 'favorite') {
                var classifyNames = $scope.filterNavType.split('>');
                var classifyName = classifyNames[0];
                var subClassifyName = classifyNames[1];

                // classifyName support multi treeview group
                // item.classifyName pattern: 标题>大标题!1:文档>一级文档!2.5:...
                // !1 means classifySortIndex === 1
                // !2.5 means classifySortIndex === 2.5
                $scope.wikiBlockListFilteredToDisplay = $scope.wikiBlockListDataStore.filter(function (item, wikiBlockIndex) {
                    if (!item || !item.classifyName) return false;

                    var itemClassifies = item.classifyName.split(':').map(function(x) {
                        var tempArr = x.split('!');
                        return {
                            name: tempArr[0],
                            classifySortIndex: util.getFirstAvailableNumber(tempArr[1], item.sortIndex, wikiBlockIndex)
                        }
                    });

                    var classifySortIndex = util.getFirstAvailableNumber(itemClassifies[0] && itemClassifies[0].classifySortIndex, item.sortIndex);

                    var result = itemClassifies.filter(function(itemClassifyItem) {
                        var itemClassifyNames = itemClassifyItem.name.split('>');
                        var itemClassifyName = itemClassifyNames[0];
                        var itemSubClassifyName = itemClassifyNames[1];
    
                        var result = (classifyName == itemClassifyName) && (
                            subClassifyName ? subClassifyName == itemSubClassifyName : true
                        );

                        result && (classifySortIndex = itemClassifyItem.classifySortIndex);

                        return result;
                    }).length > 0;

                    if (result) {
                        item.classifySortIndex = classifySortIndex;
                    };

                    return result;
                }).sort(classifySortIndexFn);
                return;
            }

            if ($scope.filterNavType == 'favorite') {
                $scope.wikiBlockListFilteredToDisplay = $scope.wikiBlockListDataStore.filter(function (item) {
                    return item && item.myfavorite;
                }).sort(sortIndexFn);
                return;
            }

            // for all with filterQueryStr
            if ($scope.filterQueryStr) {
                var options = {
                    shouldSort: true,
                    threshold: 0.6,
                    location: 0,
                    distance: 100,
                    maxPatternLength: 32,
                    minMatchCharLength: 1,
                    keys: [{
                        name: '_id',
                        weight: .35
                    }, {
                        name: 'name',
                        weight: .25
                    }, {
                        name: 'desc',
                        weight: .2
                    }, {
                        name: 'classifyName',
                        weight: .1
                    }, {
                        name: 'wikiCmdName',
                        weight: .1
                    }]
                };
                var fuse = new Fuse(
                    $scope.wikiBlockListDataStore.filter(function(item) {
                        return item
                    }),
                    options
                );
                $scope.wikiBlockListFilteredToDisplay = fuse.search($scope.filterQueryStr).sort(sortIndexFn);
                return;
            }

            // for all without filterQueryStr
            $scope.wikiBlockListFilteredToDisplay = $scope.wikiBlockListDataStore.filter(function (item) {
                return item;
            }).sort(sortIndexFn);
        }

        function getWikiBlockData(type, callback) {      
            var params = {page:$scope.currentPage, pageSize:$scope.pageSize};
            var url = config.apiUrlPrefix;

            if (postCacheInfo[type]) return callback && callback();

            if (type === 'favorite') {
                // 获取个人收藏
                url += 'wiki_module_favorite/getByUserId';
                params.userId = $scope.user._id;
            }

            if (type === 'all') {
                // 获取所有
                url += 'wiki_module/get';
            }

            util.post(url, params, function (data) {
                type === 'all' && ($scope.wikiBlockListDataStore.length = 0);
                if ( !(data.moduleList && data.moduleList.forEach) ) return;
                data.moduleList && data.moduleList.forEach && data.moduleList.forEach(function(item) {
                    item.myfavorite = type === 'favorite'; //for 个人收藏
                    item.sortIndex = util.getFirstAvailableNumber(item.sortIndex, item._id);
                    $scope.wikiBlockListDataStore[item._id] = item;
                });
                postCacheInfo[type] = true;
                callback && callback();
            });
        }

        function getClassifyData(callback) {
            util.post(config.apiUrlPrefix + 'wiki_module_classify/get',{}, function (data) {
                $scope.modClassifyList = data;
                callback && callback();
            });
        }

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        }

        $scope.selectWikiBlock = function (wikiBlock) {
            // 增加模块使用计数
            util.post(config.apiUrlPrefix + 'wiki_module/updateUseCount', {moduleId:wikiBlock._id});
            $uibModalInstance.close(wikiBlock);
        }
        
        $scope.getWikiBlockLogoUrl = function (wikiBlock) {
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

        $scope.favoriteWikiBlock = function (moduleId) {
            var target=$(event.target);
            var isFavorite = true;
            if (target.hasClass("glyphicon-star")) {
                // 取消收藏
                util.post(config.apiUrlPrefix + 'wiki_module_favorite/unfavorite', {userId:$scope.user._id, moduleId:moduleId}, function () {
                    $scope.wikiBlockListDataStore[moduleId].myfavorite = false;
                    Message.info("取消收藏");
                    updateContentView();
                });
            } else {
                // 收藏模块
                util.post(config.apiUrlPrefix + 'wiki_module_favorite/favorite', {userId:$scope.user._id, moduleId:moduleId}, function () {
                    $scope.wikiBlockListDataStore[moduleId].myfavorite = true;
                    Message.info("收藏成功");
                });
            }
            target.toggleClass("glyphicon-star");
            target.toggleClass("glyphicon-star-empty");
        }
    }]);
    
    return htmlContent;
});
