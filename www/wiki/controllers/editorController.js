/**
 * Created by Karlwu on 2016-10-18.
 */

angular.module('MyApp')
.controller('editorController', function  ($scope, $http, $uibModal, $location) {
    $scope.websites = [];           //站点列表
    $scope.website = {};            //当前选中站点
    $scope.websitePages = [];       //页面列表
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

        //// 获取网站所有页面
        //$http.post('http://localhost:8099/api/wiki/models/website_pages',{websiteName:website.name}).then(function (response) {
        //    $scope.websitePages = response.data.data;
        //    console.log($scope.websitePages);
        //}).catch(function (response) {
        //    console.log(response.data);
        //});

        // 获取网站模板样式  页面内容嵌套在模板内部 编辑不需模板吧？？ 预览时你也可以获取自行嵌套
        /*
         $http.post('http://localhost:8099/api/wiki/models/website_template_style', {_id:website.styleId}).then(function (response) {
         $scope.style = response.data;  // 模板代码style.content
         })
         */
    }

    //初始化目录树
    function initTree(){
        var ws;
        var wp;
        var node;

        //console.log( 'initTree' );
        //console.log( $scope.websites);
        //console.log( $scope.websitePages);

        var treeData = "[";
        for(var i=0;i< $scope.websites.length;i++) {
            ws = $scope.websites[i];
            //console.log(ws);        //"icon": "glyphicon glyphicon-stop","selectedIcon": "glyphicon glyphicon-stop",
            treeData += '{"text":"' + ws.name + '","tags": ["site","' +i+'"],__nodes__},';
            node = '';
            for(var j=0;j<  $scope.websitePages.length;j++){
                wp =  $scope.websitePages[j];
                //console.log(wp);
                if(ws.name == wp.websiteName){
                    node += '{"text": "' + wp.name + '","tags": ["page","'+j+'"]},';
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

        $('#treeview').treeview({
            color: "#428bca",
            showBorder: false,
            data:  $.parseJSON(treeData),
            onNodeSelected: function(event, data) {
                var tags = data.tags;

                switch(tags[0]){
                    case 'site':
                        $scope.website =  $scope.websites[tags[1]];
                        //console.log($scope.website);
                        break;
                    case 'page':
                        $scope.websitePage = $scope.websitePages[tags[1]];
                        editor.setValue($scope.websitePage.content);
                        $('#websiteUrl').empty();
                        $('#websiteUrl').append($scope.websitePage.url);
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

    $scope.login = function () {
        $uibModal.open({
            templateUrl: WIKI_WEBROOT+ "auth/login.html",
            controller: "ModalLoginCtrl",
        }).result.then(function (provider) {
            if (provider == "login") {
                $scope.register();
            }
            else {
                // $scope.actiontip('登录成功:' + provider + '!', null, "success");
            }
        }, function (text, error) {
            if (error && error.error) {
                // Popup error - invalid redirect_uri, pressed cancel button, etc.
                $scope.actiontip(error.error, -1, "error");
            } else if (error && error.data) {
                // HTTP response error from server
                $scope.actiontip(error.data.message || "some error!", -1, "error");
            }
            else
                $scope.actiontip("登录失败了, 请重新尝试", 5, "error");
        });
    };

    //保存页面
    $scope.cmd_savepage = function () {

        //var el = document.getElementById("editor");
        //var content = el.env.editor.getValue();
        var content = editor.getValue();

        if($scope.websitePage){// 修改
            $scope.websitePage.content = content;
            $http.put('http://localhost:8099/api/wiki/models/website_pages',$scope.websitePage).then(function (response) {
                //console.log(response.data);
                alert('修改成功');
            }).catch(function (response) {
                console.log(response.data);
            });
        }else{// 新增
            $scope.actiontip('this is a tips', -1, "error");
            return;

            $http.put('http://localhost:8099/api/wiki/models/website_pages/new',$scope.websitePage).then(function (response) {
                console.log(response.data);
                alert('保存成功');
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
    }

})