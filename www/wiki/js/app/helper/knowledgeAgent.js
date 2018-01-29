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
            "keepwork介绍": "clip1",
            "keepwork教学视频": "clip2",
            "学习markdown": "clip3",
            "聊一聊": "tuling",
        }
        agent.context.patternActions = [{
                text: "keepwork介绍",
                value: "keepwork介绍",
            },
            {
                text: "keepwork教学视频",
                value: "keepwork教学视频",
            },
            {
                text: "学习markdown",
                value: "学习markdown",
            },
            {
                text: "聊一聊",
                value: "聊一聊",
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
                    console.log(item)
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

        if (message === "exit") {
            agent.parseBotData()
        } else {
            util.get(api, {
                key: key,
                info: message,
                userid: 123456
            }, function (data) {
                console.log(data)
                agent.bot.message.bot({
                    "delay": 500,
                    "content": data.text
                }).then(
                    function () {
                        agent.getClip("tuling")
                    }
                )
            })
        }
    }

    agent.clips = {
        "clip1": [{
                "type": "message.bot",
                "delay": 1000,
                "content": "hello, what's your name?"
            },
            {
                "type": "action.text",
                "delay": 1000,
                "action": {
                    "placehodler": "name",
                }
            },
            {
                "type": "message.bot",
                "delay": 1000,
                "content": "{{name}}你好，我来介绍一下KeepWork"
            }
        ],
        "clip2": [{
                "type": "message.bot",
                "delay": 1000,
                "content": "hello, 请选择一个你想了解的"
            },
            {
                "type": "action.button",
                "delay": 1000,
                "actions": [{
                        text: "什么是mod",
                        value: "mod",
                    },
                    {
                        text: "什么是markdown",
                        value: "markdown",
                    }
                ]
            },
            {
                "type": "message.bot",
                "delay": 1000,
                "content": "好的，我来介绍一下{{topic}}"
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
        ],
        "tuling": [{
            "type": "action.text",
            "delay": 1000,
            "action": {
                placehodler: "请输入..."
            },
            "callback": agent.tulingQA,
        }]
    }

    return agent
});