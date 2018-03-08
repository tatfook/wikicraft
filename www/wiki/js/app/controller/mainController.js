/**
 * Created by wuxiangan on 2016/12/19.
 */

define([
    'app',
    'markdown-it',
    'helper/markdownwiki',
    'helper/storage',
    'helper/util',
    'helper/mdconf',
    'helper/dataSource',
    'helper/loading',
    'controller/homeController',
    'controller/headerController',
    'controller/footerController',
    'controller/userController',
    'controller/notfoundController',
    'controller/crosController',
], function (app, markdownit, markdownwiki, storage, util, mdconf, dataSource, loading, homeHtmlContent, headerHtmlContent, footerHtmlContent, userHtmlContent, notfoundHtmlContent, crosHtmlContent) {
	var md = markdownwiki({breaks: true, isMainMd:true});

    app.controller('mainController', [
        '$scope',
        '$rootScope',
        '$sce',
        '$location',
		'$anchorScroll',
        '$http',
        '$auth',
        '$compile',
        '$translate',
        'Account',
        'Message',
        'github',
        'modal',
        'gitlab',
        'confirmDialog',
        'realnameVerifyModal',
        'datatreeEditorModal',
        'selfDefinedModal',
        'assetsManagerModal',
        function (
            $scope,
            $rootScope,
            $sce,
            $location,
            $anchorScroll,
            $http,
            $auth,
            $compile,
            $translate,
            Account,
            Message,
            github,
            modal,
            gitlab,
            confirmDialog,
            realnameVerifyModal,
            datatreeEditorModal,
            selfDefinedModal,
            assetsManagerModal
        ) {
            //console.log("mainController");
            
            // 初始化基本信息
            function initBaseInfo() {
				config.isBoostrap = true;
                //配置一些全局服务
                config.services = {
                    $rootScope: $rootScope,
                    $sce: $sce,
                    $http: $http,
                    $compile: $compile,
                    $auth: $auth,
                    $location:$location,
					$anchorScroll:$anchorScroll,
                    markdownit:markdownit({}),
					mdconf:mdconf,
                    storage: storage,
                    Account: Account,
                    Message: Message,
                    github: github,
					modal: modal,
                    gitlab:gitlab,
                    dataSource:dataSource,
                    loading:loading,
                    confirmDialog:confirmDialog,
                    realnameVerifyModal:realnameVerifyModal,
                    datatreeEditorModal:datatreeEditorModal,
                    selfDefinedModal:selfDefinedModal,
                    assetsManagerModal:assetsManagerModal
                };

                util.setAngularServices({
                    $rootScope: $rootScope,
                    $http: $http,
                    $compile: $compile,
                    $auth: $auth,
                    $location:$location,
                });

                util.setSelfServices({
                    config: config,
                    storage: storage,
                    Account: Account,
                    Message: Message,
                    github: github,
                    gitlab:gitlab,
                    dataSource:dataSource,
                    loading:loading,
                    confirmDialog:confirmDialog,
                    realnameVerifyModal:realnameVerifyModal
                });

                $rootScope.imgsPath = config.imgsPath;
                $rootScope.cssPath = config.cssPath;
                $rootScope.user = Account.getUser();
                $rootScope.userinfo = $rootScope.user;
				$rootScope.frameHeaderExist = true;
                $rootScope.frameFooterExist = true;
                $rootScope.translate = $translate.instant.bind($translate);
                if (config.isLocal()) {
                    $rootScope.frameHeaderExist = true;
                    $rootScope.frameFooterExist = true;
                } else {
                    //$rootScope.frameHeaderExist = config.isOfficialDomain(window.location.hostname);
                    //$rootScope.frameFooterExist = config.isOfficialDomain(window.location.hostname);
                }

                $rootScope.isLogin = Account.isAuthenticated();
                $rootScope.isSelfSite = function () {
                    return $rootScope.user._id == $rootScope.userinfo._id;
                }

                $rootScope.getImageUrl = function(imgUrl,imgsPath) {
					var bustVersion = config.bustVersion;
					if (imgUrl.indexOf("?bust=") > 0 || imgUrl.indexOf("?ver=") > 0) {
						bustVersion = "";
					}
                    if (imgUrl.indexOf("://") >= 0) {
                        return imgUrl;
                    }
                    if (imgUrl.indexOf("/wiki/") >= 0) {
                        return imgUrl + "?bust=" + bustVersion;
                    }

                    return (imgsPath || $rootScope.imgsPath) + imgUrl + "?bust=" + bustVersion;
                }

                $rootScope.getCssUrl = function(cssUrl, cssPath) {
					var bustVersion = config.bustVersion;
					if (cssUrl.indexOf("?bust=") > 0 || cssUrl.indexOf("?ver=") > 0) {
						bustVersion = "";
					}
                    if (cssUrl.indexOf("://") >= 0) {
                        return cssUrl;
                    }
                    if (cssUrl.indexOf("/wiki/") >= 0) {
                        return cssUrl + "?bust=" + bustVersion;
                    }

                    return (cssPath || $rootScope.cssPath) + cssUrl + "?bust=" + bustVersion;
                }
                
                $rootScope.getRenderText = function (text) {
                    return $sce.trustAsHtml(config.services.markdownit.render(text || ""));
                }

				$anchorScroll.yOffset = 100;
				md.registerRenderAfterCallback("$anchorScroll", function(){
					$anchorScroll();
				});
            }

            // 底部高度自适应
            function stickFooter() {
                var winH=$(window).height();
                var headerH=52;
                var footerH=$("#_footer_").height();
                var minH=winH-headerH-footerH;
                var w = $("#__mainContent__");
                w.css("min-height", minH);
            }

            function throttle(method, context) {
                clearTimeout(method.stickTimer);
                method.stickTimer = setTimeout(function () {
                    method.call(context);
                },100);
            }

            window.onresize = function () {
                throttle(stickFooter);
            };

            function initView() {

                // 信息提示框
                $("#messageTipCloseId").click(function () {
                    Message.hide();
                });

                if ($rootScope.frameHeaderExist) {
                    util.html('#__wikiHeader__', headerHtmlContent, $scope);
                }
                if ($rootScope.frameFooterExist) {
                    util.html('#__wikiFooter__', footerHtmlContent, $scope);
                }
                
                $rootScope.getBodyStyle = function () {
                    return {
                        "padding-top": ($rootScope.frameHeaderExist && !$rootScope.isHeaderScroll) ? "52px" : "0px",
                    };
                }

                // 页面重载回调
                // $(window).on("beforeunload", function () {
                //
                // });

                stickFooter();

                var isFirstLocationChange = true;
                // 注册路由改变事件, 改变路由时清空相关内容
                $rootScope.$on('$locationChangeSuccess', function () {
                    //console.log("$locationChangeSuccess change");
					if (util.isEditorPage()) {
						var url = window.location.hash.substring(1);
						if (url[0] != '/') {
							url = "/" + url;
						}
						url = decodeURIComponent(url);
						var paths = url.split("/");
						// url作严格控制，避免错误url导致异常逻辑
						if (paths.length > 3 && paths.length < 6 && url.length < 256) {
							var urlObj = {
								url:url,
								username:paths[1],
								sitename:paths[2],
								pagename:paths[paths.length-1],
								pagepath:url,
							};
							//console.log(urlObj);
							if (isFirstLocationChange) {
								storage.sessionStorageSetItem("urlObj", urlObj);
							} else {
								$rootScope.$broadcast('changeEditorPage', urlObj);
							}
						}
					}
                    if (!isFirstLocationChange && (util.isEditorPage() || !config.islocalWinEnv())) {
                        return ;
                    }
                    isFirstLocationChange = false;
                    config.loadMainContent(initContentInfo);
                });
            }

            function setWindowTitle(urlObj) {
                var pathname = urlObj.pathname;
                //console.log(pathname);
                var paths = pathname.split('/');
                if (paths.length > 1 && paths[1]) {
                    $rootScope.title = paths[paths.length-1] + (paths.length > 2 ? (' - ' +paths.slice(1,paths.length-1).join('/')) : "");
                } else {
                    $rootScope.title = config.hostname.substring(0,config.hostname.indexOf('.'));
                }
            }

            function getUserPage() {
                var urlObj = $rootScope.urlObj;
                // 访问用户页
                $rootScope.userinfo = undefined;
                $rootScope.siteinfo = undefined;
                $rootScope.pageinfo = undefined;
                $rootScope.tplinfo = undefined;
                if (urlObj.username && urlObj.sitename) {
                    $rootScope.isHeaderScroll = true;
                    util.http("POST", config.apiUrlPrefix + "website/getDetailInfo", {
                        username: urlObj.username,
                        sitename: urlObj.sitename,
                        pagename: urlObj.pagename || 'index',
						url:urlObj.pagepath,
                    }, function (data) {
                        data = data || {};
                        // 这三种基本信息根化，便于用户页内模块公用
                        $rootScope.userinfo = data.userinfo;
                        $rootScope.siteinfo = data.siteinfo || {};
                        $rootScope.pageinfo = {username:urlObj.username,sitename:urlObj.sitename, pagename:urlObj.pagename, pagepath:urlObj.pagepath};
                        $rootScope.tplinfo = {username:urlObj.username,sitename:urlObj.sitename, pagename:"_theme"};

                        var userDataSource = dataSource.getUserDataSource(data.userinfo.username);
                        //var filterSensitive = function (inputText) {
                            //var result = "";
                            //config.services.sensitiveTest.checkSensitiveWord(inputText, function (foundWords, outputText) {
                                //result = outputText;
                                //return inputText;
                            //});
                            //return result;
                        //};
						var callback = function() {
							if (!$scope.user || $scope.user.username != data.userinfo.username) {
								userDataSource.init(data.userinfo.dataSource, data.userinfo.defaultDataSourceSitename);
							}
							userDataSource.registerInitFinishCallback(function () {
								var currentDataSource = dataSource.getDataSource($rootScope.pageinfo.username, $rootScope.pageinfo.sitename);
                                $scope.user && Account.setDataSourceToken(currentDataSource);
								var renderContent = function (content) {
									$rootScope.$broadcast('userpageLoaded',{});
                                    if (content && (data.siteinfo.sensitiveWordLevel & 1) <= 0){
                                        //content = filterSensitive(content) || content;
                                    }
									content = (content!=undefined) ? md.render(content) : notfoundHtmlContent;
									util.html('#__UserSitePageContent__', content, $scope);
									//config.loading.hideLoading();
								};
								//if (config.isLocal()) {
									//currentDataSource.setLastCommitId("master");
								//}

								if (window.location.search && window.location.search.indexOf('branch=master') >= 0) {
									currentDataSource.setLastCommitId('master');
								}

								//console.log(currentDataSource);
								currentDataSource.getRawContent({path:urlObj.pagepath + config.pageSuffixName, token: currentDataSource.dataSourceToken}, function (data) {
									//console.log(data);
									//console.log("otherUsername:", urlObj.username);
									storage.sessionStorageSetItem("otherUsername", urlObj.username);
									$rootScope.pageinfo.content = data || "";
									renderContent(data);
								}, function () {
									renderContent();
								});
							});
						};
						// 使用自己的token
						if (Account.isAuthenticated()) {
							Account.getUser(function(userinfo){
								if (userinfo.username != data.userinfo.username) {
									for (var i=0; i < data.userinfo.dataSource.length; i++) {
										var ds1 = data.userinfo.dataSource[i];
										for (var j = 0; j < userinfo.dataSource.length; j++) {
											var ds2 = userinfo.dataSource[j];
											if (ds1.apiBaseUrl == ds2.apiBaseUrl) {
												ds1.dataSourceToken = ds2.dataSourceToken;
												ds1.isInited = true;
											}
										}
									} 
								}
								callback();
							})
						} else {
							callback();
						}
                    },function (err) {
                        // console.log(err);
                        var errContent = notfoundHtmlContent;
                        util.html('#__UserSitePageContent__', errContent, $scope);
                    });
                } else if (urlObj.username){
                    util.html('#__UserSitePageContent__', userHtmlContent, $scope);
					//config.loading.hideLoading();
                }
            }

            // 加载内容信息
            function initContentInfo() {
                util.html('#__UserSitePageContent__', '<div></div>', $scope);
                $rootScope.urlObj = util.parseUrl();

                var urlObj = $rootScope.urlObj;
                // 置空用户页面内容
                // console.log(urlObj);
                setWindowTitle(urlObj);
				
				if (!util.isEditorPage()) {
					storage.sessionStorageRemoveItem("otherUsername");
				}

				if (urlObj.domain && !config.isOfficialDomain(urlObj.domain)) {
					util.post(config.apiUrlPrefix + 'website_domain/getByDomain',{domain:urlObj.domain}, function (data) {
						if (data) {
							urlObj.username = data.username;
							urlObj.sitename = data.sitename;
							var urlPrefix = '/' + data.username + '/' + data.sitename;
							var pathname = urlObj.pathname.length > 1 ? urlObj.pathname : "/index";
							urlObj.pagepath = pathname.indexOf(urlPrefix) == 0 ? pathname : urlPrefix + pathname;
						}
						getUserPage();
					}, function () {
						getUserPage();
					});
					return;
				}

                if (config.mainContent) {
                    if (config.mainContentType == "wiki_page") {
						//if (urlObj.pathname == "/wiki/test") {
							//config.mainContent = md.render(config.mainContent);
						//}
                        util.html('#__UserSitePageContent__', config.mainContent, $scope);
                        //config.mainContent = undefined;
                    } else {
                        util.html('#__UserSitePageContent__', config.mainContent, $scope);
                        config.mainContent = undefined;
                    }
                } else if (!urlObj.username){
                    if (Account.isAuthenticated()) {
                        Account.getUser(function (userinfo) {
                            util.go("/" + userinfo.username);
						}, function() {
							Account.logout();
						    window.location.reload();
							//util.html('#__UserSitePageContent__', homeHtmlContent, $scope);
						});
                    } else {
                        util.html('#__UserSitePageContent__', homeHtmlContent, $scope);
                    }
                } else {
					getUserPage();
                }

            }

            function init() {
                initBaseInfo();
                initView();
            }

            init();

            $scope.$on("onUserProfile", function (event, user) {
                //console.log('onUserProfile -- mainController');
                $scope.user = user;
                //init();
            });
        }]);

});
