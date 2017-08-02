/**
 * Created by wuxiangan on 2017/1/9.
 */

define(['app', 'helper/util',
    'text!wikimod/course/html/course.html',
    'wikimod/course/js/lodash.min',
    'text!wikimod/course/html/catalog.html'
], function (app, util, htmlContent, _, catalog) {

    function registerController(wikiBlock) {
        app.registerController("courseController", ['$scope', '$uibModal', '$timeout', '$http', function ($root, $uibModal, $timeout, $http) {

            $root.isEdit = wikiBlock.isEditorEnable();

            $root.data = {
                host: 'http://121.14.117.239/api/lecture/course',
                course: { //课程数据
                    //课程的标题
                    title: {},

                    //章节列表
                    chapter: [],

                    //章节分阶段后的列表， 用于显示
                    chapterWithStage: {},

                    //获取分组的名字
                    getStageName: function (stage_order) {
                        var item = $root.data.course.chapter,
                            name = "";

                        stage_order = parseInt(stage_order, 10);

                        for (var i = 0; i < item.length; i++) {
                            if (stage_order === item[i]["chapter_stage_order"]) {
                                name = item[i]["chapter_stage"];
                                break;
                            }
                        }
                        return name;
                    },

                    //分组
                    setChapterWithStage: function () {
                        var items = _.orderBy($root.data.course.chapter, ['chapter_stage_order', 'chapter_order'], ['asc', 'asc']);

                        $root.data.course.chapterWithStage = _.memoize(function (items, field) {
                            return _.groupBy(items, field);
                        })(items, 'chapter_stage_order');
                    },

                    //获取courseurl
                    getCourseUrl: function () {
                        return $root.pageinfo.url || window.location.pathname;
                    },

                    //判断是否有数据，用于一开始显示列表
                    hasData: function (e) {
                        return $root.data.course.title === '' || $root.data.course.title === null || angular.equals({}, $root.data.course.title) ? true : false;
                    }
                },

                orginData: {},

                switch: true,
            }

            //因为现在不能自定义过滤器，不能将lodash封装一个过滤器，只能用监听
            var watch = $root.$watch('data.course.chapter', function (newValue, oldValue, scope) {
                $root.data.course.setChapterWithStage();
            }, true);

            function init() {

                $http.post($root.data.host + '/courselist', {
                    course_url: $root.pageinfo.url || window.location.pathname,
                }, {
                    isShowLoading: true
                }).then(function (rs) {
                    var data = rs.data;

                    console.log("============");
                    console.log(data);

                    if (data && data.err === 0) {

                        data.course = data.course || {};
                        data.chapter = angular.isArray(data.chapter) ? data.chapter : [];

                        $root.data.course.title = data.course;

                        if (data.course.is_stage && data.course.is_stage !== null && data.course.is_stage !== '') {
                            $root.data.switch = parseInt(data.course.is_stage, 10) === 1 ? true : false;
                        }

                        var items = data.chapter;

                        for (var i = 0; i < items.length; i++) {
                            var item = items[i];

                            item['chapter_stage_order'] = parseInt(item['chapter_stage_order'], 10);
                            item['chapter_order'] = parseInt(item['chapter_order'], 10);
                            item['$edit'] = false;
                        }

                        $root.data.course.chapter = items;

                        $root.data.orginData = angular.copy($root.data.course);
                    }
                }, function (rs) {
                    console.log(rs);
                });

                util.$apply();
            }

            $root.viewCourseEditor = function () {
                if (!wikiBlock.isEditorEnable()) {
                    return;
                }

                $uibModal.open({
                    template: htmlContent,
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false,
                    // controller: 'courseController',
                    controller: ['$scope', function ($scope) {

                        //绑定root的数据
                        $scope.host = $root.data.host;
                        $scope.course = {
                            //课程的标题
                            title: $root.data.course.title,
                            //章节列表
                            chapter: $root.data.course.chapter,

                            //章节分阶段后的列表， 用于显示
                            chapterWithStage: {},

                            //分组
                            setChapterWithStage: function () {
                                var items = _.orderBy($scope.course.chapter, ['chapter_stage_order', 'chapter_order'], ['asc', 'asc']);

                                $scope.course.chapterWithStage = _.memoize(function (items, field) {
                                    return _.groupBy(items, field);
                                })(items, 'chapter_stage_order');
                            },

                            //获取分组的名字
                            getStageName: function (stage_order) {
                                var item = $scope.course.chapter,
                                    name = "";

                                stage_order = parseInt(stage_order, 10);

                                for (var i = 0; i < item.length; i++) {
                                    if (stage_order === item[i]["chapter_stage_order"]) {
                                        name = item[i]["chapter_stage"];
                                        break;
                                    }
                                }
                                return name;
                            },
                        };

                        $scope.switch = $root.data.switch, // 是否分阶段

                            $http.post($scope.host + '/user/urls', {
                                username: $scope.userinfo.username,
                            }, {
                                isShowLoading: true
                            }).then(function (rs) {
                                var data = rs.data ? rs.data.data : null;

                                if (data) {
                                    var item = [];
                                    for (var i = 0; i < data.length; i++) {
                                        if (data[i].url !== window.location.pathname && data[i].url !== $scope.pageinfo.url) {
                                            item.push(data[i].url);
                                        }
                                    }

                                    $scope.select.selectArray = item;
                                }

                            }, function (rs) {
                                console.log(rs);
                            });

                        // 新增或修改的时候下拉选择的数据
                        $scope.select = {
                            selectArray: [],
                        }

                        // 新增或修改的item绑定
                        $scope.item = {

                            newItem: {
                                title: "",
                                chapter_url: ""
                            },

                            //阶段的名称修改
                            stageName: {},

                            //设置值
                            setItem: function (isStage, title, chapter_url, stage) {
                                var that = $scope.item;

                                that.newItem.title = title;
                                that.newItem.chapter_url = chapter_url;
                            }
                        };

                        //具体的动作
                        $scope.action = {

                            //是否edit状态，禁止拖动
                            edit: false,

                            addItemNoStage: false, //不分组
                            addItemStage: {}, //分组显示添加

                            //旧的item缓存，普通item取消修改使用
                            oldItemCache: [],

                            //分组名称修改，用于打开标志
                            stageEdit: {},

                            switchType: function () {
                                var that = $scope.action;

                                if (!that.edit) { //修改状态下不给切换
                                    $scope.switch = !$scope.switch;

                                    $root.data.switch = $scope.switch;
                                }
                            },

                            isAddStage: false,

                            //数字转中文数字
                            _numToChn: function (n) {
                                if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n)) {
                                    return "";
                                }

                                var n = n + "",
                                    unit = "百十元",
                                    str = "",
                                    unit = unit.substr(unit.length - n.length);
                                for (var i = 0; i < n.length; i++) {
                                    str += '零一二三四五六七八九'.charAt(n.charAt(i)) + unit.charAt(i);
                                }

                                return str.replace(/零(百|十)/g, "零").replace(/(零)+/g, "零")
                                    .replace(/一(十)/g, "$1").replace(/(元)$/g, "").replace(/(零)$/g, "");
                            },

                            enter: function (evt, type, key) {
                                var that = $scope.action;

                                if (evt.keyCode === 13) {

                                    if (type === 'stage') {
                                        that.updateStageName(key);
                                    } else if (type === 'chapter') {
                                        that.updateItem(key);
                                    } else if (type === 'addStagChp') {
                                        that.addItem(true, key);
                                    } else if (type === 'addchp') {
                                        that.addItem(false, null);
                                    }
                                }
                            },

                            checkUrlExists: function (url, type) {
                                var found = 0,
                                    checkCount = type === 'add' ? 0 : 1;

                                for (var i = 0; i < $scope.course.chapter.length; i++) {
                                    var it = $scope.course.chapter[i];

                                    if (it.chapter_url !== '' && it.chapter_url === url) {
                                        found++;
                                    }
                                }

                                if (found > checkCount) {
                                    $uibModal.open({
                                        template: `
                                        <div class ="modal-header" style="display:flex;display:-webkit-flex;align-items:center;-webkit-align-items:center">
                                            <h3 class ="modal-title" style="min-width:100px;flex:1;">更新提示</h3>
                                        </div>
                                        <div class ="modal-body" style="display:flex;display:-webkit-flex;">
                                            链接地址已经选择。
                                        </div>
                                        <div class ="modal-footer">
                                            <button class ="btn btn-primary" type="button" ng-click="$dismiss(true)">确定</button>
                                        </div>`,
                                        backdrop: 'static',
                                        keyboard: false,
                                        // controller: 'courseController',
                                    });
                                }

                                return found > checkCount;
                            },

                            //开始的时候添加
                            initAdd: function () {
                                var that = $scope.action,
                                    item = {
                                        chapter_url: '',
                                        title: '',
                                        chapter_stage: "第一阶段",
                                        chapter_order: 1,
                                        chapter_stage_order: 1,
                                        $edit: false
                                    };

                                $scope.course.chapter.push(item);

                                if ($scope.switch) { //新增阶段
                                    //触发修改
                                    that.editItem('1ch0', item, '1ch0');

                                } else { //不是新增阶段
                                    //触发修改
                                    that.editItem('1', item, 'chp0');
                                }

                                that.isAddStage = true;
                            },

                            //设置是否修改状态
                            setEdit: function (edit) {
                                var that = that = $scope.action;
                                that.edit = edit;
                            },

                            //设置选中和全选
                            setFocus: function (eleID) {
                                $timeout(function () {
                                    var ele = document.getElementById(eleID);
                                    ele.focus();
                                    ele.select();
                                }, 100);
                            },

                            //添加阶段
                            addStage: function () {
                                var max = 1,
                                    that = $scope.action,
                                    list = $scope.course.chapter;

                                if (that.edit) {
                                    return;
                                }

                                //找到组最大值
                                for (var i = 0; i < list.length; i++) {
                                    max = list[i]["chapter_stage_order"] > max ? list[i]["chapter_stage_order"] : max;
                                }

                                //最大的组值加一
                                max += 1;

                                //转换数字
                                var nChn = that._numToChn(max),
                                    item = {
                                        chapter_url: '',
                                        title: '',
                                        chapter_stage: "第" + nChn + "阶段",
                                        chapter_order: 0,
                                        chapter_stage_order: max,
                                        $edit: true
                                    };

                                //新增item
                                $scope.course.chapter.push(item);

                                //触发修改
                                that.editItem(max + 'ch0', item, max + 'ch' + 0);

                                that.isAddStage = true;
                            },

                            //stage_order 传入是字符串，实际stage_order字段是int，下面使用的stage_order都有同样的问题。
                            editStage: function (stage_order, eleID) {
                                var that = $scope.action;

                                //修改状态下不点击
                                if (that.edit) {
                                    return;
                                }

                                $scope.item.stageName[stage_order] = $scope.course.getStageName(stage_order);

                                that.showStageEdit(stage_order, true, false);

                                that.setFocus(eleID);

                                that.setEdit(true);
                            },

                            //更新stagename
                            updateStageName: function (stage_order) {
                                var that = $scope.action,
                                    val = $scope.item.stageName[stage_order],
                                    stage_order = parseInt(stage_order, 10),
                                    item = $scope.course.chapter;

                                if (val.trim() === '') {
                                    $uibModal.open({
                                        template: `
                                        <div class ="modal-header" style="display:flex;display:-webkit-flex;align-items:center;-webkit-align-items:center">
                                            <h3 class ="modal-title" style="min-width:100px;flex:1;">更新提示</h3>
                                        </div>
                                        <div class ="modal-body" style="display:flex;display:-webkit-flex;">
                                            阶段标题不能为空。
                                        </div>
                                        <div class ="modal-footer">
                                            <button class ="btn btn-primary" type="button" ng-click="$dismiss(true)">确定</button>
                                        </div>`,
                                        backdrop: 'static',
                                        keyboard: false,
                                        // controller: 'courseController',
                                    });
                                    return;
                                }

                                for (var i = 0; i < item.length; i++) {
                                    if (stage_order === item[i]["chapter_stage_order"]) {
                                        item[i]["chapter_stage"] = val;
                                    }
                                }

                                that.showStageEdit(stage_order.toString(), false, true);

                                that.setEdit(false);
                            },

                            // 取消更新stageName
                            cancelUpdateStageName: function (stage_order) {
                                var that = $scope.action;

                                that.showStageEdit(stage_order, false, true);

                                that.edit = false;
                            },

                            //隐藏或显示阶段名称修改框
                            showStageEdit: function (stage_order, show, clear) {

                                $scope.action.stageEdit[stage_order] = show;

                                if (clear) {
                                    stage_order = parseInt(stage_order, 10);
                                    $scope.item.stageName[stage_order] = "";
                                }
                            },

                            //移动阶段，交换最近的阶段
                            moveStage: function (stage_order, move) {
                                var that = $scope.action;
                                //修改状态下不点击
                                if (that.edit) {
                                    return;
                                }

                                var stage_order = parseInt(stage_order, 10),
                                    item = $scope.course.chapter,
                                    nStage = stage_order + move,
                                    max = 1;

                                for (var i = 0; i < item.length; i++) {
                                    max = item[i]["chapter_stage_order"] > max ? item[i]["chapter_stage_order"] : max;
                                }

                                if (nStage !== 0 && nStage <= max) {
                                    for (var i = 0; i < item.length; i++) {
                                        if (item[i]["chapter_stage_order"] === stage_order) {
                                            item[i]["chapter_stage_order"] = nStage;
                                        } else if (item[i]["chapter_stage_order"] === nStage) {
                                            item[i]["chapter_stage_order"] = stage_order;
                                        }
                                    }
                                }
                            },

                            //删除阶段
                            delStage: function (stage_order) {
                                var that = $scope.action;
                                //修改状态下不点击
                                if (that.edit) {
                                    return;
                                }

                                $uibModal.open({
                                    template: `                            
                                    <div class ="modal-header" style="display:flex;display:-webkit-flex;align-items:center;-webkit-align-items:center">
                                        <h3 class ="modal-title" style="min-width:100px;flex:1;">删除提示</h3>
                                    </div>
                                    <div class ="modal-body" style="display:flex;display:-webkit-flex;">
                                        确定要删除该阶段吗？
                                    </div>
                                    <div class ="modal-footer">
                                        <button class ="btn btn-default" type="button" data-dismiss="modal" ng-click="$dismiss(false)">取消</button>
                                        <button class ="btn btn-primary" type="button" ng-click="$dismiss(true)">确定</button>
                                    </div>`,
                                    backdrop: 'static',
                                    keyboard: false,
                                    // controller: 'courseController',
                                }).result.then(function (result) {
                                    //取消
                                }, function (result) {
                                    if (result) {
                                        //确定  
                                        var item = $scope.course.chapter;
                                        i = 0;

                                        stage_order = parseInt(stage_order, 10);

                                        while (i < item.length) {

                                            if (item[i]["chapter_stage_order"] === stage_order) {
                                                item.splice(i, 1);
                                                //删除后不新增下标，因为数据会往前移动
                                                continue;
                                            }
                                            i++;
                                        }

                                        //例如一二三，删除二后，下个新增是阶段3
                                        var oitem = _.orderBy(item, ['chapter_stage_order'], ['asc']),
                                            gitem = _.groupBy(oitem, 'chapter_stage_order'),
                                            gidx = 0;

                                        for (var pro in gitem) {
                                            if (gitem.hasOwnProperty(pro)) {
                                                var pitem = gitem[pro];

                                                gidx += 1;
                                                for (var i = 0; i < pitem.length; i++) {
                                                    pitem[i]["chapter_stage_order"] = gidx;
                                                }
                                            }
                                        }
                                    }
                                });
                            },

                            //行内编辑的时候复制item
                            editItem: function (idx, chpItem, eleID) {
                                var that = $scope.action;
                                //修改状态下不点击
                                if (that.edit) {
                                    return;
                                }

                                chpItem.$edit = true;

                                that.oldItemCache[idx] = angular.copy(chpItem);

                                //设置当前的修改状态
                                that.setEdit(true);

                                //设置选中
                                that.setFocus(eleID);
                            },

                            // 新增item
                            addItem: function (isStage, stage_order) {
                                var that = $scope.action,
                                    item = angular.copy($scope.item.newItem);

                                if (item.title.trim() === '') {
                                    $uibModal.open({
                                        template: `
                                        <div class ="modal-header" style="display:flex;display:-webkit-flex;align-items:center;-webkit-align-items:center">
                                            <h3 class ="modal-title" style="min-width:100px;flex:1;">更新提示</h3>
                                        </div>
                                        <div class ="modal-body" style="display:flex;display:-webkit-flex;">
                                            章节标题不能为空。
                                        </div>
                                        <div class ="modal-footer">
                                            <button class ="btn btn-primary" type="button" ng-click="$dismiss(true)">确定</button>
                                        </div>`,
                                        backdrop: 'static',
                                        keyboard: false,
                                        // controller: 'courseController',
                                    });
                                    return;
                                }

                                if (item.chapter_url.trim() === '') {
                                    $uibModal.open({
                                        template: `
                                        <div class ="modal-header" style="display:flex;display:-webkit-flex;align-items:center;-webkit-align-items:center">
                                            <h3 class ="modal-title" style="min-width:100px;flex:1;">更新提示</h3>
                                        </div>
                                        <div class ="modal-body" style="display:flex;display:-webkit-flex;">
                                            链接不能为空。
                                        </div>
                                        <div class ="modal-footer">
                                            <button class ="btn btn-primary" type="button" ng-click="$dismiss(true)">确定</button>
                                        </div>`,
                                        backdrop: 'static',
                                        keyboard: false,
                                        // controller: 'courseController',
                                    });
                                    return;
                                }

                                var found = that.checkUrlExists(item.chapter_url, 'add');

                                if (found) {
                                    return;
                                }

                                var newItem = {
                                    chapter_url: item.chapter_url,
                                    title: item.title,
                                    chapter_order: $scope.course.chapter.length + 1,
                                    $edit: false
                                }

                                newItem['chapter_stage'] = isStage ? $scope.course.getStageName(stage_order) : '第一阶段';
                                newItem['chapter_stage_order'] = isStage ? parseInt(stage_order, 10) : 1;

                                $scope.course.chapter.push(newItem);

                                //点击增加后设置修改状态为flase
                                that.setEdit(false);

                                //隐藏框
                                that.addBox(isStage, false, true, stage_order);
                            },

                            // 删除当前的item
                            delItem: function (chpItem) {
                                var that = $scope.action;
                                //修改状态下不点击
                                if (that.edit) {
                                    return;
                                }

                                $uibModal.open({
                                    template: `                            
                                    <div class ="modal-header" style="display:flex;display:-webkit-flex;align-items:center;-webkit-align-items:center">
                                        <h3 class ="modal-title" style="min-width:100px;flex:1;">删除提示</h3>
                                    </div>
                                    <div class ="modal-body" style="display:flex;display:-webkit-flex;">
                                        确定要删除该章节吗？
                                    </div>
                                    <div class ="modal-footer">
                                        <button class ="btn btn-default" type="button" data-dismiss="modal" ng-click="$dismiss(false)">取消</button>
                                        <button class ="btn btn-primary" type="button" ng-click="$dismiss(true)">确定</button>
                                    </div>`,
                                    backdrop: 'static',
                                    keyboard: false,
                                    // controller: 'courseController',
                                }).result.then(function (result) {
                                    //取消
                                }, function (result) {
                                    if (result) {
                                        var arr = $scope.course.chapter,
                                            index = -1;
                                        for (var i = 0; i < arr.length; i++) {
                                            var item = arr[i];

                                            if (item === chpItem) {
                                                index = i;
                                                break;
                                            }
                                        }

                                        if (index !== -1) {
                                            $scope.course.chapter.splice(index, 1);
                                        }
                                    }
                                });
                            },

                            // 移动item
                            moveItem: function (isStage, chpItem, move) {
                                var that = $scope.action;

                                //修改状态下不点击
                                if (that.edit) {
                                    return;
                                }

                                var arr = $scope.course.chapter,
                                    index = -1;

                                //check 是否存在
                                for (var i = 0; i < arr.length; i++) {
                                    var item = arr[i];

                                    if (item === chpItem) {
                                        index = i;
                                        break;
                                    }
                                }

                                var newIndex = index + move;
                                if (index !== -1 && newIndex !== -1 && newIndex !== arr.length) {

                                    // 阶段不同不能移动
                                    if (isStage && arr[index]["chapter_stage"] !== arr[newIndex]["chapter_stage"]) {
                                        return;
                                    }

                                    //交换后分组数据的orderby变了，要从第一组开始
                                    var order = arr[index]["chapter_order"];
                                    arr[index]["chapter_order"] = arr[newIndex]["chapter_order"];
                                    arr[newIndex]["chapter_order"] = order;

                                    //交换数据
                                    arr[newIndex] = arr.splice(index, 1, arr[newIndex])[0];
                                }
                            },

                            // 行内编辑的时候更新item，因为使用了ng-model绑定的，自动会更新数据
                            updateItem: function (item) {
                                var that = $scope.action;

                                if (item.title.trim() === '') {
                                    $uibModal.open({
                                        template: `
                                        <div class ="modal-header" style="display:flex;display:-webkit-flex;align-items:center;-webkit-align-items:center">
                                            <h3 class ="modal-title" style="min-width:100px;flex:1;">更新提示</h3>
                                        </div>
                                        <div class ="modal-body" style="display:flex;display:-webkit-flex;">
                                            章节标题不能为空。
                                        </div>
                                        <div class ="modal-footer">
                                            <button class ="btn btn-primary" type="button" ng-click="$dismiss(true)">确定</button>
                                        </div>`,
                                        backdrop: 'static',
                                        keyboard: false,
                                        // controller: 'courseController',
                                    });
                                    return;
                                }

                                if (item.chapter_url.trim() === '') {
                                    $uibModal.open({
                                        template: `
                                        <div class ="modal-header" style="display:flex;display:-webkit-flex;align-items:center;-webkit-align-items:center">
                                            <h3 class ="modal-title" style="min-width:100px;flex:1;">更新提示</h3>
                                        </div>
                                        <div class ="modal-body" style="display:flex;display:-webkit-flex;">
                                            链接不能为空。
                                        </div>
                                        <div class ="modal-footer">
                                            <button class ="btn btn-primary" type="button" ng-click="$dismiss(true)">确定</button>
                                        </div>`,
                                        backdrop: 'static',
                                        keyboard: false,
                                        // controller: 'courseController',
                                    });
                                    return;
                                }

                                var found = that.checkUrlExists(item.chapter_url, 'edit');

                                if (found) {
                                    return;
                                }

                                var that = $scope.action;

                                item.$edit = false;

                                that.setEdit(false)
                            },

                            // 行内编辑取消的时候还原
                            cancelUpdateItem: function (idx, newItem) {
                                var that = $scope.action,
                                    oldItem = that.oldItemCache[idx];

                                newItem["title"] = oldItem ? oldItem["title"] : "";
                                newItem["chapter_url"] = oldItem ? oldItem["chapter_url"] : "";

                                newItem.$edit = false;

                                that.edit = false;

                                //这里要处理新增阶段时，修改记录的时候，按了取消
                                if (that.isAddStage) {
                                    $scope.course.chapter.splice($scope.course.chapter.length - 1, 1);

                                    that.isAddStage = false;
                                }
                            },

                            //打开新增模块
                            addBox: function (isStage, show, clear, stage_order, eleID) {
                                var that = $scope.action;

                                if (that.edit === true && show === true) {
                                    return;
                                }

                                if (isStage) {
                                    that.addItemStage[stage_order] = show;
                                } else {
                                    that.addItemNoStage = show;
                                }

                                that.edit = show;

                                // 判断是否清除ceche数据
                                clear && $scope.item.setItem(isStage, "", "", stage_order);

                                // 打开时设置选中
                                show && that.setFocus(eleID);
                            },

                            //这里是处理拖动的排序
                            sort: function (from, to, stageFrom, stageTo, type) {
                                var list = _.orderBy($scope.course.chapter, ['chapter_order'], ['asc']);

                                //阶段是从1开始计算的，0是标题
                                stageFrom += 1;
                                stageTo += 1;


                                if (type === 'stage') {
                                    //排序是从1开始的，第0个是标题
                                    from += 1;
                                    to += 1;

                                    var gitem = _.groupBy(list, 'chapter_stage_order');

                                    for (var pro in gitem) {
                                        if (gitem.hasOwnProperty(pro)) {
                                            var pitem = gitem[pro],
                                                gidx = parseInt(pro, 10);

                                            if (gidx === stageFrom || gidx === stageTo) {

                                                for (var i = 0; i < pitem.length; i++) {
                                                    var item = pitem[i];
                                                    item['chapter_stage_order'] = (gidx === stageFrom ? stageTo : stageFrom);
                                                }
                                            }
                                        }
                                    }

                                    gitem = _.groupBy(list, 'chapter_stage_order');

                                    var idx = 1,
                                        gidx = 0;
                                    for (var pro in gitem) {
                                        gidx += 1;
                                        if (gitem.hasOwnProperty(pro)) {
                                            var pitem = gitem[pro];
                                            for (var i = 0; i < pitem.length; i++) {
                                                //重排序
                                                pitem[i]['chapter_order'] = idx++;

                                                //组排序
                                                pitem[i]["chapter_stage_order"] = gidx;
                                            }
                                        }
                                    }

                                } else if (type === 'stageChapter') {
                                    var gitem = _.groupBy(list, 'chapter_stage_order'),
                                        fromItem = null,
                                        find = false;

                                    //先找到
                                    for (var pro in gitem) {
                                        if (gitem.hasOwnProperty(pro)) {
                                            var pitem = gitem[pro],
                                                gidx = parseInt(pro, 10);

                                            if (find) {
                                                break;
                                            }

                                            if (gidx === stageFrom) {

                                                for (var i = 0; i < pitem.length; i++) {
                                                    if (gidx === stageFrom && i === from) {
                                                        fromItem = pitem.splice(i, 1)[0];
                                                        find = true;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    //设置新组
                                    fromItem['chapter_stage_order'] = stageTo;
                                    fromItem['chapter_stage'] = '第' + $scope.action._numToChn(stageTo) + '阶段';

                                    //插入新组
                                    for (var pro in gitem) {
                                        if (gitem.hasOwnProperty(pro)) {
                                            var pitem = gitem[pro],
                                                gidx = parseInt(pro, 10);

                                            if (gidx === stageTo) {
                                                pitem.splice(to, 0, fromItem)
                                                break;
                                            }
                                        }
                                    }

                                    //重新排序
                                    var idx = 1,
                                        gidx = 0;
                                    for (var pro in gitem) {

                                        if (gitem.hasOwnProperty(pro)) {
                                            var pitem = gitem[pro];

                                            if (pitem.length) {
                                                gidx += 1;
                                            }

                                            for (var i = 0; i < pitem.length; i++) {
                                                //重排序
                                                pitem[i]['chapter_order'] = idx++;

                                                //组排序
                                                pitem[i]["chapter_stage_order"] = gidx;
                                            }
                                        }
                                    }

                                } else {

                                    if (from !== to) {
                                        var item = list.splice(from, 1)[0];
                                        list.splice(to, 0, item);

                                        //从1开始，0是标题
                                        for (var i = 0; i < list.length; i++) {
                                            list[i]["chapter_order"] = i + 1;
                                        }
                                    }
                                }

                                $timeout(function () {
                                    $scope.course.chapter = list;
                                }, 0);
                            }

                        };

                        $scope.drag = {

                            // 鼠标按下
                            down: false,

                            //原来的元素
                            $orgTag: null,

                            //复制的元素
                            $clnTag: null,

                            // 遮罩模板
                            chapterTemp: '<div class="chapter chapter-sort-mask col-xs-12 col-sm-12 col-md-12 col-lg-12"></div>',

                            $template: null,

                            //判断要移动的类型，是阶段，阶段下的章节，还是章节
                            type: '',

                            //阶段开始
                            stageFrom: -1,

                            //章节开始
                            chapterFrom: -1,

                            //移动的高度偏移
                            moveTopOff: 270,

                            //滚动时候要使用
                            autoScroll: {},

                            //页面总共高度，滚动时使用
                            chHeight: null,

                            start: function (evt) {
                                var that = $scope.drag,
                                    tag = evt.target,
                                    $tag = $(tag).closest('div[data-drag="true"]');

                                //有绑定事件的不触发或修改状态下不触发
                                if ($(tag).attr('ng-click') ||
                                    $scope.action.edit ||
                                    $tag.parents('[data-drag="false"]').length ||
                                    tag.tagName === 'input' ||
                                    evt.button !== 0 ||
                                    tag.tagName === 'button'
                                    //找不到就退出
                                    ||
                                    !$tag.length) {
                                    return;
                                }

                                //滚动时使用
                                that.chHeight = $('.chapter-list').get(0).scrollHeight;

                                var off = $tag.offset();
                                elLeft = 0;
                                elTop = 0;

                                //复制原来的元素
                                that.$orgTag = $tag;

                                //判断要移动的是阶段还是章节
                                var type = that.type = $tag.data('siblings');

                                that.chapterFrom = $tag.index();

                                //找出元素的当前位置
                                if (type === 'stage') { //阶段排序
                                    that.stageFrom = $tag.index();
                                    elLeft = 10;

                                    off = $(tag).closest('.chapter-stage-title').offset();

                                    //暂时取消阶段拖动
                                    return;

                                } else if (type === 'stageChapter') { //阶段下面的章节
                                    var closetStage = $tag.closest('div[data-drag="true"][data-siblings="stage"]');
                                    that.stageFrom = closetStage.index();
                                    that.chapterFrom = $tag.index() - 2; //因为有个title
                                }

                                elLeft = 10;

                                //滚动时要调整位置
                                var st = $('.chapter-list').scrollTop();

                                elTop = off.top - 240 + st;

                                that.moveTopOff -= st;

                                var outerHeight = $tag.outerHeight(),
                                    outerWidth = $tag.outerWidth();

                                if (type === 'stage') {
                                    outerHeight -= 20;
                                }

                                that.$clnTag = $tag.clone()
                                    .prop('ng-disabled', 'true')
                                    .css({
                                        'position': 'absolute',
                                        'z-index': 9999,
                                        'height': outerHeight,
                                        'width': outerWidth,
                                        // 'opacity': '.8',
                                        'top': elTop,
                                        'left': elLeft,
                                        'pointer-events': 'none',
                                        'cursor ': 'move',
                                        'background-color': 'white'
                                    }).addClass('drag-clone');

                                //原来隐藏掉
                                $tag.css('display', 'none');

                                //移动遮罩提前准备好
                                that.$template = $(that.chapterTemp).css({
                                    'height': outerHeight,
                                    'width': outerWidth
                                });

                                if (type === 'stage') {
                                    that.$template.css({
                                        'border': '1px solid #d0d0d0',
                                        'margin-bottom': '10px'
                                    });
                                } else {
                                    that.$clnTag.css({
                                        'border': '1px solid #d0d0d0'
                                    });
                                }

                                //点击后打算移动的时候添加背景
                                that.$template.clone().insertBefore($tag);

                                //鼠标按下
                                that.down = true;

                                $tag.parents('div[data-drop="true"]').append(that.$clnTag);
                            },

                            //只支持上下拖动
                            move: function (evt) {
                                var that = $scope.drag,
                                    posY = evt.clientY - that.moveTopOff;

                                if (that.$clnTag && that.down) {

                                    //自动滚动
                                    var $chl = $('.chapter-list'),
                                        height = $chl.get(0).clientHeight, //可视化的高度
                                        st = $chl.scrollTop(), //滚动了多少
                                        elHeight = that.$clnTag.get(0).clientHeight; //拖动元素的高度

                                    //当元素高度超过可视化高度的80，取80
                                    elHeight = elHeight > 80 ? 80 : elHeight;

                                    //小于991宽度的时候用55
                                    if (document.body.clientWidth <= 991) {
                                        elHeight = 55;
                                    }

                                    clearTimeout(that.autoScroll.pid);
                                    //向上滚动，滚动到0后就不滚动
                                    if (st + elHeight > posY && st !== 0) {
                                        var vy = (st - elHeight);

                                        vy = vy < elHeight ? 0 : vy;

                                        $chl.stop().animate({
                                            scrollTop: vy + 'px'
                                        }, {
                                            speed: 800,
                                            //滚动的时候间隔执行
                                            step: function (param) {
                                                that.autoScroll.pid = setTimeout(function () {
                                                    var cst = $('.chapter-list').scrollTop();
                                                    //重新计算移动偏移
                                                    that.moveTopOff = 270 - cst;
                                                    //设置新的偏移地点
                                                    $('.drag-clone').css({
                                                        top: evt.clientY - that.moveTopOff
                                                    });
                                                }, 24);
                                            }
                                        })

                                    } else if (posY > st + height - elHeight && height + st < that.chHeight) {
                                        //向下滚动
                                        var vy = height + st + elHeight < that.chHeight ? st + elHeight : that.chHeight - height + st;


                                        $chl.stop().animate({
                                            scrollTop: vy + 'px'
                                        }, {
                                            speed: 800,
                                            //滚动的时候间隔执行
                                            step: function (param) {
                                                that.autoScroll.pid = setTimeout(function () {
                                                    var cst = $('.chapter-list').scrollTop();
                                                    //重新计算移动偏移
                                                    that.moveTopOff = 270 - cst;
                                                    //设置新的偏移地点
                                                    $('.drag-clone').css({
                                                        top: evt.clientY - that.moveTopOff
                                                    });
                                                }, 24);
                                            }
                                        })
                                    }

                                    //滚动的时候不设置，滚动动画那里设置
                                    if (!$chl.is(":animated")) {
                                        that.$clnTag.css({
                                            top: posY
                                        });
                                    }

                                    var $clnTag = null;
                                    if (that.type === 'stage') {
                                        $clsTag = $(evt.target).closest('div.stage-box[data-drag="true"]');
                                    } else if (that.type === 'stageChapter') {
                                        $clsTag = $(evt.target).closest('div.stage-list[data-drag="true"]');
                                    } else {
                                        $clsTag = $(evt.target).closest('div[data-drag="true"]');
                                    }

                                    //处理移回空的阶段新增一条
                                    if (that.type === 'stageChapter') {
                                        var cltStage = $(evt.target).closest('.stage-box'),
                                            list = cltStage.find('.stage-list')

                                        if (list.length === 1 && list.css('display') === 'none' && cltStage.find('.chapter-sort-mask').length === 0) {
                                            that.$template.insertBefore(that.$orgTag);
                                        }
                                    }

                                    if ($clsTag.length) {
                                        var height = $clsTag.outerHeight(),
                                            tagRect = $clsTag.offset(),
                                            after = (evt.clientY - tagRect.top - 20) / height > 0.5;

                                        if (after) {
                                            if (!$clsTag.prevAll('.chapter-sort-mask').length) {
                                                $clsTag.nextAll('.chapter-sort-mask').remove();
                                                that.$template.insertBefore($clsTag);

                                                if (that.type === 'stageChapter' && $('.chapter-list').find('.chapter-sort-mask').length > 1) {
                                                    $clsTag.parent('div[data-siblings="stage"]')
                                                        .siblings('div[data-siblings="stage"]')
                                                        .find('.chapter-sort-mask').remove();
                                                }
                                            }
                                        } else {
                                            if (!$clsTag.nextAll('.chapter-sort-mask').length) {
                                                $clsTag.prevAll('.chapter-sort-mask').remove();
                                                that.$template.insertAfter($clsTag);

                                                if (that.type === 'stageChapter' && $('.chapter-list').find('.chapter-sort-mask').length > 1) {
                                                    $clsTag.parent('div[data-siblings="stage"]')
                                                        .siblings('div[data-siblings="stage"]')
                                                        .find('.chapter-sort-mask').remove();
                                                }
                                            }
                                        }
                                    }
                                }

                                evt.stopPropagation();
                            },

                            end: function (evt) {
                                var that = $scope.drag,
                                    tag = evt.target,
                                    $tag = $(tag).closest('div[data-drag="true"]');

                                //有绑定事件的不触发或修改状态下不触发
                                if ($tag.attr('ng-click') ||
                                    $scope.action.edit ||
                                    $tag.parents('[data-drag="false"]').length ||
                                    tag.tagName === 'input' ||
                                    tag.tagName === 'button') {

                                    return;
                                }

                                if (that.$orgTag) {
                                    that.$orgTag.css({
                                        'opacity': ''
                                    });

                                    //找出遮罩部分位置
                                    var mask = $(".chapter-list").find('div.chapter-sort-mask');

                                    if (mask.length) {
                                        var list = null,
                                            to = -1,
                                            stageTo = -1;

                                        if (that.type === 'stage') {
                                            var list = $('.chapter-stage>div').not("div.add-new-stage.add-new-btn");

                                            for (var i = 0; i < list.length; i++) {
                                                var item = $(list[i]);

                                                if (item.css("display") !== "none") {
                                                    stageTo += 1;
                                                    if (item.hasClass('chapter-sort-mask')) {
                                                        break;
                                                    }
                                                }
                                            }

                                        } else if (that.type === 'stageChapter') {
                                            var find = false,
                                                stage = $('.chapter-stage').find('div[data-siblings="stage"]');

                                            for (var i = 0; i < stage.length; i++) {

                                                //找到退出
                                                if (find) {
                                                    break;
                                                }

                                                stageTo = i;

                                                var $item = $(stage[i]),
                                                    list = $item.find('>div').not('.chapter-stage-title,.add-new-btn.stage-chp-add');

                                                //这里要重置下下标
                                                to = -1;
                                                for (var j = 0; j < list.length; j++) {
                                                    var $e = $(list[j]);

                                                    if ($e.css("display") !== "none") {
                                                        to++;
                                                        if ($e.hasClass('chapter-sort-mask')) {
                                                            find = true;
                                                            break;
                                                        }
                                                    }
                                                }
                                            }

                                        } else {
                                            var list = $('.chapter-no-stage>div').not("div.add-new-btn"),
                                                to = -1;

                                            for (var i = 0; i < list.length; i++) {
                                                var item = $(list[i]);

                                                if (item.css("display") !== "none") {
                                                    to += 1;
                                                    if (item.hasClass('chapter-sort-mask')) {
                                                        break;
                                                    }
                                                }
                                            }
                                        }

                                        if (to !== -1 || stageTo !== -1) {
                                            $scope.action.sort(that.chapterFrom, to, that.stageFrom, stageTo, that.type);
                                        }

                                        mask.remove();
                                    }

                                    //还原原来的元素
                                    that.$orgTag && that.$orgTag.css('display', '');

                                    //清除加入元素
                                    that.$clnTag && that.$clnTag.remove();
                                }

                                clearTimeout(that.autoScroll.pid);

                                //clear data
                                that.moveTopOff = 270;
                                that.down = false;
                                that.$orgTag = null;
                                that.$clnTag = null;
                                that.$template = null
                                that.type = '';
                                that.stageFrom = -1;
                                that.chapterFrom = -1;
                            }
                        };
                        $scope.save = function () {
                            //修改状态下不点击
                            if ($scope.action.edit) {
                                return;
                            }

                            var title = angular.copy($scope.course.title),
                                item = angular.copy($scope.course.chapter),
                                oitem = _.orderBy(item, ['chapter_stage_order', 'chapter_order'], ['asc', 'asc']),
                                gitem = _.groupBy(oitem, 'chapter_stage_order'),
                                gidx = 0,
                                nidx = 1,
                                create_user = $scope.userinfo.username,
                                create_nickname = $scope.userinfo.displayName,
                                is_stage = $scope.switch ? 1 : 0;

                            title['title'] = title['title'] || '';
                            if (title['title'].trim() === '') {
                                $uibModal.open({
                                    template: `                            
                                    <div class ="modal-header" style="display:flex;display:-webkit-flex;align-items:center;-webkit-align-items:center">
                                        <h3 class ="modal-title" style="min-width:100px;flex:1;">保存失败</h3>
                                    </div>
                                    <div class ="modal-body" style="display:flex;display:-webkit-flex;">
                                        标题不能为空。
                                    </div>
                                    <div class ="modal-footer">
                                        <button class ="btn btn-primary" type="button" ng-click="$dismiss()">确定</button>
                                    </div>`,
                                    backdrop: 'static',
                                    keyboard: false,
                                    // controller: 'courseController',
                                });

                                return;
                            }

                            title['title'] = title['title'];
                            title['course_url'] = $scope.pageinfo.url || window.location.pathname;
                            title['chapter_url'] = '';
                            title['chapter_stage'] = '';
                            title['chapter_order'] = 0;
                            title['chapter_stage_order'] = 0;
                            title['is_stage'] = is_stage;
                            title['create_user'] = create_user;
                            title['create_nickname'] = create_nickname;

                            for (var pro in gitem) {
                                if (gitem.hasOwnProperty(pro)) {
                                    var pitem = gitem[pro];
                                    gidx += 1;
                                    for (var i = 0; i < pitem.length; i++) {
                                        //组排序
                                        pitem[i]["chapter_stage_order"] = gidx;

                                        //重排序
                                        pitem[i]['chapter_order'] = nidx++;
                                        //是否分阶段
                                        pitem[i]['is_stage'] = is_stage;

                                        pitem[i]['course_url'] = title['course_url'];
                                        pitem[i]['create_user'] = create_user;
                                        pitem[i]['create_nickname'] = create_nickname;

                                        delete pitem.$edit;
                                    }
                                }
                            }

                            item.unshift(title);

                            $http.post($scope.host + '/add', {
                                data: item,
                            }, {
                                isShowLoading: true
                            }).then(function (rs) {

                                $root.data.orginData = angular.copy($root.data.course);

                                $scope.$close();

                                util.$apply();

                            }, function (rs) {
                                $uibModal.open({
                                    template: `                            
                                    <div class ="modal-header" style="display:flex;display:-webkit-flex;align-items:center;-webkit-align-items:center">
                                        <h3 class ="modal-title" style="min-width:100px;flex:1;">保存失败</h3>
                                    </div>
                                    <div class ="modal-body" style="display:flex;display:-webkit-flex;">
                                        保存失败，请重试。
                                    </div>
                                    <div class ="modal-footer">
                                        <button class ="btn btn-primary" type="button" ng-click="$dismiss()">确定</button>
                                    </div>`,
                                    backdrop: 'static',
                                    keyboard: false,
                                    // controller: 'courseController',
                                });
                            });
                        }

                        $scope.cancel = function () {
                            $root.data.course = angular.copy($root.data.orginData);
                            $scope.$close();
                        }

                        //因为现在不能自定义过滤器，不能将lodash封装一个过滤器，只能用监听
                        var watch = $scope.$watch('course.chapter', function (newValue, oldValue, scope) {
                            $scope.course.setChapterWithStage();
                        }, true);
                    }],
                }).result.then(function (result) {
                    wikiBlock.applyModParams(result);
                }, function (result) {});
            }

            init();

            // 判断点击课程标题链接时以防跳转
            // 如果为编辑模式时，则设置课程目录模块为禁止跳转状态
            if (wikiBlock.isEditorEnable()) {
                $root.isDisabled = true;
            } else {
                $root.isDisabled = false;
            }

            // 课程展示与收起
            $root.catalog = {
                item: {},

                state: false,

                toggleChange: function (type, idx) {
                    var that = $root.catalog,
                        item = that.item;

                    if (type === 'all') {
                        that.state = !that.state;
                        var i = 0,
                            obj = angular.equals({}, that.item) ? $root.data.course.chapterWithStage : item;

                        for (var prop in obj) {
                            if (obj.hasOwnProperty(prop)) {
                                item[i] = that.state;
                                i++;
                            }
                        }
                    } else {
                        item[idx] = !item[idx];

                        that.state = true;
                        for (var prop in item) {
                            if (item.hasOwnProperty(prop)) {
                                if (item[prop] === false) {
                                    that.state = false;
                                    break;
                                }
                            }
                        }
                    }
                },
            };

        }]);
    }

    return {
        render: function (wikiBlock) {
            registerController(wikiBlock);
            return `<div ng-controller="courseController" ng-click="viewCourseEditor();" >
                        <div ng-show = 'data.course.hasData() && isEdit' style="min-height: 100px; border: 1px solid #d0d0d0; cursor:pointer; font-size: 18px;">
                            点击编辑课程目录
                        </div>
                        <div ng-hide = 'data.course.hasData()' ng-class="{true: 'disabled', false: '' }[isDisabled]"> ` + catalog + ` </div>
                    </div>`
        }
    }
});