
/**
 * Created by wuxiangan on 2016/9/26.
 */

app.controller('usersiteCtrl', function ($scope, $rootScope, $state, $http, $compile, Account, SelfData) {
    console.log("usersiteCtrl");
	util.setScope($scope);
	$rootScope.IsRenderServerWikiContent = false;
	var moduleParser = new ModuleParser($scope);
	var moduleIframeParser = new ModuleIframeParser();
	var md = window.markdownit({html:true});
    var lastUrlObj = util.getLastUrlObj();
	var urlObj = util.parseUrl();

	function renderPage(){
		var pageurl = '/' + urlObj.sitename + '/' + urlObj.pagename;
		/*
		 $http.get('http://localhost:8099/wiki/html/templates/test.html').then(function (response) {
			console.log(response.data);
			var pageContent = response.data;
			pageContent = md.render(pageContent);
			 util.setIframeParams({user:$rootScope.user, userinfo:$rootScope.userinfo, siteinfo:$rootScope.siteinfo, pageinfo:$rootScope.pageinfo});
			 moduleIframeParser.render(pageContent);
		});
		 */
		util.post(config.apiUrlPrefix + "website_pages/getWebsitePageByUrl", {url:pageurl}, function(data){
			$scope.pageinfo = data
			var pageContent = data ? data.content : '<div>用户页丢失!!!</div>';
			pageContent = md.render(pageContent);
			util.setIframeParams({user:$rootScope.user, userinfo:$rootScope.userinfo, siteinfo:$rootScope.siteinfo, pageinfo:$rootScope.pageinfo});
 			moduleIframeParser.render(pageContent);
		});
	}

    function init() {
		//console.log(window.IframeId);
		//console.log(window.location);
		if (window.location.href.indexOf('#') >=0 || !urlObj.sitename || urlObj.sitename == "wiki" || urlObj.sitename == "wiki_new") {
			moduleIframeParser.render("<div></div>");
			if (window.location.path != "/" && window.location.hash) {
				window.location.href="/" + window.location.hash;
			} else if (window.location.pathname == '/' && !window.location.hash) {
				window.location.href="/#/home";
			} else {
				$rootScope.IsRenderServerWikiContent = true;
			}
			console.log($rootScope.IsRenderServerWikiContent);
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
	if (Account.isAuthenticated()) {
		Account.ensureAuthenticated(init());
	} else {
		init();
	}
});
