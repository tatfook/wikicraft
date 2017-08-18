/**
 * Created by wuxiangan on 2017/1/9.
 */

define(['app',
    'text!wikimod/entries/js/swiper/swiper.min.css',
    'wikimod/entries/js/swiper/swiper.min',
    'text!wikimod/entries/html/entries.html',
    'text!wikimod/entries/html/entries_select.html'
], function (app, swiperCss, swiper, htmlContent, selectContent) {

    function registerController(wikiBlock) {
        app.registerController("entriesController", ['$scope', '$http', '$rootScope', '$timeout', '$compile', '$sce', '$uibModal', function ($scope, $http, $rootScope, $timeout, $compile, $sce, $uibModal) {

            $scope.imgsPath = config.wikiModPath + 'entries/assets/img/';
            $rootScope.path = config.wikiModPath;
            $scope.userinfo.username; // 用户主页
            //  $scope.user.portrait; //用户头像
            $scope.httpPath = "http://121.14.117.239/api/lecture/entires";
            $scope.urlPath = "http://121.14.117.239/";

            // 课程url信息
            $scope.current_url = decodeURI(window.location.pathname) || decodeURI($scope.pageinfo.url);

            // 从0开始截取地址栏参数前面的url
            $scope.winHref = window.location.href;

            $scope.isHide = true;

            $scope.isCreate = false;

            $scope.course_url = '#';

            // 如果头像为空时，则添加默认头像
            $scope.thisUserPic = $scope.user.portrait == undefined ? $scope.imgsPath + 'default.png' : $scope.user.portrait;

            // 词条初始化请求前10条数据
            $http.post($scope.httpPath + '/course_url', {
                chapter_url: $scope.pageinfo.url || decodeURI(window.location.pathname)
            }, {
                isShowLoading: false
            }).then(function (rs) {
                if (rs.data && rs.data.err === 0 && rs.data.course_url && rs.data.course_url !== '') {
                    $scope.course_url = rs.data.course_url.course_url;
                    $scope.entries_title = rs.data.course_url.title;
                    $scope.isHide = false;
                }
            }, function (rs) {
                console.log(rs);
            });

            // 请求导师是否有添加课程记录
            $http.post($scope.httpPath + '/check_user_create', {
                course_url: $scope.current_url
            }, {
                isShowLoading: false
            }).then(function (rs) {
                var data = rs.data;
                if (data && data.err === 0) {
                    $scope.isCreate = true;
                    $scope.current_url = data.data ? data.data.course_url : '#';
                }
            }, function (rs) {
                console.log(rs);
            })

            // var thisPath = window.location.search;
            // // 获取搜索的url地址栏的参数 courseurl 则显示 "返回目录"
            // if (thisPath.indexOf("?courseurl") != -1) {
            //     $scope.isHide = false;
            //     // 从搜索的地址栏，返回索引最后的参数值
            //     $scope.winHref = thisPath.substring(thisPath.lastIndexOf("=") + 1, thisPath.length);

            //     // $scope.getChaptUrl = thisPath.substring(thisPath.lastIndexOf("=") + 1, thisPath.length);
            //     // var $html = $('<iframe frameborder="0" width="100%" height="100%" ng-src=' + $sce.trustAsResourceUrl($scope.getChaptUrl) + '></iframe>').appendTo("#__mainContent__");
            //     // $compile($html);
            // }

            // $scope.remotedata = {
            //     url: $scope.pageinfo.url || decodeURI(window.location.pathname),
            //     title: "",
            //     create_user: $scope.userinfo.username,
            //     create_nickname: $scope.userinfo.displayName,
            // }

            $scope.chapters = {
                data: [],
                pageCount: 0,
                pageSize: 10,
                pageIndex: 1
            };

            // 词条初始化请求前10条数据
            // 是否有数据，是否显示隐藏
            $scope.dataShow = true;
            $scope.notData = false;

            $scope.isNextBtn = "";

            $scope.loadChp = function () {
                $http.post($scope.httpPath + '/chapters', {
                    url: $scope.pageinfo.url || decodeURI(window.location.pathname),
                    pageIndex: $scope.chapters.pageIndex,
                    pageSize: $scope.chapters.pageSize,
                    username: $rootScope.siteinfo.username
                }, {
                    isShowLoading: false
                }).then(function (rs) {
                    if (rs.data.itemCount === 0) {
                        $scope.dataShow = false;
                        $scope.notData = true;
                    } else {
                        $scope.dataShow = true;
                        $scope.notData = false;
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
            }

            //做成方法，初始化调用
            $scope.loadChp();

            // 左右滑动轮播点击下一页 获取分页数据
            $scope.nextPage = function () {
                $scope.chapters.pageIndex++;

                $http.post($scope.httpPath + '/chapters', {
                    url: $scope.pageinfo.url || decodeURI(window.location.pathname),
                    pageIndex: $scope.chapters.pageIndex,
                    pageSize: $scope.chapters.pageSize,
                    username: $rootScope.siteinfo.username
                }, {
                    isShowLoading: false
                }).then(function (rs) {
                    var pageSize = $scope.chapters.pageSize,
                        pageIndex = $scope.chapters.pageIndex,
                        countRecord = rs.data.itemCount, // 记录数
                        allPage = (countRecord % pageSize == 0 ? countRecord / pageSize : Math.ceil(countRecord / pageSize)); // 总页数

                    if (pageIndex === allPage || pageIndex >= allPage) {
                       return;
                    }

                    if (rs.data && rs.data.err === 0) {
                        var data = angular.copy(rs.data.data, []);
                        for (var i = 0; i < data.length; i++) {
                            data[i].hasTakeTeacher = false;
                            // var htm = '<div class="swiper-slide box"><div class="inner-box">';
                            // htm += '<a href=' + data[i].url + ' title=' + data[i].title + ' class="item-title">' + data[i].title + '</a>';
                            // htm += '<a href=/' + $scope.userinfo.username + ' title=' + data[i].create_nickname + ' class="item-nickname">【' + data[i].create_nickname + '】</a>';
                            // htm += '</div></div>';
                            // $("#sliding-loading .swiper-wrapper").append(htm);

                            $scope.chapters.data.push(data[i]);
                        }
                    }

                }, function (rs) {
                    console.log(rs);
                });
            };

            //第一次新增词条
            $http.post($scope.httpPath + '/add', {
                url: $scope.pageinfo.url || decodeURI(window.location.pathname),
                title: "",
                create_user: $scope.userinfo.username,
                create_nickname: $scope.userinfo.displayName,
            }).then(function (rs) {}, function (rs) {
                console.log(rs);
            });

            // 相关导师请求前24条数据
            // 初始化是否有数据显示
            $scope.teacherData = true;
            $scope.notTeacher = false;

            $scope.teacher = {
                data: [],
                pageCount: 0,
                pageSize: 24,
                pageIndex: 1,

                shshow: false,

                showTeachers: function (flag) { //展开导师
                    $scope.teacher.show = flag;

                    $http.post($scope.httpPath + '/userlist', {
                        pageIndex: 1,
                        pageSize: 24,
                        username: $rootScope.siteinfo.username,
                        url: $scope.pageinfo.url || decodeURI(window.location.pathname),
                    }, {
                        isShowLoading: false
                    }).then(function (rs) {
                        var data = rs.data;

                        if (data.itemCount === 0) {
                            $scope.teacherData = false;
                            $scope.notTeacher = true;
                        } else {
                            $scope.teacherData = true;
                            $scope.notTeacher = false;
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

            // 加载更多词条信息列表
            $scope.moreShowThearch = function () {
                //下一页
                $scope.user.pageIndex++;

                $http.post($scope.httpPath + '/userlist', {
                    pageIndex: $scope.teacher.pageIndex,
                    pageSize: $scope.teacher.pageSize,
                    username: $rootScope.siteinfo.username,
                    url: $scope.pageinfo.url || decodeURI(window.location.pathname),
                }, {
                    isShowLoading: false
                }).then(function (rs) {
                    var pageSize = $scope.teacher.pageSize,
                        pageIndex = $scope.teacher.pageIndex,
                        countRecord = rs.data.itemCount, // 记录数
                        allPage = (countRecord % pageSize == 0 ? countRecord / pageSize : Math.ceil(countRecord / pageSize)); // 总页数

                    if (rs.data && rs.data.err === 0) {
                        var data = angular.copy(rs.data.data, []);

                        for (var i = 0; i < data.length; i++) {
                            var item = data[i];

                            item.protrait = !item.protrait || item.protrait === '' ? $scope.imgsPath + 'default.png' : item.protrait;

                            $scope.teacher.data.push(item);

                            //     html = '<div class="teach-item col-xs-4 col-sm-4 col-md-2 col-lg-2">' +
                            //     '    <a href=" ' + $scope.followPath + '?req_name=' + $scope.userinfo.username + '&res_name=' + item.user_name + '" class="teach-box pull-left">' +
                            //     '        <img src=' + img + ' class="pic" alt=' + item.display_name + ' />' +
                            //     '        <span class="name">' + item.display_name + '</span>' +
                            //     '    </a>' +
                            //     '</div>';

                            // $("#pull-slide .swiper-slide").append(html);
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


            // 模块参数初始化相关表单值
            // var modParams = wikiBlock.modParams || {};
            function init() {
                $scope.isGetPage = false;

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
                    slidesPerGroup: 5,
                    observer: true,
                    observeParents: true,
                    freeMode: slideMode,
                    prevButton: '.prev-btn',
                    nextButton: '.next-btn',
                    slidesOffsetAfter : -itemWidth*4,
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

            }

            $scope.$watch('$viewContentLoaded', init);

            $scope.viewEntriesEditor = function () {
                if (!wikiBlock.isEditorEnable()) {
                    return;
                }

                $uibModal.open({
                    template: selectContent,
                    size: 'lg',
                    backdrop: 'static',
                    keyboard: false,
                    controller: ['$scope', '$uibModalInstance', function ($chil, $uibModalInstance) {

                        // 打开简单窗口
                        $chil.showSimpleModel = function (title, content) {
                            $uibModal.open({
                                template: `                            
                                <div class ="modal-header" style="display:flex;display:-webkit-flex;align-items:center;-webkit-align-items:center">
                                    <h3 class ="modal-title" style="min-width:100px;flex:1;">` + title + `</h3>
                                </div>
                                <div class ="modal-body" style="display:flex;display:-webkit-flex;">
                                    ` + content + `
                                </div>
                                <div class ="modal-footer">
                                    <button class ="btn btn-primary" type="button" ng-click="$dismiss()">确定</button>
                                </div>`,
                                backdrop: 'static',
                                keyboard: false,
                            });
                        }

                        //词条的多个层级
                        $chil.treeCount = 8;

                        $chil.range = [];
                        for (var i = 0; i < $chil.treeCount; i++) {
                            $chil.range.push(i);
                        }

                        //选择的分类
                        $chil.entries = [];

                        //树的列表
                        $chil.entries_list = Array($chil.treeCount).fill([]);

                        //下面修改的显示框
                        $chil.boxVisible = Array($chil.treeCount).fill(false);

                        //添加时绑定的字段
                        // $chil.addItemCache = Array($chil.treeCount).fill('');
                        $chil.newItem = [""];

                        //是否加入课程
                        $chil.hasCourse = false;

                        //遮罩
                        $chil.mask = Array($chil.treeCount).fill(false);

                        $uibModalInstance.rendered.then(function (result) {

                            //词条树滚动
                            var parentWidth = $('#boxSwiper').width(),
                                elWidth = Math.ceil((parentWidth) / 2);

                            $chil.swiperBox = new Swiper('#boxSwiper', {
                                width: elWidth,
                                observer: true,
                                observeParents: true,
                                slidesPerGroup: 1,
                                onlyExternal: true,
                            });

                            $http.post($scope.httpPath + '/get_root_type', {
                                create_user: $scope.userinfo.username,
                                url: $scope.pageinfo.url || window.location.pathname
                            }, {
                                isShowLoading: true
                            }).then(function (rs) {

                                var dd = rs.data

                                if (dd && dd.err === 0) {

                                    var data = dd.data,
                                        select = dd.select,
                                        splArr = select ? select.entries_id.split(',') : [],
                                        spl = angular.copy(splArr, []),
                                        activeIdx = [],
                                        idx = 0;

                                    //是否加入了课程
                                    $chil.hasCourse = parseInt(select.has_course, 10) === 1;

                                    if (select.is_course === 1) {
                                        if ($chil.mask.length < select.course_entries.length) {
                                            $chil.mask = Array(course_entries.length + 20).fill(false);
                                        }

                                        for (var i = 0; i < $chil.mask.length; i++) {
                                            $chil.mask[i] = true;
                                        }

                                        $('.add-new').hide();

                                    } else if ($chil.hasCourse) { //章节前面的不能修改
                                        var course_entries = select.course_entries.split(','),
                                            count = 0;

                                        if ($chil.mask.length < course_entries.length) {
                                            $chil.mask = Array(course_entries.length + 20).fill(false);
                                        }

                                        for (var i = 0; i < course_entries.length; i++) {
                                            for (var j = 0; j < splArr.length; j++) {
                                                if (course_entries[i] === splArr[j]) {
                                                    count++;
                                                }
                                            }
                                        }

                                        var strArr = [];
                                        for (var i = 0; i < count; i++) {
                                            $chil.mask[i] = true;

                                            strArr.push('.add-new:eq(' + i + ')');
                                        }
                                        $(strArr.join(',')).hide();
                                    }

                                    //这里要添加0，表示第一个列
                                    spl.unshift(0);

                                    if (!data.length || (select && select.entries_id === '')) {
                                        $timeout(function () {
                                            $('.add-new:not(:first)').hide();
                                        }, 0);

                                        $chil.showOther = false;

                                    } else {
                                        $chil.swiperBox.slideTo(splArr.length - 1);
                                    }

                                    if (data.length) {
                                        for (var i = 0; i < spl.length; i++) {
                                            var arr = [],
                                                val = parseInt(spl[i]);

                                            for (var j = 0; j < data.length; j++) {
                                                var item = data[j];

                                                if (item['parent_id'] === val) {
                                                    arr.push(item);
                                                }

                                                //记录选中的位置
                                                if (splArr[i] && parseInt(splArr[i], 10) === item['id']) {

                                                    activeIdx.push(arr.length - 1);
                                                    $chil.entries.push(item);
                                                }
                                            }

                                            $chil.entries_list[i] && ($chil.entries_list.push([]));
                                            $chil.entries_list[i] = arr;
                                        }

                                        $timeout(function () {
                                            for (var i = 0; i < activeIdx.length; i++) {
                                                $('.entri-list:eq(' + i + ') > .entri-item:eq(' + activeIdx[i] + ')').addClass('active');
                                            }
                                        }, 0);
                                    }
                                }

                            }, function (rs) {
                                console.log(rs);
                            });
                        });

                        $chil.action = {

                            editIdx: -1,

                            addEntri: function (idx, item) {
                                $chil.entries.splice(idx);
                                $chil.entries.push(item);
                            },

                            // enter: function (evt) {
                            //     var that = $scope.action;

                            //     if (evt.keyCode === 13) {
                            //         $chil.action.addItem(false);
                            //     }
                            // },

                            removeEntri: function (idx) {
                                // $chil.entries.splice(idx + 1, $chil.entries.length - idx);

                                $chil.swiperBox.slideTo(idx);

                                //移除其他的active
                                // var list = $('.box-item');
                                // for (var i = 0; i < list.length; i++) {
                                //     if (i > idx) {
                                //         $(list[i]).find('li').removeClass('active');
                                //     }
                                // }
                            },

                            selectItem: function (evt, item, idx) {
                                var $el = $(evt.target).closest('.entri-item');

                                $el.addClass('active').siblings('.entri-item').removeClass('active');

                                idx = parseInt(idx, 10);

                                var listIdx = $el.index(),
                                    parent_id = $chil.entries_list[idx][listIdx]['id'];

                                if (idx + 1 === $chil.range.length) {
                                    $chil.entries_list.push([]);
                                    $chil.range.push(idx + 1);
                                }

                                //加载数据
                                $chil.action.loadData(idx + 1, parent_id);

                                $chil.action.addEntri(idx, item);

                                if (idx !== 0) {
                                    $chil.swiperBox.slideTo(idx);
                                }

                                $('.add-new:eq(' + (idx + 1) + ')').show();

                            },

                            addItem: function () {
                                // if ($chil.action.editIdx !== -1 && $chil.addItemCache[$chil.action.editIdx].trim() === '') {
                                //     $chil.showSimpleModel('提示', '新增的词条不能为空。');
                                //     return;
                                // }

                                // var that = $chil.action,
                                //     idx = $chil.action.editIdx,
                                //     item = {
                                //         id: null,
                                //         parent_id: $chil.entries[idx - 1] ? $chil.entries[idx - 1]['id'] : 0,
                                //         type: $chil.addItemCache[idx],
                                //         is_mg: 0,
                                //         has_child: false,
                                //         create_user: $scope.userinfo.username
                                //     },
                                //     ids = [];


                                if ($chil.action.editIdx !== -1 && $chil.newItem[0].trim() === '') {
                                    $chil.showSimpleModel('提示', '新增的词条不能为空。');
                                    return;
                                }

                                var that = $chil.action,
                                    idx = $chil.action.editIdx,
                                    item = {
                                        id: null,
                                        parent_id: $chil.entries[idx - 1] ? $chil.entries[idx - 1]['id'] : 0,
                                        type: $chil.newItem[0],
                                        is_mg: 0,
                                        has_child: false,
                                        create_user: $scope.userinfo.username
                                    },
                                    ids = [];

                                if ($chil.action.editIdx !== -1) {
                                    $chil.entries.splice(idx);
                                }

                                for (var i = 0; i < $chil.entries.length; i++) {
                                    ids.push($chil.entries[i]['id']);
                                }

                                //保存新增的列的同时并保存选中的列
                                $http.post($scope.httpPath + '/add_type', {
                                    item: idx !== -1 ? item : null,
                                    select: ids,
                                    url: $scope.pageinfo.url || window.location.pathname
                                }, {
                                    isShowLoading: false
                                }).then(function (rs) {
                                    if (rs.data.err === 501) {
                                        $chil.showSimpleModel('提示', rs.data.msg);
                                    } else {
                                        $chil.$close();
                                    }

                                    //重新初始化
                                    $scope.chapters.pageIndex = 1;
                                    $scope.teacher.pageIndex = 1;
                                    $scope.loadChp();
                                    $scope.teacher.data = [];
                                    $scope.moreShowThearch();

                                }, function (rs) {
                                    console.log(rs);
                                });
                            },

                            delItem: function (idx, item, evt) {
                                if (item['is_mg'] === 1) {
                                    $chil.showSimpleModel('提示', '固定的词条分类不能删除。');
                                }

                                evt.preventDefault();
                                evt.stopPropagation();

                                $http.post($scope.httpPath + '/del_type', {
                                    id: item.id,
                                    create_user: $scope.userinfo.username,
                                    url: $scope.pageinfo.url || window.location.pathname
                                }, {
                                    isShowLoading: false
                                }).then(function (rs) {
                                    if (rs.data.err === 502) {
                                        $chil.showSimpleModel('提示', rs.data.msg);

                                    } else {
                                        var list = $chil.entries_list[idx];
                                        for (var i = 0; i < list.length; i++) {
                                            if (list[i]['id'] === item['id']) {
                                                list.splice(i, 1);
                                                break;
                                            }
                                        }

                                        if (idx !== 0 && $chil.entries_list[idx] && $chil.entries_list[idx].length === 0) {
                                            $chil.entries[idx - 1]['has_child'] = false;
                                        }

                                        if ($chil.entries[idx] && item['id'] === $chil.entries[idx]['id']) {
                                            $chil.entries.splice(idx);
                                        }


                                        $chil.entries_list[idx].length === 0 && $('.add-new:eq(' + (idx + 1) + ')').hide();

                                    }
                                }, function (rs) {
                                    console.log(rs);
                                });
                            },

                            showAddBox: function (idx, show, clear, evt) {

                                if ($chil.action.editIdx !== -1) {
                                    return;
                                }

                                $chil.entries.splice(idx);

                                if (idx === $chil.boxVisible.length + 1) {
                                    $chil.boxVisible.push(false);
                                }

                                $chil.boxVisible[idx] = show;

                                $chil.action.editIdx = idx;

                                $chil.entries_list[idx + 1] = [];

                                $('.entri-list:eq(' + idx + ') .entri-item').removeClass('active');

                                $('.entri-list:eq(' + (idx + 1) + ') .entri-item').hide();

                                $timeout(function () {
                                    $('#input' + idx).focus().select();
                                }, 0);

                                if (clear) {
                                    $chil.newItem = '';
                                }

                                // if (show) {
                                //     $(evt.target).parents('.box-item').find('.entri-list').css('height', '330px');
                                // } else {
                                //     $(evt.target).parents('.box-item').find('.entri-list').css('height', '365px');
                                // }

                                // if (clear) {
                                //     $chil.addItemCache[idx] = '';
                                // }
                            },

                            loadData: function (idx, parent_id) {
                                $http.post($scope.httpPath + '/get_type', {
                                    parent_id: parent_id,
                                    create_user: $scope.userinfo.username
                                }, {
                                    isShowLoading: false
                                }).then(function (rs) {

                                    if (rs.data && rs.data.err === 0) {
                                        $chil.entries_list[idx] = angular.isArray(rs.data.data) ? rs.data.data : [];
                                    }

                                    $('.entri-list:eq(' + idx + ') .entri-item').removeClass('active');

                                }, function (rs) {
                                    console.log(rs);
                                });
                            }
                        };
                    }],
                }).result.then(function (result) {
                    wikiBlock.applyModParams(result);
                }, function (result) {});

            }

            // 判断点击课程标题链接时以防跳转
            // 如果为编辑模式时，则设置课程目录模块为禁止跳转状态
            if (wikiBlock.isEditorEnable()) {
                $scope.isDisabled = true;
            } else {
                $scope.isDisabled = false;
            }

        }]);


    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return '<div ng-controller="entriesController" ng-click="viewEntriesEditor();" style="min-height: 100px; cursor:pointer;">' +
                '<style>\n' + swiperCss + '\n</style><div ng-class=\'{true: "disabled", false: "" }[isDisabled]\'>' + htmlContent + '</div> </div>'

            // return '<style>\n' + swiperCss + '\n</style>' + htmlContent
        }
    }
});