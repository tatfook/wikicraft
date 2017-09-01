
define([
    'helper/util',
    'markdown-it',
], function (util, markdownit) {
	var delimit = "$";
	var mdconf = {};

	function parseMd(text) {
		var textLineList = text.split('\n');
		var md = markdownit();
		var tokens = md.parse(text, {});
		var blockList = [];
		var stack = 0;
		var maxValue = 99999999;
		var block = {
			from: maxValue,
		   	to: 0,
			lines:[],
		}

		for (var i = 0; i < tokens.length; i++) {
			var token = tokens[i];
			if (token.type.indexOf('_open') >= 0) {
				stack++;
			}
			if (token.type.indexOf('_close') >= 0) {
				stack--;
			}

			block.tag = token.tag || block.tag;

			// 获取文本位置
			block.from = block.from == maxValue && token.map ? token.map[0] : block.from;
			block.to = token.map ? token.map[1] : block.to;

			if (stack == 0) {
				for (var j = block.from; j < block.to; j++) {
					block.lines.push(textLineList[j]);
				}
				blockList.push(block);
				// 重置初始状态
				block = {
					from: maxValue,
				   	to: 0,
					lines: [],
				}
			}
		}
		//console.log(blockList);
		return blockList;
	}

	function specialCharEscape(str, ch) {
		ch = ch || '\\|';

		var ret = "";
		for (var i = 0; i < str.length; i++) {
			console.log(str[i], ch.indexOf(str[i]));
			if (ch.indexOf(str[i]) >= 0) {
				ret += '\\' + str[i];
			} else {
				ret += str[i];
			}
		}
		return ret;
	}

	function specialCharUnescape(str, ch) {
		ch = ch || "\\|";

		var ret = "";
		for (var i = 0; i < str.length; i++) {
			if (str[i] == "\\" && str[i+1] && ch.indexOf(str[i+1]) >=0) {
				ret += str[i+1];
				i++;
			} else {
				ret += str[i];
			}
		}

		return ret;
	}

	function split(str, delim) {
		var list = [];
		var start = 0;

		for (var i = 0; i < str.length; i++) {
			if (str[i] == delim && str[i-1] != "\\") {
				list.push(str.substring(start, i));
				start = i + 1;
			}
		}

		if (start == str.length) {
			list.push("");
		}

		return list;
	}

	mdconf.toMod = function(text) {
		var self = this;
		var obj = self.toJson(text) || {};
		var mods = obj.mod || {};
		var text = "";

		//console.log(obj, mods);
		for (var key in mods) {
			var mod = mods[key];
			//console.log(mod, mod.cmdName);
			if (!mod.cmdName) {
				//console.log("--------------");
				continue;
			}
			var params = mod.params || {};

			var paramsStr = angular.toJson(params);

			text += '```' + mod.cmdName + "\n"+ paramsStr + '\n```\n';
		}

		return text;
	}

	mdconf.toJson = function(text) {
		var blocks = parseMd(text);
		
		var keys = [];
		var conf = {};

		var topDepth = 0;
		var isExistKey = false;

		for (var i = 0; i < blocks.length; i++) {
			var block = blocks[i];
			
			if (/^[hH][1-6$]/.test(block.tag)) {
				var depth = parseInt(block.tag[1]);
				while(topDepth-- >= depth) {
					keys.pop();
				}
				topDepth =depth;

				var line = block.lines[0] || "";
				var key = line.replace(/^[ #]*/, "");
				if (key) {
					keys.push(key);
					isExistKey = true;
				}
				continue;
			}
			
			if (!isExistKey) {
				continue;
			}

			var curConf = conf;
			var curKey = keys[0];
			for (var j = 1; j < keys.length; j++) {
				curConf[curKey] = curConf[curKey] || {};
				curConf = curConf[curKey];
				curKey = keys[j];
			}

			if (block.tag == "ul") {
				var lines = block.lines;
				var isObject = undefined;
				for (var j = 0; j < lines.length; j++) {
					var line = lines[j];
					line = line.replace(/^[-* ]*/, "").trim();
					if (!line) {
						continue;
					}

					var delim = line.indexOf(":");
					if (isObject == undefined) {
						if (delim > 0) {
							isObject = true;
							curConf[curKey] = {};
						} else {
							isObject = false;
							curConf[curKey] = [];
						}
					}
					
					delim = delim < 0 ? line.length : delim;
					var key = line.substring(0, delim).trim();
					var value = line.substring(delim+1).trim();

					if (isObject) {
						curConf[curKey][key] = value;
					} else {
						curConf[curKey].push(key);
					}
				}

				isExistKey = false;
			}

			if (block.tag == "table") {
				var lines = block.lines;
				var line = lines[0];
				var fieldList = line.split("|");
				
				curConf[curKey] = [];
				
				for (var j = 2; j < lines.length-1; j++) {
					line = lines[j];
					var valueList = split(line, "|");
					var tempConf = {};

					for (var k = 1; k < valueList.length-1; k++) {
						tempConf[fieldList[k]] = valueList[k].trim();
					}

					curConf[curKey].push(tempConf);
				}
				isExistKey = false;
			}
		}

		//console.log(conf);	
		return conf;
	}

	mdconf.toMd = function(obj, depth, isTable) {
		var self = this;
		var text = "";
		var head = ["#", "##", "###", "####", "#####", "######"];
		depth = depth || 0;

		if (obj.length == undefined) {
			// table
			// 优先写非对象值
			for (var key in obj) {
				var value = obj[key];
				if (typeof(value) == "object") {
					continue;
				}

				if (isTable) {
					text += "|" + value;
				} else {
					text += "- " + key + " : " + value + "\n";
				}
			}

			if (isTable) {
				text += "|\n";
			} else {
				for (var key in obj) {
					var value = obj[key];

					if (typeof(value) != "object") {
						continue;
					}

					text += "\n\n" + head[depth] + " " + key + "\n\n";
					text += self.toMd(value, depth+1);
				}
			}

		} else {
			// list
			var isFirst = true;
			for (var i = 0; i < obj.length; i++) {
				var value = obj[i];

				if (typeof(value) == "object") {
					// 表
					if (value.length == undefined) {
						// 不支持数组嵌套数组
						if (isFirst) {
							var tableHead = "";
							var tableDelimit = "";
							for (var field in value) {
								tableHead += "|" + field;
								tableDelimit += "|:--:";
							}
							text +=  tableHead + "|\n" + tableDelimit + "|\n";
							isFirst = false;
						}
						text += self.toMd(value, undefined, true);
					}

					continue;
				}
				
				text += "- " + value + "\n\1";
			}
		}

		//text += "\n";
		return text;
	}


	return mdconf;
})
