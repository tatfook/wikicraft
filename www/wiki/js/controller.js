/**
 * Created by wuxiangan on 2016/9/26.
 */

app.controller('mainCtrl', function ($scope, $rootScope, $http, $state, $compile, $auth, Account, SelfData, ProjectStorageProvider, Message) {
    /*配置一些全局服务*/
    util.setAngularServices({$http:$http, $state:$state, $compile:$compile, $auth:$auth});
    util.setSelfServices({Account:Account, ProjectStorageProvider:ProjectStorageProvider, SelfData: SelfData, Message:Message});

    if (Account.isAuthenticated()) {
        if (Account.isLoaded()) {
            $scope.user = Account.getUser();
        } else {
            Account.getProfile();
        }
    }
    console.log("mainCtrl");
	// 解析URL
	var hostname = window.location.hostname;
    var pathname = window.location.pathname;
    var hash = window.location.href;
    var sitename = hostname.match(/([\w]+)\.[\w]+\.[\w]+/);
    var pagename = 'index';

	// 排除IP访问
	if (hostname.split(':')[0].match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
		sitename = undefined;
	}

    if (sitename) {
        sitename = sitename[1];
        pagename = pathname.match(/^\/?([^\/]+)/);
        pagename = pagename ? pagename[1] : 'index';
    } else {
        sitename = pathname.match(/^\/?([^\/]+)\/?([^\/]*)/);  // 这里不会返回null
        pagename = sitename[2] || pagename;
        sitename = sitename[1]
    }
    SelfData.sitename = sitename;
    SelfData.pagename = pagename;
	SelfData.pageurl = "/" + sitename + '/' + pagename;
    // 初始化数据源
	var actionName = 'index.home';
	if (sitename != "wiki" && sitename != "wiki_new") {
        actionName = "index.userpage";
    }
	console.log(actionName);
	$state.go(actionName);
	return ;
  
});

app.controller('messageCtrl', function ($scope, Message) {
    $scope.hide = function () {
        Message.hide();
    };
});

app.controller('commentCtrl', function ($scope, Account) {
    $scope.user = Account.getUser();
    $scope.isAuthenticated = Account.isAuthenticated();
    //$scope.tipInfo = "登录后才能评论!!!";
    //$scope.comment = {pageId:$scope.pageinfo._id, websiteId:$scope.siteinfo._id, userId:$scope.user._id};
    $scope.comment = {pageId:1, websiteId:1, userId:1};

    $scope.submitComment = function () {
        $scope.isAuthenticated = true;
        if (!$scope.isAuthenticated) {
            alert("登陆后才能评论!!!")
            return ;
        }
        $scope.comment.content = util.stringTrim($scope.comment.content);
        if (!$scope.comment.content || $scope.comment.content.length == 0) {
            return ;
        }
        util.post(config.apiUrlPrefix + 'website_comment/create', $scope.comment, function (data) {
            console.log(data);
            $scope.getCommentList();
        });
    }

    $scope.getCommentList = function () {
        util.post(config.apiUrlPrefix + 'website_comment/getByPageId',{pageId:1}, function (data) {
            $scope.commentObj = data;
        });
    }
    
    $scope.deleteComment = function (comment) {
        util.post(config.apiUrlPrefix + 'website_comment/deleteById', comment, function (data) {
            $scope.getCommentList();
        })
    }

    function init() {
        $scope.getCommentList();
    }

    init();
});

app.controller('indexHeaderCtrl', function ($scope, $state, $auth, Account) {
    $scope.isLogin = Account.isAuthenticated();
    $scope.user = Account.getUser();

    $scope.goLoginPage = function () {
        $state.go("index.login");
    }

    $scope.goRegisterPage = function () {
        $state.go("index.home");
    }

    $scope.goHomePage = function () {
        $state.go("index.home");
    }

    $scope.goPersonalPage = function () {
        window.location.href = "/" + $scope.user.username;
    }
    $scope.logout = function () {
        $auth.logout();
        $scope.isLogin = false;
        $state.go("index.home");
    }

    $scope.$on("onUserProfile", function (event, user) {
        $scope.user = user;
    });

    $scope.$watch(Account.isAuthenticated, function (bAuthenticated) {
        $scope.isLogin = bAuthenticated;
    });
});

app.controller('siteshowCtrl', function ($scope, SelfData) {
    $scope.requestUrl = SelfData.requestUrl;
    $scope.requestParams = SelfData.requestParams || {pageSize:12};

    function init() {
        $scope.getSiteList();
    }

    $scope.getSiteList = function (page) {

        if (!util.pagination(page, $scope.requestParams, $scope.siteObj && $scope.siteObj.pageCount)) {
            return ;
        }

        var url = $scope.requestUrl || config.apiUrlPrefix + "website/getFavoriteSortList"; // 获得最近更新

        util.http("POST", url, $scope.requestParams, function (data) {
            $scope.siteObj = data;
        });
    }

    init();
});

