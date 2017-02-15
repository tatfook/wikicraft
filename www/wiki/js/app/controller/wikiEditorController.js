/**
 * Created by wuxiangan on 2017/1/10.
 */

define([
    'app',
    'codemirror',
    'helper/markdownwiki',
    'helper/util',
    'text!html/wikiEditor.html',
    'bootstrap-treeview',
], function (app, CodeMirror, markdownwiki, util, htmlContent) {
    //console.log("wiki editor controller!!!");
    var editor;

    function initEditor() {
        console.log("initEditor");
        if (editor || (!document.getElementById("source"))) {
            console.log("init editor failed");
            return ;
        }
        editor = CodeMirror.fromTextArea(document.getElementById("source"), {
            mode: 'markdown',
            lineNumbers: true,
            lineWrapping: true,
            theme: "default",
            viewportMargin: Infinity,
            extraKeys: {
                "Alt-F": "findPersistent",
                "F11": function (cm) {
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

        var mdwiki = markdownwiki({container_name: '.result-html'});
        mdwiki.bindToCodeMirrorEditor(editor);
        editor.focus();

        var showTreeview = true;

        function initView(activity) {

            $("#srcview").removeClass('col-xs-12');
            $("#srcview").removeClass('col-xs-10');
            $("#srcview").removeClass('col-xs-6');
            $("#srcview").removeClass('col-xs-5');

            $("#preview").removeClass('col-xs-12');
            $("#preview").removeClass('col-xs-10');
            $("#preview").removeClass('col-xs-6');
            $("#preview").removeClass('col-xs-5');

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
                } else {
                    $("#preview").addClass('col-xs-6');
                }
            } else {
                if ($("#preview").is(":hidden")) {
                    $("#srcview").addClass('col-xs-10');
                } else {
                    $("#srcview").addClass('col-xs-5');
                }
                if ($("#srcview").is(":hidden")) {
                    $("#preview").addClass('col-xs-10');
                } else {
                    $("#preview").addClass('col-xs-5');
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
                alert("网址已成功拷贝到剪切板!");
            }
            else {
                alert("您的浏览器不支持访问剪切板!");
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
                        console.log('get str');
                        console.log(str);
                    })
                } else if (item.kind === "file") {
                    var pasteFile = item.getAsFile();
                    // pasteFile就是获取到的文件
                    console.log(pasteFile);
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
    app.registerController('imgCtrl', ['$scope', '$rootScope', '$uibModalInstance', 'github', function ($scope, $rootScope, $uibModalInstance,github) {
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
                    console.log(github.isInited());
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
            $rootScope.link = $scope.link;
            $uibModalInstance.close("link");
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
        $scope.websites = {};           //站点列表
        $scope.websitePages = {};       //页面列表

        $scope.website = {};            //当前选中站点
        $scope.websitePage = {};        //当前选中页面

        $scope.style = {};      //模板

        $scope.website_select = function (wb) {
            $scope.website = wb;
            //$http.post('http://localhost:8099/api/wiki/models/website_template_style', {_id: $scope.website.styleId}).then(function (response) {
            //    $scope.style = response.data;  // 模板代码style.content
            //})
        }

        //初始化
        function init() {
            $scope.websites = $rootScope.websites;           //站点列表
            $scope.websitePages = $rootScope.websitePages;       //页面列表

            if ($rootScope.website) {
                for (var i = 0; i < $scope.websites.length; i++) {
                    if ($scope.websites[i]._id == $rootScope.website._id) {
                        $scope.website_select($scope.websites[i]);
                        break;
                    }
                }
            }
        }

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

        $scope.website_new = function () {
            if ($scope.website.name === undefined || $scope.website.name.length == 0) {
                alert('请选择站点');
                return false;
            }

            if ($scope.websitePage.name === undefined || $scope.websitePage.name.length == 0) {
                alert('请填写页面名');
                return false;
            }

            $scope.websitePage.url = '/' + $scope.user.username + '/' + $scope.website.name + '/' + $scope.websitePage.name;
            $scope.websitePage.websiteName = $scope.website.name;
            $scope.websitePage.websiteId = $scope.website._id;
            $scope.websitePage.content = ""; // $scope.style.data[0].content;
            $scope.websitePage.userId = $scope.website.userId

            $http.put(config.apiUrlPrefix + 'website_pages/new', $scope.websitePage).then(function (response) {
                $rootScope.websitePage = response.data.data;
                $rootScope.website = $scope.website;

                $uibModalInstance.close("page");
            }).catch(function (response) {
                console.log(response.data);
                alert('新建页面失败');
            });
        }
        init();
    }]);
    app.registerController('wikiEditorController', ['$scope', '$rootScope', '$http', '$location', '$uibModal', 'Account', 'github', function ($scope, $rootScope, $http, $location, $uibModal, Account, github) {
        console.log("wikiEditorController");
        $scope.websites = [];           //站点列表
        $scope.websitePages = [];       //页面列表

        $scope.website = {};            //当前选中站点
        $scope.websitePage = {};        //当前选中页面

        $scope.githubSource = {};

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

        function getTreeData() {
            var pageList = $scope.websitePages ||[];
            var pageTree = {url:'/' + $scope.user.username , children:{}};
            var treeData = [];
            for (var i = 0; i < pageList.length; i++) {
                var page = pageList[i];
                var url = page.url;
                url = url.trim();
                var paths = page.url.split('/');
                var treeNode = pageTree;
                for (var j = 2; j < paths.length; j++) {
                    var path = paths[j];
                    if (!path){
                        continue;
                    }
                    subTreeNode = treeNode.children[path] || {name:path, children:{}, url: treeNode.url + '/' + path, siteId:page.websiteId, siteName: page.websiteName, pageId:page._id};
                    treeNode.children[paths[j]] = subTreeNode;
                    treeNode.isLeaf = false;
                    if (j == paths.length - 1) {
                        subTreeNode.isLeaf = true;
                        subTreeNode.sha = page.sha;
                        //subTreeNode.content = page.content;
                    }
                    treeNode = subTreeNode;
                }
            }
            var treeDataFn = function (treeNode, pageNode) {
                treeNode = treeNode || {};
                treeNode.text = pageNode.name;
                treeNode.icon = (pageNode.isLeaf && pageNode.sha) ? 'fa fa-github-alt' : 'fa fa-file-o';
                treeNode.pageNode = pageNode;

                if (pageNode.isLeaf) {
                    treeNode.selectedIcon = (pageNode.isLeaf && pageNode.sha) ? 'fa fa-github' : 'fa fa-file-o';
                }
                if (!pageNode.isLeaf) {
                    treeNode.nodes = [];
                    for (key in pageNode.children) {
                        treeNode.nodes.push(treeDataFn(undefined,pageNode.children[key]));
                    }
                }

                return treeNode;
            };

            for (key in pageTree.children) {
                treeData.push(treeDataFn(undefined, pageTree.children[key]));
            }

            for (var i = 0; i < treeData.length; i++){
                treeData[i].icon = 'fa fa-globe';
            }
            return treeData;
        }


        //初始化，读取用户站点列表及页面列表
        function init() {
            if (!Account.isAuthenticated()) {
                return;
            }

            var user = Account.getUser();
/*
            github.init({token_type:'bearer', access_token:'5576aa080fa5f9113607c779f067d4465be43dbf'},'wxaxiaoyao');
            $scope.githubSource = github;
*/
            if (user.githubToken) {
                github.init(user.githubToken, user.githubName);
                $scope.githubSource = github;
            }

            // console.log(config.apiUrlPrefix);
            // 获取用户站点列表
            $http.post(config.apiUrlPrefix + 'website', {userId: Account.getUser()._id}).then(function (response) {
                $scope.websites = response.data.data;
                util.http('POST', config.apiUrlPrefix + 'website_pages/getByUserId',{userId:Account.getUser()._id}, function (data) {
                    $scope.websitePages = data || [];
                    initRoot();
                    initTree();
                });

            }).catch(function (response) {
                console.log(response.data);
            });

            return;
        }

        function progressing(step) {
            if ($scope.progressbar.percent == 0) {
                $scope.progressbar.show = true;
            }
            $scope.progressbar.percent = $scope.progressbar.percent + step;
            $(".progress-bar").css("width", $scope.progressbar.percent + "%");
        }

        //设置全局变量
        function initRoot() {
            $rootScope.websites = $scope.websites;
            $rootScope.websitePages = $scope.websitePages;

            if (!isEmptyObject($rootScope.website)) $scope.website = $rootScope.website;                    //当前选中站点
            if (!isEmptyObject($rootScope.websitePage)) {
                $scope.websitePage = $rootScope.websitePage;
                openPage();
            }
        }

        function getWebsite(id) {
            for (var i = 0; i < $scope.websites.length; i++) {
                ws = $scope.websites[i];
                if (ws._id == id) {
                    return ws;
                }
            }
            return null;
        }

        function getWebsitePage(id) {
            //console.log($scope.websitePages);
            for (var j = 0; j < $scope.websitePages.length; j++) {
                wp = $scope.websitePages[j];
                if (wp._id == id) {
                    return wp;
                }
            }
            return null;
        }

        function openPage() {
            var wp = $scope.websitePage;
            if (isEmptyObject(wp)) {
                $scope.websitePage = {};
                delete $rootScope.websitePage;
                editor.setValue('');
                $('#btUrl').val('');
                $('.toolbar-page-remove').attr("disabled", true);
            } else {
                editor.setValue(wp.content);
                $('#btUrl').val(wp.url);
                $('.toolbar-page-remove').attr("disabled", false);
            }
        }

        //初始化目录树  data:  $.parseJSON(getTree()),
        function initTree() {
            //console.log('@initTree');
            $('#treeview').treeview({
                color: "#428bca",
                showBorder: false,
                enableLinks: true,
                data: getTreeData(),
                onNodeSelected: function (event, data) {
                    console.log(data);
                    //return;
                    $scope.website = getWebsite(data.pageNode.siteId);
                    $scope.websitePage = getWebsitePage(data.pageNode.pageId);
                    $rootScope.websitePage = $scope.websitePage;
                    $rootScope.website = $scope.website;
                    $rootScope.pageinfo = $scope.websitePage; // wxa add 站点信息全局化，默认提供wiki mod使用
                    $rootScope.siteinfo = $scope.website;
                    if (data.pageNode.isLeaf) {
                        openPage();
                    }
                    editor.focus();
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

        $scope.cmd_newpage = function () {
            $uibModal.open({
                //templateUrl: WIKI_WEBROOT+ "html/editorNewPage.html",   // WIKI_WEBROOT 为后端变量前端不能用
                templateUrl: config.htmlPath + "editorNewPage.html",
                controller: "pageCtrl",
            }).result.then(function (provider) {
                //console.log(provider);
                if (provider == "page") {
                    $scope.websitePages.push($rootScope.websitePage);
                    $scope.websitePage = $rootScope.websitePage;
                    $scope.website = $rootScope.website;

                    initTree();
                    openPage();

                    var selectableNodes = $('#treeview').treeview('search', [$scope.websitePage.name, {
                        ignoreCase: false,
                        exactMatch: true
                    }]);
                    $.each(selectableNodes, function (index, item) {
                        if (item.tags[0] == "page" && item.tags[1] == $scope.websitePage._id) {
                            $('#treeview').treeview('selectNode', [item, {silent: true}]);
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
                console.log('text:' + text);
                console.log('error:' + error);
                return;
            });
        }

        //保存页面
        $scope.cmd_savepage = function () {
            var content = editor.getValue();
            if (!isEmptyObject($scope.websitePage)) {//修改
                $scope.websitePage.content = content;
                $http.put(config.apiUrlPrefix + 'website_pages', $scope.websitePage).then(function (response) {
                    //console.log(response.data);
                    if (!isEmptyObject($scope.githubSource)) {
                        var path = $scope.websitePage.websiteName + '/' + $scope.websitePage.name;
                        $scope.githubSource.writeFile(path, $scope.websitePage.content, 'wikicraft:' + path, function (result) {
                            alert('文件已保存到服务器及Github');
                        });
                    } else {
                        alert('文件已保存到服务器');
                    }
                }).catch(function (response) {
                    console.log(response.data);
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
            CodeMirror.commands.findPersistent(editor);
        }

        //替换
        $scope.cmd_replace = function () {
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
        function line_keyword(char, ch) {
            var cursor = editor.getCursor();
            var content = editor.getLine(cursor.line);
            editor.replaceRange(char, CodeMirror.Pos(cursor.line, 0), CodeMirror.Pos(cursor.line, content.length));
            if (!ch) {
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
                    wiki += '(' + link.url + ')';
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

            if (isEmptyObject($scope.githubSource)) {
                alert('github账号尚未登录，图片无法上传');
            } else {
                //支持chrome IE10
                if (window.FileReader) {
                    var fileReader = new FileReader();
                    fileReader.onloadstart = function () {
                        console.log("onloadstart");
                        line_keyword('![](uploading...0/' + fileObj.size + ')', 2);
                    };
                    fileReader.onprogress = function (p) {
                        console.log("onprogress");
                        line_keyword('![](uploading...' + p.loaded + '/' + fileObj.size + ')', 2);
                    };
                    fileReader.onload = function () {
                        console.log("load complete");
                        line_keyword('![](uploading...' + fileObj.size + '/' + fileObj.size + ')', 2);

                        $scope.githubSource.uploadImage(undefined, fileReader.result, function (img_url) {
                            //console.log(result);
                            line_keyword('![](' + img_url + ')', 2);
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
            if (!isEmptyObject($scope.websitePage)) {
                var retVal = confirm("你确定要删除页面:" + $scope.websitePage.name + "?");
                if (retVal == true) {
                    $scope.loading = true;
                    $http.delete("/api/wiki/models/website_pages", {
                        params: {_id: $scope.websitePage._id, name: $scope.websitePage.name},
                    }).then(function (response) {
                        $.each($scope.websitePages, function (index, item) {
                            if (item._id == $scope.websitePage._id) {
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
        $scope.cmd_version = function () {
            if (!isEmptyObject($scope.githubSource)) {
                $scope.githubSource.listCommits('', function (error, result, request) {
                    if (!error) {
                        console.log(result);
                    }
                });
            }
        }

        //目录树
        $scope.cmd_tree = function () {
            if (!isEmptyObject($scope.githubSource)) {
                $scope.githubSource.getTree('master', true, function (error, result, request) {
                    var filelist = []
                    for (var i = 0; result && i < result.length; i++) {
                        filelist.push({path: result[i].path});
                    }
                    $scope.filelist = filelist;
                    console.log(filelist);
                });
            }
        }

        $scope.$on('onUserProfile', function (event, user) {
            console.log("onUserProfile change!!!");
            init();
            command();
        });

        init();

        /*
         *
         * Configurable variables.
         *
         */
        var hexcase = 0;
        /* hex output format. 0 - lowercase; 1 - uppercase */
        var chrsz = 8;
        /* bits per input character. 8 - ASCII; 16 - Unicode */
        /*
         *
         * The main function to calculate message digest
         *
         */
        function hex_sha1(s) {
            return binb2hex(core_sha1(AlignSHA1(s)));
        }

        /*
         *
         * Perform a simple self-test to see if the VM is working
         *
         */
        function sha1_vm_test() {
            return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
        }

        /*
         *
         * Calculate the SHA-1 of an array of big-endian words, and a bit length
         *
         */
        function core_sha1(blockArray) {
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
        function sha1_ft(t, b, c, d) {
            if (t < 20)
                return (b & c) | ((~b) & d);
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
        function sha1_kt(t) {
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
        function safe_add(x, y) {
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
        function rol(num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
        }

        /*
         *
         * The standard SHA1 needs the input string to fit into a block
         *
         * This function align the input string to meet the requirement
         *
         */
        function AlignSHA1(str) {
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
        function binb2hex(binarray) {
            var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
            var str = "";
            for (var i = 0; i < binarray.length * 4; i++) {
                str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
                    hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
            }
            return str;
        }
    }]);

    return {
        htmlContent:htmlContent,
        domReady:function () {
            initEditor();
        },
    };
});
