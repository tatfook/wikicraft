/**
 * Created by wuxiangan on 2016/12/20.
 */

/* 程序过滤模块 */

define(['jquery', 'text!html/browers.html'], function($, browersErrContent) {
	config.registerFilter("/wiki/iframeagent", function() {
		var lastHash = undefined;
		var hashChangeFire = function(){
			console.log(window.location.hash);
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
		console.log("hello world");
		$(window.document.body).html("<div>hello world</div>");
    });

    config.registerFilter("/wiki/browers", function(){
        console.log("浏览器版本太低");
        $(window.document.body).html(browersErrContent);
    });
});
