define([
    'app',
	'helper/util',
	'helper/mdconf',
    'text!wikimod/adi/html/paracraftWorld.html',
], function (app, util, mdconf, htmlContent) {
	var initObj;

    function registerController(wikiblock) {
        app.registerController("paracraftWorldController", ['$scope','$sce', function ($scope, $sce) {
			$scope.imgsPath  = config.wikiModPath + 'adi/assets/imgs/';
			$scope.showModal = false;

			var token = localStorage.getItem("satellizer_token");

			var params_text = wikiblock.blockCache.block.content.replace(/```@adi\/js\/paracraftWorld/, "");
			params_text = params_text.replace(/```/, "");

			var isJSON = true;

			try {
				JSON.parse(params_text);
			} catch (error) {
				isJSON = false;
			}

			if(isJSON){
				var oldParams = JSON.parse(params_text);
				var newParams = {};

				newParams["design"] = {"text" : "style1"};

				for(key in oldParams){

					if(key == "logoUrl"){
						var logoUrl = JSON.parse(oldParams.logoUrl);
						
						for(x in logoUrl){
							newParams[key] = {"text" : {}};

							for(y in logoUrl[x]){
								newParams[key].text[x]= {
									id    : Date.now(),
									name  : y,
									url   : logoUrl[x][y],   
								};
							}
						}
					}else{
						newParams[key] = {"text" : oldParams[key]};
					}
				}

				wikiblock.applyModParams(mdconf.jsonToMd(newParams));
			}

			initObj = {
				scope  : $scope,
				styles : [
					{
						"design": {
							"text":"style1",
						},
						
					},
					{
						"design": {
							"text":"style2",
						},
						
					},
					{
						"design": {
							"text":"style3",
						},
						
					},
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
						is_leaf      : true,
						type         : "menu",
						editable     : true,
						is_mod_show  : true,
						name         : "LOGO",  
						text         : [],
						require      : true,
					},
					version : {
						is_leaf      : true,
						type         : "link",
						editable     : true,
						is_mod_show  : true,
						name         : "版本",
						text         : "",
						require      : true,
					},
					opusId : {
						is_leaf      : true,
						type         : "link",
						editable     : true,
						is_mod_show  : true,
						name         : "世界ID",
						text         : "",
						require      : true,
					},
					desc : {
						is_leaf      : true,
						type         : "link",
						editable     : true,
						is_mod_show  : true,
						name         : "描述",
						text         : "",
						require      : true,
					},
					worldUrl : {
						is_leaf      : true,
						type         : "link",
						editable     : true,
						is_mod_show  : true,
						name         : "世界下载地址",
						text         : "",
						require      : true,
					},
					filesTotals : {
						is_leaf      : true,
						type         : "link",
						editable     : true,
						is_mod_show  : true,
						name         : "文件大小",
						text         : "",
						require      : true,
					},
					username : {
						is_leaf      : true,
						type         : "link",
						editable     : true,
						is_mod_show  : true,
						name         : "用户名",
						text         : "",
						require      : true,
					},
					updateDate : {
						is_leaf      : true,
						type         : "link",
						editable     : true,
						is_mod_show  : true,
						name         : "更新时间",
						text         : "",
						require      : true,
					},
					worldName : {
						is_leaf      : true,
						type         : "link",
						editable     : true,
						is_mod_show  : true,
						name         : "世界名称",
						text         : "",
						require      : true,
					},
					btnLogo:{
						is_leaf      : true,
						type         : "link",
						editable     : false,
						is_mod_show  : true,
						name         : "btnLogo",
						text         : config.wikiModPath + 'adi/assets/imgs/down.png',
						require      : true,
					},
				}
            }

			wikiblock.init(initObj);
			$scope.checkEngine = function () {
                $scope.showModal=true;

                window.open("paracraft:// usertoken=\"" + token + "\" cmd/loadworld " + $scope.params.worldUrl.text);
			}
			
			$scope.clickDownload = function() {
                $scope.showModal = false;
                window.open("http://www.paracraft.cn");
			}

			$scope.closeModal = function () {
                $scope.showModal=false;
            }

			$scope.viewTimes = 0;
            var viewTimesUrl = "/api/mod/worldshare/models/worlds/getOneOpus";
            var params       = {opusId: $scope.params.opusId.text};

            util.http("POST", viewTimesUrl, params, function (response) {
                $scope.viewTimes = response.viewTimes;
            }, function (response) { });

			$scope.getImageUrl = function (logoUrl) {
				if(!logoUrl || !logoUrl.text || !logoUrl.text[0] || !logoUrl.text[0].url){
					return undefined;
				}

				var url = logoUrl.text[0].url;

                if (!url)
                    return undefined;

                if (url.indexOf("http") == 0)
                    return url + "?ver=" + $scope.params.version.text;

                if (url[0] == '/')
                    url = url.substring(1);

                return $scope.imgsPath + url + "?ver=" + $scope.params.version.text;
			}
			
			$scope.getSize = function(size){
				if (size <= 1048576) {
					return parseInt(size / 1024) + "KB";
				} else {
					return parseInt(size / 1024 / 1024) + "M";
				}
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