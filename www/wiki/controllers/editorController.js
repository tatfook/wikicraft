/**
 * Created by Karlwu on 2016-10-18.
 */

angular.module('MyApp')
.controller('linkCtrl', function ($scope, $rootScope, $uibModalInstance) {
    $scope.link = {url:'',txt:''};

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.link_insert = function(){
        $rootScope.link = $scope.link;
        $uibModalInstance.close("link");
    }
})
.controller('tableCtrl', function ($scope, $rootScope, $uibModalInstance) {
        $scope.table = {rows:2,cols:2,alignment:0};

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

        $scope.table_insert = function(){
            $rootScope.table = $scope.table;
            $uibModalInstance.close("table");
        }
 })
.controller('pageCtrl', function ($scope, $rootScope, $http, $uibModalInstance) {

    $scope.websites = {};           //站点列表
    $scope.websitePages =  {};       //页面列表

    $scope.website = {};            //当前选中站点
    $scope.websitePage = {};        //当前选中页面

    $scope.style = {};      //模板

    $scope.website_select = function (wb) {
        $scope.website =  wb;
        $http.post('http://localhost:8099/api/wiki/models/website_template_style', {_id: $scope.website.styleId}).then(function (response) {
            $scope.style = response.data;  // 模板代码style.content
        })
    }

     //初始化
    function init() {
        $scope.websites = $rootScope.websites;           //站点列表
        $scope.websitePages =  $rootScope.websitePages;       //页面列表

        if(  $rootScope.website ){
            for(var i=0;i< $scope.websites.length;i++){
                if($scope.websites[i]._id == $rootScope.website._id){
                    $scope.website_select($scope.websites[i]);
                    break;
                }
            }
        }
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.website_new = function(){
        if( $scope.website.name === undefined ||  $scope.website.name.length == 0 ) {
            alert('请选择站点');
            return false;
        }

        if( $scope.websitePage.name === undefined ||  $scope.websitePage.name.length == 0 ) {
            alert('请填写页面名');
            return false;
        }

        $scope.websitePage.url = '/'+ $scope.website.name + '/' + $scope.websitePage.name;
        $scope.websitePage.websiteName = $scope.website.name;
        $scope.websitePage.websiteId =  $scope.website._id;
        $scope.websitePage.content = $scope.style.data[0].content;

        $http.put('http://localhost:8099/api/wiki/models/website_pages/new',$scope.websitePage).then(function (response) {
            $rootScope.websitePage = response.data.data;
            $rootScope.website = $scope.website;

            $uibModalInstance.close("page");
        }).catch(function (response) {
            console.log(response.data);
            alert('新建页面失败');
        });
    }
    init();
})
.controller('editorController', function  ($scope, $rootScope, $http, $location, $uibModal) {

    $scope.websites = [];           //站点列表
    $scope.websitePages = [];       //页面列表

    $scope.website = {};            //当前选中站点
    $scope.websitePage = {};        //当前选中页面

    init();
    command();

    function isEmptyObject(obj) {
        for (var key in obj) {
            return false;
        }
        return true;
    }

    //初始化
    function init() {
        // 获取用户站点列表
        $http.post('http://localhost:8099/api/wiki/models/website',{userid:1}).then( function (response) {
            $scope.websites = response.data.data;

            for(var i=0;i< $scope.websites.length;i++){
                ws = $scope.websites[i];
                $http.post('http://localhost:8099/api/wiki/models/website_pages',{websiteName:ws.name}).then(function (response) {
                    pages = response.data.data;
                    for(var j=0;j<pages.length;j++){
                        $scope.websitePages.push(pages[j]);
                    }
                    if(i == $scope.websites.length){
                        initRoot();
                        initTree();
                    }
                }).catch(function (response) {
                    console.log(response.data);
                });
            }
        }).catch(function (response) {
            console.log(response.data);
        });
        return;
    }

    function initRoot(){
        $rootScope.websites = $scope.websites;
        $rootScope.websitePages =  $scope.websitePages;

        if(!isEmptyObject($rootScope.website)) $scope.website = $rootScope.website;                    //当前选中站点
        if(!isEmptyObject($rootScope.websitePage)){
            $scope.websitePage = $rootScope.websitePage;
            openPage();
        }
    }

    function getTree(){
        var ws = {};
        var wp = {};
        var node = '';

        var treeData = "[";
        for(var i=0;i< $scope.websites.length;i++) {
            ws = $scope.websites[i];
            //console.log(ws);        //"icon": "glyphicon glyphicon-stop","selectedIcon": "glyphicon glyphicon-stop",
            treeData += '{"text":"' + ws.name + '","icon":"fa fa-globe","selectable":false,"tags": ["site","' + ws._id +'"],__nodes__},';
            node = '';
            for(var j=0;j<  $scope.websitePages.length;j++){
                wp =  $scope.websitePages[j];
                if(wp.del != undefined && wp.del == 1){
                    continue;
                }
                //console.log(wp);
                if(ws._id == wp.websiteId){
                    node += '{"text": "' + wp.name + '","icon":"fa fa-file-o",  "selectedIcon": "fa fa-file-text-o", "tags": ["page","'+ wp._id +'","'+ ws._id +'"]},';
                }
            }
            node = node.replace(/(.*)[,，]$/, '$1');
            if(node){
                node = '"nodes":[' + node + ']';
                treeData = treeData.replace('__nodes__',node);
            }else{
                treeData = treeData.replace(',__nodes__','');
            }
        }

        treeData = treeData.replace(/(.*)[,，]$/, '$1');
        treeData += "]";
        return treeData;
    }

    function getWebsite(id){
        for(var i=0;i< $scope.websites.length;i++) {
            ws = $scope.websites[i];
            if(ws._id == id){
                return ws;
            }
        }
        return null;
    }

    function getWebsitePage(id){
        for(var j=0;j<  $scope.websitePages.length;j++){
            wp =  $scope.websitePages[j];
            if(wp._id == id){
                return wp;
            }
        }
        return null;
    }

    function openPage(){
        var wp = $scope.websitePage;
        if(isEmptyObject(wp)){
            $scope.websitePage = {};
            delete $rootScope.websitePage;
            editor.setValue('');
            $('#btUrl').val('');
            $('.toolbar-page-remove').attr("disabled",true);
        }else{
            editor.setValue(wp.content);
            $('#btUrl').val(wp.url);
            $('.toolbar-page-remove').attr("disabled",false);
        }
    }

    //初始化目录树  data:  $.parseJSON(getTree()),
    function initTree(){
        $('#treeview').treeview({
            color: "#428bca",
            showBorder: false,
            enableLinks: true,
            data: getTree(),
            onNodeSelected: function(event, data) {
                var tags = data.tags;
                switch(tags[0]){
                    case 'site':
                        $scope.website =  getWebsite(tags[1]);
                        $rootScope.website =  $scope.website;
                        //console.log($scope.website);
                        break;
                    case 'page':
                        $scope.websitePage =  getWebsitePage(tags[1]);
                        $scope.website =  getWebsite(tags[2]);

                        $rootScope.websitePage =  $scope.websitePage;
                        $rootScope.website =  $scope.website;

                        openPage();

                        break;
                    default:
                        console.log('tag error');
                        break;
                }
                editor.focus();
            }
        });
    }

    //命令处理函数
    function command( ){
        var strCmd = $location.$$path;
        var arrCmd = strCmd.split('_');
        var cmd = '';
        for(var i=0;i<arrCmd.length;i++){
            cmd = arrCmd[i];
            if(cmd.substr(0,1) == '&'){
                switch (cmd.substring(1)){
                    case 'new':
                        console.log('command:new');
                        break;
                    default:
                        console.log('command:undefined!'+ cmd );
                        break;
                }
            }
        }
        return;
    }

    $scope.cmd_newpage = function () {
        $uibModal.open({
            templateUrl: WIKI_WEBROOT+ "html/editorNewPage.html",
            controller: "pageCtrl",
        }).result.then(function (provider){
            //console.log(provider);
            if (provider == "page") {
                $scope.websitePages.push($rootScope.websitePage);
                $scope.websitePage = $rootScope.websitePage;
                $scope.website =  $rootScope.website;

                initTree();
                openPage();

                var selectableNodes = $('#treeview').treeview('search', [ $scope.websitePage.name, { ignoreCase: false, exactMatch: true } ]);
                $.each(selectableNodes,function(index,item){
                    if(item.tags[0] == "page" && item.tags[1]==$scope.websitePage._id){
                        $('#treeview').treeview('selectNode', [  item, { silent: true }]);
                    }
                });
                $('#treeview').treeview('clearSearch');

                //下面是addNode实现方式
                //$websiteNode = $('#treeview').treeview("search",[ $scope.website.name, {exactMatch: true }]);
                //$('#treeview').treeview("addNode", [$websiteNode[0].nodeId, { node:{
                //    text:$scope.websitePage.name,
                //    icon:"fa fa-file-o",
                //    selectedIcon:"fa fa-file-text-o",
                //    tags:["newpage",$scope.websitePage._id,$scope.websitePage.websiteId]
                //}}]);
                //$rootScope.websiteNode = $scope.website;
                //$rootScope.websitePage = response.data;
            }
        }, function (text, error) {
            console.log('text:'+text);
            console.log('error:'+error);
            return;
        });
    }

    //保存页面
    $scope.cmd_savepage = function () {

        //var el = document.getElementById("editor");
        //var content = el.env.editor.getValue();
        var content = editor.getValue();

        if( ! isEmptyObject($scope.websitePage)){//修改
            //    $scope.websitePage.content = content;
            $http.put('http://localhost:8099/api/wiki/models/website_pages',$scope.websitePage).then(function (response) {
                //console.log(response.data);
                alert('修改成功');
            }).catch(function (response) {
                console.log(response.data);
            });
        }else{// 新增
            console.log('save temp file');
        }
    }

    //撤销
    $scope.cmd_undo = function () {
        editor.undo();
    }

    //重做
    $scope.cmd_redo = function () {
        editor.redo();
    }

    //查找
    $scope.cmd_find = function () {
        CodeMirror.commands.findPersistent(editor);
    }

    //替换
    $scope.cmd_replace = function () {
        CodeMirror.commands.replace(editor);
    }

    //标题    H1：Hn
    $scope.cmd_headline = function (level){
        var preChar='';
        while(level>0){
            preChar += '#';
            level--;
        }
        preChar += ' ';

        var cursor = editor.getCursor();
        var content = editor.getLine(cursor.line);

        var iSpace = 0;
        var chrCmp = '';
        for(var i=0;i<content.length;i++){
            chrCmp = content.substr(i,1);
            if( chrCmp == '#'){
                continue;
            }else{
                if(chrCmp == ' '){
                    iSpace = i+1;
                }
                break;
            }
        }
        editor.replaceRange(preChar,CodeMirror.Pos(cursor.line,0),CodeMirror.Pos(cursor.line,iSpace));
        return;
    }

    function font_style(char){
        if(editor.somethingSelected()){
            var sel = editor.getSelection();
            var desStr = char + sel.replace(/\n/g,char+"\n"+char) + char;
            editor.replaceSelection(desStr);
        }else{
            var cursor = editor.getCursor();
            var content = editor.getLine(cursor.line);

            editor.replaceRange(char,CodeMirror.Pos(cursor.line,content.length),CodeMirror.Pos(cursor.line,content.length));
            editor.replaceRange(char,CodeMirror.Pos(cursor.line,0),CodeMirror.Pos(cursor.line,0));

            editor.setCursor(CodeMirror.Pos(cursor.line,content.length + char.length));
        }
        editor.focus();
    }

    //加粗
    $scope.cmd_bold = function () {
        font_style('**');
    }

    //斜体
    $scope.cmd_italic = function () {
        font_style('*');
    }

    //下划线
    $scope.cmd_underline = function () {
    }

    //下划线
    $scope.cmd_strikethrough = function () {
        font_style('~~');
    }

    //上标
    $scope.cmd_superscript = function () {
        font_style('^');
    }

    //下标
    $scope.cmd_subscript = function () {
        font_style('~');
    }

    //有序列表
    $scope.cmd_listol = function () {
        if(editor.somethingSelected()){
            var sel = editor.getSelection();
            var srcStr = '~ol~' + sel.replace(/\n/g,"\n~ol~");

            var id = 1;
            var desStr = srcStr.replace("~ol~",id+'. ');
            while(desStr.indexOf("~ol~")>=0){
                id++;
                desStr = desStr.replace("~ol~",id+'. ');
            }

            editor.replaceSelection(desStr);
        }else{
            var cursor = editor.getCursor();
            editor.replaceRange('1. ',CodeMirror.Pos(cursor.line,0),CodeMirror.Pos(cursor.line,0));
        }
        editor.focus();
    }

    //行首关键字
    function hol_keyword(char){
        if(editor.somethingSelected()){
            var sel = editor.getSelection();
            var desStr = char + sel.replace(/\n/g,"\n"+char);
            editor.replaceSelection(desStr);
        }else{
            var cursor = editor.getCursor();
            editor.replaceRange(char,CodeMirror.Pos(cursor.line,0),CodeMirror.Pos(cursor.line,0));
        }
        editor.focus();
    }

    //无序列表
    $scope.cmd_listul = function () {
        hol_keyword('+ ');
    }

    //引用内容
    $scope.cmd_blockqote = function () {
        hol_keyword('> ');
    }

    //表格
    $scope.cmd_tabel = function () {
        $uibModal.open({
            templateUrl: WIKI_WEBROOT+ "html/editorInsertTable.html",
            controller: "tableCtrl",
        }).result.then(function (provider){
            //console.log(provider);
            if (provider == "table") {
                var table = $rootScope.table;
                //console.log(table);
                //| 0:0 | 1:0 |
                //| -- | -- |
                //| 0:2 | 1:2 |
                var wiki = '';
                for(var i=0;i<table.rows;i++){
                    wiki += '\n';
                    if(i==1){
                        for(var j=0;j<table.cols;j++){
                                switch (table.alignment){
                                    case 1:
                                        wiki += '|:-- ';
                                        break;
                                    case 2:
                                        wiki += '|:--:';
                                        break;
                                    case 3:
                                        wiki += '| --:';
                                        break;
                                    default:
                                        wiki += '| -- ';
                                        break;
                                }
                        }
                        wiki += '|\n';
                    }

                    for(var j=0;j<table.cols;j++){
                        wiki += '| '+ j + ':'+ i + ' ';
                    }
                    wiki += '|';
                }
                wiki += '\n';

                var cursor = editor.getCursor();
                var content = editor.getLine(cursor.line);
                if(content.length > 0){
                    wiki += '\n';
                }

                editor.replaceRange(wiki,CodeMirror.Pos(cursor.line+1,0),CodeMirror.Pos(cursor.line+1,0));
                editor.setCursor(CodeMirror.Pos(cursor.line+1,0));
                editor.focus();
            }
        }, function (text, error) {
            console.log('text:'+text);
            console.log('error:'+error);
            return;
        });
    }

    //水平分割线
    $scope.cmd_horizontal = function () {
        var cursor = editor.getCursor();
        editor.replaceRange('\n---',CodeMirror.Pos(cursor.line+1,0),CodeMirror.Pos(cursor.line+1,0));
        editor.setCursor(CodeMirror.Pos(cursor.line+1,3));
        editor.focus();
    }

    //链接
    $scope.cmd_link = function () {
        $uibModal.open({
            templateUrl: WIKI_WEBROOT+ "html/editorInsertLink.html",
            controller: "linkCtrl",
        }).result.then(function (provider){
            if (provider == "link") {
                var link = $rootScope.link;
                var wiki = '';
                if(editor.somethingSelected()){
                    wiki += '['+editor.getSelection()+']';
                }else{
                    wiki += '[]';
                }
                wiki += '('+link.url+')';
                editor.replaceSelection(wiki);

                //var wiki = '[' + link.txt + '](' + link.url + ')\n';
                //var cursor = editor.getCursor();
                //var content = editor.getLine(cursor.line);
                //if(content.length>0){
                //    editor.replaceRange(wiki,CodeMirror.Pos(cursor.line+1,0),CodeMirror.Pos(cursor.line+1,0));
                //    editor.setCursor(CodeMirror.Pos(cursor.line+1,1));
                //}else{
                //    editor.replaceRange(wiki,CodeMirror.Pos(cursor.line,0),CodeMirror.Pos(cursor.line,0));
                //    editor.setCursor(CodeMirror.Pos(cursor.line,1));
                //}
                editor.focus();
            }
        }, function (text, error) {
            console.log('text:'+text);
            console.log('error:'+error);
            return;
        });
    }

    //图片
    $scope.cmd_image = function () {
        $('#imageModal').modal({
            keyboard: true
        })
    }

    //代码
    $scope.cmd_code = function () {
        var sel = editor.getSelection();
        var desStr = '```' + sel + '```';
        editor.replaceSelection(desStr);

        var cursor = editor.getCursor();
        editor.setCursor(CodeMirror.Pos(cursor.line,cursor.ch-3));

        editor.focus();
    }

    //删除
    $scope.cmd_remove = function () {
        if (!isEmptyObject($scope.websitePage)) {
            var retVal = confirm("你确定要删除页面:"+$scope.websitePage.name+ "?");
            if (retVal == true) {
                $scope.loading = true;
                $http.delete("/api/wiki/models/website_pages", {
                    params: { _id: $scope.websitePage._id, name: $scope.websitePage.name },
                }).then(function (response) {
                    $.each($scope.websitePages,function(index,item){
                        if( item._id == $scope.websitePage._id ){
                            $scope.websitePages[index].del = 1;
                        }
                    });
                    $scope.websitePage = {};
                    initTree();
                    openPage();
                    $scope.loading = false;
                }).catch(function (response) {
                    console.log(response.data);
                    $scope.loading = false;
                });
            }
        }
    }

})