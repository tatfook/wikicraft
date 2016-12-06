
/**
 * Created by wuxiangan on 2016/9/26.
 */

app.controller('userpageCtrl', function ($scope, $rootScope, $state, $http, $compile, Account, SelfData) {
    // 获取页面
	util.setScope($scope);
    var sitename = SelfData.sitename;
	var urlObj = util.getLastUrlObj();

	function renderPage(){
		var moduleParser = new ModuleParser($scope);
		var md = window.markdownit({html:true});
		util.post(config.apiUrlPrefix + "website_pages/getWebsitePageByUrl", {url:SelfData.pageurl}, function(data){
			$scope.pageinfo = data
			var pageContent = data ? data.content : '<div>用户页丢失!!!</div>';
			// pageContent = md.render(pageContent);
			moduleParser.render(pageContent);
		});
	}

    function init() {
        // 获得用户信息
		if (!$scope.userinfo || !$scope.siteinfo || urlObj.sitename != SelfData.sitename) {
			util.http("POST", config.apiUrlPrefix + "user/getUserAndSiteBySitename", {sitename:sitename}, function (data) {
				$rootScope.userinfo = data.userinfo;
				$rootScope.siteinfo = data.siteinfo;
				renderPage();		
			});
		}else {
			renderPage();		
		}
    }

    init();
});
