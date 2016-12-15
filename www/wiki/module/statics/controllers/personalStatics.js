/**
 * Created by wuxiangan on 2016/12/12.
 */

app.controller("personalStaticsCtrl", function ($scope) {
    function init() {
        util.http("POST", config.apiUrlPrefix + "user/getStatics",{userId:$scope.userinfo._id}, function (data) {
            $scope.statics = data || [];
        });
    }
    init();
});