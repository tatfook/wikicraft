var Vue // global vue

define([
    'vue',
    'botui',
], function (vue) {
    Vue = vue
    var agent = {}
    agent.context = {}
    agent.clips = {
        "clip1": [{
                "type": "message.bot",
                "delay": 1000,
                "content": "hello"
            },
            {
                "type": "message.bot",
                "delay": 1000,
                "content": "我来介绍一下KeepWork"
            }
        ],
        "clip2": [{
                "type": "message.bot",
                "delay": 1000,
                "content": "hello"
            },
            {
                "type": "message.bot",
                "delay": 1000,
                "content": "我来推荐一下keepwork教学视频"
            }
        ],
        "clip3": [{
                "type": "message.bot",
                "delay": 1000,
                "content": "hello"
            },
            {
                "type": "message.bot",
                "delay": 1000,
                "content": "请自己学习markdown"
            }
        ]
    }

    agent.init = function (name, path) {
        agent.name = name
        agent.path = path
        agent.load(path)
    }

    agent.load = function (path) {
        // TODO
        agent.context.patterns = {
            "clip1": "keepwork介绍",
            "clip2": "keepwork教学视频",
            "clip3": "学习markdown",
        }
        agent.context.patternActions = [{
                text: "keepwork介绍",
                value: "clip1",
            },
            {
                text: "keepwork教学视频",
                value: "clip2",
            },
            {
                text: "学习markdown",
                value: "clip3",
            }
        ]
        agent.context.desc = "Hi, 我是小K，有什么可以帮到您的吗？"
    }

    agent.loadClip = function (path) {
        // TODO
    }

    agent.addWelcome = function () {
        agent.addBotData([{
            type: "message.bot",
            delay: 0,
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
        console.log(agent.clips)
        console.log(clip)
        if (!clipData) {
            clipData = loadClip(clip)
        }
        agent.addBotData(clipData)
    }

    agent.getClip = function (pattern) {
        console.log(pattern)
        var clip = agent.context.patterns[pattern]
        if (!clip) {
            alert("Invalid Pattern!")
        } else {
            agent.botData = [] // clear data
            agent.addClipData(pattern)
            agent.addPatterns()
            agent.parseBotData()
        }
    }

    agent.addBotData = function (data) {
        agent.botData = agent.botData.concat(data)
    }

    agent.botUI = function (domId) {
        agent.domId = domId
        agent.bot = new BotUI(domId)
        agent.botData = []
        agent.addWelcome()
        agent.addPatterns()
        agent.parseBotData()
    }

    agent.parseBotData = function (res) {
        var item = agent.botData.shift()
        var botAera = document.getElementById(agent.domId)

        if (item.type === "message.bot") {
            agent.bot.message.bot({
                delay: item.delay,
                content: item.content
            }).then(
                function () {
                    agent.parseBotData()
                }
            )
        } else if (item.type === "action.button") {
            console.log(item.actions)
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
        }
    }

    return agent
});