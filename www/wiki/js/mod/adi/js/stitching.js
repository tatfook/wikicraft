define([
    'app',
    'markdown-it',
    'helper/util',
    'text!wikimod/adi/html/stitching.html',
], function (app, markdown_it, util, htmlContent) {

    function registerController(wikiblock) {
        app.registerController("stitchingController", ['$scope','$sce', function ($scope, $sce) {
			
			$scope.editorMode = wikiblock.editorMode;

			initObj = {
				scope  : $scope,
				styles : [
					{
						"design": {
                            "text":"style1",
                            "cover":""
						},
					},
					{
						"design": {
                            "text":"style2",
                            "cover":""
						},
					},
				],
				params_template : {
					design:{
						is_leaf      : true, 
						type         : "text",   
						editable     : false, 
						is_mod_hide  : false,  
						is_card_show : true,
						name         : "样式",   
						text         : "style1", 
						require      : true, 
                    },
                    link_title:{
						is_leaf      : true, 
						type         : "link",   
						editable     : true, 
						is_mod_hide  : false,  
						is_card_show : true,
						name         : "主标题",   
						text         : "自主学习", 
						require      : true, 
                    },
                    link_subtitle:{
						is_leaf      : true, 
						type         : "link",   
						editable     : true, 
						is_mod_hide  : false,  
						is_card_show : true,
						name         : "副标题",   
						text         : "现代化学习方式", 
						require      : true, 
                    },
                    multiText_desc:{
						is_leaf      : true, 
						type         : "multiText",   
						editable     : true, 
						is_mod_hide  : false,  
						is_card_show : true,
						name         : "文字说明",   
                        text         : "培养自主学习能力是社会发展的需要 面对新世纪的挑战，适应科学技术飞速发展的形势，适应职业转换和知识更新频率加快的要求，一个人仅仅靠在学校学的知识已远远不够，每个人都必须终身学习。终身学习能力成为一个人必须具备的基本素质。\
\n良好的学习行为习惯，能促成学生学习活动中的一种学习倾向和教学需要。它的积极性会使学生在课堂上发挥按教学目标需求教学的作用，达到教师讲课分析，学生听课思考的目标。“有的放矢”，而密切配合，这样就减少了教学中的随意性和盲目性。学生良好的的学习行为习惯不仅局限在课堂内，因此，必须逐步培养学生在课堂内外有预习的习惯、听讲的习惯、认真思考的习惯、按时独立完成作业的习惯，以及训练和复习的习惯等，并努力使其规范化。教师必须把它作为学习方法指导的一个重要内容和一项基础教学工程来实施。", 
						require      : true, 
                    },
                    media_image:{
						is_leaf      : true, 
						type         : "media",   
						mediaType    : "image",
                        editable     : true, 
						is_mod_hide  : false,  
						is_card_show : true,
                        name         : "图片",   
                        text         : config.wikiModPath + 'adi/assets/imgs/stitching.png', 
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
			
			$scope.$watch('params', function(){
				$scope.multiText_desc_md = md.render($scope.params.multiText_desc.text);
            })

			
		}]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
		},
		initObj: function(){
			return initObj;
		}
    }
});