app.controller('usershowCtrl', function ($scope, SelfData) {
    $scope.requestUrl = SelfData.requestUrl;
    $scope.requestParams = SelfData.requestParams || {};
    $scope.requestParams.pageSize = 12;

    function init() {
        $scope.getUserList();
    }

    $scope.getUserList = function (page) {
        if (!util.pagination(page, $scope.requestParams, $scope.userObj && $scope.userObj.pageCount)) {
            return ;
        }

        var url = $scope.requestUrl || config.apiUrlPrefix + "user/getByWebsiteId"; // 获得最近更新

        util.http("POST", url, $scope.requestParams, function (data) {
            $scope.userObj = data;
        });
    }
    init();
});
app.controller("worksApplyCtrl", function ($scope, $state, Account, SelfData) {
    $scope.user = Account.getUser();
    $scope.worksSelected = [];
    $scope.submitDisabled = "";
    $scope.worksSelectChange = function () {
        console.log($scope.worksSelected);
        $scope.worksSelected.length ? $("#submitId").removeAttr("disabled") : $("#submitId").attr({"disabled":"disabled"});
    }

    $scope.worksApply = function () {
        console.log("hello world");
        console.log($scope.user);
        console.log($scope.siteinfo);
        var applyIdList = [];
        for (i=0; i < $scope.worksSelected.length; i++) {
            applyIdList.push(parseInt($scope.worksSelected[i]));
        }
        var params = {
            userId:$scope.user._id,
            applyIdList:applyIdList,
            websiteId:$scope.siteinfo._id,
        }
        console.log(params);
        util.http("POST", config.apiUrlPrefix + 'website_apply/worksBatchApply', params, function (data) {

        });
    }

    function init() {
        $("#submitId").attr({"disabled":"disabled"});
        util.http("POST", config.apiUrlPrefix + "website/getAllByUserId", {userId:$scope.user._id}, function (data) {
            $scope.siteList = data;
        });
    }

    init();
});

app.controller("worksSiteCtrl", function ($scope, $state, SelfData){
    $scope.favoriteParams = {page:1, pageSize:6};
    $scope.favoriteObj = {};

    $scope.getRandomColor = function (index) {
        return util.getRandomColor(index);
    }

    // 更多我的收藏
    $scope.goAllFavoriteList = function () {
        SelfData.requestUrl =  config.apiUrlPrefix + "website/getFavoriteSortList";
        SelfData.requestParams = $scope.favoriteParams;
        $state.go("index.siteshow");
    }

    $scope.getFavoriteList = function (page) {
        $scope.favoriteParams.page = page ? (page > 0 ? page : 1) : $scope.favoriteParams.page;

        if ($scope.favoriteObj.pageCount && $scope.favoriteParams.page > $scope.favoriteObj.pageCount) {
            $scope.favoriteParams.page = $scope.favoriteObj.pageCount
        }
        var url = $scope.favoriteParams.url || config.apiUrlPrefix + "website/getFavoriteSortList"; // 获得最近更新

        util.http("POST", url, $scope.favoriteParams, function (data) {
            $scope.favoriteObj = data;
        });
    }

    function init() {
        $scope.getFavoriteList()
    }
    init();
});

app.controller("gameSiteCtrl", function ($scope, $state, SelfData) {
    $scope.upgradeParams = {pageSize:3,websiteId:$scope.siteinfo._id};
    $scope.latestParams = {pageSize:3,websiteId:$scope.siteinfo._id};
    $scope.allSiteParams = {pageSize:3,websiteId:$scope.siteinfo._id};
    $scope.judgeParams = {pageSize:6,websiteId:$scope.siteinfo._id};

    // worksApply
    $scope.goWorksApplyPage = function () {
        $state.go('index.worksApply');
    }

    // 随机颜色
    $scope.getRandomColor = function (index) {
        return util.getRandomColor(index);
    }

    // 更多入围作品
    $scope.goAllUpgradeList = function () {
        SelfData.requestUrl = config.apiUrlPrefix + "website_works/getUpgradeByWebsiteId";
        SelfData.requestParams = $scope.upgradeParams;
        $state.go("index.siteshow");
    }

    // 更多我的收藏
    $scope.goAllLatestList = function () {
        SelfData.requestUrl = config.apiUrlPrefix + "website_works/getLatestByWebsiteId";
        SelfData.requestParams = $scope.latestParams;
        $state.go("index.siteshow");
    }

    // 更多全部作品
    $scope.goAllSiteList = function () {
        SelfData.requestUrl = config.apiUrlPrefix + "website_works/getByWebsiteId";
        SelfData.requestParams = $scope.allSiteParams;
        $state.go("index.siteshow");
    }

    // 获得等多用户列表
    $scope.getAllUserList = function () {
        // TODO
    }
    // 获得入围作品
    $scope.getUpgradelList = function (page) {
        if (!util.pagination(page, $scope.upgradeParams, $scope.upgradeObj && $scope.upgradeObj.pageCount)) {
            return; // 未翻页直接返回
        }
        util.http("POST", config.apiUrlPrefix + "website_works/getUpgradeByWebsiteId", $scope.upgradeParams, function (data) {
            $scope.upgradeObj = data;
        });
    }

    // 获得最新上传
    $scope.getLatestList = function (page) {
        if (!util.pagination(page, $scope.latestParams, $scope.latestObj && $scope.latestObj.pageCount)) {
            return; // 未翻页直接返回
        }

        // 获取热门作品
        util.http("POST", config.apiUrlPrefix + "website_works/getLatestByWebsiteId", $scope.latestParams, function (data) {
            $scope.latestObj = data;
        });
    }

    // 获得全部作品
    $scope.getAllSiteList = function (page) {
        if (!util.pagination(page, $scope.allSiteParams, $scope.allSiteObj && $scope.allSiteObj.pageCount)) {
            return; // 未翻页直接返回
        }
        // 获取全部作品列表
        util.http("POST", config.apiUrlPrefix + "website_works/getByWebsiteId", $scope.allSiteParams, function (data) {
            $scope.allSiteObj = data;
        });
    }

    // 获得网站成员列表
    $scope.getJudgeList = function (page) {
        if (!util.pagination(page, $scope.judgeParams, $scope.judgeObj && $scope.judgeObj.pageCount)) {
            return; // 未翻页直接返回
        }
        // 获取全部作品列表
        util.http("POST", config.apiUrlPrefix + "website_member/getJudgeListByWebsiteId", $scope.judgeParams, function (data) {
            $scope.judgeObj = data;
        });
    }

    function init() {
        // 获取想管统计信息
        util.http("POST", config.apiUrlPrefix + 'website/getStatics', {websiteId:$scope.siteinfo._id}, function (data) {
            $scope.statics = data || {};
        });

        $scope.getUpgradelList();
        $scope.getLatestList();
        $scope.getAllSiteList();
    }

    init();
});

