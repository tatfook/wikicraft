var Vue // global vue

define([
    "vue",
    "botui",
    'helper/util',
], function (vue, botui, util) {
    Vue = vue
    var agent = {}
    agent.context = {}

    agent.init = function (name, path) {
        agent.name = name
        agent.path = path
        agent.load(path)
    }

    agent.load = function (path) {
        var defaultPath = "tatfook/keepwork/agent/entry"
        // TODO
        agent.context.patterns = {
            "返回": "Welcome",
            "你会什么?": "WhatCanYouDo",
            "你是谁": "WhoAreYou",
            "开始新手教学吧": "Tutorial",
            "了解NPL编程": "NPLIntro",
            "提问": "Ask",
            "我明白了，我会多创造作品，让你变得更智能": "WhatCanYouDo",
            "如何教你知识": "HowToTeachYou",
            "好的，知道了": "WhatCanYouDo",
            "我明白了，通过不断创造公开知识，我的思想和作品就永久的保存在互联网中了": "FormatIsImportant",
            "嗯，我要尽快将之前保存在PPT，DOCX等第三方软件中的内容都转成markdown格式": "FileURL",
            "明白，我要将我的作品从硬盘文件变成KeepWork的网页，并给每个网页起一个永久不变的好记忆的网址": "GitStorage",
            "什么是区块链？": "WhatIsBlockChain",
            "明白了，我用KeepWork创建的网站和内容，可以受到世界公认的最安全数据库的永久保护": "WhatCanYouDo",
            "我知道了，有时间我会学Paracraft": "WhatCanYouDo",
            "tuling": "tuling",
        }
        agent.context.patternActions = [{
                text: "你会什么?",
                value: "你会什么?",
            },
            {
                text: "提问",
                value: "提问",
            }
        ]

        agent.context.desc = "Hi, 我是你的网络化身，让我们相互学习吧？😃"
    }

    agent.loadClip = function (path) {
        // TODO
    }

    agent.addWelcome = function () {
        agent.addBotData([{
            type: "message.bot",
            delay: 500,
            content: agent.context.desc
        }])
    }

    agent.addPatterns = function () {
        agent.addBotData([{
            type: "action.button",
            delay: 500,
            actions: agent.context.patternActions,
            callback: agent.getClip
        }])
    }

    agent.addClipData = function (clip) {
        var clipData = agent.clips[clip]
        if (!clipData) {
            clipData = loadClip(clip)
        }
        agent.addBotData(clipData)
    }

    agent.getClip = function (pattern) {
        var clip = agent.context.patterns[pattern]
        if (!clip) {
            alert("Invalid Pattern!")
        } else {
            agent.botData = [] // clear data
            agent.addClipData(clip)
            agent.addWelcome()
            agent.addPatterns()
            agent.parseBotData()
        }
    }

    agent.addBotData = function (data) {
        agent.botData = agent.botData.concat(data)
    }

    agent.botUI = function (domId) {
        agent.bot = new BotUI(domId)
        agent.botData = []
        agent.addWelcome()
        agent.addPatterns()
        agent.parseBotData()
    }

    agent.parseBotData = function (res) {
        var item = agent.botData.shift()

        if (item.type === "message.bot") {
            var content = item.content
            if (res) {
                content = content.replace(/{{\w+}}/, res.value)
            }
            agent.bot.message.bot({
                delay: item.delay,
                content: content
            }).then(
                function () {
                    agent.parseBotData()
                }
            )
        } else if (item.type === "action.button") {
            agent.bot.action.button({
                delay: item.delay,
                action: item.actions
            }).then(
                function (res) {
                    if (item.callback) {
                        item.callback(res.value)
                    } else {
                        agent.parseBotData(res)
                    }
                }
            )

            setTimeout(function () {
                var container = document.getElementsByClassName("botui-container")[0]
                container.scrollTop = container.scrollHeight;
            }, item.delay || 0);
        } else if (item.type === "action.text") {
            agent.bot.action.text({
                delay: item.delay,
                action: item.action
            }).then(
                function (res) {
                    // console.log(item)
                    if (item.callback) {
                        item.callback(res.value)
                    } else {
                        agent.parseBotData(res)
                    }
                }
            )

            setTimeout(function () {
                var container = document.getElementsByClassName("botui-container")[0]
                container.scrollTop = container.scrollHeight;
            }, item.delay || 0);
        }
    }

    agent.tulingQA = function (message) {
        var key = "ffd8fe19827f4db0b82ce3188d86f8f7"
        var api = "http://www.tuling123.com/openapi/api"

        if (message === "bye" || message === "再见" || message === "88") {
            agent.parseBotData()
        } else {
            $.ajax({
                url: api,
                type: "POST",
                dataType: "json",
                data: {
                    key: key,
                    info: message,
                    userid: 123456
                },
                success: function (result, statu, xhr) {
                    agent.bot.message.bot({
                        "delay": 500,
                        "content": result.text
                    }).then(
                        function () {
                            agent.getClip("tuling")
                        }
                    )
                },
                error: function (xhr, statu, error) {
                    // console.log(error)
                }
            })
        }
    }

    agent.clips = {
        "Welcome": [{
                "type": "message.bot",
                "delay": 500,
                "content": "Hi, 我是你的网络化身，让我们相互学习吧"
            },
            {
                "type": "action.button",
                "delay": 300,
                "actions": [{
                        text: "你会什么?",
                        value: "你会什么?",
                    },
                    {
                        text: "提问",
                        value: "提问",
                    }
                ],
                callback: agent.getClip
            },
        ],
        "WhatCanYouDo": [{
                "type": "message.bot",
                "delay": 500,
                "content": "我拥有以下知识包：个人简历，新手教学，NPL编程教学。"
            },
            {
                "type": "action.button",
                "delay": 300,
                "actions": [{
                        text: "你是谁?",
                        value: "你是谁",
                    },
                    {
                        text: "开始新手教学吧",
                        value: "开始新手教学吧",
                    },
                    {
                        text: "了解NPL编程",
                        value: "了解NPL编程",
                    },
                    {
                        text: "返回",
                        value: "返回",
                    }
                ],
                callback: agent.getClip
            },
        ],
        "WhoAreYou": [{
                "type": "message.bot",
                "delay": 500,
                "content": "我是你的网络化身。你创作的公开知识也会变成我的知识。"
            },
            {
                "type": "message.bot",
                "delay": 500,
                "content": "我生活在`数字世界`中，在Paracraft中我有3D的身体。我喜欢在数字世界中旅行，结交AI朋友，并用我的知识为别人提供帮助"
            },
            {
                "type": "action.button",
                "delay": 500,
                "actions": [{
                        text: "如何教你知识",
                        value: "如何教你知识",
                    },
                    {
                        text: "返回",
                        value: "返回",
                    }
                ],
                callback: agent.getClip
            },
        ],
        "HowToTeachYou": [{
                "type": "message.bot",
                "delay": 500,
                "content": "你在keepwork上的公开信息，比如个人简历，技能，标签，作品都会自动成为我的知识。"
            },
            {
                "type": "message.bot",
                "delay": 500,
                "content": "你还可以通过给你的网页打标签，或者标注文章中`核心体验`让我学习你的知识。当然如果你会编程，就能让我更加智能了。"
            },
            {
                "type": "action.button",
                "delay": 500,
                "actions": [{
                    text: "我明白了，我会多创造作品，让你变得更智能",
                    value: "我明白了，我会多创造作品，让你变得更智能",
                }],
                callback: agent.getClip
            },
        ],
        "Tutorial": [{
                "type": "message.bot",
                "delay": 500,
                "content": "我的知识都存储在一网乾坤KeepWork上。 keepwork是一个个人作品创作平台，它提供`创作工具`，用`GIT`永久保存你的公开数据。"
            },
            {
                "type": "message.bot",
                "delay": 500,
                "content": "“计算机时代，每个人都有自己的个人网站和虚拟化身”  点击查看 `教学视频`, `帮助手册`"
            },
            {
                "type": "action.button",
                "delay": 500,
                "actions": [{
                        text: "我明白了，通过不断创造公开知识，我的思想和作品就永久的保存在互联网中了",
                        value: "我明白了，通过不断创造公开知识，我的思想和作品就永久的保存在互联网中了",
                    },
                    {
                        text: "返回",
                        value: "返回",
                    }
                ],
                callback: agent.getClip
            },
        ],
        "FormatIsImportant": [{
                "type": "message.bot",
                "delay": 500,
                "content": "你说得很对，但是知识的格式很重要，在KeepWork中，我们使用markdown作为文字和超连接的格式."
            },
            {
                "type": "message.bot",
                "delay": 500,
                "content": "这种格式不需要任何辅助软件都可以打开，兼容自然语言，因此几百年也不需要升级，全世界最大的维基百科都使用这种格式。"
            },
            {
                "type": "action.button",
                "delay": 500,
                "actions": [{
                        text: "嗯，我要尽快将之前保存在PPT，DOCX等第三方软件中的内容都转成markdown格式",
                        value: "嗯，我要尽快将之前保存在PPT，DOCX等第三方软件中的内容都转成markdown格式",
                    },
                    {
                        text: "返回",
                        value: "返回",
                    }
                ],
                callback: agent.getClip
            },
        ],
        "FileURL": [{
                "type": "message.bot",
                "delay": 500,
                "content": "嗯， 但这样还不够，每个markdown文件都应该是一个网页， 有自己的永久网址，这样知识之间才能用超链接相互引用。"
            },
            {
                "type": "action.button",
                "delay": 500,
                "actions": [{
                        text: "明白，我要将我的作品从硬盘文件变成KeepWork的网页，并给每个网页起一个永久不变的好记忆的网址",
                        value: "明白，我要将我的作品从硬盘文件变成KeepWork的网页，并给每个网页起一个永久不变的好记忆的网址",
                    },
                    {
                        text: "返回",
                        value: "返回",
                    }
                ],
                callback: agent.getClip
            },
        ],
        "GitStorage": [{
                "type": "message.bot",
                "delay": 500,
                "content": "太棒了， 这样我也能学会你的知识，变得更聪明了！"
            },
            {
                "type": "message.bot",
                "delay": 500,
                "content": "对了， KeepWork会用GIT来保存你所有的数据，GIT数据库记录了所有文件的更改历史，通过`hash算法`保证所有数据的历史完整性，任何人无法篡改。 "
            },
            {
                "type": "message.bot",
                "delay": 500,
                "content": "`区块连BlockChain`使用的也是这种技术，它被认为是全世界最安全的数据库。"
            },
            {
                "type": "action.button",
                "delay": 500,
                "actions": [{
                        text: "什么是区块链？",
                        value: "什么是区块链？",
                    },
                    {
                        text: "返回",
                        value: "返回",
                    }
                ],
                callback: agent.getClip
            },
        ],
        "WhatIsBlockChain": [{
                "type": "message.bot",
                "delay": 500,
                "content": "区块链可以看成是一种公开的点对点分布式GIT数据库，像细胞的DNA一样，数据被复制了上万份在世界各地的计算机中。"
            },
            {
                "type": "message.bot",
                "delay": 500,
                "content": "区块链中数据的格式和GIT是一样的， 因此你可以将你个人GIT数据库的hash存储到上述区块链数据库中。如果所有人都这样做，就可以在区块链数据库中建立人类个体知识的公开目录，同时保存在上万台计算机中。"
            },
            {
                "type": "message.bot",
                "delay": 500,
                "content": "使用GIT+Markdown+Blockchain是保护个人知识产权的最快，最安全，最廉价的方法。"
            },
            {
                "type": "action.button",
                "delay": 500,
                "actions": [{
                        text: "明白了，我用KeepWork创建的网站和内容，可以受到世界公认的最安全数据库的永久保护",
                        value: "明白了，我用KeepWork创建的网站和内容，可以受到世界公认的最安全数据库的永久保护",
                    },
                    {
                        text: "返回",
                        value: "返回",
                    }
                ],
                callback: agent.getClip
            },
        ],
        "NPLIntro": [{
                "type": "message.bot",
                "delay": 500,
                "content": "我是用NPL语言编写的，KeepWork的网站，Paracraft和所有相关软件都是使用NPL语言编写的。"
            },
            {
                "type": "message.bot",
                "delay": 500,
                "content": "NPL语言是一个通用高性能脚本语言，学会它，你可以编写自己的网站，2D/3D软件， 或者更复杂的人工智能机器人点击`这里`了解更多"
            },
            {
                "type": "action.button",
                "delay": 500,
                "actions": [{
                        text: "我知道了，有时间我会学Paracraft",
                        value: "我知道了，有时间我会学Paracraft",
                    },
                    {
                        text: "返回",
                        value: "返回",
                    }
                ],
                callback: agent.getClip
            },
        ],
        "ParacraftIntro": [{
                "type": "message.bot",
                "delay": 500,
                "content": "安装`Paracraft创意空间`，通过paracraft + `NPL CAD` 你可以更快的学习NPL语言。 这里有`教学视频` "
            },
            {
                "type": "action.button",
                "delay": 500,
                "actions": [{
                        text: "我知道了，有时间我会学Paracraft",
                        value: "我知道了，有时间我会学Paracraft",
                    },
                    {
                        text: "返回",
                        value: "返回",
                    }
                ],
                callback: agent.getClip
            },
        ],
        "Ask": [{
                "type": "message.bot",
                "delay": 500,
                "content": "你可以`这样`问我。输入bye或88离开",
            },
            {
                "type": "action.text",
                "delay": 500,
                "action": {
                    placeholder: "请输入问题, 命令..."
                },
                "callback": agent.tulingQA,
            }
        ],
        "tuling": [{
            "type": "action.text",
            "delay": 500,
            "action": {
                placeholder: "请输入问题,命令或bye ..."
            },
            "callback": agent.tulingQA,
        }]
    }

    return agent
});