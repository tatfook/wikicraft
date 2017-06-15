/**
 * Created by wuxiangan on 2017/06/15.
 */

define(['app'], function (app) {
    app.factory("loadingInterceptor", [function () {
		var loadingInterceptor={
			httpCount:0,
		};

		loadingInterceptor.request = function(config) {
			loadingInterceptor.httpCount++;
			if (window.config.loading) {
				window.config.loading.show();
			}	
			//console.log(loadingInterceptor.httpCount);
			return config;
		}

		loadingInterceptor.response = function(response) {
			if (window.config.loading) {
				loadingInterceptor.httpCount--;
				loadingInterceptor.httpCount == 0 && window.config.loading.hide();
			}	
			//console.log(loadingInterceptor.httpCount);
			return response;
		}
		
        return loadingInterceptor;
    }]);
});
