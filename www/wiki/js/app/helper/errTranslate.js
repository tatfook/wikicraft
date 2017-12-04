define([
    'jquery'
], function($) {
    return function(err) {
        if ($.type(err) != 'string') return err;

        var rules = [
            {
                regex: /验证码.*上限/,
                res: '您今天发送验证码的次数过多，请明天再试。'
            }
        ];

        var appliedRule = rules.filter(function(rule) {
            return rule.regex.test(err)
        })[0];

        if (appliedRule) return appliedRule.res;

        return err;
    }
});