app.controller("organizationSiteCtrl", function ($scope, $state, SelfData) {
    $scope.renewalParams = {pageSize:3,websiteId:$scope.siteinfo._id};
    $scope.hotWorksParams = {pageSize:3,websiteId:$scope.siteinfo._id, worksFlag:2};
    $scope.allSiteParams = {pageSize:3,websiteId:$scope.siteinfo._id};
    $scope.userParams = {pageSize:6,websiteId:$scope.siteinfo._id};

    $scope.memberApply = function () {
        // 自己不能关注自己
        if ($scope.user._id == $scope.userinfo._id) {
            return ;
        }

        // 发送关注请求
        var params = {
            applyId:$scope.userinfo._id,
            websiteId: $scope.siteinfo._id,
        };
        util.http("POST", config.apiUrlPrefix + "website_apply/memberApply", params, function (data) {
            console.log(data);  // 申请成功
        });
    }

    // 随机颜色
    $scope.getRandomColor = function (index) {
        return util.getRandomColor(index);
    }

    // 更多最近更新
    $scope.goAllRenewalList = function () {
        SelfData.requestUrl = config.apiUrlPrefix + "website_renewal";
        SelfData.requestParams = $scope.renewalParams;
        $state.go("index.siteshow");
    }

    // 更多我的收藏
    $scope.goAllHotWorksList = function () {
        SelfData.requestUrl = config.apiUrlPrefix + "user_favorite/getFavoriteWebsiteListByUserId";
        SelfData.requestParams = $scope.hotWorksParams;
        $state.go("index.siteshow");
    }

    // 更多全部作品
    $scope.goAllSiteList = function () {
        SelfData.requestUrl = config.apiUrlPrefix + "website/getByUserId";
        SelfData.requestParams = $scope.allSiteParams;
        $state.go("index.siteshow");
    }

    // 获得等多用户列表
    $scope.getAllUserList = function () {
        // TODO
    }
    // 获得最近更新
    $scope.getRenewalList = function (page) {
        if (!util.pagination(page, $scope.renewalParams, $scope.renewalObj && $scope.renewalObj.pageCount)) {
            return; // 未翻页直接返回
        }
        util.http("POST", config.apiUrlPrefix + "website_renewal", $scope.renewalParams, function (data) {
            $scope.renewalObj = data;
        });
    }

    // 获得我的收藏
    $scope.getFavoriteList = function (page) {
        if (!util.pagination(page, $scope.hotWorksParams, $scope.hotWorksObj && $scope.hotWorksObj.pageCount)) {
            return; // 未翻页直接返回
        }

        // 获取热门作品
        util.http("POST", config.apiUrlPrefix + "website_works/getByWebsiteId", $scope.hotWorksParams, function (data) {
            $scope.hotWorksObj = data;
        });
    }

    // 获得全部作品
    $scope.getAllSiteList = function (page) {
        if (!util.pagination(page, $scope.allSiteParams, $scope.allSiteObj && $scope.allSiteObj.pageCount)) {
            return; // 未翻页直接返回
        }
        // 获取全部作品列表
        util.http("POST", config.apiUrlPrefix + "website_works/getByWebsiteId", $scope.allSiteParams, function (data) {
            $scope.allSiteObj = data;
        });
    }

    // 获得网站成员列表
    $scope.getUserList = function (page) {
        if (!util.pagination(page, $scope.userParams, $scope.userObj && $scope.userObj.pageCount)) {
            return; // 未翻页直接返回
        }
        // 获取全部作品列表
        util.http("POST", config.apiUrlPrefix + "website_member/getByWebsiteId", $scope.userParams, function (data) {
            $scope.userObj = data;
        });
    }
    function init() {
        // 获取想管统计信息
        util.http("POST", config.apiUrlPrefix + 'website/getStatics', {websiteId:$scope.siteinfo._id}, function (data) {
           $scope.statics = data || {};
        });

        $scope.getRenewalList()
    }
    
    init();
});

