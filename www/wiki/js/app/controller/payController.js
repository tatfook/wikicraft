/**
 * Created by big on 2017/7/6.
 */

define([
    'app',
    'helper/util',
    'pingpp',
    'text!html/pay.html',
], function (app, util, pingpp, htmlContent) {
    app.registerController("payController", ['$scope', 'Account', 'modal', '$rootScope', '$http', function ($scope, Account, modal, $rootScope, $http) {
        
        var queryArgs = util.getQueryObject();
        var validate  = true;
        var reset     = true;

        $scope.otherUserinfo       = {};
        $scope.method              = "alipay";
        $scope.subject             = "LOADING";
        $scope.body                = "LOADING";
        $scope.returnUrl           = ""; 
        $scope.app_goods_id        = "";
        $scope.app_name            = "";
        $scope.qr_url              = "";
        $scope.ideal_money         = 0;
        $scope.goods               = {};
        $scope.page                = "user";
        $scope.otherUserinfo       = {}
        $scope.alipayNotice        = null;
        $scope.goods.price         = 0;
        $scope.goods.exchange_rate = 0;

        validateF({ "username": queryArgs.username }, "$scope.otherUserinfo.username");
        validateF({ "price": queryArgs.price }, "$scope.goods.price");
        validateF({ "app_name": queryArgs.app_name }, "$scope.app_name");
        validateF({ "app_goods_id": queryArgs.app_goods_id }, "$scope.app_goods_id");
        validateF({ "redirect": queryArgs.redirect }, "$scope.redirect");

        if (queryArgs.additional) {
            $scope.additional = queryArgs.additional;

            try {
                $scope.additional = JSON.parse($scope.additional);
            }catch(e){
                console.warn("additional format error");
            }

            if (typeof($scope.additional) != "object") {
                validate = false;
            }

            //console.log($scope.additional);
        } else {
            validate = false;
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
            storage.sessionStorageSetItem('userCenterContentType', 'userProfile');
            storage.sessionStorageSetItem("userCenterSubContentType", 'myPay');
            util.go("userCenter");
        }

        $scope.back = function () {
            $scope.page = "user";
        }

        $scope.recharge = function () {
            if (!validate){
                alert("参数错误");
                return;
            }

            reset = false;

            if ($scope.method == "alipay") {
                if ($scope.isMobile) {
                    $scope.alipayClient();
                } else {
                    $scope.alipayQR();
                }
            } else if($scope.method == "wechat"){
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
                "channel": "alipay_pc_direct",
            };

            createCharge(params, function (charge) {
                startPay(charge);
            });
        }

        $scope.wechatClient = function () {
            var params = {
                "channel": "wx_pub",
            };

            createCharge(params);
        }

        $scope.alipayQR = function () {
            var params = {
                "channel": "alipay_qr",
            };

            createCharge(params, function (charge) {
                $scope.qr_url = charge.credential.alipay_qr;
                $scope.page = "alipay";
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
                $scope.page = "wechat";
                getTrade(charge);
            })
        }

        $scope.isMobile = function () {
            var u = navigator.userAgent;
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
            getUserinfo();
        });

        $scope.$watch("goods", function (newValue, oldValue) {
            var reg = /^[0-9]*$/;

            if (newValue && newValue.price && reg.test(newValue.price) && typeof (newValue.exchange_rate) == "number") {
                $scope.ideal_money = newValue.price * newValue.exchange_rate;
            } else {
                $scope.ideal_money = 0;
            }
        }, true);

        function createCharge(params, callback) {
            params.username     = $scope.otherUserinfo.username;
            params.price        = $scope.goods.price;
            params.app_goods_id = $scope.app_goods_id;
            params.app_name     = $scope.app_name;
            params.additional   = $scope.additional;
            params.redirect     = $scope.redirect;

            util.http("POST", config.apiUrlPrefix + "pay/createCharge", params, function (response) {
                var charge = response.data;
                if (typeof (callback) == "function") {
                    callback(charge);
                }
            });
        }

        function startPay(charge) {
            pingpp.createPayment(charge, function (result, err) {
                console.log(result);
                console.log(err.msg);
                console.log(err.extra);
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
            var params = { "app_goods_id": $scope.app_goods_id, "app_name": $scope.app_name};

            util.http("POST", config.apiUrlPrefix + "goods/getAppGoodsInfo", params, function (response) {
                $scope.subject     = response.subject;
                $scope.body        = response.body;
                $scope.goods.exchange_rate = response.exchange_rate; 

                for (itemA in response.additional_field) {
                    var checkField = true;
                    var field      = response.additional_field[itemA];

                    if (field.required) {
                        checkField = false

                        for (itemB in $scope.additional) {
                            if (field.name == itemB) {
                                checkField = true
                            }
                        }
                    }
                   
                    if (!checkField) {
                        validate = false;
                    }
                }
            });
        }

        function getUserinfo() {
            util.http("POST", config.apiUrlPrefix + "user/getBaseInfoByName", { username: $scope.otherUserinfo.username }, function (response) {
                $scope.otherUserinfo = response;
                validate = true;
            }, function () {
                $scope.otherUserinfo['_id'] = null; 
                validate = false;
            })
        }

        function getTrade(charge) {
            $http.post(config.apiUrlPrefix + "pay/getTradeOne", { username: $scope.otherUserinfo.username, trade_no: charge.order_no }, { isShowLoading: false }).then(function (response) {

                if (response && response.data && response.data.data && response.data.data.status == "Finish") {
                    $scope.page = "success";
                } else if (response && response.data && response.data.data && response.data.data.status == "Fail") {
                    $scope.page = "fail";
                } else {
                    if (!reset) {
                        setTimeout(function () { getTrade(charge) }, 3000);
                    }
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
    }]);

    return htmlContent;
});