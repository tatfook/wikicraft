/**
 * Created by big on 2017.4.23
 */

define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/worldList.html'
], function (app, util, htmlContent) {
    function registerController(wikiblock) {
        function Dig2Dec(s) {
            var retV = 0;
            if (s.length == 4) {
                for (var i = 0; i < 4; i++) {
                    retV += eval(s.charAt(i)) * Math.pow(2, 3 - i);
                }
                return retV;
            }
            return -1;
        }

        function Dec2Dig(n1) {
            var s = "";
            var n2 = 0;
            for (var i = 0; i < 4; i++) {
                n2 = Math.pow(2, 3 - i);
                if (n1 >= n2) {
                    s += '1';
                    n1 = n1 - n2;
                }
                else
                    s += '0';
            }
            return s;
        }

        function Str2Hex(s) {
            var c = "";
            var n;
            var ss = "0123456789ABCDEF";
            var digS = "";
            for (var i = 0; i < s.length; i++) {
                c = s.charAt(i);
                n = ss.indexOf(c);
                digS += Dec2Dig(eval(n));
            }
            return digS;
        }

        function Hex2Utf8(s) {
            var retS = "";
            var tempS = "";
            var ss = "";
            if (s.length == 16) {
                tempS = "1110" + s.substring(0, 4);
                tempS += "10" + s.substring(4, 10);
                tempS += "10" + s.substring(10, 16);
                var sss = "0123456789ABCDEF";
                for (var i = 0; i < 3; i++) {
                    retS += "%";
                    ss = tempS.substring(i * 8, (eval(i) + 1) * 8);
                    retS += sss.charAt(Dig2Dec(ss.substring(0, 4)));
                    retS += sss.charAt(Dig2Dec(ss.substring(4, 8)));
                }
                return retS;
            }
            return "";
        }

        function gb2utf8(s1) {
            var s = escape(s1);
            var sa = s.split("%");
            var retV = "";
            if (sa[0] != "") {
                retV = sa[0];
            }
            for (var i = 1; i < sa.length; i++) {
                if (sa[i].substring(0, 1) == "u") {
                    retV += Hex2Utf8(Str2Hex(sa[i].substring(1, 5)));
                    if (sa[i].length) {
                        retV += sa[i].substring(5);
                    }
                }
                else {
                    retV += unescape("%" + sa[i]);
                    if (sa[i].length) {
                        retV += sa[i].substring(5);
                    }
                }
            }
            return retV;
        }

        app.directive('preview', [function () {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    imageSrc: "@",
                    hasPreview: "@",
                },
                link: function (scope, element, attrs) {
                    if (JSON.parse(scope.hasPreview)) {
                        element.context.innerHTML = '<img src="' + scope.imageSrc + '" />';
                    } else {
                        element.context.innerHTML = '<div><h3>暂无图片</h3></div>';
                    }

                    util.$apply(scope);
                },
                template: "<div>图片正在加载中</div>",
            };
        }])
        .registerController('worldListController', ['$scope', function ($scope) {
            $scope.modParams = angular.copy(wikiblock.modParams || {});
            console.log(wikiblock.modParams);
            $($scope.modParams).each(function () {
                this.preview = JSON.parse(this.preview);

                if (this.filesTotals) {
                    if (this.filesTotals <= 1048576) {
                        this.filesTotals = parseInt(this.filesTotals / 1024) + "KB";
                    } else {
                        this.filesTotals = parseInt(this.filesTotals / 1024 / 1024) + "M";
                    }
                } else {
                    this.filesTotals = "0KB";
                }

                this.readme = decodeURI(gb2utf8(this.readme));
            });

            $scope.opusTotals = $scope.modParams.length;
            
            util.$apply($scope);
        }]);
    }
    return {
        render: function (wikiblock) {
            console.log(wikiblock);
            registerController(wikiblock);
            return htmlContent;
        }
    };
})

/*
```@wiki/js/world3D
{
    "worldName":"3D海洋世界",
    "worldUrl":"https://github.com/LiXizhi/HourOfCode/archive/master.zip",
    "logoUrl":"",
    "desc":"",
    "username":"lixizhi",
    "visitCount":235,
    "favoriteCount":51,
    "updateDate":"2017-03-30",
    "version":"1.0.1"
}
```
*/