app.controller('personalSiteCtrl', function ($scope, $state, Account, SelfData) {
    $scope.user = Account.getUser();
    var sitename = SelfData.sitename;
    $scope.renewalParams = {pageSize:3,websiteId: $scope.siteinfo._id};
    $scope.favoriteParams = {pageSize:3,userId:$scope.userinfo._id};
    $scope.allSiteParams = {pageSize:3,userId:$scope.userinfo._id};


    // 显示全部作品
    $scope.showWorksList = function() {
        $('#worksListNavId').toggle();
    }
    // 去网站管理页
    $scope.goWebsiteMangerPage = function() {
        $state.go("index.website");
    }
    // 页面编辑页面
    $scope.goWebsitePageManagerPage = function() {
        window.location.href = "/wiki/editor";
    }

    // 随机颜色
    $scope.getRandomColor = function (index) {
        return util.getRandomColor(index);
    }

    // 更多最近更新
    $scope.goAllRenewalList = function () {
        SelfData.requestUrl = config.apiUrlPrefix + "website_renewal";
        SelfData.requestParams = $scope.renewalParams;
        $state.go("index.siteshow");
    }

    // 更多我的收藏
    $scope.goAllFavoriteList = function () {
        SelfData.requestUrl = config.apiUrlPrefix + "user_favorite/getFavoriteWebsiteListByUserId";
        SelfData.requestParams = $scope.favoriteParams;
        $state.go("index.siteshow");
    }

    // 更多全部作品
    $scope.goAllSiteList = function () {
        SelfData.requestUrl = config.apiUrlPrefix + "website/getByUserId";
        SelfData.requestParams = $scope.allSiteParamsl
        $state.go("index.siteshow");
    }

    // 获得最近更新
    $scope.getRenewalList = function (page) {
        if (!util.pagination(page, $scope.renewalParams, $scope.renewalObj && $scope.renewalObj.pageCount)) {
            return; // 未翻页直接返回
        }
        util.http("POST", config.apiUrlPrefix + "website_renewal", $scope.renewalParams, function (data) {
            $scope.renewalObj = data;
        });
    }

    // 获得我的收藏
    $scope.getFavoriteList = function (page) {
        if (!util.pagination(page, $scope.favoriteParams, $scope.favoriteObj && $scope.favoriteObj.pageCount)) {
            return; // 未翻页直接返回
        }

        // 获取我的收藏
        util.http("POST", config.apiUrlPrefix + "user_favorite/getFavoriteWebsiteListByUserId", $scope.favoriteParams, function (data) {
            $scope.favoriteObj = data;
        });
    }
    
    // 获得全部作品
    $scope.getAllSiteList = function (page) {
        if (!util.pagination(page, $scope.allSiteParams, $scope.allSiteObj && $scope.allSiteObj.pageCount)) {
            return; // 未翻页直接返回
        }
        // 获取全部作品列表
        util.http("POST", config.apiUrlPrefix + "website/getByUserId", $scope.allSiteParams, function (data) {
            $scope.allSiteObj = data;
        });
    }

    $scope.attention = function () {
        // 自己不能关注自己
        if ($scope.user._id == $scope.userinfo._id) {
            return ;
        }

        // 发送关注请求
        var params = {
            favoriteUserId:$scope.userinfo._id,
            favoriteWebsiteId: $scope.siteinfo._id,
            userId:$scope.user._id,
        };
        util.http("POST", config.apiUrlPrefix + "user_favorite/favoriteUser", params, function (data) {
            console.log(data);  // 申请成功
        });
    }
    

    function init() {
        util.http("POST", config.apiUrlPrefix + "website",{}, function (data) {
            $scope.websiteList = data || [];
        });

        $scope.getRenewalList();
        $scope.getFavoriteList();
        $scope.getAllSiteList();
    }

    init();
});

