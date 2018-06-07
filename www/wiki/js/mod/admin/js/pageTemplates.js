/**
 * Created by 18730 on 2017/10/23.
 */
define([
    'app',
    'helper/util',
    'helper/storage',
    'markdown-it',
    'text!wikimod/admin/html/pageTemplates.html',
    'js-base64',
], function (app, util, storage, markdownit, htmlContent) {
    const GITLAB = {
        "API_BASE_URL": "https://api.keepwork.com/git/api/v4",
        "FILE_PATH": "official%2Ftemplate%2FpageTemplateConfig%2Emd",// 模板配置保存页面 official/template/webTemplateConfig
        "REF": "master",
        "PRIVATE_TOKEN": "Gsx7JYVFxvsDod2MY2x5",
        "ID": "6803"
    };

    app.registerController("pageTemplatesController", ["$scope","$uibModal", "$http", "Message", function ($scope, $uibModal, $http, Message) {
        $scope.categories = [];
        $scope.newClassify = {
            "name": "",
            "classify":"",
            "templates":[]
        };

        $scope.newTemplate = {
            "name":"",
            "logoUrl":"",
            "previewUrl":"",
            "styles":[]
        };
        $scope.newStyle = {};
        $scope.newContent = {};
        var initCategories = function() {
            var url = GITLAB.API_BASE_URL + "/projects/" + GITLAB.ID +"/repository/files/" + GITLAB.FILE_PATH;
            var params = {
                "ref": GITLAB.REF
            };
            var isShowLoading = true;
            util.http("GET", url, params, function (result) {
                console.log(result);
            }, function (result) {
                if (!result.content){
                    return;
                }
                var content = Base64.decode(result.content),
                    md = markdownit(),
                    parserContent = md.parse(content)[0].content || "";
                try{
                    $scope.categories = angular.fromJson(parserContent);
                    $scope.activeCategories = $scope.categories[0];
                }catch (e){
                    console.log(e);
                }
            }, isShowLoading);
        };

        var saveWebsiteTemplates = function (message) {
            console.log(JSON.stringify($scope.categories));
            var config = {
                method: "PUT",
                url: GITLAB.API_BASE_URL + "/projects/" + GITLAB.ID +"/repository/files/" + GITLAB.FILE_PATH,
                data:{
                    "branch": GITLAB.REF,
                    "content": "```\n" + JSON.stringify($scope.categories) + "\n```",
                    "commit_message": message
                },
                headers: {
                    "PRIVATE-TOKEN": GITLAB.PRIVATE_TOKEN
                },
                skipAuthorization: true,  // 跳过插件satellizer认证
                isShowLoading: false
            };
            console.log(config.url);
            $http(config).then(function (result) {
                console.log(result);
                if (result.status == 200){
                    Message.info("保存成功");
                }else{
                    Message.danger("保存失败，请将控制台的错误截图给程序员");
                    console.log(result)
                }
            }).catch(function (err) {
                console.log(err);
            });
        };

        function init() {
            console.log("init tempsdfgghlates");
            initCategories();
        }

        // 选择显示某种网站模板分类
        $scope.selectCategory = function (category) {
            $scope.activeCategories = category;
        };
        // 添加模板分类
        $scope.saveClassify = function () {
            $scope.categories.push($scope.newClassify);
            $scope.newClassify = {
                "name": "",
                "classify":"",
                "templates":[]
            };
            saveWebsiteTemplates("addClassify");
        };
        // 添加新网站模板
        $scope.addTemplate = function (index) {
            console.log(index);
            if (index >= 0){
                $scope.activeCategories.templates[index] = $scope.newTemplate;
                $("#editTemplateModal").modal("toggle");
            }else{
                $scope.activeCategories.templates.push($scope.newTemplate);
                console.log($scope.categories);
            }
            saveWebsiteTemplates("addTemplate");
            $scope.newTemplate = {
                "name":"",
                "logoUrl":"",
                "previewUrl":"",
                "styles":[]
            };
        };
        // 给模板添加style
        $scope.addStyle = function (index) {
            if (index >= 0){
                $scope.newTemplate.styles[index] = $scope.newStyle;
            }else{
                $scope.newTemplate.styles.push($scope.newStyle);
            }
            $scope.newStyle = {};
        };
        // 给style添加网页模板
        $scope.addContent = function (index) {
            if (index >= 0){
                $scope.newStyle.contents[index] = $scope.newContent;
            }else{
                $scope.newStyle.contents = $scope.newStyle.contents ? $scope.newStyle.contents : [];
                $scope.newStyle.contents.push($scope.newContent)
            }
            $scope.newContent = {};
        };

        $scope.setValue = function (obj) {
            $scope[obj.key] = obj.value;
            $scope[obj.key].index = obj.index;
        };

        // 编辑网站模板
        $scope.editTemplate = function (template, index) {
            template.index = index;
            $scope.newTemplate = template;
            $("#editTemplateModal").modal("toggle");
        };

        // 删除网站模板分类
        $scope.deleteClassify = function (classify, index) {
            config.services.confirmDialog({
                "title":"删除提醒",
                "confirmBtnClass":"btn-danger",
                "theme":"danger",
                "content":"确定删除 " + (classify.name) + " 分类？"
            },function(){
                $scope.categories.splice(index, 1);
                saveWebsiteTemplates("deleteClassify");
            });
        };
        // 删除网站模板
        $scope.deleteTemplate = function (template, index) {
            config.services.confirmDialog({
                "title":"删除提醒",
                "confirmBtnClass":"btn-danger",
                "theme":"danger",
                "content":"确定删除 " + (template.name) + " 模板？"
            },function(){
                $scope.activeCategories.templates.splice(index, 1);
                saveWebsiteTemplates("deleteTemplate");
            });
        };

        $scope.$watch("$viewContentLoaded", init);

        $scope.goPreviewPage = function (url) {
            window.open(url);
        }
    }]);
    return htmlContent;
});