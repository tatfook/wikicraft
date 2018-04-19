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
    'Fuse',
], function (app, util, mods, htmlContent, websiteTemplateContent, pageTemplateContent, textWikimodAdminHtmlTemplatesHtml, md5, Fuse) {
    /********** 商品管理 Factory 开始 **********/
    app.factory('goodsFactory', [function () {
        var currentAdditionalField = {}
        var item;

        //接受外部数据
        currentAdditionalField.itemSet = function (newItem) {
            item = newItem;
        }
        //返回数据
        currentAdditionalField.name = "hello world"
        currentAdditionalField.itemGet = function () {
            return item;
        }

        return currentAdditionalField;
    }]);
    /********** 商品管理 Factory 结束 **********/

    function registerController(wikiBlock) {
        app.registerController('indexController',
            ['$scope', '$auth', '$sce', 'Account', 'modal', 'Message', '$http', 'goodsFactory', '$uibModal',
                function ($scope, $auth, $sce, Account, modal, Message, $http, goodsFactory, $uibModal) {

                    /********** Common and Init 开始 **********/
                    var urlPrefix = "/wiki/js/mod/admin/js/";

                    //进入后台默认页面
                    $scope.selectMenuItem = "manager";

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
                        $scope.getManagerList();
                    }

                    $scope.$watch('$viewContentLoaded', init);

                    $scope.getStyleClass = function (item) {
                        if ($scope.selectMenuItem == item) {
                            return "panel-primary";
                        }
                        return;
                    }

                    /********** Common and Init 结束 **********/



                    /********** 管理员管理开始 **********/

                    $scope.managerPageSize = 15;
                    $scope.managerCurrentPage = 1;
                    $scope.managerSearchById;
                    $scope.managerSearchByUsername;
                    $scope.managerTotalItems = 0;

                    // 获取管理员列表
                    $scope.getManagerList = function () {
                        //alert("asdasdasdasd");
                        $scope.selectMenuItem = "manager";
                        $scope.managerSearchById;
                        $scope.managerSearchByUsername = "";
                        util.post(config.apiUrlPrefix + "admin/getManagerList", {
                            page: $scope.managerCurrentPage,
                            pageSize: $scope.managerPageSize,
                        }, function (data) {
                            data = data || {};
                            $scope.managerList = data.managerList || [];
                            $scope.managerTotalItems = data.total || 0;
                        });
                    }

                    // 搜索管理员账号
                    $scope.managerSearch = function () {
                        //util.post(config.apiUrlPrefix + "tabledb/query", {
                        util.post(config.apiUrlPrefix + "admin/managerSearch", {
                            _id: $scope.managerSearchById,
                            username: $scope.managerSearchByUsername,
                        }, function (data) {
                            data = data || {};
                            $scope.managerList = data.searchManagerList;
                            $scope.managerTotalItems = data.total || 0;
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
                            $scope.managerTotalItems = data.total || 0;
                        });
                    }*/

                    // 新建管理员账号
                    $scope.newManager = function () {
                    }

                    /********** 管理员管理结束 **********/



                    /********** 操作日志开始 **********/
                    $scope.operationLogCurrentPage = 1;

                    $scope.getoperationLogList = function () {
                        $scope.selectMenuItem = "operationLog";
                    }

                    /********** 操作日志结束 **********/



                    /********** 用户管理开始 **********/
                    $scope.userCurrentPage = 1;
                    $scope.userPageSize = 15;
                    $scope.userTotalItems = 0;
                    $scope.format = 'yyyy-MM-dd HH:mm:ss';
                    $scope.user_to_lock = {};

                    // 获取用户列表
                    $scope.getUserList = function () {
                        $scope.selectMenuItem = "user";
                        util.post(config.apiUrlPrefix + "admin/getUserList", {
                            page: $scope.userCurrentPage,
                            pageSize: $scope.userPageSize,
                        }, function (data) {
                            data = data || {};
                            $scope.userList = data.userList || [];
                            $scope.userTotalItems = data.total || 0;
                        });
                    }
                    //搜索用户
                    $scope.userSearch = function () {
                        var query = {
                            _id: $scope.userSearchById,
                            username: $scope.userSearchByUsername,
                        };
                        util.post(config.apiUrlPrefix + "tabledb/query", {
                            tableName: "user",
                            page: $scope.userCurrentPage,
                            pageSize: $scope.userPageSize,
                            query: query,
                        }, function (data) {
                            data = data || {};
                            $scope.userList = data.data || [];
                            $scope.userTotalItems = data.total || 0;
                        });
                    }
                    
                    $scope.getUsername = function(q) {
                        return $http.get(config.apiUrlPrefix + "admin/searchUsername", {
                          params: {
                            q: q,
                          }
                        }).then(function(response){
                          return response.data.data.map(function(username){
                            return username;
                          });
                        });
                      };

                    // 点击编辑用户
                    $scope.clickEditUser = function (user) {

                    }
                    // 点击禁用用户
                    $scope.clickEnableUser = function (user) {
                        user.roleId = user.roleId == -1 ? 0 : -1;
                        util.post(config.apiUrlPrefix + "user/updateByName", { username: user.username, roleId: user.roleId }, function () {
                        });
                    }
                    // 点击删除用户
                    $scope.clickDeleteUser = function (user) {
                        util.post(config.apiUrlPrefix + "user/deleteByName", user, function () {
                            user.isDelete = true;
                        });
                    }

                    //获取用户首页
                    $scope.linkToUserPage = function (user) {
                        return config.httpProto + '://' +
                            config.apiHost + "/" + user.username
                    }


                    $scope.isUserLocked = function (user) {
                        if (!user.locked_deadline) {
                            return false
                        }
                        var now = new Date()
                        var last_locked_deadline = new Date(user.locked_deadline)
                        if (now - last_locked_deadline > 0) {
                            return false
                        }
                        return true
                    }

                    //按时间封禁用户
                    $scope.clickLockUser = function (user) {
                        $scope.user_to_lock = user
                        var now = new Date()
                        if (!user.locked_deadline) {
                            $scope.locked_deadline = now
                        } else {
                            var last_locked_deadline = new Date(user.locked_deadline)
                            $scope.locked_deadline = (
                                now - last_locked_deadline > 0) ? now : last_locked_deadline
                        }
                        $(".lock_user").modal("show");
                    }

                    $scope.lockUser = function (user) {
                        util.post(config.apiUrlPrefix + "admin/lockUser", {
                            "username": user.username,
                            "locked_deadline": dateToString($scope.locked_deadline),
                        }, function (data) {
                            user.locked_deadline = data.locked_deadline
                        });
                    }

                    $scope.clickUnLockUser = function (user) {
                        config.services.confirmDialog({
                            "title": "解封帐号",
                            "content": "是否解封 " + user.username + "的帐号?",
                            "cancelBtn": true
                        }, function () {
                            $scope.unlockUser(user)
                        });
                    }

                    $scope.unlockUser = function (user) {
                        util.post(config.apiUrlPrefix + "admin/unLockUser", {
                            "username": user.username,
                        }, function (data) {
                            user.locked_deadline = data.locked_deadline
                        });
                    }

                    // 处理封禁时间
                    $scope.addLockDuration = function (y, m, d) {
                        $scope.locked_deadline.setDate($scope.locked_deadline.getDate() + d)
                        $scope.locked_deadline.setMonth($scope.locked_deadline.getMonth() + m)
                        $scope.locked_deadline.setFullYear($scope.locked_deadline.getFullYear() + y)
                        $scope.locked_deadline = new Date($scope.locked_deadline)
                    }

                    $scope.resetDuration = function () {
                        $scope.locked_deadline = new Date()
                    }

                    // 格式化datetime
                    var dateToString = function (dateObj) {
                        var year = dateObj.getFullYear()
                        var month = addDateTimePrefix(dateObj.getMonth() + 1)
                        var day = addDateTimePrefix(dateObj.getDate())
                        var hour = addDateTimePrefix(dateObj.getHours())
                        var minute = addDateTimePrefix(dateObj.getMinutes())
                        var second = addDateTimePrefix(dateObj.getSeconds())

                        var date = year + "-" + month + "-" + day
                        var time = hour + ":" + minute + ":" + second
                        return date + " " + time
                    }

                    var addDateTimePrefix = function (num) {
                        if (num < 10) {
                            num = "0" + num
                        }
                        return num
                    }


                    /********** 用户管理结束 **********/



                    /********** OAuth管理开始 **********/

                    $scope.oauthVar = 1;
                    $scope.OAuthMaxSize = 10;
                    $scope.OAuthTotalItems = 0;
                    $scope.OAuthCurrentPage = 1;
                    $scope.OAuthItemPrePage = 10;

                    $scope.oauthData = [];
                    $scope.oauthParams = {};
                    $scope.oauthParams.skipUserGrant = 1;

                    //判定是否为添加框/修改框
                    $scope.clickOauthToggle = function (params, item) {
                        $scope.oauthVar = params;
                        if (params == 1) {
                            $scope.oauthParams = {};
                            $scope.oauthParams.skipUserGrant = 1;
                        }
                        if (params == 2) {
                            $scope.getOneOAuthInfo(item);
                        }
                    };

                    $scope.selectOAuthValue = function () {
                        var randomStr = hex_md5(new Date().toLocaleTimeString());
                        $scope.oauthParams.clientSecret = randomStr;
                    }

                    //oauth管理菜单
                    $scope.getOauthList = function () {
                        $scope.selectMenuItem = "oauth";
                        $scope.oauthList();
                        $scope.listCount();
                    }

                    //oauth管理添加数据
                    $scope.oauthAdd = function () {
                        var addUrl = config.apiUrlPrefix + "oauth_app/new";

                        if (!$scope.oauthParams.appName) {
                            return alert("请输入app名称");
                        };

                        if (!$scope.oauthParams.company) {
                            return alert("请输入公司名称");
                        };

                        if (!$scope.oauthParams.clientSecret) {
                            return alert("请输入clientSecret");
                        };

                        var reg1 = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/|[fF][tT][pP]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/;
                        //var reg2 = /([.][A-Za-z])$/
                        var reg3 = /^[A-Za-z]+$/;
                        var reg4 = /^[\u4E00-\u9FA5A-Za-z]+$/;

                        // if(!reg1.test($scope.oauthParams.payCallbackUrl)){
                        //     return alert("payCallbackUrl请使用正确的格式");
                        // };

                        // if(!reg1.test($scope.oauthParams.redirectUrl)){
                        //     return alert("payCallbackUrl请使用正确的格式");
                        // };

                        if (!reg3.test($scope.oauthParams.appName)) {
                            return alert("app名称只能输入英文");
                        }

                        if (!reg4.test($scope.oauthParams.company)) {
                            return alert("公司名称只能输入英文和汉字");
                        }

                        var params = {
                            "appName": $scope.oauthParams.appName,
                            "company": $scope.oauthParams.company,
                            //"clientId"       : $scope.oauthParams.clientId,
                            "clientSecret": $scope.oauthParams.clientSecret,
                            "skipUserGrant": $scope.oauthParams.skipUserGrant,
                            "redirectUrl": $scope.oauthParams.redirectUrl,
                            "payCallbackUrl": $scope.oauthParams.payCallbackUrl,
                        };

                        util.post(addUrl, params, function (data) {
                            alert("添加成功！");
                            $('.modal').modal('hide');
                            $scope.oauthList();
                        }, function (data) {
                            if (data.id == 2) {
                                alert("添加失败");
                            } else if (data.id == 7) {
                                alert("数据重复");
                            }
                        });
                    }

                    //oauth管理 获取列表
                    $scope.listCount = function () {
                        var getListCount = config.apiUrlPrefix + "oauth_app/count";
                        util.post(getListCount, {}, function (data) {
                            $scope.OAuthTotalItems = data;
                        });
                    }

                    $scope.oauthList = function () {
                        var skip = ($scope.OAuthCurrentPage - 1) * $scope.OAuthItemPrePage;
                        var params = {
                            "limit": $scope.OAuthItemPrePage,
                            "skip": skip
                        };

                        var getListUrl = config.apiUrlPrefix + "oauth_app/";
                        util.post(getListUrl, params, function (data) {
                            $scope.oauthData = data;
                        });
                    }

                    $scope.getOneOAuthInfo = function (item) {
                        var getOneOAuthUrl = config.apiUrlPrefix + "oauth_app/getOne/";

                        $scope.currentItem = item;

                        util.post(getOneOAuthUrl, { clientId: item.clientId }, function (data) {
                            if (data) {
                                $scope.oauthParams.appName = data.appName;
                                $scope.oauthParams.clientId = data.clientId;
                                $scope.oauthParams.clientSecret = data.clientSecret;
                                $scope.oauthParams.company = data.company;
                                $scope.oauthParams.payCallbackUrl = data.payCallbackUrl;
                                $scope.oauthParams.redirectUrl = data.redirectUrl;
                                $scope.oauthParams.skipUserGrant = data.skipUserGrant;
                            }
                        })
                    }

                    //oauth管理 修改
                    $scope.oauthModify = function () {
                        var oauthModifyUrl = config.apiUrlPrefix + "oauth_app/";

                        var reg1 = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/|[fF][tT][pP]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/;
                        //var reg2 = /([.][A-Za-z])$/
                        var reg3 = /^[A-Za-z]+$/;
                        var reg4 = /^[\u4E00-\u9FA5A-Za-z]+$/;

                        // if(!reg1.test($scope.oauthParams.payCallbackUrl)){
                        //     return alert("payCallbackUrl请使用正确的格式");
                        // };

                        // if(!reg1.test($scope.oauthParams.redirectUrl)){
                        //     return alert("payCallbackUrl请使用正确的格式");
                        // };

                        if (!reg3.test($scope.oauthParams.appName)) {
                            return alert("app名称只能输入英文");
                        }

                        if (!reg4.test($scope.oauthParams.company)) {
                            return alert("公司名称只能输入英文和汉字");
                        }

                        var params = {
                            "appName": $scope.oauthParams.appName,
                            "company": $scope.oauthParams.company,
                            "clientId": $scope.oauthParams.clientId,
                            "clientSecret": $scope.oauthParams.clientSecret,
                            "skipUserGrant": $scope.oauthParams.skipUserGrant,
                            "redirectUrl": $scope.oauthParams.redirectUrl,
                            "payCallbackUrl": $scope.oauthParams.payCallbackUrl,
                        }

                        util.http("PUT", oauthModifyUrl, params, function (data) {
                            alert("修改成功");
                            $('.modal').modal('hide');
                            $scope.currentItem.payCallbackUrl = $scope.oauthParams.payCallbackUrl;
                            $scope.currentItem.redirectUrl = $scope.oauthParams.redirectUrl;
                            $scope.currentItem.clientSecret = $scope.oauthParams.clientSecret;
                            $scope.currentItem.skipUserGrant = $scope.oauthParams.skipUserGrant;
                        }, function (data) {
                            if (data.id == 2) {
                                alert("修改失败，缺少clientId");
                            } else {
                                alert("不明原因修改失败");
                            }
                        })
                    }

                    //oauth管理 删除
                    $scope.deleteOauthRecord = function (clientId) {
                        var oauthDeleteUrl = config.apiUrlPrefix + "oauth_app/";
                        // console.log(oauthDeleteUrl);
                        var con;
                        con = confirm("是否删除");
                        if (con == true) {
                            util.http("DELETE", oauthDeleteUrl, { clientId: clientId }, function (data) {
                                alert("删除成功");
                                $scope.oauthList();
                            }, function (data) {
                                if (data.id == 2) {
                                    alert("删除失败，缺少clientId")
                                } else {
                                    alert("删除失败")
                                }
                            })
                        } else {
                            $scope.oauthList();
                        };
                    }

                    /********** OAuth管理结束 **********/



                    /********** 商品管理开始 **********/

                    $scope.goodsData = [];
                    $scope.goodsParams = {};

                    $scope.getGoodmnagerList = function () {
                        $scope.selectMenuItem = "goodsManager";
                        $scope.getGoods();
                        $scope.listGoodsCount();
                    }

                    //商品管理判断是否为添加/修改/查看详情
                    $scope.clickGoodsToggle = function (params, item) {
                        $scope.goodsVar = params;
                        /*if(params == 1){
                            $scope.getOneGoodsInfo(item);
                        }*/
                        if (params == 2) {
                            $scope.goodsParams = {};
                            $scope.goodsMan = [];
                            $scope.goodsParams.is_on_sale = 1;
                        }
                        if (params == 3) {
                            $scope.getOneGoodsInfo(item);
                        }
                    };

                    $scope.additionalfieldSee = function (item) {
                        goodsFactory.itemSet(item.additional_field)
                        $uibModal.open({
                            "animation": true,
                            "ariaLabeledBy": "title",
                            "ariaDescribedBy": "body",
                            "templateUrl": config.wikiModPath + 'admin/html/goods_templates.html',
                            "controller": "goodsController",
                            "size": "lg",
                            "keyboard": false,
                        })
                            .result.then(function () {

                            }, function () { }
                            )
                    }


                    //商品列表
                    $scope.GoodsMaxSize = 10;
                    $scope.GoodsTotalItems = 0;
                    $scope.GoodsCurrentPage = 1;

                    $scope.GoodsItemPrePage = 10;

                    $scope.listGoodsCount = function () {
                        var getListCount = config.apiUrlPrefix + "goods/count";
                        util.post(getListCount, {}, function (data) {
                            $scope.GoodsTotalItems = data;
                        });
                    }

                    $scope.getGoods = function () {
                        var skip = ($scope.GoodsCurrentPage - 1) * $scope.GoodsItemPrePage;
                        var params = {
                            "limit": $scope.itemPrePage,
                            "skip": skip
                        };


                        var goodsListUrl = config.apiUrlPrefix + "goods/goodsList";
                        util.post(goodsListUrl, params, function (data) {
                            $scope.goodsData = data;
                        });
                    }

                    //商品添加
                    $scope.goodsAdd = function () {
                        var goodsAddUrl = config.apiUrlPrefix + "goods/addGoods";

                        var reg1 = /^[A-Za-z]+$/;
                        var reg2 = /^[\u4E00-\u9FA5A-Za-z0-9]+$/;
                        var reg3 = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/;
                        var reg4 = /^[1-9]\d*$/;
                        var reg5 = /^[0-9]*$/;


                        if (!reg3.test($scope.goodsParams.subject)) {
                            return alert("商品名称请使用正确的格式");
                        };

                        if (!reg3.test($scope.goodsParams.app_goods_id)) {
                            return alert("第三方ID请使用正确的格式");
                        };

                        if (!reg4.test($scope.goodsParams.price)) {
                            return alert("价格请输入正确数字");
                        };

                        if (!reg4.test($scope.goodsParams.exchange_rate)) {
                            return alert("汇率请输入正确数字");
                        };

                        if (!reg3.test($scope.goodsParams.app_name)) {
                            return alert("第三方交易账号请输入正确的格式");
                        };

                        if (!reg5.test($scope.goodsParams.app_goods_id)) {
                            return alert("第三方id仅可输入数字");
                        };

                        if (!reg4.test($scope.goodsParams.min_buy_count)) {
                            return alert("请输入正确的最少购买数量");
                        };

                        if (!reg4.test($scope.goodsParams.max_buy_count)) {
                            return alert("请输入正确的最大购买数量");
                        };


                        $scope.goodsParams.additional_field = $scope.goodsMan;
                        var params = {
                            "subject": $scope.goodsParams.subject,
                            "app_goods_id": $scope.goodsParams.app_goods_id,
                            "body": $scope.goodsParams.body,
                            "price": $scope.goodsParams.price,
                            "default_buy_count": $scope.goodsParams.default_buy_count,
                            "exchange_rate": $scope.goodsParams.exchange_rate,
                            "min_buy_count": $scope.goodsParams.min_buy_count,
                            "max_buy_count": $scope.goodsParams.max_buy_count,
                            "app_name": $scope.goodsParams.app_name,
                            "is_on_sale": $scope.goodsParams.is_on_sale,
                            "additional_field": $scope.goodsParams.additional_field,
                        }
                        util.post(goodsAddUrl, params, function (data) {
                            alert("添加成功！");
                            $('.modal').modal('hide')
                            $scope.getGoods();
                            $scope.goodsMan = [];
                        }, function (data) {
                            if (data.id == 2) {
                                alert("添加失败");
                            }
                        });
                    }

                    //商品信息修改
                    $scope.goodsModify = function () {
                        var goodsModifyUrl = config.apiUrlPrefix + "goods/modifyGoods";

                        var reg1 = /^[A-Za-z]+$/;
                        var reg2 = /^[\u4E00-\u9FA5A-Za-z0-9]+$/;
                        var reg3 = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/;
                        var reg4 = /^[1-9]\d*$/;
                        var reg5 = /^[0-9]*$/;

                        var reg1 = /^[A-Za-z]+$/;
                        var reg2 = /^[\u4E00-\u9FA5A-Za-z0-9]+$/;
                        var reg3 = /^[\u4E00-\u9FA5A-Za-z0-9_]+$/;
                        var reg4 = /^[1-9]\d*$/;
                        var reg5 = /^[0-9]*$/;


                        if (!reg3.test($scope.goodsParams.subject)) {
                            return alert("商品名称请使用正确的格式");
                        };

                        if (!reg3.test($scope.goodsParams.app_goods_id)) {
                            return alert("第三方ID请使用正确的格式");
                        };

                        if (!reg4.test($scope.goodsParams.price)) {
                            return alert("价格请输入正确数字");
                        };

                        if (!reg4.test($scope.goodsParams.exchange_rate)) {
                            return alert("汇率请输入正确数字");
                        };

                        if (!reg3.test($scope.goodsParams.app_name)) {
                            return alert("第三方交易账号请输入正确的格式");
                        };

                        if (!reg4.test($scope.goodsParams.app_goods_id)) {
                            return alert("第三方id仅可输入数字");
                        };

                        if (!reg4.test($scope.goodsParams.min_buy_count)) {
                            return alert("请输入正确的最少购买数量");
                        };

                        if (!reg4.test($scope.goodsParams.max_buy_count)) {
                            return alert("请输入正确的最大购买数量");
                        };


                        $scope.goodsParams.additional_field = $scope.goodsMan.concat($scope.goodsParams.additional_field);

                        var params = {
                            "goods_id": $scope.goodsParams.goods_id,
                            "subject": $scope.goodsParams.subject,
                            "app_goods_id": $scope.goodsParams.app_goods_id,
                            "body": $scope.goodsParams.body,
                            "price": $scope.goodsParams.price,
                            "exchange_rate": $scope.goodsParams.exchange_rate,
                            "default_buy_count": $scope.goodsParams.default_buy_count,
                            "min_buy_count": $scope.goodsParams.min_buy_count,
                            "max_buy_count": $scope.goodsParams.max_buy_count,
                            "app_name": $scope.goodsParams.app_name,
                            "is_on_sale": $scope.goodsParams.is_on_sale,
                            "additional_field": $scope.goodsParams.additional_field,
                        }
                        util.post(goodsModifyUrl, params, function (data) {
                            alert("修改成功！");
                            $('.modal').modal('hide')
                            $scope.getGoods();
                            $scope.goodsMan = [];
                        }, function (data) {
                            if (data.id == 2) {
                                alert("修改失败");
                                $scope.getOneGoodsInfo();
                            }
                        });
                    }

                    $scope.getOneGoodsInfo = function (item) {
                        var getOneGoodsUrl = config.apiUrlPrefix + "goods/getOne";

                        $scope.currentItem = item;

                        util.post(getOneGoodsUrl, { goods_id: item.goods_id }, function (data) {
                            if (data) {
                                $scope.goodsParams.subject = data.subject;
                                $scope.goodsParams.goods_id = data.goods_id;
                                $scope.goodsParams.app_goods_id = data.app_goods_id;
                                $scope.goodsParams.body = data.body;
                                $scope.goodsParams.price = data.price;
                                $scope.goodsParams.default_buy_count = data.default_buy_count;
                                $scope.goodsParams.exchange_rate = data.exchange_rate;
                                $scope.goodsParams.min_buy_count = data.min_buy_count;
                                $scope.goodsParams.max_buy_count = data.max_buy_count;
                                $scope.goodsParams.app_name = data.app_name;
                                $scope.goodsParams.is_on_sale = data.is_on_sale;
                                $scope.goodsParams.additional_field = data.additional_field
                            }
                        })
                    }


                    //商品信息删除
                    $scope.deleteGoodsRecord = function (goods_id) {
                        var goodsDeleteUrl = config.apiUrlPrefix + "goods/deleteGoods";
                        var con;
                        con = confirm("是否删除");
                        if (con == true) {
                            util.http("DELETE", goodsDeleteUrl, { goods_id: goods_id }, function (data) {
                                alert("删除成功");
                                $scope.getGoods();
                            }, function (data) {
                                if (data.id == 2) {
                                    alert("删除失败，缺少goods_id")
                                } else {
                                    alert("删除失败")
                                }
                            })
                        } else {
                            $scope.getGoods();
                        };
                    }

                    //添加多个账号信息
                    var goods_count = 0;
                    $scope.goodsMan = [];
                    $scope.addGoodsAccount = function () {
                        $("#changeName").name = goods_count + 1
                        $scope.goodsMan.push({})
                    }

                    //var goods_count2 = hex_md5(new Date().toLocaleTimeString());
                    $scope.goodsMan = [];
                    $scope.modifyGoodsAccount = function () {
                        $("#changeName").name = hex_md5(new Date().toLocaleTimeString())
                        $scope.goodsMan.push({})
                    }

                    //删除多个账号信息
                    $scope.deleteGoodsMan = function ($index) {
                        $scope.goodsMan.splice($index, 1);
                    }

                    $scope.deleteGoodsMans = function ($index) {
                        $scope.goodsMan.splice($index, 1);
                    }

                    $scope.deleteGoodsParamsAdditionalField = function ($index) {
                        $scope.goodsParams.additional_field.splice($index, 1);
                    }

                    /********** 商品管理结束 **********/

            $scope.getFileCheckList = function () {
                $scope.selectMenuItem = "fileCheck";
            }


                    /********** 网站管理开始 **********/

                    $scope.sitePageSize = 15;
                    $scope.siteCurrentPage = 1;
                    $scope.siteTotalItems = 0;

                    // 获取站点列表
                    $scope.getSiteList = function () {
                        $scope.selectMenuItem = "site";
                        util.post(config.apiUrlPrefix + "admin/getSiteList", {
                            page: $scope.siteCurrentPage,
                            pageSize: $scope.sitePageSize,
                        }, function (data) {
                            data = data || {};
                            $scope.siteList = data.siteList || [];
                            $scope.siteTotalItems = data.total || 0;
                        });
                    }

                    //搜索网站
                    $scope.siteSearchById;
                    $scope.siteSearchByUsername = "";
                    $scope.siteSearchBySitename = "";

                    $scope.siteSearch = function () {
                        var username = $scope.siteSearchByUsername == "" ? undefined : $scope.siteSearchByUsername;
                        var sitename = $scope.siteSearchBySitename == "" ? undefined : $scope.siteSearchBySitename;
                        $scope.query = {
                            _id: $scope.siteSearchById,
                            username: username,
                            name: sitename,
                        };
                        util.post(config.apiUrlPrefix + "tabledb/query", {
                            tableName: "website",
                            page: $scope.siteCurrentPage,
                            pageSize: $scope.sitePageSize,
                            query: $scope.query,
                        }, function (data) {
                            data = data || {};
                            $scope.siteList = data.data || [];
                            $scope.siteTotalItems = data.total || 0;
                        });
                    }

                    // 点击编辑站点
                    $scope.clickEditSite = function () {

                    }

                    // 点击禁用的站点
                    $scope.clickEnableSite = function () {
                        site.state = site.state == -1 ? 0 : -1;
                        util.post(config.apiUrlPrefix + "website/updateByName", { username: site.username, sitename: site.name, state: site.state }, function () {
                        });
                    }

                    // 点击删除站点
                    $scope.clickDeleteSite = function (site) {
                        util.post(config.apiUrlPrefix + "website/deleteById", { websiteId: site._id }, function () {
                            site.isDelete = true;
                        });
                    }

                    /********** 网站管理结束 **********/



                    /********** 域名管理开始 **********/
                    $scope.domainPageSize = 15;
                    $scope.domainCurrentPage = 1;
                    $scope.domainTotalItems = 0;

                    $scope.getDomainList = function () {
                        //alert("asdasdasdasd");
                        $scope.selectMenuItem = "domain";
                        util.post(config.apiUrlPrefix + "admin/getDomainList", {
                            page: $scope.domainCurrentPage,
                            pageSize: $scope.domainPageSize,
                        }, function (data) {
                            data = data || {};
                            $scope.domainList = data.domainList || [];
                            $scope.domainTotalItems = data.total || 0;
                        });
                    }

                    //搜索域名
                    $scope.domainSearchById;
                    $scope.domainSearchByUsername = "";
                    $scope.domainSearchByDomain = "";
                    $scope.domainSearch = function () {
                        var username = $scope.domainSearchByUsername == "" ? undefined : $scope.domainSearchByUsername;
                        var domain = $scope.domainSearchByDomain == "" ? undefined : $scope.domainSearchByDomain;
                        $scope.query = {
                            _id: $scope.domainSearchById,
                            username: username,
                            domain: domain,
                        };
                        util.post(config.apiUrlPrefix + "tabledb/query", {
                            tableName: "website_domain",
                            page: $scope.domainCurrentPage,
                            pageSize: $scope.domainPageSize,
                            query: $scope.query,
                        }, function (data) {
                            data = data || {};
                            $scope.domainList = data.data || [];
                            $scope.domainTotalItems = data.total || 0;
                        });
                    }

                    /********** 域名管理结束 **********/



                    /********** 文件审核开始 **********/
                    const biteToG = 1024 * 1024 * 1024

                    $scope.fileCurrentPage = 1;
                    $scope.filePageSize = 15;
                    $scope.fileTotalItems = 0;
                    $scope.file_types = ["未审核", "已通过", "不通过", "全部"]
                    $scope.files_checking = $scope.file_types[0]

                    var checked_code = {
                        "未审核": 0,
                        "已通过": 1,
                        "不通过": 2,
                        "全部": 3,
                    }

                    $scope.get_file_list = function () {
                        $scope.selectMenuItem = "fileCheck";
                        var checked = undefined
                        if ($scope.files_checking != "全部") {
                            checked = checked_code[$scope.files_checking]
                        }

                        util.post(config.apiUrlPrefix + "admin/getFileList", {
                            page: $scope.fileCurrentPage,
                            pageSize: $scope.filePageSize,
                            checked: checked,
                        }, function (data) {
                            data = data || {};
                            $scope.file_list = data.file_list || [];
                            $scope.fileTotalItems = data.total || 0;
                        });
                    }

                    $scope.change_file_type = function (type) {
                        $scope.files_checking = type
                        $scope.fileCurrentPage = 1;
                        $scope.filePageSize = 15;
                        $scope.fileTotalItems = 0;
                        $scope.get_file_list()
                    }

                    $scope.check_file = function (file, checked) {
                        util.post(config.apiUrlPrefix + "admin/checkFile", {
                            _id: file._id,
                            checked: checked
                        }, function (data) {
                            file.checked = data.checked
                        })
                    }

                    $scope.size_transfer = function (size) {
                        var sizeIsNumber = size && angular.isNumber(size);
                        if (!sizeIsNumber) {
                            return "0KB";
                        }
                        var filesize = size;
                        if (size / 1024 / 1024 / 1024 > 0.1) {
                            size = (size / biteToG).toFixed(2) + "GB";
                            return size;
                        }
                        if (size / 1024 / 1024 > 0.1) {
                            size = (size / 1024 / 1024).toFixed(2) + "MB";
                            return size;
                        }
                        size = (size / 1024).toFixed(2) + "KB";
                        return size;
                    }

                    $scope.file_name_filter = function (filename) {
                        var len_limit = 30
                        if (filename.length > len_limit) {
                            filename = filename.slice(0, len_limit) + "......"
                        }
                        return filename
                    }

                    $scope.playVideo = function (file) {
                        $scope.file_playing = file
                        var videoUrl = $sce.trustAsResourceUrl(file.download_url);

                        var iframe_html = '<iframe src="' + videoUrl + '"></iframe>'
                        $scope.iframe_html = $sce.trustAsHtml(iframe_html)

                        $(".video-modal").modal("show");
                    }

                    $scope.abledToPlay = function (file) {
                        var file_type = file.filename.split(".").pop().toLowerCase()
                        var abled_types = [
                            'avi', 'rmvb', 'rm', 'asf', 'divx',
                            'mpg', 'mpeg', 'mpe', 'wmv', 'mp4',
                            'mkv', 'vob', 'mp3', 'wav', "txt",
                            "pdf", 'jpg', 'png', 'gif'
                        ]
                        if (abled_types.indexOf(file_type) > -1) {
                            return true
                        } else {
                            return false
                        }
                    }

                    $scope.stop = function () {
                        $scope.iframe_html = ''
                    }

                    $scope.check_file_and_stop = function (file, checked) {
                        $scope.check_file(file, checked)
                        $scope.stop()
                    }

                    $scope.clickDeleteFile = function (file) {
                        config.services.confirmDialog({
                            "title": "删除文件",
                            "confirmBtnClass": "btn-danger",
                            "theme": "danger",
                            "content": "确定删除文件吗？"
                        }, function () {
                            util.post(config.apiUrlPrefix + "admin/deleteFile", {
                                _id: file._id,
                            }, function (data) {
                                file.deleted = true
                                $scope.fileTotalItems--
                            })
                        })
                    }


                    /********** 文件审核结束 **********/



                    /********** VIP管理开始 **********/
                    $scope.VIPCurrentPage = 1;
                    $scope.VIPPageSize = 15;
                    $scope.VIPTotalItems = 0;

                    //获取VIP列表
                    $scope.getVIPList = function () {
                        //alert("asdasdasdasd");
                        $scope.selectMenuItem = "vip";
                        util.post(config.apiUrlPrefix + "admin/getVIPList", {
                            page: $scope.VIPCurrentPage,
                            pageSize: $scope.VIPPageSize,
                        }, function (data) {
                            data = data || {};
                            $scope.VIPList = data.VIPList || [];
                            $scope.VIPTotalItems = data.total || 0;
                        });
                    }

                    //搜索VIP
                    $scope.vipSearchById;
                    $scope.vipSearchByUsername = "";
                    $scope.vipSearch = function () {
                        var username = $scope.vipSearchByUsername == "" ? undefined : $scope.vipSearchByUsername;
                        $scope.query = {
                            _id: $scope.vipSearchById,
                            username: username,
                        };
                        util.post(config.apiUrlPrefix + "tabledb/query", {
                            tableName: "vip",
                            page: $scope.VIPCurrentPage,
                            pageSize: $scope.VIPPageSize,
                            query: $scope.query,
                        }, function (data) {
                            data = data || {};
                            $scope.VIPList = data.data || [];
                            $scope.VIPTotalItems = data.total || 0;
                        });
                    }

                    /********** VIP管理结束 **********/



                    /********** 模板管理开始 **********/

                    $scope.getTemplates = function () {
                        $scope.selectMenuItem = "templates";
                        util.html('#websiteTemplate', websiteTemplateContent);
                    };

                    /********** 模板管理结束 **********/



                    /********** 敏感词管理开始 **********/
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
                                    { keys: ['name'] }
                                ).search($scope.sensitiveWordsQueryStr);
                            }

                            $scope.sensitiveWordsListTotalItems = $scope.sensitiveWordsListDisplay.length;

                            //initial index in view is 1, not 0
                            var minIndex = ($scope.sensitiveWordsListPageIndex - 1) * $scope.sensitiveWordsListPageSize;
                            var maxIndex = $scope.sensitiveWordsListPageIndex * $scope.sensitiveWordsListPageSize;

                            $scope.sensitiveWordsListDisplayInCurrentPage = $scope.sensitiveWordsListDisplay.filter(function (item, index) {
                                return index >= minIndex && index < maxIndex;
                            });
                        }

                        $scope.unwatchSensitiveWordsQueryStr && $scope.unwatchSensitiveWordsQueryStr();
                        $scope.unwatchSensitiveWordsQueryStr = $scope.$watch('sensitiveWordsQueryStr', $scope.updateSensitiveWordsView);

                        util.post(config.apiUrlPrefix + "tabledb/query", {
                            tableName: 'sensitive_words',
                            page: 1,
                            pageSize: 1000000,
                            query: {},
                        }, function (data) {
                            $scope.sensitiveWordsList = data.data;
                            $scope.updateSensitiveWordsView();
                        });

                        $scope.clickUpsert = function (query, tableName, ngForm, callBack) {
                            util.post(config.apiUrlPrefix + "tabledb/upsert", {
                                tableName: tableName,
                                query: query,
                            }, function (data) {
                                if (data) {
                                    Message.info("添加成功");
                                    ngForm && ngForm.$setPristine && ngForm.$setPristine();
                                    callBack && callBack();
                                } else {
                                    Message.info("添加失败");
                                }
                            }, function () {
                                Message.info("添加失败");
                            });
                        }

                        $scope.clickDeleteSensitiveWord = function (x, tableName) {
                            var deleteConfirm = confirm("确定删除该项么？");

                            if (deleteConfirm) {
                                util.post(config.apiUrlPrefix + "tabledb/delete", {
                                    tableName: tableName,
                                    query: {
                                        _id: x._id,
                                    }
                                }, function () {
                                    $scope.totalItems--;
                                    x.isDelete = true;
                                });
                            }
                        }
                    }

                    /********** 敏感词管理结束 **********/



                    /********** 在线统计|留存分析|新用户分析|支付情况|服务器监控|开始 **********/
                    $scope.serverCurrentPage = 1;

                    $scope.clickServerMenuItem = function () {
                        alert("功能开发中...")
                        return;
                    }
                    /********** 在线统计|留存分析|新用户分析|支付情况|服务器监控|结束 **********/



                    /********** wikicmd开始 **********/
                    $scope.wikiPageSize = 15;
                    $scope.wikicmdTotalItems = 0;
                    $scope.wikiCurrentPage = 1;
                    $scope.wikiData = [];
                    $scope.wikiQuery = {};

                    $scope.clickCmd = function () {
                        $scope.selectMenuItem = "wikicmd";
                        $scope.queryWikiModule();
                    }

                    $scope.clickEditMod = function (x) {
                        $scope.wikiQuery = x;
                        $scope.wikiQuery.oldWikiCmdName = angular.copy($scope.wikiQuery.wikiCmdName);
                    }

                    $scope.clickDeleteMod = function (x) {
                        util.post(config.apiUrlPrefix + 'tabledb/delete', { tableName: "wiki_module", query: { _id: x._id } }, function (data) {
                            Message.info("删除成功");
                            $scope.wikiQuery = {};
                            $scope.queryWikiModule();
                        });
                    }

                    $scope.clickUpsertWikicmd = function () {
                        util.post(config.apiUrlPrefix + 'wiki_module/upsert', $scope.wikiQuery, function (data) {
                            if (data) {
                                Message.info("更新成功");
                                $scope.wikiQuery = {};
                                $scope.queryWikiModule();
                            } else {
                                Message.info("操作失败");
                            }
                        });
                    }

                    $scope.queryWikiModule = function () {
                        for (var key in $scope.wikiQuery) {
                            if ($scope.wikiQuery[key] == "") {
                                $scope.wikiQuery[key] = undefined;
                            }
                        }

                        util.post(config.apiUrlPrefix + "tabledb/query", {
                            tableName: "wiki_module",
                            page: $scope.wikiCurrentPage,
                            pageSize: $scope.wikiPageSize,
                            query: $scope.wikiQuery,
                        }, function (data) {
                            data = data || {};

                            $scope.wikiData = data.data || [];
                            $scope.wikicmdTotalItems = data.total || 0;
                        });
                    };
                    /********** wikicmd结束 **********/

                }]);



        /********** 商品管理 additional field Controller 开始 **********/

        app.registerController('goodsController', ['$scope', 'goodsFactory', '$uibModalInstance', function ($scope, goodsFactory, $uibModalInstance) {
            $scope.currentAdditionalField = goodsFactory.itemGet()
            $scope.abc = function () {
                $uibModalInstance.dismiss('cancel');
            };
        }]);
    }

    /********** 商品管理 additional field Controller 结束 **********/

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent;
        },
    };
});