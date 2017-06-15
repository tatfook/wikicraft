/**
 * Created by wuxiangan on 2017/06/15.
 */

define(['app'], function (app) {
    app.factory("loadingInterceptor", [function () {
		var loadingInterceptor={
			httpCount:0,
		};

		function showLoading() {
			loadingInterceptor.httpCount++;
			if (window.config.loading) {
				window.config.loading.show();
			}	
			//console.log(loadingInterceptor.httpCount);
		}

		function hideLoading() {
			if (window.config.loading) {
				loadingInterceptor.httpCount--;
				loadingInterceptor.httpCount == 0 && window.config.loading.hide();
			}	
			//console.log(loadingInterceptor.httpCount);
		}

		loadingInterceptor.request = function(config) {
			showLoading();
			return config;
		}

		loadingInterceptor.requestError = function(rejection) {
			hideLoading();
			return rejection;
		}
		
		loadingInterceptor.responseError= function(rejection) {
			hideLoading();
			return rejection;
		}

		loadingInterceptor.response = function(response) {
			hideLoading();
			return response;
		}
		
        return loadingInterceptor;
    }]);
});
