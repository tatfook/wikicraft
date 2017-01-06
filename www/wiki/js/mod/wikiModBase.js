/**
 * Created by wuxiangan on 2017/1/4.
 */

define([], function () {

    return function (mdwiki) {
        return {
            render: function () {
                return '<div></div>'
            },
            viewEditExist: function () {
                return false;
            }
        }
    }
});