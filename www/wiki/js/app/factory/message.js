/**
 * Created by wuxiangan on 2016/12/21.
 */

define(['app'], function (app) {
    app.factory("Message", [function () {
        var message={
            timeout:2000,
            slideDownTimeout:1000,
            slideUpTimeout:1000,
        };
        //$('#messageTipId').slideToggle();
        message.show = function (type, content) {
            if (type != "success" && type != "info" && type != "warning" && type !="danger") {
                type = "info";
            }
            $('#messageTipId').removeClass('alert alert-success alert-info alert-warning alert-danger');
            $('#messageTipId').addClass('alert alert-' + type);
            $('#messageTipConentId').html(content);
            $('#messageTipId').slideDown(message.slideDownTimeout);
            setTimeout(function () {
                $('#messageTipId').slideUp(message.slideUpTimeout);
            }, message.timeout);
        };
        message.success = function (content) {
            this.show('success', content);
        }
        message.info = function (content) {
            this.show('info', content);
        }
        message.warning = function (content) {
            this.show('warning', content);
        }
        message.danger = function (content) {
            this.show('danger', content);
        }
        message.hide = function () {
            $('#messageTipId').slideUp(message.slideUpTimeout);
        }

        return message;
    }]);
});