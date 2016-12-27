/**
 * Created by karlwu on 2016-11-02.
 */

var editor = CodeMirror.fromTextArea(document.getElementById("source"), {
    mode: 'markdown',
    lineNumbers: true,
    lineWrapping: true,
    theme: "default",
    viewportMargin: Infinity,
    extraKeys: {
        "Alt-F": "findPersistent",
        "F11": function(cm) {
            cm.setOption("fullScreen", !cm.getOption("fullScreen"));
        },
        "Esc": function(cm) {
            if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
        },
        "Ctrl-S": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_savepage();
        },
        "Shift-Ctrl-N": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_newpage();
        },
        "Ctrl-B": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_bold();
        },
        "Ctrl-I": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_italic();
        },
        "Ctrl--": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_strikethrough();
        },
        "Shift-Ctrl-[": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_superscript();
        },
        "Shift-Ctrl-]": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_subscript();
        },
        "Shift-Ctrl-1": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_headline(1);
        },
        "Shift-Ctrl-2": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_headline(2);
        },
        "Shift-Ctrl-3": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_headline(3);
        },
        "Shift-Ctrl-4": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_headline(4);
        },
        "Shift-Ctrl-5": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_headline(5);
        },
        "Shift-Ctrl-6": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_headline(6);
        },
        "Ctrl-.": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_listul();
        },
        "Ctrl-/": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_listol();
        },
        "Ctrl-]": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_blockqote();
        },
        "Shift-Ctrl-T": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_tabel();
        },
        "Ctrl-H": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_horizontal();
        },
        "Alt-L": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_link();
        },
        "Alt-P": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_image();
        },
        "Alt-C": function(cm) {
            var $scope=angular.element('#wikiEditor').scope();
            $scope.cmd_code();
        },
    }
});

var showTreeview = true;

function initView(activity){

    $("#srcview").removeClass('col-xs-12');
    $("#srcview").removeClass('col-xs-10');
    $("#srcview").removeClass('col-xs-6');
    $("#srcview").removeClass('col-xs-5');

    $("#preview").removeClass('col-xs-12');
    $("#preview").removeClass('col-xs-10');
    $("#preview").removeClass('col-xs-6');
    $("#preview").removeClass('col-xs-5');

    if(activity == true){
        $('.toolbar-page-slide').removeClass('active');
        $('.toolbar-page-code').removeClass('active');
        $('.toolbar-page-design').removeClass('active');
    }

    if($("#treeview").is(":hidden")){
        if($("#preview").is(":hidden")){
            $("#srcview").addClass('col-xs-12');
        }else{
            $("#srcview").addClass('col-xs-6');
        }
        if($("#srcview").is(":hidden")){
            $("#preview").addClass('col-xs-12');
        }else{
            $("#preview").addClass('col-xs-6');
        }
    }else{
        if($("#preview").is(":hidden")){
            $("#srcview").addClass('col-xs-10');
        }else{
            $("#srcview").addClass('col-xs-5');
        }
        if($("#srcview").is(":hidden")){
            $("#preview").addClass('col-xs-10');
        }else{
            $("#preview").addClass('col-xs-5');
        }
    }
}

$('.toolbar-page-file').on('click',function(){
    if($("#treeview").is(":hidden")){
        $('#treeview').show('fast',function(){
            initView(false);
            if($("#treeview").is(":hidden")){
                $('.toolbar-page-file').removeClass('active');
            }else{
                $('.toolbar-page-file').addClass('active');
            }
        });
    }else{
        $('#treeview').hide('fast',function(){
            initView(false);
            if($("#treeview").is(":hidden")){
                $('.toolbar-page-file').removeClass('active');
            }else{
                $('.toolbar-page-file').addClass('active');
            }
        });
    }

});

$('.toolbar-page-code').on('click',function(){
    $('#srcview').show();
    $("#preview").hide('fast',function(){
        initView(true);
        $('.toolbar-page-code').addClass('active');
        $('.toolbar-page-view').attr("disabled",true);
        $('#codeToolbar button').attr("disabled",false);
    });
});

$('.toolbar-page-slide').on('click',function(){
    $('#srcview').show();
    $("#preview").show('fast',function(){
        initView(true);
        $('.toolbar-page-slide').addClass('active');
        $('.toolbar-page-view').attr("disabled",false);
        $('#codeToolbar button').attr("disabled",false);
    });
});

$('.toolbar-page-design').on('click',function(){
    $('#preview').show();
    $("#srcview").hide('fast',function(){
        initView(true);
        $('.toolbar-page-design').addClass('active');
        $('.toolbar-page-view').attr("disabled",false);
        $('#codeToolbar button').attr("disabled",true);

    });
});

//获取剪贴板数据方法
function getClipboardText(event){
    var clipboardData = event.clipboardData || window.clipboardData;
    return clipboardData.getData("text");
};

//设置剪贴板数据
function setClipboardText(event, value){
    if(event.clipboardData){
        return event.clipboardData.setData("text/plain", value);
    }else if(window.clipboardData){
        return window.clipboardData.setData("text", value);
    }
};

function CreateElementForExecCommand (textToClipboard) {
    var forExecElement = document.createElement ("div");
    // place outside the visible area
    forExecElement.style.position = "absolute";
    forExecElement.style.left = "-10000px";
    forExecElement.style.top = "-10000px";
    // write the necessary text into the element and append to the document
    forExecElement.textContent = textToClipboard;
    document.body.appendChild (forExecElement);
    // the contentEditable mode is necessary for the  execCommand method in Firefox
    forExecElement.contentEditable = true;

    return forExecElement;
}

