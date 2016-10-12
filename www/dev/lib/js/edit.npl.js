/**
 * Created by karlwu on 2016-10-08.
 */
var editor = ace.edit("editor");
editor.setTheme("ace/theme/tomorrow");
editor.session.setMode("ace/mode/markdown");
editor.setAutoScrollEditorIntoView(true);
//editor.setOptions({
//    enableBasicAutocompletion: true,
//    enableSnippets: true,
//    enableLiveAutocompletion: false
//});
editor.getSession().on('change', function(e) {
    // e.type, etc
    var source = editor.getValue();
    $('#txtSource').val(source);

    // only to update permalink
    $('.result-html').html(mdHtml.render(source));

    event.preventDefault();
});

$('.source-clear').on('click', function () {
    editor.setValue('');
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



