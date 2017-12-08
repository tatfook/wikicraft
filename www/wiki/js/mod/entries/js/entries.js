/**
 * Created by liangzhijian on 2017/1/9.
 */

define(['app',
    // 'text!wikimod/entries/js/swiper/swiper.min.css',
    // 'wikimod/entries/js/swiper/swiper.min',
    'text!wikimod/entries/html/entries.html',
    'helper/util',
    // 'text!wikimod/entries/css/entries.css',
    // 'text!wikimod/entries/html/entries_select.html'
], function (app, htmlContent, util) {

    function registerController(wikiBlock) {

        app.registerController("entriesController", ['$scope', '$http', '$timeout', '$uibModal', '$sce', function ($scope, $http, $timeout, $uibModal, $sce) {
            var moduleParams = angular.copy(wikiBlock.modParams) || {};

            function init() {
                require(['http://www.daofeng-school.com/js/keepwork_chapter.js'], function (initChapter) {
                    initChapter(moduleParams.type, function (data, successCallback) {

                        $scope.detailHmtl = $sce.trustAsHtml(data);
                        util.$apply();

                        successCallback && successCallback();
                    });
                });
            }

            $scope.$watch('$viewContentLoaded', init);

            // var host = 'http://121.14.117.239',
            //     chpApi = host + '/api/lecture/course/get_chapter_details',
            //     orgApi = host + '/api/organization/detailByCourseId/',
            //     usebuyApi = host + '/api/lecture/course/check_chapter',
            //     chpRecApi = host + '/api/lecture/course/get_other_chapter',
            //     teachRecApi = host + '/api/lecture/course/get_other_teacher',
            //     moduleParams = wikiBlock.modParams || {},
            //     type = moduleParams.type,
            //     user = moduleParams.user,
            //     course_title = moduleParams.course_title,
            //     chapter_title = moduleParams.chapter_title;

            // // 注释

            // //机构信息
            // $scope.org = {
            //     image: '',
            //     name: '',
            //     cnum: '', //课程人数
            //     tnum: '', //导师人数
            //     snum: '', //学生人数                
            //     show: false,
            // }
            // // 初始化机构
            // function initOrg() {
            //     $http({
            //         method: 'GET',
            //         url: orgApi + $scope.chap.cid
            //     }).then(function (data) {

            //         if (data.data.err == 0) {
            //             var item = data.data.data;

            //             // console.log(item);

            //             $scope.org.name = item.organization_name;
            //             $scope.org.image = host + item.icon_img;
            //             $scope.org.cnum = item.subject_num;
            //             $scope.org.tnum = item.teacher_num;
            //             $scope.org.snum = item.student_num;
            //             $scope.org.url = window.location.origin + '/lecture/main/institutional?insti_name=' + item.organization_name;

            //             $scope.org.show = true;

            //         }

            //     }).catch(function (data) {
            //         // console.log('oooooooooooo')
            //         console.log(data)
            //     });
            // }

            // //章节信息
            // $scope.chap = {
            //     id: '', //章节id
            //     cid: '', //课程id
            //     ctitle: '', //课程标题
            //     curl: '', //课程url                
            //     ptitle: '', //章节标题
            //     purl: '', //章节url
            //     tbtn: true, //立即报名按钮
            //     // preChap: '', //上一章
            //     // lastChap: '', //下一章
            //     username: '', //用户名
            //     userUrl: '',
            //     userImg: '', //用户头像
            //     cidx: 0,
            //     show: false,
            //     star: []
            // }
            // //初始化章节
            // function initChap() {
            //     $http({
            //         method: 'GET',
            //         url: chpApi,
            //         params: {
            //             username: user,
            //             course_title: course_title,
            //             chapter_title: chapter_title
            //         }
            //     }).then(function (data) {

            //         var data = data.data;

            //         if (data) {

            //             $scope.chap.ctitle = data.course_title;
            //             $scope.chap.ptitle = data.chapter_title;
            //             $scope.chap.cid = data.course_id;
            //             $scope.chap.cidx = parseInt(data.item_order, 10) + 1;
            //             $scope.chap.curl = data.course_url;
            //             $scope.chap.username = data.display_name || data.user_name;
            //             $scope.chap.id = data.id;
            //             $scope.chap.purl = data.chapter_url;
            //             $scope.chap.userUrl = window.location.origin + '/lecture/main/userhome?username=' + data.user_name;

            //             if (data.protrait.indexOf('http') === 0) {
            //                 $scope.chap.userImg = data.protrait;
            //             } else {
            //                 $scope.chap.userImg = (host + data.protrait) || 'http://dev.keepwork.com/wiki/assets/imgs/default_portrait.png';
            //             }

            //             //立即报名
            //             $scope.userbuy.href = window.location.origin + '/lecture/main/taketeacher?type=0&username=' + data.user_name + '&title=' + data.course_title;

            //             $scope.chap.star = Array(5).fill('');

            //             $scope.chap.show = true;

            //             //处理机构的信息
            //             initOrg();

            //             //检查当前用户是否购买
            //             checkUserBuy();
            //         }

            //     }).catch(function (data) {
            //         console.log(data)
            //     });
            // }


            // $scope.userbuy = {
            //     text: '立即购买',
            //     disabled: false,
            //     href: '',
            // }
            // //检查用户是否购买
            // function checkUserBuy() {
            //     var username = $scope.user.username;

            //     $http({
            //         method: 'GET',
            //         url: usebuyApi,
            //         params: {
            //             username: username,
            //             id: $scope.chap.id
            //         }
            //     }).then(function (data) {

            //         if (data.buy || data.is_org) {
            //             $scope.userbuy.disabled = true;
            //         }

            //         if (data.buy) {
            //             $scope.userbuy.text = '已购买'
            //         }

            //         if (username === $scope.chap.username) {
            //             $scope.userbuy.text = '编辑';
            //             $scope.userbuy.href = window.location.origin + '/wiki/wikieditor#' + $scope.chap.purl;
            //         }

            //     }).catch(function (data) {
            //         console.log(data);
            //     })

            // }

            // //推荐的章节
            // var chpRecPageIdx = 1, //当前的页码
            //     chpRecPageSize = 50; //每页显示多少个

            // $scope.chpRec = [];
            // $scope.chpRecVisabled = false;
            // //初始化推荐文章推荐
            // function initChpRec() {
            //     var teacherSlide = new Swiper("#chapSlide", {
            //         observer: true,
            //         observeParents: true,
            //         slidesPerView: 5,
            //         spaceBetween: 15,
            //         mousewheelControl: false,
            //         prevButton: '.swiper-button-prev',
            //         nextButton: '.swiper-button-next',
            //         breakpoints: {
            //             1279: {
            //                 slidesPerView: 4,
            //                 spaceBetween: 15
            //             },
            //             1024: {
            //                 slidesPerView: 3,
            //                 spaceBetween: 10
            //             },
            //             767: {
            //                 slidesPerView: 4,
            //                 spaceBetween: 10
            //             },
            //             640: {
            //                 slidesPerView: 3,
            //                 spaceBetween: 10
            //             },
            //             420: {
            //                 slidesPerView: 2,
            //                 spaceBetween: 8
            //             }
            //         },
            //         onSlideNextEnd: function (swiper) {
            //             chpRecPageIdx++;
            //         }
            //     });

            //     $http({
            //         method: 'GET',
            //         url: chpRecApi,
            //         params: {
            //             username: user,
            //             course_title: course_title,
            //             chapter_title: chapter_title,
            //             pageIndex: chpRecPageIdx,
            //             pageSize: chpRecPageSize
            //         }
            //     }).then(function (data) {

            //         if (data.data && data.data.data) {
            //             var items = data.data.data;

            //             // debugger;

            //             for (var i = 0; i < items.length; i++) {
            //                 var it = items[i];

            //                 it.pprice = it.price > 0 ? '¥' + it.price : '免费';

            //                 it.churl = window.location.origin + it.chapter_url;

            //                 $scope.chpRec.push(it);
            //             }

            //         }

            //         setTimeout(function () {
            //             teacherSlide.slideTo(0);
            //             $timeout(function () {
            //                 $scope.chpRecVisabled = true;
            //             }, 300)
            //         }, 0);

            //     }).catch(function (data) {
            //         console.log(data);
            //     });
            // }

            // //推荐的导师
            // var teachRecPageIdx = 1, //当前的页码
            //     teachRecPageSize = 8; //每页显示多少个

            // $scope.showTeachRec = false;
            // $scope.teachMore = false;

            // $scope.teachRec = [];
            // // 初始化导师推荐
            // function initTeachRec(up) {
            //     if (up) {
            //         teachRecPageIdx++;
            //     }

            //     $http({
            //         method: 'GET',
            //         url: teachRecApi,
            //         params: {
            //             username: user,
            //             title: course_title,
            //             pageIndex: teachRecPageIdx,
            //             pageSize: teachRecPageSize
            //         }
            //     }).then(function (data) {
            //         if (data.data && data.data.data) {
            //             var items = data.data.data;

            //             for (var i = 0; i < items.length; i++) {
            //                 //5个星星
            //                 items[i].star = Array(5).fill('');

            //                 if (items[i].protrait.indexOf('http') === 0) {
            //                     items[i].userImg = items[i].protrait;
            //                 } else {
            //                     items[i].userImg = (host + items[i].protrait) || 'http://dev.keepwork.com/wiki/assets/imgs/default_portrait.png';
            //                 }

            //                 items[i].url = window.location.origin + '/lecture/main/userhome?username=' + items[i].user_name;

            //                 $scope.teachRec.push(items[i]);
            //             }

            //             if (items.length === data.data.itemCount) {
            //                 $scope.teachMore = false;
            //             }

            //             if (teachRecPageIdx !== 1) { //第一次不滑动
            //                 setTimeout(function () {
            //                     $('.teach-rec .teach-list').css('height', $('.teach-rec .teach-list .teach-list-content').height());
            //                 }, 100)
            //             }
            //         }

            //     }).catch(function (data) {
            //         console.log(data);
            //     });
            // }

            // //展开推荐导师
            // $scope.showTRec = function () {
            //     $scope.showTeachRec = !$scope.showTeachRec;

            //     if ($scope.showTeachRec) {
            //         $('.teach-rec .teach-list').css('height', $('.teach-rec .teach-list .teach-list-content').height());
            //     } else {
            //         $('.teach-rec .teach-list').css('height', 0);
            //     }

            // }

            // //打开用户页面
            // $scope.openUrl = function (url) {
            //     window.location.href = url;
            // }

            // //更多
            // $scope.loadMore = function () {
            //     teachRecPageIdx++;
            //     initTeachRec();
            // }

            // function init() {
            //     if (user && course_title && chapter_title) {
            //         initChap();
            //         initChpRec();
            //         initTeachRec();

            //         // ____initChapterDetail($scope);

            //     } else {
            //         initChpRec();
            //         initTeachRec();
            //     }
            // }

            // $scope.$watch('$viewContentLoaded', init);

        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return htmlContent
        }
    }
});