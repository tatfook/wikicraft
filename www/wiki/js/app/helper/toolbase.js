
define([
	"app",
], function(app) {
	// 事件机制可绑定到单一对象上使用 也可全局使用
	var eventMap = {};
	var toolbase = {};
	
	// 判断对象是有具有事件能力
	toolbase.isEventObject = function(){
		if (this.getEventMap) { // 使用此方法判定是否具有事件能力
			return true;
		}

		return false;
	}
	// 定义添加事件方法
	toolbase.defineEvent = function(eventName, eventObj) {
		var self = eventObj || this;
		var eventMap = self.getEventMap ? self.getEventMap() : {};

		if (!eventName) {
			return;
		}

		// 定义添加事件方法
		self.defineEvent = self.defineEvent || function(eventName) {
			toolbase.defineEvent(eventName, self);
		}
		
		// 移除事件
		self.undefineEvent = self.undefineEvent || function(eventName) {
			toolbase.undefineEvent(eventName, self);
		}

		// 定义触发信号函数
		self.dispatchEvent = self.dispatchEvent || function(eventName, params){
			toolbase.dispatch(eventName, params, self);
		};

		// 定义监听事件接口
		self.addEventListener = self.addEventListener || function(eventName, handler, funcname) {
			toolbase.addEventListener(eventName, handler, funcname, self);
		}

		// 定义监听事件接口
		self.removeEventListener = self.removeEventListener || function(eventName, handler, funcname) {
			toolbase.removeEventListener(eventName, handler, funcname, self);
		}

		// 定义获取所有信号
		self.getEventMap = self.getEventMap || function(){
			return eventMap;
		}

		eventMap[eventName] = {eventName:eventName, eventHandles:[]};
	}

	// 移除事件
	toolbase.undefineEvent = function(eventName, eventObj) {
		var self = eventObj || this;
		var eventMap = self.getEventMap ? self.getEventMap() : {};

		delete eventMap[eventName];
	}

	// 定义触发信号函数
	toolbase.dispatchEvent = function(eventName, params, eventObj) {
		var self = eventObj || this;

		!self.isEventObject() && self.defineEvent(eventName);

		var eventMap = self.getEventMap ? self.getEventMap() : {};

		// typeof(handler) == "function" or typeof(handler[eventName]) == "function"
		if (!eventName || !eventMap[eventName]) {
			return;
		}
		
		var eventHandles = eventMap[eventName].eventHandles;
		for (var i = 0; i < eventHandles.length; i++) {
			var handle = eventHandles[i];
			var handler = handle.handler;
			var funcname = handle.funcname || eventName;
			
			if (typeof(handler) == "function") {
				handler(params);
			} else if(typeof(handle.handler) == "object" && handler[funcname]){
				(handler[funcname])(params);
			}
		}
	}

	// 定义添加监听事件接口
	toolbase.addEventListener = function (eventName, handler, funcname, eventObj) {
		var self = eventObj || this;

		!self.isEventObject() && self.defineEvent(eventName);

		var eventMap = self.getEventMap ? self.getEventMap() : {};

		// typeof(handler) == "function" or typeof(handler[eventName]) == "function"
		if (!eventName || !eventMap[eventName] || !handler) {
			return;
		}
		
		var eventHandles = eventMap[eventName].eventHandles;
		var handle = {handler: handler, funcname:funcname};
		// 禁止同一处理程序重复监听  外部实现重复监听比不重复要简单 且不重复更广泛(经验值判定)  故内部屏蔽
		for (var i = 0; i < eventHandles.length; i++) {
			if (eventHandles[i].handler == handler && eventHandles[i].funcname == funcname){
				return ;
			}
		}

		// 加入监听列表
		eventHandles.push(handle);
	}
	
	// 定义删除监听事件接口
	toolbase.removeEventListener = function (eventName, handler, funcname, eventObj) {
		var self = eventObj || this;
		!self.isEventObject() && self.defineEvent(eventName);

		var eventMap = self.getEventMap ? self.getEventMap() : {};

		// typeof(handler) == "function" or typeof(handler[eventName]) == "function"
		if (!eventName || !eventMap[eventName]) {
			return;
		}

		var newEventHandles = [];
		var eventHandles = eventMap[eventName].eventHandles;
		// 禁止同一处理程序重复监听  外部实现重复监听比不重复要简单 且不重复更广泛(经验值判定)  故内部屏蔽
		for (var i = 0; i < eventHandles.length; i++) {
			// 删除该类型所有事件
			if (!handler) {
				continue;
			}
			// 删除指定对象上的事件
			if (!funcname && eventHandles[i].handler == handler) {
				continue;
			}
			// 删除指定事件
			if (eventHandles[i].handler == handler && eventHandles[i].funcname == funcname)){
				continue
			}

			newEventHandles.push(eventHandles[i]);
		}

		eventMap[eventName].eventHandles = newEventHandles;
	}

	// 定义获取所有信号
	toolbase.getEventMap = function(){
		return eventMap;
	}

	return toolbase;
});
