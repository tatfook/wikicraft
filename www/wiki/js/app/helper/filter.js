/**
 * Created by wuxiangan on 2016/12/20.
 */

/* 程序过滤模块 */

define([
	'jquery',
   	'text!html/browers.html'
], function($, browersErrContent) {
	config.registerFilter("/wiki/iframeagent", function() {
		var lastHash = undefined;
		var hashChangeFire = function(){
			// console.log(window.location.hash);
			var hash_url = window.location.hash;
			if(hash_url.indexOf("#")>=0){
				var arglist = hash_url.substring(1).split("|");
				var iframeId = arglist[0];
				var iframeWidth = arglist[1] + "px";
				var	iframeHeight = arglist[2] + "px";
				var iframe = window.parent.parent.document.getElementById(iframeId);
				if (iframe) {
					iframe.style.width = iframeWidth;
					iframe.style.height = iframeHeight;
				}
			}
		}

		var isHashChanged = function() {
			if (lastHash == window.location.hash) {
				return false;
			}

			lastHash = window.location.hash;
			return true;
		}


		isHashChanged();
		hashChangeFire();

		if (("onhashchange" in window) && (typeof document.documentMode==="undefined" || document.documentMode == 8)) {
			window.onhashchange = hashChangeFire;
		} else {
			setInterval(function(){
				if (isHashChanged()) {
					hashChangeFire()
				}
			}, 200);
		}
		return;
	});

	config.registerFilter("/wiki/filter", function(){
		// console.log("hello world");
		$(window.document.body).html("<div>hello world</div>");
    });

    config.registerFilter("/wiki/browers", function(){
        // console.log("浏览器版本太低");
        $(window.document.body).html(browersErrContent);
    });

    //config.registerFilter("/wiki/cros", function(){
        ////$(window.document.body).html("<div>" +  (window.parent.test || "test") + "</div>");
		//window.addEventListener("message", function(e){
			////$.ajax({
				////url:obj.url,
				////type:obj.type || "GET",
				////dataType:obj.dataType || "json",
				//////contentType:"application/json;charset=UTF-8",
				////data:obj.data,
				////beforeSend:obj.beforeSend,
				////success:function(result, statu, xhr) {
					////obj.success && obj.success(result, statu, xhr);
				////},
				////error:function(xhr, statu, error) {
					////obj.error && obj.error(xhr, statu, error);
				////}
			////});
			//console.log(e);	
			////e.source.postMessage({key:"echo test"}, e.origin);

			////$.ajax();
		//});

		//setTimeout(function(){
			//window.parent.postMessage({cmd:"load"}, "*");
		//}, 1000);
    //});
});
