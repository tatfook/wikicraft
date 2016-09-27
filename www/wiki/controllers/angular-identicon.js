﻿/**
Title: client side identicon
Author: LiXizhi
Date: 2016.8.23
Reference:  https://github.com/stewartlord/identicon.js
Usage: `<wiki-identicon userid="user._id" size="72" imageurl="user.picture"></wiki-identicon>`
*/
angular.module('MyApp')
.directive('wikiIdenticon', function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            userid: '=',
            size: '=',
            imageurl: '=',
        },
        template: '<img class="img-rounded" width={{size}} height={{size}} src="{{data}}"></img>',
        controller: ["$scope", function ($scope) {
            $scope.$watchGroup(['userid', 'size', 'imageurl'], function (newVal) {
                // convert to 32 hex letters, however only the first 15 and last 7 is used. 
                var hash = (($scope.userid || 0) + "a");
                var length = hash.length;
                for (var i = length; i < 32; i++) {
                    hash += hash[i % length];
                }
                if ($scope.imageurl) {
                    $scope.data = $scope.imageurl;
                }
                else {
                    $scope.data = "data:image/png;base64," + (new Identicon(hash, $scope.size || 24, 0)).toString();
                }
            });
        }]
    };
});

/**
* A handy class to calculate color values.
*
* @version 1.0
* @author Robert Eisele <robert@xarg.org>
* @copyright Copyright (c) 2010, Robert Eisele
* @link http://www.xarg.org/2010/03/generate-client-side-png-files-using-javascript/
* @license http://www.opensource.org/licenses/bsd-license.php BSD License
*
*/
(function () {

    // helper functions for that ctx
    function write(buffer, offs) {
        for (var i = 2; i < arguments.length; i++) {
            for (var j = 0; j < arguments[i].length; j++) {
                buffer[offs++] = arguments[i].charAt(j);
            }
        }
    }

    function byte2(w) {
        return String.fromCharCode((w >> 8) & 255, w & 255);
    }

    function byte4(w) {
        return String.fromCharCode((w >> 24) & 255, (w >> 16) & 255, (w >> 8) & 255, w & 255);
    }

    function byte2lsb(w) {
        return String.fromCharCode(w & 255, (w >> 8) & 255);
    }

    // modified from original source to support NPM
    var PNGlib = function (width, height, depth) {

        this.width = width;
        this.height = height;
        this.depth = depth;

        // pixel data and row filter identifier size
        this.pix_size = height * (width + 1);

        // deflate header, pix_size, block headers, adler32 checksum
        this.data_size = 2 + this.pix_size + 5 * Math.floor((0xfffe + this.pix_size) / 0xffff) + 4;

        // offsets and sizes of Png chunks
        this.ihdr_offs = 0;									// IHDR offset and size
        this.ihdr_size = 4 + 4 + 13 + 4;
        this.plte_offs = this.ihdr_offs + this.ihdr_size;	// PLTE offset and size
        this.plte_size = 4 + 4 + 3 * depth + 4;
        this.trns_offs = this.plte_offs + this.plte_size;	// tRNS offset and size
        this.trns_size = 4 + 4 + depth + 4;
        this.idat_offs = this.trns_offs + this.trns_size;	// IDAT offset and size
        this.idat_size = 4 + 4 + this.data_size + 4;
        this.iend_offs = this.idat_offs + this.idat_size;	// IEND offset and size
        this.iend_size = 4 + 4 + 4;
        this.buffer_size = this.iend_offs + this.iend_size;	// total PNG size

        this.buffer = new Array();
        this.palette = new Object();
        this.pindex = 0;

        var _crc32 = new Array();

        // initialize buffer with zero bytes
        for (var i = 0; i < this.buffer_size; i++) {
            this.buffer[i] = "\x00";
        }

        // initialize non-zero elements
        write(this.buffer, this.ihdr_offs, byte4(this.ihdr_size - 12), 'IHDR', byte4(width), byte4(height), "\x08\x03");
        write(this.buffer, this.plte_offs, byte4(this.plte_size - 12), 'PLTE');
        write(this.buffer, this.trns_offs, byte4(this.trns_size - 12), 'tRNS');
        write(this.buffer, this.idat_offs, byte4(this.idat_size - 12), 'IDAT');
        write(this.buffer, this.iend_offs, byte4(this.iend_size - 12), 'IEND');

        // initialize deflate header
        var header = ((8 + (7 << 4)) << 8) | (3 << 6);
        header += 31 - (header % 31);

        write(this.buffer, this.idat_offs + 8, byte2(header));

        // initialize deflate block headers
        for (var i = 0; (i << 16) - 1 < this.pix_size; i++) {
            var size, bits;
            if (i + 0xffff < this.pix_size) {
                size = 0xffff;
                bits = "\x00";
            } else {
                size = this.pix_size - (i << 16) - i;
                bits = "\x01";
            }
            write(this.buffer, this.idat_offs + 8 + 2 + (i << 16) + (i << 2), bits, byte2lsb(size), byte2lsb(~size));
        }

        /* Create crc32 lookup table */
        for (var i = 0; i < 256; i++) {
            var c = i;
            for (var j = 0; j < 8; j++) {
                if (c & 1) {
                    c = -306674912 ^ ((c >> 1) & 0x7fffffff);
                } else {
                    c = (c >> 1) & 0x7fffffff;
                }
            }
            _crc32[i] = c;
        }

        // compute the index into a png for a given pixel
        this.index = function (x, y) {
            var i = y * (this.width + 1) + x + 1;
            var j = this.idat_offs + 8 + 2 + 5 * Math.floor((i / 0xffff) + 1) + i;
            return j;
        }

        // convert a color and build up the palette
        this.color = function (red, green, blue, alpha) {

            alpha = alpha >= 0 ? alpha : 255;
            var color = (((((alpha << 8) | red) << 8) | green) << 8) | blue;

            if (typeof this.palette[color] == "undefined") {
                if (this.pindex == this.depth) return "\x00";

                var ndx = this.plte_offs + 8 + 3 * this.pindex;

                this.buffer[ndx + 0] = String.fromCharCode(red);
                this.buffer[ndx + 1] = String.fromCharCode(green);
                this.buffer[ndx + 2] = String.fromCharCode(blue);
                this.buffer[this.trns_offs + 8 + this.pindex] = String.fromCharCode(alpha);

                this.palette[color] = String.fromCharCode(this.pindex++);
            }
            return this.palette[color];
        }

        // output a PNG string, Base64 encoded
        this.getBase64 = function () {

            var s = this.getDump();

            var ch = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            var c1, c2, c3, e1, e2, e3, e4;
            var l = s.length;
            var i = 0;
            var r = "";

            do {
                c1 = s.charCodeAt(i);
                e1 = c1 >> 2;
                c2 = s.charCodeAt(i + 1);
                e2 = ((c1 & 3) << 4) | (c2 >> 4);
                c3 = s.charCodeAt(i + 2);
                if (l < i + 2) { e3 = 64; } else { e3 = ((c2 & 0xf) << 2) | (c3 >> 6); }
                if (l < i + 3) { e4 = 64; } else { e4 = c3 & 0x3f; }
                r += ch.charAt(e1) + ch.charAt(e2) + ch.charAt(e3) + ch.charAt(e4);
            } while ((i += 3) < l);
            return r;
        }

        // output a PNG string
        this.getDump = function () {

            // compute adler32 of output pixels + row filter bytes
            var BASE = 65521; /* largest prime smaller than 65536 */
            var NMAX = 5552;  /* NMAX is the largest n such that 255n(n+1)/2 + (n+1)(BASE-1) <= 2^32-1 */
            var s1 = 1;
            var s2 = 0;
            var n = NMAX;

            for (var y = 0; y < this.height; y++) {
                for (var x = -1; x < this.width; x++) {
                    s1 += this.buffer[this.index(x, y)].charCodeAt(0);
                    s2 += s1;
                    if ((n -= 1) == 0) {
                        s1 %= BASE;
                        s2 %= BASE;
                        n = NMAX;
                    }
                }
            }
            s1 %= BASE;
            s2 %= BASE;
            write(this.buffer, this.idat_offs + this.idat_size - 8, byte4((s2 << 16) | s1));

            // compute crc32 of the PNG chunks
            function crc32(png, offs, size) {
                var crc = -1;
                for (var i = 4; i < size - 4; i += 1) {
                    crc = _crc32[(crc ^ png[offs + i].charCodeAt(0)) & 0xff] ^ ((crc >> 8) & 0x00ffffff);
                }
                write(png, offs + size - 4, byte4(crc ^ -1));
            }

            crc32(this.buffer, this.ihdr_offs, this.ihdr_size);
            crc32(this.buffer, this.plte_offs, this.plte_size);
            crc32(this.buffer, this.trns_offs, this.trns_size);
            crc32(this.buffer, this.idat_offs, this.idat_size);
            crc32(this.buffer, this.iend_offs, this.iend_size);

            // convert PNG to string
            return "\211PNG\r\n\032\n" + this.buffer.join('');
        }
    }
    window.PNGlib = PNGlib;
})();

