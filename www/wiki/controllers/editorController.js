/**
 * Created by Karlwu on 2016-10-18.
 */

angular.module('MyApp')
.controller('imgCtrl', function ($scope, $rootScope, $uibModalInstance) {
    $scope.img = {url:'',txt:''};

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.img_insert = function(){
        $rootScope.img = $scope.img;
        $uibModalInstance.close("img");
    }
})
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
        //$http.post('http://localhost:8099/api/wiki/models/website_template_style', {_id: $scope.website.styleId}).then(function (response) {
        //    $scope.style = response.data;  // 模板代码style.content
        //})
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
        $scope.websitePage.content = ""; // $scope.style.data[0].content;
		$scope.websitePage.userId = $scope.website.userId

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
.controller('editorController', function  ($scope, $rootScope, $http, $location, $uibModal, Account,ProjectStorageProvider) {

    $scope.websites = [];           //站点列表
    $scope.websitePages = [];       //页面列表

    $scope.website = {};            //当前选中站点
    $scope.websitePage = {};        //当前选中页面

    $scope.githubSource = {};

    $scope.progressbar = {
        show:false,
        percent:0
    };

    function isEmptyObject(obj) {
        for (var key in obj) {
            return false;
        }
        return true;
    }

    //初始化，读取用户站点列表及页面列表
    function init() {
        if(!Account.isAuthenticated()){
            return;
        }

        // 获取用户站点列表
        $http.post('http://localhost:8099/api/wiki/models/website',{userid:Account.getUser()._id}).then( function (response) {
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
                        initGithub();
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

    function progressing(step){
        if(  $scope.progressbar.percent == 0){
            $scope.progressbar.show = true;
        }
        $scope.progressbar.percent = $scope.progressbar.percent + step;
        $(".progress-bar").css("width", $scope.progressbar.percent+"%");
    }

    function githubSha(){
        //console.log('@githubSha');
        $scope.githubSource.repo.getSha('','',function(error, result, request){
            if(!error) {
                githubWS(result);
            }
        });
    }

    //website
    function githubWS(sha){
        var webGithub = 0;
        var webResponse = 0;
        for(var i=0;i< $scope.websites.length;i++) {
            if(sha.length == 0){
                $scope.websites[i].github = false;      //no github
                continue;
            }
            for(var j=0; j<sha.length;j++){
                if(sha[j].type == "dir" && sha[j].name == $scope.websites[i].name){
                    break;      //find website from github by "dir"
                }
            }
            if(j<sha.length){
                $scope.websites[i].github = true;
                webGithub++;
            }else{
                $scope.websites[i].github = false;
            }
        }

        if(webGithub > 0){
            for(var i=0;i< $scope.websites.length;i++) {
                if($scope.websites[i].github){
                    var ws = $scope.websites[i];
                    $scope.githubSource.repo.getSha('',ws.name,function(error, result, request){
                        githubWP(ws,result);
                        webResponse++;
                        if(webResponse >= webGithub){
                            initTree();
                        }
                    });
                }
            }
        }else{
            initTree();
        }
    }

    //页面
    function githubWP(ws,sha){
        //console.log('@debug githubWP');
        //console.log(ws);
        //console.log(sha);

        var wp = {};
        for(var i=0;i< $scope.websitePages.length;i++) {
            wp = $scope.websitePages[i];
            if(ws._id == wp.websiteId || ws.name == wp.websiteName) {
                if(sha.length == 0){
                    $scope.websitePages[i].github = false;
                    continue;
                }
                for (var j = 0; j < sha.length; j++) {
                    if (sha[j].type == "file" && sha[j].name == wp.name) {
                        $scope.websitePages[i].github = true;

                        //file_sha = hex_sha1(wp.content);
                        //console.log('@debug githubWP sha')
                        //console.log(file_sha);
                        //console.log(sha[j].sha);
                        //if ( sha[j].sha == file_sha ){
                        //    $scope.websitePages[i].sha = true;
                        //}else{
                        //    $scope.websitePages[i].sha = false;
                        //}
                        break;
                    }
                }
                if (j < sha.length) {
                    $scope.websitePages[i].github = true;
                } else {
                    $scope.websitePages[i].github = false;
                }
            }
        }
    }

    //初始化github
    function initGithub(){
        var token = {};
        var bGithub = false;

        var user = Account.getUser().data;
        for(var i=0;i<user.length;i++){
            if(user[i].githubId){
                token = user[i].githubToken;
                if(token){
                    bGithub = true;
                    $scope.githubSource = ProjectStorageProvider.getDataSource('github');
                    $scope.githubSource.init(token,function(){
                        githubSha();
                    });
                }
            }
        }

        if(!bGithub){
            initTree();
        }
    }

    //设置全局变量
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

        //console.log('@getTree');
        //console.log($scope.websitePages);

        var ws = {};
        var wp = {};
        var node = '';

        var wsIcon = '';
        var wpIcon = '';
        var wpSelIcon = '';

        var treeData = "[";
        for(var i=0;i< $scope.websites.length;i++) {
            ws = $scope.websites[i];
            //console.log(ws);        //"icon": "glyphicon glyphicon-stop","selectedIcon": "glyphicon glyphicon-stop",
            (ws.github) ? wsIcon = 'fa fa-github-alt' : wsIcon='fa fa-globe';
            treeData += '{"text":"' + ws.name + '","icon":"'+ wsIcon + '","selectable":false,"tags": ["site","' + ws._id +'"],__nodes__},';
            node = '';
            for(var j=0;j<  $scope.websitePages.length;j++){
                wp =  $scope.websitePages[j];
                if(wp.del != undefined && wp.del == 1){
                    continue;
                }
                if(ws._id == wp.websiteId || ws.name == wp.websiteName){
                    (wp.github) ? wpIcon = 'fa fa-github-alt' : wpIcon='fa fa-file-o';
                    (wp.github) ? wpSelIcon = 'fa fa-github' : wpSelIcon='fa fa-pencil-square-o';
                    node += '{"text": "' + wp.name + '","icon":"'+ wpIcon + '",  "selectedIcon": "' + wpSelIcon + '",';
                    //if( wp._id == $scope.websitePage._id ) node += '"state": "{selected:true}",';
                    node += '"tags": ["page","'+ wp._id +'","'+ ws._id +'"]},';
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
        //console.log('@initTree');
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
                    case 'ws':
                        console.lgo('command:ws');
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
        var content = editor.getValue();
        if( ! isEmptyObject($scope.websitePage)){//修改
            $scope.websitePage.content = content;
            $http.put('http://localhost:8099/api/wiki/models/website_pages',$scope.websitePage).then(function (response) {
                //console.log(response.data);
                if(!isEmptyObject($scope.githubSource)){
                    var path = $scope.websitePage.websiteName + '/' + $scope.websitePage.name;
                    $scope.githubSource.repo.writeFile('master', path, $scope.websitePage.content, 'wikicraft commit message', function(error, result, request){
                        if(!error){
                            githubSha();
                        }
                    });

                }else{
                    alert('文件已保存到服务器');
                }
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

    //整行替换
    function line_keyword(char, ch){
        var cursor = editor.getCursor();
        var content = editor.getLine(cursor.line);
        editor.replaceRange(char,CodeMirror.Pos(cursor.line,0),CodeMirror.Pos(cursor.line,content.length));
        if(!ch){
            ch = 0;
        }
        editor.setCursor(CodeMirror.Pos(cursor.line, ch));
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
        editor.replaceRange('---\n',CodeMirror.Pos(cursor.line+1,0),CodeMirror.Pos(cursor.line+1,0));
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
        $uibModal.open({
            templateUrl: WIKI_WEBROOT+ "html/editorInsertImg.html",
            controller: "imgCtrl",
        }).result.then(function (provider){
            console.log(provider);
            if (provider == "img") {
                var img = $rootScope.img;
                var wiki = '';
                if(editor.somethingSelected()){
                    wiki += '!['+editor.getSelection()+']';
                }else{
                    wiki += '![]';
                }
                wiki += '('+img.url+')';
                editor.replaceSelection(wiki);
                editor.focus();
            }
        }, function (text, error) {
            console.log('text:'+text);
            console.log('error:'+error);
            return;
        });
    }

    //图片上传
    $scope.cmd_image_upload = function (fileObj, cb) {
        if(!/image\/\w+/.test(fileObj.type)){
            alert("这不是图片！");
            return false;
        }

        if(isEmptyObject($scope.githubSource)){
            alert('github账号尚未登录，图片无法上传');
        }else{

            var total = fileObj.size;
            var loaded = 0;
            var step = 1024 * 1024;
            var times = 0;
            var blob;

            var fileReader = new FileReader();
            fileReader.onloadstart = function(){
                line_keyword('![](uploading...)', 2);
            };
            fileReader.onprogress = function(){
                line_keyword('![](uploading....)', 2);
            };
            fileReader.onload=function(e){
                //var filename = new Date().getTime() + '.' + fileObj.type.replace('image/','');
                //console.log(filename);
                //console.log(this.result);
                var filename = new Date().getTime();
                $scope.githubSource.uploadImage(filename,fileReader.result,function(error, result, request){
                    line_keyword('![](wikicraft:'+filename+')', 2);
                    if(cb){
                        cb(error, result, request);
                    }
                });
            }
            fileReader.readAsDataURL(fileObj);
        }
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

    //版本
    $scope.cmd_version = function(){
        if (!isEmptyObject($scope.websitePage)) {
            if(!isEmptyObject($scope.githubSource)){
                $scope.githubSource.listCommits('',function(error, result, request){
                    if(!error){
                        console.log(result);
                    }
                });
            }

        }
    }

    $scope.$on('onUserProfile', function (event, user) {
        init();
        command();
    });

    var mdwiki = markdownwiki({ container_name: '.result-html' });
    mdwiki.bindToCodeMirrorEditor(editor);

    /*
     *
     * Configurable variables.
     *
     */
    var hexcase = 0; /* hex output format. 0 - lowercase; 1 - uppercase */
    var chrsz = 8; /* bits per input character. 8 - ASCII; 16 - Unicode */
    /*
     *
     * The main function to calculate message digest
     *
     */
    function hex_sha1(s){
        return binb2hex(core_sha1(AlignSHA1(s)));
    }
    /*
     *
     * Perform a simple self-test to see if the VM is working
     *
     */
    function sha1_vm_test(){
        return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
    }
    /*
     *
     * Calculate the SHA-1 of an array of big-endian words, and a bit length
     *
     */
    function core_sha1(blockArray){
        var x = blockArray; // append padding
        var w = Array(80);
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        var e = -1009589776;
        for (var i = 0; i < x.length; i += 16) // 每次处理512位 16*32
        {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            var olde = e;
            for (var j = 0; j < 80; j++) // 对每个512位进行80步操作
            {
                if (j < 16)
                    w[j] = x[i + j];
                else
                    w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
                e = d;
                d = c;
                c = rol(b, 30);
                b = a;
                a = t;
            }
            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
            e = safe_add(e, olde);
        }
        return new Array(a, b, c, d, e);
    }
    /*
     *
     * Perform the appropriate triplet combination function for the current
     * iteration
     *
     * 返回对应F函数的值
     *
     */
    function sha1_ft(t, b, c, d){
        if (t < 20)
            return (b & c) | ((~ b) & d);
        if (t < 40)
            return b ^ c ^ d;
        if (t < 60)
            return (b & c) | (b & d) | (c & d);
        return b ^ c ^ d; // t<80
    }
    /*
     *
     * Determine the appropriate additive constant for the current iteration
     *
     * 返回对应的Kt值
     *
     */
    function sha1_kt(t){
        return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514;
    }
    /*
     *
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     *
     * to work around bugs in some JS interpreters.
     *
     * 将32位数拆成高16位和低16位分别进行相加，从而实现 MOD 2^32 的加法
     *
     */
    function safe_add(x, y){
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }
    /*
     *
     * Bitwise rotate a 32-bit number to the left.
     *
     * 32位二进制数循环左移
     *
     */
    function rol(num, cnt){
        return (num << cnt) | (num >>> (32 - cnt));
    }
    /*
     *
     * The standard SHA1 needs the input string to fit into a block
     *
     * This function align the input string to meet the requirement
     *
     */
    function AlignSHA1(str){
        var nblk = ((str.length + 8) >> 6) + 1, blks = new Array(nblk * 16);
        for (var i = 0; i < nblk * 16; i++)
            blks[i] = 0;
        for (i = 0; i < str.length; i++)
            blks[i >> 2] |= str.charCodeAt(i) << (24 - (i & 3) * 8);
        blks[i >> 2] |= 0x80 << (24 - (i & 3) * 8);
        blks[nblk * 16 - 1] = str.length * 8;
        return blks;
    }
    /*
     *
     * Convert an array of big-endian words to a hex string.
     *
     */
    function binb2hex(binarray){
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
                hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
        }
        return str;
    }
})
