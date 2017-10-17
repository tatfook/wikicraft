/**
 * Created by 18730 on 2017/10/13.
 */
define([
    'app',
    'text!/sensitive_word.txt',
    'js-aho-corasick',
], function (app, sensitiveText) {
    app.factory("sensitiveTest", [function () {
        var sensive = {},
            trie = new AhoCorasick.TrieNode();

        var repeatStr = function(str, count){
            var repeatStr = str;
            while(count > 1){
                str += repeatStr;
                count--;
            }
            return str;
        };

        sensive.sensitiveWords = sensitiveText.split("\r\n");
        var isEmptyObject = function (obj) {
            for (var t in obj){
                return false;
            }
            return true;
        };

        function init() {
            if (isEmptyObject(trie.suffix)){
                sensive.sensitiveWords.forEach(function (word) {// 导入敏感词
                    trie.add(word,{word:word});
                });
            }
        }
        sensive.checkSensitiveWord = function (word, callback) {
            var foundWords = [];
            if (!word){
                callback && callback(foundWords, "");
                return;
            }
            AhoCorasick.search(word, trie, function (found_word, data) {
                console.log(found_word);
                foundWords.push(found_word);
                word = word.replace(found_word, repeatStr("*", found_word.length));
            });
            callback && callback(foundWords, word);
        };
        init();
        return sensive;
    }]);
});