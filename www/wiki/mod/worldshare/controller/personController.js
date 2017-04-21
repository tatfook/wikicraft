/**
 * Title: personController
 * Author: Big
 * Date: 2017/4/17
 */
define([
    'app',
    'text!mod/worldshare/pages/person.page',
], function (app,htmlContent) {

    $(window).resize(function () {
        if ($(".opus").width() <= 768) {
            $(".opus").height($(".opus").width() * 1.44);
        }
    });

    app.directive('preview', function ($http) {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    src: "=previewSrc"
                },
                link: function (scope, element, attrs) {
                    $http({
                        "method": "GET",
                        "url": scope.src,
                        "skipAuthorization": true,
                        "headers": {
                            'Authorization': undefined
                        },
                    }).then(function (response) {
                        // console.log(element.context);
                        element.context.innerHTML = '<img src="' + scope.src + '" />';
                    }, function (response) {
                        // console.log(response);
                        element.context.innerHTML = '<div><h3>暂无图片</h3></div>';
                    })
                },
                template: "<div>图片正在加载中</div>",
            };
        })
        .factory('personService', function () {
            var page;

            return {
                getPage: function () {
                    return page;
                },
                setPage: function (_page) {
                    page = _page;
                }
            };
        })
        .controller('personController', function ($scope, $http, $location, $rootScope, personService) {
            var request = $location.search();

            var postData = {};

            if (request.userid) {
                postData.userid = request.userid;
            }

            var allPostData = angular.copy(postData);
            var recentlyPostData = angular.copy(postData);

            allPostData.page = 1;
            allPostData.amount = 2;

            recentlyPostData.amount = 4;
            recentlyPostData.sort = "modDate";

            $scope.recentlyOpus = [];
            $scope.allOpus = [];

            $scope.getRecentlyOpus = function () {
                $http({
                    method: 'POST',
                    url: '/api/mod/worldshare/models/worlds/',
                    data: recentlyPostData,
                })
                    .then(function (response) {
                        $scope.recentlyOpus = response.data;

                        for (i in $scope.recentlyOpus) {
                            var numberDate = $scope.recentlyOpus[i].modDate.split("-");
                            var strDate = "更新时间：" + numberDate[0] + "年" + numberDate[1] + "月" + numberDate[2] + "日";

                            $scope.recentlyOpus[i].strDate = strDate;

                            var gitContentUrl = $scope.recentlyOpus[i].giturl.replace("github.com", "raw.githubusercontent.com");
                            $scope.recentlyOpus[i].preview = gitContentUrl + "/master/preview.jpg";
                        }
                    }, function (response) {
                    });
            }

            $scope.getRecentlyOpus();

            $scope.getAllOpus = function () {
                console.log(allPostData);
                $http({
                    method: 'POST',
                    url: '/api/mod/worldshare/models/worlds/',
                    data: allPostData
                })
                    .then(function (response) {
                        $scope.allOpus = response.data;

                        for (i in $scope.allOpus) {
                            var numberDate = $scope.allOpus[i].modDate.split("-");
                            var strDate = "更新时间：" + numberDate[0] + "年" + numberDate[1] + "月" + numberDate[2] + "日";

                            $scope.allOpus[i].strDate = strDate;

                            var gitContentUrl = $scope.allOpus[i].giturl.replace("github.com", "raw.githubusercontent.com");
                            $scope.allOpus[i].preview = gitContentUrl + "/master/preview.jpg";
                        }

                    }, function (response) {
                    });
            }

            $scope.$watch(personService.getPage, function (newValue, oldValue) {
                if (newValue != undefined) {
                    allPostData.page = newValue;
                    $scope.getAllOpus(postData);
                }
            });

            $scope.getAllOpus();

            return htmlContent;
        })
        .controller('allOpusPagination', function ($scope, $log, $location, $http, personService) {
            var request = $location.search();

            var postData = {};

            if (request.userid) {
                postData.statsType = "worldsTotals" + request.userid;
            } else {
                postData.statsType = "worldsTotals";
                postData.isMine = "true";
            }

            $scope.totalItems = 0;
            $scope.itemsPerPage = 2;
            $scope.currentPage = 1;

            $scope.getAllOpusStats = function () {
                $http({
                    method: 'POST',
                    url: '/api/mod/worldshare/models/worlds_stats/',
                    data: postData
                })
                    .then(function (response) {
                        if (response.data.statsType != 'nil') {
                            $scope.totalItems = response.data.quantity;
                        } else {
                            $scope.totalItems = 0;
                        }
                    }, function (response) {
                    });

            }

            $scope.getAllOpusStats();

            $scope.pageChanged = function () {
                personService.setPage($scope.currentPage);
            };
        });

    return htmlContent;
});