/**
 * Created by 18730 on 2017/7/28.
 */
define(['jquery'], function ($) {
    var titleAnchor = {
        "anchorCss":"<style>.wiki_page_inner_link{position: relative;}.wiki_page_inner_link a.glyphicon-link{position: absolute;left: 0;background-color: #FFF;top: 50%;margin-top: -7px;font-size: 16px;visibility: hidden;}.wiki_page_inner_link:hover a.glyphicon-link{visibility: visible;}</style>"
    };
    var initHash = function () {
        var hash = window.location.hash.substring(2);
        var targetObj = $('a[name="'+hash+'"]').get(0);
        if (targetObj){
            targetObj.scrollIntoView();
        }else{
            setTimeout(function () {
                initHash();
            }, 100);
        }
        $(document.body).append(titleAnchor.anchorCss);
    };

    titleAnchor.init = initHash;

    config.titleAnchor = titleAnchor;
    return titleAnchor;
});
