/**
 * Created by wuxiangan on 2016/12/20.
 */

/* 程序过滤模块 */

define([], function() {
	config.registerFilter("/wiki/iframeagent", function() {
		var b_iframe = window.parent.parent.document.getElementById("Iframe");
		var hash_url = window.location.hash;
		if(hash_url.indexOf("#")>=0){
			var hash_width = hash_url.split("#")[1].split("|")[0]+"px";
			var hash_height = hash_url.split("#")[1].split("|")[1]+"px";
			b_iframe.style.width = hash_width;
			b_iframe.style.height = hash_height;
		}
		return;
	});
});
