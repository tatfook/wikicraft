/**
 * Created by 18730 on 2017/5/16.
 */
define(['jquery'], function ($) {
    var loading={
        loadingHtml:'<div class="loading-spinner" id="js-loading-spinner">\
        <div class="spinner-container container1">\
        <div class="circle1"></div>\
        <div class="circle2"></div>\
        <div class="circle3"></div>\
        <div class="circle4"></div>\
        </div>\
        <div class="spinner-container container2">\
        <div class="circle1"></div>\
        <div class="circle2"></div>\
        <div class="circle3"></div>\
        <div class="circle4"></div>\
        </div>\
        <div class="spinner-container container3">\
        <div class="circle1"></div>\
        <div class="circle2"></div>\
        <div class="circle3"></div>\
        <div class="circle4"></div>\
        </div>\
        </div>\
        <div class="spinner-mask" id="js-spinner-mask"></div>\
        ',
        loadingCss:'<style>.loading-spinner{margin:100px auto;width:35px;height:35px;position:fixed;left:50%;top:30%;z-index:10001;}.loading-spinner .container1 > div,.container2 > div,.container3 > div{width:8px;height:8px;background-color:#3977AD;border-radius:100%;position:absolute;-webkit-animation:bouncedelay 1.2s infinite ease-in-out;animation:bouncedelay 1.2s infinite ease-in-out;-webkit-animation-fill-mode:both;animation-fill-mode:both;}.loading-spinner .spinner-container{position:absolute;width:100%;height:100%;}.loading-spinner .container2{-webkit-transform:rotateZ(45deg);transform:rotateZ(45deg);}.loading-spinner .container3{-webkit-transform:rotateZ(90deg);transform:rotateZ(90deg);}.loading-spinner .circle1{top:0;left:0;}.loading-spinner .circle2{top:0;right:0;}.loading-spinner .circle3{right:0;bottom:0;}.loading-spinner .circle4{left:0;bottom:0;}.loading-spinner .container2 .circle1{-webkit-animation-delay:-1.1s;animation-delay:-1.1s;}.loading-spinner .container3 .circle1{-webkit-animation-delay:-1.0s;animation-delay:-1.0s;}.loading-spinner .container1 .circle2{-webkit-animation-delay:-0.9s;animation-delay:-0.9s;}.loading-spinner .container2 .circle2{-webkit-animation-delay:-0.8s;animation-delay:-0.8s;}.loading-spinner .container3 .circle2{-webkit-animation-delay:-0.7s;animation-delay:-0.7s;}.loading-spinner .container1 .circle3{-webkit-animation-delay:-0.6s;animation-delay:-0.6s;}.loading-spinner .container2 .circle3{-webkit-animation-delay:-0.5s;animation-delay:-0.5s;}.loading-spinner .container3 .circle3{-webkit-animation-delay:-0.4s;animation-delay:-0.4s;}.loading-spinner .container1 .circle4{-webkit-animation-delay:-0.3s;animation-delay:-0.3s;}.loading-spinner  .container2 .circle4{-webkit-animation-delay:-0.2s;animation-delay:-0.2s;}.loading-spinner .container3 .circle4{-webkit-animation-delay:-0.1s;animation-delay:-0.1s;}@-webkit-keyframes bouncedelay{0%,80%,100%{-webkit-transform:scale(0.0)}40%{-webkit-transform:scale(1.0)}}@keyframes bouncedelay{0%,80%,100%{transform:scale(0.0);-webkit-transform:scale(0.0);}40%{transform:scale(1.0);-webkit-transform:scale(1.0);}}.spinner-mask{position:fixed;left:0;width:100%;background-color:rgba(255,255,255,0.7);z-index:10000;bottom:0;top:0;}</style>',
        
		hideTimer:undefined,
    };
    
	// 显示 并取消延迟隐藏
	loading.show = function() {
		var self = this;
		// 取消隐藏定时器
		if (self.hideTimer) {
			clearTimeout(self.hideTimer);
			self.hideTimer = undefined;
		}
		self.showLoading();
	}
	// 延迟隐藏
	loading.hide = function() {
		var self = this;
		self.hideTimer && clearTimeout(self.hideTimer);
		self.hideTimer = setTimeout(function(){
			self.hideTimer = undefined;
			self.hideLoading();	
		}, 100);
	}

	// 显示
    loading.showLoading = function () {
        if ($("#js-loading-spinner").length>0 && $("#js-spinner-mask").length>0){
            $("#js-spinner-mask").show();
            $("#js-loading-spinner").show();
        }else{
            $(document.body).append(loading.loadingCss);
            $(document.body).append(loading.loadingHtml);
        }
    };

	// 隐藏
    loading.hideLoading = function () {
        $("#js-loading-spinner").hide();
        $("#js-spinner-mask").hide();
    };

    config.loading = loading;
    return loading;
});
