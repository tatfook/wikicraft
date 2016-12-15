/**
 * Created by wuxiangan on 2016/12/12.
 */

app.controller("gameStaticsCtrl", function ($scope) {
    function init() {
        util.http("POST", config.apiUrlPrefix + "website/getStatics",{websiteId:$scope.siteinfo._id}, function (data) {
            $scope.statics = data || [];
        });
    }
    init();
});