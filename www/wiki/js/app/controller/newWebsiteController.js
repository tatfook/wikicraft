/**
 * Created by wuxiangan on 2016/12/21.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'helper/siteStyle',
    'text!html/newWebsite.html',
    'controller/editWebsiteController',
], function (app, util, storage, siteStyle, htmlContent, editWebsiteHtmlContent) {
    var controller = ['$rootScope','$scope', '$sce', 'Account', function ($rootScope, $scope, $sce, Account) {
        $scope.website = {};
        $scope.websiteNameErrMsg = "";
        $scope.websiteDomainErrMsg = "";
        $scope.errMsg = "";
        $scope.tags = $scope.website.tags ? $scope.website.tags.split('|') : [];
        $scope.commonTags = ['旅游', '摄影', 'IT', '游戏', '生活'];
        $scope.categories = [];//[{name:'个人网站'},{name:'作品网站'},{name:'组织网站'}];
        $scope.subCategories = [];
        $scope.step = 1;
        $scope.nextStepDisabled = !$scope.website.name;

        function createSite(siteinfo, cb , errcb) {
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
                                require([contentPageList[index].contentUrl], function (content) {
                                    defaultDataSource.writeFile({path:contentPageList[index].pagepath, content:content}, cb, errcb);
                                }, function () {
                                    console.log("local server request md file failed");
                                    // 本地文件请求失败直接跳过
                                    errcb && errcb();
                                });
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

        $scope.nextStep = function () {
            $scope.errMsg = "";
            if ($scope.step == 1) {
                if (/^\s+/.test($scope.website.displayName)){
                    $scope.nextStepDisabled = true;
                    $scope.errMsg="首位不能为空格";
                    return;
                }
                if (!$scope.website.displayName) {
                    $scope.errMsg = "站点名为必填字段";
                    return;
                }
                if ($scope.website.displayName.length > 100) {
                    $scope.errMsg = "名称过长";
                    return;
                }
                $scope.websiteNameErrMsg = "";
                $scope.nextStepDisabled = false;
                $scope.step++;
                setTimeout(function () {
                    $scope.isModal ? $("#websiteName_modal").focus() : $("#websiteName").focus();
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
                //console.log($scope.website.visibility);
                return;
            } else if ($scope.step == 3) {
                $scope.nextStepDisabled = !$scope.website.templateName;
            } else if ($scope.step == 4) {
                if (!$scope.website.templateName) {
                    $scope.errMsg = "请选择站点类型和模板";
                    return;
                }
                $scope.nextStepDisabled = !$scope.website.styleName;
            } else if ($scope.step == 5) {
                if (!$scope.website.styleName) {
                    $scope.errMsg = "请选择模板样式";
                    return ;
                }
                $scope.website.logoUrl = $scope.imgsPath + $scope.style.logoUrl;
            } else if ($scope.step == 6) {
                $scope.website.userId = $scope.user._id;
                $scope.website.username = $scope.user.username;

                //$scope.errMsg = "建站中...";
                $scope.prevStepDisabled = true;
                $scope.nextStepDisabled = true;
                createSite($scope.website, function () {
                    $scope.step++;
                    $scope.prevStepDisabled = false;
                    $scope.nextStepDisabled = false;
                }, function () {
					console.log("创建失败，请稍后重试...");
                    $scope.prevStepDisabled = false;
                    $scope.nextStepDisabled = false;
                });
                return
            } else{
                //createWebsiteRequest();
                $rootScope.$broadcast('userCenterContentType', 'websiteManager');
            }
            $scope.step++;
        };

        $scope.prevStep = function () {
            $scope.step--;
            $scope.nextStepDisabled = false;
            if ($scope.step==1){
                setTimeout(function () {
                    $scope.isModal ? $("#webName_modal").focus() : $("#webName").focus();
                });
            }else if ($scope.step == 2){
                setTimeout(function () {
                    $scope.isModal ? $("#websiteName_modal").focus() : $("#websiteName").focus();
                });
            }
        };

        function init() {
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

            if((util.getPathname() !="/wiki/user_center")){
                $scope.isModal=true;
            }

            setTimeout(function () {
                $scope.isModal ? $("#webName_modal").focus() : $("#webName").focus();
            });
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
        }

        $scope.selectCategory = function (category) {
            $scope.category = category;
            $scope.templates = category.templates;
            $scope.styles = category.templates[0].styles;
            $scope.website.categoryId = category._id;
            $scope.website.categoryName = category.name;
            $scope.website.type = category.classify;
            $scope.website.templateId = $scope.templates[0]._id;
            $scope.website.templateName = $scope.templates[0].name;
            $scope.website.styleId = $scope.styles[0]._id;
            $scope.website.styleName = $scope.styles[0].name;
            $scope.nextStepDisabled = false;
            $scope.template = $scope.templates[0];
            $scope.style = $scope.styles[0];
        }

        $scope.selectTemplate = function (template) {
            $scope.template = template;
            $scope.styles = template.styles;
            $scope.website.templateId = template._id;
            $scope.website.templateName = template.name;
            $scope.website.styleId = $scope.styles[0]._id;
            $scope.website.styleName = $scope.styles[0].name;
            $scope.nextStepDisabled = false;
            $scope.website.logoUrl=template.logoUrl;
            $scope.style = $scope.styles[0];
        }

        $scope.selectStyle = function (style) {
            $scope.style = style;
            $scope.website.styleId = style._id;
            $scope.website.styleName = style.name;
            $scope.nextStepDisabled = false;
            $scope.style.logoUrl=style.logoUrl;
        }

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
        }

        $scope.removeTag = function (tagName) {
            var index = $scope.tags.indexOf(tagName);
            if (index >= 0) {
                $scope.tags.splice(index, 1);
            }
            $scope.website.tags = $scope.tags.join('|');
        }

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
        }

        $scope.checkWebsiteName = function () {
            if (!$scope.website.name || $scope.website.name.replace(/(^\s*)|(\s*$)/g, "") == "") {
                return;
            }
            $scope.website.name = $scope.website.name.replace(/(^\s*)|(\s*$)/g, "");
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

        $scope.goPreviewPage = function (url) {
            window.open(url);
        }

        // 访问网站
        $scope.goWebsiteIndexPage = function (sitename) {
            if ($scope.isModal){
                $scope.cancel();
            }
            util.go('/' + $scope.user.username + '/' + $scope.website.name + '/index?branch=master');
        }

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
            util.go('/wiki/userCenter', true);
            //window.open(window.location.href);
        }
    }];

    //controller.$inject = ['$scope', '$state', '$sce', 'Account'];
    app.registerController('newWebsiteController', controller);
    return htmlContent;
});
