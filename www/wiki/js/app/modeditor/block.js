
define([
	"app",
	"modeditor/tag",
], function(app, tagFactory) {
	var block = {};

	block.tag = tagFactory();
	block.styles = [];  // tag 列表
	block.params = {};  // block 参数 变量

	block.addStyle = function(tag) {
		var self = this;

		for(var i = 0; i < self.styles.length; i++){
			if (self.styles[i].tagId == tag.tagId) {
				return;
			}
		}

		self.styles.push(angular.copy(tag));
	}

	block.deleteStyle = function(tag) {
		var styles = [];

		for(var i = 0; i < self.styles.length; i++){
			if (self.styles[i].tagId == tag.tagId) {
				continue;
			}

			styles.push(self.styles[i]);
		}
		
		self.styles = styles;
	}

	block.html = function() {
		return block.tag.html();
	}

	return block;
});
