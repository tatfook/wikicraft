/**
 * Created by wuxiangan on 2017/1/10.
 */

define([
    'app',
	//'html2canvas',
    'markdown-it',
    'to-markdown',
    'codemirror',
    'helper/markdownwiki',
    'helper/util',
    'helper/storage',
    'helper/dataSource',
    'helper/mdconf',
	'helper/qiniu',
    'text!html/wikiEditor.html',
    'controller/editWebsiteController',
    'controller/bigfileController',
	'controller/moduleEditorController',
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
    'bootstrap-treeview'
], function (app, /*html2canvas,*/ markdownit, toMarkdown, CodeMirror, markdownwiki, util, storage, dataSource, mdconf, qiniu, htmlContent, editWebsiteHtmlContent, bigfileContent, moduleEditorContent) {
    var otherUserinfo = undefined;
    var pageSuffixName = config.pageSuffixName;
    var mdwiki = markdownwiki({editorMode: true, breaks: true, isMainMd:true});
    var editor;
    var allWebsites = [];
    var allWebstePageContent = {};
    var allPageMap = {};                  // 页面映射
	var allSiteMap = {};               // 所有站点映射
    var currentSite = undefined;          // 当前站点
    var currentPage = undefined;          // 当前页面
    var editorDocMap = {};                // 每个文件对应一个文档
    var isHTMLViewEditor = false;         // 是否h5视图编辑
    var currentRichTextObj = undefined;   // 当前编辑的富文本
    var treeNodeMap = {};            // 树节点映射
    var treeNodeExpandedMap = {};    // 展开节点
    var pagelistMap = {};            // 页列表映射
    var urlParamsMap = {};           // url 参数映射

	// 判断对象是否为空
	function isEmptyObject(obj) {
		for (var key in obj) {
			return false;
		}
		return true;
    }

    function getCurrentDataSource() {
		if (currentPage && currentPage.username) {
			return dataSource.getDataSource(currentPage.username, currentPage.sitename);
		}

		return dataSource.getDefaultDataSource()
    }

	function setSite(siteinfo) {
		var key = siteinfo.username + "_" + siteinfo.name;
		allSiteMap[key] = siteinfo;
	}

	function getSite(username, sitename) {
		return allSiteMap[username + "_" + sitename];
	}

	function getCurrentSite(username, sitename) {
		if (!isEmptyObject(currentPage)) {
			username = username || currentPage.username;
			sitename = sitename || currentPage.sitename;
		}

		if (!username || !sitename)
			return null;

		return getSite(username, sitename);
	}

	// 获得指定页
	function getPageByUrl(url) {
		return allPageMap[url];
	}
//}}}
    function getTreeData(username, sitename,  pageMap, isDir) {//{{{
        var pageTree = {url: '/' + username, children: {}};
        var treeData = [];
        for (var key in pageMap) {
            var page = pageMap[key];
            if (page.isDelete || !page.url || (username && page.username != username) || (sitename && page.sitename != sitename)) {
                continue;
            }

            var url = page.url;
            url = url.trim();
            var paths = page.url.split('/');
            var treeNode = pageTree;
            var length = isDir ? paths.length - 1 : paths.length;
            for (var j = 2; j < length; j++) {
                var path = paths[j];
                if (!path || path == ".gitignore") {
                    continue;
                }
                subTreeNode = treeNode.children[path] || {
                        name: path,
                        children: {},
                        url: treeNode.url + '/' + path,
                        sitename: page.sitename,
                        username: page.username,
                    };

                treeNode.children[path] = subTreeNode;
                treeNode.isLeaf = false;
                if (j == paths.length - 1) {
                    subTreeNode.isLeaf = true;
                    if (!isDir) {
                        subTreeNode.isModify = page.isModify;
						subTreeNode.isConflict = page.isConflict;
                    }
                }
                treeNode = subTreeNode;
            }
        }
        // 加上所有站点
        for (var key in allSiteMap) {
            var isExist = false;
            var site = allSiteMap[key];

            if ((username && site.username != username) || (sitename && site.name != sitename)) {
                continue;
            }

            for (key in pageTree.children) {
                if (key == site.name) {
                    var node = pageTree.children[key];
                    node.name = site.displayName ? site.displayName + '(' + site.name + ')' : site.name;
                    isExist = true;
                    if (site.isEditable || site.isReadable){
                        node.name = site.displayName ? site.displayName + '(' + site.username + '/' + site.name + ')' : site.username + '/' + site.name;
                    }
                    break;
                }
            }

            if (isExist)
                continue;

            pageTree.children[site.name] = {
                name: site.displayName ? site.displayName + '(' + site.name + ')' : site.name,
                url: '/' + site.username + '/' + site.name,
                sitename: site.name,
                username: site.username,
                children: {},
				isLeaf: false,
                isEditable: site.isEditable || false,
                isReadable: site.isReadable || false
            }

            if (site.isEditable || site.isReadable){
                pageTree.children[site.name].name = site.displayName ? site.displayName + '(' + site.username + '/' + site.name + ')' : site.username + '/' + site.name;
            }
        }
        //console.log(pageTree.children);

        var treeDataFn = function (treeNode, pageNode) {
            treeNode = treeNode || {};
            treeNode.text = pageNode.name;
			//console.log(pageNode);
			if (pageNode.isLeaf) {
				if (pageNode.isConflict) {
					treeNode.text += " !";
				}
			}
            treeNode.icon = (pageNode.isLeaf && pageNode.isModify) ? 'fa fa-edit' : 'fa fa-file-o';
            treeNode.pageNode = pageNode;

			if (pageNode.isLeaf) {
                treeNode.tags = [];
				treeNode.tags.push([
                    "<span class='show-empty-node glyphicon glyphicon-trash' onclick='angular.element(this).scope().cmd_remove(" + '"' + pageNode.url + '"' + ")' title='删除'></span>",
                    "<span class='show-empty-node glyphicon glyphicon-repeat' onclick='angular.element(this).scope().cmd_refresh("+ '"' + pageNode.url+ '"' + ")' title='刷新'></span>",
                    "<span class='close-icon' onclick='angular.element(this).scope().cmd_close("+ '"' + pageNode.url+ '"'+")' title='关闭'>&times;</span>",
                ]);
			} else {
                treeNode.tags = [];
                var key = pageNode.username + "_" + pageNode.sitename;
                treeNode.tags.push([
                    "<img class='show-parent setting-icon' onclick='angular.element(this).scope().cmd_goSetting("+ '"' + key + '"' + ", event)' src='"+config.services.$rootScope.imgsPath+"icon/wiki_setting.png' title='设置'/>",
                    "<img class='show-parent' onclick='angular.element(this).scope().cmd_newFile(true, "+ '"' + pageNode.url+ '"'+", event)' src='"+config.services.$rootScope.imgsPath+"icon/wiki_newFile.png' title='新建文件夹'/>",
                    "<img class='show-parent' onclick='angular.element(this).scope().cmd_newpage(true, "+ '"' + pageNode.url+ '"'+", event)' src='"+config.services.$rootScope.imgsPath+"icon/wiki_newPage.png' title='新建页面'/>",
                ]);
                treeNode.icon = 'fa fa-globe';

                if (allSiteMap[key].visibility == "private"){
                    treeNode.icon = 'iconfont icon-lock';
                }

                if (pageNode.url.split("/").length > 3){ // 若为网站内部文件夹
                    treeNode.icon = 'iconfont icon-folder';
                }
			}
            treeNode.state = {selected: currentPage && currentPage.url == pageNode.url};

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

        //for (var i = 0; i < treeData.length; i++) {
            //treeData[i].icon = 'fa fa-globe';
            //treeData[i].tags=[];
            //treeData[i].tags.push([
                //"<img class='show-parent' onclick='angular.element(this).scope().cmd_closeAll("+ '"'+ treeData[i].pageNode.sitename +'"'+")' src='"+angular.element("#mytree").scope().imgsPath+"icon/wiki_closeAll.png' title='关闭全部'>",
                //"<img class='show-parent' onclick='angular.element(this).scope().cmd_newFile(true)' src='"+angular.element("#mytree").scope().imgsPath+"icon/wiki_newFile.png' title='新建文件夹'>",
                //"<img class='show-parent' onclick='angular.element(this).scope().cmd_newpage(true)' src='"+angular.element("#mytree").scope().imgsPath+"icon/wiki_newPage.png' title='新建页面'>",
            //]);
        //}
        return treeData;
    }//}}}


    app.registerController('imgCtrl', ['$scope', '$rootScope', '$uibModalInstance', 'github', function ($scope, $rootScope, $uibModalInstance, github) {//{{{
        $scope.img = {url: '', txt: '', file: '', dat: '', nam: ''};

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

        $scope.img_insert = function () {
            $scope.imgErr = "";
            if ($scope.imgContent) {
                var currentDataSource = getCurrentDataSource();
                currentDataSource && currentDataSource.uploadImage({ content: $scope.imgContent, isShowLoading: true }, function(url) {
                      $scope.img.url = url;
                      $rootScope.img = $scope.img;
                      $uibModalInstance.close("img");
                    }, function(err) {
                      console.log(err);
                      $scope.imgErr = "图片上传失败，请稍后重试";
                    });
            }else{
                $rootScope.img = $scope.img;
                $uibModalInstance.close("img");
            }
        }

        $scope.imageLocal = function () {
            $('#uploadImageId').change(function (e) {
                var fileReader = new FileReader();
                fileReader.onload = function () {
                    $scope.imgContent = fileReader.result;
                };
                fileReader.readAsDataURL(e.target.files[0]);
            });
        }
    }]);//}}}

    app.registerController('videoCtrl', ['$scope', '$rootScope', '$uibModalInstance', 'github', function ($scope, $rootScope, $uibModalInstance, github) {//{{{
        $scope.video = {url: '', txt: '', file: '', dat: '', nam: ''};
		var result = {url:"", filename:"", bigfileId:undefined};

        $scope.cancel = function () {
			if (result.bigfileId) {
				deleteFile(result.bigfileId);
			}
            $uibModalInstance.dismiss('');
        }

		$scope.video_insert = function () {
			console.log(result);
			if ($scope.videoUrl) {
				result.url = $scope.videoUrl;
				result.isNetUrl = true;
			}
			$uibModalInstance.close(result);
        }

		function deleteFile(bigfileId) {
			util.post(config.apiUrlPrefix + "bigfile/deleteById", {
				_id:bigfileId,
			});
		}

		function init() {
			$scope.filelist = {};
			var opt = {
				container: "uploadVideoContainer",
				browse_button: "uploadVideoId",
				drop_element: 'drapUploadVideoContainer', // 拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
				uptoken_url:'/api/wiki/models/qiniu/uploadToken',
				success: function(data) {
					var obj = {
						mod:{
							video:{
								cmdName:"@wiki/js/video",
								modName:"video",
								params:{
									filename:data.filename,
									channel:data.channel,
									bigfileId:data._id,
								}
							}
						}
					};
					var content = mdconf.toMd(obj);
					var filename = data.filename || (new Date()).getTime();
					var path = '/' + currentPage.username + '/' + currentPage.sitename + '/_mods/' + filename;

					result.bigfileId = data._id;

					var currentDataSource = getCurrentDataSource();
					if (!currentDataSource) {
						console.log("当前数据不可用!!!");
						return;
					}

					currentDataSource.writeFile({path:path + config.pageSuffixName, content:content}, function(){
						result.filename = data.filename;
						result.url = "http://keepwork.com" + path;
						$scope.filename = data.filename;
						util.$apply($scope);
						currentDataSource.getLastCommitId();
					}, function(){
						deleteFile(data._id);
					});
				},

				failed: function() {
					console.log("上传文件失败");
				},
			};
			qiniu.upload(opt);
		}


		$scope.$watch("$viewContentLoaded", init);
    }]);//}}}

    app.registerController('linkCtrl', ['$scope', '$rootScope', '$uibModalInstance', function ($scope, $rootScope, $uibModalInstance) {//{{{
        $scope.link = {url: '', txt: ''};

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

        $scope.urlSelected = function ($item, $model) {
            $scope.url = $item.url;
        }

        $scope.link_insert = function () {
            $rootScope.link = {url: $scope.url || "", txt: ''};
            $uibModalInstance.close("link");
        }

        var itemArray = [];
        for (var key in allPageMap) {
            itemArray.push({url: allPageMap[key].url});
        }
        $scope.itemArray = itemArray;
    }]);//}}}

    app.registerController('tableCtrl', ['$scope', '$rootScope', '$uibModalInstance', function ($scope, $rootScope, $uibModalInstance) {//{{{
        $scope.table = {rows: 2, cols: 2, alignment: 0};

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

        $scope.table_insert = function () {
            $rootScope.table = $scope.table;
            if ($scope.table.rows < 1 || $scope.table.cols < 1) {
                $scope.errInfo = "表格行,列必须为大于0的整数";
                return;
            }
            $uibModalInstance.close("table");
        }
    }]);//}}}

    app.registerController('pageCtrl', ['$scope', '$rootScope', '$http', '$uibModalInstance', function ($scope, $rootScope, $http, $uibModalInstance) {//{{{
        $scope.website = {};             //当前选中站点
        $scope.websitePage = {};        //当前选中页面
        $scope.errInfo = "";             // 错误提示
        $scope.step = 1;
        var treeNode = undefined;       // 目录节点

        $scope.$watch('$viewContentLoaded', init);
        //初始化目录树  data:  $.parseJSON(getTree()),
        function initTree() {
            //console.log('@initTree');
            $('#newPageTreeId').treeview({
                color: "#428bca",
                showBorder: false,
                enableLinks: false,
                data: getTreeData($scope.user.username, undefined, allPageMap, true),
                onNodeSelected: function (event, data) {
                    //console.log(data);
                    treeNode = data.pageNode;
                }
            });
            var currentInfo=$scope.nowHoverPage || currentPage;
            if (currentInfo) {
                var selectableNodes = $('#newPageTreeId').treeview('search', [currentInfo.sitename, {
                    ignoreCase: true,
                    exactMatch: false,
                    revealResults: true,  // reveal matching nodes
                }]);

                $.each(selectableNodes, function (index, item) {
                    if (item.pageNode.url == ('/' + currentInfo.username + '/' + currentInfo.sitename)) {
                        $('#newPageTreeId').treeview('selectNode', [item, {silent: false}]);
                        treeNode = item.pageNode;
                    }
                });
                $('#newPageTreeId').treeview('clearSearch');
            }
        }

        function initPageTemplates() {
            var url = "http://git.keepwork.com/api/v4/projects/6803/repository/files/official%2Ftemplate%2FpageTemplateConfig%2Emd?ref=master";
            var isShowLoading = true;
            $http({
                "method": "GET",
                "url": url
            }).then(function (result) {
                if (!result.data.content) {
                    return;
                }
                var content = Base64.decode(result.data.content),
                    md = markdownit(),
                    parserContent = md.parse(content)[0].content || "";
                try {
                    $scope.pageTemplates = angular.fromJson(parserContent);
                    $scope.activePageTemplate= $scope.pageTemplates[0];
                    $scope.websitePage.template = $scope.activePageTemplate.templates[0];
                } catch (e) {
                    console.log(e);
                }
            }, function () {

            });
        }

        //初始化
        function init() {
			if ($scope.hidePageTree) {
				treeNode = $scope.nowHoverPage.pageNode;
				var urls = treeNode.url.split("/").splice(2);
				$scope.routes = urls.join(" > ");
			} else {
				initTree();
			}
            initPageTemplates();
			//console.log(treeNode);
        }

        function isValidName() {
            $scope.errInfo = "";
            if (!treeNode) {
                $scope.errInfo = '请选择站点';
                return false;
            }

            if ($scope.websitePage.pagename === undefined || $scope.websitePage.pagename.length == 0) {
                $scope.errInfo = '请填写页面名';
                return false;
            }

             if (/\./.test($scope.websitePage.pagename)){
                 $scope.errInfo = '页面名不能包含 . ';
                 return false;
             }

			 //if (!/^[a-zA-Z0-9_]+$/.test($scope.websitePage.pagename)){
				 //$scope.errInfo = '页面名包含只支持数字、字母、下划线(_)';
				 //return false;
			 //}

            $scope.websitePage.url = treeNode.url + '/' + $scope.websitePage.pagename;
            $scope.websitePage.username = treeNode.username;
            $scope.websitePage.sitename = treeNode.sitename;
            $scope.websitePage.isModify = true;
            for (var key in allPageMap) {
                if (!allPageMap[key])
                    continue;

                var url1 = allPageMap[key].url + '/';
                var url2 = $scope.websitePage.url + '/';
                if (url1.indexOf(url2) == 0 || url2.indexOf(url1) == 0) {
                    $scope.errInfo = '页面路径已存在';
                    return false;
                }
            }

            return true;
        }

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.nextStep = function () {
            if (isValidName()){
                $scope.step++;
            }
        };

        $scope.prevStep = function () {
            $scope.step--;
        };

        $scope.getActiveStyleClass = function (pageTemplate) {
            return pageTemplate.name == $scope.activePageTemplate.name ? 'active' : '';
        };

        $scope.selectCategory = function (pageTemplate) {
            $scope.activePageTemplate = pageTemplate;
            $scope.websitePage.template = $scope.activePageTemplate.templates[0];
        };

        $scope.selectTemplate = function (template) {
            $scope.websitePage.template = template;
        };

         $scope.website_new = function () {
             if (isValidName()){
            currentPage = $scope.websitePage;
            $uibModalInstance.close("page");
        }
        }
    }]);//}}}

    app.registerController('fileCtrl', ['$scope', '$rootScope', '$http', '$uibModalInstance', function ($scope, $rootScope, $http, $uibModalInstance) {//{{{
        $scope.websiteFile= {};          //当前选中文件夹
        $scope.errInfo = "";             //错误提示
        var treeNode = undefined;        //目录节点

        $scope.$watch('$viewContentLoaded', init);

        //初始化
        function init() {
            treeNode=$scope.nowHoverFile.pageNode;
        }

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.file_new = function () {
            if ($scope.websiteFile.filename === undefined || $scope.websiteFile.filename.length == 0) {
                $scope.errInfo = '请填写文件名';
                return false;
            }

            if ($scope.websiteFile.filename.indexOf('.') >= 0) {
                $scope.errInfo = '文件名包含非法字符(.)';
                return false;
            }

            $scope.websiteFile.url = treeNode.url + '/' + $scope.websiteFile.filename + "/.gitignore";
            $scope.websiteFile.username = treeNode.username;
            $scope.websiteFile.sitename = treeNode.sitename;
			$scope.websiteFile.pagename = ".gitignore";
			//console.log($scope.websiteFile);
            $uibModalInstance.close($scope.websiteFile);

        }
    }]);//}}}

    app.registerController('wikiEditorController', ['$scope', '$rootScope', '$location', '$http', '$location', '$uibModal', 'Account', 'github', 'Message', 'modal', 'gitlab',
        function ($scope, $rootScope, $location, $http, $location, $uibModal, Account, github, Message, modal) {
            $(window).on("beforeunload", function (e) {//{{{
                if (currentPage.isModify) {
                    e = e || window.event;
                    var returnValue = '您的页面还未保存，需要手动保存';
                    e.returnValue = returnValue;
                    return returnValue;
                }
            });//}}}

            console.log("wikiEditorController");//{{{
            $rootScope.frameFooterExist = false;
            $rootScope.frameHeaderExist = false;
            $rootScope.userinfo = $rootScope.user;

            $scope.enableTransform = true;
            $scope.isEmptyObject = isEmptyObject;
            $scaleValue = "";
            $scope.scales = [
                {"id":0,"showValue": "45%", "scaleValue": "0.25"},
                {"id":1,"showValue": "50%", "scaleValue": "0.5"},
                {"id":2,"showValue": "75%", "scaleValue": "0.75"},
                {"id":3,"showValue": "100%", "scaleValue": "1"},
                {"id":4,"showValue": "实际大小", "scaleValue": "1", "special":true}
            ];
            $scope.showFile=true;
            $scope.showCode=true;
            $scope.showView=true;
            $scope.full=false;
            $scope.opens={};

            var fakeIconDom = [];
            var dropFiles = {};
            var isBigfileModalShow = false;
            var isConfirmDialogShow = false;
            var confirmFilesQue = [];
//}}}

            // 格式化html文本
            function formatHtmlView(cmd, value) {//{{{
                document.execCommand(cmd, false, value);
                currentRichTextObj && currentRichTextObj.focus();
            }//}}}

            // 删除本地indexDB记录 缓存5分钟(应该大于浏览器缓存时间), 解决浏览器缓存导致读取的不是最新内容问题
			// 刷新页面 会执行loadUnSavePage() 加载该内容 故getRawContent无需读indexdb
            function indexDBDeletePage(url, isDelay) {//{{{
                var urlParams = urlParamsMap[url] || {};
                urlParamsMap[url] = urlParams;
                urlParams.deleteTimer && clearTimeout(urlParams.deleteTimer);
				if (isDelay) {
					urlParams.deleteTimer = setTimeout(function () {
						storage.indexedDBDeleteItem(config.pageStoreName, url);
						urlParams.deleteTimer = undefined;
					}, 300 * 1000);
				} else {
					storage.indexedDBDeleteItem(config.pageStoreName, url);
					urlParams.deleteTimer = undefined;
				}
            }//}}}

            // 加载未提交到服务的页面
            function loadUnSavePage() {//{{{
				var currentTime = (new Date()).getTime();
                storage.indexedDBGet(config.pageStoreName, function (page) {
					if (!page.username || !page.sitename || !page.pagename || !page.url) {
						return;
					}
					
					//console.log(page);

                    var serverPage = getPageByUrl(page.url);
                    if (!serverPage) {
                        if (!getCurrentSite(page.username, page.sitename)) {
                            return;
                        }
                        serverPage = allPageMap[page.url] = page;
                    }

					//console.log(page)
                    if (!page.isModify) {   // 没有修改删除本地
						if (currentTime - (page.timestamp || 0) >= 300 * 1000) {
							indexDBDeletePage(page.url);
							return;
						} else {
							indexDBDeletePage(page.url, true);
						}
                    }

                    serverPage.isModify = page.isModify;
                    //console.log(page);
                    allWebstePageContent[page.url] = page.content;
                }, undefined, function () {
                    initTree();
                });
            }//}}}

            function loadSitePageInfo() { //{{{
                var _openPage = function () {
                    initTree();
                    openPage();
                };

                var fnList = [];

                // 获取自己的站点列表
                fnList.push(function (finish) {
                    if ($scope.user && $scope.user.username) {
                        // 获取用户所有站点
                        util.post(config.apiUrlPrefix + 'website/getAllByUsername', {username: $scope.user.username}, function (data) {
							for (var i = 0; i < (data || []).length; i++) {
								setSite(data[i]);
							}
                            finish && finish();
                        }, finish);
                    } else {
                        finish && finish();
                    }
                });

				// 获取自己可编辑的站点列表
				fnList.push(function(finish){
					if ($scope.user && $scope.user.username) {
						//util.post(config.apiUrlPrefix + "site_group/getByMemberName", {
						util.post(config.apiUrlPrefix + "site_user/getSiteListByMemberName", {
							memberName:$scope.user.username,
						}, function(data){
							data = data || [];
							for (var i = 0; i < data.length; i++) {
								if (isEmptyObject(data[i]) || !data[i].siteinfo || data[i].siteinfo.username == $scope.user.username) {
									continue;
								}
								data[i].siteinfo.isEditable = true;
								setSite(data[i].siteinfo);
							}
							finish && finish();
						}, finish);
					} else {
						finish && finish();
					}
				});

                // 获取他人站点列表
                fnList.push(function (finish) {
					var urlObj = storage.sessionStorageGetItem('urlObj'); 
					//console.log(urlObj);
					if (urlObj && $scope.user && $scope.user.username != urlObj.username && urlObj.sitename) {
						util.post(config.apiUrlPrefix + 'website/getWithDataSourceByName', {
							username:urlObj.username,
							sitename:urlObj.sitename,
						}, function (data) {
							if (data) {
								data.isReadable = true;
								//console.log(data);
								if (!getSite(data.username, data.name)) {
									setSite(data);
								}
							}
							
                            finish && finish();
                        }, finish);
                    } else {
                        finish && finish();
                    }
                });


                util.batchRun(fnList, function () {
					// 初始化其它站点的数据源
					var fnlist = [];
					// 自身数据源初始化完毕
					fnlist.push(function (finish) {
						dataSource.getUserDataSource($scope.user.username).registerInitFinishCallback(finish);
					});
					// 其它数据源初始化完毕
					for (var key in allSiteMap) {
						var tempSiteinfo = allSiteMap[key];
						if (tempSiteinfo.username == $scope.user.username) {
							continue;
						}
						fnlist.push((function(siteinfo){
							return function(finish) {
								siteinfo.dataSource.isInited = true;
								Account.setDataSourceToken(siteinfo.dataSource);
								//console.log(siteinfo.dataSource);
								dataSource.registerDataSource(siteinfo.dataSource, finish, finish);
							}
						})(tempSiteinfo));
					}
					util.batchRun(fnlist, function() {
						//初始化本地数据库indexDB
						storage.indexedDBRegisterOpenCallback( function () {
							loadUnSavePage();
							_openPage();
						});
					});
                });
            }//}}}

            // 用户是否存在
            function isUserExist() {//{{{
                if ($scope.user && $scope.user.username) {
                    return true;
                }
                return false;
            }

            // 其它用户是否存在
            function isOtherUserExist() {
                if (otherUserinfo && otherUserinfo.username) {
                    return true;
                }
                return false;
            }

            // 通过用户名获取treeID
            function getTreeId(username, sitename) {
				var siteinfo = getSite(username, sitename);
				if (!siteinfo) {
					return "myTree";
				}
			
				if (siteinfo.isEditable) {
					return "#editableTree";
				} else if (siteinfo.isReadable) {
					return "#readableTree";
				}
                return '#myTree';
            }

            // 通过用户名获取userinfo
            function getUserinfo(username) {
                if (isUserExist() && $scope.user.username == username) {
                    return $scope.user;
                }

                if (isOtherUserExist() && otherUserinfo.username == username) {
                    return otherUserinfo;
                }
                //console.log("get tree info errors:", username);
                return $scope.user || otherUserinfo;
            }

			// 是否是用户自己的页面
			function isSelfPage() {
				if (!isUserExist() || isEmptyObject(currentPage) || $scope.user.username != currentPage.username) {
					return false;
				}
				return true;
			}
//}}}
            //初始化，读取用户站点列表及页面列表
            function init() {//{{{
                //console.log('---------------init---------------');
                initEditor();

				// 加载站点列表
				loadSitePageInfo();
            }//}}}

			$scope.$watch('$viewContentLoaded', function(){//{{{
				Account.getUser(function(userinfo){
					$scope.user = userinfo;
					init();
				}, init);
			});//}}}
            //init();

			// 更新提交id
			function updateLastCommitId(siteDataSource, page) {//{{{
				siteDataSource.getLastCommitId(function(lastCommitId){
					siteDataSource.setLastCommitId(lastCommitId);
					util.post(config.apiUrlPrefix + "site_data_source/updateLastCommitIdByName", {
						username:page.username, 
						sitename:page.sitename,
						lastCommitId:lastCommitId,
					}, undefined, undefined, false);
				}, undefined, false);
			}//}}}


			// 提交至搜索引擎
			function submitToSearchEngine(page) {//{{{
				var params = {
					url:page.url,
					access_url:window.location.origin + page.url,
					data_source_url:"",
					tags:"",
					//logoUrl:"",
					commit_id:"master",
					content:page.content,
					user_name:page.username,
					site_name:page.sitename,
					page_name:page.pagename,
					pageinfo:page,
				};
				
				// 私有项目不提交
                //var site = getCurrentSite(page.username, page.sitename);
                //if (site && site.visibility == "private") {
					//params.visibility = "private";
					//return; 
                //}

				util.post(config.apiUrlPrefix + "elastic_search/submitPageinfo", params);

				//var url = "http://221.0.111.131:19001/Application/kwupsert";
				//util.ajax({    
                    //type: "POST",                   
                    //url: url,  
                    //data: obj, 
                    //success: function(result) {     
                        //console.log(result);            
                    //},         
                    //error: function(response) {     
                    //},         
                //});  
			}//}}}

			// 生成页面快照
			function makeSnapshot(currentDataSource, page) {//{{{
				var containerId = mdwiki.getMdWikiContainerId();

				setTimeout(function() {
					html2canvas(document.getElementById(containerId),{
						height:300,
						width:300,

						onrendered:function(canvas) {
							if (!currentDataSource || !currentPage || !page || page.url != currentPage.url) {
								return;
							}
							var imgDataURI = canvas.toDataURL('image/png');
							//console.log(imgDataURI);
							currentDataSource.uploadImage({
								path:page.url,
								content:imgDataURI,
							});
						},
					});
				}, 5000);
			}//}}}

            // 保存页
            function savePageContent(cb, errcb) {//{{{
                //console.log(currentPage);
                // 不能修改别人页面
                if (!isUserExist() || isEmptyObject(currentPage) || !currentPage.isModify) {
                    cb && cb();
                    return;
                }

                var currentDataSource = getCurrentDataSource();
                var page = angular.copy(currentPage);
                console.log(currentPage);
                var content = page.content || editor.getValue();
				page.timestamp = (new Date()).getTime();
				page.content = content;
                var saveFailedCB = function () {
                    page.isModify = true;
                    storage.indexedDBSetItem(config.pageStoreName, page);
                    console.log("---------save failed-------");
                    errcb && errcb();
                };
                var saveSuccessCB = function () {
                    page.isModify = false;
					page.isConflict = false;
					page.blobId = undefined;
					//page.content = undefined;
                    storage.indexedDBSetItem(config.pageStoreName, page);
					storage.sessionStorageRemoveItem(page.url);
                    indexDBDeletePage(page.url, true);
                    console.log("---------save success-------");
					updateLastCommitId(currentDataSource, page);
                    cb && cb();
                };

                config.services.realnameVerifyModal().then(doSavePageContent).catch(saveFailedCB);

                function doSavePageContent() {
                    //makeSnapshot(currentDataSource, page);
                    currentSite = getCurrentSite(page.username, page.sitename);
                    if (currentSite) {
                        page.visibility = currentSite.visibility || "public";
                        util.post(config.apiUrlPrefix + 'website/updateWebsitePageinfo', page);
                    }

                    //console.log(currentSite);
                    page.visibility = page.visibility || "public";
                    submitToSearchEngine(page);

                    currentDataSource.writeFile({
                        path: page.url + pageSuffixName,
                        content: content
                    }, saveSuccessCB, saveFailedCB);
                }
            }//}}}


            $scope.$on("changeEditorPage", function (event, urlObj) {//{{{
				//console.log(urlObj);
				if ((!urlObj) || (currentPage && currentPage.url == urlObj.url)) {
					return;
				}
				//return;
                renderAutoSave(function () {
                    openUrlPage(urlObj);
                }, function () {
                    openUrlPage(urlObj);
                });
            });//}}}

            // 获取站k点文件列表
            function getSitePageList(params, cb, errcb) {//{{{
				//console.log(params);
                var currentDataSource = dataSource.getDataSource(params.username, params.sitename);
                if (!currentDataSource) {
                    console.log("current data source unset!!!");
                    return;
                }

                if (!pagelistMap[params.path]) {
                    currentDataSource.getTree({recursive:true, path: params.path},function (data) {
                        for (var i = 0; i < data.length; i++) {
                            if (!allPageMap[data[i].url]) {
                                allPageMap[data[i].url] = data[i];
							} else {
								var page = allPageMap[data[i].url];
								if (page.blobId && page.blobId != data[i].blobId) {
									page.isConflict = true;
								}
								page.blobId = data[i].blobId;
							}
                        }
                        pagelistMap[params.path] = data;
                        initTree();
                        cb && cb();
                        //console.log(data);
                    },function () {
                        console.log("get pagelist failed!!!");
                        errcb && errcb();
                    });
                } else {
                    cb && cb();
                }
            }//}}}

            var openTempFile = function () {//{{{
                var tempContent = storage.localStorageGetItem("wikiEditorTempContent") || "edit temp file";
                editor.setValue(tempContent);
                storage.localStorageRemoveItem("wikiEditorTempContent");

                currentPage = undefined;
                $('#btUrl').val("temp file");
            }

            // 打开url页
            function openUrlPage(urlObj) {
                urlObj = urlObj || storage.sessionStorageGetItem('urlObj') || {};
                storage.sessionStorageRemoveItem('urlObj');
				//console.log(urlObj);

                var username = urlObj.username;
                var sitename = urlObj.sitename;
                var pagename = urlObj.pagename || 'index';
                var pagepath = urlObj.pagepath || ('/' + username + '/' + sitename + '/' + pagename);
                var url = urlObj.url || pagepath;
                if (!username || !sitename) {
                    openTempFile();
                    return;
                }
                currentPage = getPageByUrl(url);
                currentSite = getCurrentSite(username, sitename);
				//console.log(currentPage);
                var _openUrlPage = function () {
                    currentPage = getPageByUrl(url);
                    //console.log(url, pagepath, urlObj);
                    if (currentPage) {
                        currentSite = getCurrentSite();
                        openPage();
                        return;
                    }
					// 访问其它人不存在页面不新建
					if (username != $scope.user.username) {
						openTempFile();
						return;
					}
                    // 不存在 不新建
                    //if (!currentPage && pagename[0] != '_') {
                    //    var url = '/' + username + '/' + sitename;
                    //    for (var key in allPageMap) {
                    //        if (key.indexOf(url) >= 0) {
                    //            currentPage = allPageMap[key];
                    //            currentSite = getCurrentSite();
                    //            openPage();
                    //            return;
                    //        }
                    //    }

                    //    if (!currentPage) {
                    //        openTempFile();
                    //        return;
                    //    }
                    //}

                    // 新建
                    var page = {};
                    page.url = url;
                    page.username = username;
                    page.sitename = sitename;
                    page.pagename = pagename;
                    page.isModify = true;
                    currentPage = page;
                    currentSite = getCurrentSite();
                    //console.log(currentPage);
                    allPageMap[page.url] = page;
                    allWebstePageContent[page.url] = "";
                    initTree();
                    openPage();
                }

                // 获取站点页列表
                getSitePageList({path:"/" + username + '/' +  sitename, username:username, sitename:sitename}, function () {
                    _openUrlPage();
                });
            }//}}}

			// 添加到打开列表
			function addOpenList(page) {//{{{
				setTimeout(function(){
					var pageNode = treeNodeMap[page.url] && treeNodeMap[page.url].pageNode;
					//console.log(pageNode);
					if (!pageNode || !pageNode.isLeaf) {
						return;
					}
					page.itemId = page.itemId || page.url.split("/").join("");
					$scope.opens[page.url]= page;
					util.$apply();
					//取消当前已选择
					setTimeout(function(){
						var nowActive=$("#openedTree .node-selected");
						nowActive.removeClass("node-selected");
						$("#"+page.itemId).addClass("node-selected");
					}, 10);
				});
			}//}}}

            //已打开列表树中打开网页编辑
            $scope.clickOpenPage = function (page) {//{{{
				if (!isEmptyObject(currentPage) && currentPage.url == page.url) {
					return;
				}

                renderAutoSave(function () {
					currentPage = getPageByUrl(page.url);
					currentSite = getCurrentSite();
					openPage();
					editor.focus();
                });
            };//}}}

            // 打开页
            function openPage() {//{{{
                if (!currentPage) {
                    openUrlPage();
                    return;
                }


                //console.log(currentPage);
                // 设置全局用户页信息和站点信息
                $rootScope.userinfo = getUserinfo(currentPage.username);
                $rootScope.siteinfo = currentSite;
                $rootScope.pageinfo = currentPage;
                $rootScope.tplinfo = getPageByUrl('/' + currentPage.username + '/' + currentPage.sitename + '/_theme');
                // 保存正在编辑的页面urlObj
                storage.sessionStorageSetItem('urlObj', {
                    username: currentPage.username,
                    sitename: currentPage.sitename,
                    pagepath: currentPage.pagepath,
                    pagename: currentPage.pagename,
                    url:currentPage.url,
                });
				!config.islocalWinEnv() && (window.location.href="/wiki/wikieditor#"+currentPage.url);

                function setEditorValue(page, content) {
                    page.isFirstEditor = true;
                    //console.log(currentPage);
                    if (!editorDocMap[page.url]) {
                        editorDocMap[page.url] = CodeMirror.Doc(content, 'markdown');
                    }
                    editor.swapDoc(editorDocMap[page.url]);
					//console.log(currentPage);
					page.content = content;
					editor.setValue(content);
                    CodeMirror.signal(editor, 'change', editor);

                    // 折叠wiki命令
					//for (var i = editor.firstLine(), e = editor.lastLine(); i <= e; i++) {
						//var lineValue = editor.getLine(i);
						//if (lineValue.indexOf('```@') == 0 || lineValue.indexOf('```/') == 0) {
							//editor.foldCode(CodeMirror.Pos(i, 0), null, "fold");
						//}
					//}

					// 打开currentPage
					addOpenList(page);

					// init tree user settimeout(function(){}, 0)
					setTimeout(function() {
						//getSitePageList({path:page.url, username:page.username, sitename:page.sitename});

						$('#btUrl').val(window.location.origin + page.url);
						var treeNode = treeNodeMap[page.url];
						var treeid = getTreeId(page.username, page.sitename);
						//console.log(treeid, treeNodeMap, page);
						if (treeNode) {
							$(treeid).treeview('selectNode', [treeNode.nodeId, {silent: true}]);
							while (treeNode.parentId != undefined){
								treeNode = $(treeid).treeview('getNode', treeNode.parentId);
								if (!treeNode.state.expanded) {
									$(treeid).treeview('expandNode', [treeNode, {levels: 10, silent: false}]);
								}
							};
						}
					}, 10);
                }

				var page = currentPage;
				//console.log(page);
                dataSource.getUserDataSource($scope.user.username).registerInitFinishCallback(function () {
					var callback = function(page, content) {
						content = content || "";
                        allWebstePageContent[page.url] = content;
                        if (isEmptyObject(currentPage)) {
                            openTempFile();
                            return;
                        }
						if (currentPage.url != page.url) {
							return ;	
						}

						var moduleEditorParams = config.shareMap.moduleEditorParams;
						moduleEditorParams.show_type = "knowledge";
						moduleEditorParams.setKnowledge("");
                        setEditorValue(page, content);
					}
                    getCurrentPageContent(page, function (data) {
						callback(page, data);
                    }, function () {
						callback(page, "");
                    });
                });
            }//}}}

            // 获得页面内容
            function getCurrentPageContent(page, cb, errcb) {//{{{
                if (isEmptyObject(page)) {
                    errcb && errcb();
                    return;
                }
                //console.log(allWebstePageContent);
                var url = page.url;
                //console.log("-----------getPageContent-------------", url, currentPage, allWebstePageContent);
                if (allWebstePageContent[url] != undefined) {
                    //console.log(allWebstePageContent[url]);
                    cb && cb(allWebstePageContent[url]);
                } else {
                    var currentDataSource = dataSource.getDataSource(page.username, page.sitename);
                    //console.log(currentDataSource);
                    if (currentDataSource) {
                        //currentDataSource.getRawContent({path: url + pageSuffixName}, function (data) {
                        currentDataSource.getFile({path: url + pageSuffixName}, function (data) {
                            //console.log(data);
                            cb && cb(data.content);
							currentDataSource.getSingleCommit({sha:data.last_commit_id}, function(data){
								page.committer_name = data.committer_name;
								page.committed_date = data.committed_date;
							})
                        }, errcb);
                    } else {
                        //console.log("----------data source uninit-------------");
                        errcb && errcb();
                    }
                }
            }//}}}

            //初始化目录树  data:  $.parseJSON(getTree()),
            function initTree() {//{{{
                //console.log('@initTree');
                setTimeout(function () {
                    var isFirstCollapsedAll = true;
                    var treeview = {
                        color: "#3977AD",
                        selectedBackColor: "#3977AD",
                        onhoverColor:"#E6E6E6",
                        expandIcon:"fa fa-chevron-right",
                        collapseIcon:"fa fa-chevron-down",
                        showBorder: false,
                        enableLinks: false,
                        levels: 10,
                        showTags: true,
						data:[],
                        //data: getTreeData($scope.user.username, allPageMap, false),
                        onNodeSelected: function (event, data) {
							//console.log(data.pageNode);
                            //console.log("---------onNodeSelected----------");
                            var treeid = getTreeId(data.pageNode.username, data.pageNode.sitename);
                            if (data.pageNode.isLeaf) {
                                if (currentPage && data.pageNode.url != currentPage.url) {
                                    $(getTreeId(currentPage.username, currentPage.sitename)).treeview('unselectNode', [treeNodeMap[currentPage.url].nodeId, {silent: true}]);
                                }

                            } else {
                                $(treeid).treeview('unselectNode', [data.nodeId, {silent: true}]);
                                $(treeid).treeview('toggleNodeExpanded', [ data.nodeId, { silent: true } ]);
                                if (treeNodeExpandedMap[data.pageNode.url]) {
                                    treeNodeExpandedMap[data.pageNode.url] = false;
                                } else {
                                    treeNodeExpandedMap[data.pageNode.url] = true;
                                }
                                getSitePageList({path:data.pageNode.url, username:data.pageNode.username, sitename:data.pageNode.sitename});
                                //console.log("--------------");
                            }
                            renderAutoSave(function () {
                                if (data.pageNode.isLeaf) {
                                    //console.log("--------------------auto save--------------------");
                                    if (!currentPage || currentPage.url != data.pageNode.url) {
                                        currentPage = getPageByUrl(data.pageNode.url);
                                        currentSite = getCurrentSite();
                                        openPage();
                                    }
                                    editor.focus();
                                }
                            }, function () {
                                Message.warning("自动保存失败");
                                openPage();
                            });
                        },
                        onNodeUnselected: function (event, data) {
                            // 不取消自己
                            //console.log("---------onNodeUnselected----------");
                            var treeid = getTreeId(data.pageNode.username, data.pageNode.sitename);
                            if (currentPage && data.pageNode.url == currentPage.url) {
                                $(treeid).treeview('selectNode', [treeNodeMap[currentPage.url].nodeId, {silent: true}]);
                            }
                        },
                        onNodeCollapsed: function (event, data) {
                            //console.log("node collapsed", data.pageNode.url);
							
                            treeNodeMap[data.pageNode.url] = data;
                            if (!isFirstCollapsedAll) {
                                delete treeNodeExpandedMap[data.pageNode.url];
                                //console.log(treeNodeExpandedMap);
                            }
                            for (var i = 0; data.nodes && i < data.nodes.length; i++) {
                                var node = data.nodes[i];
                                treeNodeMap[node.pageNode.url] = node;
                            }
                            //console.log("------------------");
                        },
                        onNodeExpanded: function (event, data) {
                            //console.log(treeNodeExpandedMap);
                            //console.log("node expand",data.pageNode.url);
                            treeNodeExpandedMap[data.pageNode.url] = true;
                            getSitePageList({path:data.pageNode.url, username:data.pageNode.username, sitename:data.pageNode.sitename});
                        },
                    };

					var myTree = angular.copy(treeview);
					var readableTree = angular.copy(treeview);
					var editableTree = angular.copy(treeview);

					//console.log(allPageMap);
					for (var key in allSiteMap) {
						var siteinfo = allSiteMap[key];
						if (siteinfo.isEditable) {
							editableTree.data = (editableTree.data || []).concat(getTreeData(siteinfo.username, siteinfo.name, allPageMap, false));
						} else if (siteinfo.isReadable) {
							readableTree.data = (readableTree.data || []).concat(getTreeData(siteinfo.username, siteinfo.name, allPageMap, false));
						} else {
							myTree.data = (myTree.data || []).concat(getTreeData(siteinfo.username, siteinfo.name, allPageMap, false));
						}
					}

					$('#myTree').treeview(myTree);
					$('#myTree').treeview('collapseAll', {silent: false});

					$('#editableTree').treeview(editableTree);
					$('#editableTree').treeview('collapseAll', {silent: false});

					$('#readableTree').treeview(readableTree);
					$('#readableTree').treeview('collapseAll', {silent: false});
					
					//console.log(treeNodeMap);
                    isFirstCollapsedAll = false;
                    for (var key in treeNodeExpandedMap) {
						var node = treeNodeMap[key];
                        //console.log(key, treeNodeMap[key]);
						if (!node) {
							continue;
						}
                        var treeid = getTreeId(node.pageNode.username, node.pageNode.sitename);
						//console.log(treeid, node.pageNode.username, node.pageNode.sitename);
                        treeNodeMap[key] && $(treeid).treeview('expandNode', [treeNodeMap[key].nodeId, {levels: 10, silent: true}]);
                    }
                });
            }//}}}

            //命令处理函数
            function command() {//{{{
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
            }//}}}


            $scope.openWikiBlock = function (insertLine, type) {//{{{
                $scope.insertMod = {
                    "insertLine": insertLine,
                    "type": type
                };
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
                        return lines.slice(0, startPos + 1).join('\n') + '\n' + paramsText + '\n' + lines.slice(endPos).join('\n');
                    }
                }

                modal('controller/wikiBlockController', {
                    controller: 'wikiBlockController',
                    size: 'lg',
                    backdrop:true
                }, function (wikiBlock) {
                    var wikiBlockContent = formatWikiCmd(wikiBlock.content);
                    var cursor = editor.getCursor();
                    var toInsertLine = ($scope.insertMod.insertLine >= 0) ? $scope.insertMod.insertLine : cursor.line;
                    var content = editor.getLine(toInsertLine);
                    wikiBlockContent = '\n' + wikiBlockContent + '\n';
                    editor.replaceRange(wikiBlockContent, {
                        "line": toInsertLine,
                        "ch": 0
                    });
                }, function (result) {
                    console.log(result);
                });
            }//}}}

            $rootScope.insertMod = function(type){
                var moduleEditorParams = config.shareMap.moduleEditorParams || {};
                var modPositon = moduleEditorParams.wikiBlock.blockCache.block.textPosition;
                if (type == "before") {
                    $scope.openWikiBlock(modPositon.from, type);
                }else {
                    $scope.openWikiBlock(modPositon.to, type);
                }
            }

            $scope.openGitFile = function () {//{{{
                if (!currentPage || !currentPage.url) {
                    return;
                }

                var currentDataSource = getCurrentDataSource();
                if (currentDataSource) {
                    if (currentDataSource.getDataSourceType() == "github") {
                        currentDataSource.getFile({path: currentPage.url + pageSuffixName}, function (data) {
                            //console.log(data);
                            window.open(data.html_url);
                        });
                    } else {
                        window.open(currentDataSource.getContentUrlPrefix({path: currentPage.url + pageSuffixName, sha:"master"}));
                    }
                }
            }//}}}

            function getPageTemplateContent(pageUrl, contentUrl) {
                var url = "http://git.keepwork.com/api/v4/projects/6803/repository/files/" + encodeURI(contentUrl) + "?ref=master";
                $http({
                    "method": "GET",
                    "url": url
                }).then(function (result) {
                    if (!result.data.content) {
                        return;
                    }
                    var content = Base64.decode(result.data.content)
                    try {
                        allWebstePageContent[pageUrl] = content;
                    } catch (e) {
                        console.log(e);
                    }
                    openPage(false);
                }, function () {

                });
            }

            $scope.cmd_newpage = function (hidePageTree, url, event) {//{{{
				if (hidePageTree && !treeNodeMap[url]) {
					return;
				}
                $scope.hidePageTree=hidePageTree ? true : false;
                if (hidePageTree){
                    $scope.nowHoverPage=treeNodeMap[url];
                }
                function openNewPage() {
                    $uibModal.open({
                        //templateUrl: WIKI_WEBROOT+ "html/editorNewPage.html",   // WIKI_WEBROOT 为后端变量前端不能用
                        templateUrl: config.htmlPath + "editorNewPage.html",
                        controller: "pageCtrl",
                        size: (hidePageTree? "lg":"sm"),
                        scope: $scope
                    }).result.then(function (provider) {
                        if (provider == "page") {
                            getPageTemplateContent(currentPage.url, currentPage.template.contentUrl);
                            allPageMap[currentPage.url] = currentPage;
                            currentSite = getCurrentSite();
                            initTree();
                        }
                    }, function (text, error) {
                        return;
                    });
                }

                savePageContent(function () {
                    //Message.warning("自动保存成功");
                    openNewPage();
                }, function () {
                    Message.warning("自动保存失败");
                    openNewPage();
                });
                event && event.stopPropagation();
            };//}}}

            //保存页面
            $scope.cmd_savepage = function (cb, errcb) {//{{{
                if (!isEmptyObject(currentPage)) {//修改
                    var _currentPage = currentPage;    // 防止保存过程中 currentPage变量被修改导致保存错误
                    savePageContent(function () {
                        _currentPage.isModify = false;
						_currentPage.isConflict = false;
						_currentPage.blobId = undefined;
                        initTree();
                        cb && cb();
                        Message.info("文件保存成功");
                    }, function () {
                        errcb && errcb();
                        Message.danger("文件保存失败");
                    });
                } else {
                    storage.localStorageSetItem("wikiEditorTempContent", editor.getValue());
					errcb && errcb();
                    // $uibModal.open({
                    //     //templateUrl: WIKI_WEBROOT+ "html/editorNewPage.html",   // WIKI_WEBROOT 为后端变量前端不能用
                    //     templateUrl: config.htmlPath + "editorNewPage.html",
                    //     controller: "pageCtrl",
                    // }).result.then(function (provider) {
                    //     //console.log(provider);
                    //     if (provider == "page") 
                    //         //console.log(currentPage);
                    //         allPageMap[currentPage.url] = currentPage;
                    //         allWebstePageContent[currentPage.url] = editor.getValue();
                    //         $scope.cmd_savepage(function () {
                    //             openPage();
                    //             storage.localStorageRemoveItem("wikiEditorTempContent");
                    //         });
                    //     }
                    // }, function (text, error) {
                    //     return;
                    // });
                }
            }//}}}

            //删除
            $scope.cmd_remove = function (url) {//{{{
				var page = getPageByUrl(url);
				if (!page) {
					return;
				}
				var titleInfo = "> " + page.url.split("/").splice(2).join(" > ");

				config.services.confirmDialog({
				    "title": "删除提醒",
                    "titleInfo": titleInfo,
                    "theme": "danger",
                    "confirmBtnClass": "btn-danger",
                    "content": "确定删除 " + page.pagename + " 页面？"
                },function () {
				    if (!isEmptyObject(page)) {
                        var currentDataSource = dataSource.getDataSource(page.username, page.sitename);

                        currentDataSource && currentDataSource.deleteFile({path: page.url + pageSuffixName}, function () {
                            console.log("删除文件成功:");
                        }, function (response) {
                            console.log("删除文件失败:");
                        });

                        storage.indexedDBDeleteItem(config.pageStoreName, page.url);

                        delete allPageMap[page.url];
                        delete $scope.opens[page.url];
                        storage.sessionStorageRemoveItem('urlObj');
                        if (currentPage.url == page.url) {
                            currentPage = undefined;
                            initTree();
                            openPage();
                        }
                    }
                });
            };//}}}

            //关闭
            $scope.cmd_close = function (url) {//{{{
				var page = $scope.opens[url];
				if (!page) {
					return;
				}
				var result = false;
                if (page.isModify){
                    result=window.confirm("当前有修改未保存，确定关闭？");
                }

                if(!page.isModify || result){
					delete $scope.opens[url];
					if (!isEmptyObject(currentPage) && currentPage.url != url) {
						return;
					}
					storage.sessionStorageRemoveItem('urlObj');
					currentPage = undefined;
					for (var url in $scope.opens){
						currentPage = $scope.opens[url];
					}
                    openPage();
                }
            };//}}}

            //关闭全部已打开
            $scope.cmd_closeAll = function (url) {//{{{
				console.log(url);
				url = url || "";
                for (key in $scope.opens){
					if (key.indexOf(url) >= 0) {
						$scope.cmd_close(key);
					}
                }
            };//}}}

            $scope.cmd_goSetting = function (urlKey, event) {//{{{
                var website = allSiteMap[urlKey];
                console.log(website);
                event && event.stopPropagation();
                storage.sessionStorageSetItem('userCenterContentType', 'editWebsite');
                storage.sessionStorageSetItem("editWebsiteParams", website);
                util.go("userCenter", true);
                util.html('#userCenterSubPage', editWebsiteHtmlContent);
            };//}}}

            $scope.goSetting = function (sitename) {//{{{
                // console.log();
                storage.sessionStorageSetItem("urlObj",{username:$scope.user.username, sitename:sitename});
                util.go('wikieditor');
            };//}}}

            $scope.cmd_saveAll = function () {//{{{
                var tempCurrentPage=currentPage; 
				var fnList = [];
				var callback = undefined;
                for (url in $scope.opens){
					callback = (function(url){
						return function(cb, errcb) {
							currentPage=$scope.opens[url];
							$scope.cmd_savepage(function () {
								allPageMap[url].isModify=false;
								allPageMap[url].isConflict=false;
								allPageMap[url].blobId=undefined;
								cb && cb();
							}, errcb);
						}
					})(url);
					fnList.push(callback);
                }

				//console.log($scope.opens);
				//console.log(fnList);
				callback = function(){
					initTree();
					currentPage=tempCurrentPage;
				}
				
				util.batchRun(fnList, function(){
                    callback();
                    console.log("全部保存结束");
				});
            };//}}}

            //刷新
            $scope.cmd_refresh = function (url) {//{{{
				var page = getPageByUrl(url);
				//console.log(page);
				if (!page) {
					return ;
				}
				var siteDataSource = dataSource.getDataSource(page.username, page.sitename);
				if (!siteDataSource){
					return ;
				}
				siteDataSource.getRawContent({path:url + pageSuffixName, sha:"master", ref:"master"}, function (data) {
					var content = data || "";
					allWebstePageContent[url] = content;
					page.isConflict = false;
					page.isModify = false;
					page.blobId = undefined;
					page.content = content;                                    // 更新内容
					page.timestamp = (new Date()).getTime();                   // 更新时间戳
					storage.indexedDBSetItem(config.pageStoreName, page);      // 每次改动本地保存
					initTree();
					if (!isEmptyObject(currentPage) && url == currentPage.url) {
						//console.log("---------");
						openPage();
					}
				});
            };//}}}

            //新建文件夹
            $scope.cmd_newFile = function (hidePageTree, url, event) {//{{{
				if (!treeNodeMap[url]) {
					return;
				}
                $scope.hidePageTree=hidePageTree ? true : false;
                if (hidePageTree){
                    $scope.nowHoverFile=treeNodeMap[url];
                }
				$uibModal.open({
					//templateUrl: WIKI_WEBROOT+ "html/editorNewPage.html",   // WIKI_WEBROOT 为后端变量前端不能用
					templateUrl: config.htmlPath + "editorNewFile.html",
					controller: "fileCtrl",
					scope: $scope
				}).result.then(function (websiteFile) {
                    var path = websiteFile.url + config.pageSuffixName;
                    var currentDataSource = dataSource.getDataSource(websiteFile.username, websiteFile.sitename);
                    if (!currentDataSource) {
                        console.log(websiteFile);
                    } else {
                        currentDataSource.writeFile({path:path, content:"占位文件"}, function(){
                            console.log("创建成功");
                            initTree();
                            allPageMap[websiteFile.url] = angular.copy(websiteFile);
                            //console.log(allPageMap);
                        }, function() {
                            console.log("创建失败");
                        });
                    }
				}, function (text, error) {
					return;
				});
                event && event.stopPropagation();
            };//}}}

            //撤销
            $scope.cmd_undo = function () { //{{{
                if (isHTMLViewEditor) {
                    formatHtmlView('undo');
                    return;
                }
                editor.undo();
                editor.focus();
            }

            //重做
            $scope.cmd_redo = function () {
                if (isHTMLViewEditor) {
                    formatHtmlView('redo');
                    return;
                }
                editor.redo();
                editor.focus();
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
                if (isHTMLViewEditor) {
                    formatHtmlView("formatblock", 'H' + level);
                    return;
                }
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
                editor.focus();
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
                //console.log(isHTMLViewEditor);
                if (isHTMLViewEditor) {
                    formatHtmlView('bold');
                    return;
                }
                font_style('**');
            }

            //斜体
            $scope.cmd_italic = function () {
                if (isHTMLViewEditor) {
                    formatHtmlView('italic');
                    return;
                }
                font_style('*');
            }

            //下划线
            $scope.cmd_underline = function () {
                if (isHTMLViewEditor) {
                    formatHtmlView('underline');
                    return;
                }
            }

            //下划线
            $scope.cmd_strikethrough = function () {
                if (isHTMLViewEditor) {
                    formatHtmlView('strikethrough');
                    return;
                }
                font_style('~~');
            }

            //上标
            $scope.cmd_superscript = function () {
                if (isHTMLViewEditor) {
                    formatHtmlView('superscript');
                    return;
                }
                font_style('^');
            }

            //下标
            $scope.cmd_subscript = function () {
                if (isHTMLViewEditor) {
                    formatHtmlView('subscript');
                    return;
                }
                font_style('~');
            }

            //有序列表
            $scope.cmd_listol = function () {
                if (isHTMLViewEditor) {
                    formatHtmlView('insertorderedlist');
                    return;
                }

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
            };

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
                if (isHTMLViewEditor) {
                    formatHtmlView('insertunorderedlist');
                    return;
                }
                hol_keyword('- ');
            }

            //引用内容
            $scope.cmd_blockqote = function () {
                if (isHTMLViewEditor) {
                    formatHtmlView('formatblock', 'blockquote');
                    return;
                }

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
                editor.setCursor(CodeMirror.Pos(cursor.line + 2, 0));
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
                        /*
                         if (isHTMLViewEditor) {
                         formatHtmlView('createlink', link);
                         return;
                         }
                         */
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

            //视频
            $scope.cmd_video=function () {
                $uibModal.open({
                    templateUrl: config.htmlPath + "editorInsertVideo.html",
                    controller: "videoCtrl",
                }).result.then(function (result) {
					console.log(result);
                    if (result) {
						var videoContent = "";
						if (result.isNetUrl) {
							videoContent = '```@wiki/js/video\n{\n\t"videoUrl":"' + result.url + '"\n}\n```';

						} else {
							videoContent = '['+ result.filename +'](' + result.url + ')';
						}
						editor.replaceSelection(videoContent);
						editor.focus();
                    }
                });
            };

            var bigfileModal;
            // 大文件
            $scope.cmd_bigfile = function () {
                bigfileModal = $uibModal.open({
                    "template": bigfileContent,
                    "size": "lg",
                    "controller": "bigfileController",
                    "backdrop": "static"
                });
                bigfileModal.result.then(function (wikiBlock) {
                    isBigfileModalShow = false;
                    console.log(wikiBlock);
                }, function (files) {
                    isBigfileModalShow = false;
                    if (!files){
                        return;
                    }

                    var insertContent = "";
                    console.log(files);
                    if (files.pasteUrl){
                        insertContent = files.pasteUrl;
                    } else if (files.url){
                        insertContent += '```@wiki/js/bigfile\n{\n\t"fileType":"' + files.type + '",\n"fileUrl":"'+files.url+'"\n}\n```\n';
                    }else{
                        files.map(function (file) {
                            insertContent += '```@wiki/js/bigfile\n{\n\t"fileId":"' + file._id + '","fileType":"'+file.file.type+'",\n"extraMsg":"'+file.filename+'","channel":"qiniu"\n}\n```\n';
                        });
                    }

                    editor.replaceSelection(insertContent);
                    editor.focus();
                });
            };
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
            } //}}}

            // 整行替换，不自动获取焦点
            var line_keyword_nofocus = function (lineNo, content) {
                var originContent = editor.getLine(lineNo);
                var offsetX = originContent && originContent.length;
                editor.replaceRange(content, CodeMirror.Pos(lineNo, 0), CodeMirror.Pos(lineNo, offsetX));
            };

            var setBigfileValue = function () {
                for (var url in dropFiles){
                    var file = dropFiles[url];
                    var editorContent = editor.getLine(file.insertLinum);
                    if (editorContent == file.name){
                        if (!file._id){ // 文件上传到七牛，但是没有上传到数据库
                            setTimeout(function () {
                                setBigfileValue();
                            }, 500);
                            return;
                        }
                        var insertContent = '```@wiki/js/bigfile\n{\n\t"fileId":"' + file._id + '","fileType":"'+file.type+'",\n"extraMsg":"'+file.name+'","channel":"qiniu"\n}\n```\n';
                        line_keyword_nofocus(file.insertLinum, insertContent);
                    }
                }
            };

			// 文件上传
			$scope.cmd_file_upload = function(fileObj, cb) {//{{{
                const UpperLimit = 10 * 1024 * 1024; // 大于10M上传到七牛
                const BrowerUpperLimit = 1 * 1024 * 1024 * 1024; // 大于1GB提示
                var currentDataSource = getCurrentDataSource();
                if (!currentDataSource) {
					Message.info("无法获取数据源信息，稍后重试....");
					return;
                }
                var qiniuBack;

				var path = fileObj.name;
				
				var initQiniu = function () {
				    if (qiniuBack){
				        return;
                    }
                    var qiniu = new QiniuJsSDK();
                    var option = {
                        "browse_button":"qiniuUploadBtn",
                        "unique_names": true,
                        "auto_start": false,
                        "uptoken_url": '/api/wiki/models/qiniu/uploadToken',
                        "domain": 'ov62qege8.bkt.clouddn.com',
                        "chunk_size": "4mb",
                        "init": {
                            "FilesAdded": function (up,files) {
                                files.map(function (file) {
                                    var uploadInfo = "***网盘： 正在上传文件 " + 0 + "/" + file.size + "(0%),上传完成后可以在网盘中进行管理，上传过程中请不要刷新窗口***";
                                    line_keyword_nofocus(dropFiles[file.name].insertLinum, uploadInfo, 2);
                                });
                                this.start();
                            },
                            "BeforeUpload": function (up, file) {
                                console.log("BeforeUpload");
                            },
                            "UploadProgress": function (up, file) {
                                var uploadInfo = "***网盘： 正在上传文件 " + file.loaded + "/" + file.size + "(" + file.percent + "%),上传完成后可以在网盘中进行管理，上传过程中请不要刷新窗口***";
                                line_keyword_nofocus(dropFiles[file.name].insertLinum, uploadInfo, 0);
                            },
                            "FileUploaded": function (up, file, info) {
                                console.log("FileUploaded");
                                var lineNo = dropFiles[file.name].insertLinum;
                                line_keyword_nofocus(lineNo, file.name);
                                var params = {
                                    filename:file.name,
                                    domain:up.getOption('domain'),
                                    key:info.key || file.target_name,
                                    size:file.size,
                                    type:file.type,
                                    hash:info.hash,
                                    channel:"qiniu"
                                };
                                util.post(config.apiUrlPrefix + 'bigfile/upload', params, function(data){
                                    dropFiles[file.name]._id = data._id;
                                    var insertContent = '```@wiki/js/bigfile\n{\n\t"fileId":"' + data._id + '","fileType":"'+file.type+'",\n"extraMsg":"'+file.name+'","channel":"qiniu"\n}\n```\n';
                                    line_keyword_nofocus(dropFiles[file.name].insertLinum, insertContent);
                                }, function(){
                                    line_keyword_nofocus(dropFiles[file.name].insertLinum, "***上传出错了，请重试，或者在网盘上传重试***", 0);
                                    util.post(config.apiUrlPrefix + "qiniu/deleteFile", {
                                        key:params.key
                                    }, function (result) {
                                    }, function (err) {
                                    }, false);
                                }, false);
                            },
                            "UploadComplete": function (up, files, info) {
                                console.log("UploadComplete");
                                // setBigfileValue();
                            },
                            "Error": function (up, file, errTip) {
                                console.log(file.file);
                                console.log(dropFiles[file.name]);
                                line_keyword_nofocus(dropFiles[file.file.name].insertLinum, "***上传出错了，请重试，或者在网盘上传重试***", 0);
                            }
                        }
                    };

                    util.get(config.apiUrlPrefix + 'qiniu/getUid',{}, function(data){
                        if(data && data.uid) {
                            var uid = data.uid;
                            option.x_vars = {
                                "uid": uid
                            };
                            qiniuBack = qiniu.uploader(option);
                        }else{
                            console.log("uid获取失败");
                        }
                    }, function () {
                        console.log("uid获取失败");
                    });
                };
                initQiniu();

				var timer;

				var qiniuUpload = function (fileObj) {
				    var insertLineNum = dropFiles[fileObj.name].insertLinum;
				    if (!qiniuBack){
                        timer = setTimeout(function () {
                            qiniuUpload(fileObj);
                        }, 500);
                        return;
                    }

                    timer && clearTimeout(timer);

                    util.post(config.apiUrlPrefix + "bigfile/getByFilenameList", {filelist:[fileObj.name]}, function(data){
                       if (data.length > 0){
                           var contentHtml = '<p class="dialog-info-title">网盘中已存在以下文件，是否覆盖？</p>';
                           contentHtml+='<p class="dialog-info"><span class="text-success glyphicon glyphicon-ok"></span> '+ fileObj.name +'</p>';
                           config.services.confirmDialog({
                               "title": "上传提醒",
                               "contentHtml": contentHtml
                           }, function () {
                               qiniuBack.addFile(fileObj);
                               qiniuBack.start();
                           }, function () {
                               line_keyword_nofocus(insertLineNum, "", 0);
                           });
                       }else{
                           qiniuBack.addFile(fileObj);
                           qiniuBack.start();
                       }
                    });
                };

				var getEmptyLine = function (lineNo) {
				    if(!angular.isNumber(lineNo)){
				        return 0;
                    }
                    var content = editor.getLine(lineNo);
				    while (content){
				        content = editor.getLine(++lineNo);
                    }
				    if (!angular.isDefined(content)){
				        editor.replaceRange("\n",{line: lineNo, ch: 0});
                    }
				    return lineNo;
                };

				if (window.FileReader) {
					var fileReader = new FileReader();
					var cursor = editor.getCursor();
					fileReader.onloadstart = function () {
                        console.log("fileLoadStart");
                        var insertLineNum = getEmptyLine(cursor.line);
                        dropFiles[fileObj.name].insertLinum = insertLineNum;
                        var onloadInfo = "***正在获取文件 0/"+ fileObj.size +"***";
                        line_keyword_nofocus(dropFiles[fileObj.name].insertLinum, onloadInfo, 0);
                        // editor.setCursor(CodeMirror.Pos(++dropFiles[fileObj.name].insertLinum, 0));
                        // cursor = editor.getCursor();
                    };
					fileReader.onprogress = function (file) {
					    var onprogressInfo = "***正在获取文件 "+ file.loaded +"/" + fileObj.size  + "***";
                        line_keyword_nofocus(dropFiles[fileObj.name].insertLinum, onprogressInfo, 0);
                    };
					fileReader.onload = function () {
                        if (fileObj.size > UpperLimit || /video\/\w+/.test(fileObj.type)){ // 上传到七牛
                            var cmd_bigfile = function(fileObj) {
                                console.log(fileObj.name);
                                var msg = "editorUploadFile";
                                var data = dropFiles[fileObj.name];
                                line_keyword_nofocus(dropFiles[fileObj.name].insertLinum, "**已选择使用上传工具上传 "+fileObj.name+"。**", 0);
                                if (isBigfileModalShow) {
                                    $rootScope.$broadcast(msg, data); 
                                    return;
                                }
                                $scope.cmd_bigfile();
                                
                                bigfileModal.opened.then(function() {
                                    isBigfileModalShow = true;
                                    $rootScope.$broadcast(msg, data); 

                                    confirmFilesQue.filter(function(file) {
                                        line_keyword_nofocus(dropFiles[file.name].insertLinum, "**已选择使用上传工具上传 "+file.name+"。**", 0);
                                        $rootScope.$broadcast(msg, file);
                                        return false;
                                    });
                                });
                            }

                            var stop = function(fileObj) {
                                line_keyword_nofocus(dropFiles[fileObj.name].insertLinum, "**因为 "+fileObj.name+" 容量较大，已取消上传。**", 0);
                                if (confirmFilesQue.length > 0) {
                                    confirmFun(confirmFilesQue[0]);
                                    confirmFilesQue.shift();
                                    console.log(confirmFilesQue);
                                }
                            }

                            var editorToQiniu = function(fileObj) {
                                console.log("正在上传到七牛");
                                $scope.storeInfoByte.used += fileObj.size || 0;
                            
                                if ($scope.storeInfoByte.used > $scope.storeInfoByte.total){
                                    $scope.storeInfoByte.used -= fileObj.size || 0;
                                    line_keyword_nofocus(dropFiles[fileObj.name].insertLinum, "**网盘容量不足,"+fileObj.name+" 文件上传失败**", 0);
                                    return;
                                }
    
                                qiniuUpload(fileObj);
                                if (confirmFilesQue.length > 0) {
                                    confirmFun(confirmFilesQue[0]);
                                    confirmFilesQue.shift();
                                    console.log(confirmFilesQue);
                                }
                            }

                            var confirmFun = function(fileObj){
                                var contentHtml = "<p class='file-large-info'>识别到您上传的文件:<span class='filename'>"+ fileObj.name +"</span>容量较大。我们推荐你使用网站的大文件工具上传。否则可能导致浏览器性能降低。</p>";
                                var uploadId = fileObj.name;
                                var confirmDialog = config.services.confirmDialog({
                                    "title": "提醒",
                                    "confirmBtn": false,
                                    "cancelBtn": false,
                                    "backdrop": "static",
                                    "contentHtml": contentHtml,
                                    "operationBtns": [
                                        {
                                            "id": uploadId,
                                            "text": "打开上传工具",
                                            "clickHandler": function ($dialogScope) {
                                                $dialogScope.$dismiss();
                                                isConfirmDialogShow = false;
                                                cmd_bigfile(fileObj);
                                            }
                                        },
                                        {
                                            "text": "继续上传",
                                            "clickHandler": function ($dialogScope) {
                                                $dialogScope.$dismiss();
                                                isConfirmDialogShow = false;
                                                editorToQiniu(fileObj);
                                            }
                                        },
                                        {
                                            "text": "取消上传",
                                            "class": "btn-fill btn-default",
                                            "clickHandler": function ($dialogScope) {
                                                $dialogScope.$dismiss();
                                                isConfirmDialogShow = false;
                                                stop(fileObj);
                                            }
                                        },
                                    ],
                                    "openedCb": function() {
                                    }
                                }, function(){
                                    isBigfileModalShow = false;
                                    isConfirmDialogShow = false;
                                }, function(){
                                    isBigfileModalShow = false;
                                    isConfirmDialogShow = false;
                                    stop(fileObj);
                                }); 
                            }

                            if (fileObj.size > BrowerUpperLimit) {
                                if (isBigfileModalShow) {
                                    console.log(isBigfileModalShow);
                                    cmd_bigfile();
                                    return;
                                }
                                if (isConfirmDialogShow) {
                                    confirmFilesQue = confirmFilesQue || [];
                                    confirmFilesQue.push(fileObj);
                                    return;
                                }
                                
                                isConfirmDialogShow = true;
                                confirmFun(fileObj);
                            }else {
                                editorToQiniu(fileObj);
                            }
                        }else{ // 上传到数据源
                            console.log("正在上传到数据源");
                            if (/image\/\w+/.test(fileObj.type)) {
                                currentDataSource.uploadImage({content: fileReader.result}, function (img_url) {
                                    //console.log(img_url);
                                    line_keyword_nofocus(dropFiles[fileObj.name].insertLinum, '![](' + img_url + ')', 2);
                                    cb && cb(img_url);
                                });
                            } else {
                                currentDataSource.uploadFile({path:path, content:fileReader.result}, function(linkUrl){
                                    var callback = function() {
                                        line_keyword_nofocus(dropFiles[fileObj.name].insertLinum, '['+ fileObj.name +'](' + linkUrl + ')', 2);
                                        cb && cb(linkCtrl);
                                    };

                                    currentDataSource.getLastCommitId(callback, callback, false);
                                }, function(response){
                                    Message.danger(response.data.message);
                                    console.log(data);
                                });
                            }
                        }
                    };
					fileReader.readAsDataURL(fileObj);
				} else {
					alert('浏览器不支持');
				}
			}//}}}

            //图片上传
            $scope.cmd_image_upload = function (fileObj, cb) {//{{{
                if (!/image\/\w+/.test(fileObj.type)) {
                    alert("这不是图片！");
                    return false;
                }
				$scope.cmd_file_upload(fileObj, cb);
            }//}}}

            //代码
            $scope.cmd_code = function () {//{{{
                if (isHTMLViewEditor) {
                    formatHtmlView('formatblock', 'pre');
                    return;
                }

                var sel = editor.getSelection();
                var desStr = '```\n' + sel + '\n```';
                editor.replaceSelection(desStr);

                var cursor = editor.getCursor();
                editor.setCursor(CodeMirror.Pos(cursor.line - 1, cursor.ch));

                editor.focus();
            }//}}}

            //版本
            $scope.cmd_version = function () {//{{{
                // util.go("gitVersion");
                $scope.currentPage = currentPage;
                modal('controller/gitVersionController', {
                    controller: 'gitVersionController',
                    size: 'lg',
                    backdrop: true,
                    scope: $scope
                }, function (wikiBlock) {
                    console.log(wikiBlock);
                }, function (result) {
                    console.log(result);
                });
            }//}}}

            $scope.cmd_transform = function () {//{{{
                $scope.enableTransform = !$scope.enableTransform;
                //console.log($scope.enableTransform);
                CodeMirror.signal(editor, 'change', editor);
            }//}}}

            // 渲染自动保存
            function renderAutoSave(cb, errcb) {//{{{{
                var content = editor.getValue();
                if (isEmptyObject(currentPage)) {
                    storage.localStorageSetItem("wikiEditorTempContent", content);
                    cb && cb();
                    return;
                }

                //if (!currentPage.isModify || !isSelfPage()) {
                if (!currentPage.isModify) {
                    cb && cb();
                    return;
                }

                currentPage.content = content;                             // 更新内容
                currentPage.timestamp = (new Date()).getTime();            // 更新时间戳
                //console.log(currentPage);
                //console.log('save storage ' + currentPage.url);
                storage.indexedDBSetItem(config.pageStoreName, currentPage, cb, errcb); // 每次改动本地保存
            }//}}}

			function initModuleEditor() {
				util.html("#moduleEditor", moduleEditorContent);
				// $("#moduleEditorContainer").hide();
			}

            function initEditor() {
                //console.log("initEditor");
				//{{{
                if (editor || (!document.getElementById("source"))) {
                    console.log("init editor failed");
                    return;
                }

				initModuleEditor();

                var winWidth = $(window).width();
                if (winWidth<992){
                    $scope.showFile=false;
                    $scope.showCode=true;
                    $scope.showView=false;
                    $scope.phoneEditor = true;
                }else{
                    $scope.showFile=true;
                    $scope.showCode=true;
                    $scope.showView=true;
                }
                initView();
                resizeMod();
                function wikiCmdFold(cm, start) {
                    var line = cm.getLine(start.line);
                    if ((!line) || (!line.match(/^```[@\/]/)))
                        return undefined;
                    //console.log(start);
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
					indentUnit:1,
					smartIndent:true,

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
                            $scope.cmd_savepage();
                        },
                        "Shift-Ctrl-N": function (cm) {
                            $scope.cmd_newpage();
                        },
                        "Ctrl-B": function (cm) {
                            $scope.cmd_bold();
                        },
                        "Ctrl-I": function (cm) {
                            $scope.cmd_italic();
                        },
                        "Ctrl--": function (cm) {
                            $scope.cmd_strikethrough();
                        },
                        "Shift-Ctrl-[": function (cm) {
                            $scope.cmd_superscript();
                        },
                        "Shift-Ctrl-]": function (cm) {
                            $scope.cmd_subscript();
                        },
                        "Shift-Ctrl-1": function (cm) {
                            $scope.cmd_headline(1);
                        },
                        "Shift-Ctrl-2": function (cm) {
                            $scope.cmd_headline(2);
                        },
                        "Shift-Ctrl-3": function (cm) {
                            $scope.cmd_headline(3);
                        },
                        "Shift-Ctrl-4": function (cm) {
                            $scope.cmd_headline(4);
                        },
                        "Shift-Ctrl-5": function (cm) {
                            $scope.cmd_headline(5);
                        },
                        "Shift-Ctrl-6": function (cm) {
                            $scope.cmd_headline(6);
                        },
                        "Ctrl-.": function (cm) {
                            $scope.cmd_listul();
                        },
                        "Ctrl-/": function (cm) {
                            $scope.cmd_listol();
                        },
                        "Ctrl-]": function (cm) {
                            $scope.cmd_blockqote();
                        },
                        "Shift-Ctrl-T": function (cm) {
                            $scope.cmd_tabel();
                        },
                        "Ctrl-H": function (cm) {
                            $scope.cmd_horizontal();
                        },
                        "Alt-L": function (cm) {
                            $scope.cmd_link();
                        },
                        "Alt-P": function (cm) {
                            $scope.cmd_image();
                        },
                        "Alt-V": function (cm) {
                            $scope.cmd_video();
                        },
                        "Alt-C": function (cm) {
                            $scope.cmd_code();
                        },
                        "Ctrl-M": function (cm) {
                            $scope.openWikiBlock();
                        },
                    }
                });
                $rootScope.editor = editor;
				//}}}
                //var viewEditorTimer = undefined;//{{{
                //$('body').on('focus', '[contenteditable]', function () {
                    ////console.log("start html view edit...");
                    //isHTMLViewEditor = true;
                    //currentRichTextObj = $(this);
                    //if (viewEditorTimer) {
                        //clearTimeout(viewEditorTimer);
                        //viewEditorTimer = undefined;
                    //}
                    ////return $this;
                //}).on('blur keyup paste input', '[contenteditable]', function () {
                    ////return $this;
                //}).on('blur', '[contenteditable]', function () {
                    ////console.log("end html view edit...");
                    //var $this = $(this);
                    //viewEditorTimer = setTimeout(function () {
                        //isHTMLViewEditor = false;
                        //currentRichTextObj = undefined;
                        ////console.log(mdwiki.blockList);
                        //var blockList = mdwiki.blockList;
                        //var block = undefined;
                        //for (var i = 0; i < blockList.length; i++) {
                            //if (blockList[i].blockCache.containerId == $this[0].id) {
                                //block = blockList[i]
                            //}
                        //}
                        //htmlToMd(block);
                    //}, 1000);
                //});

                mdwiki.setEditor(editor);
				config.shareMap.mdwiki = mdwiki;

                var scrollTimer = undefined, changeTimer = undefined;
					var isScrollPreview = false;
				//}}}
                function htmlToMd(block) {//{{{
                    if (!block || !mdwiki.isEditor())
                        return;
                    var domNode = $('#' + block.blockCache.containerId)[0];
                    var mdText = toMarkdown(domNode.innerHTML, {
                        gfm: true, converters: [
                            {
                                filter: 'div',
                                replacement: function (content) {
                                    console.log(content);
                                    return '\n' + content + '\n';
                                }
                            }

                        ]
                    });
                    block.blockCache.domNode = undefined;
                    editor.replaceRange(mdText, {
                        line: block.textPosition.from,
                        ch: 0
                    }, {line: block.textPosition.to - 1});
                    //console.log(mdText, domNode, block.textPosition);
                }//}}}

                editor.on('fold', function (cm, from, to) {//{{{
                    cm.getDoc().addLineClass(from.line, 'wrap', 'CodeMirrorFold');
                    //console.log("--------------------fold--------------------");
                });
                editor.on('unfold', function (cm, from, to) {
                    //console.log("----------------unfold--------------------");
                    cm.getDoc().removeLineClass(from.line, 'wrap', 'CodeMirrorFold');
                });
                // 渲染后自动保存
                var renderTimer = undefined;
                //var filterSensitive = function (inputText) {
                    //var result = "";
                    //config.services.sensitiveTest.checkSensitiveWord(inputText, function (foundWords, outputText) {
                        //result = outputText;
                        //return inputText;
                    //});
                    //return result;
                //};

				editor.on("cursorActivity", function(cm){
					mdwiki.cursorActivity();					
				});

                editor.on("change", function (cm, changeObj) {
                    var moduleEditorParams = config.shareMap.moduleEditorParams || {};
                    var isStopRender = moduleEditorParams.renderMod == "editorToCode";
                    changeCallback(cm, changeObj);

                    if (currentPage && currentPage.url) {
                        allWebstePageContent[currentPage.url] = editor.getValue();
                    }

                    renderTimer && clearTimeout(renderTimer);
                    renderTimer = setTimeout((function (isStopRender) {
                        renderAutoSave();
                        //if (isStopRender){
                            //moduleEditorParams.renderMod = undefined;
                            //return;
                        //}
                        var text = editor.getValue();
                        //if((!currentSite || currentSite.sensitiveWordLevel & 1) <= 0){
                            //text = filterSensitive(text) || text;
                        //}
                        mdwiki.render(text);

                        //var toLineInfo = changeObj && editor.lineInfo(changeObj.to.line);
                        //moduleEditorParams.show_type = "knowledge";
                        //moduleEditorParams.setKnowledge(toLineInfo ? toLineInfo.text:"");

                        timer = undefined;
                    })(isStopRender));
                });
                mdwiki.bindRenderContainer(".result-html", ".tpl-header-container");
                editor.focus();
                setEditorHeight();
//}}}
                //previewWidth>=1200  =>  result-width=previewWidth
                //previewWidth<1200    =>  result-width=min(1200,winWidth)
                function getResultSize(winWidth,boxWidth) {//{{{
                    if(boxWidth<1200){
                        var resultSize=(winWidth>1200)? 1200 : winWidth;
                    }

                    return resultSize? resultSize:boxWidth;
                }

                function resizeResult(resultWidth) {
                    if(resultWidth){
                        $(".result-html").css("width", resultWidth + "px");
                    }
                }

                function getScaleSize(scroll) {
                    var winWidth = $(window).width();
                    var boxWidth = $("#preview").width();//30为#preview的padding宽度
                    var resultWidth=getResultSize(winWidth,boxWidth);
                    var scaleSize = boxWidth / resultWidth;
                    if(!scroll || scroll!="scroll"){
                        resizeResult(resultWidth);//设置result-html宽度

                        var len=$scope.scales.length-1;
                        if(!$scope.scales[len].resultWidth || ($scope.scales[len].resultWidth != winWidth && $scope.scales[len].showValue == "实际大小")){//设置实际大小的result-html的宽度为浏览器窗口大小宽度
                            $scope.scales[len].resultWidth = winWidth;
                        }
                        if($scope.scales[len].showValue!="适合宽度"){
                            $scope.scales.push({
                                "id":$scope.scales.length,
                                "showValue":"适合宽度",
                                "scaleValue":scaleSize,
                                "special":true,
                                "resultWidth":resultWidth
                            });
                        }else if ($scope.scales[len].showValue=="适合宽度" && $scope.scales[len].resultWidth!=resultWidth){
                            $scope.scales[len].resultWidth=resultWidth;
                        }else if ($scope.scales[len].showValue=="适合宽度" && $scope.scales[len].scaleValue!=scaleSize){
                            $scope.scales[len].scaleValue=scaleSize;
                        }
                    }
                    return scaleSize;
                }

                function resizeMod(val,scaleItem) {
                    if (scaleItem && scaleItem.resultWidth){
                        resizeResult(scaleItem.resultWidth);
                    }
                    var scaleSize = val || getScaleSize();
                    setTimeout(function () {
                        $('#' + mdwiki.getMdWikiContainerId()).css({
                            "transform": "scale(" + scaleSize + ")",
                            "transform-origin": "left top"
                        });
                    });
                    if (scaleSize<=$scope.scales[0].scaleValue){//显示的最小比例时，禁用缩小按钮
                        $scope.forbidScale=true;
                        $scope.forbidEnlarge=false;
                    }else if(scaleSize>=$scope.scales[$scope.scales.length-3].scaleValue){//显示的最大比例时，禁用放大按钮
                        $scope.forbidEnlarge=true;
                        $scope.forbidScale=false;
                    }else{
                        $scope.forbidScale=false;
                        $scope.forbidEnlarge=false;
                    }
                }

                // 下拉框选择比例
                $scope.changeScale = function (scaleItem) {
                    $scope.enableTransform = false;
                    console.log(scaleItem);
                    resizeMod(scaleItem.scaleValue,scaleItem);
                }

                // 特殊情况（实际大小、适应宽度）查找比例
                function findSize(larger,nowSize) {
                    var i;
                    if (larger){//找比当前状态比例 大 一档的比例
                        for(i=0;i<$scope.scales.length-2;i++){
                            if($scope.scales[i].scaleValue>nowSize){
                                break;
                            }
                        }
                    }else{//找比当前状态比例 小 一档的比例
                        for(i=$scope.scales.length-3;i>=0;i--){
                            if($scope.scales[i].scaleValue<nowSize){
                                break;
                            }
                        }
                    }
                    return $scope.scales[i].id;
                }

                //缩小
                $scope.scale = function () {
                    var toSize=1;
                    if(!$scope.forbidScale){
                        var nowSize=$scope.scales[$scope.scaleSelect.id].scaleValue;
                        if($scope.scaleSelect.special == true){//特殊情况需要找比例
                            toSize=findSize(false,nowSize);
                        }else{//非特殊情况
                            toSize=$scope.scaleSelect.id-1;
                        }

                        $scope.scaleSelect=$scope.scales[toSize];
                        resizeMod($scope.scales[toSize].scaleValue);
                        if (toSize <= 0){
                            $scope.forbidScale=true;
                        }
                    }
                }

                // 放大
                $scope.enlarge = function () {
                    var toSize=1;
                    if(!$scope.forbidEnlarge){
                        var nowSize=$scope.scales[$scope.scaleSelect.id].scaleValue;
                        if($scope.scaleSelect.special == true){//特殊情况需要找比例
                            toSize=findSize(true,nowSize);
                        }else{//非特殊情况
                            toSize=$scope.scaleSelect.id+1;
                        }
                        $scope.scaleSelect=$scope.scales[toSize];
                        resizeMod($scope.scales[toSize].scaleValue);
                        if (toSize >= ($scope.scales.length-3)){
                            $scope.forbidEnlarge=true;
                        }
                    }
                }

                $scope.adaptive = function () {
                    resizeMod($scope.scales[$scope.scales.length-1].scaleValue,$scope.scales[$scope.scales.length-1]);
                    $scope.scaleSelect=$scope.scales[$scope.scales.length-1];
                }

                // 全屏
                $scope.fullScreen = function () {
                    $scope.full = $scope.full ? false : true;
                    if($scope.full){
                        launchFullscreen();
                    }else{
                        exitFullscreen();
                    }
                }

                // 全屏
                function launchFullscreen() {
                    var element=document.documentElement;
                    if(element.requestFullscreen) {
                        element.requestFullscreen();
                    } else if(element.mozRequestFullScreen) {
                        element.mozRequestFullScreen();
                    } else if(element.msRequestFullscreen){
                        element.msRequestFullscreen();
                    } else if(element.webkitRequestFullscreen) {
                        element.webkitRequestFullScreen();
                    }
                    setEditorHeight();
                }

                // 退出全屏
                function exitFullscreen() {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                }

                // 全屏和取消全屏时调整编辑器高度
                document.addEventListener("fullscreenchange", function(e) {
                    setTimeout(function () {
                        setEditorHeight();
                    });
                });
                document.addEventListener("mozfullscreenchange", function(e) {
                    setTimeout(function () {
                        setEditorHeight();
                    });
                });
                document.addEventListener("webkitfullscreenchange", function(e) {
                    setTimeout(function () {
                        setEditorHeight();
                    });

                });
                document.addEventListener("msfullscreenchange", function(e) {
                    setTimeout(function () {
                        setEditorHeight();
                    });
                });

                function setEditorHeight() {
                    setTimeout(function () {
                        var wikiEditorContainer = $('#wikiEditorContainer')[0];
                        var wikiEditorPageContainer = $('#wikiEditorPageContainer')[0];
                        var attEditHeight = $("#moduleEditorContainer").height();
                        var height = (wikiEditorPageContainer.clientHeight - wikiEditorContainer.offsetTop) + 'px';
                        var noAttEditHeight = (wikiEditorPageContainer.clientHeight - wikiEditorContainer.offsetTop - attEditHeight) + 'px';
                        editor.setSize('auto', noAttEditHeight);
                        $('#wikiEditorContainer').css('height', height);
                        $('.full-height').css('height', height);
                        $('.full-noAttr-height').css('height', noAttEditHeight);

                        var w = $("#__mainContent__");
                        w.css("min-height", "0px");
                    });
                }

                window.onresize = function () {
                    if (util.isEditorPage()) {
                        setEditorHeight();
                        $scope.scaleSelect=$scope.scales[$scope.scales.length-1];
                        resizeMod();

                        var winWidth = $(window).width();
                        if (winWidth<992){
                            $scope.phoneEditor = true;
                        }else {
                            $scope.phoneEditor = false;
                        }
                    }
                };
				//}}}
				//{{{
                editor.on("beforeChange", function (cm, changeObj) {
                    //console.log(changeObj);
                    if (currentPage && currentPage.isFirstEditor) {
                        return;
                    }
                    for (var i = changeObj.from.line; i < changeObj.to.line + 1; i++) {
                        if (!/^```[@\/]/.test(editor.getLine(i))) {
                            cm.getDoc().removeLineClass(i, 'wrap', 'CodeMirrorFold');
                        }
                    }
                });
                // 折叠wiki代码
                function foldWikiBlock(cm, changeObj) {
                    //console.log(changeObj);
                    if (!changeObj) {
                        return;
                    }
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
                            editor.foldCode({line: changeObj.from.line + start, ch: changeObj.from.ch}, null, 'fold');
                            start = end = -1;
                        }
                    }

                    if (currentPage && currentPage.isFirstEditor) {
                        return;
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
                            start = end = -1;
                        }
                    }

                }

                // 正在上传文件时换行、删行，导致正在上传提示插入行数不对
                function setDropFilePosition(cm, changeObj){
                    if (isEmptyObject(dropFiles)){
                        return;
                    }
                    var changeLine = changeObj.from.line;
                    var ch = changeObj.from.ch;
                    for(var url in dropFiles){
                        var isToUpdateLine = (changeLine < dropFiles[url].insertLinum) || (changeLine == dropFiles[url].insertLinum && ch == 0);
                        if(isToUpdateLine){
                            var diffLine = changeObj.text.length - changeObj.removed.length;
                            dropFiles[url].insertLinum += diffLine;
                        }
                    }
                }

                // 编辑器改变内容回调
                function changeCallback(cm, changeObj) {
                    if (!currentPage)
                        return;

                    //console.log(changeObj);
                    foldWikiBlock(cm, changeObj);
                    setDropFilePosition(cm, changeObj);

                    var content = editor.getValue();
                    //console.log(currentPage);

                    if (!currentPage.isModify && content != allWebstePageContent[currentPage.url]) {
                        //console.log(currentPage);
                        //console.log(content, allWebstePageContent[currentPage.url],content != allWebstePageContent[currentPage.url]);
                        var key = currentPage.username + "_" + currentPage.sitename;
                        if (allSiteMap[key].isReadable) {
                            return;
                        }
                        currentPage.isModify = true;
                        $scope.opens[currentPage.url].isModify = true;
                        initTree();
                    }

                    currentPage.isFirstEditor = undefined;

                    /*
                    changeTimer && clearTimeout(changeTimer);
                    changeTimer = setTimeout(function () {
                        savePageContent();                               // 每分钟提交一次server
                    }, 60000);
                    */
                }

                editor.on('scroll', function (cm) {
                    if (isScrollPreview)
                        return;
                    //console.log(scrollTimer);
                    scrollTimer && clearTimeout(scrollTimer);
                    scrollTimer = setTimeout(function () {
                        var scaleSize = getScaleSize("scroll");
                        var initHegiht = editor.getScrollInfo().top + editor.heightAtLine(0);
                        var index = 0;
                        var block;
                        var blockList = mdwiki.blockList;
                        for (index = 0; index < blockList.length - 1; index++) {
                            block = blockList[index];
                            if (block.blockCache.isTemplate)
                                continue;

                            if (editor.heightAtLine(block.textPosition.from) >= initHegiht)
                                break;
                        }
                        block = blockList[index];
						if ($('#' + block.blockCache.containerId)[0]) {
							$('#preview').scrollTop($('#' + block.blockCache.containerId)[0].offsetTop * scaleSize);
						}
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
                            var scaleSize = getScaleSize("scroll");
                            var initHeight = editor.getScrollInfo().top + editor.heightAtLine(0);
                            var index = 0;
                            var block;
                            var blockList = mdwiki.blockList;
                            var scrollTop = $('#preview')[0].scrollTop;
                            for (index = 0; index < blockList.length - 1; index++) {
                                block = blockList[index];
                                if (block.blockCache.isTemplate)
                                    continue;
                                if (scrollTop <= $('#' + block.blockCache.containerId)[0].offsetTop * scaleSize) {
                                    //console.log(scrollTop, $('#' + block.blockCache.containerId)[0].offsetTop,scaleSize);
                                    break;
                                }
                            }
                            block = blockList[index];
                            editor.scrollTo(0, editor.getScrollInfo().top + editor.heightAtLine(block.textPosition.from) - initHeight);
                        }, 100);
                    }
                });


                var showTreeview = true;

                function initView() {
                    if ($scope.showFile){
                        $(".code-view").removeClass("nofile");
                        $(".toolbar-page-file").addClass("active");
                        $(".toolbar-new-site").addClass("active");
                        $("#treeview").show();
                    }else{
                        $(".code-view").addClass("nofile");
                        $(".toolbar-page-file").removeClass("active");
                        $(".toolbar-new-site").removeClass("active");
                        $("#treeview").hide();
                    }
                    if ($scope.showCode && $scope.showView){
                        $(".toolbar-page-slide").addClass("active");
                        $(".toolbar-page-code").removeClass("active");
                        $(".toolbar-page-design").removeClass("active");

                        $("#srcview").show();
                        $("#preview").show();
                        $("#resize-bar").show();
                        $("#srcview").addClass("col-xs-6");
                        $("#preview").addClass("col-xs-6");
                        resizeMod();
                    }else if ($scope.showCode && !$scope.showView){
                        $(".toolbar-page-code").addClass("active");
                        $(".toolbar-page-slide").removeClass("active");
                        $(".toolbar-page-design").removeClass("active");

                        $("#preview").hide();
                        $("#resize-bar").hide();
                        $("#srcview").show();
                        $("#srcview").removeClass("col-xs-6");
                        $("#srcview").addClass("col-xs-12");
                        resizeMod();
                    }else if(!$scope.showCode && $scope.showView){
                        $(".toolbar-page-design").addClass("active");
                        $(".toolbar-page-slide").removeClass("active");
                        $(".toolbar-page-code").removeClass("active");

                        $("#srcview").hide();
                        $("#preview").show();
                        $("#preview").removeClass("col-xs-6");
                        $("#preview").addClass("col-xs-12");
                        resizeMod();
                    }else{
                        $(".toolbar-page-design").removeClass("active");
                        $(".toolbar-page-slide").removeClass("active");
                        $(".toolbar-page-code").removeClass("active");

                        $("#srcview").hide();
                        $("#preview").hide();
                        resizeMod();
                    }
                    var scaleSize=getScaleSize();
                    $scope.scales[$scope.scales.length-1].scaleValue=scaleSize;
                    $scope.scaleSelect=$scope.scales[$scope.scales.length-1];//比例的初始状态为 “适合宽度”
                    $rootScope.scaleSelect = $scope.scaleSelect;
                    util.$apply();
                }

                $scope.toggleFile = function () {
                    $scope.showFile = $scope.showFile ? false : true;
                    if ($scope.phoneEditor){
                        $scope.showFile = true;
                        $scope.showCode = false;
                        $scope.showView = false;
                    }
                    initView();
                };

                $scope.newWebsite = function () {
                    modal('controller/newWebsiteController', {
                        controller: 'newWebsiteController',
                        size: 'lg',
                        backdrop: 'static'
                    }, function (wikiBlock) {
                        console.log(wikiBlock);
                    }, function (result) {
                        if (result.finished){
                            var key = result.website.username + "_" + result.website.name;
                            allSiteMap[key] = result.website;
                            initTree();
                        }
                    });
                }

                $scope.showCodeView = function () {
                    $scope.showCode = true;
                    $scope.showView = false;
                    if ($scope.phoneEditor){
                        $scope.showFile = false;
                    }
                    $("#srcview").width("100%");
                    initView();
                };

                $scope.codeAndPreview = function () {
                    $scope.showCode = true;
                    $scope.showView = true;
                    $("#srcview").width("50%");
                    $("#preview").width("50%");
                    initView();
					openPage();
                };

                $scope.showPreview = function () {
                    $scope.showCode = false;
                    $scope.showView = true;
                    if ($scope.phoneEditor){
                        $scope.showFile = false;
                    }
                    $("#preview").width("100%");
                    initView();
                };

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
                    //var url = $('#btUrl').val() + "?branch=master";
                    var url = $('#btUrl').val();

                    if (url && currentPage.isModify) {
                        var tmpWin = window.open();
                        $scope.cmd_savepage(function () {
                            if (url) {
                                tmpWin.location = url;
                            }
                        });
                    } else {
                        window.open(url);
                    }

                });

                $('.toolbar-page-version').on('click', function () {
                    $scope.cmd_version();
                });

                $('.toolbar-page-hotkey').on('click', function () {
                    console.log('toolbar-page-hotkey');
                    $('#hotkeyModal').modal({
                        keyboard: true
                    })
                });

                $(function () {
                    var wellStartPos = $('.well').offset().top;

                    $.event.add(window, "scroll", function () {
                        var p = $(window).scrollTop();
//                         if (p > wellStartPos) {
//                             $('.well').css('position', 'fixed');
//                             $('.well').css('top', '0px');
//                             $('.well').css('left', '0px');
//                             $('.well').css('right', '0px');
//
// //                $('.treeview').css('position', 'fixed');
// //                $('.treeview').css('top',p + $('#toolbarview').height());
//                         } else {
//                             $('.well').css('position', 'static');
//                             $('.well').css('top', '');
//
// //                $('.treeview').css('position','static');
// //                $('.treeview').css('top','');
//                         }
                    });
                });

                $scope.goHomePage = function () {
                    util.go("home");
                };

                $scope.goUserPage = function () {
                    util.goUserSite('/' + $scope.user.username);
                };

                $scope.goModPackagePage = function () {
                    util.go("mod/packages",true);
                };

                editor.on("paste", function (editor, e) {
					//console.log(e.clipboardData.items);
					//console.log(e.clipboardData.files);
                    if (!(e.clipboardData && e.clipboardData.items.length)) {
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
                            dropFiles[pasteFile.name] = pasteFile;
                            // pasteFile就是获取到的文件
                            //console.log(pasteFile);
                            fileUpload(pasteFile);
                        }
                    }
                });

                var getUserStoreInfoPromise = new Promise(function (resolve, reject) {
                    util.get(config.apiUrlPrefix+"bigfile/getUserStoreInfo", {}, function (result) {
                        if (!result){
                            return;
                        }
                        resolve(result);
                    }, function (err) {
                        // console.log(err);
                        reject(err);
                    }, false);
                });

                editor.on("drop", function (editor, e) {
                    if (!(e.dataTransfer && e.dataTransfer.files.length)) {
                        alert("该浏览器不支持操作");
                        return;
                    }
                    var dropUploadList = [];

                    getUserStoreInfoPromise.then(function (result) {
                        $scope.storeInfoByte = {
                            "used": result.used || 0,
                            "total": result.total || 0
                        };
                        for (var i = 0; i < e.dataTransfer.files.length; i++) {
                            var file = e.dataTransfer.files[i];
                            dropFiles[file.name] = file;
                            fileUpload(file);
                        }
                    }, function (err) {
                        console.log(err);
                    });

                    e.preventDefault();
                });

                //文件上传
                function fileUpload(fileObj) {
                    //console.log(fileObj);
					// 此判断无意义
					if (fileObj.name.indexOf(".exe") >= 0  || fileObj.name.indexOf(".bat") >= 0) {
						Message.info("不支持可执行程序上传!!!");
						return;
					}
                    $scope.cmd_file_upload(fileObj);
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

				//window.addEventListener("paste", function(e){
                    //e = e || event;
					//console.log(e);
					//console.log(e.clipboardData.items);
					//console.log(e.dataTransfer.files);
				//}, false);

                // 编辑器拖拽改变大小
                var col1=$("#srcview");
                var col2=$("#preview");
                var col1Width=col1.width();
                var col2Width=col2.width();
                var startX=0;

                $("#resize-bar").on("mousedown",function(event){
                    col1Width=parseInt(col1.width(),10);
                    col2Width=parseInt(col2.width(),10);
                    startX=event.clientX;
                    $(".CodeMirror").on("mousemove",mousemoveEvent);
                    $("#preview").on("mousemove",mousemoveEvent);
                    $(".code-view").on("mouseup",mouseupEvent);
                });

                var mousemoveEvent=function(event){
                    col1.width(col1Width + event.clientX - startX);
                    col2.width(col2Width - event.clientX + startX);
                    if (col1.width()<200){
                        $scope.showCode = false;
                        $("#preview").width("100%");
                        mouseupEvent();
                    }
                    if(col2.width()<200){
                        $scope.showView = false;
                        $("#srcview").width("100%");
                        mouseupEvent();
                    }
                    initView();
                };

                var mouseupEvent = function(){
                    $(".CodeMirror").off("mousemove",mousemoveEvent);
                    $("#preview").off("mousemove",mousemoveEvent);
                    $(".CodeMirror").off("mouseup",mouseupEvent);
                    $("#preview").off("mouseup",mouseupEvent);
                };
                return editor;
				//}}}
            }
        }]);
    return htmlContent;
});
