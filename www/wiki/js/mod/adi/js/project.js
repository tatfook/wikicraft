define([
	'app',
	'markdown-it',
    'helper/util',
	'text!wikimod/adi/html/project.html',
], function (app, markdown_it, util, htmlContent) {

    function registerController(wikiblock) {
        app.registerController("pictureTextController", ['$scope','$sce', function ($scope, $sce) {

			$scope.editorMode = wikiblock.editorMode;

            initObj = {
				scope  : $scope,
				styles : [
					{
						"design": {
                            "text":"style1",
                            "cover": "/wiki/js/mod/adi/assets/images/projectOne.png"
						},
					},
					{
						"design": {
                            "text":"style3",
                            "cover": "/wiki/js/mod/adi/assets/images/projectThree.png"
						},
					},
					{
						"design": {
                            "text":"style2",
                            "cover": "/wiki/js/mod/adi/assets/images/projectTwo.png"
						},
					},
				],
				params_template: {
					design:{
						is_leaf      : true,
						type         : "text",
						editable     : false,
						is_card_show : true,
						is_mod_hide  : false,
						name         : "样式",
						text         : "style1",
						require      : true,
					},
					image_picture:{
                        is_leaf      : true,
						type         : "media",
						mediaType    : "image",
						editable     : true,
						is_card_show : true,
                        is_mod_hide  : false,
                        name         : "picture",
                        text         : config.wikiModPath + 'adi/assets/imgs/pictureMod.png',
                        href         : "",
                    	require      : true,
					},
					link_headline:{
						is_leaf      : true,
						type         : "link",
						editable     : true,
						is_card_show : true,
						is_mod_hide  : false,
						name         : "标题",
						text         : "一个人，一条路，人在途中",
						href         : "", 
						require      : true,
					},
					link_sublink:{
						is_leaf      : true,
						type         : "link",
						editable     : true,
						is_card_show : true,
						is_mod_hide  : false,
						name         : "子标题",
						text         : "我们一直在旅行",
						href         : "",
						require      : true,
					},
					link_more:{
                        is_leaf      : true,
                        type         : "link",
                        editable     : true,
                        is_card_show : true,
                        is_mod_hide  : false,
                        name         : "按钮",
                        text         : "查看更多",
                        href         : "",
                    	require      : true,
					},
					multiText_desc:{
						is_leaf      : true,
						type         : "multiText",
						editable     : true,
						is_card_show : true,
						is_mod_hide  : false,
						name         : "文字说明",
						text         : "一个人去旅行，而且是去故乡的山水间徜徉。\
临行之前，面对太多的疑问和不解：为何是一个人？\
也有善意的提醒：何不去远方！\
昆明呀——赶一个花海；三亚呀——赴一个蓝天碧海。\
只是微笑地固执自己的坚持，不做任何解释。\
没有人明白，这一次是一个告别，或者一个永远的告别，以后我会去到很多很繁华或苍凉，辽远或偏僻的地方，而会常常想起这一次的旅行，想起那座山，那个城，那些人……\
\n\n\
有时我们选择改变，并非经过深思熟虑，而更像是听见了天地间冥冥中的呼唤，呼唤你前往另一个地方，过上另一种生活。\
你并不一定会从此拥有更美好的人生，可你仍然感谢天地和人世所带来的这些变化和发生。\
不然你大概会一直好奇和不甘吧——家门前的那条小路，到底通向了什么样的远方呢？。\
\n\n\
对于旅行，从来都记忆模糊。\
记不得都去了哪些地方，看了哪些风景，遇到哪些人。\
尽管同学说，去旅行不在于记忆，而在于当时的那份心情。\
可是旅行的彼时那刻我的心情一直是好的吗？一直有记日记的习惯，可是，旅行回来，都懒得写日记来记录，可见内心底对旅行是多么的淡漠。\
如果可以，我真想和你一直旅行。\
或许是某个未开发的荒凉小岛，或许是某座闻名遐迩的文化古城。我们可以沿途用镜头记录彼此的笑脸，和属于我们的风景。\
一起吃早餐，午餐，晚餐。或许吃得不好，可是却依旧为对方擦去嘴角的油渍。风景如何，其实并不重要。\
重要的是，你在我的身边。",
						href         : "",
						require      : true,
					},
				}
			}

			
			wikiblock.init(initObj);

			var md = new markdown_it({
				html: true,
				langPrefix: 'code-'
			})
			
			$scope.params.multiText_desc.text = md.render($scope.params.multiText_desc.text);
			$scope.projectImg = {
				"background-image"    : 'url('+ $scope.params.image_picture.text +')',
				"background-size"     : "cover",
				"background-position" : "center center",
			}
        }]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
		}
    }
    
});