/**
 * Created by wuxiangan on 2017/1/10.
 */

define([
    'app',
    'codemirror',
    'helper/markdownwiki',
    'helper/util',
    'helper/storage',
    'helper/dataSource',
    'text!html/wikiEditor.html',
    'codemirror/mode/markdown/markdown',
    // 代码折叠
    'codemirror/addon/fold/foldgutter',
    'codemirror/addon/fold/foldcode',
    'codemirror/addon/fold/markdown-fold',
    'codemirror/addon/fold/xml-fold',
    // 错误提示
    'codemirror/addon/lint/json-lint',
    'codemirror/addon/search/search',
    'codemirror/addon/dialog/dialog',
    'codemirror/addon/edit/continuelist',
    'codemirror/addon/search/searchcursor',
    'codemirror/addon/search/matchesonscrollbar',
    'codemirror/addon/search/jump-to-line',
    'codemirror/addon/scroll/annotatescrollbar',
    'codemirror/addon/display/fullscreen',
    'bootstrap-treeview',
], function (app, CodeMirror, markdownwiki, util, storage, dataSource, htmlContent) {
    var winWidth = $(window).width();
    //console.log("wiki editor controller!!!");
    var editor;
    var mdwiki;
    var allWebsites = [];
    var allWebsitePages = [];
    var currentWebsite = undefined; // $scope.website, $scope.websitePage 两变量使用怪异，估计存在备份机制， 这里用全局变量变量奇怪问题
    var currentWebsitePage = undefined;
    var editorDocMap = {};


    function getTreeData(username, websitePages, isDir) {
        var pageList = websitePages || [];
        var pageTree = {url: '/' + username, children: {}};
        var treeData = [];
        for (var i = 0; i < pageList.length; i++) {
            var page = pageList[i];
            if (page.isDelete) {
                continue;
            }

            var url = page.url;
            url = url.trim();
            var paths = page.url.split('/');
            var treeNode = pageTree;
            var length = isDir ? paths.length - 1 : paths.length;
            for (var j = 2; j < length; j++) {
                var path = paths[j];
                if (!path) {
                    continue;
                }
                subTreeNode = treeNode.children[path] || {
                        name: path,
                        children: {},
                        url: treeNode.url + '/' + path,
                        siteId: page.websiteId,
                        siteName: page.websiteName,
                        pageId: page._id
                    };

                treeNode.children[paths[j]] = subTreeNode;
                treeNode.isLeaf = false;
                if (j == paths.length - 1) {
                    subTreeNode.isLeaf = true;
                    subTreeNode.sha = page.sha;
                    //subTreeNode.content = page.content;
                    if (!isDir && page.isModify) {
                        subTreeNode.isEditor = true;
                    }
                }
                treeNode = subTreeNode;
            }
        }
        // 加上所有站点
        for (var i = 0; i < allWebsites.length; i++) {
            var isExist = false;
            var site = allWebsites[i];
            for (key in pageTree.children) {
                if (key == site.name){
                    isExist = true;
                    break;
                }
            }
            if (isExist)
                continue;

            pageTree.children[site.name] = {
                name: site.name,
                children: {},
                url: '/' + site.username + '/' + site.name,
                siteId: site._id,
                siteName: site.name,
                pageId: -1,
            }
        }
        //console.log(pageTree.children);

        var treeDataFn = function (treeNode, pageNode) {
            treeNode = treeNode || {};
            treeNode.text = (pageNode.isLeaf && pageNode.isEditor) ? (pageNode.name + '*') : pageNode.name;
            //treeNode.icon = (pageNode.isLeaf && pageNode.sha) ? 'fa fa-github-alt' : 'fa fa-file-o';
            treeNode.icon = (pageNode.isLeaf && pageNode.isEditor) ? 'fa fa-edit' : 'fa fa-file-o';
            treeNode.pageNode = pageNode;
            treeNode.tags = [pageNode.url];
            treeNode.state = {selected: currentWebsitePage && currentWebsitePage.url == pageNode.url};

            if (pageNode.isLeaf) {
                treeNode.selectedIcon = (pageNode.isLeaf && pageNode.sha) ? 'fa fa-github' : 'fa fa-file-o';
            }
            if (!pageNode.isLeaf) {
                treeNode.nodes = [];
                for (key in pageNode.children) {
                    treeNode.nodes.push(treeDataFn(undefined, pageNode.children[key]));
                }
            }

            return treeNode;
        };

        for (key in pageTree.children) {
            treeData.push(treeDataFn(undefined, pageTree.children[key]));
        }

        for (var i = 0; i < treeData.length; i++) {
            treeData[i].icon = 'fa fa-globe';
        }
        //console.log(treeData);
        return treeData;
    }


    app.registerController('imgCtrl', ['$scope', '$rootScope', '$uibModalInstance', 'github', function ($scope, $rootScope, $uibModalInstance, github) {
        $scope.img = {url: '', txt: '', file: '', dat: '', nam: ''};

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

        $scope.img_insert = function () {
            $rootScope.img = $scope.img;
            $uibModalInstance.close("img");
        }

        $scope.imageLocal = function () {
            $('#uploadImageId').change(function (e) {
                var fileReader = new FileReader();
                fileReader.onload = function () {
                    //$scope.dataSource && $scope.dataSource.uploadImage(undefined, fileReader.result, function (url) {
                    github.isInited() && github.uploadImage(undefined, fileReader.result, function (url) {
                        $scope.img.url = url;
                    });
                };
                fileReader.readAsDataURL(e.target.files[0]);
            });
        }
    }]);
    app.registerController('linkCtrl', ['$scope', '$rootScope', '$uibModalInstance', function ($scope, $rootScope, $uibModalInstance) {
        $scope.link = {url: '', txt: ''};

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

        $scope.link_insert = function () {
            $rootScope.link = {url: $scope.selected.url, txt: ''};
            $uibModalInstance.close("link");
        }

        var itemArray = [];
        var websites = allWebsitePages || [];
        for (var i = 0; i < websites.length; i++) {
            itemArray.push({id: i, url: websites[i].url});
        }
        $scope.itemArray = itemArray;
        $scope.selected = $scope.itemArray[0];

        $scope.selected.getBindField = function () {
            return 'url';
        }

    }]);
    app.registerController('tableCtrl', ['$scope', '$rootScope', '$uibModalInstance', function ($scope, $rootScope, $uibModalInstance) {
        $scope.table = {rows: 2, cols: 2, alignment: 0};

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

        $scope.table_insert = function () {
            $rootScope.table = $scope.table;
            $uibModalInstance.close("table");
        }
    }]);
    app.registerController('pageCtrl', ['$scope', '$rootScope', '$http', '$uibModalInstance', function ($scope, $rootScope, $http, $uibModalInstance) {
        $scope.websites = {};            //站点列表
        $scope.websitePages = {};       //页面列表
        $scope.website = {};             //当前选中站点
        $scope.websitePage = {};        //当前选中页面
        $scope.errInfo = "";             // 错误提示
        var treeNode = undefined;       // 目录节点

        $scope.$watch('$viewContentLoaded', init);
        //初始化目录树  data:  $.parseJSON(getTree()),
        function initTree() {
            //console.log('@initTree');
            $('#newPageTreeId').treeview({
                color: "#428bca",
                showBorder: false,
                enableLinks: false,
                data: getTreeData($scope.user.username, $scope.websitePages, true),
                onNodeSelected: function (event, data) {
                    //console.log(data);
                    treeNode = data.pageNode;
                }
            });
            var selectableNodes = $('#newPageTreeId').treeview('search', [currentWebsite.name, {
                ignoreCase: true,
                exactMatch: false,
                revealResults: true,  // reveal matching nodes
            }]);

            $.each(selectableNodes, function (index, item) {
                if (item.pageNode.url == ('/' + currentWebsite.username + '/' + currentWebsite.name)) {
                    $('#newPageTreeId').treeview('selectNode', [item, {silent: false}]);
                    treeNode = item.pageNode;
                }
            });
            $('#newPageTreeId').treeview('clearSearch');
        }

        //初始化
        function init() {
            $scope.websites = allWebsites;           //站点列表
            $scope.websitePages = allWebsitePages;       //页面列表

            initTree();
        }

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

        $scope.website_new = function () {
            if (!treeNode) {
                $scope.errInfo = '请选择站点';
                return false;
            }

            if ($scope.websitePage.name === undefined || $scope.websitePage.name.length == 0) {
                $scope.errInfo = '请填写页面名';
                return false;
            }

            if ($scope.websitePage.name.indexOf('.') >= 0) {
                $scope.errInfo = '页面名包含非法字符(.)';
                return false;
            }
            for (var i = 0; i < $scope.websites.length; i++) {
                if (treeNode.siteId == $scope.websites[i]._id) {
                    $scope.website = $scope.websites[i];
                }
            }
            console.log($scope.website);
            $scope.websitePage.url = treeNode.url + '/' + $scope.websitePage.name;
            $scope.websitePage.websiteName = $scope.website.name;
            $scope.websitePage.websiteId = $scope.website._id;
            $scope.websitePage.content = ""; // $scope.style.data[0].content;
            $scope.websitePage.userId = $scope.website.userId;
            console.log($scope.websitePage);
            for (var i = 0; i < $scope.websitePages.length; i++) {
                var url1 = $scope.websitePages[i].url + '/';
                var url2 = $scope.websitePage.url + '/';
                if (!$scope.websitePages[i].isDelete && (url1.indexOf(url2) == 0 || url2.indexOf(url1) == 0)) {
                    $scope.errInfo = '页面名已存在';
                    return false;
                }
            }

            $http.put(config.apiUrlPrefix + 'website_pages/new', $scope.websitePage).then(function (response) {
                currentWebsitePage = response.data.data;
                currentWebsite = $scope.website;

                $uibModalInstance.close("page");
            }).catch(function (response) {
                console.log(response.data);
                alert('新建页面失败');
            });
        }

    }]);

    app.registerController('wikiEditorController', ['$scope', '$rootScope', '$location', '$http', '$location', '$uibModal', 'Account', 'github', 'Message', 'modal','gitlab',
        function ($scope, $rootScope, $location, $http, $location, $uibModal, Account, github, Message, modal) {
            console.log("wikiEditorController");
            $rootScope.frameFooterExist = false;
            $rootScope.userinfo = $rootScope.user;
            $scope.isGithubAuth = $scope.user.githubDS && github.isInited();

            $scope.progressbar = {
                show: false,
                percent: 0
            };

            function isEmptyObject(obj) {
                for (var key in obj) {
                    return false;
                }
                return true;
            }

            $scope.$on('onDataSource', function (event, data) {
                console.log("onDataSource change!!!");
                $scope.isGithubAuth = $scope.user.githubDS && github.isInited();
            });

            function newWebsitePage(urlObj) {
                //console.log("---------newWebsitePage-------------");
                if (!urlObj || urlObj.username != $scope.user.username || !urlObj.sitename)
                    return;

                var site = undefined;
                for (var i =0; i < allWebsites.length; i++) {
                    if (urlObj.sitename == allWebsites[i].name) {
                        site = allWebsites[i];
                        break;
                    }
                }

                if (!site)
                    return;

                var websitePage = {};
                websitePage.url = '/'+ site.username + '/' + site.name + '/' + urlObj.pagename;
                websitePage.websiteName = site.name;
                websitePage.websiteId = site._id;
                websitePage.content = ""; // $scope.style.data[0].content;
                websitePage.userId = site.userId;
                websitePage.name = urlObj.pagename;

                $http.put(config.apiUrlPrefix + 'website_pages/new', websitePage).then(function (response) {
                    currentWebsitePage = response.data.data;
                    currentWebsite = $scope.website;
                    allWebsitePages.push(currentWebsitePage);
                    initTree();
                    openPage();
                }).catch(function (response) {
                    console.log(response.data);
                });
            }

            // 加载未提交到服务的页面
            function loadUnSavePage() {
                storage.indexedDBGet(function (page) {
                    var serverPage = getWebsitePage(page._id);
                    if (!serverPage) {
                        storage.indexedDBDeleteItem(page.url);
                        return;
                    }
                    var localTimestamp = page.timestamp || 0;
                    var serverTimestamp = serverPage.timestamp || 0; //(new Date()).getTime();
                    //console.log(page.url, serverPage, localTimestamp);
                    if (localTimestamp > serverTimestamp && page.content != serverPage.content) {
                        serverPage.isModify = true;
                        serverPage.content = page.content;
                        serverPage.timestamp = localTimestamp;
                    }
                }, undefined, function () {
                    initTree();
                });
            }

            //初始化，读取用户站点列表及页面列表
            function init() {
                if (!Account.ensureAuthenticated()) {
                    return;
                }
                $(".result-html").css("width", winWidth + "px");
                initEditor();

                var user = $scope.user;
                // console.log(config.apiUrlPrefix);
                // 获取用户站点列表
                $http.post(config.apiUrlPrefix + 'website/getAllByUserId', {userId: Account.getUser()._id}).then(function (response) {
                    allWebsites = response.data.data;
                    util.http('POST', config.apiUrlPrefix + 'website_pages/getByUserId', {userId: Account.getUser()._id}, function (data) {
                        allWebsitePages = data || [];
                        //console.log(currentWebsitePage);
                        storage.indexedDBOpen({storeName: 'websitePage', storeKey: 'url'}, function () {
                            loadUnSavePage();
                            initTree();
                            openPage();
                        });
                    });
                }).catch(function (response) {
                    console.log(response.data);
                });

                return;
            }

            $scope.$watch('$viewContentLoaded', init);
            //init();

            function progressing(step) {
                if ($scope.progressbar.percent == 0) {
                    $scope.progressbar.show = true;
                }
                $scope.progressbar.percent = $scope.progressbar.percent + step;
                $(".progress-bar").css("width", $scope.progressbar.percent + "%");
            }

            function getWebsite(id) {
                for (var i = 0; i < allWebsites.length; i++) {
                    ws = allWebsites[i];
                    if (ws._id == id) {
                        return ws;
                    }
                }
                return null;
            }

            function getWebsitePage(id) {
                for (var j = 0; j < allWebsitePages.length; j++) {
                    wp = allWebsitePages[j];
                    if (wp._id == id) {
                        return wp;
                    }
                }
                return null;
            }

            function setDataSource() {
                //console.log($scope.user.githubDS);
                //console.log($scope.website.githubRepoName);
                if (!currentWebsite)
                    return;
                $scope.dataSource = dataSource.getDataSource();
                return
                if (!$scope.user.githubDS && !currentWebsite.githubRepoName) {
                    $scope.dataSource = undefined;
                } else {
                    $scope.dataSource = dataSource.getDataSource();
                    var githubDS = $scope.dataSource.getSingleDataSource('github');
                    if (currentWebsite.githubRepoName && githubDS) {
                        $scope.dataSource.getSingleDataSource('github').setDefaultRepo(currentWebsite.githubRepoName);
                    }
                }
            }
            
            $scope.$on("changeEditorPage", function (event, urlObj) {
                renderAutoSave(function() {
                    openUrlPage(urlObj);
                }, function () {
                    openUrlPage(urlObj);
                });
            });
            function openUrlPage(urlObj) {
                urlObj = urlObj || storage.sessionStorageGetItem('urlObj');
                //storage.sessionStorageRemoveItem('urlObj');
                //console.log(urlObj);

                var url = '/' + $scope.user.username + '/' + $scope.user.username + '/index'; // 默认编辑个人网站首页
                // 必须是自己编辑自己页面
                if (urlObj && urlObj.username == $scope.user.username) {
                    url = '/' + urlObj.username + '/' + urlObj.sitename + '/' + (urlObj.pagename || 'index');
                }
                //console.log(url);
                currentWebsite = undefined;
                currentWebsitePage = undefined;
                for (var i = 0; i < allWebsitePages.length; i++) {
                    if (url == allWebsitePages[i].url) {
                        currentWebsite = getWebsite(allWebsitePages[i].websiteId);
                        currentWebsitePage = allWebsitePages[i];
                        break;
                    }
                }

                if (!currentWebsitePage) {
                    newWebsitePage(urlObj);
                } else {
                    openPage();
                }
            }
            function openPage(isNodeSelected) {
                //console.log(currentWebsitePage);
                if (!currentWebsitePage) {
                    openUrlPage();
                    return;
                }
                // 设置全局用户页信息和站点信息
                $rootScope.siteinfo = currentWebsite;
                $rootScope.pageinfo = currentWebsitePage;
                // 保存正在编辑的页面urlObj
                var urlPrefix = '/' + currentWebsite.username + '/' + currentWebsite.name + '/';
                storage.sessionStorageSetItem('urlObj',{username:currentWebsite.username, sitename:currentWebsite.name, pagename:currentWebsitePage.url.substring(urlPrefix.length)});
                !config.islocalWinEnv() && $location.path(currentWebsitePage.url);
                //window.location.href = window.location.pathname + '#' + currentWebsitePage.url;

                if (isEmptyObject(currentWebsitePage)) {
                    editor.setValue('');
                    $('#btUrl').val('');
                    $('.toolbar-page-remove').attr("disabled", true);
                    return;
                }

                setDataSource();

                function setEditorValue() {
                    currentWebsitePage.isFirstEditor = true;

                    if (!editorDocMap[currentWebsitePage.url]) {
                        editorDocMap[currentWebsitePage.url] = CodeMirror.Doc(currentWebsitePage.content)
                    }
                    editor.swapDoc(editorDocMap[currentWebsitePage.url]);
                    editor.setValue(currentWebsitePage.content);
                    //util.html('.result-html', mdwiki.render(editor.getValue()), $scope);
                    //console.log(mdwiki.options);
                    //mdwiki.options.renderCallback && mdwiki.options.renderCallback();

                    // 折叠wiki命令
                    for (var i = editor.firstLine(), e = editor.lastLine(); i <= e; i++) {
                        var lineValue = editor.getLine(i);
                        if (lineValue.indexOf('```@') == 0 || lineValue.indexOf('```/') == 0) {
                            editor.foldCode(CodeMirror.Pos(i, 0), null, "fold");
                        }
                    }
                    //CodeMirror.commands.foldAll(editor);

                    $('#btUrl').val(window.location.origin + currentWebsitePage.url);
                    $('.toolbar-page-remove').attr("disabled", false);

                    if (isNodeSelected) {
                        return;
                    }

                    var selectableNodes = $('#treeview').treeview('search', [currentWebsitePage.name, {
                        ignoreCase: true,
                        exactMatch: false,
                        revealResults: true,  // reveal matching nodes
                    }]);

                    $.each(selectableNodes, function (index, item) {
                        if (item.tags[0] == currentWebsitePage.url) {
                            $('#treeview').treeview('selectNode', [item, {silent: true}]);
                        }
                    });

                    $('#treeview').treeview('clearSearch');
                }

                storage.indexedDBGetItem(currentWebsitePage.url, function (page) {
                    //console.log(page);
                    //console.log(currentWebsitePage);
                    if (page) {
                        page.timestamp = page.timestamp || 0;
                        currentWebsitePage.timestamp = currentWebsitePage.timestamp || 0; // (new Date()).getTime();
                        if (page.timestamp > currentWebsitePage.timestamp &&  currentWebsitePage.content != page.content) {
                            console.log("---------------histroy modify---------------");
                            currentWebsitePage.content = page.content;
                            currentWebsitePage.isModify = true;
                            initTree();
                        }
                    }
                    setEditorValue();
                }, function () {
                    setEditorValue();
                });

            }

            //初始化目录树  data:  $.parseJSON(getTree()),
            function initTree() {
                //console.log('@initTree');
                $('#treeview').treeview({
                    color: "#428bca",
                    showBorder: false,
                    enableLinks: false,
                    levels: 4,
                    data: getTreeData($scope.user.username, allWebsitePages, false),
                    onNodeSelected: function (event, data) {
                        //console.log(data.pageNode);
                        autoSave(function () {
                            if (data.pageNode.isLeaf) {
                                currentWebsite = getWebsite(data.pageNode.siteId);
                                currentWebsitePage = getWebsitePage(data.pageNode.pageId);
                                //console.log(currentWebsitePage);
                                openPage();
                            }
                            editor.focus();
                        }, function () {
                            Message.warning("自动保存失败");
                            openPage();
                        });
                    }
                });
            }

            //命令处理函数
            function command() {
                var strCmd = $location.$$path;
                var arrCmd = strCmd.split('_');
                var cmd = '';
                for (var i = 0; i < arrCmd.length; i++) {
                    cmd = arrCmd[i];
                    if (cmd.substr(0, 1) == '&') {
                        switch (cmd.substring(1)) {
                            case 'new':
                                console.log('command:new');
                                break;
                            case 'ws':
                                console.log('command:ws');
                                break;
                            default:
                                console.log('command:undefined!' + cmd);
                                break;
                        }
                    }
                }
                return;
            }

            $scope.openWikiBlock = function () {
                function formatWikiCmd(text) {
                    var lines = text.split('\n');
                    var startPos = undefined, endPos = undefined;
                    for (var i = 0; i < lines.length; i++) {
                        lines[i] = lines[i].replace(/^[\s]*/, '');
                        if (lines[i].indexOf('```') == 0) {
                            if (startPos == undefined) {
                                startPos = i;
                            } else {
                                endPos = i;
                            }
                        }
                    }
                    if (startPos == undefined || endPos == undefined)
                        return text;

                    var paramLines = lines.slice(startPos + 1, endPos);
                    try {
                        //console.log(paramLines);
                        var paramsText = paramLines.join('\n');
                        var newText = lines.slice(0, startPos + 1).join('\n') + '\n' + lines.slice(endPos).join('\n');
                        if (paramsText) {
                            var paramObj = angular.fromJson(paramsText);
                            paramsText = angular.toJson(paramObj, 4);
                            newText = lines.slice(0, startPos + 1).join('\n') + '\n' + paramsText + '\n' + lines.slice(endPos).join('\n');
                        }
                        return newText;
                    } catch (e) {
                        console.log(e);
                        return lines.slice(0, startPos + 1).join('\n') + '\n' + lines.slice(endPos).join('\n');
                    }
                }
                //console.log('openWikiBlock');
                modal('controller/wikiBlockController', {
                    controller: 'wikiBlockController',
                    size: 'lg'
                }, function (wikiBlock) {
                    //console.log(result);
                    var wikiBlockContent = formatWikiCmd(wikiBlock.content);
                    var cursor = editor.getCursor();
                    var content = editor.getLine(cursor.line);
                    console.log(content);
                    if (content.length > 0) {
                        wikiBlockContent = '\n' + wikiBlockContent;
                    }
                    editor.replaceSelection(wikiBlockContent);
                }, function (result) {
                    console.log(result);
                });
            }

            $scope.openGithubFile = function () {
                if (!currentWebsitePage || !currentWebsitePage.url) {
                    return;
                }
                var gitUrl = github.getContentUrl({path: currentWebsitePage.url.substring(1)});
                window.open(gitUrl);
            }

            $scope.cmd_newpage = function () {
                function openNewPage() {
                    $uibModal.open({
                        //templateUrl: WIKI_WEBROOT+ "html/editorNewPage.html",   // WIKI_WEBROOT 为后端变量前端不能用
                        templateUrl: config.htmlPath + "editorNewPage.html",
                        controller: "pageCtrl",
                    }).result.then(function (provider) {
                        //console.log(provider);
                        if (provider == "page") {
                            allWebsitePages.push(currentWebsitePage);
                            initTree();
                            openPage(false);

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
                        console.log('text:' + text);
                        console.log('error:' + error);
                        return;
                    });
                }
                autoSave(function () {
                    //Message.warning("自动保存成功");
                    openNewPage();
                }, function () {
                    Message.warning("自动保存失败");
                    openNewPage();
                });

            }

            //保存页面
            $scope.cmd_savepage = function () {
                var content = editor.getValue();
                if (!isEmptyObject(currentWebsitePage)) {//修改
                    currentWebsitePage.content = content;
                    currentWebsitePage.timestamp = (new Date()).getTime();
                    var savePage = angular.copy(currentWebsitePage);
                    savePage.isModify = undefined;
                    $http.put(config.apiUrlPrefix + 'website_pages', savePage).then(function (response) {
                        currentWebsitePage.isModify = undefined;
                        //console.log("delete storage " + currentWebsitePage.url);
                        storage.indexedDBDeleteItem(currentWebsitePage.url);
                        Message.info("文件已保存到服务器");
                        //console.log($scope.dataSource);
                        if ($scope.dataSource) {
                            var path = currentWebsitePage.url;
                            path = path.substring(1);
                            $scope.dataSource.writeFile({
                                path: path,
                                content: currentWebsitePage.content,
                                message: 'wikicraft save file: ' + path
                            }, function (result) {
                                //alert('文件已保存到服务器及Github');
                                Message.info("文件已保存到服务器及Github");
                            });
                        }
                        initTree();
                    }).catch(function (response) {
                        console.log(response.data);
                        storage.indexedDBSetItem(currentWebsitePage);
                    });
                } else {// 新增
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
                editor.execCommand("find");
                CodeMirror.commands.find(editor);
            }

            //替换
            $scope.cmd_replace = function () {
                editor.execCommand("replace");
                CodeMirror.commands.replace(editor);
            }

            //标题    H1：Hn
            $scope.cmd_headline = function (level) {
                var preChar = '';
                while (level > 0) {
                    preChar += '#';
                    level--;
                }
                preChar += ' ';

                var cursor = editor.getCursor();
                var content = editor.getLine(cursor.line);

                var iSpace = 0;
                var chrCmp = '';
                for (var i = 0; i < content.length; i++) {
                    chrCmp = content.substr(i, 1);
                    if (chrCmp == '#') {
                        continue;
                    } else {
                        if (chrCmp == ' ') {
                            iSpace = i + 1;
                        }
                        break;
                    }
                }
                editor.replaceRange(preChar, CodeMirror.Pos(cursor.line, 0), CodeMirror.Pos(cursor.line, iSpace));
                return;
            }

            function font_style(char) {
                if (editor.somethingSelected()) {
                    var sel = editor.getSelection();
                    var desStr = char + sel.replace(/\n/g, char + "\n" + char) + char;
                    editor.replaceSelection(desStr);
                } else {
                    var cursor = editor.getCursor();
                    var content = editor.getLine(cursor.line);

                    editor.replaceRange(char, CodeMirror.Pos(cursor.line, content.length), CodeMirror.Pos(cursor.line, content.length));
                    editor.replaceRange(char, CodeMirror.Pos(cursor.line, 0), CodeMirror.Pos(cursor.line, 0));

                    editor.setCursor(CodeMirror.Pos(cursor.line, content.length + char.length));
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
                if (editor.somethingSelected()) {
                    var sel = editor.getSelection();
                    var srcStr = '~ol~' + sel.replace(/\n/g, "\n~ol~");

                    var id = 1;
                    var desStr = srcStr.replace("~ol~", id + '. ');
                    while (desStr.indexOf("~ol~") >= 0) {
                        id++;
                        desStr = desStr.replace("~ol~", id + '. ');
                    }

                    editor.replaceSelection(desStr);
                } else {
                    var cursor = editor.getCursor();
                    editor.replaceRange('1. ', CodeMirror.Pos(cursor.line, 0), CodeMirror.Pos(cursor.line, 0));
                }
                editor.focus();
            }

            //行首关键字
            function hol_keyword(char) {
                if (editor.somethingSelected()) {
                    var sel = editor.getSelection();
                    var desStr = char + sel.replace(/\n/g, "\n" + char);
                    editor.replaceSelection(desStr);
                } else {
                    var cursor = editor.getCursor();
                    editor.replaceRange(char, CodeMirror.Pos(cursor.line, 0), CodeMirror.Pos(cursor.line, 0));
                }
                editor.focus();
            }

            //整行替换
            function line_keyword(lineNo, char, ch) {
                var content = editor.getLine(lineNo);
                editor.replaceRange(char, CodeMirror.Pos(lineNo, 0), CodeMirror.Pos(lineNo, content.length));
                if (!ch) {
                    ch = 0;
                }
                editor.setCursor(CodeMirror.Pos(lineNo, ch));
                editor.focus();
            }

            //无序列表
            $scope.cmd_listul = function () {
                hol_keyword('- ');
            }

            //引用内容
            $scope.cmd_blockqote = function () {
                hol_keyword('> ');
            }

            //表格
            $scope.cmd_tabel = function () {
                $uibModal.open({
                    templateUrl: config.htmlPath + "editorInsertTable.html",
                    controller: "tableCtrl",
                }).result.then(function (provider) {
                    //console.log(provider);
                    if (provider == "table") {
                        var table = $rootScope.table;
                        //console.log(table);
                        //| 0:0 | 1:0 |
                        //| -- | -- |
                        //| 0:2 | 1:2 |
                        var wiki = '';
                        for (var i = 0; i < table.rows; i++) {
                            wiki += '\n';
                            if (i == 1) {
                                for (var j = 0; j < table.cols; j++) {
                                    switch (table.alignment) {
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

                            for (var j = 0; j < table.cols; j++) {
                                wiki += '| ' + j + ':' + i + ' ';
                            }
                            wiki += '|';
                        }
                        wiki += '\n';

                        var cursor = editor.getCursor();
                        var content = editor.getLine(cursor.line);
                        if (content.length > 0) {
                            wiki += '\n';
                        }

                        editor.replaceRange(wiki, CodeMirror.Pos(cursor.line + 1, 0), CodeMirror.Pos(cursor.line + 1, 0));
                        editor.setCursor(CodeMirror.Pos(cursor.line + 1, 0));
                        editor.focus();
                    }
                }, function (text, error) {
                    console.log('text:' + text);
                    console.log('error:' + error);
                    return;
                });
            }

            //水平分割线
            $scope.cmd_horizontal = function () {
                var cursor = editor.getCursor();
                editor.replaceRange('---\n', CodeMirror.Pos(cursor.line + 1, 0), CodeMirror.Pos(cursor.line + 1, 0));
                editor.setCursor(CodeMirror.Pos(cursor.line + 1, 3));
                editor.focus();
            }

            //链接
            $scope.cmd_link = function () {
                $uibModal.open({
                    templateUrl: config.htmlPath + "editorInsertLink.html",
                    controller: "linkCtrl",
                }).result.then(function (provider) {
                    if (provider == "link") {
                        var link = $rootScope.link;
                        var wiki = '';
                        if (editor.somethingSelected()) {
                            wiki += '[' + editor.getSelection() + ']';
                        } else {
                            wiki += '[]';
                        }
                        // wiki += '(' + link.url + ')';
                        editor.replaceSelection(wiki + '(' + link.url + ')');
                        if (wiki == '[]') {
                            editor.setCursor(CodeMirror.Pos(editor.getCursor().line, 1));
                        }
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
                    console.log('text:' + text);
                    console.log('error:' + error);
                    return;
                });
            }

            //图片
            $scope.cmd_image = function () {
                $uibModal.open({
                    templateUrl: config.htmlPath + "editorInsertImg.html",
                    controller: "imgCtrl",
                }).result.then(function (provider) {
                    console.log(provider);
                    if (provider == "img") {
                        var url = $rootScope.img.url;
                        var txt = $rootScope.img.txt;
                        var dat = $rootScope.img.dat;
                        var nam = $rootScope.img.nam;

                        var imagePath = github.getRawContentUrl({path: ''});
                        if (url.indexOf(imagePath) == 0) {
                            url = '#' + url.substring(imagePath.length);
                        }
                        var wiki = '';
                        if (txt) {
                            wiki += '![' + txt + ']';
                        } else if (editor.somethingSelected()) {
                            wiki += '![' + editor.getSelection() + ']';
                        } else {
                            wiki += '![]';
                        }

                        if (url) {
                            wiki += '(' + url + ')';
                        } else {
                            wiki += '(' + dat + ')';

                        }

                        editor.replaceSelection(wiki);
                        editor.focus();
                    }
                }, function (text, error) {
                    console.log('text:' + text);
                    console.log('error:' + error);
                    return;
                });
            }

            /**
             * dataURL to blob, ref to https://gist.github.com/fupslot/5015897
             * @param dataURI
             * @returns {Blob}
             */
            function dataURItoBlob(dataURI) {
                var byteString = atob(dataURI.split(',')[1]);
                var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
                var ab = new ArrayBuffer(byteString.length);
                var ia = new Uint8Array(ab);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                return new Blob([ab], {type: mimeString});
            }

            //图片上传
            $scope.cmd_image_upload = function (fileObj, cb) {
                if (!/image\/\w+/.test(fileObj.type)) {
                    alert("这不是图片！");
                    return false;
                }
                var innerGitlab = dataSource.getRawDataSource('innerGitlab');
                //console.log(innerGitlab);
                if (!innerGitlab.isInited()) {
                    alert('innerGitlab服务失效，图片无法上传');
                } else {
                    //支持chrome IE10
                    if (window.FileReader) {
                        var fileReader = new FileReader();
                        var cursor = editor.getCursor();
                        fileReader.onloadstart = function () {
                            console.log("onloadstart");
                            line_keyword(cursor.line, '![](uploading...0/' + fileObj.size + ')', 2);
                        };
                        fileReader.onprogress = function (p) {
                            console.log("onprogress");
                            line_keyword(cursor.line, '![](uploading...' + p.loaded + '/' + fileObj.size + ')', 2);
                        };
                        fileReader.onload = function () {
                            console.log("load complete");
                            line_keyword(cursor.line, '![](uploading...' + fileObj.size + '/' + fileObj.size + ')', 2);

                            //$scope.dataSource.uploadImage({content: fileReader.result}, function (img_url) {
                            innerGitlab.uploadImage({content: fileReader.result}, function (img_url) {
                                console.log(img_url);
                                var imagePath = innerGitlab.getRawContentUrlPrefix();
                                if (img_url.indexOf(imagePath) == 0) {
                                    imagePath = '#' + img_url.substring(imagePath.length);
                                } else {
                                    imagePath = img_url;
                                }
                                line_keyword(cursor.line, '![](' + imagePath + ')', 2);
                                //line_keyword(cursor.line, '![](' + img_url + ')', 2);
                                if (cb) {
                                    cb(img_url);
                                }
                            });
                        }
                        fileReader.readAsDataURL(fileObj);
                    } else {
                        alert('浏览器不支持');
                    }
                }
            }

            //代码
            $scope.cmd_code = function () {
                var sel = editor.getSelection();
                var desStr = '```' + sel + '```';
                editor.replaceSelection(desStr);

                var cursor = editor.getCursor();
                editor.setCursor(CodeMirror.Pos(cursor.line, cursor.ch - 3));

                editor.focus();
            }

            //删除
            $scope.cmd_remove = function () {
                if (!isEmptyObject(currentWebsitePage)) {
                    var retVal = confirm("你确定要删除页面:" + currentWebsitePage.name + "?");
                    if (retVal == true) {
                        $scope.loading = true;
                        util.post(config.apiUrlPrefix + "website_pages/deleteByPageId", {_id: currentWebsitePage._id}, function (data) {
                            storage.indexedDBDeleteItem(currentWebsitePage.url);
                            $scope.dataSource && $scope.dataSource.deleteFile({
                                path: currentWebsitePage.websieName + '/' + currentWebsitePage.name,
                                message: "delete file"
                            });

                            currentWebsitePage.isDelete = true;

                            currentWebsitePage = {};
                            initTree();
                            openPage(false);
                            $scope.loading = false;
                        }, function () {
                            console.log(response.data);
                            $scope.loading = false;

                        });
                    }
                }
            }

            //版本
            $scope.cmd_version = function () {
                util.go("gitVersion");
            }

            // 渲染回调
            function autoSave(cb, errcb) {
                var content = editor.getValue();
                if (isEmptyObject(currentWebsitePage) || content == currentWebsitePage.content) {//修改
                    cb && cb();
                    return;
                }

                //console.log('auto save website page!!!');
                currentWebsitePage.content = content;
                currentWebsitePage.timestamp = (new Date()).getTime();
                var websitePage = angular.copy(currentWebsitePage);
                //websitePage.isModify = undefined;
                util.http('POST', config.apiUrlPrefix + 'website_pages/upsert', websitePage, function (data) {
                    storage.indexedDBDeleteItem(websitePage.url);
                    if ($scope.dataSource) {
                        $scope.dataSource.writeFile({
                            path: websitePage.url.substring(1),
                            content: websitePage.content,
                            message: 'wikicraft save file!!!'
                        }, function () {
                            cb && cb(data);
                        }, function () {
                            cb && cb(data);
                        });
                    } else {
                        cb && cb(data);
                    }
                }, function () {
                    storage.indexedDBSetItem(currentWebsitePage);
                    errcb && errcb();
                });
                // 数据源提交
            }
            // 渲染自动保存
            function renderAutoSave(cb, errcb) {
                var value = editor.getValue();
                if (isEmptyObject(currentWebsitePage) || currentWebsitePage.content == value) {
                    cb && cb();
                    return;
                }
                currentWebsitePage.content = value;                               // 更新内容
                currentWebsitePage.timestamp = (new Date()).getTime();           // 更新时间戳
                //console.log(currentWebsitePage);
                //console.log('save storage ' + currentWebsitePage.url);
                storage.indexedDBSetItem(currentWebsitePage, cb, errcb); // 每次改动本地保存
            }

            function initEditor() {
                console.log("initEditor");
                if (editor || (!document.getElementById("source"))) {
                    console.log("init editor failed");
                    return;
                }

                function wikiCmdFold(cm, start) {
                    var line = cm.getLine(start.line);
                    if ((!line) || (!line.match(/^```[@\/]/)))
                        return undefined;
                    var end = start.line + 1;
                    var lastLineNo = cm.lastLine();
                    while (end < lastLineNo) {
                        line = cm.getLine(end)
                        if (line && line.match(/^```/))
                            break;
                        end++;
                    }

                    return {
                        from: CodeMirror.Pos(start.line),
                        to: CodeMirror.Pos(end, cm.getLine(end).length)
                    };
                }

                CodeMirror.registerHelper("fold", "wikiCmdFold", wikiCmdFold);

                editor = CodeMirror.fromTextArea(document.getElementById("source"), {
                    mode: 'markdown',
                    lineNumbers: true,
                    theme: "default",
                    viewportMargin: Infinity,
                    //绑定Vim
                    //keyMap:"vim",
                    //代码折叠
                    lineWrapping: true,

                    foldGutter: true,
                    foldOptions: {
                        rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.markdown, CodeMirror.fold.xml, CodeMirror.fold.wikiCmdFold),
                        clearOnEnter: false,
                    },
                    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-lint-markers"],
                    //全屏模式
                    //fullScreen:true,
                    //括号匹配
                    matchBrackets: true,
                    // lint: true,
                    extraKeys: {
                        "Alt-F": "findPersistent",
                        "Ctrl-F": "find",
                        "Ctrl-R": "replace",
                        "F11": function (cm) {
                            $rootScope.frameHeaderExist = !$rootScope.frameHeaderExist;
                            $rootScope.$apply();
                            //console.log($rootScope.frameHeaderExist);
                            cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                        },
                        "Esc": function (cm) {
                            if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                        },
                        "Ctrl-S": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_savepage();
                        },
                        "Shift-Ctrl-N": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_newpage();
                        },
                        "Ctrl-B": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_bold();
                        },
                        "Ctrl-I": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_italic();
                        },
                        "Ctrl--": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_strikethrough();
                        },
                        "Shift-Ctrl-[": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_superscript();
                        },
                        "Shift-Ctrl-]": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_subscript();
                        },
                        "Shift-Ctrl-1": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_headline(1);
                        },
                        "Shift-Ctrl-2": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_headline(2);
                        },
                        "Shift-Ctrl-3": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_headline(3);
                        },
                        "Shift-Ctrl-4": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_headline(4);
                        },
                        "Shift-Ctrl-5": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_headline(5);
                        },
                        "Shift-Ctrl-6": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_headline(6);
                        },
                        "Ctrl-.": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_listul();
                        },
                        "Ctrl-/": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_listol();
                        },
                        "Ctrl-]": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_blockqote();
                        },
                        "Shift-Ctrl-T": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_tabel();
                        },
                        "Ctrl-H": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_horizontal();
                        },
                        "Alt-L": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_link();
                        },
                        "Alt-P": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_image();
                        },
                        "Alt-C": function (cm) {
                            var $scope = angular.element('#wikiEditor').scope();
                            $scope.cmd_code();
                        },
                    }
                });

                editor.on('fold', function (cm, from, to) {
                    cm.getDoc().addLineClass(from.line, 'wrap', 'CodeMirrorFold');
                });
                editor.on('unfold', function (cm, from, to) {
                    cm.getDoc().removeLineClass(from.line, 'wrap', 'CodeMirrorFold');
                });
                // 渲染后自动保存

                var scrollTimer = undefined, changeTimer = undefined;
                var isScrollPreview = false;
                mdwiki = markdownwiki({
                    container_name: '.result-html',
                    renderCallback: function () {
                        renderAutoSave();
                        resizeMod();
                    },
                    changeCallback: changeCallback
                });
                editor.focus();
                setEditorHeight();

                function resizeMod() {
                    var boxWidth = $("#preview").width() - 30;//30为#preview的padding宽度
                    var contentWidth = winWidth;
                    var scaleSize = (boxWidth >= contentWidth) ? 1 : (boxWidth / contentWidth);
                    //console.log(mdwiki.getLastDivId());
                    $('#'+mdwiki.getLastDivId()).css({"transform": "scale(" + scaleSize + ")", "transform-origin": "left top"});
                }

                function setEditorHeight() {
                    setTimeout(function () {
                        var wikiEditorContainer = $('#wikiEditorContainer')[0];
                        var wikiEditorPageContainer = $('#wikiEditorPageContainer')[0];
                        /*
                        console.log(wikiEditorContainer.offsetTop);
                        console.log(wikiEditorPageContainer.clientHeight);
                        console.log($(window).height());
                        */
                        var height = (wikiEditorPageContainer.clientHeight - wikiEditorContainer.offsetTop) + 'px';
                        editor.setSize('auto', height);
                        $('#wikiEditorContainer').css('height', height);
                        $('#treeview').css('max-height', height);

                        var w = $("#__mainContent__");
                        w.css("min-height", "0px");
                    });
                }
                window.onresize = function () {
                    setEditorHeight();
                    resizeMod();
                }
                mdwiki.bindToCodeMirrorEditor(editor);

                editor.on("beforeChange", function (cm, changeObj) {
                    //console.log(changeObj);
                    for (var i = changeObj.from.line; i < changeObj.to.line + 1; i++) {
                        if (!/^```[@\/]/.test(editor.getLine(i))) {
                            cm.getDoc().removeLineClass(i, 'wrap', 'CodeMirrorFold');
                        }
                    }
                });
                // 折叠wiki代码
                function foldWikiBlock(cm, changeObj) {
                    //console.log(changeObj);
                    var start = -1, end = -1;
                    for (var i = 0; i < changeObj.text.length; i++) {
                        //cm.getDoc().removeLineClass(changeObj.from.line + i, 'wrap', 'CodeMirrorFold');
                        if (/^```[@\/]/.test(changeObj.text[i])) {
                            start = i;
                        }
                        if (start >= 0 && /^```/.test(changeObj.text[i])) {
                            end = i;
                        }
                        if (start >= 0 && end >= 0) {
                            editor.foldCode({line:changeObj.from.line + start, ch:changeObj.from.ch}, null, 'fold');
                        }
                    }
                    start = end = -1;
                    for (var i = 0; i < changeObj.removed.length; i++) {
                        //cm.getDoc().removeLineClass(changeObj.from.line + i, 'wrap', 'CodeMirrorFold');
                        if (/^```[@\/]/.test(changeObj.removed[i])) {
                            start = i;
                        }
                        if (start >= 0 && /^```/.test(changeObj.removed[i])) {
                            end = i;
                        }
                        if (start >= 0 && end >= 0) {
                            cm.getDoc().removeLineClass(changeObj.from.line + i, 'wrap', 'CodeMirrorFold');
                        }
                    }

                }
                // 编辑器改变内容回调
                function changeCallback(cm, changeObj) {
                    //console.log(changeObj);
                    foldWikiBlock(cm, changeObj);

                    var content = editor.getValue();
                    if (currentWebsitePage._id && !currentWebsitePage.isModify && content != currentWebsitePage.content &&
                        (!currentWebsitePage.isFirstEditor || content.replace(/[\r\n]*/g,"") != currentWebsitePage.content.replace(/[\r\n]*/g,""))) { // 解决 editor.setValue(text); text != editor.getValue() 问题
                            //console.log("--------manual modify--------------");
                            currentWebsitePage.isModify = true;
                            initTree();
                    }
                    currentWebsitePage.isFirstEditor = undefined;

                    changeTimer && clearTimeout(changeTimer);
                    changeTimer = setTimeout(function () {
                        autoSave();                               // 每分钟提交一次server
                    }, 60000);
                }

                function getBlockPosList() {
                    var blockList = $('#' + mdwiki.getWikiMdContentContainerId()).children();
                    var blockPosList = [];
                    for (var i = 0; i < blockList.length; i++) {
                        if (blockPosList[blockPosList.length - 1] >= blockList[i].offsetTop)
                            continue;

                        blockPosList.push(blockList[i].offsetTop);
                    }
                    return blockPosList;
                }

                editor.on('scroll', function (cm) {
                    if (isScrollPreview)
                        return;
                    scrollTimer && clearTimeout(scrollTimer);
                    scrollTimer = setTimeout(function () {
                        var blockPosList = getBlockPosList();
                        var editorPosList = mdwiki.getPosList();
                        var scrollObj = cm.getScrollInfo();
                        var index = 0;
                        for (index = 0; index < editorPosList.length - 1; index++) {
                            if (editor.heightAtLine(editorPosList[index].from) > 142)
                                break;
                        }
                        $('#preview').scrollTop(blockPosList[index] - 30);
                    }, 100);
                });

                $('#preview').on('scroll mouseenter mouseleave', function (e) {
                    if (e.type == 'mouseenter') {
                        isScrollPreview = true;
                    } else if (e.type == 'mouseleave') {
                        isScrollPreview = false;
                    } else if (e.type == 'scroll') {
                        if (!isScrollPreview)
                            return;
                        scrollTimer && clearTimeout(scrollTimer);
                        scrollTimer = setTimeout(function () {
                            var blockPosList = getBlockPosList();
                            var editorPosList = mdwiki.getPosList();
                            //console.log(editorPosList);
                            var scrollTop = $('#preview')[0].scrollTop;
                            var index = 0;
                            for (index = 0; index < blockPosList.length - 1; index++) {
                                if (scrollTop <= blockPosList[index])
                                    break;
                            }
                            //console.log(index);
                            //console.log(blockPosList);
                            //console.log(editorPosList);
                            editor.scrollTo(0, editor.getScrollInfo().top + editor.heightAtLine(editorPosList[index].from) - 142); // 142 为调试得到，应该是编辑器隐藏了142px
                        }, 100);
                    }
                });


                var showTreeview = true;

                function initView(activity) {

                    $("#srcview").removeClass('col-xs-12');
                    $("#srcview").removeClass('col-xs-10');
                    $("#srcview").removeClass('col-xs-5');
                    $("#srcview").removeClass('col-xs-6');

                    $("#preview").removeClass('col-xs-12');
                    $("#preview").removeClass('col-xs-10');
                    $("#preview").removeClass('col-xs-5');
                    $("#preview").removeClass('col-xs-6');

                    if (activity == true) {
                        $('.toolbar-page-slide').removeClass('active');
                        $('.toolbar-page-code').removeClass('active');
                        $('.toolbar-page-design').removeClass('active');
                    }

                    if ($("#treeview").is(":hidden")) {
                        if ($("#preview").is(":hidden")) {
                            $("#srcview").addClass('col-xs-12');
                        } else {
                            $("#srcview").addClass('col-xs-6');
                        }
                        if ($("#srcview").is(":hidden")) {
                            $("#preview").addClass('col-xs-12');
                            resizeMod();
                        } else {
                            $("#preview").addClass('col-xs-6');
                            resizeMod();
                        }
                    } else {
                        if ($("#preview").is(":hidden")) {
                            $("#srcview").addClass('col-xs-10');
                        } else {
                            $("#srcview").addClass('col-xs-5');
                        }
                        if ($("#srcview").is(":hidden")) {
                            $("#preview").addClass('col-xs-10');
                            resizeMod();
                        } else {
                            $("#preview").addClass('col-xs-5');
                            resizeMod();
                        }
                    }
                }

                $('.toolbar-page-file').on('click', function () {
                    if ($("#treeview").is(":hidden")) {
                        $('#treeview').show('fast', function () {
                            initView(false);
                            if ($("#treeview").is(":hidden")) {
                                $('.toolbar-page-file').removeClass('active');
                            } else {
                                $('.toolbar-page-file').addClass('active');
                            }
                        });
                    } else {
                        $('#treeview').hide('fast', function () {
                            initView(false);
                            if ($("#treeview").is(":hidden")) {
                                $('.toolbar-page-file').removeClass('active');
                            } else {
                                $('.toolbar-page-file').addClass('active');
                            }
                        });
                    }
                });

                $('.toolbar-page-code').on('click', function () {
                    $('#srcview').show();
                    $("#preview").hide('fast', function () {
                        initView(true);
                        $('.toolbar-page-code').addClass('active');
                        $('.toolbar-page-view').attr("disabled", true);
                        $('#codeToolbar button').attr("disabled", false);
                    });
                });

                $('.toolbar-page-slide').on('click', function () {
                    $('#srcview').show();
                    $("#preview").show('fast', function () {
                        initView(true);
                        $('.toolbar-page-slide').addClass('active');
                        $('.toolbar-page-view').attr("disabled", false);
                        $('#codeToolbar button').attr("disabled", false);
                    });
                });

                $('.toolbar-page-design').on('click', function () {
                    $('#preview').show();
                    $("#srcview").hide('fast', function () {
                        initView(true);
                        $('.toolbar-page-design').addClass('active');
                        $('.toolbar-page-view').attr("disabled", false);
                        $('#codeToolbar button').attr("disabled", true);

                    });
                });

//获取剪贴板数据方法
                function getClipboardText(event) {
                    var clipboardData = event.clipboardData || window.clipboardData;
                    return clipboardData.getData("text");
                };

//设置剪贴板数据
                function setClipboardText(event, value) {
                    if (event.clipboardData) {
                        return event.clipboardData.setData("text/plain", value);
                    } else if (window.clipboardData) {
                        return window.clipboardData.setData("text", value);
                    }
                };

                function CreateElementForExecCommand(textToClipboard) {
                    var forExecElement = document.createElement("div");
                    // place outside the visible area
                    forExecElement.style.position = "absolute";
                    forExecElement.style.left = "-10000px";
                    forExecElement.style.top = "-10000px";
                    // write the necessary text into the element and append to the document
                    forExecElement.textContent = textToClipboard;
                    document.body.appendChild(forExecElement);
                    // the contentEditable mode is necessary for the  execCommand method in Firefox
                    forExecElement.contentEditable = true;

                    return forExecElement;
                }

                function SelectContent(element) {
                    // first create a range
                    var rangeToSelect = document.createRange();
                    rangeToSelect.selectNodeContents(element);

                    // select the contents
                    var selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(rangeToSelect);
                }

                function CopyToClipboard(value) {
                    var textToClipboard = value;

                    var success = true;
                    if (window.clipboardData) { // Internet Explorer
                        window.clipboardData.setData("Text", textToClipboard);
                    }
                    else {
                        // create a temporary element for the execCommand method
                        var forExecElement = CreateElementForExecCommand(textToClipboard);

                        /* Select the contents of the element
                         (the execCommand for 'copy' method works on the selection) */
                        SelectContent(forExecElement);

                        var supported = true;

                        // UniversalXPConnect privilege is required for clipboard access in Firefox
                        try {
                            if (window.netscape && netscape.security) {
                                netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                            }

                            // Copy the selected content to the clipboard
                            // Works in Firefox and in Safari before version 5
                            success = document.execCommand("copy", false, null);
                        }
                        catch (e) {
                            success = false;
                        }

                        // remove the temporary element
                        document.body.removeChild(forExecElement);
                    }

                    if (success) {
                        //alert("网址已成功拷贝到剪切板!");
                        Message.info("网址已成功拷贝到剪切板!");
                    }
                    else {
                        //alert("您的浏览器不支持访问剪切板!");
                        Message.info("您的浏览器不支持访问剪切板!");
                    }
                }

                $('.toolbar-page-copyurl').on('click', function () {
                    CopyToClipboard($('#btUrl').val());
                });

                $('.toolbar-page-preview').on('click', function () {
                    editor.focus();
                    var url = $('#btUrl').val();
                    if (url) {
                        window.open(url);
                    }

                });

                $('.toolbar-page-version').on('click', function () {
                    var $scope = angular.element('#wikiEditor').scope();
                    $scope.cmd_version();
                });

                $('.toolbar-page-hotkey').on('click', function () {
                    console.log('toolbar-page-hotkey');
                    $('#hotkeyModal').modal({
                        keyboard: true
                    })
                });

                $('.toolbar-page-knowledge').on('click', function () {
                    console.log('toolbar-page-knowledge');
                    util.go("knowledge");
                });

                $(function () {
                    var wellStartPos = $('.well').offset().top;

                    $.event.add(window, "scroll", function () {
                        var p = $(window).scrollTop();
                        if (p > wellStartPos) {
                            $('.well').css('position', 'fixed');
                            $('.well').css('top', '0px');
                            $('.well').css('left', '0px');
                            $('.well').css('right', '0px');

//                $('.treeview').css('position', 'fixed');
//                $('.treeview').css('top',p + $('#toolbarview').height());
                        } else {
                            $('.well').css('position', 'static');
                            $('.well').css('top', '');

//                $('.treeview').css('position','static');
//                $('.treeview').css('top','');
                        }
                    });
                });

//    editor.on("blur", function(){
//        console.log('editor lost focus');
//        setTimeout(function () {
//            editor.focus();
//        },500);
//    });

                $('.btn').on('click', function () {
                    var unfocus = $(this).data('unfocus');
                    if (unfocus == undefined || unfocus == '0') {
                        editor.focus();
                    }
                });

                function midDiv(DivId, left) {
                    var Div = $(DivId);
                    $(DivId).style.top = (document.documentElement.scrollTop + (document.documentElement.clientHeight - $(DivId).offsetHeight) / 2) + "px";
//        $(DivId).style.left = (document.documentElement.scrollLeft + (document.documentElement.clientWidth - $(DivId).offsetWidth) / 2) + "px";
                    $(DivId).style.left = left;
                }

                editor.focus();

                editor.on("paste", function (editor, e) {
                    if (!(e.clipboardData && e.clipboardData.items)) {
                        alert("该浏览器不支持操作");
                        return;
                    }
                    for (var i = 0, len = e.clipboardData.items.length; i < len; i++) {
                        var item = e.clipboardData.items[i];
                        // console.log(item.kind+":"+item.type);
                        if (item.kind === "string") {
                            item.getAsString(function (str) {
                                // str 是获取到的字符串
                                //console.log('get str');
                                //console.log(str);
                            })
                        } else if (item.kind === "file") {
                            var pasteFile = item.getAsFile();
                            // pasteFile就是获取到的文件
                            //console.log(pasteFile);
                            fileUpload(pasteFile);
                        }
                    }
                });

                editor.on("drop", function (editor, e) {
                    // console.log(e.dataTransfer.files[0]);
                    if (!(e.dataTransfer && e.dataTransfer.files)) {
                        alert("该浏览器不支持操作");
                        return;
                    }
                    for (var i = 0; i < e.dataTransfer.files.length; i++) {
                        //console.log(e.dataTransfer.files[i]);
                        fileUpload(e.dataTransfer.files[i]);
                    }
                    e.preventDefault();
                });

                //文件上传
                function fileUpload(fileObj) {
                    console.log(fileObj);
                    var $scope = angular.element('#wikiEditor').scope();
                    $scope.cmd_image_upload(fileObj);
                    return;
                }

                //阻止浏览器默认打开拖拽文件的行为
                window.addEventListener("drop", function (e) {
                    e = e || event;
                    e.preventDefault();
                    if (e.target.tagName == "textarea") {  // check wich element is our target
                        e.preventDefault();
                    }
                }, false);


                return editor;
            }


        }]);

    return htmlContent;
});
