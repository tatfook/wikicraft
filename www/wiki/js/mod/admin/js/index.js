/**
 * Created by wuxiangan on 2016/12/21.
 */

define([
	'app',
	'helper/util',
    'helper/mods',
	'text!wikimod/admin/html/index.html',
    'templates.js',
    'text!wikimod/admin/html/templates.html',
	'md5',
], function (app, util, mods, htmlContent, websiteTemplateContent) {
	app.registerController('indexController', ['$scope', '$auth', 'Account','modal', 'Message', function ($scope, $auth, Account, modal, Message) {
		var urlPrefix = "/wiki/js/mod/admin/js/";
		var tableName = "user";
		$scope.selectMenuItem = "manager";
		$scope.pageSize = 15;
		$scope.managerCurrentPage = 1;
		$scope.operationLogCurrentPage = 1;
		$scope.userCurrentPage = 1;
		$scope.userLogCurrentPage = 1;
		$scope.siteCurrentPage = 1;
		$scope.domainCurrentPage = 1;
		$scope.fileCheckCurrentPage = 1;
		$scope.VIPCurrentPage = 1;
		$scope.totalItems = 0;
		$scope.data = [];
		$scope.oauthData = [];
		$scope.oauthParams = {};
		$scope.oauthParams.skipUserGrant = 1;
		$scope.whiteList = [{
			"trueValue": 1,
            "falseValue": 0,
			"displayValue":"用户页显示",
			"result":"markdownShow"
		},{
            "trueValue": 2,
            "falseValue": 0,
            "displayValue":"网站设置保存",
            "result":"saveSetting"
        }];
		//$scope.roleId = 10;
		
		
		$scope.managerSearchById;
		$scope.managerSearchByUsername;
		
		// 确保为管理员
		function ensureAdminAuth() {
			if (!Account.isAuthenticated()) {
				util.go(urlPrefix + "login");
				return;
			}

			var payload = $auth.getPayload();
			$scope.roleId = payload.roleId;

			if (!payload.isAdmin) {
				util.go(urlPrefix + "login");
			}
		}

		function init() {
			ensureAdminAuth();
			//$scope.getTemplates();
			$scope.getManagerList();
			//$scope.clickMenuItem($scope.selectMenuItem);
		}

		$scope.$watch('$viewContentLoaded', init);

		/*
		$scope.clickQuery = function() {
			console.log($scope.query);
			for (var key in $scope.query) {
				if ($scope.query[key] == "") {
					$scope.query[key] = undefined;
				}
			}
			var tableName = getTableName();
			util.post(config.apiUrlPrefix + "tabledb/query", {
				tableName:tableName,
				page:$scope.currentPage,
				pageSize:$scope.pageSize,
				query:$scope.query,
			}, function(data){
				data = data || {};
				$scope.data = data.data || [];
				$scope.totalItems = data.total || 0;
				console.log($scope.datas);
			});
		}

		$scope.clickUpsert = function() {
			console.log($scope.query);
			for (var key in $scope.query) {
				if ($scope.query[key] == "") {
					$scope.query[key] = undefined;
				}
			}
			var tableName = getTableName();
			util.post(config.apiUrlPrefix + "tabledb/upsert", {
				tableName:tableName,
				query:$scope.query,
			}, function(data){
				if (data) {
					Message.info("添加成功");
					$scope.data.push(data);
					$scope.totalItems++;
				} else {
					Message.info("添加失败");
				}
			}, function(){
				Message.info("添加失败");
			});
		}

		$scope.clickEdit = function(x) {
			$scope.query = x;
		}

		
		*/
		$scope.clickDelete = function(x, tableName) {
			//var tableName = getTableName();
			var deleteConfirm = confirm("确定删除该项么？");
			if(deleteConfirm){
				util.post(config.apiUrlPrefix + "tabledb/delete", {
				tableName:tableName,
				query:{
					_id:x._id,
				}
			}, function(){
				x.isDelete = true;
			});
			}
		}
		/*
		$scope.clickEnableUser = function(x, tableName) {
			if(x.roleId = -1){
				var enableConfirm = confirm("确定启用该用户么？");
				if(enableConfirm){
					util.post(config.apiUrlPrefix + "tabledb/upsert", {
					tableName:tableName,
					query:{
						_id:x._id,
						roleId:0,
					}
				}, function(){
					x.isDelete = true;
				});
				}
			}else{
				var disableConfirm = confirm("确定禁用该用户么？");
				if(disableConfirm){
					util.post(config.apiUrlPrefix + "tabledb/upsert", {
					tableName:tableName,
					query:{
						_id:x._id,
						roleId:-1,
					}
				}, function(){
					x.isDelete = true;
				});
				}
			}
			
		}*/
		$scope.clickUpsert = function(x, tableName) {
			//console.log($scope.query);
			//for (var key in $scope.query) {
			//	if ($scope.query[key] == "") {
			//		$scope.query[key] = undefined;
			//	}
			//}
			//var tableName = getTableName();
			if(x.state == -1){
				var enableConfirm = confirm("确定启用该项么？");
				if(enableConfirm){
					util.post(config.apiUrlPrefix + "tabledb/upsert", {
					tableName:tableName,
					query:{
						_id:x._id,
						state:0,
					}
				}, function(){
					x.state = 0;
				});
				}
			}else{
				var disableConfirm = confirm("确定禁用该项么？");
				if(disableConfirm){
					util.post(config.apiUrlPrefix + "tabledb/upsert", {
					tableName:tableName,
					query:{
						_id:x._id,
						state:-1,
					}
				}, function(){
					x.state = -1;
				});
				}
			}
			
		}
		$scope.itemName = "用户名";
		$scope.items = ["username", "userip", "operation", "description", "targetType"];
		$scope.itemsOnView = ["用户名", "用户IP", "用户操作", "描述", "操作类型"];
		$scope.userLogSearchByItem = "";
		$scope.userLogCurrentPage = 1;
		$scope.userLogSearch = function () {
			if($scope.userLogSearchByItem != ""){
				var index = $scope.itemsOnView.indexOf($scope.itemName);
				var item = $scope.items[index];
				var query = {};
				query[item] = $scope.userLogSearchByItem;
				util.post(config.apiUrlPrefix+"tabledb/query", {
				tableName:"user_log",
				page:$scope.userLogCurrentPage,
				pageSize:$scope.pageSize,
				query:query,
			}, function(data){
				$scope.userLogList = data.data;
				$scope.totalItems = data.total;
				//outputEditor.setValue(angular.toJson(data.data,4));
			});
			}else{
				$scope.getUserLogList();
			}
		}
		
		$scope.getStyleClass = function (item) {
			if ($scope.selectMenuItem == item) {
				return "panel-primary";
			}
			return;
		}


		$scope.clickMenuItem = function(menuItem) {
			$scope.query = {};
			$scope.selectMenuItem = menuItem;
			$scope.clickQuery();
			if ($scope.selectMenuItem == "manager") {
				$scope.query = {};
				$scope.getManagerList();
			} else if ($scope.selectMenuItem == "site") {
				$scope.getSiteList();
			}
		}

		// 获取管理员列表
		$scope.getManagerList = function (){
			//alert("asdasdasdasd");
			$scope.selectMenuItem = "manager";
			$scope.managerSearchById;
			$scope.managerSearchByUsername = "";
			util.post(config.apiUrlPrefix + "admin/getManagerList", {
				page:$scope.managerCurrentPage,
				pageSize:$scope.pageSize,
			}, function (data) {
				data = data || {};
				$scope.managerList = data.managerList || [];
				$scope.totalItems = data.total || 0;
			});
		}
		
		//Oauth 管理
		$scope.oauthVar    = 1;
		$scope.maxSize     = 10;
		$scope.totalItems  = 0;
		$scope.currentPage = 1;
		
        $scope.itemPrePage = 10;
		
		//判定是否为添加框/修改框
		$scope.clickOauthToggle = function (params, item) {
			$scope.oauthVar = params;
			if(params == 1){
				$scope.oauthParams = {};
				$scope.oauthParams.skipUserGrant = 1;
			}
			if(params == 2){
				$scope.getOneOAuthInfo(item);
			}
		};
		
		$scope.selectOAuthValue = function(){
			var randomStr = hex_md5(new Date().toLocaleTimeString());
			$scope.oauthParams.clientSecret = randomStr;
		}
		
		//oauth管理菜单
		$scope.getOauthList = function(){
			$scope.selectMenuItem = "oauth";
			$scope.oauthList();
			$scope.listCount();
		}
		
		//oauth管理添加数据
		$scope.oauthAdd = function(){
			var addUrl = config.apiUrlPrefix + "oauth_app/new";
			
			if(!$scope.oauthParams.appName){
				return alert("请输入app名称");
			};
			
			if(!$scope.oauthParams.company){
				return alert("请输入公司名称");
			};
			
			if(!$scope.oauthParams.clientSecret){
				return alert("请输入clientSecret");
			};
			
			var reg1 = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/|[fF][tT][pP]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/;
			//var reg2 = /([.][A-Za-z])$/
			var reg3 = /^[A-Za-z]+$/;
			var reg4 = /^[\u4E00-\u9FA5A-Za-z]+$/;
			
			if(!reg1.test($scope.oauthParams.payCallbackUrl)){
				return alert("payCallbackUrl请使用正确的格式");
			};
			
			if(!reg1.test($scope.oauthParams.redirectUrl)){
				return alert("payCallbackUrl请使用正确的格式");
			};
			
			if(!reg3.test($scope.oauthParams.appName)){
				return alert("app名称只能输入英文");
			}
			
			if(!reg4.test($scope.oauthParams.company)){
				return alert("公司名称只能输入英文和汉字");
			}
			
			var params = {
				"appName"        : $scope.oauthParams.appName,
				"company"        : $scope.oauthParams.company,
				//"clientId"       : $scope.oauthParams.clientId,
				"clientSecret"   : $scope.oauthParams.clientSecret,
				"skipUserGrant"  : $scope.oauthParams.skipUserGrant,
				"redirectUrl"    : $scope.oauthParams.redirectUrl,
				"payCallbackUrl" : $scope.oauthParams.payCallbackUrl,
			};
			
			console.log(params);
			util.post(addUrl, params, function(data){
				alert("添加成功！");
				$('.modal').modal('hide');
				$scope.oauthList();
			},function(data){
				if(data.id == 2){
					alert("添加失败");
				}else if(data.id == 7){
					alert("数据重复");
				}
			});
		}
		
		//oauth管理 获取列表
		$scope.listCount = function(){
			var getListCount = config.apiUrlPrefix + "oauth_app/count";
			util.post(getListCount, {}, function(data){
				$scope.totalItems = data;
				console.log(data);
			});
		}
		
		$scope.oauthList = function(){
			var skip = ($scope.currentPage - 1) * $scope.itemPrePage;
			var params = {
				"limit" : $scope.itemPrePage,
				"skip"  : skip
			};
			
			var getListUrl = config.apiUrlPrefix + "oauth_app/";
			util.post(getListUrl, params, function(data){
				console.log(data);
				$scope.oauthData = data;
			});
		}
		
		$scope.getOneOAuthInfo = function(item){
			var getOneOAuthUrl = config.apiUrlPrefix + "oauth_app/getOne/";
			
			$scope.currentItem = item;
			
			util.post(getOneOAuthUrl, {clientId : item.clientId}, function(data){
				if(data){
					$scope.oauthParams.appName        = data.appName;
					$scope.oauthParams.clientId       = data.clientId;
					$scope.oauthParams.clientSecret   = data.clientSecret;
					$scope.oauthParams.company        = data.company;
					$scope.oauthParams.payCallbackUrl = data.payCallbackUrl;
					$scope.oauthParams.redirectUrl    = data.redirectUrl;
					$scope.oauthParams.skipUserGrant  = data.skipUserGrant;
				}
			})
		}
		
		//oauth管理 修改
		$scope.oauthModify = function(){
			var oauthModifyUrl = config.apiUrlPrefix + "oauth_app/";
			
			var reg1 = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)/;
			var reg2 = /([.][cC][oO][mM])$/;
			var reg3 = /^[A-Za-z]+$/;
			var reg4 = /^[\u4E00-\u9FA5A-Za-z]+$/;
			
			if(!reg1.test($scope.oauthParams.payCallbackUrl)){
				return alert("payCallbackUrl请使用http://或https://作为开头");
			};
			
			if(!reg2.test($scope.oauthParams.payCallbackUrl)){
				return alert("payCallbackUrl请使用.com结尾");
			};
			
			if(!reg1.test($scope.oauthParams.redirectUrl)){
				return alert("redirectUrl请使用http://或https://作为开头");
			};
			
			if(!reg2.test($scope.oauthParams.redirectUrl)){
				return alert("redirectUrl请使用.com结尾");
			};
			
			if(!reg3.test($scope.oauthParams.appName)){
				return alert("app名称只能输入英文");
			}
			
			if(!reg4.test($scope.oauthParams.company)){
				return alert("公司名称只能输入英文和汉字");
			}
			
			var params = {
				"appName"        : $scope.oauthParams.appName,
				"company"        : $scope.oauthParams.company,
				"clientId"       : $scope.oauthParams.clientId,
				"clientSecret"   : $scope.oauthParams.clientSecret,
				"skipUserGrant"  : $scope.oauthParams.skipUserGrant,
				"redirectUrl"    : $scope.oauthParams.redirectUrl,
				"payCallbackUrl" : $scope.oauthParams.payCallbackUrl,
			}
			
			util.http("PUT", oauthModifyUrl, params, function(data){
					alert("修改成功");
					$('.modal').modal('hide');
					$scope.currentItem.payCallbackUrl  = $scope.oauthParams.payCallbackUrl;
					$scope.currentItem.redirectUrl     = $scope.oauthParams.redirectUrl;
					$scope.currentItem.clientSecret    = $scope.oauthParams.clientSecret;
					$scope.currentItem.skipUserGrant   = $scope.oauthParams.skipUserGrant;
			}, function(data){
				if(data.id == 2){
					alert("修改失败，缺少clientId");
				}else{
					alert("不明原因修改失败");
				}
			})
		}
		
		//oauth管理 删除
		$scope.deleteOauthRecord = function(clientId){
			var oauthDeleteUrl = config.apiUrlPrefix + "oauth_app/";
			console.log(oauthDeleteUrl);
			var con;
			con = confirm("是否删除");
			if(con == true){
				util.http("DELETE", oauthDeleteUrl, {clientId:clientId}, function(data){
						alert("删除成功");
						$scope.oauthList();
				},function(data){
					if(data.id == 2){
						alert("删除失败，缺少clientId")
					}else{
						alert("删除失败")
					}
				})
			}else{
				$scope.oauthList();
			};
		}
		
		// 搜索管理员账号
		$scope.managerSearch = function (){
			//util.post(config.apiUrlPrefix + "tabledb/query", {
			util.post(config.apiUrlPrefix + "admin/managerSearch", {
				_id:$scope.managerSearchById,
				username:$scope.managerSearchByUsername,
			}, function (data) {
				data = data || {};
				$scope.managerList = data.searchManagerList ;
				$scope.totalItems = data.total || 0;
			});
		}
		/*
		$scope.managerSearch = function (){
			$scope.query = {
				roleId:10,
				_id:$scope.managerSearchById,
				username:$scope.managerSearchByUsername,
			};
			util.post(config.apiUrlPrefix + "tabledb/query", {
				tableName:"user",
				roleId:10,
				page:$scope.currentPage,
				pageSize:$scope.pageSize,
				query:$scope.query,
			}, function (data) {
				data = data || {};
				$scope.managerList = data.data || [];
				$scope.totalItems = data.total || 0;
			});
		}*/
		// 新建管理员账号
		$scope.newManager = function (){
			
		}
		
		$scope.getDomainList = function (){
			//alert("asdasdasdasd");
			$scope.selectMenuItem = "domain";
			util.post(config.apiUrlPrefix + "admin/getDomainList", {
				page:$scope.domainCurrentPage,
				pageSize:$scope.pageSize,
			}, function (data) {
				data = data || {};
				$scope.domainList = data.domainList || [];
				$scope.totalItems = data.total || 0;
			});
		}
		//搜索域名
		$scope.domainSearchById;
		$scope.domainSearchByUsername = "";
		$scope.domainSearchByDomain = "";
		$scope.domainSearch = function (){
			var username = $scope.domainSearchByUsername == "" ? undefined : $scope.domainSearchByUsername;
			var domain = $scope.domainSearchByDomain == "" ? undefined : $scope.domainSearchByDomain;
			$scope.query = {
				_id:$scope.domainSearchById,
				username:username,
				domain:domain,
			};
			util.post(config.apiUrlPrefix + "tabledb/query", {
				tableName:"website_domain",
				page:$scope.userCurrentPage,
				pageSize:$scope.pageSize,
				query:$scope.query,
			}, function (data) {
				data = data || {};
				$scope.domainList = data.data || [];
				$scope.totalItems = data.total || 0;
			});
		}
		//获取VIP列表
		$scope.getVIPList = function (){
			//alert("asdasdasdasd");
			$scope.selectMenuItem = "vip";
			util.post(config.apiUrlPrefix + "admin/getVIPList", {
				page:$scope.VIPCurrentPage,
				pageSize:$scope.pageSize,
			}, function (data) {
				data = data || {};
				$scope.VIPList = data.VIPList || [];
				$scope.totalItems = data.total || 0;
			});
		}

		$scope.getTemplates = function () {
			$scope.selectMenuItem = "templates";
            util.html('#websiteTemplate', websiteTemplateContent);
        };
		//搜索VIP
		$scope.vipSearchById;
		$scope.vipSearchByUsername = "";
		$scope.vipSearch = function (){
			var username = $scope.vipSearchByUsername == "" ? undefined : $scope.vipSearchByUsername;
			$scope.query = {
				_id:$scope.vipSearchById,
				username:username,
			};
			util.post(config.apiUrlPrefix + "tabledb/query", {
				tableName:"vip",
				page:$scope.VIPCurrentPage,
				pageSize:$scope.pageSize,
				query:$scope.query,
			}, function (data) {
				data = data || {};
				$scope.VIPList = data.data || [];
				$scope.totalItems = data.total || 0;
			});
		}
		
		// 获取用户列表
		$scope.getUserList = function (){
			$scope.selectMenuItem = "user";
			util.post(config.apiUrlPrefix + "admin/getUserList", {
				page:$scope.userCurrentPage,
				pageSize:$scope.pageSize,
			}, function (data) {
				data = data || {};
				$scope.userList = data.userList || [];
				$scope.totalItems = data.total || 0;
			});
		}
		//搜索用户
		$scope.userSearch = function (){
			$scope.query = {
				_id:$scope.userSearchById,
				username:$scope.userSearchByUsername,
			};
			util.post(config.apiUrlPrefix + "tabledb/query", {
				tableName:"user",
				page:$scope.userCurrentPage,
				pageSize:$scope.pageSize,
				query:$scope.query,
			}, function (data) {
				data = data || {};
				$scope.userList = data.data || [];
				$scope.totalItems = data.total || 0;
			});
		}
		
		// 点击编辑用户
		$scope.clickEditUser = function (user) {

		}
		// 点击禁用用户
		$scope.clickEnableUser = function (user) {
			user.roleId = user.roleId == -1 ? 0 : -1;
			util.post(config.apiUrlPrefix + "user/updateByName", {username:user.username, roleId:user.roleId}, function () {
			});
		}
		// 点击删除用户
		$scope.clickDeleteUser = function (user) {
			util.post(config.apiUrlPrefix + "user/deleteByName", user, function () {
				user.isDelete = true;
			});
		}

		//用户日志列表
		$scope.getUserLogList = function () {
			$scope.selectMenuItem = "userLog";
			util.post(config.apiUrlPrefix + "admin/getUserLogList", {
				page:$scope.userLogCurrentPage,
				pageSize:$scope.pageSize,
			}, function (data) {
				data = data || {};
				$scope.userLogList = data.userLogList || [];
				$scope.totalItems = data.total || 0;
			});
		}
		
		//创建用户日志
		$scope.createUserLog = function () {
			util.post(config.apiUrlPrefix + "admin/insertUserLog", {
				createAt:"2017-10-17 11:41:07",
				username:"lizq",
				userip:"0.0.0.0",
				operation:"delete",
				description:"info",
				targetType:"user_log",
				targetId:0,
			}, function (data) {
				data = data || {};
				//$scope.userLogList = data.userLogList || [];
				//$scope.totalItems = data.total || 0;
				var newUserLog = data.userLogList || [];
				if(newUserLog){
					alert("创建成功！");
				}
			});
		}
		
		// 获取站点列表
		$scope.getSiteList = function () {
			$scope.selectMenuItem = "site";
			util.post(config.apiUrlPrefix + "admin/getSiteList", {
				page:$scope.siteCurrentPage,
				pageSize: $scope.pageSize,
			}, function (data) {
				data = data || {};
				$scope.siteList = data.siteList || [];
				$scope.totalItems = data.total || 0;
			});
		};
		$scope.getInit = function (sensitiveItem, site) {
			return (site.sensitiveWordLevel & sensitiveItem.trueValue);
        };

		$scope.setSensitive = function (sensitiveItem, site) {
			if (site[sensitiveItem.result] > 0){// 取消权限
                site.sensitiveWordLevel = site.sensitiveWordLevel | sensitiveItem.trueValue;
			}else{
                site.sensitiveWordLevel = site.sensitiveWordLevel ^ sensitiveItem.trueValue;
			}

			site.sitename = site.name;
            util.post(config.apiUrlPrefix + 'website/updateByName', site, function (data) {
                Message.info("权限修改成功!!!");
            }, function () {
                Message.warning("权限修改失败!!!");
            });
        };

		//搜索网站
		$scope.siteSearchById;
		$scope.siteSearchByUsername = "";
		$scope.siteSearchBySitename = "";
		
		$scope.siteSearch = function (){
			var username = $scope.siteSearchByUsername == "" ? undefined : $scope.siteSearchByUsername;
			var sitename = $scope.siteSearchBySitename == "" ? undefined : $scope.siteSearchBySitename;
			$scope.query = {
				_id:$scope.siteSearchById,
				username:username,
				name:sitename,
			};
			util.post(config.apiUrlPrefix + "tabledb/query", {
				tableName:"website",
				page:$scope.userCurrentPage,
				pageSize:$scope.pageSize,
				query:$scope.query,
			}, function (data) {
				data = data || {};
				$scope.siteList = data.data || [];
				$scope.totalItems = data.total || 0;
			});
		};

		// 点击编辑站点
		$scope.clickEditSite = function () {

		};
		// 点击禁用的站点
		$scope.clickEnableSite = function (site) {
			site.state = site.state == -1 ? 0 :  -1;
			util.post(config.apiUrlPrefix + "website/updateByName", {username:site.username, sitename:site.name, state:site.state}, function () {
			});
		};
		// 点击删除站点
		$scope.clickDeleteSite = function (site) {
			util.post(config.apiUrlPrefix + "website/deleteById", {websiteId:site._id}, function () {
				site.isDelete = true;
			});
		};

		//
		$scope.getoperationLogList = function () {
			$scope.selectMenuItem = "operationLog";
		};
		
		$scope.getFileCheckList = function () {
			$scope.selectMenuItem = "fileCheck";
		};

		// wiki cmd
		$scope.clickUpsertWikicmd = function() {
			util.post(config.apiUrlPrefix + 'wiki_module/upsert', $scope.query, function(data){
				if (data) {
					Message.info("添加成功");
					$scope.data.push(data);
					$scope.totalItems++;
				} else {
					Message.info("添加失败");
				}
			});
		}

		$scope.insertAll = function () {
			var length = mods.length;
			console.log(length);
			for (var i=0; i<length; i++){
                util.post(config.apiUrlPrefix + 'wiki_module/upsert', mods[i], function(data){
                    if (data) {
                        Message.info("添加成功");
                        $scope.data.push(data);
                        $scope.totalItems++;
                    } else {
                        Message.info("添加失败");
                        console.log(mods[i]);
                    }
                });
			}
        }
	}]);

	return htmlContent;
});












