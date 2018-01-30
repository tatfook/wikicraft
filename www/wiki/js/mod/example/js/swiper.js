/**
 * Created by wuxiangan on 2017/1/9.
 */

define(['app', 'text!wikimod/example/html/swiper.html'], function (app, htmlContent) {
    function registerController(wikiBlock) {
        app.registerController("swiperController", ['$scope',function ($scope) {
			$scope.$watch("$viewContentLoaded", function(){
				// console.log("-----------------");
				var mySwiper = new Swiper ('.swiper-container', {
					// Optional parameters
				   	direction: 'vertical',
				  	loop: true,
				   
				   	// If we need pagination
				   	pagination: '.swiper-pagination',
				   
				   	// Navigation arrows
				   	nextButton: '.swiper-button-next',
				   	prevButton: '.swiper-button-prev',
				   
				   	// And if we need scrollbar
				   	scrollbar: '.swiper-scrollbar',
				 });
			});
        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return  htmlContent;       // 返回模块标签内容
        }
    }
});

/*
 ```@example/js/swiper
 {
 }
 ```
 */
