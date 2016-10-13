/**
 * Created by wuxiangan on 2016/9/26.
 */

app.controller('mainCtrl', function ($scope,$state, $sce) {
});

app.controller('indexCtrl', function ($scope,$state, $sce) {
    //$state.go('index.index');
    $state.go('index.project');
});

app.controller('websiteCtrl', function ($scope,$state,$http, Account, ctrlShareObj) {
    $scope.websites = [];
    $scope.max_free_count = 3;

    getWebsistes();

    function getWebsistes() {
        // 获取项目列表
        $http.post(config.apiUrlPrefix+'website',{userid:Account._id}).then(function (response) {
            $scope.websites = response.data;
            ctrlShareObj.websites = $scope.websites;
        }).catch(function (response) {
            console.log(response.data);
        });
    }

    $scope.goCreateProjectPage = function () {
        ctrlShareObj.website = undefined;
        $state.go('index.createProject');
    }

    $scope.goEditProjectPage = function (website) {
        ctrlShareObj.website = website;
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
        $http.post(config.apiUrlPrefix+'website', {domain:$scope.website.domain}).then(function (response) {
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


    $scope.goPreviewPage = function (style) {
        ctrlShareObj.style = style;
        window.open(config.previewUrl);
    }
});

app.controller('previewCtrl', function ($scope, $state, $http, $sce, ctrlShareObj) {
    $scope.style = ctrlShareObj.style || {};
});

