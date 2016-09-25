/**
Title: Layout functions for the sensitive theme
Author:LiXizhi
Date:2016.4.20
*/
Page = {
    ShowSideBar: function ShowSideBar(bShow) {
        if (bShow) {
            $("#content").addClass("col-md-8");
            $("#sidebar").show();
        }
        else {
            $("#sidebar").hide();
            $("#content").removeClass("col-md-8");
        }
    }
}
