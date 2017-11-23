
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

	mdconf._mdToJson = function(text) {
		var blocks = parseMd(text);
		
		var keys = [];
		var conf = {};

		var topDepth = 0;
		var isExistKey = false;

		console.log(blocks);
		if (blocks.length == 1 && blocks[1].tag == "p") {
			
		}
		return;
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
						if (value == "true") {
							curConf[curKey][key] = true;
						} else if (value == "false") {
							curConf[curKey][key] = false;
						} else {
							curConf[curKey][key] = value;
						}
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
	// md 转json对象
	mdconf.mdToJson = function(text) {
		var temp_lines = text.split("/n");
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
				tmpConf = tmpConf[keys[i]];
			}

			return tmpConf;
		}

		var confConvert(c) {
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
			var temp = line.match(/([#-+]) (.*)/);
			var flag = temp[1];
			var content = temp[2].trim();	
			var key, value;

			if (flag == "#") {
				curConf = getObj(content);
			}

			if (flag == "+" || flag == "-") {
				content = content.split(":");

				if (content.length > 1) {
					key = content[1].trim(); 
					value = content[2].trim();
				} else {
					curConf.length = curConf.length || 0;
					key = curConf.length + "";
					value = content[1].trim();
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

		for (var i = 0; i < temp_lines.length; i++) {
			if (!temp_lines[i].match(/[#-+] .*/)) {
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

		if (lines.length == 1) {
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

	return mdconf;
})
