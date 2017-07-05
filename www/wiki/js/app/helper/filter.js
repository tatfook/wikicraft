/**
 * Created by wuxiangan on 2016/12/20.
 */

/* 程序过滤模块 */

define([], function() {
	config.registerFilter("/wiki/iframeagent", function() {
		var hash_url = window.location.hash;
		if(hash_url.indexOf("#")>=0){
			var arglist = hash_url.substring(1).split("|");
			var iframeId = arglist[0];
			var iframeWidth = arglist[1] + "px";
			var	iframeHeight = arglist[2] + "px";
			var iframe = window.parent.parent.document.getElementById(iframeId);
			if (b_iframe) {
				iframe.style.width = iframeWidth;
				iframe.style.height = iframeHeight;
			}
		}
		return;
	});
});
