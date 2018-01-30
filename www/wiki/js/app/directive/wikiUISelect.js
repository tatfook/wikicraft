/**
 * Created by wuxiangan on 2017/2/24.
 */

define(['app'], function (app) {
    app.directive('wikiUiSelect', [function () {
        return {
            require: 'uiSelect',
            link: function ($scope, $element, $attrs, $select) {
                var searchInput = $element.querySelectorAll('input.ui-select-search');
                if(searchInput.length !== 1)
                    throw Error("bla");

                searchInput.on('blur', function(e) {
                    $scope.$apply(function() {
                        if ($select.search) {
                            // console.log($select.selected);
                            $select.selected[$select.selected.getBindField()] = $select.search;
                        }
                    });
                });
            }
        }
    }]);
});

/* 示例
 <!--div>
 <ui-select wiki-ui-select ng-model="selected" on-select="wikiBlockSelected()" uis-open-close="onOpenClose(isOpen)">
 <ui-select-match>
 <span ng-bind="$select.selected.name"></span>
 </ui-select-match>
 <ui-select-choices repeat="block in (wikiBlockList | filter:$select.search) track by $index">
 <span ng-bind="block.name"></span>
 </ui-select-choices>
 <ui-select-no-choice>
 Dang!  We couldn't find any choices...
 </ui-select-no-choice>
 </ui-select>
 </div>
 <div>
 <button class="btn btn-default" ng-click="wikiBlockSelected()">搜索</button>
 </div-->

 app.registerController('wikiBlockController',['$scope', function ($scope) {
 $scope.wikiBlockList = [
 {_id: 1, name: 'personalHeader', type:'header', url:'@personal/js/personalHeader', desc:'个人网站头部', logo:'test.jpg'},
 {_id: 2, name: 'static', type:'header', url:'@personal/js/personalStatics', desc:'个人网站统计信息', logo:'test.jpg'},
 {_id: 3, name: 'test', url:'@personal/js/test', desc:'test', logo:'test.jpg'},
 {_id: 4, name: 'test1', url:'@personal/js/test1', desc:'test1', logo:'test.jpg'},
 {_id: 5, name: 'test2', url:'@personal/js/test2', desc:'test2', logo:'test.jpg'},
 ];

 $scope.wikiBlockSelected = function () {
 }

 $scope.selected = { };
 $scope.selected.getBindField = function () {
 return 'value';
 }
*/
