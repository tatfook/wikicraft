/**
 * Created by wuxiangan on 2016/12/21.
 */

define([
    'app',
    'bluebird',
    'helper/util',
    'helper/storage',
    'helper/dataSource',
    'text!html/website.html',
    'controller/newWebsiteController',
    'controller/editWebsiteController',
], function (app, Promise, util, storage, dataSource, htmlContent, newWebsiteHtmlContent, editWebsiteHtmlContent) {
    app.registerController('websiteController', ['$rootScope', '$scope', 'Account', function ($rootScope, $scope, Account) {
        // console.log("websiteController");
        $scope.websites = [];

        function getUserSiteList() {
            util.post(config.apiUrlPrefix + 'website/getAllByUsername', {username: $scope.user.username}, function (data) {
                $scope.websites = data;
                $scope.websites.count = $scope.websites.length;
            });
        }

        function init(userinfo) {
            $scope.user = userinfo || $scope.user;
            // 获取项目列表
            getUserSiteList();

            $scope.$on('userCenterItem', function (event, item) {
            });
        }

        //  创建网站
        $scope.goNewWebsitePage = function () {
            util.html('#userCenterSubPage', newWebsiteHtmlContent);
        }

        // 编辑网站
        $scope.goEditWebsitePage = function (website) {
            storage.sessionStorageSetItem("editWebsiteParams", website);
            //storage.sessionStorageSetItem("userCenterContentType", "editWebsite");
            //window.open(window.location.href);
            util.html('#userCenterSubPage', editWebsiteHtmlContent);
        }

        // 访问网站
        $scope.goWebsiteIndexPage = function (sitename) {
            util.goUserSite('/' + $scope.user.username + '/' + sitename, true);
        }

        // 编辑网站页面
        $scope.goEditWebsitePagePage = function (website) {
            //window.location.href="/wiki/wikiEditor";
            storage.sessionStorageSetItem("urlObj",{username:website.username, sitename:website.name});
            util.go('wikieditor');
        }

        //删除网站
        $scope.deleteWebsite = function (site) {
            $scope.deleteWebsiteConfirmMsg = "确定删除 " + (site.displayName || site.name) + " 网站？";
            $scope.deleteWebsiteConfirmSite = site;
            $scope.deleteWebsiteWithGitlabData = false;
            // console.log(site);
            $('#deleteWebsiteConfirmModal').modal("show");
        };

        $scope.confirmDeleteWebsite = function(site) {
            util.post(config.apiUrlPrefix + 'website/deleteById', {websiteId: site._id}, function (data) {
                site.isDelete = true;
                $scope.deletingWebsite="";
                $scope.websites.count --;

                $scope.deleteWebsiteWithGitlabData ? clearGitLab(site).then(function() {
                    hideModal();
                }).catch(function(err) {
                    console.error(err);
                    hideModal();
                }) : hideModal();

                function hideModal() {
                    $('#deleteWebsiteConfirmModal').modal("hide");
                }
            }, null, true);

            function clearGitLab(site) {
                return new Promise(function(clearResolve, clearReject) {
                    var currentDataSource = dataSource.getDataSource(site.username, site.sitename);
                    if (!currentDataSource) return clearReject("current data source unset!!!");
                    
                    var path = "/" + site.username + "/" + site.sitename;
                    currentDataSource.getTree({recursive:true, path: path},function (data) {
                        // console.log('currentDataSource.getTree: ', data);
                        if (!data || !data.map) return clearReject();
                        Promise.each(data.map(function(page) {
                            return deletePage(page);
                        })).catch(function(err) {
                            clearReject(err);
                        }).then(function(res) {
                            clearResolve(res);
                        });
                    }, function(err) {
                        clearReject(err);
                    });

                    function deletePage(page) {
                        return new Promise(function(resolve, reject) {
                            currentDataSource.deleteFile({path: page.url + config.pageSuffixName}, function () {
                                resolve("删除文件成功:");
                            }, function (response) {
                                reject("删除文件失败:");
                            });
                        })
                    }
                });
            }
        }

        Account.ensureAuthenticated(function () {
            Account.getUser(function (userinfo) {
                init(userinfo);
            });
        });
    }]);

    return htmlContent;
});
