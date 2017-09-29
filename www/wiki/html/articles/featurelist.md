```@template/js/grid
{
	"isMainContent": false,
  "rows": [
    {
    	"class":"clearfix",
      "cols": [
        {
        "class":"hidden-xs hidden-sm col-md-3",
          "style": {
   	    		"padding-right":"0"
          },
          "content": "```@toc\n{\"title\":\"功能介绍\"\n}\n```"
        },
        {
        	"class":"col-md-9 bg-title content-padding",
          "style": {
            "border-left":"1px solid #CDCDCD"
        	},
          "isMainContent": true
        }
      ]
    }
  ]
}
```
# 制作个人网站 ![](http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1502422356594.jpeg)




<p style="font-size:30px;">丰富的个人网站在线编辑工具</p>

KeepWork中文名为一网乾坤，它是一个集成了众多创作工具的个人作品创作与分享平台。 学生、老师、企业可以用它制作网站，3D动画和应用软件; 并与成千上万的用户一起学习和创作。



- **在线编辑**：随时随地在各种设备上创建和编辑网页

- **用自然语言写网页**：你可以用MarkDown格式写网页和超链接，也可以混合HTML语言

- **可插入上百种创作模块**：网页中可插入图片，视频，绘图板，图表，3D模型，…

- **自定义URL**：所有网页可自定义URL，包括支持1级域名CNAME转发

- **开源+免费**：鼓励开源，我们免费向所有公开作品提供全部服务，仅对私有网站收费。你的作品是别人最好的老师。


[了解更多KeepWork在线编辑器的功能…](http://keepwork.com/intro/keepwork/KeepWorkEditor)




# 数据源 ![](http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1502422282825.jpeg)




<p style="font-size:30px;">数据存储使用GIT， 记录所有历史版本， 支持第三方数据源</p>


我们将网站的呈现与网站的数据存储完全分离。用户可以使用自己信任的数据源或使用我们提供的免费数据源存储个人网站的数据。我们致力提供持久可靠的数据存储服务。



- **数据源使用Git存储**：代码级版本控制，记录所有版本， 数据可溯源不会丢失

- **数据源可配置**：支持github, gitlab或任何企业或个人假设的私有Git云作为第三方数据源。

- **数据源文件CDN加速**：我们提供的免费内置数据源支持所有历史版本的CDN加速。在国内和国外有数万加速节点。

- **分布式存储**：用户可随时使用GIT命令在个人电脑上下载，编辑，备份数据源。


[了解更多Git数据源…](http://keepwork.com/intro/keepwork/GitDataSource)




# Paracraft创作软件 ![](http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1502354864492.jpeg)




<p style="font-size:30px;">免费的3D创作工具</p>


Paracraft创意空间是一款面向大众的免费的3D创作软件。你可以用它创建3D场景和人物，制作动画和电影，学习和编写计算机程序，发布你的电脑作品。



- 用方块创建3D模型与世界。

- 用骨骼方块定义关节。

- 将一组方块转化为BMAX模型。

- BMAX模型可以像普通方块一样使用，也可以作为电影方块中的演员。

- 用电影方块创造动画，电影方块中包括摄影机，演员， 字幕，声音，或者其他电影方块等等。

- 扮演演员录制动画，例如走,跑,跳。

- 在动画时间轴上可以精确调整演员的每个骨骼关节。

- 将多个电影方块链接起来可以连续播放。

- **免费开源**：Paracraft使用NPL语言编写，你可以用内置编辑器或visual studio编写插件或独立应用。

- **面向教育**：让更多的人可以自学计算机编程，发布属于自己的电脑作品。


[了解更多Paracraft创意空间…](http://keepwork.com/intro/keepwork/paracraft)




# 学习NPL编程语言 ![](http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1503309070762.jpeg)




<p style="font-size:30px;">Paracraft创作工具，KeepWork网站服务器与数据库，魔法哈奇客户端与服务器等都是完全用NPL语言开发的</p>


Neural Parallel Language(NPL)语言是一个开源的高性能的通用脚本语言。 语法兼容lua，易学易用。 NPL语言运行环境提供了核心函数类库，可用于开发复杂的客户端3D/2D图形应用，高并发的服务器端应用，并支持跨平台。



- NPL是一个开源的通用计算机编程语言。语法100%兼容Lua，有扩充。

- NPL运行环境内置了ParaEngine游戏引擎, 它提供了可用于3D/2D/web/服务器应用开发的核心类库。

- NPL提供了丰富的C/C++ API以及大量开源的NPL脚本类库。

- NPL提供了单一语言的解决方案，包括开发高级交互式GUI，复杂的基于opengl/directX 3D图形应用，高并发可扩展的Web服务器，高性能数据库，以及分布式软件框架。另外,它是跨平台，高性能，可扩展，可调试的。

- NPL语言起源于2004年对大脑仿真的项目。NPL语言中，文件节点与连接无处不在，开发者无需关心多线程与网络底层逻辑就可以开发复杂的高并发网络应用。

- NPL语言支持用户模式下抢占与非抢占代码，可以用单线程实现海量虚拟多线程。

- NPL是一个弱类型脚本语言，但jit动态编译技术使它拥有接近C++的性能；通过ffi或扩展接口，它可以和C/C++函数零成本互调。


[了解更多NPL语言…](http://keepwork.com/intro/keepwork/NPL)




# NPL CAD计算机辅助设计 ![](http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1502354911117.jpeg)




<p style="font-size:30px;">基于NPL编程语言的计算机辅助设计软件</p>


当今人类制造的大多数商品，例如杯子，手机，汽车等都是先用CAD计算机辅助设计软件设计，再将电子图纸交给机器成产出来的。 然而传统CAD软件往往操作复杂，难以熟练使用和全面掌握。NPL CAD通过编程的方式实现了专业计算机辅助设计软件的常用功能，并在不断的扩充函数类库。编程人员一般可以在30分钟内从入门到精通。



- 通过编程的方式进行CAD建模。

- 通过CAD，学习计算机编程语言，一举两得。

- 丰富的2D,3D建模指令。

- 随时3D预览，调试代码。

- CAD模型可3D打印，或导入到Paracraft世界中变成bmax模型。

- 正在构建基于NPL的专业CAD模型库和算法库。


[了解更多NPLCAD…](http://keepwork.com/intro/keepwork/NPLCAD)




# 开放式教育平台 ![](http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1502422235342.jpeg)




<p style="font-size:30px;">建立以自学为核心，以作品为评判标准的开放教育平台。</p>


一网乾坤(KeepWork)的初衷是建立一个面向学生，老师，知识工作者的大众创作与知识分享平台。人人可自学，人人可为师；通过创作去学习知识，通过网站分享自己的作品，让作品成为别人的老师。



- 有3种语言是教育与创作的基础：中文， 英文和计算机语言。我们的教育平台希望更多的年轻人更早的使用计算机语言去创作作品。

- 我们和北京开放大学成立了3所学院,正在筹办中。我们希望探索一种全新的基于自学和创作的网络教学与评估模式，让作者间形成长久的良师益友般的关系。

- PAC创作大赛全称是Paracraft Animation Contest, 每年举办两届，主要面向中小学和大学生，旨在让参赛者通过Paracraft软件学习3D动画创作和计算机编程，制作出有意义的个人电脑作品，并以开源的形式保存和分享到互联网中。同时参加PAC大赛也是创意学院，计算机语言课程的唯一毕业方式。


[了解更多教育平台与PAC大赛…](http://keepwork.com/official/pac2017)




# 应用中心 ![](http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1502422331237.jpeg)




<p style="font-size:30px;">让你的网站更加生动的创作工具与网络服务</p>


一网乾坤(KeepWork)应用中心包含了我们精心制作的创作工具与网络服务。 它们大都使用NPL语言开发完成，内容健康，没有广告。我们希望将一网乾坤打造成一片网络的净土，让用户在安全，健康的环境中学习，创造，交流。



- **创作工具类**:paracraft, 3D打印平台，mod插件网。

- **教育类**:道峰教育，教学发布模块，PAC创作大赛。

- **百科与知识库类**:中华大百科， 中医知识库，个人百科模块。

- **编程类**:NPL官网，NPL CAD， NPL插件网，中文编程语言。

- **社区类**:魔法哈奇3D社区，智慧地球，3D校园，Paracraft创作社区，特色小镇。

- **健康类**:个人医生，脉诊仪，中药溯源，HIS系统。

- **其它**:智能汽车终端，逻辑塔线下积木。


[了解更多应用中心…](http://keepwork.com/wiki/apps)




# 谁在使用 ![](http://git.keepwork.com/gitlab_rls_kaitlyn/keepworkdatasource/raw/master/kaitlyn_images/img_1502422207686.jpeg)




<p style="font-size:30px;">我们很荣幸为知名教育机构和企业提供了作品创作与分享平台</p>


首先, 我们自己的开发团队都在使用NPL语言和keepwork上的各种创作工具，同时越来越多的学生和教育机构也在逐渐加入： **团结每个人的力量，共同创造属于自己的智慧网络**。



- 个人: 中小学，大学生在keepwork上建立了自己的个人网站。

- 老师: 优秀的老师与企业CTO使用keepwork创建了可交互的教学课件。

- 企业: 幼儿园，私立学校，培训机构用keepwork创建了连结学生，家长，老师的社区网站。



合作单位：大富科技 北京开放大学 淘米TaoMee 联合大学 深圳动漫基地 安徽工程大学 哈尔滨工业大学
![](http://git.keepwork.com/gitlab_rls_tibet/keepworkdatasource/raw/master/tibet_images/img_1502181705999.png)


[如果你与我们有相同的愿景，加入我们...](https://github.com/LiXizhi/ParaCraft/wiki/JoinUs)




# 用户可创建收费内容 ![](http://git.keepwork.com/gitlab_rls_tibet/keepworkweekly/raw/master/tibet_images/img_1506654494992.png)




<p style="font-size:30px;">打造个人信息收费价值链</p>



- 方便的创建需要收费其它用户才能访问的网页或网站。

- 我们为用户提供丰富的网站模版支持。

- 支持您方便的将自己的网站内容设定为仅对vip开放全部。

- 非vip在访问网站的时候，只能预览到40%的内容。



</br>