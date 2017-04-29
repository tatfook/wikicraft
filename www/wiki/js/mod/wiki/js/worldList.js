/**
 * Created by big on 2017.4.23
 */

define([
    'app',
    'helper/util',
    'markdown-it',
    'text!wikimod/wiki/html/worldList.html'
], function (app, util, markdownit, htmlContent) {
    function registerController(wikiblock) {
        function Base64() {

            // private property  
            _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

            // public method for encoding  
            this.encode = function (input) {
                var output = "";
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                var i = 0;
                input = _utf8_encode(input);
                while (i < input.length) {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);
                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;
                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }
                    output = output +
                    _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                    _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
                }
                return output;
            }

            // public method for decoding  
            this.decode = function (input) {
                var output = "";
                var chr1, chr2, chr3;
                var enc1, enc2, enc3, enc4;
                var i = 0;
                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                while (i < input.length) {
                    enc1 = _keyStr.indexOf(input.charAt(i++));
                    enc2 = _keyStr.indexOf(input.charAt(i++));
                    enc3 = _keyStr.indexOf(input.charAt(i++));
                    enc4 = _keyStr.indexOf(input.charAt(i++));
                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;
                    output = output + String.fromCharCode(chr1);
                    if (enc3 != 64) {
                        output = output + String.fromCharCode(chr2);
                    }
                    if (enc4 != 64) {
                        output = output + String.fromCharCode(chr3);
                    }
                }
                output = _utf8_decode(output);
                return output;
            }

            // private method for UTF-8 encoding  
            _utf8_encode = function (string) {
                string = string.replace(/\r\n/g, "\n");
                var utftext = "";
                for (var n = 0; n < string.length; n++) {
                    var c = string.charCodeAt(n);
                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    } else if ((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    } else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }

                }
                return utftext;
            }

            // private method for UTF-8 decoding  
            _utf8_decode = function (utftext) {
                var string = "";
                var i = 0;
                var c = c1 = c2 = 0;
                while (i < utftext.length) {
                    c = utftext.charCodeAt(i);
                    if (c < 128) {
                        string += String.fromCharCode(c);
                        i++;
                    } else if ((c > 191) && (c < 224)) {
                        c2 = utftext.charCodeAt(i + 1);
                        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                        i += 2;
                    } else {
                        c2 = utftext.charCodeAt(i + 1);
                        c3 = utftext.charCodeAt(i + 2);
                        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                        i += 3;
                    }
                }
                return string;
            }
        }

        var base64 = new Base64();

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

            $scope.htmlspecialchars_decode = function (str) {
                str = str.replace(/&amp;/g, '&');
                str = str.replace(/&lt;/g, '<');
                str = str.replace(/&gt;/g, '>');
                str = str.replace(/&quot;/g, "''");
                str = str.replace(/&#039;/g, "'");

                console.log(str);
                return str;
            }

            $scope.markdownRender = function () {
                var md = markdownit({
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

                return md;
            }


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

                var readme  = $scope.markdownRender().render(base64.decode(this.readme));
                this.readme = readme;
            });

            console.log($scope.modParams);

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