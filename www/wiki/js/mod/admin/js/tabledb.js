
define([
		'app',
		'helper/util',
		'text!wikimod/admin/html/tabledb.html',
		"ace",
], function (app, util, htmlContent) {
	app.registerController('tabledbController', ["$scope", "$auth","$http", "$location","Account", function ($scope, $auth, $http, $location, Account) {
		var urlPrefix = "/wiki/js/mod/admin/js/";
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
		
		// 确保为管理员
		function ensureAdminAuth() {
			if (!Account.isAuthenticated()) {
				util.go(urlPrefix + "login");
				return;
			}

			var payload = $auth.getPayload();
			
			if (!payload.isAdmin) {
				util.go(urlPrefix + "login");
			}
		}

		function init() {
			ensureAdminAuth();

			$scope.path      = $location.search().path || $scope.path;
            $scope.tableName = $location.search().tableName || $scope.tableName;
            $scope.pageSize  = $location.search().pageSize || $scope.pageSize;
            $scope.page      = $location.search().page || $scope.page;
            
			//$location.search("path", $scope.path);
			$location.search("tableName", $scope.tableName);

			$scope.getTables();
			$scope.getTableRecords();
			$scope.getIndexes();
			initEditor();
		}

		function initEditor() {
			setTimeout(function () {
				var editorContainer = $('#editorContainer')[0];
				var documentHeight = Math.max(document.body.scrollHeight,document.body.clientHeight);
				var height = (documentHeight - editorContainer.offsetTop - 150) + 'px';
				// console.log(height);
				$('#inputEditor').css('height', height);
				$('#outputEditor').css('height', height);

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
			});
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
				tableName:tableName,
				page:page,
				pageSize:pageSize,
				query:query,
			}, function(data){
				$scope.tableRecords = data.data;
				$scope.totalItems = data.total;
				outputEditor.setValue(angular.toJson(data.data,4));
			});
			//$scope.getIndexes();
		}
		$scope.onTableChanged = function() {
			$location.search("tableName", $scope.tableName);
			$scope.getTableRecords();
			$scope.getIndexes();
		};

		$scope.clickQuery = function() {
			var queryStr = inputEditor.getValue();
			$scope.query = angular.fromJson(queryStr || "{}");
			//console.log(queryStr, angular.fromJson(queryStr || "{}"));
			$scope.getTableRecords();
		}

		$scope.clickUpsert = function() {
			var queryStr = inputEditor.getValue();
            var query = angular.fromJson(queryStr || "{}");

            util.post(config.apiUrlPrefix + "tabledb/upsert", {
                tableName:$scope.tableName,
                query:query,
            }, function(data) {
                outputEditor.setValue(angular.toJson(data,4));
            });
        }

		$scope.clickDelete = function() {
			var queryStr = inputEditor.getValue();
            var query = angular.fromJson(queryStr || "{}");
        
            util.post(config.apiUrlPrefix + "tabledb/delete", {
                tableName:$scope.tableName,
                query:query,
            }, function(data){
                outputEditor.setValue(angular.toJson(data,4));
            }, function(data){
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
				$scope.indexes.splice($scope.indexes.indexOf(index),1);

				util.post(config.apiUrlPrefix+'tabledb/deleteIndex',{tableName:$scope.tableName, indexName:index});
			}
		}


		$scope.getIndexes = function () {
			util.post(config.apiUrlPrefix + 'tabledb/getIndexes', {
				tableName:$scope.tableName
			},
			function(data){
				$scope.indexes = data || [];
			});
		}

	}]);
	return htmlContent;
});
