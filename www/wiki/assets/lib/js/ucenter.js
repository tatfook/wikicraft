/*
Author: zhoujun
Date: 2016/10/13
desc:the left menu tab scripts of user center
*/
function setTab(name, cursel, n) {
    for (i = 1; i <= n; i++) {
        var lmenu = document.getElementById(name + i);
        var lcontent = document.getElementById(name + "_" + i);
        lmenu.className = i == cursel ? "hover" : "";
        lcontent.style.display = i == cursel ? "block" : "none";
    }
}