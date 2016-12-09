
/**
 * Created by wuxiangan on 2016/9/26.
 */

app.controller('usersiteCtrl', function ($scope, $rootScope, $state, $http, $compile, Account, SelfData) {
    console.log("usersiteCtrl");
	util.setScope($scope);
	$rootScope.IsRenderServerWikiContent = false;
	var moduleParser = new ModuleParser($scope);
	var md = window.markdownit({html:true});
    var lastUrlObj = util.getLastUrlObj();
	var urlObj = util.parseUrl();

	function renderPage(){
		var pageurl = '/' + urlObj.sitename + '/' + urlObj.pagename;
		/*
		$http.get('http://localhost:63342/html/xiaoyao/src/html/templates/test.html').then(function (response) {
			console.log(response.data);
			var pageContent = response.data;
			pageContent = md.render(pageContent);
			moduleParser.render(pageContent);
		});
		*/
		util.post(config.apiUrlPrefix + "website_pages/getWebsitePageByUrl", {url:pageurl}, function(data){
			$scope.pageinfo = data
			var pageContent = data ? data.content : '<div>用户页丢失!!!</div>';
			pageContent = md.render(pageContent);
			moduleParser.render(pageContent);
		});
	}

    function init() {
		console.log(urlObj);
		if (window.location.href.indexOf('#') >=0 || !urlObj.sitename || urlObj.sitename == "wiki" || urlObj.sitename == "wiki_new") {
			moduleParser.render("<div></div>");
			if (window.location.pathname == '/') {
				window.location.href="/#/home";
			} else if (window.location.hash){
				window.location.href="/" + window.location.hash;
			} else {
				$rootScope.IsRenderServerWikiContent = true;
			}
			return ;
		}
        // 获得用户信息
		if (!$scope.userinfo || !$scope.siteinfo || urlObj.sitename != lastUrlObj.sitename) {
			util.http("POST", config.apiUrlPrefix + "user/getUserAndSiteBySitename", {sitename:urlObj.sitename}, function (data) {
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
