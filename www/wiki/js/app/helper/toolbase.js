
define([
	"app",
], function(app) {
	// 事件机制可绑定到单一对象上使用 也可全局使用
	var eventMap = {};
	var toolbase = {};
	
	// 定义添加事件方法
	toolbase.addEvent = function(eventName, eventObj) {
		var self = eventObj || this;
		var eventMap = self.getEventMap ? self.getEventMap() : {};

		// 定义添加事件方法
		self.addEvent = self.addEvent || function(eventName) {
			toolbase.addEvent(eventName, self);
		}
		
		// 移除事件
		self.removeEvent = self.removeEvent || function(eventName) {
			toolbase.removeEvent(eventName, self);
		}

		// 定义触发信号函数
		self.dispatchEvent = self.dispatchEvent || function(eventName){
			toolbase.dispatch(eventName, self);
		};

		// 定义监听事件接口
		self.addEventListener = self.addEventListener || function(eventName, handler) {
			toolbase.addEventListener(eventName, handler, self);
		}

		// 定义获取所有信号
		self.getEventMap = self.getEventMap || function(){
			return eventMap;
		}


		eventMap[eventName] = {eventName:eventName, eventHandles:[]};
	}

	// 移除事件
	toolbase.removeEvent = function(eventName, eventObj) {
		var self = eventObj || this;
		var eventMap = self.getEventMap ? self.getEventMap() : {};

		delete eventMap[eventName];
	}

	// 定义触发信号函数
	toolbase.dispatchEvent = function(eventName, eventObj) {
		var self = eventObj || this;
		var eventMap = self.getEventMap ? self.getEventMap() : {};

		// typeof(handler) == "function" or typeof(handler[eventName]) == "function"
		if (!eventName || !eventMap[eventName]) {
			return;
		}
		
		var eventHandles = eventMap[eventName].eventHandles;
		for (var i = 0; i < eventHandles.length; i++) {
			var handler = eventHandles[i];
			
			if (typeof(handler) == "function") {
				handler();
			} else if(typeof(handler) == "object" && typeof(handler[eventName]) == "function"){
				handler[eventName]();
			}
		}
	}

	// 定义添加监听事件接口
	toolbase.addEventListener = function (eventName, handler, eventObj) {
		var self = eventObj || this;
		var eventMap = self.getEventMap ? self.getEventMap() : {};

		// typeof(handler) == "function" or typeof(handler[eventName]) == "function"
		if (!eventName || !eventMap[eventName] || !handler) {
			return;
		}
		
		var eventHandles = eventMap[eventName].eventHandles;
		// 禁止同一处理程序重复监听  外部实现重复监听比不重复要简单 且不重复更广泛(经验值判定)  故内部屏蔽
		for (var i = 0; i < eventHandles.length; i++) {
			if (eventHandles[i] == handler){
				return ;
			}
		}

		// 加入监听列表
		eventHandles.push(handler)
	}
	
	// 定义删除监听事件接口
	toolbase.removeEventListener = function (eventName, handler, eventObj) {
		var self = eventObj || this;
		var eventMap = self.getEventMap ? self.getEventMap() : {};

		// typeof(handler) == "function" or typeof(handler[eventName]) == "function"
		if (!eventName || !eventMap[eventName] || !handler) {
			return;
		}
		
		var eventHandles = eventMap[eventName].eventHandles;
		// 禁止同一处理程序重复监听  外部实现重复监听比不重复要简单 且不重复更广泛(经验值判定)  故内部屏蔽
		for (var i = 0; i < eventHandles.length; i++) {
			if (eventHandles[i] == handler){
				eventHandles.splice(i,1);
				return ;
			}
		}
	}

	// 定义获取所有信号
	toolbase.getEventMap = function(){
		return eventMap;
	}

	return toolbase;
});
