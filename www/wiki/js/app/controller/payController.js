/**
 * Created by big on 2017/7/6.
 */

define([
    'app',
    'helper/util',
    'helper/storage',
    'pingpp',
    'markdown-it',
    'text!html/pay.html',
], function (app, util, storage, pingpp, markdownit, htmlContent) {
    app.registerController("payController", ['$scope', 'Account', 'modal', '$rootScope', '$http', function ($scope, Account, modal, $rootScope, $http) {
        function init() {
            var queryArgs  = util.getQueryObject();
            var validate   = true;
            var bAppExist  = false;
            var bUserExist = false;
            var reset      = true;

            $scope.otherUserinfo       = {};
            $scope.method              = "wechat";
            $scope.subject             = "LOADING";
            $scope.body                = "LOADING";
            $scope.returnUrl           = "";
            $scope.app_goods_id        = "";
            $scope.app_name            = "";
            $scope.qr_url              = "";
            $scope.ideal_money         = 0;
            $scope.goods               = {};
            $scope.page                = "user";
            $scope.otherUserinfo       = {};
            $scope.alipayNotice        = null;
            $scope.goods.price         = 0;
            $scope.goods.exchange_rate = 0;
            $scope.additional          = {};

            validateF({ "app_name": queryArgs.app_name }, "$scope.app_name");
            validateF({ "app_goods_id": queryArgs.app_goods_id }, "$scope.app_goods_id");

            if(queryArgs.out_trade_no){
                var trade = {};
                trade.order_no = queryArgs.out_trade_no;

                $scope.otherUserinfo.username = queryArgs.username;
                $scope.body = "支付结果";
                $scope.alipayCallback = true;

                reset = false;
                getTrade(trade);
            }

            $scope.$watch("$viewContentLoaded", function(){
                setTimeout(function(){
                    if (Account.isAuthenticated() && Account.user){
                        $scope.otherUserinfo.username = Account.user.username;
                    }
                }, 0);
            });

            if (queryArgs.username) {
                $scope.otherUserinfo.username = queryArgs.username;
            }

            if (queryArgs.price) {
                $scope.goods.price = queryArgs.price;
            }

            if (queryArgs.redirect) {
                $scope.returnUrl = queryArgs.redirect;
            }

            if (queryArgs.channel) {
                if (queryArgs.channel == "alipay" || queryArgs.channel == "wechat") {
                    $scope.method = queryArgs.channel;
                }
            }

            if (queryArgs.additional) {
                $scope.additional = queryArgs.additional;

                try {
                    $scope.additional = JSON.parse($scope.additional);
                } catch (e) {
                    console.warn("additional format error");
                }
            }

            if (validate) {
                getAppGoodsInfo();
                getUserinfo();
            }

            $scope.onChange = function (params) {
                $scope.method = params;
                $scope.page   = "user";
                reset         = true;
            }

            $scope.goMypay = function () {
                storage.sessionStorageSetItem('userCenterContentType', 'services');
                storage.sessionStorageSetItem("userCenterSubContentType", 'myPay');

                util.go("userCenter");
            }

            $scope.back = function () {
                $scope.page = "user";
            }

            $scope.recharge = function () {
                checkAdditionalField($scope.additional, $scope.additional_field);
                
                if (!bUserExist) {
                    alert("用户不存在");
                    return;
                }

                if (!validate || !bAppExist || !$scope.goods.price ) {
                    alert("参数错误");
                    return;
                }

                if ($scope.goods.price > 200000){
                    alert("充值金额不能大于20万元");
                    return;
                }

                reset = false;

                if ($scope.method == "alipay") {
                    if ($scope.isMobile) {
                        $scope.alipayClient();
                    } else {
                        $scope.alipayQR();
                    }
                } else if ($scope.method == "wechat") {
                    if ($scope.isMobile) {
                        $scope.wechatClient();
                    } else {
                        $scope.wechatQR();
                    }
                }
            }

            $scope.alipayChangeNotice = function () {
                if ($scope.alipayNotice == 'a') {
                    $scope.alipayNotice = 'b';
                } else if ($scope.alipayNotice == 'b') {
                    $scope.alipayNotice = 'a';
                }
            }

            $scope.alipayClient = function () {
                var params = {
                    "channel"   : "alipay_wap",
                    'redirect'  : "http://" + location.host + "/wiki/pay?username=" + $scope.otherUserinfo.username,
                };

                createCharge(params, function (charge) {
                    startPay(charge);
                });
            }

            $scope.wechatClient = function () {
                var params = {
                    "channel": "wx_wap",
                };

                if(confirm("使用微信H5支付，必须安装微信后才能继续，请问是否安装了微信客户端？")){
                    createCharge(params, function (charge) {
                        if(charge && charge.credential && charge.credential.wx_wap){
                            window.location.href = charge.credential.wx_wap;
                            // var ifr = document.createElement("iframe"); 
                            // ifr.setAttribute('src', charge.credential.wx_wap); 
                            // ifr.setAttribute('style', 'display:none');
                            // document.body.appendChild(ifr);

                            // getTrade(charge);

                            // setTimeout(function(){
                            //     document.body.removeChild(ifr);
                            // }, 5000);
                        }
                    });
                }else{
                    if(confirm("请问是否进入微信客户端安装页？")){
                        location.href = "http://weixin.qq.com";
                    }
                }
            }

            $scope.alipayQR = function () {
                var params = {
                    "channel": "alipay_qr",
                };

                createCharge(params, function (charge) {
                    $scope.qr_url       = charge.credential.alipay_qr;
                    $scope.page         = "alipay";
                    $scope.alipayNotice = "a";
                    getTrade(charge);
                })
            }

            $scope.wechatQR = function () {
                var params = {
                    "channel": "wx_pub_qr",
                };

                createCharge(params, function (charge) {
                    $scope.qr_url = charge.credential.wx_pub_qr;
                    $scope.page   = "wechat";
                    getTrade(charge);
                })
            }

            $scope.hasUserNid = function () {
                var hasUserNid = false;

                if ($scope.additional_field) {
                    for (var item in $scope.additional_field) {
                        if ($scope.additional_field[item].name == "user_nid") {
                            hasUserNid = true;
                            break;
                        }
                    }
                }

                return hasUserNid;
            }

            $scope.isMobile = function () {
                var u        = navigator.userAgent;
                var isMobile = false;

                //console.log(u);

                if (u.match(/ipad/i) && u.match(/ipad/i).toString().toLocaleLowerCase() == "ipad") {
                    isMobile = true;
                }

                if (u.match(/iphone/i) && u.match(/iphone/i).toString().toLocaleLowerCase() == "iphone") {
                    isMobile = true;
                }

                if (u.match(/android/i) && u.match(/android/i).toString().toLocaleLowerCase() == "android") {
                    isMobile = true;
                }

                return isMobile;
            }();

            $scope.$watch("otherUserinfo.username", function (newValue, oldValue) {
                setTimeout(getUserinfo, 0);
            });

            $scope.$watch("goods", function (newValue, oldValue) {
                var reg = /^[0-9]*$/;

                if (newValue && newValue.price && reg.test(newValue.price) && typeof (newValue.exchange_rate) == "number") {
                    $scope.ideal_money = newValue.price * newValue.exchange_rate;
                } else {
                    $scope.ideal_money = 0;
                    $scope.goods.price = null;
                }
            }, true);

            $scope.$watch("additional.user_nid", function (newValue, oldValue) {
                var reg = /^[0-9]*$/;

                if (!newValue || !reg.test(newValue)) {
                    delete $scope.additional.user_nid;
                }
            });

            function createCharge(params, callback) {
                params.username     = $scope.otherUserinfo.username;
                params.price        = $scope.goods.price;
                params.app_goods_id = $scope.app_goods_id;
                params.app_name     = $scope.app_name;
                params.additional   = $scope.additional;

                util.http("POST", config.apiUrlPrefix + "pay/createCharge", params, function (response) {
                    var charge = response.data;
                    if (typeof (callback) == "function") {
                        callback(charge);
                    }
                });
            }

            function startPay(charge) {
                pingpp.createPayment(charge, function (result, err) {
                    // console.log(result);
                    // console.log(err.msg);
                    // console.log(err.extra);
                    if (result == "success") {
                        // 只有微信公众账号 wx_pub 支付成功的结果会在这里返回，其他的支付结果都会跳转到 extra 中对应的 URL。
                    } else if (result == "fail") {
                        // charge 不正确或者微信公众账号支付失败时会在此处返回
                    } else if (result == "cancel") {
                        // 微信公众账号支付取消支付
                    }
                });
            }

            function getAppGoodsInfo() {
                var params = { "app_goods_id": $scope.app_goods_id, "app_name": $scope.app_name };
                
                util.http("POST", config.apiUrlPrefix + "goods/getAppGoodsInfo", params, function (response) {
                    bAppExist = true;

                    $scope.subject             = response.subject;
                    $scope.body                = response.body;
                    $scope.goods.exchange_rate = response.exchange_rate;
                    $scope.additional_field    = response.additional_field;

                    needLogin();
                });
            }

            function checkAdditionalField(additional, additional_field) {
                validate = true;

                for (itemA in additional_field) {
                    var checkField = true;
                    var field      = additional_field[itemA];

                    if (field.required) {
                        checkField = false

                        for (itemB in additional) {
                            if (field.name == itemB) {
                                checkField = true
                            }
                        }
                    }

                    if (!checkField) {
                        validate = false;
                    }
                }
            }

            function getUserinfo() {
                $http.post(config.apiUrlPrefix + "user/getBaseInfoByName", { username: $scope.otherUserinfo.username }, { isShowLoading: false }).then(function (response) {
                    if (response && response.data && response.data.error && response.data.error.id == 0) {
                        $scope.otherUserinfo = response.data.data;
                        bUserExist           = true;
                    } else {
                        $scope.otherUserinfo['_id'] = null;
                        bUserExist                  = false;
                    }

                }, function () {
                    $scope.otherUserinfo['_id'] = null;
                    bUserExist                  = false;
                })
            }

            function getTrade(charge) {
                $http.post(config.apiUrlPrefix + "pay/getTradeOne", { username: $scope.otherUserinfo.username, trade_no: charge.order_no }, { isShowLoading: false }).then(function (response) {
                    if(response && response.status){
                        if (response.status == 200 && response.data && response.data.data && response.data.data.status == "Finish") {
                            $scope.page = "success";
                            if ($scope.returnUrl) {
                                setTimeout(function () {
                                    Account.reloadUser(); // 充值完成 用户信息需要更新, 本应只更新相关信息即可, 但此处可能无法识别更新那块，可提供完成回调机制
                                    window.location.href = $scope.returnUrl;
                                }, 5000);
                            }
                        } else if (response.status == 404
                                   || response.status == 503
                                   || response.data && response.data.data && response.data.data.status == "Fail") {
                            $scope.page = "fail";
                        } else {
                            if (!reset) {
                               setTimeout(function () { getTrade(charge) }, 3000);
                            }
                        }
                    }else{
                        alert("网络错误！");
                    }
                })
            }

            function validateF(params, cmd) {
                var keyName = "";

                for (var key in params) {
                    keyName = key;
                }

                if (params[keyName]) {
                    eval(cmd + " = '" + params[keyName] + "'");
                } else {
                    validate = false;
                }
            }

            function needLogin() {
                if (!Account.isAuthenticated() && !$scope.hasUserNid()) {
                    modal('controller/loginController', {
                        controller: 'loginController',
                        size: 'lg',
                        backdrop: 'static'
                    }, function (result) {
                        location.reload();
                    }, function (result) {
                        return;
                    });
                }
            }

            function getMarkDownRenderer() {
                return markdownit({
                    html: true, // Enable HTML tags in source
                    linkify: true, // Autoconvert URL-like text to links
                    typographer: true, // Enable some language-neutral replacement + quotes beautification
                    breaks: false,        // Convert '\n' in paragraphs into <br>
                    highlight: function (str, lang) {
                        if (lang && window.hljs.getLanguage(lang)) {
                            try {
                                return hljs.highlight(lang, str, true).value;
                            } catch (__) {
                            }
                        }
                        return ''; // use external default escaping
                    }
                });
            };

            $http({
                "method"  : 'GET',
                "url"     : "http://git.keepwork.com/gitlab_rls_official/keepworkhaqi/raw/master/official/haqi/payads.md",
                "headers" : {
                    'Authorization': undefined,
                }, // remove auth header for this request
                "skipAuthorization" : true, // this is added by our satellizer module, so disable it for cross site requests.
                "transformResponse" : [function (data) {
                    return data; // never transform to json, return as it is
                }],
            })
            .then(function (response) {
                var html = getMarkDownRenderer().render(response.data);
                $('#hot-service').html(html);
            },
            function (response) {});
        }

        $scope.$watch("$viewContentLoaded", init);
    }]);

    return htmlContent;
});
