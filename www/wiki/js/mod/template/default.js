/**
 * Created by wuxiangan on 2017/1/4.
 */

define(['helper/util'], function (util) {
    return {
        render: function (mdwiki) {
            return '<div>'+ mdwiki.content +'</div>'
        }
    }
});