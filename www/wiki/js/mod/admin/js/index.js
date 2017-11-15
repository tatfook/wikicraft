/**
 * Created by wuxiangan on 2016/12/21.
 */

define([
	'app',
	'helper/util',
    'helper/mods',
	'text!wikimod/admin/html/index.html',
    'templates.js',
    'pageTemplates.js',
    'text!wikimod/admin/html/templates.html',
	'/wiki/js/lib/md5.js',
], function (app, util, mods, htmlContent, websiteTemplateContent) {
	app.factory('goodsFactory',[function(){
		var currentAdditionalField = {}
		var item;

		//接受外部数据
		currentAdditionalField.itemSet = function(newItem){
			item = newItem;
		}
		//返回数据
		currentAdditionalField.name = "hello world"
		currentAdditionalField.itemGet = function(){
			return item;
		}

		return currentAdditionalField;
	}]);
	app.registerController('goodsController',['$scope','goodsFactory',function($scope,goodsFactory){
		$scope.currentAdditionalField = goodsFactory.itemGet()
	}]);
	app.registerController('indexController', ['$scope', '$auth', 'Account','modal', 'Message', '$http', '$uibModal','goodsFactory',function ($scope, $auth, Account, modal, Message, $http, $uibModal, goodsFactory, item) {
		var urlPrefix = "/wiki/js/mod/admin/js/";
		var tableName = "user";
		$scope.selectMenuItem = "manager";
		$scope.pageSize = 15;
		$scope.managerCurrentPage = 1;
		$scope.operationLogCurrentPage = 1;
		$scope.userCurrentPage = 1;
		$scope.siteCurrentPage = 1;
		$scope.domainCurrentPage = 1;
		$scope.fileCheckCurrentPage = 1;
		$scope.VIPCurrentPage = 1;
		$scope.totalItems = 0;
		$scope.data = [];
		$scope.oauthData = [];
		$scope.oauthParams = {};
		$scope.oauthParams.skipUserGrant = 1;
		//$scope.roleId = 10;
		$scope.goodsData = [];
		$scope.goodsParams = {};
		
		
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

            var subpage = capitalize($location.search().subpage || 'templates');

            $scope['get'+subpage] 
                ? $scope['get' + subpage]() 
                : $scope.getTemplates();

            function capitalize(str) {
                return str.charAt(0).toUpperCase() + str.slice(1);
            }
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

		$scope.clickEdit = function(x) {
			$scope.query = x;
		}

		
        */

        $scope.clickUpsert = function(query, tableName, ngForm, callBack) {
			util.post(config.apiUrlPrefix + "tabledb/upsert", {
				tableName: tableName,
				query: query,
			}, function(data){
				if (data) {
					Message.info("添加成功");
                    ngForm && ngForm.$setPristine && ngForm.$setPristine();
                    callBack && callBack();
				} else {
					Message.info("添加失败");
				}
			}, function(){
				Message.info("添加失败");
			});
		}

		$scope.clickDelete = function(x, tableName) {
			var deleteConfirm = confirm("确定删除该项么？");
			if(deleteConfirm){
				util.post(config.apiUrlPrefix + "tabledb/delete", {
                    tableName:tableName,
                    query:{
                        _id:x._id,
                    }
                }, function(){
                    $scope.totalItems--;
                    x.isDelete = true;
                });
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
		
		var reg1 = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/|[fF][tT][pP]:\/\/)(([A-Za-z0-9-~_]+)\.)+([A-Za-z0-9-~\/:.s])+$/;
		//var reg2 = /([.][A-Za-z])$/
		var reg3 = /^[A-Za-z]+$/;
		var reg4 = /^[\u4E00-\u9FA5A-Za-z]+$/;
		var reg5 = /^[\u4E00-\u9FA5A-Za-z0-9]+$/;

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
			var reg2 = /([.][A-Za-z])$/
			var reg3 = /^[A-Za-z]+$/;
			var reg4 = /^[\u4E00-\u9FA5A-Za-z0-9]+$/;
			
			// if($scope.oauthParams.payCallbackUrl && !reg1.test($scope.oauthParams.payCallbackUrl)){
			// 	return alert("payCallbackUrl请使用正确的格式");
			// };
			
			// if($scope.oauthParams.redirectUrl && !reg1.test($scope.oauthParams.redirectUrl)){
			// 	return alert("redirectUrl请使用正确的格式");
			// };
			
			if(!reg4.test($scope.oauthParams.appName)){
				return alert("app名称只能输入中文英文数字");
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
			
			var reg1 = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/|[fF][tT][pP]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/;
			//var reg2 = /([.][A-Za-z])$/
			var reg3 = /^[A-Za-z]+$/;
			var reg4 = /^[\u4E00-\u9FA5A-Za-z0-9]+$/;
			
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
		
		
		//商品管理/goodsManager
		$scope.getGoodmnagerList = function(){
			$scope.selectMenuItem = "goodsManager";
			$scope.getGoods();
			$scope.listGoodsCount();
		}
		
		//商品管理判断是否为添加/修改/查看详情
		
		$scope.clickGoodsToggle = function (params,item) {
			$scope.goodsVar = params;
			/*if(params == 1){
				$scope.getOneGoodsInfo(item);
			}*/
			if(params == 2){
				$scope.goodsParams = {};
				$scope.goodsMan = [];
				$scope.goodsParams.is_on_sale = 1;
			}
			if(params == 3){
				$scope.getOneGoodsInfo(item);
			}
		};

		$scope.ceshidianji = function(item){
			goodsFactory.itemSet(item.additional_field)
			$uibModal.open({
				"animation"       :true,
				"ariaLabeledBy"   :"title",
				"ariaDescribedBy" :"body",
				"template"        :`
				<table class="table table-bordered goods">
					<tr>
						<td><strong>name</strong></td>
						<td><strong>displayName</strong></td>
						<td><strong>desc</strong></td>
						<td><strong>required</strong></td>
					</tr>
					<tr ng-repeat="x in currentAdditionalField">
						<td>{{x.name}}</td>
						<td>{{x.displayName}}</td>
						<td>{{x.desc}}</td>
						<td>{{x.required==1?"是":"否"}}</td>
					</tr>
				</table>
			`,
				"controller"      :"goodsController",
				"size"            :"lg",
				"keyboard"        :false,
			})
			.result.then(function(){
				
			},function(){}
			)
		}
		
		//商品列表
		$scope.maxSize     = 10;
		$scope.totalItems  = 0;
		$scope.currentPage = 1;
		
        $scope.itemPrePage = 10;
		
		$scope.listGoodsCount = function(){
			var getListCount = config.apiUrlPrefix + "goods/count";
			util.post(getListCount, {}, function(data){
				$scope.totalItems = data;
				console.log(data);
			});
		}
		
		$scope.getGoods = function(){
			var skip = ($scope.currentPage - 1) * $scope.itemPrePage;
			var params = {
				"limit" : $scope.itemPrePage,
				"skip"  : skip
			};
			
			
			var goodsListUrl = config.apiUrlPrefix + "goods/goodsList";
			util.post(goodsListUrl, params, function(data){
				console.log(data);
				$scope.goodsData = data;
			});
		}
		
		//商品添加
		$scope.goodsAdd = function(){
			var goodsAddUrl = config.apiUrlPrefix + "goods/addGoods";
			$scope.goodsParams.additional_field = $scope.goodsMan;
			
			var params = {
				"subject"           : $scope.goodsParams.subject,
				"app_goods_id"      : $scope.goodsParams.app_goods_id,
				"body"              : $scope.goodsParams.body,
				"price"             : $scope.goodsParams.price,
				"default_buy_count" : $scope.goodsParams.default_buy_count,
				"app_name"          : $scope.goodsParams.app_name,
				"is_on_sale"        : $scope.goodsParams.is_on_sale,
				"additional_field"  : $scope.goodsParams.additional_field,
			}
			util.post(goodsAddUrl, params, function(data){
				$scope.getGoods();
			});
		}
		
		//商品信息修改
		$scope.goodsModify = function(){
			var goodsModifyUrl = config.apiUrlPrefix + "goods/modifyGoods";
			$scope.goodsParams.additional_field = $scope.goodsMan;
			
			var params = {
				"subject"           : $scope.goodsParams.subject,
				"goods_id"          : $scope.goodsParams.goods_id,
				"app_goods_id"      : $scope.goodsParams.app_goods_id,
				"body"              : $scope.goodsParams.body,
				"price"             : $scope.goodsParams.price,
				"default_buy_count" : $scope.goodsParams.default_buy_count,
				"app_name"          : $scope.goodsParams.app_name,
				"is_on_sale"        : $scope.goodsParams.is_on_sale,
				"additional_field"  : $scope.goodsParams.additional_field,
			}
			util.post(goodsModifyUrl, params, function(data){
				console.log(data);
				$scope.getGoods();
			});
		}

		$scope.getOneGoodsInfo = function(item){
			var getOneGoodsUrl = config.apiUrlPrefix + "goods/getOne";
			
			$scope.currentItem = item;
			
			util.post(getOneGoodsUrl, {goods_id : item.goods_id}, function(data){
				if(data){
					$scope.goodsParams.subject           = data.subject;
					$scope.goodsParams.goods_id          = data.goods_id;
					$scope.goodsParams.app_goods_id      = data.app_goods_id;
					$scope.goodsParams.body              = data.body;
					$scope.goodsParams.price             = data.price;
					$scope.goodsParams.default_buy_count = data.default_buy_count;
					$scope.goodsParams.app_name          = data.app_name;
					$scope.goodsParams.is_on_sale        = data.is_on_sale;
					$scope.goodsParams.additional_field  = data.additional_field
				}
			})
		}
		
		
		//商品信息删除
		$scope.deleteGoodsRecord = function(goods_id){
			var goodsDeleteUrl = config.apiUrlPrefix + "goods/deleteGoods";
			console.log(goodsDeleteUrl);
			var con;
			con = confirm("是否删除");
			if(con == true){
				util.http("DELETE", goodsDeleteUrl, {goods_id:goods_id}, function(data){
						alert("删除成功");
						$scope.getGoods();
				},function(data){
					if(data.id == 2){
						alert("删除失败，缺少goods_id")
					}else{
						alert("删除失败")
					}
				})
			}else{
				$scope.getGoods();
			};
		}

		//添加多个账号信息
		var goods_count = 0;
		$scope.goodsMan = [];
		$scope.addGoodsAccount = function(){
			$("#changeName").name = goods_count + 1
			$scope.goodsMan.push({})
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
            $scope.showTemplates("website");
        };

		$scope.showTemplates = function (type) {
			switch (type){
				case "website":
                    util.html('#websiteTemplate', websiteTemplateContent);
                    break;
				case "page":
                    util.html('#websiteTemplate', pageTemplateContent);
                    break;
				default:
					break;
			}
        };

        $scope.getSensitiveWords = function () {
            $scope.selectMenuItem = "sensitiveWords";
            $scope.sensitiveWordsList = [];
            $scope.sensitiveWordsQueryName = "";
            $scope.sensitiveWordsQueryStr = "";

            $scope.sensitiveWordsListPageSize = 20;
            $scope.sensitiveWordsListTotalItems = 0;
            $scope.sensitiveWordsListPageIndex = 1;

            $scope.updateSensitiveWordsView = function () {
                if (!$scope.sensitiveWordsQueryStr) {
                    $scope.sensitiveWordsListDisplay = $scope.sensitiveWordsList;
                } else {
                    $scope.sensitiveWordsListDisplay = new Fuse(
                        $scope.sensitiveWordsList,
                        {keys: ['name']}
                    ).search($scope.sensitiveWordsQueryStr);
                }

                $scope.sensitiveWordsListTotalItems = $scope.sensitiveWordsListDisplay.length;

                //initial index in view is 1, not 0
                var minIndex = ($scope.sensitiveWordsListPageIndex - 1) * $scope.sensitiveWordsListPageSize;
                var maxIndex = $scope.sensitiveWordsListPageIndex * $scope.sensitiveWordsListPageSize;

                $scope.sensitiveWordsListDisplayInCurrentPage = $scope.sensitiveWordsListDisplay.filter(function(item, index) {
                    return index >= minIndex && index < maxIndex;
                });
            }

            $scope.unwatchSensitiveWordsQueryStr && $scope.unwatchSensitiveWordsQueryStr();
            $scope.unwatchSensitiveWordsQueryStr = $scope.$watch('sensitiveWordsQueryStr', $scope.updateSensitiveWordsView);

            util.post(config.apiUrlPrefix+"tabledb/query", {
				tableName: 'sensitive_words',
				page: 1,
				pageSize: 1000000,
				query: {},
			}, function(data){
                $scope.sensitiveWordsList = data.data;
                $scope.updateSensitiveWordsView();
            });
        }

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
		}
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
		}

		// 点击编辑站点
		$scope.clickEditSite = function () {

		}
		// 点击禁用的站点
		$scope.clickEnableSite = function () {
			site.state = site.state == -1 ? 0 :  -1;
			util.post(config.apiUrlPrefix + "website/updateByName", {username:site.username, sitename:site.name, state:site.state}, function () {
			});
		}
		// 点击删除站点
		$scope.clickDeleteSite = function (site) {
			util.post(config.apiUrlPrefix + "website/deleteById", {websiteId:site._id}, function () {
				site.isDelete = true;
			});
		}

		
		//
		$scope.getoperationLogList = function () {
			$scope.selectMenuItem = "operationLog";
		}
		
		$scope.getFileCheckList = function () {
			$scope.selectMenuItem = "fileCheck";
		}

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
