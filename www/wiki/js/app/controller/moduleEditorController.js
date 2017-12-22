
define([
	'app',
	'helper/util',
    'helper/markdownwiki',
    'text!html/moduleEditor.html',
    'swiper',
], function(app, util, markdownwiki, htmlContent, swiper){
	var objectEditor = {
		data: {},
		fields:[],
	}

	// 添加输入字段 {id:"html id". key:"key1.key2", type:"text!link|media", value:"字段值", isHide:false}
	objectEditor.addInputField = function(field){
		if (!field.id || !field.type) {
			console.log("object editor addInputField params error!");
			return;
		}
		
		field.key = field.key || field.id;
		field.displayName = field.displayName || field.key;
		self.fields.push(field);	
	}

	app.registerController("moduleEditorController", ['$scope', '$rootScope', function($scope, $rootScope){
		var design_list = [];
		var lastSelectObj = undefined;
        var editor;
        var designViewWidth = 350, win;
        var lineClassesMap = [];
		// 转换数据格式
		function get_order_list(obj){
			console.log(obj);
			var list = [];
			for (var key in obj) {
				if (typeof(obj[key]) == "object" && obj[key].editable) {
					list.push(obj[key]);
				}
			}

			for (var i = 0; i < list.length; i++) {
				for (var j = i+1; j < list.length; j++) {
					var io = list[i].order || 9999;
					var jo = list[j].order || 9999;
					if (io > jo) {
						var temp = list[j];
						list[j] = list[i];
						list[i] = temp;
					}
				}
			}
			var newList = [];
			for (var i = 0; i < list.length; i++) {
				var obj = list[i];
				if (obj.type == "simple_list") {
					for (var j = 0; j < obj.list.length; j++) {
						if (obj.list[j].is_show){
							newList.push(obj.list[j]);
						}
					}
				} else if(obj.type == "list"){
					for (var j = 0; j < obj.list.length; j++) {
						var temp = obj.list[j];
						newList = newList.concat(get_order_list(temp));
					}
				} else {
					newList.push(obj);
				}
			}

			console.log(newList);
			return newList;
		}


		// 隐藏事件
		$scope.click_hide = function(data) {
			data.is_hide = !data.is_hide;
		}

		// 点击列表项
		$scope.click_list_item = function(item) {
			$scope.datas_stack.push($scope.datas);
			// console.log(item);
			if (item.is_leaf) {
				$scope.datas = [item];
			} else {
				$scope.datas = item;
			}
        }
        
        // 点击菜单
        $scope.openMenuEditor = function(data) {
            console.log(data);
            config.services.datatreeEditorModal({
                title: data.name, 
                keys: [
                    {key:'url', name: '链接', placeholder:"请输入链接"},
                    {key:'note', name: '备注', placeholder:"请输入备注"},
                ], 
                showLocation: true, 
                datatree: data.text
            }, function(result){
                data.text = result;
                $scope.applyAttrChange();
                console.log(result);
            }, function(err){
                console.log(err);
            });
        }

		$scope.close = function() {
			var moduleEditorParams = config.shareMap.moduleEditorParams || {};
			$scope.datas = $scope.datas_stack.pop();
			if (!$scope.datas) {
				//$scope.$close();
				$("#moduleEditorContainer").hide();
				moduleEditorParams.is_show = false;
				if (moduleEditorParams.wikiBlock) {
					var modParams = angular.copy(moduleEditorParams.wikiBlock.modParams);
					//console.log(modParams);
					var paramsTemplate = angular.copy(moduleEditorParams.wikiBlock.params_template);
					//console.log(paramsTemplate, modParams);
					modParams = moduleEditorParams.wikiBlock.formatModParams("", paramsTemplate, modParams, true);
					//console.log(modParams);
					moduleEditorParams.wikiBlock.applyModParams(modParams);
					//config.shareMap.moduleEditorParams = undefined;
				}
			}
        }

        function throttle(method, context) {
            clearTimeout(method.stickTimer);
            method.stickTimer = setTimeout(function () {
                method.call(context);
            },500);
        }

        function applyAttrChange(){
            var moduleEditorParams = config.shareMap.moduleEditorParams || {};
            if (moduleEditorParams.wikiBlock) {
                var modParams = angular.copy(moduleEditorParams.wikiBlock.modParams);
                //console.log(modParams);
                var paramsTemplate = angular.copy(moduleEditorParams.wikiBlock.params_template);
                //console.log(paramsTemplate, modParams);
                modParams = moduleEditorParams.wikiBlock.formatModParams("", paramsTemplate, modParams, true);
                //console.log(modParams);
                moduleEditorParams.wikiBlock.applyModParams(modParams);
                //config.shareMap.moduleEditorParams = undefined;
            }
        }
        
        $scope.applyAttrChange = function () {
            throttle(applyAttrChange);
        }

		$scope.click_apply_design = function(index) {
			var moduleEditorParams = config.shareMap.moduleEditorParams || {};
			var modParams = $scope.styles[index];
            console.log(modParams);
            $scope.selectedDesign = modParams.design.text;
			if (moduleEditorParams.wikiBlock) {
				moduleEditorParams.wikiBlock.applyModParams(modParams);
			}
        }

        $scope.tabTo = function (tabname) {
            var moduleEditorParams = config.shareMap.moduleEditorParams || {};
            $scope.show_type = tabname;
            if (tabname == "design") {
                moduleEditorParams.setDesignList();
            }
        }

        var removeAllLineClass = function(){
            var editor = editor || $rootScope.editor || {};
            var len = lineClassesMap.length;
            if (len <= 0) {
                return;
            }
            for(var i = 0; i < len; i++){
                editor.removeLineClass(lineClassesMap[i], "gutter", "editingLine");
            }
            lineClassesMap = [];
        }
        
        var setCodePosition = function(from, to){
            removeAllLineClass();
            var editor = editor || $rootScope.editor || {};
            for(var i = from; i < to; i++){
                editor.addLineClass(i, "gutter", "editingLine");
                if (lineClassesMap.indexOf(i) === -1) {
                    lineClassesMap.push(i);
                }
            }
        }

		function init() {
            editor = editor || $rootScope.editor || {};
			var moduleEditorParams = config.shareMap.moduleEditorParams || {};
			config.shareMap.moduleEditorParams = moduleEditorParams;
			//moduleEditorParams.$scope = $scope;
			moduleEditorParams.setEditorObj = function(obj) {
				moduleEditorParams = config.shareMap.moduleEditorParams || {};
                var selectObj = moduleEditorParams.selectObj;
				if (selectObj) {
					setTimeout(function(){
						$("#" + selectObj.id).css("background-color", "red");
					});
                }
                
                var blockLineNumFrom = moduleEditorParams.wikiBlock.blockCache.block.textPosition.from;
                var blockLineNumTo = moduleEditorParams.wikiBlock.blockCache.block.textPosition.to;
                setCodePosition(blockLineNumFrom, blockLineNumTo);

				$scope.show_type = "editor";

				if (obj.is_leaf) {
					obj = [obj];
				}

        $scope.datas = get_order_list(obj);
        util.$apply();
        setTimeout(function(){				
              var editorSwiper = new Swiper('#editorSwiper',{
                  nextButton: '#editorSwiper .swiper-button-next',
                  prevButton: '#editorSwiper .swiper-button-prev',
                  pagination: '#editorSwiper .swiper-pagination',
                  scrollbar: '#editorSwiper .swiper-scrollbar',
                  scrollbarHide: false,
                  slidesPerView: 'auto',
                  mousewheelControl: true,
                  spaceBetween: 50,
              });  
          }, 1000);
      }
      var setDesignViewWidth = function(){
          win = win || $(window);
          var winWidth = win.width();
          var scaleSize = designViewWidth / winWidth;
          setTimeout(function () {
              $("#designSwiper div.design-view").css({
                  "transform": "scale(" + scaleSize + ")",
                  "transform-origin": "left top"
              });    
          });

      }
			moduleEditorParams.setDesignList = function(list) {
                moduleEditorParams = config.shareMap.moduleEditorParams || {};
                $scope.selectedDesign = moduleEditorParams.wikiBlock.modParams.design.text;
				var style_list = moduleEditorParams.wikiBlock.styles || [];
				$scope.show_type = "design";
				$scope.styles = [];
				$scope.design_view_list = [];
				for (var i = 0; i < style_list.length; i++) {
					var modParams = angular.copy(moduleEditorParams.wikiBlock.modParams);
					modParams = angular.merge(modParams, style_list[i]);
                    $scope.styles[i] = modParams;
					var md = markdownwiki({mode:"preview", html:true, use_template:false});
                    var text = '```' + moduleEditorParams.wikiBlock.cmdName + "\n" + config.services.mdconf.jsonToMd(modParams) + "\n```\n";
                    var view = md.render(text);
                    var design = {
                        "text": $scope.styles[i].design.text,
                        "view": view,
                        "cover": style_list[i].design.cover || ""
                    }

                    $scope.design_view_list.push(design);
                    setDesignViewWidth();
                }
                setTimeout(function(){
                    var editorSwiper = new Swiper('#designSwiper',{
                        nextButton: '#designSwiper .swiper-button-next',
                        prevButton: '#designSwiper .swiper-button-prev',
                        pagination: '#designSwiper .swiper-pagination',
                        scrollbar: '#designSwiper .swiper-scrollbar',
                        scrollbarHide: false,
                        slidesPerView: 'auto',
                        mousewheelControl: true,
                        spaceBetween: 50,
                    });  
                }, 1000);
			}
			// $scope.show_type = "editor";
            $scope.datas_stack = [];
		}

		$scope.$watch("$viewContentLoaded", init);
	}]);


	return htmlContent;
})
