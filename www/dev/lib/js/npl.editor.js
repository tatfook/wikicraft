/**
 * Created by karlwu on 2016-10-08.
 */
var editor = ace.edit("editor");
editor.setTheme("ace/theme/tomorrow");
editor.session.setMode("ace/mode/markdown");
editor.setAutoScrollEditorIntoView(true);

editor.getSession().on('change', function(e) {
    var source = editor.getValue();
    $('#txtSource').val(source);
});

var defaultData = [
    {
        text: 'Parent 1',
        href: '#parent1',
        tags: ['4'],
        nodes: [
            {
                text: 'Child 1',
                href: '#child1',
                tags: ['2'],
                nodes: [
                    {
                        text: 'Grandchild 1',
                        href: '#grandchild1',
                        tags: ['0']
                    },
                    {
                        text: 'Grandchild 2',
                        href: '#grandchild2',
                        tags: ['0']
                    }
                ]
            },
            {
                text: 'Child 2',
                href: '#child2',
                tags: ['0']
            }
        ]
    },
    {
        text: 'Parent 2',
        href: '#parent2',
        tags: ['0']
    },
    {
        text: 'Parent 3',
        href: '#parent3',
        tags: ['0']
    },
    {
        text: 'Parent 4',
        href: '#parent4',
        tags: ['0']
    },
    {
        text: 'Parent 5',
        href: '#parent5'  ,
        tags: ['0']
    }
];

$('#treeview').treeview({
    color: "#428bca",
    showBorder: false,
    data: defaultData
});

var showTreeview = true;

function initView(){

    $("#aceview").removeClass('col-xs-12');
    $("#aceview").removeClass('col-xs-10');
    $("#aceview").removeClass('col-xs-6');
    $("#aceview").removeClass('col-xs-5');

    $("#preview").removeClass('col-xs-12');
    $("#preview").removeClass('col-xs-10');
    $("#preview").removeClass('col-xs-6');
    $("#preview").removeClass('col-xs-5');

    if($("#treeview").is(":hidden")){
        if($("#preview").is(":hidden")){
            $("#aceview").addClass('col-xs-12');
        }else{
            $("#aceview").addClass('col-xs-6');
        }
        if($("#aceview").is(":hidden")){
            $("#preview").addClass('col-xs-12');
        }else{
            $("#preview").addClass('col-xs-6');
        }
    }else{
        if($("#preview").is(":hidden")){
            $("#aceview").addClass('col-xs-10');
        }else{
            $("#aceview").addClass('col-xs-5');
        }
        if($("#aceview").is(":hidden")){
            $("#preview").addClass('col-xs-10');
        }else{
            $("#preview").addClass('col-xs-5');
        }
    }
}

$('.toolbar-page-file').on('click',function(){
    $('#treeview').toggle('fast',function(){
        initView();
    });
});

$('.toolbar-page-code').on('click',function(){
    $('#aceview').show();
    $("#preview").hide('fast',function(){
        initView();
    });
});

$('.toolbar-page-slide').on('click',function(){
    $('#aceview').show();
    $("#preview").show('fast',function(){
        initView();
    });
});

$('.toolbar-page-design').on('click',function(){
    $('#preview').show();
    $("#aceview").hide('fast',function(){
        initView();
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
        alert ("成功拷贝到剪切板!");
    }
    else {
        alert ("您的浏览器不支持访问剪切板!");
    }
}

$('.toolbar-page-copyurl').on('click',function(){
    CopyToClipboard($('#editorUrl').html());
});

$('.toolbar-page-preview').on('click',function(){
    var url = $('#editorUrl').html();
    window.open(url);

});
