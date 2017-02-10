/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app', 'helper/util', 'helper/storage','text!html/createWebsite'], function (app, util, storage, htmlContent) {
   var controller =  ['$scope', '$state', '$sce', 'Account', function ($scope, $state, $sce, Account) {
       //const github = ProjectStorageProvider.getDataSource('github');
       $scope.website = storage.sessionStorageGetItem("createWebsiteParams") || {};
       $scope.editWebsite = $scope.website._id ? true : false;
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
       var logoContent = undefined;
       init();

       $('#uploadImageBtn').change(function (e) {
           var fileReader = new FileReader();
           fileReader.onload = function(){
               $('#websiteLogo').attr('src',fileReader.result);
               logoContent = fileReader.result;
           };
           fileReader.readAsDataURL(e.target.files[0]);
       });

       function init() {
           /*
            if ($scope.website.logoUrl) {
            $http.get("https://raw.githubusercontent.com/wxaxiaoyao/wikicraftDataSource/master/images/website/websiteLogo_1479116829615").then(function (response) {
            $('#websiteLogo').attr('src',response.data);
            });
            }
            */
           //util.http('POST', config.apiUrlPrefix+'website_category',{}, function (data) {
           util.http('POST', config.apiUrlPrefix+'website_template_config',{}, function (data) {
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
           $scope.website.userId = Account.getUser()._id;
           $scope.website.username = Account.getUser().username;

           var url = config.apiUrlPrefix + "website";
           console.log($scope.website);

           if (!$scope.editWebsite) {
               url += '/new';
           }
           util.http('PUT', url, $scope.website, function (data) {
               $scope.step++;
           });
           /*
            if (logoContent) {
            var date = new Date();
            var filename = 'website/logoContent' + date.getTime();
            github.uploadImage(filename, logoContent, function (error, result, request) {
            if (error) {
            console.log(error);
            } else {
            $scope.website.logoUrl = result.content.download_url;
            }
            // 修改logourl
            util.http('PUT', config.apiUrlPrefix + "website", $scope.website, function (data) {
            $scope.step++;
            });
            });
            }
            */
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

           util.http('POST', config.apiUrlPrefix+'website', {name:$scope.website.name}, function (data) {
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
           util.http('POST', config.apiUrlPrefix+'website', {domain:$scope.website.domain}, function (data) {
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
               $state.go('website');
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
           window.open(url.replace(hash, '') + '?' + style.previewFilename + '#/preview');
       }

       // 访问网站
       $scope.goWebsiteIndexPage = function(websiteName) {
           window.location.href = '/' + websiteName;
       }
   }];

    //controller.$inject = ['$scope', '$state', '$sce', 'Account'];
    app.registerController('createWebsiteController', controller);
    return htmlContent;
});