// merged from: https://github.com/stewartlord/identicon.js/blob/master/identicon.js
(function () {
    var PNGlib;
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        PNGlib = require('./pnglib');
    } else {
        PNGlib = window.PNGlib;
    }

    var Identicon = function (hash, options) {
        this.defaults = {
            background: [240, 240, 240, 255],
            hash: this.createHashFromString((new Date()).toISOString()),
            margin: 0.08,
            size: 64
        };

        this.options = typeof (options) === 'object' ? options : this.defaults;

        // backward compatibility with old constructor (hash, size, margin)
        if (arguments[1] && typeof (arguments[1]) === 'number') { this.options.size = arguments[1]; }
        if (arguments[2]) { this.options.margin = arguments[2]; }

        this.hash = hash || this.defaults.hash;
        this.background = this.options.background || this.defaults.background;
        this.margin = this.options.margin || this.defaults.margin;
        this.size = this.options.size || this.defaults.size;
    };

    Identicon.prototype = {
        background: null,
        hash: null,
        margin: null,
        size: null,

        render: function () {
            var hash = this.hash,
                size = this.size,
                baseMargin = Math.floor(size * this.margin),
                cell = Math.floor((size - (baseMargin * 2)) / 5),
                margin = Math.floor((size - cell * 5) / 2),
                image = new PNGlib(size, size, 256);

            // light-grey background
            var bg = image.color(this.background[0], this.background[1], this.background[2], this.background[3]);

            // foreground is last 7 chars as hue at 50% saturation, 70% brightness
            var rgb = this.hsl2rgb(parseInt(hash.substr(-7), 16) / 0xfffffff, 0.5, 0.7),
                fg = image.color(rgb[0] * 255, rgb[1] * 255, rgb[2] * 255);

            // the first 15 characters of the hash control the pixels (even/odd)
            // they are drawn down the middle first, then mirrored outwards
            var i, color;
            for (i = 0; i < 15; i++) {
                color = parseInt(hash.charAt(i), 16) % 2 ? bg : fg;
                if (i < 5) {
                    this.rectangle(2 * cell + margin, i * cell + margin, cell, cell, color, image);
                } else if (i < 10) {
                    this.rectangle(1 * cell + margin, (i - 5) * cell + margin, cell, cell, color, image);
                    this.rectangle(3 * cell + margin, (i - 5) * cell + margin, cell, cell, color, image);
                } else if (i < 15) {
                    this.rectangle(0 * cell + margin, (i - 10) * cell + margin, cell, cell, color, image);
                    this.rectangle(4 * cell + margin, (i - 10) * cell + margin, cell, cell, color, image);
                }
            }

            return image;
        },

        rectangle: function (x, y, w, h, color, image) {
            var i, j;
            for (i = x; i < x + w; i++) {
                for (j = y; j < y + h; j++) {
                    image.buffer[image.index(i, j)] = color;
                }
            }
        },

        // adapted from: https://gist.github.com/aemkei/1325937
        hsl2rgb: function (h, s, b) {
            h *= 6;
            s = [
                b += s *= b < .5 ? b : 1 - b,
                b - h % 1 * s * 2,
                b -= s *= 2,
                b,
                b + h % 1 * s,
                b + s
            ];

            return [
                s[~~h % 6],  // red
                s[(h | 16) % 6],  // green
                s[(h | 8) % 6]   // blue
            ];
        },

        toString: function () {
            return this.render().getBase64();
        },

        // Creates a consistent-length hash from a string
        createHashFromString: function (str) {
            var hash = '0', salt = 'identicon', i, chr, len;

            if (!str) {
                return hash;
            }

            str += salt + str; // Better randomization for short inputs.

            for (i = 0, len = str.length; i < len; i++) {
                chr = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash.toString();
        }
    };
    window.Identicon = Identicon;
})();