app.controller('homeCtrl', function ($scope, $rootScope, $state, $auth, Account, SelfData) {
    $scope.siteParams = {page:1, pageSize:3};
    $scope.userParams = {page:1, pageSize:3};
    $scope.userObj = {};
    $scope.siteObj = {};

    $scope.getRandomColor = function (index) {
        return util.getRandomColor(index);
    }

    // 更多我的收藏
    $scope.goAllWorksList = function () {
        SelfData.requestUrl =  config.apiUrlPrefix + "website/getFavoriteSortList";
        SelfData.requestParams = $scope.siteParams;
        $state.go("index.siteshow");
    }

    // 更多我的收藏
    $scope.goAllUserList = function () {
        SelfData.requestUrl = config.apiUrlPrefix + "user/getFavoriteSortList";
        SelfData.requestParams = $scope.userParams;
        $state.go("index.usershow");
    }

    $scope.getWorksList = function (page) {
        $scope.siteParams.page = page ? (page > 0 ? page : 1) : $scope.siteParams.page;

        if ($scope.siteObj.pageCount && $scope.siteParams.page > $scope.siteObj.pageCount) {
            $scope.siteParams.page = $scope.siteObj.pageCount
        }
        var url = $scope.siteParams.url || config.apiUrlPrefix + "website/getFavoriteSortList"; // 获得最近更新

        util.http("POST", url, $scope.siteParams, function (data) {
            $scope.siteObj = data;
        });
    }

    $scope.getUserList = function (page) {
        $scope.userParams.page = page ? (page > 0 ? page : 1) : $scope.userParams.page;

        if ($scope.userObj.pageCount && $scope.userParams.page > $scope.userObj.pageCount) {
            $scope.userParams.page = $scope.userObj.pageCount
        }

        var url = $scope.userParams.url || config.apiUrlPrefix + "user/getFavoriteSortList"; // 获得最近更新

        util.http("POST", url, $scope.userParams, function (data) {
            $scope.userObj = data;
        });
    }

    function init() {
        // 获得网站统计信息
        util.http("POST", config.apiUrlPrefix + "wikicraft/getStatics",{}, function (data) {
            $scope.wikicraft = data || {}
        });

        $scope.getWorksList();
        $scope.getUserList();
    }

    $scope.register = function(){
        $scope.errMsg="";
        var params = {
            username:util.stringTrim($scope.username),
            email:util.stringTrim($scope.email),
            cellphone:util.stringTrim($scope.cellphone),
            password:util.stringTrim($scope.password),
        };
        console.log(params);
        if (!params.username || params.username.length == 0 || !params.password || params.password == 0){
            $scope.errMsg = "用户名，密码为必填字段";
            return ;
        }
        if (!params.username.match(/[\d\w_]{3,20}/)){
            $scope.errMsg = "用户名格式错误，应由3-20数字或字母或下划线组成";
            return;
        }
        if (!params.email) {
            $scope.errMsg = "邮箱格式错误"
            return;
        }
        if (params.password.length < 4 || params.password.length > 20) {
            $scope.errMsg = "密码格式错误"
        }
        util.http("POST", config.apiUrlPrefix + "user/register", params, function (data) {
            console.log("注册成功")
            $auth.setToken(data.token);
            Account.setUser(data.userInfo);
			if (!data.userInfo.githubToken) {
				Account.githubAuthenticate();
			} else {
				$state.go("index.home");
			}
        },function (error) {
            $scope.errMsg = error.message;
        });
    }

    init();
});

app.controller('testCtrl', function ($scope, $rootScope, $state, $http, $compile) {
    var md = window.markdownit({html:true});
    var result = md.render('# markdown-it rulezz!  <div>hello world</div><script></script>');
    console.log(result);
});



app.controller('indexCtrl', function ($scope,$state, $sce, $auth) {

});

