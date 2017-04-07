/**
 * Created by wuxiangan on 2017/4/7.
 */

define([], function () {
    var regMap = {
        'div':/<div.*><\/div>/,
    };

    function divFn(text) {
        var reg = /<div(.*)>(.*)<\/div>/;
        return text.match(reg);
    }
    function render(text) {
        return divFn(text);
    }

    console.log(divFn('<div contenteditable="true"><div>hello world</div></div>'))
    window.render = render;

    return render;
});
