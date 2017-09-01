/**
 * Created by wuxiangan on 2017/3/21.
 */

define([
    'app',
    'helper/util',
    'text!wikimod/wiki/html/blogMain.html'
], function (app, util, htmlContent) {
    function registerController(wikiblock) {
        app.registerController('blogMainController',['$scope', function ($scope) {
            $scope.imgsPath = config.wikiModPath + 'wiki/assets/imgs/';
            $scope.modParams = angular.copy(wikiblock.modParams || {});

            var username = $scope.urlObj.username;
            if (config.islocalWinEnv()) {
                username = "kasdff";
            }
            function init() {
                util.post(config.apiUrlPrefix + 'user/getDetailByName', {username:username}, function (data) {
                    if (!data) {
                        return ;
                    }
                    // 用户信息
                    $scope.userinfo = data.userinfo;
                });
            }
            $scope.$watch('$viewContentLoaded', init);

            // 主题配置
            var theme="template-theme-"+$scope.modParams.theme;
            $scope.themeClass=new Object();
            $scope.themeClass[theme]=true;
        }]);
    }
    return {
        render: function(wikiblock){
            registerController(wikiblock);
            return htmlContent;
        }
    };
})

/*
```@wiki/js/blogMain
```
*/
/*
```@wiki/js/blogMain
 {
 "moduleKind":"blogMain1",
 "moreText":"查看更多",
 "blogs":[
 {
 "contents":[
 {
 "content":"我是只化身孤岛的蓝鲸,有着最巨大的身影鱼虾在身侧穿行也有飞鸟在背上停,我路过太多太美的奇景如同伊甸般的仙境,而大海太平太静多少故事无人我爱地中海的天晴,爱西伯利亚的雪景,爱万丈高空的鹰, 爱肚皮下的藻荇我在尽心尽力地多情,直到那一天,你的衣衫破旧而歌声却温柔陪我漫无目的四处漂流，我的背脊如荒丘而你却微笑摆首把它当成整个宇宙, 你与太阳挥手也同海鸥问候陪我爱天爱地四处风流只是遗憾你终究无法躺在我胸口欣赏夜辽阔的不朽，把星子放入眸..."
 },
 {
 "content":"我是只化身孤岛的蓝鲸,有着最巨大的身影鱼虾在身侧穿行也有飞鸟在背上停,我路过太多太美的奇景如同伊甸般的仙境,而大海太平太静多少故事无人我爱地中海的天晴,爱西伯利亚的雪景,爱万丈高空的鹰, 爱肚皮下的藻荇我在尽心尽力地多情,直到那一天,你的衣衫破旧而歌声却温柔陪我漫无目的四处漂流..."
 }
 ],
 "link":"#"
 },
 {
 "contents":[
 {
 "content":"我是只化身孤岛的蓝鲸,有着最巨大的身影鱼虾在身侧穿行也有飞鸟在背上停,我路过太多太美的奇景如同伊甸般的仙境,而大海太平太静多少故事无人我爱地中海的天晴,爱西伯利亚的雪景,爱万丈高空的鹰, 爱肚皮下的藻荇我在尽心尽力地多情,直到那一天,你的衣衫破旧而歌声却温柔陪我漫无目的四处漂流，我的背脊如荒丘而你却微笑摆首把它当成整个宇宙, 你与太阳挥手也同海鸥问候陪我爱天爱地四处风流只是遗憾你终究无法躺在我胸口欣赏夜辽阔的不朽，把星子放入眸..."
 }
 ],
 "link":"#"
 },
 {
 "contents":[
 {
 "content":"我是只化身孤岛的蓝鲸,有着最巨大的身影鱼虾在身侧穿行也有飞鸟在背上停,我路过太多太美的奇景如同伊甸般的仙境,而大海太平太静多少故事无人我爱地中海的天晴,爱西伯利亚的雪景,爱万丈高空的鹰, 爱肚皮下的藻荇我在尽心尽力地多情,直到那一天,你的衣衫破旧而歌声却温柔陪我漫无目的四处漂流，我的背脊如荒丘而你却微笑摆首把它当成整个宇宙, 你与太阳挥手也同海鸥问候陪我爱天爱地四处风流只是遗憾你终究无法躺在我胸口欣赏夜辽阔的不朽，把星子放入眸..."
 }
 ],
 "link":"#"
 }
 ],
 "location":"地点",
 "phone":"手机号",
 "email":"邮箱",
 "usermessage":"地点等信息啊简介",
 "education":"教育信息学校信息简介",
 "reward":"获奖记录"
 }
```
 */