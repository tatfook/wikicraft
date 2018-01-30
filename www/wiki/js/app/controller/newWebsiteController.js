/**
 * Created by wuxiangan on 2016/12/21.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'helper/sensitiveWord',
    'markdown-it',
    'text!html/newWebsite.html',
    'controller/editWebsiteController',
], function (app, util, storage, sensitiveWord, markdownit, htmlContent, editWebsiteHtmlContent) {
    var controller = ['$rootScope','$scope', '$sce', 'Account', 'Message', function ($rootScope, $scope, $sce, Account, Message) {
        const GITLAB = {
            "API_BASE_URL": "http://git.keepwork.com/api/v4",
            "FILE_PATH": "official%2Ftemplate%2FwebTemplateConfig%2Emd",// 网站模板配置保存路径
            "REF": "master",
            "PRIVATE_TOKEN": "Gsx7JYVFxvsDod2MY2x5",
            "ID": "6803"
        };
        $scope.website = {};
        $scope.websiteNameErrMsg = "";
        $scope.websiteDomainErrMsg = "";
        $scope.errMsg = "";
        $scope.tags = $scope.website.tags ? $scope.website.tags.split('|') : [];
        $scope.commonTags = ['旅游', '摄影', 'IT', '游戏', '生活'];
        $scope.categories = [];//[{name:'个人网站'},{name:'作品网站'},{name:'组织网站'}];
        $scope.subCategories = [];
        $scope.step = 1;

        function doGitlabTemplate(path, filepath, defaultDataSource, cb, errcb) {
            filepath = encodeURIComponent(filepath);
            var url = GITLAB.API_BASE_URL + "/projects/" + GITLAB.ID +"/repository/files/" + filepath;
            var params = {
                "ref": GITLAB.REF
            };
            var isShowLoading = true;
            util.http("GET", url, params, function (result) {
                // console.log(result);
                // return result;
            }, function (result) {
                // console.log(result);
                if (result.content == undefined || result.message){
                    errcb && errcb();
                    return;
                }
                var content = Base64.decode(result.content);
                defaultDataSource.writeFile({path: path, content:content}, cb, errcb);
            }, isShowLoading);
        }

        function createSite(siteinfo, cb , errcb) {
            config.services.realnameVerifyModal().then(doCreateSite).catch(errcb);

            function doCreateSite() {
                siteinfo.userId = $scope.user._id;
                siteinfo.username = $scope.user.username;
                siteinfo.defaultDataSourceName = $scope.user.defaultDataSourceName;
                //siteinfo.isolateDataSource = true;
                config.loading.showLoading();
                util.post(config.apiUrlPrefix + 'website/upsert', siteinfo, function (siteinfo) {
                    var userDataSource = dataSource.getUserDataSource(siteinfo.username);
                    var callback = function () {
                        var defaultDataSource = dataSource.getDataSource(siteinfo.username, siteinfo.name);
                        var pagepathPrefix = "/" + siteinfo.username + "/" + siteinfo.name + "/";
                        var contentUrlPrefix = "text!html/";
                        var contentPageList = [];
                        for (var i = 0; i < $scope.style.contents.length; i++) {
                            var content = $scope.style.contents[i];
                            contentPageList.push({
                                "pagepath": pagepathPrefix + content.pagepath + config.pageSuffixName,
                                "contentUrl": contentUrlPrefix + content.contentUrl,
                            });
                        }
                        var fnList = [];
                        for (var i = 0; i < contentPageList.length; i++) {
                            fnList.push((function (index) {
                                return function (cb, errcb) {
                                    doGitlabTemplate(contentPageList[index].pagepath,contentPageList[index].contentUrl.substring(contentUrlPrefix.length), defaultDataSource, cb, errcb);
                                }
                            })(i));
                        }
    
                        util.sequenceRun(fnList, undefined, function(){
                            config.loading.hideLoading();
                            cb && cb();
                        }, function () {
                            util.post(config.apiUrlPrefix + 'website/deleteById', {websiteId:siteinfo._id});
                            config.loading.hideLoading();
                            errcb && errcb();
                        });
                    };
                    if (siteinfo.dataSource) {
                        var dataSourceInst = dataSource.getDataSourceInstance(siteinfo.dataSource.type);
                        userDataSource.registerDataSource(siteinfo.name, dataSourceInst);
                        dataSourceInst.init(siteinfo.dataSource, function() {
                            Account.initDataSource(callback, callback);
                            //callback();
                        }, errcb);
                    } else {
                        callback();
                    }
                }, function () {
                    config.loading.hideLoading();
                    errcb && errcb();
                });
            }
        }

        $scope.nextStep = function () {
            $scope.errMsg = "";
            if ($scope.step == 1) {
                if (!$scope.website.templateName) {
                    Message.info("请选择站点类型和模板");
                    $scope.errMsg = "请选择站点类型和模板";
                    return;
                }
                if ($scope.template.isThirdWay){
                    util.go($scope.template.extraLink);
                    return;
                }
                $scope.step++;
                $scope.nextStepDisabled = !$scope.website.name;
                setTimeout(function () {
                    if ($scope.isModal){
                        $("#websiteName_modal").focus();
                    }else{
                        $("#websiteName").focus();
                        $("#websiteName1").focus();
                    }
                });
                return;
            } else if ($scope.step == 2) {
                if (!$scope.website.name || $scope.website.name.replace(/(^\s*)|(\s*$)/g, "") == "") {
                    $scope.errMsg = "域名为必填字段";
                    return;
                } else {
                    var isValid = /[\d\w]+/.test($scope.website.name);
                    if (!isValid) {
                        $scope.errMsg = "域名只能为数字和字母组合";
                        return;
                    }
                    if ($scope.website.name.length > 30) {
                        $scope.errMsg = "域名过长";
                        return ;
                    }
                    $scope.website.name = $scope.website.name.replace(/(^\s*)|(\s*$)/g, "");
                    util.http('POST', config.apiUrlPrefix + 'website/getByName', {username:$scope.user.username, sitename: $scope.website.name}, function (data) {
                        if (data) {
                            $scope.errMsg = $scope.website.name + "已存在，请换个名字";
                        } else {
                            $scope.step++;
                        }
                    });
                }
                $scope.website.visibility = $scope.visibility ? "private" : "public";

                $scope.nextStepDisabled = !$scope.website.templateName;
                return;
            } else if ($scope.step == 3) {
                // $scope.nextStepDisabled = !$scope.website.templateName;

                $scope.website.userId = $scope.user._id;
                $scope.website.username = $scope.user.username;

                if (!$scope.website.styleId || !$scope.website.styleName || !$scope.website.logoUrl){
                    var style = $scope.style || $scope.styles[0];
                    $scope.website.styleId = style._id;
                    $scope.website.styleName = style.name;
                    $scope.website.logoUrl = style.logoUrl;
                }

                //$scope.errMsg = "建站中...";
                $scope.prevStepDisabled = true;
                $scope.nextStepDisabled = true;
                createSite($scope.website, function () {
                    $scope.step++;
                    $scope.prevStepDisabled = false;
                    $scope.nextStepDisabled = false;
                }, function () {
                    // console.log("创建失败，请稍后重试...");
                    $scope.prevStepDisabled = false;
                    $scope.nextStepDisabled = false;
                });
                return;
            } else{
                //createWebsiteRequest();
                $rootScope.$broadcast('userCenterContentType', 'websiteManager');
            }
            $scope.step++;
        };

        $scope.prevStep = function () {
            $scope.step--;
            $scope.nextStepDisabled = false;
            if ($scope.step == 2){
                setTimeout(function () {
                    if ($scope.isModal){
                        $("#websiteName_modal").focus();
                    }else{
                        $("#websiteName").focus();
                        $("#websiteName1").focus();
                    }
                });
            }
        };

        function initSiteStyle(siteStyle) {
            $scope.categories = siteStyle;
            $scope.templates = $scope.categories[0].templates;
            $scope.styles = $scope.templates[0].styles;
            $scope.website.categoryId = $scope.categories[0]._id;
            $scope.website.categoryName = $scope.categories[0].name;
            $scope.website.type = $scope.categories[0].classify;
            $scope.website.templateId = $scope.templates[0]._id;
            $scope.website.templateName = $scope.templates[0].name;
            $scope.website.styleId = $scope.styles[0]._id;
            $scope.website.styleName = $scope.styles[0].name;
            $scope.category = $scope.categories[0];
            $scope.template = $scope.templates[0];
            $scope.style = $scope.styles[0];
        }

        function getSiteStyle() {
            var url = GITLAB.API_BASE_URL + "/projects/" + GITLAB.ID +"/repository/files/" + GITLAB.FILE_PATH;
            var params = {
                "ref": GITLAB.REF
            };
            var isShowLoading = true;
            util.http("GET", url, params, function (result) {
                // console.log(result);
            }, function (result) {
                if (!result.content){
                    return;
                }
                var content = Base64.decode(result.content),
                    md = markdownit(),
                    parserContent = md.parse(content)[0].content || "";
                try{
                    var siteStyle = angular.fromJson(parserContent);
                    initSiteStyle(siteStyle);
                }catch (e){
                    // console.log(e);
                }
            }, isShowLoading);
        }

        function init() {
            if (!$scope.categories || $scope.categories.length <= 0){
                getSiteStyle();
            }else{
                // console.log($scope.categories);
            }

            if((util.getPathname() !="/wiki/user_center")){
                $scope.isModal=true;
            }
        }

        // 文档加载完成
		$scope.$watch('$viewContentLoaded', function(){
			Account.getUser(function(userinfo){
				$scope.user = userinfo;
				init();
			});
		});

        function createWebsiteRequest() {

        }

        $scope.getActiveStyleClass = function (category) {
            return category.name == $scope.website.categoryName ? 'active' : '';
        };

        $scope.selectCategory = function (category) {
            $scope.category = category;
            $scope.templates = category.templates;
            $scope.styles = category.templates[0].styles;
            $scope.website.categoryId = category._id;
            $scope.website.categoryName = category.name;
            $scope.website.type = category.classify;
            $scope.website.templateId = $scope.templates[0]._id;
            $scope.website.templateName = $scope.templates[0].name;
            $scope.nextStepDisabled = false;
            $scope.template = $scope.templates[0];

            if (!$scope.styles){
                return;
            }
            $scope.website.styleId = $scope.styles[0]._id;
            $scope.website.styleName = $scope.styles[0].name;
            $scope.style = $scope.styles[0];
        };

        $scope.selectTemplate = function (template) {
            $scope.template = template;
            $scope.styles = template.styles;
            $scope.website.templateId = template._id;
            $scope.website.templateName = template.name;
            if (!$scope.styles){
                return;
            }
            $scope.website.styleId = $scope.styles[0]._id;
            $scope.website.styleName = $scope.styles[0].name;
            $scope.nextStepDisabled = false;
            $scope.website.logoUrl=template.logoUrl;
            $scope.style = $scope.styles[0];
        };

        $scope.selectStyle = function (style) {
            $scope.style = style;
            $scope.website.styleId = style._id;
            $scope.website.styleName = style.name;
            $scope.nextStepDisabled = false;
            $scope.style.logoUrl=style.logoUrl;
        };

        $scope.addTag = function (tagName) {
            tagName = util.stringTrim(tagName);
            if (!tagName || $scope.tags.indexOf(tagName) >= 0) {
                return;
            }
            if (tagName.length>30){
                $scope.errMsg="标签最长30个字符";
                return;
            }
            $scope.errMsg="";
            $scope.tags.push(tagName);
            $scope.website.tags = $scope.tags.join('|');
            $scope.tag="";
            $("input").focus();
        };

        $scope.removeTag = function (tagName) {
            var index = $scope.tags.indexOf(tagName);
            if (index >= 0) {
                $scope.tags.splice(index, 1);
            }
            $scope.website.tags = $scope.tags.join('|');
        };

        $scope.checkWebsiteDisplayName = function () {
            if (/^\s+/.test($scope.website.displayName)){
                $scope.nextStepDisabled = true;
                $scope.errMsg="首位不能为空格";
                return;
            }
            var displayName=$scope.website.displayName?$scope.website.displayName:$scope.website.displayName.trim();
            if (!displayName) {
                $scope.nextStepDisabled = true;
                $scope.errMsg="请填入站点名称";
                return;
            }
            if(displayName.length>30){
                $scope.nextStepDisabled = true;
                $scope.errMsg="站点名称最长30个字符";
                return;
            }
            $scope.errMsg="";
            $scope.nextStepDisabled = false;
        };

        $scope.checkWebsiteName = function () {
            $scope.errMsg="";
            if (!$scope.website.name || $scope.website.name.replace(/(^\s*)|(\s*$)/g, "") == "") {
                return;
            }
            $scope.website.name = $scope.website.name.replace(/(^\s*)|(\s*$)/g, "");

            sensitiveWord.getAllSensitiveWords($scope.website.name).then(function(results) {
                var isSensitive = results && results.length;
                // isSensitive && console.log("包含敏感词:" + results.join("|"));
                doCheckWebsiteName(isSensitive);
            });

            function doCheckWebsiteName(isSensitive) {
                util.$apply($scope);

                if (isSensitive){
                    $scope.nextStepDisabled = true;
                    $scope.errMsg="您输入的内容不符合互联网安全规范，请修改";
                    return;
                }
                if($scope.website.name.length>30){
                    $scope.nextStepDisabled = true;
                    $scope.errMsg="访问地址最长30个字符";
                    return;
                }
                if (/^[a-z0-9]+$/.test($scope.website.name)){
                    $scope.nextStepDisabled = false;
                    $scope.website.domain = $scope.website.name;
                    $scope.errMsg="";
                }else{
                    $scope.nextStepDisabled = true;
                    $scope.errMsg="访问地址不符合规范";
                }
            }
        };

        $scope.goPreviewPage = function (url) {
            window.open(url);
        };

        // 访问网站
        $scope.goWebsiteIndexPage = function (sitename) {
            if ($scope.isModal){
                $scope.cancel();
            }
            util.go('/' + $scope.user.username + '/' + $scope.website.name + '/index?branch=master');
        };

        $scope.cancel = function () {
            var result = {};
            result.finished = false;
            if ($scope.isModal && $scope.step == 7){
                result.finished = true;
                result.website = $scope.website;
            }
            $scope.$dismiss(result);
        };

        //网站设置
        $scope.goEditWebsitePage = function () {
            storage.sessionStorageSetItem("editWebsiteParams", $scope.website);
            storage.sessionStorageSetItem("userCenterContentType", "editWebsite");
            util.go('/wiki/userCenter');
            //window.open(window.location.href);
        };

        // 网站编辑
        $scope.goEditerPage = function () {
            storage.sessionStorageSetItem("urlObj",{username:$scope.website.username, sitename:$scope.website.name});
            util.go('wikieditor');
        };

        // VIP付费页面
        $scope.goVIP = function () {
            util.go("vip");
        }
    }];

    //controller.$inject = ['$scope', '$state', '$sce', 'Account'];
    app.registerController('newWebsiteController', controller);
    return htmlContent;
});
