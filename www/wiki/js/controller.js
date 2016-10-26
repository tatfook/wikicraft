/**
 * Created by wuxiangan on 2016/9/26.
 */

app.controller('mainCtrl', function ($scope, $rootScope, $state, ctrlShareObj, projectStorageProvider) {
    $rootScope.isLogin = true;
    $rootScope.user = {username:"逍遥"}
    $rootScope.goLoginPage=function () {
        $state.go('index.login');
    }
    $rootScope.goRegisterPage=function () {
        $state.go('index.register');
    }
    $rootScope.logout = function () {
        $rootScope.isLogin = false;
        $rootScope.goLoginPage();
    }
    console.log("mainCtrl");
/*
	var hostname = window.location.hostname;
    var pathname = window.location.pathname;
    var hash = window.location.href;
    var sitename = hostname.match(/([\w]+)\.[\w]+\.[\w]+/);
    var pagename = '/index';

	// 排除IP访问
	if (hostname.split(':')[0].match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
		sitename = undefined;
	}

    if (sitename) {
        sitename = sitename[1];
        pagename = pathname;
    } else {
        sitename = pathname.match(/^\/?([^\/]+)(.*)/);  // 这里不会返回null
        pagename = sitename[2] || pagename;
        sitename = sitename[1]
    }
	*/
    /*
    hash = hash.replace('#/','');
    if (hash && hash.length) {
        $state.go('index.'+hash);
    }

    */
    //$state.go('index.userCenter');
    //ctrlShareObj.pageContentUrl = '/test/index';
    //ctrlShareObj.sitename = "test";
    //$state.go('custom')

    // 初始化数据源
    const github = projectStorageProvider.getDataSource('github');
    github.init({
        username: '765485868@qq.com',
        password: 'wxa765485868',
    }, function (error) {
        $state.go('index.test');
    });
    return ;
    /*
	if (sitename == "wiki") {
        $state.go('index.' + pagename.substring(1,pagename.length));
    } else {
        ctrlShareObj.pageContentUrl = sitename + pagename;
		ctrlShareObj.sitename = sitename;
		ctrlShareObj.pagename = pagename;
        $state.go('custom');
    }
	*/
});

app.controller('indexHeaderCtrl', function ($scope, $rootScope, $state) {
});

app.controller('testCtrl', function ($scope, $rootScope, $state, $http, $compile, ctrlShareObj) {
    /*
    ctrlShareObj.sitename='test';
    config.templateObject = {
        $scope:$scope,
        $http:$http,
        ctrlShareObj:ctrlShareObj,
    };

    function getTree(data) {
        var tree = [];
        if (!data) {
            return tree;
        }
        for(var i = 0; i < data.length; i++) {
            tree.push({
                text:data[i].name,
                nodes:data[i].pages ? getTree(data[i].pages) : undefined,
            });
        }
        return tree;
    }
    var main = function () {
        var $scope  = config.templateObject.$scope;
        var $http = config.templateObject.$http;
        var ctrlShareObject = config.templateObject.ctrlShareObj;
        util.http($http, "POST", config.apiUrlPrefix+'website_pages/getWebsiteAllPageByWebsiteName', {websiteName:ctrlShareObject.sitename}, function (data) {
            var tree = getTree(data);
            console.log(tree);
            $('#tree').treeview({data: getTree(data)});
        });
    };
    main();
    */
});


app.controller('indexCtrl', function ($scope,$state, $sce, $auth, ctrlShareObj,projectStorageProvider) {
    console.log("indexCtrl");
    const github = projectStorageProvider.getDataSource('github');
});