app.controller('editWebsiteCtrl', function ($scope, $state, ProjectStorageProvider, SelfData) {
    const github = ProjectStorageProvider.getDataSource('github');
    $scope.tags=["tag1","tag2"];
    $scope.classifyList = ["普通","入围","热门"];
    $scope.roleList = [{id:1, name:"普通"},{id:10, name:"评委"}];

    var siteinfo = SelfData.website || {_id:1};

    $('#uploadPictureBtn').change(function (e) {
        console.log("hello world")
        return ;
        var fileReader = new FileReader();
        fileReader.onload = function(){
            github.uploadImage("portrait", fileReader.reault, function (error, result, request) {
                if (error) {
                    console.log("上传失败");
                    return ;
                }
                $scope.website.logoUrl = result.content.download_url;
                $('#websiteLogo').attr('src',fileReader.result);
            });
        };
        fileReader.readAsDataURL(e.target.files[0]);
    });
    
    $scope.roleSelect = function (userinfo) {
        userinfo.roleInfo.roleId = parseInt(userinfo.roleInfo.roleUIIndex);
        userinfo.roleInfo.roleId = $scope.roleList[userinfo.roleInfo.roleId].id;
        var role = angular.copy(userinfo.roleInfo);
        role.roleUIIndex = undefined;
        util.post(config.apiUrlPrefix + 'website_member/updateById', {_id:role._id, roleId:role.roleId}, function (data) {
            console.log(data);
        });
    }

    $scope.getRoleName = function (roleId) {
        for (i = 0; i < $scope.roleList.length; i++) {
            if ($scope.roleList[i].id == roleId) {
                return $scope.roleList[i].name;
            }
        }
        return "";
    }
    $scope.classifySelect = function (site) {
        site.classifyInfo.worksFlag = parseInt(site.classifyInfo.worksFlag);
        util.post(config.apiUrlPrefix + 'website_works/updateById', {_id:site.classifyInfo._id, worksFlag:site.classifyInfo.worksFlag}, function (data) {
            console.log(data);
        });
    }
    
    $scope.getClassifyName = function (worksFlag) {
        return $scope.classifyList[worksFlag];
    }

    $scope.addTag = function (tagName) {
        tagName = util.stringTrim(tagName);
        if (!tagName || $scope.tags.indexOf(tagName) >= 0) {
            return;
        }
        $scope.tags.push(tagName);
        $scope.website.tags = $scope.tags.join('|');
    }

    $scope.removeTag = function (tagName) {
        var index = $scope.tags.indexOf(tagName);
        if (index >= 0) {
            $scope.tags.splice(index, 1);
        }
        $scope.website.tags = $scope.tags.join('|');
    }
    
    $scope.modifyWebsite = function () {
        util.post(config.apiUrlPrefix + 'website/updateWebsite', $scope.website, function (data) {
           $scope.website = data;
        });
    }

    $scope.agreeMember = function (applyId) {
        util.post(config.apiUrlPrefix + 'website_apply/agreeMember',{applyId:applyId, websiteId:siteinfo._id}, function (data) {
            $scope.userObj = data;
        });
    }

    $scope.refuseMember = function (applyId) {
        util.post(config.apiUrlPrefix + 'website_apply/refuseMember',{applyId:applyId, websiteId:siteinfo._id}, function (data) {
            $scope.userObj = data;
        })
    }

    $scope.memberManager = function () {
        util.post(config.apiUrlPrefix + 'website_apply/getMember', {websiteId:siteinfo._id}, function (data) {
            $scope.userObj = data;
        });
        
        util.post(config.apiUrlPrefix + 'website_member/getByWebsiteId', {websiteId:siteinfo._id}, function (data) {
           $scope.userRoleObj = data;
        });
    }

    $scope.worksManager = function () {
        util.post(config.apiUrlPrefix + 'website_apply/getWorks', {websiteId:siteinfo._id}, function (data) {
           $scope.siteObj = data;
        });

        util.post(config.apiUrlPrefix + 'website_works/getByWebsiteId', {websiteId:siteinfo._id}, function (data) {
           $scope.worksObj = data;
        });
    }
    
    $scope.agreeWorks = function (applyId) {
        util.post(config.apiUrlPrefix + 'website_apply/agreeWorks',{applyId:applyId, websiteId:siteinfo._id}, function (data) {
            $scope.siteObj = data;
        });
    }
    
    $scope.refuseWorks = function (applyId) {
        util.post(config.apiUrlPrefix + 'website_apply/refuseWorks',{applyId:applyId, websiteId:siteinfo._id}, function (data) {
            $scope.siteObj = data;
        })
    }

    function init() {
        util.post(config.apiUrlPrefix + 'website/getById', {websiteId:1}, function (data) {
            $scope.website = data;
            $scope.tags = $scope.website.tags ? $scope.website.tags.split('|') : [];
        });
    }

    init();
});

