define([
    'app',
    'text!mod/modelshare/html/share.html',
], function (app, htmlContent) {
    app.controller('shareController', ['$scope' , '$http' , function ($scope,$http) {
        $scope.modName = "example";
		$http({
				method: 'GET',
				url: 'http://keepwork.com/api/wiki/models/user_fans/isAttented'
			}).then(function successCallback(response) {
					console.log(response)
					$scope.myWelcome = response.data.error.message
					
				});
        $scope.set = function (params) {
            $scope.divVar = params;
        };


        $scope.clickStart = function(index) {
            $scope.clearStart();
            for (var i = 1; i <= index; i++) {
                var span = document.getElementById('start' + i);
                span.innerHTML = '★';
            }

        }


        $scope.clearStart = function() {
            for (var i = 1; i <= 5; i++) {
                var span = document.getElementById('start' + i);
                span.innerHTML = '☆';
            }

        } 
    }]);

    return htmlContent;
});

