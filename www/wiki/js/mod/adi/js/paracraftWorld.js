define([
    'app',
    'helper/util',
    'text!wikimod/adi/html/paracraftWorld.html',
], function (app, util, htmlContent) {
	var initObj;

    function registerController(wikiblock) {
        app.registerController("paracraftWorldController", ['$scope','$sce', function ($scope, $sce) {
			$scope.imgsPath = config.wikiModPath + 'adi/assets/imgs/';

			initObj = {
				scope  : $scope,
				styles : [
					{
						"design": {
							"text":"style1",
						},
					}
				],
				params_template : {
					design : {
						is_leaf  : true,
						type     : "text",
						editable : false,
						is_show  : false,
						name     : "样式",
						text     : "style1",
						require  : true,
					},
					logoUrl : {
						is_leaf  : true,
						type     : "link",
						editable : true,
						is_show  : true,
						name     : "LOGO",
						text     : "",
						require  : true,
					},
					version : {
						is_leaf  : true,
						type     : "link",
						editable : true,
						is_show  : true,
						name     : "版本",
						text     : "",
						require  : true,
					},
					opusId : {
						is_leaf  : true,
						type     : "link",
						editable : true,
						is_show  : true,
						name     : "世界ID",
						text     : "",
						require  : true,
					},
					desc : {
						is_leaf  : true,
						type     : "link",
						editable : true,
						is_show  : true,
						name     : "描述",
						text     : "",
						require  : true,
					},
					worldUrl : {
						is_leaf  : true,
						type     : "link",
						editable : true,
						is_show  : true,
						name     : "世界下载地址",
						text     : "",
						require  : true,
					},
					filesTotals : {
						is_leaf  : true,
						type     : "link",
						editable : true,
						is_show  : true,
						name     : "文件大小",
						text     : "",
						require  : true,
					},
					username : {
						is_leaf  : true,
						type     : "link",
						editable : true,
						is_show  : true,
						name     : "用户名",
						text     : "",
						require  : true,
					},
					updateDate : {
						is_leaf  : true,
						type     : "link",
						editable : true,
						is_show  : true,
						name     : "更新时间",
						text     : "",
						require  : true,
					},
					worldName : {
						is_leaf  : true,
						type     : "link",
						editable : true,
						is_show  : true,
						name     : "世界名称",
						text     : "",
						require  : true,
					},
				}
            }

			wikiblock.init(initObj);

			console.log($scope.params);

			$scope.getImageUrl = function (url) {
				console.log(url);

				return false;

                // if (!url)
                //     return undefined;

                // if (url.indexOf("http") == 0)
                //     return url + "?ver=" + $scope.modParams.version;

                // if (url[0] == '/')
                //     url = url.substring(1);

                // return $scope.imgsPath + url + "?ver=" + $scope.modParams.version;
            }
		}]);
    }

    return {
        render: function (wikiblock) {
            registerController(wikiblock);
            return htmlContent;
		},
		initObj: function(){
			return initObj;
		}
    }
});