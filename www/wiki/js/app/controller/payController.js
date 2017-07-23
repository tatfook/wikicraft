/**
 * Created by big on 2017/7/6.
 */

define([
    'app',
    'helper/util',
    'pingpp',
    'text!html/pay.html',
], function (app, util, pingpp, htmlContent) {
    app.registerController("payController", ['$scope', 'Account', 'modal', '$rootScope', function ($scope, Account, modal, $rootScope) {
        
        var queryArgs = util.getQueryObject();
        var validate  = true;

        $scope.method       = "alipay";
        $scope.subject      = "LOADING";
        $scope.body         = "LOADING";
        $scope.returnUrl    = ""; 
        $scope.app_goods_id = "";
        $scope.app_name     = "";
        $scope.qr_url       = "";
        $scope.ideal_money  = 0;
        $scope.goods        = {};
        $scope.page         = "user";
        $scope.goods.price         = 0;
        $scope.goods.exchange_rate = 0;

        validateF({ "username": queryArgs.username }, "$scope.username");
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

        if (Account.ensureAuthenticated()) {
            Account.getUser(function (userinfo) {
                $scope.userinfo = userinfo;
            });
        }

        if (validate) {
            getAppGoodsInfo();
        }

        $scope.onChange = function (params) {
            $scope.method = params;
            $scope.page = "user";
            //$scope.alipayClient();
        }

            //if ($scope.isMobile) {
            //    $scope.wechatClient();
            //} else {
            //    $scope.wechatQR();
            //}

        $scope.recharge = function () {
            if ($scope.method == "alipay") {
                $scope.page = "alipay";
            } else if($scope.method == "wechat"){
                $scope.page = "wechat";
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

                $(".pay-qrcode").css("display", "block");
            })
        }

        $scope.wechatQR = function () {
            var params = {
                "channel": "wx_pub_qr",
            };

            createCharge(params, function (charge) {
                $scope.qr_url = charge.credential.wx_pub_qr;

                $(".pay-qrcode").css("display", "block");
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

        $scope.$watch("goods", function (newValue, oldValue) {
            var reg = /^[0-9]*$/;

            if (newValue && newValue.price && reg.test(newValue.price) && typeof (newValue.exchange_rate) == "number") {
                $scope.ideal_money = newValue.price * newValue.exchange_rate;
            } else {
                $scope.ideal_money = 0;
            }
        }, true);

        function createCharge(params, callback) {
            params.price        = $scope.price;
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