
app.controller("defaultBackgroundCtrl", function ($scope) {
    function init() {
        var moduleParams = window.moduleObj.moduleParams;
        if (moduleParams.color) {
            $('#backgroundId').css("background-color", moduleParams.color);
        }

        if (moduleParams.imageUrl) {
            $('#backgroundId').css("background-image","url('"+moduleParams.imageUrl+"')");
        }

        if (moduleParams.width) {
            $('#backgroundId').css("width", moduleParams.width + "px");
        }

        if (moduleParams.height) { // 定高
            $('#backgroundId').css("height", moduleParams.height + "px");
        } else {                   // auto
            window.setInterval(function () {
                var height = window.parent.document.getElementById("__UserSitePageContentContainer__").offsetHeight
                //var height = window.parent.document.body.scrollHeight > 4000 ? 4000 : window.parent.document.body.scrollHeight;
                //console.log(height);
                $('#backgroundId').css("height", height + "px");
                util.setParentIframeAutoHeight();
            }, 1000);
        }
    }
    init();
});