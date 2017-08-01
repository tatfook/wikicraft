/**
 * Created by wuxiangan on 2017/1/9.
 */

define(['app', 'text!wikimod/entries/js/swiper/swiper.min.css', 'wikimod/entries/js/swiper/swiper.min', 'text!wikimod/entries/html/entries.html'], function (app, swiperCss, swiper, htmlContent) {

    function registerController(wikiBlock) {
        app.registerController("entriesController", ['$scope', '$http', '$rootScope', '$timeout', '$compile', '$sce', function ($scope, $http, $rootScope, $timeout, $compile, $sce) {

            $scope.imgsPath = config.wikiModPath + 'entries/assets/img/';
            $rootScope.path = config.wikiModPath;
            $scope.userinfo.username; // 用户主页
            $scope.user.portrait; //用户头像
            $scope.httpPath = "http://121.14.117.239/api/lecture/entires";
            $scope.followPath = "http://121.14.117.239/follow/take";

            // 从0开始截取地址栏参数前面的url
            $scope.winHref = window.location.href;

            $scope.isHide = true;

            var thisPath = window.location.search;
            // 获取搜索的url地址栏的参数 courseurl 则显示 "返回目录"
            if (thisPath.indexOf("?courseurl") != -1) {
                $scope.isHide = false;
                // 从搜索的地址栏，返回索引最后的参数值
                $scope.winHref = thisPath.substring(thisPath.lastIndexOf("=") + 1, thisPath.length);
                
                // $scope.getChaptUrl = thisPath.substring(thisPath.lastIndexOf("=") + 1, thisPath.length);
                // var $html = $('<iframe frameborder="0" width="100%" height="100%" ng-src=' + $sce.trustAsResourceUrl($scope.getChaptUrl) + '></iframe>').appendTo("#__mainContent__");
                // $compile($html);
            }

            $scope.chapters = {
                data: []
            };


            // 相关导师请求前24条数据
            $scope.teacher = {
                data: [],
                shshow: false,
                showTeachers: function (flag) { //展开导师
                    $scope.teacher.show = flag;

                    $http.post($scope.httpPath + '/userlist', {
                        pageIndex: 1,
                        pageSize: 24,
                        username: $rootScope.siteinfo.username
                    }, {
                        isShowLoading: false
                    }).then(function (rs) {
                        var data = rs.data;
                        if (data.itemCount = 0) {
                            console.log("没有数据!");
                            return;
                        }

                        if (data && data.err === 0) {

                            for (var i = 0; i < data.data.length; i++) {
                                var item = data.data[i];

                                item['protrait'] = !item.protrait || item.protrait === '' ? $scope.imgsPath + 'default.png' : item.protrait;
                            }

                            $scope.teacher.data = data.data;
                        }
                    }, function (rs) {
                        console.log(rs);
                    });

                    var teacherWrap = document.getElementById("teachWrap");
                    // pc 显示滚动条到达底部时请求数据
                    if (document.body.clientWidth >= 795) {
                        teacherWrap.onscroll = function () {
                            if (teacherWrap.clientHeight + Math.floor(teacherWrap.scrollTop) == teacherWrap.scrollHeight) {
                                $scope.moreShowThearch();
                                return;
                            }
                        }
                    }


                    var teacherBtn = document.getElementsByClassName('teacher-btn')[0];
                    // 手机端 显示
                    if (document.body.clientWidth < 795) {
                        document.getElementsByClassName('phone-hide')[0].style.display = "none";
                        document.getElementsByClassName('moreShow')[0].style.display = "block";
                        window.onscroll = function () {
                            var sumHeight = teacherWrap.offsetTop + Math.floor(document.body.scrollTop);
                            if (sumHeight >= teacherWrap.scrollHeight && sumHeight <= teacherBtn.offsetTop) {
                                $scope.moreShowThearch();
                                console.log("请求");
                            }
                        }
                    }

                },
                takeTeacher: function (item) { //拜师
                    item.hasTakeTeacher = true;
                }
            };

            $scope.remotedata = {
                url: $scope.pageinfo.url || $scope.winHref,
                title: "",
                create_user: $scope.userinfo.username,
                create_nickname: $scope.userinfo.displayName,
            }

            // 模块参数初始化相关表单值
            // var modParams = wikiBlock.modParams || {};
            function init() {
                $scope.isGetPage = false;

                var pageStart = 1,
                    pageCount, pageSize = 10;
                var slideHtml, slideWidth, wrapWidth, loadHeight, itemSlide, itemWidth, wrapOffset = 50;
                itemSlide = document.getElementsByClassName('item-slide');
                wrapWidth = document.getElementsByClassName('swiper-container')[0].clientWidth; // 父容器宽度

                var slidesGroup = 5; // 默认5个布局
                var slideMode = false; // 是否贴合
                // 当父容器宽度小于 795 ，则给3.5个布局
                if (wrapWidth < 795) {
                    slidesGroup = 3.5;
                    slideMode = true;
                }
                itemWidth = wrapWidth / slidesGroup; // 子块宽度

                // 左右滑动轮播
                var slideSwiper = new Swiper('#sliding-loading', {
                    width: itemWidth,
                    slidesPerGroup: slidesGroup,
                    observer: true,
                    observeParents: true,
                    freeModeMomentum: true,
                    freeMode: slideMode,
                    prevButton: '.prev-btn',
                    nextButton: '.next-btn',
                    // 左滑动获取分页数据
                    onSlideChangeEnd: function (swiper) {
                        for (var i = 0; i < itemSlide.length; i++) {
                            slideWidth = parseInt((itemSlide.length * (itemSlide[i].clientWidth) / 2));
                        }
                        move = swiper.translate - wrapOffset;
                        if (move <= -slideWidth) {
                            $scope.nextPage();
                        }
                    }
                })


                // 词条初始化请求前10条数据
                $http.post($scope.httpPath + '/chapters', {
                    url: $scope.remotedata.url || $scope.winHref,
                    pageIndex: pageStart,
                    pageSize: pageSize,
                    username: $rootScope.siteinfo.username
                }, {
                    isShowLoading: false
                }).then(function (rs) {

                    if (rs.data.itemCount = 0) {
                        console.log("没有数据!");
                        return;
                    }

                    if (rs.data && rs.data.err === 0) {

                        var data = angular.copy(rs.data.data, []);

                        for (var i = 0; i < data.length; i++) {
                            data[i].hasTakeTeacher = false;
                        }

                        $scope.chapters.data = data;
                    }
                }, function (rs) {
                    console.log(rs);
                });

                // 左右滑动轮播点击下一页 获取分页数据
                $scope.nextPage = function () {
                    pageStart++;
                    $http.post($scope.httpPath + '/chapters', {
                        url: $scope.remotedata.url || $scope.winHref,
                        pageIndex: pageStart,
                        pageSize: pageSize,
                        username: $rootScope.siteinfo.username
                    }, {
                        isShowLoading: false
                    }).then(function (rs) {
                        // 记录数
                        var countRecord = rs.data.itemCount;
                        // 总页数
                        var allPage = (countRecord % pageSize == 0 ? countRecord / pageSize : Math.ceil(countRecord / pageSize));

                        if (pageIndex == allPage || pageIndex >= allPage) {
                            $scope.isGetPage = true;
                            return;
                        }

                        if (rs.data.itemCount = 0) {
                            console.log("没有数据！");
                            return;
                        }

                        if (rs.data && rs.data.err === 0) {
                            var data = angular.copy(rs.data.data, []);
                            for (var i = 0; i < data.length; i++) {
                                data[i].hasTakeTeacher = false;
                                var htm = '<div class="swiper-slide box"><div class="inner-box">';
                                htm += '<a href=' + data[i].url + ' title=' + data[i].title + ' class="item-title">' + data[i].title + '</a>';
                                htm += '<a href=/' + $scope.userinfo.username + ' title=' + data[i].create_nickname + ' class="item-nickname">【' + data[i].create_nickname + '】</a>';
                                htm += '</div></div>';
                                $("#sliding-loading .swiper-wrapper").append(htm);
                            }
                        }

                    }, function (rs) {
                        console.log(rs);
                    });
                };

                $http.post($scope.httpPath + '/add',
                    $scope.remotedata).then(function (rs) {}, function (rs) {
                    console.log(rs);
                });

                var pageIndex = 1;
                // 上拉加载更多
                // var loadSwiper = new Swiper('#pull-slide', {
                //     observer:true,
                //     observeParents:true,
                //     direction : 'vertical',
                //     freeMode: true,
                //     onTransitionStart: function(swiper){
                //         var move = swiper.translate - wrapOffset;
                //         if(move <= swiper.translate){
                //            $scope.moreShowThearch();
                //         }
                //     }
                // });


                // 加载更多词条信息列表
                $scope.moreShowThearch = function () {
                    var pageSize = 24
                    pageIndex++;
                    $http.post($scope.httpPath + '/userlist', {
                        pageIndex: pageIndex,
                        pageSize: pageSize,
                        username: $rootScope.siteinfo.username
                    }, {
                        isShowLoading: false
                    }).then(function (rs) {
                        // 记录数
                        var countRecord = rs.data.itemCount;
                        // 总页数
                        var allPage = (countRecord % pageSize == 0 ? countRecord / pageSize : Math.ceil(countRecord / pageSize));

                        if (rs.data.itemCount = 0) {
                            console.log("没有数据！");
                            return;
                        }

                        if (rs.data && rs.data.err === 0) {
                            var data = angular.copy(rs.data.data, []);

                            for (var i = 0; i < data.length; i++) {
                                var item = data[i],
                                    img = !item.protrait || item.protrait === '' ? $scope.imgsPath + 'default.png' : item.protrait,
                                    html = '<div class="teach-item col-xs-4 col-sm-4 col-md-2 col-lg-2">' +
                                    '    <a href=" ' + $scope.followPath + '?req_name=' + $scope.userinfo.username + '&res_name=' + item.user_name + '" class="teach-box pull-left">' +
                                    '        <img src=' + img + ' class="pic" alt=' + item.display_name + ' />' +
                                    '        <span class="name">' + item.display_name + '</span>' +
                                    '    </a>' +
                                    '</div>';

                                $("#pull-slide .swiper-slide").append(html);
                            }
                        }

                        if (pageIndex == allPage || pageIndex >= allPage) {
                            document.getElementsByClassName('moreShow')[0].innerHTML = "已全部加载完成";
                            $scope.isGetPage = true;
                            return;
                        }
                    }, function (rs) {
                        console.log(rs);
                    });
                }

            }

            $scope.$watch('$viewContentLoaded', init);
        }]);

    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return '<style>\n' + swiperCss + '\n</style>' + htmlContent; // 返回模块标签内容 
        }
    }
});