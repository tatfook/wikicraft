
define([
	"app",
	"modeditor/tag",
], function(app, tagFactory){

	var tags = {};
	
	tags.tagList = [
	{
		name:"行容器",
		type:"rowDiv",
		tag:"div",
		classify: "基本Tag",
	},
	{
		name:"列容器",
		type:"colDiv",
		tag:"div",
		classify: "基本Tag",
	},
	{
		name:"文本",
		type:"text",
		tag:"span",
		classify: "基本Tag",
	},
	{
		name:"一级标题",
		type:"h1",
		tag:"h1",
		classify: "基本Tag",
	},
	{
		name:"二级标题",
		type:"h2",
		tag:"h2",
		classify: "基本Tag",
	},
	{
		name:"三级标题",
		type:"h3",
		tag:"h3",
		classify: "基本Tag",
	},
	//{
		//name:"段落",
		//type:"p",
		//tag:"p",
	//},
	{
		name:"图片",
		type:"img",
		tag:"img",
		classify: "基本Tag",
	},
	{
		name:"链接",
		type:"a",
		tag:"a",
		classify: "基本Tag",
	},
	];

	// tag树型结构
	tags.tagTree = function() {
		var self = this;
		var tree = [
		{
			classify: "基本Tag",
		}
		];

		var tagList = self.tagList;
		for (var i = 0; i < tagList.length; i++){
			for (var j = 0; j < tree.length; j++) {
				if (tree[j].classify == tagList[i].classify) {
					tree[j].nodes = tree[j].nodes || [];
					tree[j].nodes.push(tagList[i]);
				}
			}
		}
		
		return tree;
	}

	// 定义容器tag
	tags.divTag = function() {
		var tag = tagFactory("div");
		tag.name = "容器";

		//tag.attrs.style["display"] = "flex";

		return tag;
	}

	// 行容器
	tags.rowDivTag = function() {
		var self = this;
		var tag = self.divTag();

		tag.name = "行容器";
		tag.attrs.style["display"] = "flex";

		return tag;
	}

	// 列容器
	tags.colDivTag = function() {
		var self = this;
		var tag = self.divTag();

		tag.name = "列容器";
		tag.attrs.style["display"] = "flex";
		tag.attrs.style["flex-direction"] = "column";

		return tag;
	}

	// 定义图片tag
	tags.imgTag = function() {
		var tag = tagFactory("img");
		tag.name = "图片";
		
		tag.vars = [
			{
				text:"http://www.runoob.com/try/bootstrap/layoutit/v3/default3.jpg",
				$data:{
					type:"attr",  // 属性变量
					attrName:"ng-src",
					key:"src",
				},
			},

		];

		return tag;
	}

	// 文本tag
	tags.textTag = function(opt) {
		var tag = tagFactory("span");
		tag.name = "文本";

		opt = opt || {};
		tag.vars = [
			{
				text: opt.text || "这是一个文本",

				$data: {
					type:"text",  // 文件变量  用于标签内容显示
					key:"content",  // 变量名
				}
			}
		];

		return tag;
	}

	// 标题
	tags.hTag = function(hn) {
		var tag = tagFactory(hn);
		tag.name = "标题";

		//tag.addTag(tags.textTag({text:"这是一个标题"}));
		tag.vars = [
			{
				text:"这是一个标题",

				$data: {
					type:"text",  // 文件变量  用于标签内容显示
					key:"content",  // 变量名
				}
			}
		];

		return tag;
	}

	// 一级标题
	tags.h1Tag = function() {
		var self = this;

		var tag = self.hTag("h1");

		tag.name = "一级标题";

		return tag;
	}

	// 二级标题
	tags.h2Tag = function() {
		var self = this;

		var tag = self.hTag("h2");

		tag.name = "二级标题";

		return tag;
	}

	// 三级标题
	tags.h3Tag = function() {
		var self = this;

		var tag = self.hTag("h3");

		tag.name = "三级标题";

		return tag;
	}

	// 段落标签
	tags.pTag = function() {
		var tag = tagFactory("p");
		tag.name = "段落";

		//tag.addTag(tags.textTag({text:"这是一个段落"}));

		tag.vars = [
			{
				text:"这是一个段落",

				$data: {
					type:"text",  // 文件变量  用于标签内容显示
					key:"content",  // 变量名
				}
			}
		];

		return tag;
	}
	
	// 链接
	tags.aTag = function() {
		var tag = tagFactory("a");
		tag.name = "链接";
		
		tag.vars = [
			{
				text:"",
				$data:{
					type:"attr",  // 属性变量
					attrName:"ng-href",
					key:"href",
				},
			},
			{
				text:"这是一个链接",

				$data: {
					type:"text",  // 文件变量  用于标签内容显示
					key:"content",  // 变量名
				}
			}
		];

		return tag;
	}
	tags.getTag = function(typ) {
		var funcname = typ + "Tag";

		if (tags[funcname] && typeof(tags[funcname]) == "function") {
			return (tags[funcname])();
		}

		return undefined;
	}


	return tags;
})
