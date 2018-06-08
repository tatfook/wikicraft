/**
 * Created by 18730 on 2017/7/31.
 */
define([], function () {
    var mods = [
        {
            "name": "标题H1",
            "classifyName": "标题",
            "wikiCmdName": "@wiki/js/title/title",
            "desc": "标题，可附带文本内容",
            "content": '```@wiki/js/title\n{"moduleKind":"title","title":"栏目名称","content":"栏目内容部分，内容无限多，若为空字符串，则该内容部分隐藏，只显示标题"\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_title.jpg"
        },
        {
            "name": "标题H2",
            "classifyName": "标题",
            "wikiCmdName": "@wiki/js/title/title2",
            "desc": "标题，可附带文本内容",
            "content": '```@wiki/js/title\n{"moduleKind":"title2","column":"栏目名称","columnInfo":"COLUMN","content":"栏目内容部分，内容无限多，若为空字符串，则该内容部分隐藏，只显示标题"\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_title.jpg"
        },
        {
            "name": "标题H3",
            "classifyName": "标题",
            "wikiCmdName": "@wiki/js/title/title3",
            "desc": "标题，可附带文本内容、链接等",
            "content": '```@wiki/js/title\n{"moduleKind":"title3","title":"标题标题","content":"简介简介，[可以加链接](链接url)：（我不是链接）。换行是 两个空格+反斜杠+n"\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_title.jpg"
        },
        {
            "name": "通用页首",
            "classifyName": "个人介绍",
            "wikiCmdName": "@wiki/js/header/organization",
            "desc": "头部,包含介绍信信息",
            "content": '```@wiki/js/header\n{"moduleKind":"organization","displayBgImg":"http://keepwork.com/wiki/js/mod/wiki/assets/imgs/blog_header_banner.jpg","displayName":"展示名称","location":"地址","info":"其余信息","introduce":"这里是一段描述介绍的文字，内容自定义。介绍自己等等内容。"\n}\n```',
            "logoUrl": "wiki/assets/imgs/personal_header.jpg"
        },
        {
            "name": "活动页首",
            "classifyName": "标题",
            "wikiCmdName": "@wiki/js/header/game",
            "desc": "头部,适合比赛",
            "content": '```@wiki/js/header\n{"moduleKind":"game","bgImg":"","title":"标题标题大标题","message":"副标题副标题","stages":[{"name":"阶段1","time":"时间时间"},{"name":"阶段2","time":"时间时间"},{"name":"阶段3","time":"时间时间"}]\n}\n```',
            "logoUrl": "wiki/assets/imgs/personal_header.jpg"
        },
        {
            "name": "活动页首2",
            "classifyName": "标题",
            "wikiCmdName": "@wiki/js/header/game2",
            "desc": "头部,适合比赛",
            "content": '```@wiki/js/header\n{"moduleKind":"game2","bgImg":"","title":"标题标题标题标题","subTitle":"———— 副标题 ————","message":"额外信息额外信息额外信息额外信息","time":"时间或者其它信息"\n}\n```',
            "logoUrl": "wiki/assets/imgs/personal_header.jpg"
        },
        {
            "name": "双按钮页首",
            "classifyName": "标题",
            "wikiCmdName": "@wiki/js/header/haqiGame",
            "desc": "头部,可配置按钮类型（增加bootstrap类）。适合游戏类头部",
            "content": '```@wiki/js/header\n{"moduleKind":"haqiGame","bgImg":"https://api.keepwork.com/git/gitlab_www_kaitlyn/keepworkmodules/raw/master/kaitlyn_images/img_1499331756906.png","btnGroup1":[{"text":"按钮一","link":"#","btnClass":""}],"btnGroup2":[{"text":"按钮二","link":"#","btnClass":""}]\n}\n```',
            "logoUrl": "wiki/assets/imgs/personal_header.jpg"
        },
        {
            "name": "图片循环播放",
            "classifyName": "轮播",
            "wikiCmdName": "@wiki/js/companyCarousel",
            "desc": "轮播，从左到右，循环",
            "content": '```@wiki/js/companyCarousel\n{"carouselImg":["https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1491977168649&di=a6bc50097f28c0508e046746d7da29a0&imgtype=0&src=http%3A%2F%2Fpic.90sjimg.com%2Fback_pic%2Fqk%2Fback_origin_pic%2F00%2F01%2F86%2Ff548129ce938a644a245f19d67d032c7.jpg","https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1491977186450&di=32ac5744e99460e3d3525052e2bde53f&imgtype=0&src=http%3A%2F%2Fwww.goto307.com.tw%2Fupload%2Fbanner_ins_list%2Fb0c218ed21c3916d4531f182e9712115.jpg"]\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_carousel.jpg"
        },
        {
            "name": "标题与横排导航栏",
            "classifyName": "导航",
            "wikiCmdName": "@wiki/js/companyNavbar",
            "desc": "导航条",
            "content": '```@wiki/js/companyNavbar\n{"companyName":"公司名","companyInfo":"公司介绍公司介绍","navItems":[{"name":"链接分类一","url":"#"},{"name":"链接分类二","subUrl":[{"name":"链接1","url":"#"},{"name":"链接2","url":"#"}]},{"name":"链接分类三","subUrl":[{"name":"链接3","url":"#"},{"name":"链接4","url":"#"},{"name":"链接5","url":"#"},{"name":"链接6","url":"#"}]},{"name":"链接分类四","subUrl":[{"name":"链接7","url":"#"}]},{"name":"链接分类五","subUrl":[{"name":"链接8","url":"#"}]},{"name":"链接分类六","url":"http://keepwork.com"},{"name":"链接分类七","url":"http://keepwork.com"}]\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_navbar.jpg"
        },
        {
            "name": "二级横排导航栏",
            "classifyName": "导航",
            "wikiCmdName": "@wiki/js/companyBottomNav",
            "desc": "导航链接集合",
            "content": '```@wiki/js/companyBottomNav\n{"navItems":[{"name":"链接分类一","url":"#"},{"name":"链接分类二","subUrl":[{"name":"链接1","url":"#"},{"name":"链接2","url":"#"}]},{"name":"链接分类三","subUrl":[{"name":"链接3","url":"#"},{"name":"链接4","url":"#"},{"name":"链接5","url":"#"},{"name":"链接6","url":"#"}]},{"name":"链接分类四","subUrl":[{"name":"链接7","url":"#"},{"name":"链接8","url":"#"},{"name":"链接9","url":"#"},{"name":"链接10","url":"#"}]},{"name":"链接分类五","subUrl":[{"name":"链接11","url":"#"}]},{"name":"链接分类六","url":"#"},{"name":"链接分类七","url":"#"}]\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_navbar.jpg"
        },
        {
            "name": "标题自动生成左侧导航边栏",
            "classifyName": "导航",
            "wikiCmdName": "@toc",
            "desc": "根据内容动态生成导航",
            "content": '```@toc\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout2.jpg"
        },
        {
            "name": "页底横排导航栏",
            "classifyName": "导航",
            "wikiCmdName": "@wiki/js/companyFooter",
            "desc": "底部导航条",
            "content": '```@wiki/js/companyFooter\n{"companyName":"公司名","companyInfo":"版权信息","friendsLinks":[{"name":"链接1","url":"#"},{"name":"链接2","url":"#"},{"name":"链接3","url":"#"}]\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_navbar.jpg"
        },
        {
            "name": "栏目与三篇文章展示",
            "classifyName": "列表",
            "wikiCmdName": "@wiki/js/companyNews",
            "desc": "列表信息展示1",
            "content": '```@wiki/js/companyNews\n{"columnName":"COL","columnInfo":"栏目名称","moreNewsLink":"#","topNewsTitle":"文章标题一，头条","topNewsContent":"文章简介 只显示两行，超过两行的文字隐藏并且在文字末尾显示省略号文章简介 只显示两行，超过两行的文字隐藏并且在文字末尾显示省略号文章简介 只显示两行，超过两行的文字隐藏并且在文字末尾显示省略号文章简介 只显示两行，超过两行的文字隐藏并且在文字末尾显示省略号","topNewsImg":"http://keepwork.com/wiki/assets/imgs/wiki_works.jpg","topNewsLink":"#","news":[{"title":"文章标题二","content":"文章简介 只显示一行，超过两行的文字隐藏并且在文字末尾显示省略号；文章简介 只显示一行，超过两行的文字隐藏并且在文字末尾显示省略号","yearMonth":"年份-月份","day":"01","newsLink":"#"},{"title":"文章标题二", "content":"文章简介 只显示一行，超过两行的文字隐藏并且在文字末尾显示省略号；文章简介 只显示一行，超过两行的文字隐藏并且在文字末尾显示省略号","yearMonth":"年份-月份","day":"01","newsLink":"#"}]\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout2.jpg"
        },
        {
            "name": "左一右二 新闻列表",
            "classifyName": "列表",
            "wikiCmdName": "@wiki/js/companyNewsSecond",
            "desc": "列表信息展示2",
            "content": '```@wiki/js/companyNewsSecond\n{"columnName":"NEWS","columnInfo":"新闻资讯","moreNewsLink":"http://www.tatfook.com/?cat=24","topNewsTitle":"文章标题一，头条，一行显示，超出部分隐藏并且在文字末尾显示省略号省略号","topNewsContent":"文章简介  只显示两行，超过两行的文字隐藏并且在文字末尾显示省略号文章简介 只显示两行，超过两行的文字隐藏并且在文字末尾显示省略号文章简介 只显示两行，超过两行的文字隐藏并且在文字末尾显示省略号文章简介 只显示两行，超过两行的文字隐藏并且在文字末尾显示省略号","topNewsImg":"http://keepwork.com/wiki/assets/imgs/wiki_works.jpg","topNewsLink":"#","news":[{"title":"标题二，一行，超出显示省略号，超出显示省略号，超出显示省略号","content":"文章简介 只显示两行，超过两行的文字隐藏并且在文字末尾显示省略号文章简介  只显示两行，超过两行的文字隐藏并且在文字末尾显示省略号文章简介 只显示两行，超过两行的文字隐藏并且在文字末尾显示省略号文章简介 只显示两行，超过两行的文字隐藏并且在文字末尾显示省略号","yearMonth":"年份-月份","day":"01","newsLink":"#"},{"title":"标题三，一行，超出显示省略号，超出显示省略号，超出显示省略号","content":"文章简介  只显示两行，超过两行的文字隐藏并且在文字末尾显示省略号文章简介  只显示两行，超过两行的文字隐藏并且在文字末尾显示省略号文章简介 只显示两行，超过两行的文字隐藏并且在文字末尾显示省略号文章简介 只显示两行，超过两行的文字隐藏并且在文字末尾显示省略号","yearMonth":"年份-月份","day":"02","newsLink":"#"}]\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout2.jpg"
        },
        {
            "name": "文字列表",
            "classifyName": "列表",
            "wikiCmdName": "@wiki/js/rules/game",
            "desc": "文字列表，可用于有条理性的文字",
            "content": '```@wiki/js/rules\n{"moduleKind":"game","title":"栏目名称","rules":[{"title":"第一项","describe":"第一项内容介绍，一行内容比较好看；第一项内容介绍，一行内容比较好看；第一项内容介绍，一行内容比较好看；第一项内容介绍"},{"title":"第二项","describe":"第二项内容描述，一行内容比较好看；第二项内容描述，一行内容比较好看；第二项内容描述，一行内容比较好看"},{"title":"第三项","describe":"第三项内容介绍，一行内容比较好看；第三项内容介绍，一行内容比较好看；第三项内容介绍，一行内容比较好看；第三项内容介绍"}]\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout.jpg"
        },
        {
            "name": "头像列表",
            "classifyName": "列表",
            "wikiCmdName": "@wiki/js/siteMemberList/gameDemo",
            "desc": "头像列表，一行显示8个头像，自动分页",
            "content": '```@wiki/js/siteMemberList\n{"moduleKind":"gameDemo","title":"栏目名称","memberList":[{"imgUrl":"","username":"用户名1","roleName":"创建者"},{"imgUrl":"","username":"用户名2","roleName":"创建者"},{"imgUrl":"","username":"用户名3","roleName":"创建者"},{"imgUrl":"","username":"用户名4","roleName":"创建者"},{"imgUrl":"","username":"用户名5","roleName":"创建者"},{"imgUrl":"","username":"用户名6","roleName":"创建者"},{"imgUrl":"","username":"用户名7","roleName":"创建者"},{"imgUrl":"","username":"用户名8","roleName":"创建者"},{"imgUrl":"","username":"用户名9","roleName":"创建者"},{"imgUrl":"","username":"用户名10","roleName":"成员"}]\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout.jpg"
        },
        {
            "name": "页面列表",
            "classifyName": "列表",
            "wikiCmdName": "@wiki/js/pageList",
            "desc": "页面列表及配置编辑",
            "content": '```@wiki/js/pageList\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout2.jpg"
        },
        {
            "name": "左图右文字介绍",
            "classifyName": "图文混排",
            "wikiCmdName": "@wiki/js/companyAbout",
            "desc": "左边图片，右边文字。展示布局",
            "content": '```@wiki/js/companyAbout\n{"columnName":"栏目名称","columnInfo":"栏目名称","moreNewsLink":"#","paragraphs":["段落1：栏目的具体介绍， 显示8行文字护比较好看,这里可以手动配置文字","段落2：栏目的具体介绍， 显示8行文字护比较好看,这里可以手动配置文字","段落3：栏目的具体介绍， 显示8行文字护比较好看,这里可以手动配置文字","段落4：栏目的具体介绍， 显示8行文字护比较好看,这里可以手动配置文字","段落5：栏目的具体介绍，显示8行文字护比较好看,这里可以手动配置文字","段落6：栏目的具体介绍， 显示8行文字护比较好看,这里可以手动配置文字","段落7：栏目的具体介绍， 显示8行文字护比较好看,这里可以手动配置文字","段落8：这里可以手动配置文字，超出部分会自动截取"],"companyImg":"https://api.keepwork.com/git/gitlab_www_kaitlyn/keepworkmodules/raw/master/kaitlyn_images/img_1499236926676.jpeg"\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout2.jpg"
        },
        {
            "name": "左文字右图介绍",
            "classifyName": "图文混排",
            "wikiCmdName": "@wiki/js/companyAboutSecond",
            "desc": "左边文字，右边图片。展示布局",
            "content": '```@wiki/js/companyAboutSecond\n{"columnName":"栏目名称","columnInfo":"COLUMN","moreNewsLink":"#","paragraphs":["段落1：栏目的具体介绍，显示8行文字护比较好看,这里可以手动配置文字","段落2：栏目的具体介绍，显示8行文字护比较好看,这里可以手动配置文字","段落3：栏目的具体介绍，显示8行文字护比较好看,这里可以手动配置文字","段落4：栏目的具体介绍，显示8行文字护比较好看,这里可以手动配置文字","段落5：栏目的具体介绍，显示8行文字护比较好看,这里可以手动配置文字","段落6：栏目的具体介绍，显示8行文字护比较好看,这里可以手动配置文字","段落7：栏目的具体介绍， 显示8行文字护比较好看,这里可以手动配置文字","段落8：这里可以手动配置文字，超出部分会隐藏并且把了解详情链接挤没了"],"companyImg":"https://api.keepwork.com/git/gitlab_www_kaitlyn/keepworkmodules/raw/master/kaitlyn_images/img_1499236926676.jpeg"\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout.jpg"
        },
        {
            "name": "左图右文字介绍2",
            "classifyName": "图文混排",
            "wikiCmdName": "@wiki/js/layouts/leftImg",
            "desc": "左边图片，右边文字，适合下载页面",
            "content": '```@wiki/js/layouts\n{"moduleKind":"leftImg",	"img":"https://api.keepwork.com/git/gitlab_rls_tibet/keepworkdatasource/raw/master/tibet_images/img_1504167340127.png","title":"欢迎下载XXX软件","detail":"XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 ","link":"#","moreText":"了解更多>>","info":"额外信息介绍啊","infoLinks":[{"url":"#","text":"这里是链接"}]\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout2.jpg"
        },
        {
            "name": "标题与四列图文信息",
            "classifyName": "图文混排",
            "wikiCmdName": "@wiki/js/rewards/game",
            "desc": "图片+文字布局（四列显示）",
            "content": '```@wiki/js/rewards\n{"moduleKind":"game","title":"栏目名称","rewards":[{"title":"列一","num":"（列信息）","describe":"列简介","imgUrl":"https://api.keepwork.com/git/gitlab_www_kaitlyn/keepworkmodules/raw/master/kaitlyn_images/img_1499331997328.png"},{"title":"列二","num":"（列信息）","describe":"列简介","imgUrl":"https://api.keepwork.com/git/gitlab_www_kaitlyn/keepworkmodules/raw/master/kaitlyn_images/img_1499331997328.png"},{"title":"列三","num":"（列信息）","describe":"列简介","imgUrl":"https://api.keepwork.com/git/gitlab_www_kaitlyn/keepworkmodules/raw/master/kaitlyn_images/img_1499331997328.png"},{"title":"列四","num":"（列信息）","describe":"列简介","imgUrl":"https://api.keepwork.com/git/gitlab_www_kaitlyn/keepworkmodules/raw/master/kaitlyn_images/img_1499331997328.png"}]\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout.jpg"
        },
        {
            "name": "标题与四列作品信息",
            "classifyName": "图文混排",
            "wikiCmdName": "@wiki/js/workslist/gameStatic",
            "desc": "图片+文字布局（四列显示）",
            "content": '```@wiki/js/workslist\n{"moduleKind":"gameStatic","title":"栏目名称","moreLink":"#","worksList":[{"workLink":"#","imgUrl":"","workName":"作品名","authorLink":"#","author":"作者","info":"浏览量","count":"5"},{"workLink":"#","imgUrl":"","workName":"作品名","authorLink":"#","author":"作者","info":"浏览量","count":"5"},{"workLink":"#","imgUrl":"","workName":"作品名","authorLink":"#","author":"作者","info":"浏览量","count":"5"},{"workLink":"#","imgUrl":"","workName":"作品名","authorLink":"#","author":"作者","info":"浏览量","count":"5"}]\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout.jpg"
        },
        {
            "name": "标题与四列作品信息2",
            "classifyName": "图文混排",
            "wikiCmdName": "@wiki/js/workslist/gameDemo",
            "desc": "图片+文字布局（四列显示）",
            "content": '```@wiki/js/workslist\n{"moduleKind":"gameDemo","title":"栏目名称","moreLink":"#","worksList":[{"imgLink":"#","imgUrl":"","workLink":"#","workName":"作品名","authorLink":"#","author":"作者"},{"imgLink":"#","imgUrl":"","workLink":"","workName":"作品名","authorLink":"","author":"作者"},{"imgLink":"#","imgUrl":"","workLink":"","workName":"作品名","authorLink":"","author":"作者"},{"imgLink":"#","imgUrl":"","workLink":"","workName":"作品名","authorLink":"","author":"作者"}]\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout.jpg"
        },
        {
            "name": "栏目与三项产品展示",
            "classifyName": "图文混排",
            "wikiCmdName": "@wiki/js/companyWorksList",
            "desc": "产品展示",
            "content": '```@wiki/js/companyWorksList\n{"columnName":"COLUMN","columnInfo":"栏目名称","moreNewsLink":"#","works":[{"workImg":"http://keepwork.com/wiki/assets/imgs/wiki_works.jpg","workTitle":"产品一","workLink":"#"},{"workImg":"http://keepwork.com/wiki/js/mod/wiki/assets/imgs/company_news_top.jpg","workTitle":"产品二","workLink":"#"},{"workImg":"http://keepwork.com/wiki/assets/imgs/wiki_works.jpg","workTitle":"产品三","workLink":"#"}]\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_products.jpg"
        },
        {
            "name": "栏目与三项产品展示2",
            "classifyName": "图文混排",
            "wikiCmdName": "@wiki/js/companyWorksListSecond",
            "desc": "产品展示二",
            "content": '```@wiki/js/companyWorksListSecond\n{"columnName":"栏目名称","columnInfo":"COLUMN","moreNewsLink":"#","works":[{"workImg":"http://keepwork.com/wiki/js/mod/wiki/assets/imgs/company_news_top.jpg","workTitle":"产品一","workLink":"#"},{"workImg":"http://keepwork.com/wiki/assets/imgs/wiki_works.jpg","workTitle":"产品二","workLink":"#"},{"workImg":"http://keepwork.com/wiki/js/mod/wiki/assets/imgs/company_news_top.jpg","workTitle":"产品三","workLink":"#"}]\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_products.jpg"
        },
        {
            "name": "软件下载",
            "classifyName": "下载",
            "wikiCmdName": "```@wiki/js/layouts/PCDownload",
            "desc": "左边图片，右边文字，适合下载页面",
            "content": '```@wiki/js/layouts\n{"moduleKind":"PCDownload","imgUrl":"https://api.keepwork.com/git/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1503996369093.png","title":"Windows版","titleInfo":"软件大小","info":"额外信息，比如支持的版本等","iconImg":"https://api.keepwork.com/git/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1503996562536.png","btnText":"下载","rightTitle":"下面是一些其它下载链接：","details":[{"text":"该下载具体信息介绍，该下载具体信息介绍，该下载具体信息介绍，该下载具体信息介绍","info":"下载地址","link":"#","linkText":"这是下载链接1"},{"text":"该下载具体信息介绍，该下载具体信息介绍，该下载具体信息介绍，该下载具体信息介绍","info":"下载地址","link":"#","linkText":"[这是下载链接2]"},{"text":"该下载具体信息介绍，该下载具体信息介绍，该下载具体信息介绍，该下载具体信息介绍","info":"下载地址","link":"#","linkText":"*这是下载链接3*"}]\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout.jpg"
        },
        {
            "name": "一行两个下载",
            "classifyName": "下载",
            "wikiCmdName": "@wiki/js/layouts/AndroidIOS",
            "desc": "图片+文字布局（两列显示），适合下载",
            "content": '```@wiki/js/layouts\n{"moduleKind":"AndroidIOS","device1":{"img":"https://api.keepwork.com/git/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1504062266400.png","title":"Android版","link":"#","info":"这里是android安装包的下载链接","detail":"XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍。"},"device2":{"img":"https://api.keepwork.com/git/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1504062280837.png","title":"IOS版","link":"#","info":"这里是ios安装包的下载链接","detail":"XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍 XXX软件介绍客户端介绍游戏介绍APP介绍等等介绍。"}\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout.jpg"
        },
        {
            "name": "个人数据统计",
            "classifyName": "统计",
            "wikiCmdName": "@wiki/js/statics/personal",
            "desc": "个人统计信息",
            "content": '```@wiki/js/statics\n{"moduleKind":"personal"\n}\n```',
            "logoUrl": "wiki/assets/imgs/personal_statics.png"
        },
        {
            "name": "设定三项统计信息",
            "classifyName": "统计",
            "wikiCmdName": "@wiki/js/statics/game",
            "desc": "通用信息统计，展示三类统计信息",
            "content": '```@wiki/js/statics\n{"moduleKind":"game","userCountText":"统计信息一","userCount":"1","worksCountText":"统计信息二","worksCount":"2","riseCountText":"统计信息三","riseCount":"3"\n}\n```',
            "logoUrl": "wiki/assets/imgs/personal_statics.png"
        },
       {
            "name": "评论",
            "classifyName": "交互",
            "wikiCmdName": "@wiki/js/comment",
            "desc": "评论模块（包括评论列表以及发表评论区域）",
            "content": '```@wiki/js/comment\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout2.jpg"
        },
        {
            "name": "VIP阅读权限",
            "classifyName": "交互",
            "wikiCmdName": "@wiki/js/permission",
            "desc": "文章需要VIP才能阅读全文",
            "content": '```@wiki/js/permission\n{"moduleKind":"vipPermission"\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_vipmore.png"
        },
        {
            "name": "调用QQ",
            "classifyName": "交互",
            "wikiCmdName": "@wiki/js/chat/qqChat",
            "desc": "QQ客服",
            "content": '```@wiki/js/chat\n{"moduleKind": "qqChat","message": "客服中心","qq": "825973524"\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout2.jpg"
        },
        {
            "name": "Paracraft 3D世界",
            "classifyName": "多媒体",
            "wikiCmdName": "@wiki/js/world3D",
            "desc": "在网页中嵌入Paracraft创作的3D世界",
            "content": '```@wiki/js/world3D\n{"worldName":"3D海洋世界","worldUrl":"https://github.com/LiXizhi/HourOfCode/archive/master.zip","logoUrl":"","username":"lixizhi","visitCount":235,"favoriteCount":51,"updateDate":"2017-03-30","version":"1.0.1"\n}\n```',
            "logoUrl": "wiki/assets/imgs/3DWorld_model.jpg"
        },
        {
            "name": "富文本编辑器",
            "classifyName": "多媒体",
            "wikiCmdName": "@wiki/js/richText",
            "desc": "富文本编辑模块",
            "content": '```@wiki/js/richText\n```',
            "logoUrl": "wiki/assets/imgs/richText.png"
        },
        {
            "name": "播放视频",
            "classifyName": "多媒体",
            "wikiCmdName": "@wiki/js/video",
            "desc": "标题，可附带文本内容",
            "content": '```@wiki/js/video\n{"videoUrl":"https://player.vimeo.com/video/222399949"\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_media.jpg"
        },
       {
            "name": "引用markdown文件",
            "classifyName": "多媒体",
            "wikiCmdName": "@wiki/js/include",
            "desc": "引用markdown(方式一)",
            "content": '```@wiki/js/include\n{"contentUrl": "/username/projectname/pagename"\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout2.jpg"
        },
        {
            "name": "引用markdown文件2",
            "classifyName": "多媒体",
            "wikiCmdName": "@include",
            "desc": "引用markdown(方式二)",
            "content": '```@include\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout2.jpg"
        },
        {
            "name": "博客页首",
            "classifyName": "博客",
            "wikiCmdName": "@wiki/js/blogHeader",
            "desc": "个人博客头部",
            "content": '```@wiki/js/blogHeader\n{"introduce":"这里是个人简介区域，可以自定义。"\n}\n```',
            "logoUrl": "wiki/assets/imgs/personal_header.jpg"
        },
        {
            "name": "博客网站信息统计",
            "classifyName": "博客",
            "wikiCmdName": "@wiki/js/blogStatics",
            "desc": "个人博客信息统计",
            "content": '```@wiki/js/blogStatics\n```',
            "logoUrl": "wiki/assets/imgs/personal_statics.png"
        },
        {
            "name": "博客单列列表",
            "classifyName": "博客",
            "wikiCmdName": "@wiki/js/blogMain",
            "desc": "个人博客作品列表展示",
            "content": '```@wiki/js/blogMain\n```',
            "logoUrl": "wiki/assets/imgs/wiki_workslist.png"
        },
        {
            "name": "博客带侧边栏列表",
            "classifyName": "博客",
            "wikiCmdName": "@wiki/js/blogMain1",
            "desc": "博客配置，外链到博客详情",
            "content": '```@wiki/js/blogMain\n{"moduleKind":"blogMain1","moreText":"查看更多","blogs":[{"contents":[{"content":"我是只化身孤岛的蓝鲸,有着最巨大的身影鱼虾在身侧穿行也有飞鸟在背上停,我路过太多太美的奇景如同伊甸般的仙境,而大海太平太静多少故事无人我爱地中海的天晴,爱西伯利亚的雪景,爱万丈高空的鹰, 爱肚皮下的藻荇我在尽心尽力地多情,直到那一天,你的衣衫破旧而歌声却温柔陪我漫无目的四处漂流，我的背脊如荒丘而你却微笑摆首把它当成整个宇宙, 你与太阳挥手也同海鸥问候陪我爱天爱地四处风流只是遗憾你终究无法躺在我胸口欣赏夜辽阔的不朽，把星子放入眸..."},{"content":"我是只化身孤岛的蓝鲸,有着最巨大的身影鱼虾在身侧穿行也有飞鸟在背上停,我路过太多太美的奇景如同伊甸般的仙境,而大海太平太静多少故事无人我爱地中海的天晴,爱西伯利亚的雪景,爱万丈高空的鹰, 爱肚皮下的藻荇我在尽心尽力地多情,直到那一天,你的衣衫破旧而歌声却温柔陪我漫无目的四处漂流..."}],"link":"#"},{"contents":[{"content":"我是只化身孤岛的蓝鲸,有着最巨大的身影鱼虾在身侧穿行也有飞鸟在背上停,我路过太多太美的奇景如同伊甸般的仙境,而大海太平太静多少故事无人我爱地中海的天晴,爱西伯利亚的雪景,爱万丈高空的鹰, 爱肚皮下的藻荇我在尽心尽力地多情,直到那一天,你的衣衫破旧而歌声却温柔陪我漫无目的四处漂流，我的背脊如荒丘而你却微笑摆首把它当成整个宇宙, 你与太阳挥手也同海鸥问候陪我爱天爱地四处风流只是遗憾你终究无法躺在我胸口欣赏夜辽阔的不朽，把星子放入眸..."}],"link":"#"}],"location":"地点","phone":"手机号","email":"邮箱","usermessage":"地点等信息啊简介","education":"教育信息学校信息简介","reward":"获奖记录"\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_workslist.png"
        },
        {
            "name": "个人站点页首",
            "classifyName": "个人介绍",
            "wikiCmdName": "@wiki/js/header/personal",
            "desc": "个人站点头部",
            "content": '```@wiki/js/header\n{"moduleKind":"personal"\n}\n```',
            "logoUrl": "wiki/assets/imgs/personal_header.jpg"
        },
        {
            "name": "个人页首 大板型",
            "classifyName": "个人介绍",
            "wikiCmdName": "@wiki/js/header/personal2",
            "desc": "名片式头部",
            "content": '```@wiki/js/header\n{"moduleKind":"personal2","displayName":"姓名","nameinfo":"职位","name":"PingYin Or EnglishName","bgUrl":"https://api.keepwork.com/git/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1504170502765.jpeg","messages":[{"message":"信息1介绍介绍简介简介","info":"额外信息PingYin Or EnglishName"},{"message":"信息2介绍介绍简介简介","info":"额外信息PingYin Or EnglishName额外信息"},{"message":"信息3介绍介绍简介简介","info":"额外信息PingYin Or EnglishName额外信息EnglishName"}],"phone":"手机号","email":"邮箱","qq":"QQ号","wechat":"微信号","weibo":"新浪微博号"\n}\n```',
            "logoUrl": "wiki/assets/imgs/personal_header.jpg"
        },
        {
            "name": "个人页首 小板型",
            "classifyName": "个人介绍",
            "wikiCmdName": "@wiki/js/header/personal3",
            "desc": "头部，包含头像、QQ等信息",
            "content": '```@wiki/js/header\n{"moduleKind":"personal3","headerBg":"https://api.keepwork.com/git/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1503653688101.jpeg","profile":"http://keepwork.com/wiki/assets/imgs/wiki_default_profile.jpg","displayName":"姓名","nameinfo":"职位","name":"PingYin Or EnglishName","messages":[{"message":"信息1介绍介绍简介简介"},{"message":"信息2介绍介绍简介简介"},{"message":"信息3介绍介绍简介简介"}],"qq":"qq号","wechat":"微信号","weibo":"微博账号"\n}\n```',
            "logoUrl": "wiki/assets/imgs/personal_header.jpg"
        },
        {
            "name": "个人简介页首",
            "classifyName": "个人介绍",
            "wikiCmdName": "@wiki/js/resumeHeader",
            "desc": "头部,可配置头像、姓名、简介等",
            "content": '```@wiki/js/resumeHeader\n{"backgroundImage":"","portrait":"","username":"逍遥","baseInfo":"男 本科 3年工作经验 深圳","company":"xxx","cellphone":"187027*****","email":"765485868@qq.com","introduce":"我是一个边学习边分享的人。关于读书、关于影视剧、关于足球， 所学，所思，所感，所闻，分享一切有趣的、有用的。"\n}\n```',
            "logoUrl": "wiki/assets/imgs/personal_header.jpg"
        },
        {
            "name": "简历：工作、学历",
            "classifyName": "个人介绍",
            "wikiCmdName": "@wiki/js/resumeDetail",
            "desc": "简历主体部分，包括工作经历、教育经历、期望工作三部分",
            "content": '```@wiki/js/resumeDetail\n{"workList":[{"company":"公司名1","time":"工作时间","job":"职位","desc":"工作内容简述"},{"company":"公司名2","time":"工作时间","job":"职位","desc":"工作内容简述"}],"educationList":[{"schoolName":"学校名","graduationDate":"毕业时间","desc":"教育经历简述"}],"expectWorkList":[{"job":"意向职位","workType":"工作时间","salary":"期望薪资","position":"意向工作城市"}]\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout2.jpg"
        },
        {
            "name": "简历：期待工作",
            "classifyName": "个人介绍",
            "wikiCmdName": "@wiki/js/resumeDetail/flexible",
            "desc": "简历主体部分，内容定义相对第一种更加灵活",
            "content": '```@wiki/js/resumeDetail\n{"moduleKind":"flexible","rows":[{"title":"工作经历","details":[{"title":"公司名","info":"工作时间","subscribe":"工作职位","detail":"职位描述"},{"title":"公司名","info":"工作时间","subscribe":"工作职位","detail":"职位描述"}]},{"title":"教育经历","details":[{"title":"学校名","info":"毕业时间","subscribe":"教育经历描述","detail":""}]}],"simpleRows":[{"title":"期望工作一","details":[{"job":"期望职位","workType":"工作时间","salary":"工资","position":"期望工作地点"}]},{"title":"期望工作二","details":[{"job":"期望职位","workType":"工作时间","salary":"工资","position":"期望工作地点"}]}]\n}\n```',
            "logoUrl": "wiki/assets/imgs/wiki_layout2.jpg"
        },
        {
            "name": "课程",
            "classifyName": "课程",
            "wikiCmdName": "@course/js/course",
            "desc": "添加课程",
            "content": '```@course/js/course\n```',
            "logoUrl":"wiki/assets/imgs/wiki_layout2.jpg"
        },
        {
            "name": "词条",
            "classifyName": "词条",
            "wikiCmdName": "@entries/js/entries",
            "desc": "将当前页面加入词条",
            "content": '```@entries/js/entries\n```',
            "logoUrl":"wiki/assets/imgs/wiki_layout2.jpg"
        },
    ];

    return mods;
});