
app.controller("workslistCtrl", function ($scope) {
    $scope.requestUrl = config.apiUrlPrefix + "website_works/getByWebsiteId";
    $scope.requestParams = {pageSize:3, page:0, websiteId:$scope.siteinfo._id};

    $scope.getAllSiteList = function () {
        var siteshowObj = {};
        siteshowObj.requestUrl = $scope.requestUrl;
        siteshowObj.requestParams = $scope.requestParams;
        siteshowObj.title = $scope.title;
        window.parent.sessionStorage.setItem("siteshow", util.objectToJsonString(siteshowObj));
        window.parent.location.href = "/#/siteshow";
    }

    // 随机颜色
    $scope.getRandomColor = function (index) {
        return util.getRandomColor(index);
    }

    $scope.getSiteList = function (page) {
        if (!util.pagination(page, $scope.requestParams, $scope.siteObj && $scope.siteObj.pageCount)) {
            return ;
        }

        util.http("POST", $scope.requestUrl, $scope.requestParams, function (data) {
            $scope.siteObj = data;
        });
    }

    function init() {
        var moduleParams = window.moduleObj.moduleParams;
        var pageSize = moduleParams.pageSize || 3;
        pageSize = pageSize < 1 ? 1 : pageSize;
        var height = (200 + Math.floor((pageSize-1)/3) * 280) + "px";
        //console.log(height);
        $(".workslistNav").css("height",height);
        height = Math.ceil(pageSize/3) * 280 + "px";
        $(".workslist").css("height",height);
        $scope.requestParams.pageSize = pageSize;

        //console.log(moduleParams);
        $scope.title = moduleParams.title || "全部作品";
        if (moduleParams.type == "all") {
            $scope.requestUrl = config.apiUrlPrefix + "website_works/getByWebsiteId";
            $scope.requestParams.websiteId = $scope.siteinfo._id;
        } else if(moduleParams.type == "latestUpdate" ){
            $scope.requestUrl = config.apiUrlPrefix + "website_renewal";
            $scope.requestParams.websiteId = $scope.siteinfo._id;
        } else if(moduleParams.type == "latestNew" ){
            $scope.requestUrl = config.apiUrlPrefix + "website_works/getLatestByWebsiteId";
            $scope.requestParams.websiteId = $scope.siteinfo._id;
        } else if(moduleParams.type == "favorite") {
            $scope.requestUrl = config.apiUrlPrefix + "user_favorite/getFavoriteWebsiteListByUserId";
            $scope.requestParams.userId = $scope.userinfo._id;
        } else if(moduleParams.type == "hot") { // 热门精选
            $scope.requestUrl = config.apiUrlPrefix + "website_works/getHotByWebsiteId";
            $scope.requestParams.websiteId = $scope.siteinfo._id;
        } else if (moduleParams.type == "upgrade") {
            $scope.requestUrl = config.apiUrlPrefix +  "website_works/getUpgradeByWebsiteId";
            $scope.requestParams.websiteId = $scope.siteinfo._id;
        }
        $scope.getSiteList();
    }
    
    init();
});