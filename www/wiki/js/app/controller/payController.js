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

        $scope.method       = "";
        $scope.subject      = "LOADING";
        $scope.body         = "LOADING";
        $scope.returnUrl    = ""; 
        $scope.price        = 0;
        $scope.app_goods_id = "";
        $scope.app_name     = "";
        $scope.qr_url       = "";

        if (queryArgs.price) {
            $scope.price = queryArgs.price
        } else {
            validate = false;
        }

        if (queryArgs.app_name) {
            $scope.app_name = queryArgs.app_name;
        } else {
            validate = false;
        }

        if (queryArgs.app_goods_id) {
            $scope.app_goods_id = queryArgs.app_goods_id;
        } else {
            validate = false;
        }

        if (queryArgs.redirect) {
            $scope.redirect = queryArgs.redirect;
        } else {
            validate = false;
        }

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

        $scope.alipay = function () {
            if (!validate) {
                alert("参数错误");
                return;
            }

            $scope.method = "alipay";
            $scope.alipayClient();
        }

        $scope.wechat = function () {
            if (!validate) {
                alert("参数错误");
                return;
            }

            $scope.method = "wechat";

            if ($scope.isMobile) {
                $scope.wechatClient();
            } else {
                $scope.wechatQR();
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
            if (!validate) {
                alert("参数错误");
                return;
            }

            var params = { "app_goods_id": $scope.app_goods_id, "app_name": $scope.app_name};

            util.http("POST", config.apiUrlPrefix + "goods/getAppGoodsInfo", params, function (response) {
                $scope.subject = response.subject;
                $scope.body    = response.body;

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
    }]);

    return htmlContent;
});