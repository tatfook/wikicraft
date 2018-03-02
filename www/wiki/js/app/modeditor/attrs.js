
define([
	"app",
], function(app) {
	var attr = {};

	attr.id = "元素唯一id";
	attr.class = "元素类名";
	attr.accesskey = "访问元素快捷键";
	attr.style = "元素行内样式";
	attr.title = "元素额外信息";

	var attrs = {};
	attrs.class = []; // 标签类列表
	attrs.style = {}; // 标签样式

	attrs.html = function(){

	}

	function attrsFactory() {
		return attr;
	}

	return attrsFactory;
});
