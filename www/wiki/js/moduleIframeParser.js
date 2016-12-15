/**
 * Created by wuxiangan on 2016/11/4.
 */

function ModuleIframeParser(){
    this.moduleList = [];

    // 解析模块命令
    this.parse = function(pageContent) {
        this.moduleList = [];

        var tplReg = /<!--\s*\[(\/.+)\]\(*(.*)\)\s*-->/;
        var newPageContent = "", moduleName = "",moduleParams = "", moduleUrl = "", backgroundStyle = "", temp = "", backgroundExist = false ;
        var moduleId = 0;  // 给模块
        while (true) {
            moduleId = util.getId();
            var mod = pageContent.match(tplReg);
            if (mod == undefined) {
                newPageContent += pageContent;
                break;
            }

            newPageContent += pageContent.substring(0, mod.index);
            pageContent = pageContent.substr(mod.index + mod[0].length);

            moduleUrl = mod[1];
            temp = moduleUrl.replace(/\//g,'_');
            moduleTagId = '__' + temp + '_' + moduleId + '__';                         // 加个ID使通一模块可重复使用
            moduleContainerTagId = '__' + temp + '_'+ moduleId + '_container__';
            //moduleParams = mod[2];
            moduleParams = util.stringToJson(mod[2]);
            //console.log(moduleParams);
            moduleName = moduleUrl.match(/\/([^\/]+)/)[1];
            if (moduleName == "template") {
                continue;
            }
            console.log(moduleName);
            if (backgroundExist == false && moduleName == "background") {
                backgroundStyle = 'position: absolute; left: 0px; right: 0px; z-index: -1;';
                backgroundExist = true;
            } else {
                backgroundStyle = "";
            }

            //moduleUrl = config.modulePageUrlPrefix + moduleUrl  + '?' +  this.objectToUrlQueryString(moduleParams,"params");
            moduleUrl = config.modulePageUrlPrefix + moduleUrl;
            //newPageContent += '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
            newPageContent += '<div style=" display: flex; flex-direction: column;'+ backgroundStyle +'"> <iframe id="' + moduleContainerTagId + '" name="' + moduleContainerTagId +
                '" src="' + moduleUrl + '" scrolling="no" frameborder="0" marginwidth="0"  marginheight="0" allowtransparency="true"></iframe></div>';
            this.moduleList.push({moduleName:moduleName,moduleUrl:moduleUrl, moduleTagId:moduleTagId, moduleParams:moduleParams,moduleContainerTagId:moduleContainerTagId});
        }

        // 压入动态请求的脚本
        util.push(this);
        newPageContent += '<script type="text/javascript">var obj = util.pop();console.log(obj); obj && obj.renderModule && obj.renderModule();</script>';

        // 在返回之前加上markdown-it解析
        //var md = window.markdownit({html:true});
        //newPageContent = md.render(newPageContent);

        return newPageContent ;
    };

    // 获取模板参数
    this.getTemplateModule = function (pageContent) {
        var tplReg = /<!--\s*\[(\/template\/.*)\]\(*(.*)\)\s*-->/;
        var tpl = pageContent.match(tplReg);

        if (tpl == undefined) {
            return {moduleUrl:"/template/default", moduleParam:{}};          //返回默认模板
        }
        return {moduleUrl:tpl[1], moduleParam:util.stringToJson(tpl[2])};       //自定义模板
    };

    this.removeTemplateModule = function (pageContent) {
        var tplReg = /<!--\s*\[(\/template\/.*)\]\(*(.*)\)\s*-->/;
        return pageContent.replace(tplReg, '');
    }

    // 渲染模块
    this.renderModule =  function() {
        var self = this;
        for (var i = 0; i < self.moduleList.length; i++) {
            var iframeId = self.moduleList[i].moduleContainerTagId;
            var iframe = document.getElementById(iframeId);
            iframe.contentWindow.IframeId = iframeId;
            iframe.contentWindow.iframeParams = util.getIframeParams();
            iframe.contentWindow.moduleObj = self.moduleList[i];
        }
    };

    // 渲染页面
    this.render = function (pageContent) {
        var self = this;
        var $http = util.getAngularServices().$http;
        var tplModule = this.getTemplateModule(pageContent);
        var suffix = tplModule.moduleParam.isPreview ? "Preview" : "";
        
        pageContent = this.removeTemplateModule(pageContent);
        // 获取模板
        $http.get(config.modulePageUrlPrefix + tplModule.moduleUrl + suffix + ".html").then(function (response) {
            var tplContent = response.data;
            var tplPageContent = tplContent.replace('__PageContent__', pageContent);
            tplPageContent = self.parse(tplPageContent);  // 模块嵌套模块
            console.log(tplPageContent);
            //tplPageContent = self.$compile(tplPageContent)(self.$scope);
            $('#__UserSitePageContent__').html(tplPageContent);
        });
    }

    this.objectToUrlQueryString = function(param, key){
        var self = this;
        var paramStr="";
        if(typeof(param) == "string" || typeof(param) == "number" || typeof(param) == "boolean"){
            paramStr+="&"+key+"="+encodeURIComponent(param);
        }else{
            $.each(param,function(i){
                var k=key==null?i:key+(param instanceof Array?"["+i+"]":"."+i);
                paramStr+='&'+self.objectToUrlQueryString(this, k);
            });
        }
        return paramStr.substr(1);
    };
}
