/**
 * Title: personController
 * Author: Big
 * Date: 2017.4.17
 */
define([
    'app',
    'text!mod/worldshare/html/person.html',
], function (app,htmlContent) {

    //$(window).resize(function () {
    //    if ($(".opus").width() <= 768) {
    //        $(".opus").height($(".opus").width() * 1.44);
    //    }
    //});
    var params = window.location.search.replace("?", "").split("&");
    var request = {};

    for (var i in params) {
        var param = params[i].split("=");
        request[param[0]] = param[1];
    }

    app.directive('preview', [function () {
        return {
            restrict: "E",
            replace: true,
            scope: {
                imageSrc: "@",
                hasPreview: "@",
            },
            link: function (scope, element, attrs) {
                if (JSON.parse(scope.hasPreview)) {
                    element.context.innerHTML = '<img src="' + scope.imageSrc + '" />';
                } else {
                    element.context.innerHTML = '<div><h3>暂无图片</h3></div>';
                }
            },
            template: "<div>图片正在加载中</div>",
        };
    }])
    .factory('personService', [function () {
        var page;
        var totals = 0;

        return {
            getPage: function () {
                return page;
            },
            setPage: function (_page) {
                page = _page;
            },
            getOpusTotal: function () {
                return totals
            },
            setOpusTotal: function (_totals) {
                totals = _totals;
            },
        };
    }])
    .controller('personController', ["$scope", "$http", "$location", "$rootScope", "personService" ,function ($scope, $http, $location, $rootScope, personService) {
        var postData = {};

        if (request.userid) {
            postData.userid = request.userid;
            $scope.currentUserId = request.userid;
        }

        var allPostData = angular.copy(postData);
        var recentlyPostData = angular.copy(postData);

        allPostData.page = 1;
        allPostData.amount = 2;

        recentlyPostData.amount = 4;
        recentlyPostData.sort = "modDate";

        $scope.recentlyOpus = [];
        $scope.allOpus = [];

        $scope.opusTotals = 0;

        $scope.$on("onUserProfile", function (event, user) {
            $scope.user = angular.copy(user);
        });

        //$scope.getRecentlyOpus = function () {
        //    $http({
        //        method: 'POST',
        //        url: '/api/mod/worldshare/models/worlds/',
        //        data: recentlyPostData,
        //    })
        //        .then(function (response) {
        //            $scope.recentlyOpus = response.data;

        //            for (i in $scope.recentlyOpus) {
        //                var numberDate = $scope.recentlyOpus[i].modDate.split("-");
        //                var strDate = "更新时间：" + numberDate[0] + "年" + numberDate[1] + "月" + numberDate[2] + "日";

        //                $scope.recentlyOpus[i].strDate = strDate;

        //                if ($scope.recentlyOpus[i].dataSourceType == "gitlab") {
        //                    $scope.recentlyOpus[i].preview = $scope.recentlyOpus[i].giturl + "/raw/master/preview.jpg";
        //                } else if($scope.recentlyOpus[i].dataSourceType == "github") {
        //                    var gitContentUrl = $scope.recentlyOpus[i].giturl.replace("github.com", "raw.githubusercontent.com");
        //                    $scope.recentlyOpus[i].preview = gitContentUrl + "/master/preview.jpg";
        //                }
        //            }
        //        }, function (response) {
        //        });
        //}
        //$scope.getRecentlyOpus();

        $scope.getAllOpus = function () {
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

                    if ($scope.allOpus[i].dataSourceType == "gitlab") {
                        var previewUrl = $scope.allOpus[i].giturl + "/raw/master/preview.jpg";
                    } else if ($scope.allOpus[i].dataSourceType == "github") {
                        var gitContentUrl = $scope.allOpus[i].giturl.replace("github.com", "raw.githubusercontent.com");
                        var previewUrl = gitContentUrl + "/master/preview.jpg";
                    }

                    $scope.allOpus[i].preview = [];
                    $scope.allOpus[i].preview[0] = {};
                    $scope.allOpus[i].preview[0].hasPreview = $scope.allOpus[i].hasPreview;
                    $scope.allOpus[i].preview[0].previewUrl = previewUrl;
                }

            }, function (response) {});
        }

        $scope.delete = function (opusId) {
            if (confirm("是否删除此作品？")) {
                var opusInfor;
                var defaultDataSource;

                $($scope.allOpus).each(function () {
                    if (this._id == opusId) {
                        opusInfor = this;
                        return;
                    }
                });

                $($scope.user.dataSource).each(function () {
                    if (this._id == $scope.user.dataSourceId) {
                        defaultDataSource = this;
                        return;
                    }
                });

                $http({
                    method: 'DELETE',
                    url: location.origin + '/api/mod/worldshare/models/worlds/',
                    header: {
                        "content-type" : "application/json",
                    },
                    params: {
                        worldsName : opusInfor.worldsName,
                    }
                })
                .then(function (response) {
                    $http({
                        method: 'DELETE',
                        url: defaultDataSource.apiBaseUrl + "/projects/" + opusInfor.gitlabProjectId,
                        headers: {
                            "PRIVATE-TOKEN" : defaultDataSource.dataSourceToken,
                        }
                    })
                    .then(function (response) {
                        location.reload();
                    })
                    .then(function (response) { })
                })
                .then(function (response) { });
            }
        }

        $scope.$watch(personService.getPage, function (newValue, oldValue) {
            if (newValue != undefined) {
                allPostData.page = newValue;
                $scope.getAllOpus(postData);
            }
        });

        $scope.$watch(personService.getOpusTotal, function (newValue, oldValue) {
            if (newValue != undefined) {
                $scope.opusTotals = newValue;
            }
        });

        $scope.getAllOpus();
    }])
    .controller('allOpusPagination', ["$scope", "$log", "$location", "$http", "personService", function ($scope, $log, $location, $http, personService) {
        var postData = {};

        if (request.userid) {
            postData.statsType = "worldsTotalsUser" + request.userid;
        } else {
            postData.statsType = "worldsTotalsUser";
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
                personService.setOpusTotal(response.data.quantity);

                if (response.data.statsType != 'nil') {
                    $scope.totalItems = response.data.quantity;
                } else {
                    $scope.totalItems = 0;
                }
            }, function (response) {});
        }

        $scope.getAllOpusStats();

        $scope.pageChanged = function () {
            personService.setPage($scope.currentPage);
        };
    }]);

    return htmlContent;
});