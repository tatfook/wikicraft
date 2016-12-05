/**
 * Created by wuxiangan on 2016/11/4.
 */

function ModuleParser($scope){
    this.$http = util.getAngularServices().$http;
    this.$scope = $scope;
    this.$compile = util.getAngularServices().$compile;
    this.moduleList = [];

    // 解析模块命令
    this.parse = function(pageContent) {
        this.moduleList = [];

        var tplReg = /<!--\s*\[(.+)\]\(*(.*)\)\s*-->/;
        var newPageContent = "", moduleName = "",moduleParam = "", moduleUrl = "" ;
        var moduleId = 0;  // 给模块
        while (true) {
            moduleId = util.getId();
            var mod = pageContent.match(tplReg);
            if (mod == undefined) {
                newPageContent += pageContent;
                break;
            }

            newPageContent += pageContent.substring(0, mod.index);
            moduleUrl = mod[1];
            moduleName = moduleUrl.replace(/\//g,'_');
            moduleTagId = '__' + moduleName + moduleId + '__';                         // 加个ID使通一模块可重复使用
            moduleContainerTagId = '__' + moduleName + moduleId + '_container__';
            moduleParam = util.stringToJson(mod[2]);
            pageContent = pageContent.substr(mod.index + mod[0].length);

            if (moduleName.match(/\/Template.*/)) {
                continue;
            }
            newPageContent += '<div id="'+moduleContainerTagId + '"><div id="'+ moduleTagId +'"></div></div>';
            this.moduleList.push({moduleName:moduleName,moduleUrl:moduleUrl, moduleTagId:moduleTagId, moduleParam:moduleParam});
        }

        // 压入动态请求的脚本
        util.push(this);
        newPageContent += '<script type="text/javascript">var obj = util.pop();console.log(obj); obj && obj.renderModule && obj.renderModule();</script>'

        // 在返回之前加上markdown-it解析
        //var md = window.markdownit({html:true});
        //newPageContent = md.render(newPageContent);

        return newPageContent ;
    };

    // 获取模板参数
    this.getTemplateModule = function (pageContent) {
        var tplReg = /<!--\s*\[(\/Template.*)\]\(*(.*)\)\s*-->/;
        var tpl = pageContent.match(tplReg);

        if (tpl == undefined) {
            return {moduleUrl:"/Template/Default", moduleParam:{}};          //返回默认模板
        }
        return {moduleUrl:tpl[1], moduleParam:util.stringToJson(tpl[2])};       //自定义模板
    };

    this.removeTemplateModule = function (pageContent) {
        var tplReg = /<!--\s*\[(\/Template.*)\]\(*(.*)\)\s*-->/;
        return pageContent.replace(tplReg, '');
    }

    // 获取模块内容
    this.getModulePage = function (module) {
        var self = this;
        var suffix = module.moduleParam.isPreview ? "Preview" : "";
        //self.$http.get(config.modulePageUrlPrefix + 'PageNavigation/PageNavigation' + suffix + ".html").then(function (response) {
        this.$http.get(config.modulePageUrlPrefix + module.moduleUrl + suffix + '.html').then(function (response) {
            $('#' + module.moduleTagId).html(self.$compile(response.data)(self.$scope));
        }).catch(function (response) {
            $('#' + module.moduleTagId).html(module.moduleName);
        });
    }
    // 渲染模块
    this.renderModule =  function() {
        for (var i = 0; i < this.moduleList.length; i++) {
            this.getModulePage(this.moduleList[i]);
        }
    };

    // 渲染页面
    this.render = function (pageContent) {
        var self = this;
        var tplModule = this.getTemplateModule(pageContent);
        var suffix = tplModule.moduleParam.isPreview ? "Preview" : "";
        
        pageContent = this.removeTemplateModule(pageContent);
        // 获取模板
        this.$http.get(config.modulePageUrlPrefix + tplModule.moduleUrl + suffix + ".html").then(function (response) {
            var tplContent = response.data;
            var tplPageContent = tplContent.replace('__PageContent__', pageContent);
            tplPageContent = self.parse(tplPageContent);  // 模块嵌套模块
            //console.log(tplPageContent);
            tplPageContent = self.$compile(tplPageContent)(self.$scope);
            $('#__StyleTemplateContent__').html(tplPageContent);
        });
    }
}
