/**
 * Created by wuxiangan on 2016/9/26.
 */


app.controller('mainCtrl', function ($scope, $rootScope,$state) {
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
    $scope.debug = "hello world";
});

app.controller('indexHeaderCtrl', function ($scope, $rootScope, $state, userinfo) {
    $scope.goMyProject = function () {
        $state.go('index.project');
    }
});

app.controller('loginCtrl', function ($scope,$state) {
    $scope.login=function () {
        console.log("login");
        $state.go('index.login');
    }
});

app.controller('registerCtrl', function ($scope,$state) {

});

app.controller('indexCtrl', function ($scope,$state, $sce,userinfo) {
    $scope.content = $sce.trustAsHtml("<style>#test {color:red;}</style> <div id='test'>hello world</div>");


    $state.go('index.index');
    $scope.testClick = function () {
        $state.go('test');
    }
});

app.controller('websiteCtrl', function ($scope,$state,$http, userinfo) {
    $scope.websites = [];
    $scope.max_free_count = 3;

    getWebsistes();

    function getWebsistes() {
        // 获取项目列表
        $http.post(config.apiUrlPrefix+'website',{userid:userinfo.userid}).then(function (response) {
            $scope.websites = response.data;
            userinfo.websites = $scope.websites;
        }).catch(function (response) {
            console.log(response.data);
        });
    }

    $scope.goCreateProjectPage = function () {
        userinfo.website = {};
        $state.go('index.createProject');
    }

    $scope.goEditProjectPage = function (website) {
        userinfo.website = website;
        $state.go('index.createProject');
    }

    $scope.deleteWebsite = function(id) {
        $http({method:"DELETE", url:config.apiUrlPrefix+'website', params:{_id:id}}).then(function (response) {
            $scope.websites = response.data;
        }).catch(function (response) {
            console.log(response.data);
        });
    }
});

app.controller('createWebsiteCtrl', function ($scope, $state, $http, $sce, userinfo) {
    $scope.website = userinfo.website || {};
    $scope.editWebsite = userinfo.website ? true : false;
    $scope.websiteNameErrMsg = "";
    $scope.websiteDomainErrMsg = "";
    $scope.errMsg = "";
    $scope.tags = $scope.website.tags ? $scope.website.tags.split('|') : [];
    $scope.commonTags = ['旅游', '摄影', 'IT', '游戏', '生活']
    $scope.categories = [];//[{name:'个人网站'},{name:'作品网站'},{name:'组织网站'}];
    $scope.subCategories = [];
    $scope.step = 1;
    $scope.nextStepEnable = !$scope.website.name;

    init();

    function init() {
        $http.get(config.apiUrlPrefix+'website_category').then(function (response) {
            $scope.categories = response.data;
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
                    break;
                }
            }

            for (var i = 0; $scope.templates && i < $scope.templates.length; i++) {
                if ($scope.website.templateId == $scope.templates[i]._id) {
                    $scope.styles = $scope.templates[i].styles;
                    break;
                }
            }
        }).catch(function (response) {
            console.log(response.data);
        });
    }

    function  createWebsiteRequest() {
        console.log($scope.website);
        var url = config.apiUrlPrefix + "website";

        if (!$scope.editWebsite) {
            url += '/new';
        }

        $http.put(url, $scope.website).then(function (response) {
            console.log(response.data);
            $scope.step++;
        }).catch(function (response) {
            console.log(response.data);
        });
    }

    $scope.selectCategory = function (category) {
        $scope.templates = category.templates;
        $scope.website.categoryId = category._id;
        $scope.website.categoryName = category.name;
    }

    $scope.selectTemplate = function (template) {
        $scope.styles = template.styles;
        $scope.website.templateId = template._id;
        $scope.website.templateName = template.name;
        $scope.nextStepEnable = false;
    }

    $scope.selectStyle = function (style) {
        $scope.website.styleId = style._id;
        $scope.website.styleName = style.name;
        $scope.nextStepEnable = false;
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
        $scope.website.name = $scope.website.name.replace(/(^\s*)|(\s*$)/g, "");
        if (!$scope.website.name) {
            return;
        }
        $http.post(config.apiUrlPrefix+'website', {name:$scope.website.name}).then(function (response) {
            if (response.data && response.data.length > 0) {
                if ($scope.website._id != response.data[0]._id) {
                    $scope.websiteNameErrMsg = $scope.website.name + "已存在，请换个名字";
                }
            } else {
                $scope.websiteNameErrMsg = "";
            }
        }).catch(function (response) {
           console.log(response.data);
        });

        if (!$scope.websiteNameErrMsg) {
            $scope.nextStepEnable = false;
        }
    }

    $scope.checkWebsiteDomain = function () {
        $scope.website.domain = $scope.website.domain.replace(/(^\s*)|(\s*$)/g, "");
        if ($scope.website.domain && $scope)
        $http.post(config.apiUrlPrefix+'website', {domain:$scope.website.domain + ".wikicraft.cn"}).then(function (response) {
            if (response.data && response.data.length > 0) {
                $scope.websiteDomainErrMsg = $scope.website.domain + "已存在，请换个名字";
            } else {
                $scope.websiteDomainErrMsg = "";
            }
        }).catch(function (response) {
            console.log(response.data);
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
            $scope.nextStepEnable = !$scope.website.templateId;
        } else if ($scope.step == 3) {
            if (!$scope.website.templateId) {
                $scope.errMsg = "请选择站点类型和模板";
                return ;
            }
            $scope.nextStepEnable = !$scope.website.styleId;
        } else if ($scope.step == 4) {
            if (!$scope.website.styleId) {
                $scope.errMsg = "请选择模板样式";
            }
            createWebsiteRequest();
            return;
        } else {
            $state.go('index.project');
        }
        $scope.step++;
    }

    $scope.prevStep = function () {
        $scope.step--;
        $scope.nextStepEnable = false;
    }
});
/*
 controller('LoginCtrl', function ($scope) {
    $scope.username="xiaoyao";
    $scope.email="765485868@qq.com";
    $scope.phone="18702759796";
    $scope.password="wuxiangan";
});
.controller('IndexHeaderCtrl', function ($scope) {
    
});
 */