
define([
], function () {
	var mdconf = {};

	// md 转json对象
	mdconf.mdToJson = function(text) {
		var temp_lines = text.trim().split("\n");
		var lines = [];
		var line = "";
		var conf = {};
		var curConf = conf;

		var getObj = function(key) {
			if (!key) {
				return conf;
			}
			var keys = key.split(".");
			var tmpConf = conf;
			for (var i = 0; i < keys.length; i++){
				tmpConf[keys[i]] = tmpConf[keys[i]] || {};

				if (keys[i].match(/\d+/)) {
					var tmp = parseInt(keys[i]);
					tmpConf.length = tmpConf.length || -1;
					if (tmpConf.length <= tmp) {
						tmpConf.length = tmp + 1;
					}
				
				}
				tmpConf = tmpConf[keys[i]];
			}

			return tmpConf;
		}

		var confConvert = function(c) {
			if (typeof(c) != "object") {
				return c;
			}

			var nc = c.length ? [] : {};

			if (c.length) {
				for (var i = 0; i < c.length; i++) {
					nc.push(confConvert(c[i+""]));
				}
			} else {
				for (var key in c) {
					nc[key] = confConvert(c[key]);
				}
			}

			return nc;
		}

		var _mdToJson = function(line) {
			var temp = line.match(/^([-+#]) (.*)/);
			var flag = temp[1];
			var content = temp[2].trim();	
			var key, value;

			if (flag == "#") {
				curConf = getObj(content);
			}

			if (flag == "+" || flag == "-") {
				temp = content.indexOf(":");

				if (temp > 0) {
					key = content.substring(0, temp).trim(); 
					value = content.substring(temp + 1).trim();
				} else {
					curConf.length = curConf.length || 0;
					key = curConf.length + "";
					value = content.trim();
					curConf.length = curConf.length + 1;
				}

				if (value == "true") {
					value = true;
				} else if (value == "false") {
					value = false;
				} else {
					value = value;
				}

				curConf[key] = value;
			}
		}

		var is_comment = false;
		for (var i = 0; i < temp_lines.length; i++) {
			if (temp_lines[i].match(/^<!--.*-->\s*$/)) {
				continue;
			}
			if (temp_lines[i].match(/^<!--/)) {
				is_comment = true;
				continue;
			}
			if (is_comment) {
				if (temp_lines[i].match(/-->\s*$/)) {
					is_comment = false;
				}
				continue;
			}
			if (!temp_lines[i].match(/^[-+#] .*/)) {
				line += temp_lines[i] + "\n";
				continue;
			}
			if (line) {
				lines.push(line);
			}
			line = temp_lines[i];
		}

		if (line) {
			lines.push(line);
		}

		if (lines.length == 1 && !lines[0].match(/^[-+#] .*/)) {
			return lines[0];
		} else {
			for (var i = 0; i < lines.length; i++) {
				_mdToJson(lines[i]);
			}
		}
		
		return confConvert(conf);
	}

	// json对象转markdown文本
	mdconf.jsonToMd = function(obj) {
		var text = "";
		var value;

		// 非对象直接写入
		if (typeof(obj) != "object") {
			text += obj + "\n";
			return text;
		}
		
		var _jsonToMd = function(obj, key_prefix) {
			key_prefix = key_prefix ? key_prefix + "." : "";
			if (obj.length == undefined) {
				// 单对象对应列表
				for (var key in obj) {
					// 优先写非对象值
					value = obj[key];
					if (key.indexOf("$$") == 0 || typeof(value) == "object") {
						continue;
					}
					text += "- " + key + " : " + value + "\n";
				}
				for (var key in obj) {
					// 写对象值
					value = obj[key];
					if (key.indexOf("$$") == 0 || typeof(value) != "object") {
						continue;
					}

					text += "\n# " + key_prefix + key + "\n";
					_jsonToMd(value, key_prefix + key)
				}
			} else {
				for (var i = 0; i < obj.length; i++) {
					value = obj[i];
					if (typeof(value) != "object") {
						text += "- " + obj[i] + "\n";
						continue;
					} 

					text += "\n# " + key_prefix + i + "\n";
					_jsonToMd(value, key_prefix + i)
				}		
			}
		}

		_jsonToMd(obj);
		return text;
	}

	mdconf.test = function() {
		var obj = undefined, text = undefined;
		//obj = "hello world"
		//text = mdconf.jsonToMd(obj);
		//console.log(text);
		//console.log(angular.toJson(mdconf.mdToJson(text)));
		//console.log(mdconf.mdToJson(text));

		//obj = {key:"value"}
		//text = mdconf.jsonToMd(obj);
		//console.log(text);
		//console.log(angular.toJson(mdconf.mdToJson(text)));
		//console.log(mdconf.mdToJson(text));

		//obj = ["list1", "list2"]
		//text = mdconf.jsonToMd(obj);
		//console.log(text);
		//console.log(angular.toJson(mdconf.mdToJson(text)));
		//console.log(mdconf.mdToJson(text));

		//obj = [["list1", "list2"], ["list3", "list4"]]
		//text = mdconf.jsonToMd(obj);
		//console.log(text);
		//console.log(angular.toJson(mdconf.mdToJson(text)));
		//console.log(mdconf.mdToJson(text));

		//obj = {key:"value", list:["list1", "list2"]}
		//text = mdconf.jsonToMd(obj);
		//console.log(text);
		//console.log(angular.toJson(mdconf.mdToJson(text)));
		//console.log(mdconf.mdToJson(text));

		//obj = {key:"value", list:[{key1:"value1"},{key2:"value2"}]}
		//text = mdconf.jsonToMd(obj);
		//console.log(text);
		//console.log(angular.toJson(mdconf.mdToJson(text)));
		//console.log(mdconf.mdToJson(text));

		//obj = {key:"value", list:[{key1:"value1"},{key2:"value2", list:["list1"]}]}
		//text = mdconf.jsonToMd(obj);
		//console.log(text);
		//console.log(angular.toJson(mdconf.mdToJson(text)));
		//console.log(mdconf.mdToJson(text));

	}

	return mdconf;
})
