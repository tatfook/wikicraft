/**
 * Created by wuxiangan on 2017/3/9.
 */


define(['app',
    'helper/util',
    'helper/storage',
    'helper/dataSource',
    'text!html/dataSource.html',
], function (app, util, storage,dataSource, htmlContent) {
    app.registerController('dataSourceController', ['$scope', 'Account', 'Message', 'github', function ($scope, Account, Message, github) {
        function init() {
            $scope.githubDS = $scope.user.githubDS;
            $scope.innerGitlab = dataSource.getDataSourceEnable('innerGitlab');
        }

        $scope.$watch('viewContentLoaded', init);

        $scope.githubDSChange = function () {
            if ($scope.githubDS) {
                Account.linkGithub();
            } else {
                Account.unlinkGithub();
            }
        }
        
        $scope.dataSourceChange = function (dsName) {
            if (dsName == "innerGitlab") {
                dataSource.setDataSourceEnable(dsName, $scope.innerGitlab);
                util.post(config.apiUrlPrefix + 'data_source/setDataSourceEnable', {userId:$scope.user._id, type:0, enable:$scope.innerGitlab ? 1 : 0});
            }
        }
    }]);

    return htmlContent;
});
