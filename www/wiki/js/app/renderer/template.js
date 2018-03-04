
define([
	"app",
	"helper/toolbase",
], function(app, toolbase){

	var _template = {};
	app.mixin(_template, toolbase);

	// 模板匹配
	_template.match = function(block) {
		var modParams = block.modParams;
		var pageinfo = app.ng_objects.$rootScope.pageinfo;

		// 临时页做全匹配
		if (!pageinfo) {
			return true;
		}

		var urlPrefix = "/" + pageinfo.username + "/" + pageinfo.sitename + "/";
		var tempUrl = pageinfo.url || pageinfo.pagepath || pageinfo.pagename;
		var pagePath = tempUrl.substring(urlPrefix.length);

		if (typeof(modParams) != "object" || !modParams.urlmatch || !modParams.urlmatch.text) {
			return true;
		}
		// 存在urlmatch 字段 做一个子串匹配
		if (pagePath && pagePath.indexOf(modParams.urlmatch.text) >= 0) {
			return true;
		}
		//console.log(pageinfo, pagePath, modParams);

		return false;
	}

	_template.setTemplate = function(block) {
		var self = this;
		var templateText = self.text;

		self.templateBlock = block;
		if (self.mode != "preview" && block) {
			self.text = block.text;
			self.token = block.token;
			self.modName = block.modName;
			self.cmdName = block.cmdName;
			self.modParams = block.modParams;
			self.wikimod = block.wikimod;
			self.applyModParams = block.applyModParams;
			self.render = block.render;
		} else {
			self.text = undefined;
			self.token = undefined;
			self.modName = undefined;
			self.cmdName = undefined;
			self.modParams = undefined;
			self.wikimod = undefined;
			self.applyModParams = undefined;
			self.render = self.defaultRender;
		}

		if (templateText != self.text) {
			self.isChange = true;
		} else {
			self.isChange = false;
		}
	}

	_template.defaultRender = function(success){
		var self = this;

		if (self.htmlContent != self.blankTemplateContent && self.$render) {
			self.htmlContent = self.blankTemplateContent;
			//self.$render(self.blankTemplateContent);
			self.dispatchEvent("render", self.htmlContent);
		}

		success && success();
	}

	function templateFactory(template, md) {
		template = template || angular.copy(_template);
		var encodeMdName = encodeURI(md.mdName);
		var templateContent = "";

		if (md.mode == "preview") {
			templateContent = '<div class="wikiEditor" ng-repeat="$kp_block in $kp_block.blockList track by $index"><wiki-block-container data-params="' + encodeMdName +'"></wiki-block-container></div>';
		} else {
			templateContent = '<div class="wikiEditor" ng-repeat="$kp_block in $kp_block.blockList track by $index" ng-if="!$kp_block.isTemplate"><wiki-block-container data-params="' + encodeMdName +'"></wiki-block-container></div>';
		}

		var blankTemplateContent = '<div>' + templateContent + '</div>';


		template.md = md;
		template.mdName = md.mdName;
		template.mode = md.mode;
		template.isTemplate = true;
		template.isWikiBlock = true;
		template.templateContent = templateContent;
		template.blankTemplateContent = blankTemplateContent;
		template.text = undefined;
		template.blockList = [];

		return template;
	}

	return templateFactory;
});
