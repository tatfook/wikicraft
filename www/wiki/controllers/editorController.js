/**
 * Created by Karlwu on 2016-10-18.
 */

angular.module('MyApp')
.controller('pageCtrl', function ($scope, $rootScope, $http, $uibModalInstance) {

    $scope.websites = {};           //站点列表
    $scope.websitePages =  {};       //页面列表

    $scope.website = {};            //当前选中站点
    $scope.websitePage = {};        //当前选中页面

    $scope.style = {}

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
        //$uibModalInstance.close();
        $uibModalInstance.dismiss('cancel');
    }

    $scope.website_new = function(){
        if( $scope.website.name === undefined ) {
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
            console.log(response.data);

            $rootScope.websitePage = response.data.data;
            $rootScope.website = $scope.website;

            $uibModalInstance.close("new");
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

    //初始化
    function init() {
        // 获取用户站点列表
        $http.post('http://localhost:8099/api/wiki/models/website',{userid:1}).then( function (response) {
            $scope.websites = response.data.data;

            for(var i=0;i< $scope.websites.length;i++){
                website = $scope.websites[i];
                $http.post('http://localhost:8099/api/wiki/models/website_pages',{websiteName:website.name}).then(function (response) {
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

        if($rootScope.website != undefined) $scope.website = $rootScope.website;                    //当前选中站点
        if($rootScope.websitePage != undefined) $scope.websitePage = $rootScope.websitePage;      //当前选中页面
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

                        editor.setValue($scope.websitePage.content);
                        $('#btUrl').val($scope.websitePage.url);
                        break;
                    default:
                        console.log('tag error');
                        break;
                }
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
                        console.log('command:undifined!'+ cmd );
                        break;
                }
            }
        }
        return;
    }

    $scope.cmd_newpage = function () {
        $uibModal.open({
            templateUrl: WIKI_WEBROOT+ "html/newWebsitePage.html",
            controller: "pageCtrl",
        }).result.then(function (provider){
            //console.log(provider);
            if (provider == "new") {
                console.log('cmd_newpage success');
                $scope.websitePages.push($rootScope.websitePage);
                $scope.websitePage = $rootScope.websitePage;
                $scope.website =  $rootScope.website;

                initTree();
                //
                //$websiteNode = $('#treeview').treeview("search",[ $scope.website.name, {exactMatch: true }]);
                //$('#treeview').treeview("addNode", [$websiteNode[0].nodeId, { node:{
                //    text:$scope.websitePage.name,
                //    icon:"fa fa-file-o",
                //    selectedIcon:"fa fa-file-text-o",
                //    tags:["newpage",$scope.websitePage._id,$scope.websitePage.websiteId]
                //}}]);
                //$rootScope.websiteNode = $scope.website;
                //$rootScope.websitePage = response.data;
            }else {
                // $scope.actiontip('创建成功:' + provider + '!', null, "success");
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

        if( $scope.websitePage._id == undefined ){// 新增
            console.log('save temp file');
        }else{  //修改
            $scope.websitePage.content = content;
            $http.put('http://localhost:8099/api/wiki/models/website_pages',$scope.websitePage).then(function (response) {
                //console.log(response.data);
                alert('修改成功');
            }).catch(function (response) {
                console.log(response.data);
            });
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

    //编号
    $scope.cmd_identifier = function () {
        if(editor.somethingSelected()){
            var sel = editor.getSelection();
            var srcStr = '~identifier~' + sel.replace(/\n/g,"\n~identifier~");

            var id = 1;
            var desStr = srcStr.replace("~identifier~",id+'. ');
            while(desStr.indexOf("~identifier~")>=0){
                id++;
                desStr = desStr.replace("~identifier~",id+'. ');
            }

            editor.replaceSelection(desStr);
        }else{
            var cursor = editor.getCursor();
            editor.replaceRange('1. ',CodeMirror.Pos(cursor.line,0),CodeMirror.Pos(cursor.line,0));
        }
        editor.focus();
    }

    //加粗
    $scope.cmd_bold = function () {
        if(editor.somethingSelected()){
            var sel = editor.getSelection();
            var desStr = '**' + sel.replace(/\n/g,"**\n**") + '**';
            editor.replaceSelection(desStr);
        }else{
            var cursor = editor.getCursor();
            var content = editor.getLine(cursor.line);

            editor.replaceRange('**',CodeMirror.Pos(cursor.line,content.length),CodeMirror.Pos(cursor.line,content.length));
            editor.replaceRange('**',CodeMirror.Pos(cursor.line,0),CodeMirror.Pos(cursor.line,0));

            editor.setCursor(CodeMirror.Pos(cursor.line,content.length + 2));
        }
        editor.focus();
    }
    $scope.cmd_console = function () {
        console.log('this is cmd_console');
    }

})