function SelectContent (element) {
    // first create a range
    var rangeToSelect = document.createRange ();
    rangeToSelect.selectNodeContents (element);

    // select the contents
    var selection = window.getSelection ();
    selection.removeAllRanges ();
    selection.addRange (rangeToSelect);
}

function CopyToClipboard (value) {
    var textToClipboard = value;

    var success = true;
    if (window.clipboardData) { // Internet Explorer
        window.clipboardData.setData ("Text", textToClipboard);
    }
    else {
        // create a temporary element for the execCommand method
        var forExecElement = CreateElementForExecCommand (textToClipboard);

        /* Select the contents of the element
         (the execCommand for 'copy' method works on the selection) */
        SelectContent (forExecElement);

        var supported = true;

        // UniversalXPConnect privilege is required for clipboard access in Firefox
        try {
            if (window.netscape && netscape.security) {
                netscape.security.PrivilegeManager.enablePrivilege ("UniversalXPConnect");
            }

            // Copy the selected content to the clipboard
            // Works in Firefox and in Safari before version 5
            success = document.execCommand ("copy", false, null);
        }
        catch (e) {
            success = false;
        }

        // remove the temporary element
        document.body.removeChild (forExecElement);
    }

    if (success) {
        alert ("网址已成功拷贝到剪切板!");
    }
    else {
        alert ("您的浏览器不支持访问剪切板!");
    }
}

$('.toolbar-page-copyurl').on('click',function(){
    CopyToClipboard($('#btUrl').val());
});

$('.toolbar-page-preview').on('click',function(){
    editor.focus();
    var url = $('#btUrl').val();
    if(url){
        window.open(url);
    }

});

$('.toolbar-page-version').on('click',function(){
    var $scope=angular.element('#wikiEditor').scope();
    $scope.cmd_version();
});

$('.toolbar-page-hotkey').on('click',function(){
    console.log('toolbar-page-hotkey');
    $('#hotkeyModal').modal({
        keyboard: true
    })
});

$('.toolbar-page-knowledge').on('click',function(){
    console.log('toolbar-page-knowledge');
});

$(function() {
    var wellStartPos = $('.well').offset().top;

    $.event.add(window, "scroll", function() {
        var p = $(window).scrollTop();
        if( p > wellStartPos ){
            $('.well').css('position', 'fixed');
            $('.well').css('top','0px');
            $('.well').css('left','0px');
            $('.well').css('right','0px');

//                $('.treeview').css('position', 'fixed');
//                $('.treeview').css('top',p + $('#toolbarview').height());
        }else{
            $('.well').css('position','static');
            $('.well').css('top','');

//                $('.treeview').css('position','static');
//                $('.treeview').css('top','');
        }
    });
});

//    editor.on("blur", function(){
//        console.log('editor lost focus');
//        setTimeout(function () {
//            editor.focus();
//        },500);
//    });

$('.btn').on('click',function(){
    var unfocus = $(this).data('unfocus');
    if(unfocus == undefined || unfocus == '0'){
        editor.focus();
    }
});

function midDiv(DivId,left) {
    var Div = $(DivId);
    $(DivId).style.top = (document.documentElement.scrollTop + (document.documentElement.clientHeight - $(DivId).offsetHeight) / 2) + "px";
//        $(DivId).style.left = (document.documentElement.scrollLeft + (document.documentElement.clientWidth - $(DivId).offsetWidth) / 2) + "px";
    $(DivId).style.left = left;
}

editor.focus();

editor.on("paste",function(editor,e){
    if(!(e.clipboardData&&e.clipboardData.items)){
        alert("该浏览器不支持操作");
        return;
    }
    for (var i = 0, len = e.clipboardData.items.length; i < len; i++) {
        var item = e.clipboardData.items[i];
        // console.log(item.kind+":"+item.type);
        if (item.kind === "string") {
            item.getAsString(function (str) {
                // str 是获取到的字符串
                console.log('get str');
                console.log(str);
            })
        } else if (item.kind === "file") {
            var pasteFile = item.getAsFile();
            // pasteFile就是获取到的文件
            console.log(pasteFile);
            fileUpload(pasteFile);
        }
    }
});

editor.on("drop",function(editor,e){
    // console.log(e.dataTransfer.files[0]);
    if(!(e.dataTransfer&&e.dataTransfer.files)){
        alert("该浏览器不支持操作");
        return;
    }
    for(var i=0;i<e.dataTransfer.files.length;i++){
        //console.log(e.dataTransfer.files[i]);
        fileUpload(e.dataTransfer.files[i]);
    }
    e.preventDefault();
});

//文件上传
function fileUpload(fileObj){
    var $scope=angular.element('#wikiEditor').scope();
    $scope.cmd_image_upload(fileObj,function(error, result, request){
        console.log(result.content.download_url);
        $.get(result.content.download_url, function(data){
              console.log(data);
        });
    });
    return;
}

//阻止浏览器默认打开拖拽文件的行为
window.addEventListener("drop",function(e){
    e = e || event;
    e.preventDefault();
    if (e.target.tagName == "textarea") {  // check wich element is our target
        e.preventDefault();
    }
},false);

