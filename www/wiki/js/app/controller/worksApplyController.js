/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app','helper/util', 'helper/storage', 'text!html/worksApply.html'], function (app, util, storage, htmlContent) {
    app.registerController('worksApplyController', ['$scope', 'Account',function ($scope, Account) {
        $scope.user = Account.getUser();
        $scope.worksSelected = [];
        $scope.submitDisabled = "";

        $scope.worksSelectChange = function () {
            // console.log($scope.worksSelected);
            $scope.worksSelected.length ? $("#submitId").removeAttr("disabled") : $("#submitId").attr({"disabled":"disabled"});
        };

        $scope.worksApply = function () {
            var websiteId = storage.sessionStorageGetItem("workApplyWebsiteId");
            var applyIdList = [];

            websiteId = parseInt(websiteId);
            for (i=0; i < $scope.worksSelected.length; i++) {
                applyIdList.push(parseInt($scope.worksSelected[i]));
            }
            var params = {
                userId:$scope.user._id,
                applyIdList:applyIdList,
                websiteId:websiteId,
            }
            util.http("POST", config.apiUrlPrefix + 'website_apply/worksBatchApply', params, function (data) {
                // console.log("投稿成功");
                Message.info("投稿成功");
                history.back();
            });
        }

        function init() {
            $("#submitId").attr({"disabled":"disabled"});
            util.http("POST", config.apiUrlPrefix + "website/getAllByUserId", {userId:$scope.user._id}, function (data) {
                $scope.siteList = data;
            });
        }

        init();
    }]);

    return htmlContent;
});