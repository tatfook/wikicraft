
define([
		'app',
		'helper/util',
		'text!wikimod/admin/html/tabledb.html',
		"ace",
], function (app, util, htmlContent) {
	app.registerController('tabledbController', function ($scope, $http, $location) {
		$scope.tables       = [];
		$scope.tableRecord  = [];
		$scope.indexes      = [];
		$scope.editIndexes  = [];
		$scope.pageSize     = 10;
		$scope.page         = 1;
		$scope.totalItems   = 0;
		$scope.operation    = 'insert';
		$scope.editRecordId = '';
		$scope.errMsg       = "";
		$scope.path         = "database/www/";
		$scope.tableName    = "";
		$scope.$watch('$viewContentLoaded', init);

		var inputEditor  = undefined;
		var outputEditor = undefined;

		function init() {
			$scope.path      = $location.search().path || $scope.path;
			$scope.tableName = $location.search().tableName || $scope.tableName;
			//$location.search("path", $scope.path);
			$location.search("tableName", $scope.tableName);

			$scope.getTables();
			$scope.getTableRecords();
			initEditor();

		}

		function initEditor() {
			if ($("#inputEditor")[0]) {
				inputEditor = ace.edit("inputEditor");
				inputEditor.setTheme("ace/theme/github");
				inputEditor.session.setMode("ace/mode/json");
				//inputEditor.setAutoScrollEditorIntoView(true);
				//inputEditor.setOption("maxLines", 200);
				//inputEditor.setOption("minLines", 20);
			}
			if ($("#outputEditor")[0]) {
				outputEditor = ace.edit("outputEditor");
				outputEditor.setTheme("ace/theme/github");
				outputEditor.session.setMode("ace/mode/json");
				//outputEditor.setAutoScrollEditorIntoView(true);
				//outputEditor.setOption("maxLines", 200);
				//outputEditor.setOption("minLines", 20);
			}
		}

		// 获取所有表
		$scope.getTables = function() {
			util.post(config.apiUrlPrefix + "tabledb/getTables", {}, function(data){
				$scope.tables = data || [];
			});
		}

		// 获取表记录
		$scope.getTableRecords = function () {
			var query = $scope.query || {};
			var page = query.page || $scope.page;
			var pageSize = query.pageSize || $scope.pageSize;
			var tableName = query.tableName ||$scope.tableName;
			query.page = undefined;
			query.pageSize = undefined;
			query.tableName = undefined;
			util.post(config.apiUrlPrefix+"tabledb/query", {
				tableName:$scope.tableName,
				page:page,
				pageSize:pageSize,
				query:query,
			}, function(data){
				$scope.tableRecords = data.records;
				$scope.totalItems = data.total;
				outputEditor.setValue(angular.toJson(data.records,4));
			});
			//$scope.getIndexes();
		}
		$scope.onTableChanged = function() {
			$location.search("tableName", $scope.tableName);
			$scope.getTableRecords();
		};

		$scope.clickQuery = function() {
			var queryStr = inputEditor.getValue();
			$scope.query = angular.fromJson(queryStr || "{}");
			//console.log(queryStr, angular.fromJson(queryStr || "{}"));
			$scope.getTableRecords();
		}
		$scope.newRecord = function () {
			$scope.operation = 'insert';
			$scope.errMsg = "";
			ace.edit("editor").setValue('{}');
		}
		$scope.editRecord = function (obj) {
			$scope.errMsg = "";
			$scope.operation = 'update';
			$scope.editRecordId = obj.id;
			$http.post(urlPrefix+'beautify',{code:obj.value}).then(function (response) {
				var code = response.data.code;
				ace.edit("editor").setValue(code);
			})
		}
		$scope.submitRecord = function () {
			var code = ace.edit("editor").getValue();
			$http.post(urlPrefix+'tojson',{code:code}).then(function (response) {
				var obj = response.data;
				if ($scope.operation == 'insert') {
					$scope.addRecord(obj);
				} else {
					// $scope.updateRecord($scope.editRecordId, obj);
					$scope.replaceRecord($scope.editRecordId, obj);
				}
				$scope.newRecord();
				$scope.errMsg = "";
			}).catch(function (response) {
				$scope.errMsg = "data format error";
			});
		}

		$scope.editIndex = function (index) {
			if ($scope.editIndexes.indexOf(index) < 0) {
				$scope.editIndexes.push(index);
			}
		}
		$scope.hideIndex = function (index) {
			$scope.editIndexes.splice($scope.editIndexes.indexOf(index),1);
		}

		$scope.removeIndex = function (index) {
			if(confirm("are you sure to delete the index `"+index+"`?")){
				$scope.editIndexes.splice($scope.editIndexes.indexOf(index),1);
				$http.post(urlPrefix+'removeIndex',{dbPath:$scope.dbPath, tableName:$scope.selectedTable,index}).then(function (response) {
					$scope.indexes = response.data;
				})
			}
		}

		$scope.setDBPath = function () {
			$location.search("dbPath", $scope.dbPath);
			util.post(config.apiBaseUrl+'tabledb/setDBPath', {dbPath:$scope.dbPath}).then(function(data){
				$scope.tables = data || [];
			});
		}


		$scope.getIndexes = function () {
			$http.post(urlPrefix+'getIndexes',{dbPath:$scope.dbPath, tableName:$scope.selectedTable}).then(function (response) {
				$scope.indexes = response.data;
			});
		}

		$scope.updateRecord = function (id, obj) {
			var params = {operation: "update", dbPath:$scope.dbPath, tableName: $scope.selectedTable, query: {_id:id}, update: obj}
			$http.post(urlPrefix+'curd', params);
			$scope.getTableRecord();
		}

		$scope.replaceRecord = function (id, obj) {
			var params = {operation: "replace", dbPath:$scope.dbPath, tableName: $scope.selectedTable, query: {_id:id}, update: obj}
			$http.post(urlPrefix+'curd', params);
			$scope.getTableRecord();
		}

		$scope.deleteRecord = function (id) {
			var params = {operation: "delete", dbPath:$scope.dbPath, tableName: $scope.selectedTable, query: {_id:id}, update: {}}
			$http.post(urlPrefix+'curd', params);
			$scope.getTableRecord();
		}

		$scope.addRecord = function (obj) {
			var params = {operation: "insert", dbPath:$scope.dbPath, tableName: $scope.selectedTable, query: {}, update: obj}
			$http.post(urlPrefix+'curd', params);
			$scope.getTableRecord();
		}

	});
	return htmlContent;
})