app.controller('gitVersionCtrl', function ($scope, $state, $sce, $auth,ProjectStorageProvider,Account) {
    const github = ProjectStorageProvider.getDataSource('github');
    console.log("gitVersionCtrl");
    $scope.dtStartOpened = false;
    $scope.dtEndOpened = false;
    $scope.filelist = [];
    $scope.commits = [];

    if (!Account.isAuthenticated()) {
        $state.go("index.login");
        return;
    }
    var user = Account.getUser();
    github.init({
        //username: '765485868@qq.com',
        //password: 'wxa765485868',
        token:user.githubToken,
    }, function (error) {
        init();
    });
    // 获得git文件列表
    function init() {
        github.getTree('master', true, function (error, result, request) {
            var filelist = []
            for(var i = 0; result && i < result.length; i++) {
                filelist.push({path:result[i].path});
            }
            $scope.filelist = filelist;
        });
    }

    $scope.dtStartOpen = function () {
        $scope.dtStartOpened = !$scope.dtStartOpened;
    }
    $scope.dtEndOpen = function () {
        $scope.dtEndOpened = !$scope.dtEndOpened;
    }

    $scope.submit = function () {
        var params = {
            sha:$scope.sha,
            path:$scope.path,
            author:undefined,
            since:$scope.dtStart && ($scope.dtStart.toLocaleDateString().replace(/\//g,'-') +'T00:00:00Z'),
            until:$scope.dtEnd && ($scope.dtEnd.toLocaleDateString().replace(/\//g,'-') +'T23:59:59Z'),
        };
        console.log(params);
        github.listCommits(params, function (error, result, request) {
            result = result || [];
            var commits = [];
            for (var i = 0; i < result.length; i++) {
                commits.push({sha:result[i].sha, message:result[i].commit.message, date:result[i].commit.committer.date, html_url:result[i].html_url});
            }
            console.log(commits);
            $scope.commits = commits;
            $scope.$apply();
        });
    }
    
    $scope.viewCommit = function (commit) {
        window.open(commit.html_url);
    }
    
    $scope.rollbackFile = function (commit) {
        github.getSingleCommit(commit.sha, function (error, result, request) {
            if (error) {
                console.log(error);
                return;
            }
            console.log(result);
            // 回滚文件
            for(var i = 0; i < result.files.length; i++) {
                github.rollbackFile(commit.sha, result.files[i].filename, 'rollback file: ' + result.files[i].filename)
            }
        });
    }
    // 路径过滤
    $scope.pathSelected =function ($item, $model) {
        $scope.path = $item.path;
    }
});

app.controller('websiteCtrl', function ($scope,$state,$http, Account, SelfData) {
    $scope.websites = [];
    $scope.max_free_count = 3;

    getWebsistes();
    function getWebsistes() {
        // 获取项目列表
        util.http('POST', config.apiUrlPrefix+'website',{userId:Account.getUser()._id || -1}, function (data) {
            $scope.websites = data;
        });
    }

    // 访问网站
    $scope.goWebsiteIndexPage = function(websiteName) {
        SelfData.pageUrl = websiteName + '/index';
        SelfData.sitename = websiteName;
        SelfData.pagename = 'index';
        //$state.go('index.userpage');
	    window.location.href= '/' + websiteName;
    }

    // 编辑网站页面
	$scope.goEditWebsitePagePage = function (website) {
        SelfData.website = website;
        //$state.go('index.editor');
        window.location.href="/wiki/editor";
    }

    //  创建网站
    $scope.goCreateWebsitePage = function () {
        SelfData.website = undefined;
        $state.go('index.createWebsite');
    }

    // 编辑网站
    $scope.goEditWebsitePage = function (website) {
        SelfData.website = website;
        $state.go('index.editWebsite');
    }

    // 删除网站
    $scope.deleteWebsite = function(id) {
        util.http("DELETE", config.apiUrlPrefix+'website', {_id:id}, function (data) {
            $scope.websites = data;
        });
    }
});

app.controller('createWebsiteCtrl', function ($scope, $state, $http, $sce, SelfData, ProjectStorageProvider, Account) {
    const github = ProjectStorageProvider.getDataSource('github');
    $scope.website = SelfData.website || {};
    $scope.editWebsite = SelfData.website ? true : false;
    $scope.websiteNameErrMsg = "";
    $scope.websiteDomainErrMsg = "";
    $scope.errMsg = "";
    $scope.tags = $scope.website.tags ? $scope.website.tags.split('|') : [];
    $scope.commonTags = ['旅游', '摄影', 'IT', '游戏', '生活']
    $scope.categories = [];//[{name:'个人网站'},{name:'作品网站'},{name:'组织网站'}];
    $scope.subCategories = [];
    $scope.step = 1;
    $scope.nextStepDisabled = !$scope.website.name;
    $scope.isPreview = true;
    config.templateObject = {executeTemplateScript:false};
    var logoContent = undefined;
    init();
/*
    $('#uploadImageBtn').change(function (e) {
        var fileReader = new FileReader();
        fileReader.onload = function(){
            $('#websiteLogo').attr('src',fileReader.result);
            logoContent = fileReader.result;
        };
        fileReader.readAsDataURL(e.target.files[0]);
    });
*/
    function init() {
        //util.http('POST', config.apiUrlPrefix+'website_category',{}, function (data) {
        util.http('POST', config.apiUrlPrefix+'website_template_config',{}, function (data) {
            $scope.categories = data;
            for (var i = 0; $scope.categories && i < $scope.categories.length; i++){
                var cateory  = $scope.categories[i];
                for (var j = 0; j < cateory.templates.length; j++) {
                    var template = cateory.templates[j];
                    template.content = $sce.trustAsHtml(template.content);
                    for (var k = 0; k < template.styles.length; k++) {
                        var style = template.styles[k];
                        style.content = $sce.trustAsHtml(style.content);
                    }
                }
                if ($scope.website.categoryId == $scope.categories[i]._id) {
                    $scope.templates = $scope.categories[i].templates;
                }
            }

            for (var i = 0; $scope.templates && i < $scope.templates.length; i++) {
                if ($scope.website.templateId == $scope.templates[i]._id) {
                    $scope.styles = $scope.templates[i].styles;
                    break;
                }
            }
			
			if ($scope.editWebsite == false) {  // 创建时默认选择第一个
				$scope.templates = $scope.categories[0].templates;
				$scope.styles = $scope.templates[0].styles;
				$scope.website.categoryId = $scope.categories[0]._id;
				$scope.website.categoryName = $scope.categories[0].name;
				$scope.website.templateId = $scope.templates[0]._id;
				$scope.website.templateName = $scope.templates[0].name;
				$scope.website.styleId = $scope.styles[0]._id;
				$scope.website.styleName = $scope.styles[0].name;
			}
        });
    }

    function  createWebsiteRequest() {
        $scope.website.userId = Account.getUser()._id;
        $scope.website.username = Account.getUser().username;

        var url = config.apiUrlPrefix + "website";
        console.log($scope.website);

        if (!$scope.editWebsite) {
            url += '/new';
        }

        util.http('PUT', url, $scope.website, function (data) {
            $scope.step++;
        });
    }

    $scope.selectCategory = function (category) {
        $scope.templates = category.templates;
        $scope.styles = category.templates[0].styles;
        $scope.website.categoryId = category._id;
        $scope.website.categoryName = category.name;
        $scope.website.templateId = $scope.templates[0]._id;
        $scope.website.templateName = $scope.templates[0].name;
        $scope.website.styleId = $scope.styles[0]._id;
        $scope.website.styleName = $scope.styles[0].name;
        $scope.nextStepDisabled = false;
    }

    $scope.selectTemplate = function (template) {
        $scope.styles = template.styles;
        $scope.website.templateId = template._id;
        $scope.website.templateName = template.name;
        $scope.website.styleId = $scope.styles[0]._id;
        $scope.website.styleName = $scope.styles[0].name;
        $scope.nextStepDisabled = false;
    }

    $scope.selectStyle = function (style) {
        $scope.website.styleId = style._id;
        $scope.website.styleName = style.name;
        $scope.nextStepDisabled = false;
    }

    $scope.addTag = function (tagName) {
        tagName = util.stringTrim(tagName);
        if (!tagName || $scope.tags.indexOf(tagName) >= 0) {
            return;
        }
        $scope.tags.push(tagName);
        $scope.website.tags = $scope.tags.join('|');
    }
    
    $scope.removeTag = function (tagName) {
        var index = $scope.tags.indexOf(tagName);
        if (index >= 0) {
            $scope.tags.splice(index, 1);
        }
        $scope.website.tags = $scope.tags.join('|');
    }

    $scope.checkWebsiteName = function () {
        if (!$scope.website.name || $scope.website.name.replace(/(^\s*)|(\s*$)/g, "") == "") {
            $scope.nextStepDisabled = $scope.websiteDomainErrMsg;
            $scope.websiteNameErrMsg = "";
            return;
        }

        $scope.website.name = $scope.website.name.replace(/(^\s*)|(\s*$)/g, "");

        util.http('POST', config.apiUrlPrefix+'website', {name:$scope.website.name}, function (data) {
            if (data && data.length > 0 && $scope.website._id != data[0]._id) {
                $scope.websiteNameErrMsg = $scope.website.name + "已存在，请换个名字";
                $scope.nextStepDisabled = true;
            } else {
                $scope.websiteNameErrMsg = "";
                $scope.nextStepDisabled = $scope.websiteDomainErrMsg;
            }
        });
    }

    $scope.checkWebsiteDomain = function () {
        if (!$scope.website.domain || $scope.website.domain.replace(/(^\s*)|(\s*$)/g, "") == "") {
            $scope.nextStepDisabled = $scope.websiteNameErrMsg;
            $scope.websiteDomainErrMsg = "";
            return;
        }

        $scope.website.domain = $scope.website.domain.replace(/(^\s*)|(\s*$)/g, "");
        util.http('POST', config.apiUrlPrefix+'website', {domain:$scope.website.domain}, function (data) {
            if (data && data.length > 0 && $scope.website._id != data[0]._id) {
                $scope.websiteDomainErrMsg = $scope.website.domain + "已存在，请换个名字";
                $scope.nextStepDisabled = true;
            } else {
                $scope.websiteDomainErrMsg = "";
                $scope.nextStepDisabled = $scope.websiteNameErrMsg;
            }
        });
    }

    $scope.nextStep = function () {
        $scope.errMsg = "";
        if ($scope.step == 1) {
            if (!$scope.website.name) {
                $scope.errMsg = "站点名为必填字段";
                return ;
            }
            if ($scope.websiteNameErrMsg || $scope.websiteUrlErrMsg) {
                $scope.errMsg = "请正确填写相关信息";
                return;
            }
        } else if ($scope.step == 2) {
            if ($scope.website.tags) {

            }
            $scope.nextStepDisabled = !$scope.website.templateId;
        } else if ($scope.step == 3) {
            if (!$scope.website.templateId) {
                $scope.errMsg = "请选择站点类型和模板";
                return ;
            }
            $scope.nextStepDisabled = !$scope.website.styleId;
        } else if ($scope.step == 4) {
            if (!$scope.website.styleId) {
                $scope.errMsg = "请选择模板样式";
            }
            createWebsiteRequest();
            return;
        } else {
            $state.go('index.website');
        }
        $scope.step++;
    }

    $scope.prevStep = function () {
        $scope.step--;
        $scope.nextStepDisabled = false;
    }


    $scope.goPreviewPage = function (style) {
        var url = window.location.href;
        var hash = window.location.hash;
        window.open(url.replace(hash, '') + '?' + style.filename + '#/preview');
    }

    // 访问网站
    $scope.goWebsiteIndexPage = function(websiteName) {
        SelfData.pageUrl = websiteName + '/index';
        SelfData.sitename = websiteName;
        SelfData.pagename = 'index';
        //$state.go('index.userpage');
        window.location.href= '/' + websiteName;
    }
});

app.controller('previewCtrl', function ($scope) {
    var filename = window.location.search.replace('?','');
    util.setScope($scope);
    // 获取页面
    var moduleParser = new ModuleParser($scope);
    util.http('POST', config.apiUrlPrefix+'website_template_config/getTemplatePageByFilename', {filename:filename}, function(data){
        // 获取页面中模板
        var pageContent = data;
        moduleParser.render(pageContent);
    })
});