app.controller('gitVersionCtrl', function ($scope, $state, $sce, $auth, ctrlShareObj,projectStorageProvider) {
    const github = projectStorageProvider.getDataSource('github');
    console.log("gitVersionCtrl");
    $scope.dtStartOpened = false;
    $scope.dtEndOpened = false;
    $scope.filelist = [];
    $scope.commits = [];
    // 获得git文件列表
    github.getTree('master', false, function (error, result, request) {
        var filelist = []
        for(var i = 0; result && i < result.length; i++) {
            /*
            if (result[i].type == 'tree') {
                continue;
            }
            */
            filelist.push({path:result[i].path});
        }
        $scope.filelist = filelist;
    });

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
            console.log(result);
            $scope.commits = result || [];
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

app.controller('customCtrl', function ($scope, $state, $http, $compile, ctrlShareObj) {
	var defaultPage = {content:'<div>网站没有内容,请添加页面</div>'}
	util.http($http, 'POST', config.apiUrlPrefix+'website_pages/getWebsiteStylePageByPath', {path:ctrlShareObj.pageContentUrl}, function(data){
        $scope.websitePage = data  || defaultPage;
		if (data) {
			//var styleContent = data.style.content;
			//var pageContent = data.page.content;
			//var content = styleContent.replace('__PageContent__', pageContent);
            var content = $compile(data.style.content)($scope);
            config.templateObject = {
                $scope:$scope,
                $http:$http,
                $compile:$compile,
                ctrlShareObj:ctrlShareObj,
                executeTemplateScript:true,
            };
			$('#__StyleTemplateContent__').html(content);
		} else {
			$('#__StyleTemplateContent__').html(defaultPage.content);
		}
	});
});

app.controller('editWebsitePageCtrl', function ($scope, $state, $http, ctrlShareObj, projectStorageProvider) {
    const github = projectStorageProvider.getDataSource('github');
    $scope.websitePage = {};
    $scope.submit = function () {
        github.saveFile(ctrlShareObj.website.name + '/' + $scope.websitePage.name, $scope.websitePage.content, $scope.message);
    }
    /*
    $scope.websites = [];
    $scope.websitePages = [];
    $scope.style = {}
    var website = ctrlShareObj.website || {};
*/
    init();

    function init() {
        // 获取用户站点列表
        /*
        $http.post('http://localhost:8099/api/wiki/models/website',{userid:1}).then(function (response) {
            $scope.websites = response.data;
        }).catch(function (response) {
            console.log(response.data);
        });
        */
        // 获取网站所有页面
		/*
        $http.post('http://localhost:8099/api/wiki/models/website_pages',{websiteName:website.name}).then(function (response) {
            $scope.websitePages = response.data.data;
        }).catch(function (response) {
            console.log(response.data);
        });
		*/
        // 获取网站模板样式  页面内容嵌套在模板内部 编辑不需模板吧？？ 预览时你也可以获取自行嵌套
        /*
        $http.post('http://localhost:8099/api/wiki/models/website_template_style', {_id:website.styleId}).then(function (response) {
            $scope.style = response.data;  // 模板代码style.content
        })
        */
    }
/*
    $scope.submit = function () {
        var isEdit =false;
        $scope.websitePage.path = $scope.websitePage.websiteName + '/' +  $scope.websitePage.name;
        console.log($scope.websitePage);
        if (isEdit == false) { // 新增
            $http.put(config.apiUrlPrefix+'website_pages/new',$scope.websitePage).then(function (response) {
                console.log(response.data.data);
				$scope.websitePage.name = "";
				$scope.websitePage.content = "";
            }).catch(function (response) {
                console.log(response.data);
            });
        } else {  // 修改
            $http.put(config.apiUrlPrefix+'website_pages',$scope.websitePage).then(function (response) {
                console.log(response.data.data);
				$scope.websitePage.name = "";
				$scope.websitePage.content = "";
            }).catch(function (response) {
                console.log(response.data);
            });
        }
    }
*/
});

app.controller('websiteCtrl', function ($scope,$state,$http, Account, ctrlShareObj) {
    $scope.websites = [];
    $scope.max_free_count = 3;

    getWebsistes();
    function getWebsistes() {
        // 获取项目列表
        util.http($http,'POST', config.apiUrlPrefix+'website',{userid:Account.getUser()._id || -1}, function (data) {
            $scope.websites = data;
        });
    }
/*
	$scope.goWebsitePage = function(website) {
		window.location.href = window.location.host + '/' + website.name;
	}
*/
    $scope.goWebsiteIndexPage = function(websiteName) {
        ctrlShareObj.pageContentUrl = websiteName + '/index';
        ctrlShareObj.sitename = websiteName;
        ctrlShareObj.pagename = 'index';
        $state.go('custom');
	//window.location.href= '/' + websiteName;
    }

	$scope.goEditWebsitePagePage = function (website) {
        ctrlShareObj.website = website;
        console.log(ctrlShareObj.website);
        $state.go('index.editWebsitePage');
        //window.location.href="/wiki/editor";
    }

    $scope.goCreateWebsitePage = function () {
        ctrlShareObj.website = undefined;
        $state.go('index.createWebsite');
    }

    $scope.goEditWebsitePage = function (website) {
        ctrlShareObj.website = website;
        $state.go('index.createWebsite');
    }

    $scope.deleteWebsite = function(id) {
        util.http($http, "DELETE", config.apiUrlPrefix+'website', {_id:id}, function (data) {
            $scope.websites = data;
        });
    }
});

app.controller('createWebsiteCtrl', function ($scope, $state, $http, $sce, ctrlShareObj) {
    $scope.website = ctrlShareObj.website || {};
    $scope.editWebsite = ctrlShareObj.website ? true : false;
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
    init();

    function init() {
        util.http($http, 'POST', config.apiUrlPrefix+'website_category',{}, function (data) {
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
        console.log($scope.website);
        var url = config.apiUrlPrefix + "website";

        if (!$scope.editWebsite) {
            url += '/new';
        }

        util.http($http, 'PUT', url, $scope.website, function (data) {
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

        util.http($http, 'POST', config.apiUrlPrefix+'website', {name:$scope.website.name}, function (data) {
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
        util.http($http, 'POST', config.apiUrlPrefix+'website', {domain:$scope.website.domain}, function (data) {
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
        window.open(url.replace(hash, '') + '?' + style._id + '#/preview');
    }
});

app.controller('previewCtrl', function ($scope, $http, $sce) {
    var styleId = window.location.search.replace('?','');
    styleId = parseInt(styleId);
    util.http($http, 'POST', config.apiUrlPrefix+'website_template_style/getWebsiteTemplateStyleById',{_id:styleId}, function (data) {
        $scope.style = data;
        if (data.content) {
            $scope.content = $sce.trustAsHtml(data.content);
        } else {
            $scope.content = $sce.trustAsHtml('<div>--------something wrong-----------</div>');
        }
    })
});

