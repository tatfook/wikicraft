 //xiaoyao 2018-02-12
//toolbase 提供事件机制, 事件机制可以绑定到对象上使用， 也可全局使用

//作为基类 绑定到对象上使用
//sender = Object.assign(sender, toolbase);
//sender.addEventListener("eventName", function(){
	//console.log("sender trigger eventName");
//});
//sender.dispatchEvent("eventName", "event params");
//全局使用
//toolbase.addEventListener("eventName", function(){
	//console.log("toolbase trigger eventName");
//});
//toolbase.dispatchEvent("eventName", "event params");


define([
	"app",
], function(app) {
	// 事件机制可绑定到单一对象上使用 也可全局使用
	var toolbase = {};

	// 定义触发信号函数
	toolbase.dispatchEvent = function(eventName, params) {
		var self = this;
		var _event = self.getEvent(eventName);

		// typeof(handler) == "function" or typeof(handler[eventName]) == "function"
		if (!_event) {
			return;
		}
		
		var eventHandles = _event.eventHandles;
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
	toolbase.addEventListener = function (eventName, handler, funcname) {
		var self = this;
		var _event = self.getEvent(eventName);

		// typeof(handler) == "function" or typeof(handler[eventName]) == "function"
		if (!_event || !handler) {
			return;
		}
		
		var eventHandles = _event.eventHandles;
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
	toolbase.removeEventListener = function (eventName, handler, funcname) {
		var self = this;
		var _event = self.getEvent(eventName);

		if (!_event) {
			return;
		}

		var newEventHandles = [];
		var eventHandles = _event.eventHandles;
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
			if (eventHandles[i].handler == handler && eventHandles[i].funcname == funcname){
				continue
			}

			newEventHandles.push(eventHandles[i]);
		}

		_event.eventHandles = newEventHandles;
	}

	// 定义获取所有信号
	toolbase.getEvent = function(eventName){
		var eventMap = this.getEventMap();
		if (!eventName) {
			return undefined;
		}

		eventMap[eventName] = eventMap[eventName] || {eventName:eventName, eventHandles:[]};
		return eventMap[eventName];
	}

	toolbase.getEventMap = function(){
		this.$eventMap = this.$eventMap || {$event:this};
		if (this.$eventMap.$event != this) {
			this.$eventMap = {$event:this};
		}

		return this.$eventMap;
	}

	return toolbase;
});
