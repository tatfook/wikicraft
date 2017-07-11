define([
    'app',
    'text!mod/modelshare/html/index.html',
], function (app, htmlContent) {
    app.controller('indexController', ['$scope', function ($scope) {
        $scope.modName = "example";
        $scope.divVar = 4;
        $scope.set = function (params) {
            $scope.divVar = params;
        };
    }]);
    
    return htmlContent;
    })








/*function newFunction() {
    x = document.getElementById("form");
    n = document.getElementById("newWorks");
    h = document.getElementById("hotWorks");
    a = document.getElementById("act")
    // 找到元素
    x.style.display = "none";
    n.style.display = "block";
    h.style.display = "none";
    a.style.display = "none";
    // 改变内容
}
function actFunction() {
    x = document.getElementById("form");
    n = document.getElementById("newWorks");
    h = document.getElementById("hotWorks");
    a = document.getElementById("act")
    // 找到元素
    x.style.display = "none";
    a.style.display = "block";
    n.style.display = "none";
    h.style.display = "none";
    // 改变内容
}
function hotFunction() {
    x = document.getElementById("form");
    n = document.getElementById("newWorks");
    h = document.getElementById("hotWorks");
    a = document.getElementById("act")
    // 找到元素
    x.style.display = "none";
    h.style.display = "block";
    n.style.display = "none";
    a.style.display = "none";
    // 改变内容
}*/
