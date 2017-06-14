/**
 * Title: opusController
 * Author: Big
 * Date: 2017/4/17
 */
define([
    'app',
    'markdown-it',
    'text!mod/worldshare/html/opus.html',
    '/wiki/js/mod/wiki/js/comment.js',
], function (app, markdownit, htmlContent, comment) {
    var newHtml = "";

    $(htmlContent).each(function () {
        $(this).find(".comment").html(comment.render());

        if ($(this).html()) {
            newHtml = newHtml + $(this)[0].outerHTML;
        }
    })

    htmlContent = newHtml;

    app.factory('opusService', [function () {
        var page;
        var user;

        return {
            getPage: function () {
                return page;
            },
            setPage: function (_page) {
                page = _page;
            },
            getUser: function () {
                return user;
            },
            setUser: function (_user) {
                user = _user;
            }
        };
    }])
    .controller('opusController', ["$scope", "$http", "$location", "$rootScope", "Account", "opusService", function ($scope, $http, $location, $rootScope, Account, opusService) {
        var params = window.location.search.replace("?", "").split("&");
        var request = {};

        for (var i in params) {
            var param = params[i].split("=");
            request[param[0]] = param[1];
        }

        if (request.opusId) {
            $scope.opusId = request.opusId;
        } else {
            document.write("PARAMS ERROR");
            return;
        }

        $scope.homeUrl = $location.absUrl();
        $scope.homeUrlencode = encodeURIComponent($scope.homeUrl);
        $scope.preview = [];
        $scope.isRecommend = null;
        $scope.change = 1;
        $scope.myStar = {};
        $scope.showModal = false;

        $scope.$on("onUserProfile", function (event, newValue) {
            //$scope.$watch(Account.getUser, function (newValue, oldValue) {
            $scope.user = angular.copy(newValue);
            opusService.setUser($scope.user);

            if ($scope.user != undefined && $scope.user.isadmin != undefined) {
                $scope.isadmin = eval($scope.user.isadmin);
            }
        });

        var md;
        $scope.getMarkDownRenderer = function () {
            if (md == null) {
                md = markdownit({
                    html: true, // Enable HTML tags in source
                    linkify: true, // Autoconvert URL-like text to links
                    typographer: true, // Enable some language-neutral replacement + quotes beautification
                    breaks: false,        // Convert '\n' in paragraphs into <br>
                    highlight: function (str, lang) {
                        if (lang && window.hljs.getLanguage(lang)) {
                            try {
                                return hljs.highlight(lang, str, true).value;
                            } catch (__) {
                            }
                        }
                        return ''; // use external default escaping
                    }
                });
            }
            return md;
        }

        $http({
            method: 'POST',
            url: '/api/mod/worldshare/models/worlds/getOneOpus',
            data: {
                "opusId": $scope.opusId,
            }
        }).then(function (response) {
            var data = response.data.data;

            $scope.userid    = data.userid;
            $scope.opusName  = data.worldsName;
            $scope.giturl    = data.giturl;
            $scope.modDate   = data.modDate;
            $scope.viewTimes = data.viewTimes;
            $scope.displayName = data.displayName;

            var modDate = $scope.modDate.split("-");
            var modDate = modDate[0] + "年" + modDate[1] + "月" + modDate[2] + "日";

            $scope.modDate = modDate;
            
            if (data.isRecommend && data.isRecommend != "false") {
                $scope.isRecommend = eval(data.isRecommend);
            }

            //var readmeUrl = data.giturl.replace("github.com", "raw.githubusercontent.com");
            //readmeUrl = readmeUrl + "/master/README.md"

            //$http({
            //    method: 'GET',
            //    url: readmeUrl,
            //    headers: {
            //        'Authorization': undefined,
            //    }, // remove auth header for this request
            //    skipAuthorization: true, // this is added by our satellizer module, so disable it for cross site requests.
            //    transformResponse: [function (data) {
            //        return data; // never transform to json, return as it is
            //    }],
            //}).then(function (response) {
            //    var html = $scope.getMarkDownRenderer().render(response.data);
            //    $('.about').html(html);
            //},
            //function (response) {
            //    console.warn("You need to upload README.md in your git repositary");
            //    return
            //});

            if(data.dataSourceType == "gitlab"){
                var previewUrl = data.giturl + "/raw/master/preview.jpg";
            }else if(data.dataSourceType == "github"){
                var previewUrl = data.giturl.replace("github.com", "raw.githubusercontent.com");
                previewUrl = previewUrl + "/master/preview.jpg";
            }

            $scope.preview = [];
            $scope.preview[0] = {};
            $scope.preview[0].hasPreview = data.hasPreview;
            $scope.preview[0].previewUrl = previewUrl;
        }, function (response) {});

        var postData = {
            "opusId": $scope.opusId,
            page: 1,
            amount: 1
        };

        $scope.checkEngine = function () {
            if (true) {// 判断是否安装了Paracraft
                $scope.showModal = true;
            }
            window.open("paracraft://cmd/loadworld");
        }

        $scope.clickDownload = function () {
            $scope.showModal = false;
            //window.open("http://www.paracraft.cn");
        }

        //$scope.getRecommendOpus = function () {
        //    $http({
        //        method: 'POST',
        //        url: '/api/mod/worldshare/models/worlds/getRecommendOpus',
        //        data: postData,
        //    }).then(function (response) {
        //        $scope.recommendOpus = response.data.data;

        //        for (var i in $scope.recommendOpus) {
        //            var previewUrl = $scope.recommendOpus[i].giturl.replace("github.com", "raw.githubusercontent.com");
        //            previewUrl = previewUrl + "/master/preview.jpg";

        //            $scope.recommendOpus[i].preview = previewUrl;
        //        }
        //    }, function (response) {
        //    });
        //}

        //$scope.getRecommendOpus();

        //$scope.$watch(opusService.getPage, function (newValue, oldValue) {
        //    postData.page = newValue;
        //    $scope.getRecommendOpus();
        //});

        //$scope.$watch('isRecommend', function (newValue, oldValue) {
        //    if (oldValue != null && newValue != oldValue) {
        //        $http({
        //            method: "POST",
        //            url: "/api/mod/worldshare/models/worlds/recommendOpus",
        //            data: {
        //                "opusId": $scope.opusId,
        //                "isRecommend": newValue.toString()
        //            }
        //        })
        //        .then(function (response) {
        //            if (response.data.error == -1) {
        //                console.log("set fail");
        //                //$scope.isRecommend = oldValue;
        //            }
        //            ;
        //        }).then(function (response) {
        //        });
        //    }
        //});

        //$scope.setStar = function (_id) {
        //    if ($scope.recommendOpus[_id].isMyStar) {
        //        var method = "delete";
        //    } else {
        //        var method = "create";
        //    }

        //    $http({
        //        method: "PUT",
        //        url: "/api/mod/worldshare/models/worlds_star",
        //        data: {
        //            "method": method,
        //            "opusId": $scope.recommendOpus[_id]._id,
        //        }
        //    }).then(function (response) {
        //        if (response.data.error == 0) {
        //            if (method == "create") {
        //                $scope.recommendOpus[_id].isMyStar = true;
        //                var quantity = $scope.recommendOpus[_id].starTotals.quantity;
        //                $scope.recommendOpus[_id].starTotals.quantity = quantity + 1
        //            } else if (method == "delete") {
        //                $scope.recommendOpus[_id].isMyStar = false;
        //                var quantity = $scope.recommendOpus[_id].starTotals.quantity;
        //                $scope.recommendOpus[_id].starTotals.quantity = quantity - 1
        //            }
        //        } else {
        //            alert("设置失败");
        //        }
        //    }).then(function (response) {});
        //}

        //$scope.myStar = {
        //    "display": "block",
        //    "opacity": "1",
        //};
    }])
    .controller('recommendOpusPagination', ["$scope", "$http", "opusService", function ($scope, $http, opusService) {
        $scope.totalItems = 0;
        $scope.itemsPerPage = 1;
        $scope.currentPage = 1;

        //$scope.$watch(opusService.getUser, function (newValue, oldValue) {
        //    if (newValue != undefined) {
        //        $scope.userid = newValue._id;
        //        $scope.getAllRecommendOpusStats();
        //    }
        //});

        //$scope.getAllRecommendOpusStats = function () {
        //    $http({
        //        method: 'POST',
        //        url: '/api/mod/worldshare/models/worlds_stats/',
        //        data: {
        //            statsType: "worldsRecommendTotalsUser" + opusService.getUser()._id,
        //        }
        //    }).then(function (response) {
        //        if (response.data.statsType != 'nil') {
        //            $scope.totalItems = response.data.quantity;
        //        } else {
        //            $scope.totalItems = 0;
        //        }
        //    }, function (response) {
        //    });

        //}

        $scope.pageChanged = function () {
            opusService.setPage($scope.currentPage);
        };
    }])
    .directive('preview', [function () {
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
    }]);

    //$(window).resize(function () {
    //    autoSizeCover();
    //    autoSizeOpus();
    //});

    //function autoSizeCover() {
    //    if ($(".cover").width() <= 768) {
    //        $(".cover").height($(".cover").width() * 1.26);
    //    }
    //}

    //autoSizeCover();

    //function autoSizeOpus() {
    //    if ($(".recommend .opus .opus-hover .img").width() <= 768) {
    //        $(".recommend .opus .opus-hover .img").height($(".recommend .opus .opus-hover .img").width() * 1.3);
    //    }
    //}

    //autoSizeOpus();

    return htmlContent;
});