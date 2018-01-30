
define([
    'app',
    'helper/util',
    'helper/storage',
    'text!wikimod/wiki/html/workslist.html',
], function (app, util, storage, htmlContent) {

    function getModParams(wikiblock) {
        var modParams = wikiblock.modParams || storage.sessionStorageGetItem("wikiModParams") || {};
        return angular.copy(modParams);
    }

    function registerController(wikiBlock) {
        app.registerController("workslistController", ['$rootScope', '$scope','Account','Message',function ($rootScope, $scope, Account, Message) {
            var modParams = getModParams(wikiBlock);
            var userinfo = $rootScope.userinfo;
            var siteinfo = $rootScope.siteinfo;
            var moreUrl = siteinfo ? "/" + siteinfo.username + "/" + siteinfo.name + "/more" : "";
            var module = storage.sessionStorageGetItem("module");

            if (module && isMorePage()){
                modParams.type = module.type || "all";
                modParams.title = module.title || "全部作品";
                modParams.pagination = true;
            }

            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.requestUrl = config.apiUrlPrefix + "website_works/getByWebsiteId";
            $scope.currentPage = 1;
            $scope.pageSize = modParams.pageSize || 3;
            $scope.requestParams = {pageSize: $scope.pageSize};

            $scope.modParams = modParams;

            $scope.sitePageChanged = function () {
                $scope.getList();
            };

            $scope.goUserPage = function (work) {
                util.goUserSite('/' + work.worksUsername, true);
            };

            // 收藏作品
            $scope.worksFavorite=function (event, site) {
                Message.info("开发中");
            };

            $scope.getList = function () {
                $scope.requestParams.page = $scope.currentPage;

                util.http("POST", $scope.requestUrl, $scope.requestParams, function (data) {
                    data = data || {};
                    if (modParams.moduleKind == "personal") {
                        $scope.siteList = data;
                        $scope.siteTotal = data.length;
                    } else {
                        $scope.worksList = data.worksList;
                        $scope.worksTotal = data.total || 0;
                    }
                });
            };

            $scope.goMore = function (mod) {
                storage.sessionStorageSetItem("module", mod);
                util.go(moreUrl);
            };

            function isMorePage() {
                return window.location.pathname == moreUrl;
            }

            function init() {
                var pageSize = parseInt(modParams.pageSize || "3");
                pageSize = pageSize < 1 ? 1 : pageSize;
                $scope.requestParams.pageSize = pageSize;

                //console.log(moduleParams);
                $scope.title = modParams.title || "全部作品";
                if (modParams.moduleKind == "personal") {
                    if (modParams.type == "all") {   // 全部
                        $scope.requestUrl = config.apiUrlPrefix + "website/getAllByUsername";
                        $scope.requestParams.username = siteinfo.username;
                    }
                } else if (modParams.moduleKind == "organization" || modParams.moduleKind == "game") {
                    if (modParams.type == "all") {   // 全部
                        $scope.requestUrl = config.apiUrlPrefix + "website_works/getByWebsiteId";
                        $scope.requestParams.websiteId = siteinfo._id;
                    } else if (modParams.type == "custom") {  // 推荐
                        $scope.requestUrl = config.apiUrlPrefix + 'website_works/getByWorksUrlList';
                        $scope.requestParams.worksUrlList = modParams.worksUrlList || [];
                        $scope.requestParams.websiteId = siteinfo._id;
                    } else if (modParams.type == "latestJoin") {  // 推荐
                        $scope.requestUrl = config.apiUrlPrefix + 'website_works/getLatestByWebsiteId';
                        $scope.requestParams.websiteId = siteinfo._id;
                    }
                    /*
                    else if (moduleParams.type == "latestUpdate") { // 最近更新
                        $scope.requestUrl = config.apiUrlPrefix + "website_renewal";
                        $scope.requestParams.websiteId = $scope.siteinfo._id;
                    } else if (moduleParams.type == "latestNew") {  // 最近加入
                        $scope.requestUrl = config.apiUrlPrefix + "website_works/getLatestByWebsiteId";
                        $scope.requestParams.websiteId = $scope.siteinfo._id;
                    } else if (moduleParams.type == "favorite") {   // 我的收藏
                        $scope.requestUrl = config.apiUrlPrefix + "user_favorite/getFavoriteWebsiteListByUserId";
                        $scope.requestParams.userId = $scope.userinfo._id;
                    } else if (moduleParams.type == "hot") { // 热门精选
                        $scope.requestUrl = config.apiUrlPrefix + "website_works/getHotByWebsiteId";
                        $scope.requestParams.websiteId = $scope.siteinfo._id;
                    } else if (moduleParams.type == "upgrade") {  // 入围作品
                        $scope.requestUrl = config.apiUrlPrefix + "website_works/getUpgradeByWebsiteId";
                        $scope.requestParams.websiteId = $scope.siteinfo._id;
                    } else {
                        $scope.requestUrl = config.apiUrlPrefix + "website/getByUserId";
                        $scope.requestParams.userId = $scope.userinfo._id;
                    }
                    */
                }
                $scope.getList();
                if (module && !isMorePage()){
                    storage.sessionStorageRemoveItem("module");
                }
            }
            $scope.$watch("$viewContentLoaded", function () {
                if (userinfo && siteinfo) {
                    init();
                } else {
                    if (!modParams.username ||  !modParams.sitename) {
                        var urlObj = util.parseUrl();
                        modParams.username = urlObj.username;
                        modParams.sitename = urlObj.sitename;
                    }
                    util.post(config.apiUrlPrefix + "website/getUserSiteInfo", {username:modParams.username, sitename:modParams.sitename}, function (data) {
                        userinfo = data.userinfo;
                        siteinfo = data.siteinfo;
                        userinfo && siteinfo && init();
                    });
                }
            });

            $scope.goScroll = function (index) {
                var id = "featureList"+index;
                // console.log(id);
                document.getElementById(id).scrollIntoView();
            }

            $('.col-md-9').scrollspy({ target: '#scrollspy' });
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        }
    };
});

/*
```@wiki/js/workslist
{
    "moduleKind":"personal"
}
```
*/
/*
```@wiki/js/workslist
{
    "moduleKind":"organization",
    "pageSize":8,
    "type":"all",
    "title":"全部作品"
}
```
*/
/*
 ```@wiki/js/workslist
 {
 "moduleKind":"game",
 "pageSize": 4,
 "title":"全部作品",
 "type":"all",
 "moreLink":"http://www.baidu.com",
 "worksList":[
 {
 "workLink":"#",
 "imgUrl":"",
 "workName":"作品名",
 "authorLink":"#",
 "author":"作者",
 "info":"浏览量",
 "count":"5"
 },
 {
 "workLink":"#",
 "imgUrl":"",
 "workName":"作品名",
 "authorLink":"#",
 "author":"作者",
 "info":"浏览量",
 "count":"5"
 },
 {
 "workLink":"#",
 "imgUrl":"",
 "workName":"作品名",
 "authorLink":"#",
 "author":"作者",
 "info":"浏览量",
 "count":"5"
 },
 {
 "workLink":"#",
 "imgUrl":"",
 "workName":"作品名",
 "authorLink":"#",
 "author":"作者",
 "info":"浏览量",
 "count":"5"
 },
 {
 "workLink":"#",
 "imgUrl":"",
 "workName":"作品名",
 "authorLink":"#",
 "author":"作者",
 "info":"浏览量",
 "count":"5"
 }
 ]
 }
 ```
 */
/*
 ```@wiki/js/workslist
 {
 "moduleKind":"gameStatic",
 "title":"全部作品",
 "type":"all",
 "moreLink":"http://www.baidu.com",
 "worksList":[
 {
 "workLink":"#",
 "imgUrl":"",
 "workName":"作品名",
 "authorLink":"#",
 "author":"作者",
 "info":"浏览量",
 "count":"5"
 },
 {
 "workLink":"#",
 "imgUrl":"",
 "workName":"作品名",
 "authorLink":"#",
 "author":"作者",
 "info":"浏览量",
 "count":"5"
 },
 {
 "workLink":"#",
 "imgUrl":"",
 "workName":"作品名",
 "authorLink":"#",
 "author":"作者",
 "info":"浏览量",
 "count":"5"
 },
 {
 "workLink":"#",
 "imgUrl":"",
 "workName":"作品名",
 "authorLink":"#",
 "author":"作者",
 "info":"浏览量",
 "count":"5"
 },
 {
 "workLink":"#",
 "imgUrl":"",
 "workName":"作品名",
 "authorLink":"#",
 "author":"作者",
 "info":"浏览量",
 "count":"5"
 }
 ]
 }
 ```
 */
/*
```@wiki/js/workslist
{
"moduleKind":"gameDemo",
"title":"全部作品",
"moreLink":"http://www.baidu.com",
"worksList":[
    {
        "imgLink":"#",
        "imgUrl":"",
        "workLink":"#",
        "workName":"作品名",
        "authorLink":"#",
        "author":"作者"
    },
    {
        "imgLink":"#",
        "imgUrl":"",
        "workLink":"",
        "workName":"作品名",
        "authorLink":"",
        "author":"作者"
    },
    {
        "imgLink":"#",
        "imgUrl":"",
        "workLink":"",
        "workName":"作品名",
        "authorLink":"",
        "author":"作者"
    },
    {
        "imgLink":"#",
        "imgUrl":"",
        "workLink":"",
        "workName":"作品名",
        "authorLink":"",
        "author":"作者"
    }
]
}
```
*/
/*
 ```@wiki/js/workslist
 {
 "moduleKind":"featureList",
 "content":[
 {
    "title":"第一部分",
    "content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam eu sem tempor, varius quam at, luctus dui. Mauris magna metus, dapibus nec turpis vel, semper malesuada ante. Vestibulum id metus ac nisl bibendum scelerisque non non purus. Suspendisse varius nibh non aliquet sagittis. In tincidunt orci sit amet elementum vestibulum. Vivamus fermentum in arcu in aliquam. Quisque aliquam porta odio in fringilla. Vivamus nisl leo, blandit at bibendum eu, tristique eget risus. Integer aliquet quam ut elit suscipit, id interdum neque porttitor. Integer faucibus ligula. Vestibulum quis quam ut magna consequat faucibus. Pellentesque eget nisi a mi suscipit tincidunt. Ut tempus dictum risus. Pellentesque viverra sagittis quam at mattis. Suspendisse potenti. Aliquam sit amet gravida nibh, facilisis gravida odio. Phasellus auctor velit at lacus blandit, commodo iaculis justo viverra. Etiam vitae est arcu. Mauris vel congue dolor. Aliquam eget mi mi. Fusce quam tortor, commodo ac dui quis, bibendum viverra erat. Maecenas mattis lectus enim, quis tincidunt dui molestie euismod. Curabitur et diam tristique, accumsan nunc eu, hendrerit tellus."
 },
 {
 "title":"第一部分",
 "content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam eu sem tempor, varius quam at, luctus dui. Mauris magna metus, dapibus nec turpis vel, semper malesuada ante. Vestibulum id metus ac nisl bibendum scelerisque non non purus. Suspendisse varius nibh non aliquet sagittis. In tincidunt orci sit amet elementum vestibulum. Vivamus fermentum in arcu in aliquam. Quisque aliquam porta odio in fringilla. Vivamus nisl leo, blandit at bibendum eu, tristique eget risus. Integer aliquet quam ut elit suscipit, id interdum neque porttitor. Integer faucibus ligula. Vestibulum quis quam ut magna consequat faucibus. Pellentesque eget nisi a mi suscipit tincidunt. Ut tempus dictum risus. Pellentesque viverra sagittis quam at mattis. Suspendisse potenti. Aliquam sit amet gravida nibh, facilisis gravida odio. Phasellus auctor velit at lacus blandit, commodo iaculis justo viverra. Etiam vitae est arcu. Mauris vel congue dolor. Aliquam eget mi mi. Fusce quam tortor, commodo ac dui quis, bibendum viverra erat. Maecenas mattis lectus enim, quis tincidunt dui molestie euismod. Curabitur et diam tristique, accumsan nunc eu, hendrerit tellus."
 },
 {
 "title":"第一部分",
 "content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam eu sem tempor, varius quam at, luctus dui. Mauris magna metus, dapibus nec turpis vel, semper malesuada ante. Vestibulum id metus ac nisl bibendum scelerisque non non purus. Suspendisse varius nibh non aliquet sagittis. In tincidunt orci sit amet elementum vestibulum. Vivamus fermentum in arcu in aliquam. Quisque aliquam porta odio in fringilla. Vivamus nisl leo, blandit at bibendum eu, tristique eget risus. Integer aliquet quam ut elit suscipit, id interdum neque porttitor. Integer faucibus ligula. Vestibulum quis quam ut magna consequat faucibus. Pellentesque eget nisi a mi suscipit tincidunt. Ut tempus dictum risus. Pellentesque viverra sagittis quam at mattis. Suspendisse potenti. Aliquam sit amet gravida nibh, facilisis gravida odio. Phasellus auctor velit at lacus blandit, commodo iaculis justo viverra. Etiam vitae est arcu. Mauris vel congue dolor. Aliquam eget mi mi. Fusce quam tortor, commodo ac dui quis, bibendum viverra erat. Maecenas mattis lectus enim, quis tincidunt dui molestie euismod. Curabitur et diam tristique, accumsan nunc eu, hendrerit tellus."
 },
 {
 "title":"第一部分",
 "content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam eu sem tempor, varius quam at, luctus dui. Mauris magna metus, dapibus nec turpis vel, semper malesuada ante. Vestibulum id metus ac nisl bibendum scelerisque non non purus. Suspendisse varius nibh non aliquet sagittis. In tincidunt orci sit amet elementum vestibulum. Vivamus fermentum in arcu in aliquam. Quisque aliquam porta odio in fringilla. Vivamus nisl leo, blandit at bibendum eu, tristique eget risus. Integer aliquet quam ut elit suscipit, id interdum neque porttitor. Integer faucibus ligula. Vestibulum quis quam ut magna consequat faucibus. Pellentesque eget nisi a mi suscipit tincidunt. Ut tempus dictum risus. Pellentesque viverra sagittis quam at mattis. Suspendisse potenti. Aliquam sit amet gravida nibh, facilisis gravida odio. Phasellus auctor velit at lacus blandit, commodo iaculis justo viverra. Etiam vitae est arcu. Mauris vel congue dolor. Aliquam eget mi mi. Fusce quam tortor, commodo ac dui quis, bibendum viverra erat. Maecenas mattis lectus enim, quis tincidunt dui molestie euismod. Curabitur et diam tristique, accumsan nunc eu, hendrerit tellus."
 },
 {
 "title":"第一部分",
 "content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam eu sem tempor, varius quam at, luctus dui. Mauris magna metus, dapibus nec turpis vel, semper malesuada ante. Vestibulum id metus ac nisl bibendum scelerisque non non purus. Suspendisse varius nibh non aliquet sagittis. In tincidunt orci sit amet elementum vestibulum. Vivamus fermentum in arcu in aliquam. Quisque aliquam porta odio in fringilla. Vivamus nisl leo, blandit at bibendum eu, tristique eget risus. Integer aliquet quam ut elit suscipit, id interdum neque porttitor. Integer faucibus ligula. Vestibulum quis quam ut magna consequat faucibus. Pellentesque eget nisi a mi suscipit tincidunt. Ut tempus dictum risus. Pellentesque viverra sagittis quam at mattis. Suspendisse potenti. Aliquam sit amet gravida nibh, facilisis gravida odio. Phasellus auctor velit at lacus blandit, commodo iaculis justo viverra. Etiam vitae est arcu. Mauris vel congue dolor. Aliquam eget mi mi. Fusce quam tortor, commodo ac dui quis, bibendum viverra erat. Maecenas mattis lectus enim, quis tincidunt dui molestie euismod. Curabitur et diam tristique, accumsan nunc eu, hendrerit tellus."
 },
 {
 "title":"第一部分",
 "content":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam eu sem tempor, varius quam at, luctus dui. Mauris magna metus, dapibus nec turpis vel, semper malesuada ante. Vestibulum id metus ac nisl bibendum scelerisque non non purus. Suspendisse varius nibh non aliquet sagittis. In tincidunt orci sit amet elementum vestibulum. Vivamus fermentum in arcu in aliquam. Quisque aliquam porta odio in fringilla. Vivamus nisl leo, blandit at bibendum eu, tristique eget risus. Integer aliquet quam ut elit suscipit, id interdum neque porttitor. Integer faucibus ligula. Vestibulum quis quam ut magna consequat faucibus. Pellentesque eget nisi a mi suscipit tincidunt. Ut tempus dictum risus. Pellentesque viverra sagittis quam at mattis. Suspendisse potenti. Aliquam sit amet gravida nibh, facilisis gravida odio. Phasellus auctor velit at lacus blandit, commodo iaculis justo viverra. Etiam vitae est arcu. Mauris vel congue dolor. Aliquam eget mi mi. Fusce quam tortor, commodo ac dui quis, bibendum viverra erat. Maecenas mattis lectus enim, quis tincidunt dui molestie euismod. Curabitur et diam tristique, accumsan nunc eu, hendrerit tellus."
 }
 ]
 }
 ```
 */
