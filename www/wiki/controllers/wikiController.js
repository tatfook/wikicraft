/**
Title: wiki rendering
Author: LiXizhi
Date: 2016.5.30
Reference:  https://developer.github.com/v3
*/

/**
* siteName, pageName, rootUrl should be filled on server side
*/
angular.module('MyApp')
.factory('WikiPage', function ($window, $uibModal, $http, $rootScope) {
    var siteInfo = $window.siteInfo || {};
    var WikiPage = {
        siteName: siteInfo.siteName,
        pageName: siteInfo.pageName,
        rootUrl: (siteInfo.rootUrl ? siteInfo.rootUrl : null),
        userid: (siteInfo.userid ? siteInfo.userid : null),
        pageExist: "loading",
        isSingleSite: siteInfo.isSingleSite,
        project_id: siteInfo.project_id,
        project_stars: siteInfo.stars,
        name: siteInfo.name,
        store: siteInfo.store,
        is_private: siteInfo.private,
        createdate: siteInfo.createdate,
        color: siteInfo.color,
        fork: siteInfo.fork,
        site_exist : (siteInfo.rootUrl ? true : false),
        is_stared: false,
    };
    WikiPage.send = function (msg, data) {
        $rootScope.$broadcast(msg, data);
    };
    WikiPage.ShowIndexBar =  function (bShow) {
        if (bShow) {
            $("#content").addClass("col-md-9");
            $("#indexbar").show();
        }
        else {
            $("#indexbar").hide();
            $("#content").removeClass("col-md-9");
            $("#content").addClass("col-md-12");
        }
    };
    // whether the web site exists
    WikiPage.siteExists = function () {
        return WikiPage.site_exist;
    }
    WikiPage.getOwnerId = function() {
        return WikiPage.userid;
    }
    WikiPage.hasOwner = function () {
        return (WikiPage.userid != null) ? true : false;
    }
    WikiPage.getSiteRoot = function () {
        return WikiPage.isSingleSite ? "/" : ("/" + this.getSiteName() + "/");
    };
    // preprocess to support wiki words like [[a|b]] and flash video [video](a.swf)
    WikiPage.preprocessMarkdown = function (data) {
        if (!data) {
            return
        }
        var newstr = data;
        var siteRoot = this.getSiteRoot();
        // [[a|b]] -->[a](b), and replace with wiki
        function replacer_1(match, p1, p2, offset, string) {
            return "[" + p1 + "](" + p2 + ")";
        }
        var re = /\[\[([^\|\]]+)\|([^\|\]]+)\]\]/g;
        newstr = newstr.replace(re, replacer_1);

        // [[a]] -->[a](a)
        function replacer_12(match, p1, offset, string) {
            var wiki = siteRoot + p1;
            var s = "[" + p1 + "](" + wiki + ")";
            return s;
        }
        var re = /\[\[([^\|\]]+)\]\]/g;
        newstr = newstr.replace(re, replacer_12);

        // [video](*.swf.*) --> <embed />
        function replace_video(match, p1, url, offset, string) {
            var s = "<span class='flashplayer'><embed src='" + url + "' type='application/x-shockwave-flash' width='750' height='540'></embed></span>"
            return s;
        }
        re = /\[([^\|\]]+)\]\(([^)]*\.swf[^)]*)\)/g;
        newstr = newstr.replace(re, replace_video);

        // []() --> []() with wikiword in our domain
        function replacer_2(match, p1, p2, offset, string) {
            var wiki = siteRoot + p2;
            var s = "[" + p1 + "](" + wiki + ")";
            return s;
        }
        re = /\[([^\|\]]+)\]\(([^\/\|\]\n]+)\)/g;
        newstr = newstr.replace(re, replacer_2);

        return newstr;
    };
    
    WikiPage.isOfficialSite = function() {
        return this.getSiteName() == "wiki";
    }
    WikiPage.getSiteName = function () {
        if (!this.siteName)
            this.siteName = (window.location.pathname.split("/")[1] || "Paracraft");
        return this.siteName;
    };
    WikiPage.getPageName = function () {
        if (!this.pageName)
            this.pageName = window.location.pathname.split("/")[2] || "Home";
        return this.pageName;
    };
    WikiPage.getProjId = function () {
        return this.project_id;
    };
    WikiPage.getStars = function () {
        return this.project_stars || 0;
    };
    WikiPage.getRootRawUrl = function () {
        // default to `SiteName/wiki` project
        // if (!this.rootUrl)
        //   this.rootUrl = ("https://raw.githubusercontent.com/wiki/" + this.getSiteName() + "/wiki/");
        return this.rootUrl;
    };
    WikiPage.getPageUrl = function () {
        if (!this.pageUrl)
            this.pageUrl = this.getRootRawUrl() + this.getPageName() + ".md";
        return this.pageUrl;
    };
    WikiPage.getSidebarUrl = function () {
        if (!this.sidebarUrl)
            this.sidebarUrl = this.getRootRawUrl() + "_Sidebar.md";
        return this.sidebarUrl;
    };
    WikiPage.isPageLoading = function () {
        return this.pageExist == "loading";
    }
    WikiPage.isPageExist = function () {
        return this.pageExist == "downloaded";
    }
    WikiPage.isStared = function () {
        return this.is_stared == true;
    }
    WikiPage.refreshIsStared = function () {
        $http.post("/api/wiki/models/user_stars/hasproject", {
            name: this.siteName,
        })
        .then(function (response) {
            if (response.data) {
                WikiPage.is_stared = response.data.result;
            }
        }).catch(function (response) {
        });
    }
    WikiPage.isPageNotFound = function () {
        return this.pageExist == "notfound";
    }
    WikiPage.setPageExist = function (bExist) {
        this.pageExist = bExist ? "downloaded" : "notfound";
    }
    WikiPage.isServerPage = function () {
        return $window.skipClientWiki == true;
    }
    WikiPage.showPagePopup = function () {
        $uibModal.open({
            templateUrl: "/wp-content/pages/wiki/partials/page_popup.html",
            controller: "PagePopupCtrl",
            size: "sm",
            //appendTo: angular.element(document).find('asidepage'),
            windowTemplateUrl: "",
        }).result.then(function (provider) {
        }, function (text, error) {
        });
    }
    WikiPage.showSitePopup = function () {
        $uibModal.open({
            templateUrl: "/wp-content/pages/wiki/partials/site_popup.html",
            controller: "SitePopupCtrl",
            size: "sm",
            //appendTo: angular.element(document).find('asidesite'),
        }).result.then(function (provider) {
        }, function (text, error) {
        });
    }
    if ($window.skipClientWiki)
        WikiPage.setPageExist(true);
    
    return WikiPage;
})
.controller('SitePopupCtrl', function ($scope, $http, Account, WikiPage, $uibModalInstance) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.GetWikiPage = function () {
        return WikiPage;
    };
})
.controller('PagePopupCtrl', function ($scope, $http, Account, WikiPage, $uibModalInstance) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    $scope.GetWikiPage = function () {
        return WikiPage;
    };
})
.controller('WikiController', function ($scope, $http, WikiPage) {
    var idPage = "#wikipage";
    var idSidebar = "#wikisidebar";
    var md;
    $scope.GetWikiPage = function () {
        return WikiPage;
    };
    $scope.ShowSideBar = function (bShow) {
        if (bShow) {
            $(idPage).addClass("col-md-8");
            $(idSidebar).show();
        }
        else {
            $(idSidebar).hide();
            $(idPage).removeClass("col-md-8");
            $(idPage).addClass("col-md-12");
        }
    };
    $scope.login = function () {
        return WikiPage.login();
    };
    $scope.isAuthenticated = function () {
        return WikiPage.isAuthenticated();
    };
    $scope.makeLayout = function () {
        $('.wikitop').removeClass("wikitop").appendTo('#wikitop');
    };
    $scope.getMarkDownRenderer = function () {
        if (md == null) {
            md = window.markdownit({
                html: true, // Enable HTML tags in source
                linkify: true, // Autoconvert URL-like text to links
                typographer: true, // Enable some language-neutral replacement + quotes beautification
                breaks: false,        // Convert '\n' in paragraphs into <br>
                highlight: function (str, lang) {
                    if (lang && window.hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(lang, str, true).value;
                        } catch (__) { }
                    }
                    return ''; // use external default escaping
                }
            });
        }
        return md;
    }
    $scope.load = function (url, container_name) {
        $http({
            method: 'GET',
            url: url,
            headers: {
                'Authorization': undefined,
            }, // remove auth header for this request
            skipAuthorization: true, // this is added by our satellizer module, so disable it for cross site requests.
            transformResponse: [function (data) {
                return data; // never transform to json, return as it is
            }],
        }).then(function successCallback(response) {
            if (response.status == 200) {
                var s = WikiPage.preprocessMarkdown(response.data);
                s = $scope.getMarkDownRenderer().render(s);
                $(container_name).html(s);
            } else {
                $(container_name).html("<p>error</p>");
            }
            if (url == WikiPage.getSidebarUrl())
                $scope.ShowSideBar(true);
            if (url == WikiPage.getPageUrl()) {
                WikiPage.setPageExist(true);
                $scope.makeLayout();
            }
        }, function errorCallback(response) {
            if (response.status == 404) {
                if (url == WikiPage.getSidebarUrl())
                    $scope.ShowSideBar(false);
                else {
                    if (url == WikiPage.getPageUrl())
                        WikiPage.setPageExist(false);
                    $(container_name).html("<p></p>");
                }
            }
            else
                $(container_name).html("<p>load failed.</p>");
        });
    }
    $scope.makeLayout();
    if (!window.skipClientWiki && WikiPage.siteExists()) {
        // load all pages
        $scope.load(WikiPage.getPageUrl(), idPage);
        $scope.load(WikiPage.getSidebarUrl(), idSidebar);
    }
    // $scope.load("https://raw.githubusercontent.com/wiki/NPLPackages/wiki/index.md", "#indexbar");
    $scope.load("https://raw.githubusercontent.com/wiki/NPLPackages/wiki/index.md", "#indexbarpopup");
})