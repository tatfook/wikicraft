

app.controller("userlistCtrl", function ($scope) {
    $scope.requestUrl = config.apiUrlPrefix + "website_member/getByWebsiteId";
    $scope.requestParams = {pageSize:6, page:0, websiteId:$scope.siteinfo._id};

    $scope.getAllUserList = function () {
        //SelfData.requestUrl = config.apiUrlPrefix + "website/getByUserId";
        //SelfData.requestParams = $scope.allSiteParams;
        window.parent.location.href = "/#/usershow";
    }

    // 获得网站成员列表
    $scope.getUserList = function (page) {
        if (!util.pagination(page, $scope.requestParams, $scope.userObj && $scope.userObj.pageCount)) {
            return; // 未翻页直接返回
        }
        // 获取全部作品列表
        util.http("POST", config.apiUrlPrefix + "website_member/getByWebsiteId", $scope.requestParams, function (data) {
            $scope.userObj = data;
        });
    }

    function init() {
        var moduleParams = window.moduleObj.moduleParams;
        moduleParams.type = moduleParams.type || "all";

        $scope.title = moduleParams.title || "成员信息";
        console.log($scope.title);

        $scope.requestParams.pageSize = moduleParams.pageSize || 6;
        $scope.requestParams.websiteId = $scope.siteinfo._id;
        if (moduleParams.type == "all") {
            $scope.requestUrl = config.apiUrlPrefix + "website_member/getByWebsiteId";
        } else if (moduleParams.type == "judge") {
            $scope.requestUrl = config.apiUrlPrefix + "website_member/getJudgeListByWebsiteId";
        }

        $scope.getUserList();
    }

    init();
});