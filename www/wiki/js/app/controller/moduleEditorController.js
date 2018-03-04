
define([
    'app',
    'angular',
    'jquery',
	'helper/util',
    'helper/markdownwiki',
    'text!html/moduleEditor.html',
    'swiper',
    'helper/knowledgeAgent'
], function(
    app,
    angular,
    $,
    util,
    markdownwiki,
    htmlContent,
    swiper,
    agent
){
	var moduleEditorParams = config.shareMap.moduleEditorParams || {};
	config.shareMap.moduleEditorParams = moduleEditorParams;

	var objectEditor = {
		data          : {},
        fields        : [],
        addInputField : function(field){
            // 添加输入字段 {id:"html id". key:"key1.key2", type:"text!link|media", value:"字段值", isHide:false}
            
            if (!field.id || !field.type) {
                console.error("object editor addInputField params error!");
                
                return;
            }
    
            field.key         = field.key || field.id;
            field.displayName = field.displayName || field.key;
            
            self.fields.push(field);
        }
	}

	app.registerController("moduleEditorController", [
        '$scope',
        '$rootScope',
        '$uibModal',
        'selfDefinedModal',
        function (
            $scope,
            $rootScope,
            $uibModal,
            selfDefinedModal
        ) {
            var editor;
            var moduleScope;
            var design_list     = [];
            var lastSelectObj   = undefined;
            var designViewWidth = 350, win;
            var lineClassesMap  = [];
            var fakeIconDom     = [];
            var swiper          = {
                "editor" : {},
                "design" : {},
            };

            $scope.filelist    = [];
            $scope.linkFilter  = "";
            $scope.hasStyle    = false;
            $scope.agentEnable = false;
            $scope.viewIsOpen  = true;

            $scope.$watch('viewIsOpen', function() {
                $(window).trigger('resize');
            });

            function getFileList(){
                var username       = $scope.user.username;
                var dataSourceList = dataSource.getDataSourceList(username);

                for (var i = 0; i < (dataSourceList || []).length; i++) {
                    var siteDataSource = dataSourceList[i];

                    siteDataSource.getTree({path:'/'+ username}, function (data) {
                        for (var i = 0; i < (data || []).length; i++) {
                            if (data[i].pagename.indexOf(".gitignore") >= 0) {
                                continue;
                            }

                            $scope.filelist.push(data[i]);
                        }
                    });
                }
            }

            // function getOrderDatas(editorParams) {
            //     var datas = [];

            //     editorParams = editorParams || {};

            //     for (var key in editorParams) {
            //         if (editorParams[key].$data) {
            //             datas.push(editorParams[key]);
            //         }
            //     }

            //     for (var i = 0; i < datas.length; i++) {
            //         for (var j = i + 1; j < datas.length; j++) {
            //             datas[i].$data.order = datas[i].$data.order || 0;
            //             datas[j].$data.order = datas[j].$data.order || 0;
                        
            //             if (datas[i].$data.order < datas[j].$data.order) {
            //                 var tmp = datas[i];
            //                 datas[i] = datas[j];
            //                 datas[j] = tmp;
            //             }
            //         }
            //     }

            //     return datas;
            // }

            // 转换数据格式
            // function get_order_list(obj){
            //     var list = [];

            //     for (var key in obj) {
            //         if (typeof(obj[key]) == "object" && obj[key].is_leaf && obj[key].editable) {
            //             list.push(obj[key]);
            //         }
            //     }

            //     for (var i = 0; i < list.length; i++) {
            //         for (var j = i+1; j < list.length; j++) {
            //             var io = list[i].order || 9999;
            //             var jo = list[j].order || 9999;

            //             if (io > jo) {
            //                 var temp = list[j];

            //                 list[j] = list[i];
            //                 list[i] = temp;
            //             }
            //         }
            //     }

            //     var newList = [];

            //     for (var i = 0; i < list.length; i++) {
            //         var obj = list[i];

            //         if (obj.type == "simple_list") {
            //             for (var j = 0; j < obj.list.length; j++) {
            //                 if (obj.list[j].is_leaf && obj.list[j].editable){
            //                     newList.push(obj.list[j]);
            //                 }
            //             }
            //         } else if(obj.type == "list"){
            //             for (var j = 0; j < obj.list.length; j++) {
            //                 var temp = obj.list[j];
            //                 newList = newList.concat(get_order_list(temp));
            //             }
            //         } else {
            //             newList.push(obj);
            //         }
            //     }

            //     return newList;
            // }

            function applyModParams (block, modParams) {
                block.applyModParams(modParams);
            }

            function applyAttrChange () {
                if (!moduleEditorParams.block) {
                    return ;
                }

                var block     = moduleEditorParams.block;
                var modParams = moduleEditorParams.params;
                
                // if (block.wikimod && block.wikimod.mod.getModuleParams) {
                //     modParams = block.wikimod.mod.getModuleParams(modParams);
                // }

                block.applyModParams(modParams);
            }

            function removeAllLineClass (){
                var editor = editor || $rootScope.editor || {};
                var len = lineClassesMap.length;
                if (len <= 0) {
                    return;
                }
                for(var i = 0; i < len; i++){
                    editor.removeLineClass(lineClassesMap[i], "gutter", "editingLine");
                }
                lineClassesMap = [];
                // $(".mod-container.active").removeClass("active");
            }

            function setCodePosition(from, to){
                removeAllLineClass();
                var editor = editor || $rootScope.editor || {};
                for(var i = from; i < to; i++){
                    editor.addLineClass(i, "gutter", "editingLine");
                    if (lineClassesMap.indexOf(i) === -1) {
                        lineClassesMap.push(i);
                    }
                }
            }

            function initSwiper (type) {
                if (type == "knowledge"){
                    return;
                }

                var swiperContainerId = type + "Swiper";
                var slides = $("#" + swiperContainerId + " .swiper-slide");
                var renderedSlidesLen = slides.length;
                var dataName = type + "Datas";
                var totalRenderLen = 0;

                if (type == "editor") {
                    totalRenderLen = $scope.params.data ? $scope.params.datas.length : 0;
                } else if (type == "styles") {
                    totalRenderLen = $scope.params.styles ? $scope.params.styles.length : 0;
                }
                //if (renderedSlidesLen != totalRenderLen) { // ng-repeat渲染完成才能初始化swiper
                    //setTimeout(function(){
                        //initSwiper(type);
                    //}, 10);
                    //return;
                //}

                $(".ui-select-dropdown.dropdown-menu").on("mousewheel", function(event){
                    // console.log(event);
                    event.stopPropagation();
                });

                swiper[type].destroy && swiper[type].destroy(true, true);

                swiper[type] = new Swiper("#"+swiperContainerId,{
                    nextButton: '#' + swiperContainerId + ' .swiper-button-next',
                    prevButton: '#' + swiperContainerId + ' .swiper-button-prev',
                    scrollbar: '#' + swiperContainerId + ' .swiper-scrollbar',
                    direction : 'horizontal',
                    calculateHeight:true,
                    scrollbarHide: false,
                    slidesPerView: 'auto',
                    loop: false,
                    speed: 0,
                    grabCursor: true,
                    mousewheelControl: true,
                    resistance: false,         // 不可脱离边缘
                    noSwiping: true,            // 在slide上增加类名 "swiper-no-swiping"，该slide无法拖动
                });
            }

            // function setFakeIconPosition(){
            //     fakeIconDom = fakeIconDom.length > 0 ? fakeIconDom : $(".mod-container.active .fake-icon");
            //     if (fakeIconDom.length <= 0) {
            //         setTimeout(function(){
            //             setFakeIconPosition();
            //         }, 300);
            //         return;
            //     }
            //     var boxWidth = $("#preview").width();
            //     var leftDistance = boxWidth/2;
            //     var scaleSize = $rootScope.scaleSelect.scaleValue;
            //     fakeIconDom.css({
            //         "left" : leftDistance / scaleSize
            //     });
            //     fakeIconDom = [];
            // }

            function initAgent(){
                agent.init("agent", "/agent")
                agent.botUI("knowlege-agent")
            }

            function init() {
                $scope.params = moduleEditorParams;
                editor        = editor || $rootScope.editor || {};

                function setDesignViewWidth () {
                    win = win || $(window);

                    var winWidth  = win.width();
                    var scaleSize = designViewWidth / winWidth;

                    setTimeout(function () {
                        $("#designSwiper div.design-view").css({
                            "transform": "scale(" + scaleSize + ")",
                            "transform-origin": "left top"
                        });
                    });
                }

                moduleEditorParams.reload = function() {
                    if (!this.block) {
                        return;
                    }

                    var block = this.block;

                    if (block && typeof(block.wikimod) == "object" && typeof(block.wikimod.mod) == "object") {
                        if (typeof(block.wikimod.mod.params) == "object") {
                            this.params = util.mixin(block.wikimod.mod.params, block.modParams);

                            // 删除无效元素
                            for (var item in this.params) {
                                if (/^[0-9]+.?[0-9]*$/.test(item)) {
                                    delete this.params[item];
                                }

                                if(typeof(this.params[item]) == 'object' && JSON.stringify(this.params[item]) == '{}'){
                                    delete this.params[item];
                                }
                            }

                            // this.datas  = getOrderDatas(this.params);
                        } else {
                            this.params = undefined;
                            this.datas  = undefined;
                        }

                        if (typeof(block.wikimod.mod.design) == "object") {
                            this.styles = block.wikimod.mod.design;
                        } else {
                            this.styles = undefined;
                        }
                    } else {
                        this.params = undefined;
                        this.datas  = undefined;
                        this.styles = undefined;
                    }
                }

                moduleEditorParams.setBlock = function(block) {
                    $scope.params.params = [];
                    moduleEditorParams.setShowType('knowledge');

                    if (!block.token || !block.wikimod) {
                        return;
                    }

                    var self = this;

                    if (self.block && block && self.block.token.start == block.token.start && (self.datas || self.styles)) {
                        angular.merge(self.params, block.modParams);
                        return;
                    }

                    self.block = block;
                    self.reload();

                    // setFakeIconPosition();

                    var blockLineNumFrom = self.block.token.start;
                    var blockLineNumTo   = self.block.token.to;

                    setCodePosition(blockLineNumFrom, blockLineNumTo);

                    self.setShowType("editor");

                    moduleScope = self.block.$scope;

                    util.$apply();
                }

                moduleEditorParams.setShowType = function(show_type) {
                    this.show_type   = show_type;
                    $scope.show_type = show_type;

                    if (show_type == "knowledge") {
                        this.setKnowledge("");

                        this.params = undefined;
                        this.styles = undefined;
                        this.block  = undefined;
                        // this.datas  = undefined;
                    } else {
                        initSwiper(show_type);
                    }

                    util.$apply();
                }

                moduleEditorParams.setEditorObj = function(obj) {
                    var self = this;

                    if (!self.block) {
                        return;
                    }

                    moduleScope.applyAttrChange = function(){
                        util.throttle(applyAttrChange);
                    }

                    self.setShowType("editor");


                    //var selectObj = moduleEditorParams.selectObj;
                    //if (selectObj) {
                        //if (!isFunction(swiper["editor"].slideTo)) {
                            //return;
                        //}
                        //var slideStartId = $scope.editorDatas[0].id;
                        //var slideToId = selectObj.id;
                        //var indexSlideTo = slideToId - slideStartId;
                        //swiper["editor"].slideTo(indexSlideTo);
                        //$(".swiper-slide.active").removeClass("active");
                        //$("#" + slideToId).addClass("active");
                        //$("#" + slideToId + " .js-focus").focus();
                    //}
                }

                moduleEditorParams.setDesignList = function() {
                    var self      = this;
                    var styles    = self.styles || [];
                    var block     = self.block;
                    var modParams = self.params;

                    self.setShowType("design");

                    $scope.designDatas    = [];
                    $scope.selectedDesign = modParams.design.id;

                    for (var key in styles) {
                        if (styles.hasOwnProperty(key)) {
                            var design = {
                                "cmdName"    : block.cmdName,
                                "styleName"  : key,
                                "params"     : modParams,
                            }
    
                            $scope.designDatas.push(design);
                            // setDesignViewWidth();
                        }
                    }

                    // initSwiper("design");
                }

                moduleEditorParams.setKnowledge = function(lineContent){
                    removeAllLineClass();

                    moduleEditorParams           = config.shareMap.moduleEditorParams || {};
                    moduleEditorParams.show_type = "knowledge";

                    $scope.show_type   = "knowledge";
                    $scope.lineContent = lineContent;

                    if(!$scope.agentEnable){
                        $scope.agentEnable = true;
                        initAgent();
                    }
                }

                // $scope.show_type = "editor";
                $scope.datas_stack = [];

                getFileList();

                moduleEditorParams.setKnowledge("");
                moduleEditorParams.setShowType("knowledge");
            }

            // 隐藏事件
            $scope.click_hide = function(data) {
                data.is_mod_hide = !data.is_mod_hide;
                //applyAttrChange();
                util.throttle(applyAttrChange);
            }

            // 点击菜单
            $scope.openMenuEditor = function(data) {
                config.services.datatreeEditorModal({
                    title: '菜单编辑器',
                    keys: [
                        {key:'url', name: '链接', placeholder:"请输入链接"},
                    ],
                    showLocation: true,
                    datatree: data.list
                }, function(result){
                    data.list = result;
                    //applyAttrChange();
                    util.throttle(applyAttrChange);
                }, function(err){
                });
            }

            // 打开自定义Modal
            $scope.openModal = function(data){
                if(moduleScope.options && moduleScope.success && moduleScope.error){
                    selfDefinedModal(moduleScope.options, moduleScope.success, moduleScope.error);
                }
            }

            // 多行文本弹窗
            $scope.openMultiText = function(data, key){
                key = key || "text";
                $scope.editingData = data[key];
                $uibModal.open({
                    templateUrl: config.htmlPath + "editMultiText.html",
                    controller: "multiTextController",
                    size: "multi-text",
                    scope: $scope
                }).result.then(function(result){
                    // console.log(result);
                    //applyAttrChange();
                    data[key] = result;
                    util.throttle(applyAttrChange);
                    // $scope.editingData.text = result;
                });
            }

            // 图库弹窗
            $scope.showImageModal = function(data){
                // console.log(data);
                config.services.assetsManagerModal({
                    title: '选择图片',
                    nav: 'myImages' ,//or 'internetImage' or 'beautifyImage'
                    modalPositionCenter: true,
                    currentPage: {
                        username: $scope.userinfo.username,
                        sitename: $scope.userinfo.sitename
                    }
                }, function(url) {
                    //handle url
                    // console.log(data);
                    data.text = url;
                    //applyAttrChange();
                    util.throttle(applyAttrChange);
                });
            }

            $scope.setItem = function(data, type){
                switch (type) {
                    case "image":
                        data.mediaType = type;
                        break;
                    case "video":
                        data.mediaType = type;
                        break;
                    default:
                        data.mediaType = "image";
                        break;
                }
            }

            $scope.setLink = function(key, data){
                $uibModal.open({
                    templateUrl: config.htmlPath + "editorInsertLink.html",
                    controller: "linkCtrl",
                }).result.then(function (provider) {
                    if (provider == "link") {
                        var link = $rootScope.link;
                        data[key] = link.url;
                        //applyAttrChange();
                        util.throttle(applyAttrChange);
                    }
                }, function (text, error) {
                    // console.log('text:' + text);
                    // console.log('error:' + error);
                    return;
                });
            }

            $scope.setShowResult = function(value){
                setTimeout(function(){
                    $scope.showResult = value;
                    $scope.linkFilter = "";
                });
            }

            $scope.urlSelected = function(item, modal, data, key){
                key = key || "href";
                data[key] = item.url;
                //applyAttrChange();
                util.throttle(applyAttrChange);
            }

            $scope.selectUrl = function(data, url){
                data.href = url;
                $scope.showResult = false;
                $scope.linkFilter = "";
                //applyAttrChange();
                util.throttle(applyAttrChange);
            }

            $scope.userInputLink = function($select, data, key){
                var search = $select.search,
                    list = angular.copy($select.items),
                    FLAG = -1;
                //remove last user input
                list = list.filter(function(item) {
                    return item.id !== FLAG;
                });
                if (!search) {
                    $select.items = list;
                }
                else {
                    //manually add user input and set selection
                    var userInputItem = {
                        id: FLAG,
                        url: search
                    };
                    $select.items = [userInputItem].concat(list);
                    $select.selected = userInputItem.url;
                    data[key || "href"] = userInputItem.url;
                    applyAttrChange();
                }
            }

            $scope.showAllLink = function(){
                $scope.linkFilter = $scope.user.username;
                $scope.showResult = true;

                setTimeout(function(){
                    $(document).bind("click.allLink", function(e){
                        $scope.showResult = false;
                        $scope.linkFilter = "";
                        $scope.$apply();
                        $(document).unbind("click.allLink");
                    });
                });
            }

            $scope.getLinkTarget = function(data){
                // if (!data.target) {
                //     data.target = "_blank";
                // }

                // var linkTarget;

                // switch (data.target) {
                //     case "_self":
                //         linkTarget = "本窗口打开";
                //         break;
                //     default:
                //         linkTarget = "新窗口打开";
                //         break;
                // }
                // return linkTarget;
            }

            $scope.setLinkTarget = function(data, value){
                if (value == "_blank" || value == "_self") {
                    data.target = value;
                }
                data.target = data.target || "_blank";
                //applyAttrChange();
                util.throttle(applyAttrChange);
            }

            $scope.enablePack = function(pack){
                $scope.memoryContext = {}
            }

            $scope.applyAttrChange = function (text) {
                util.throttle(applyAttrChange);
                util.$apply();
            }

            $scope.click_apply_design = function(item) {
                console.log(item);
                
                var block     = moduleEditorParams.block;
                var modParams = moduleEditorParams.params;
                var styleName = item.styleName;

                $scope.selectedDesign = styleName;
                modParams.design.id   = styleName;

                console.log(moduleEditorParams);
                console.log(modParams);

                block.applyModParams(modParams);
                moduleEditorParams.setDesignList();

                // setTimeout(function(){
                //     moduleEditorParams.reload();
                //     console.log(moduleEditorParams.block);
                // }, 4000)

                // if (block.wikimod && block.wikimod.mod.styles) {
                //     modParams = block.wikimod.mod.getStyleParams(modParams, style);

                //     block.applyModParams(modParams);
                // } else {
                //     angular.extend(modParams, style);
                //     applyAttrChange();
                // }

                // block.modParams = modParams;
                // moduleEditorParams.reload();
                //util.$apply();
            }

            $scope.tabTo = function (tabname) {
                var moduleEditorParams = config.shareMap.moduleEditorParams || {};

                $scope.show_type = tabname;

                if (tabname == "design") {
                    moduleEditorParams.setDesignList();
                }
            }

            $scope.deleteMod = function(){
                config.services.confirmDialog({
                    "title": "删除提示",
                    "theme": "danger",
                    "content": "确定删除这个模块？"
                }, function(result){
                    removeAllLineClass();
                    var moduleEditorParams = config.shareMap.moduleEditorParams || {};
                    var editor = editor || $rootScope.editor || {};
                    var from = moduleEditorParams.wikiBlock.blockCache.block.textPosition.from;
                    var to = moduleEditorParams.wikiBlock.blockCache.block.textPosition.to;
                    editor.replaceRange("", {
                        "line": from,
                        "ch": 0
                    }, {
                        "line": to,
                        "ch": editor.getLine(to).length
                    });
                }, function(cancel){
                    // console.log("cancel delete");
                });
            }

            $scope.$watch("$viewContentLoaded", init);
        }
    ]);

    app.registerController("multiTextController", ["$scope", "$uibModalInstance", function($scope, $uibModalInstance){
        $scope.multiText = $scope.editingData;

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

        $scope.finishEdit = function(){
            $uibModalInstance.close($scope.multiText);
        }
    }])

	return htmlContent;
})
