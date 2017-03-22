/**
 * Created by wuxiangan on 2017/2/28.
 */

define(['app'], function (app) {
    app.directive('scopeElement', function () {
        return {
            restrict: "A",
            replace: false,
            link: function ($scope, elem, attrs) {
                if (!$scope.scopeElements) {
                    $scope.scopeElements = {};
                }
                $scope.scopeElements[attrs.scopeElement] = elem[0];
            }
        };
    });

    app.directive('colorSelector', function () {
        return {
            restrict: 'E',
            scope: {
                onchange: '=',
                value:'='
            },
            template: `
                <div class="btn-group">
                  <button class ="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" ng-style="{backgroundColor:selected}">
                    <span style="display:inline-block;width:30px"></span> <span class ="caret"></span>
                  </button>
                  <div class ="dropdown-menu row" role="menu" aria-labelledby="single-button" style="width:80px">
                    <div role="menuitem" ng-repeat="item in items" class ="col-md-3" ng-click="onselect(item)" ng-style="{backgroundColor:item, cursor:'pointer'}"><span>&nbsp; </span></div>
                  </div>
                </div>
                `,
            controller: function ($scope) {
                $scope.items = [
                    '#facd89',
                    '#cce198',
                    '#89c997',
                    '#84ccc9',
                    '#7ecef4',
                    '#88abda',
                    '#8c97cb',
                    '#8f82bc',
                    '#a0a0a0',
                    '#7d7d7d',
                    '#535353',
                    '#1b1b1b'
                ];

                $scope.selected = $scope.items[0];

                $scope.onselect = function (item) {
                    $scope.select(item);
                    if ($scope.onchange) {
                        $scope.onchange(item);
                    }
                };

                $scope.select = function (color) {
                    $scope.selected = color;
                };

                $scope.$watch(function () {
                    return $scope.value;
                }, function (newVal, oldVal) {
                    $scope.select(newVal);
                });
            }
        };
    });

    app.directive('numberSelector', function () {
        return {
            restrict: 'E',
            scope: {
                onchange: '=',
                value: '=',
                min: '=',
                max: '=',
                step: '=',
                unit: '='
            },
            template: `
                <div class ="btn-group">
                  <button class ="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    {{selected}}
                    <span class ="caret"></span>
                  </button>
                  <ul class ="dropdown-menu" aria-labelledby="dropdownMenu1" style="min-width:inherit">
                    <li ng-repeat="item in items" ng-click="onselect(item)"><a href="javascript:void(0)">{{item}}</a></li>
                  </ul>
                </div>
                `,
            controller: function ($scope) {
                $scope.items = [];

                var initItems = function () {
                    $scope.items = [];
                    var min = parseInt($scope.min) || 0,
                        max = parseInt($scope.max) || 9,
                        step = parseInt($scope.step) || 1,
                        unit = $scope.unit || '';
                    for (var i = min; i <= max; i += step) {
                        $scope.items.push(i);
                    }
                };

                initItems();

                $scope.selected = $scope.items[0];

                $scope.onselect = function (item) {
                    $scope.select(item);
                    if ($scope.onchange) {
                        $scope.onchange(item);
                    }
                };

                $scope.select = function (val) {
                    $scope.selected = val;
                };

                $scope.$watch(function () {
                    return $scope.value;
                }, function (newVal, oldVal) {
                    $scope.select(newVal);
                });
            }
        };
    });
});