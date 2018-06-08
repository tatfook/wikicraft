/**
 * Created by wuxiangan on 2017/3/24.
 */

define([
    'app',
    'helper/util',
    'helper/dataSource',
    'helper/storage',
    'js-base64',
], function (app, util, dataSource, storage) {
    function _encodeURIComponent(url) {
        //return encodeURIComponent(url);
		return encodeURIComponent(url).replace(/\./g,'%2E')
    }

	function filenameEncode(str) {

	}

	function filenameDecode(str) {

	}

    app.factory('gitlab', ['$http', function ($http) {
        var getRawBaseUrl = function(){
            return "https://" + config.serverConfig.gitServerHost
        }
        var gitlab = {
            inited: false,                                          // is already init
            username: '',   // gitlab 用户名                        // gitlab username
            lastCommitId: "master",                                // 最新commitId  替代master  用于cdn加速
            projectId: undefined,                                  // project id
            projectName: 'keepworkdatasource',                   // repository name
			projectMap:{},                                      // 项目列表
            rawBaseUrl: getRawBaseUrl(),              // raw base url
            apiBaseUrl: getRawBaseUrl() + "/api/v4",     // api base url
            rootPath: '',                                           // 根路径
            httpHeader: {},
        };

        // http请求
        gitlab.httpRequest = function (method, url, data, cb, errcb) {
            this.dataSource.dataSourceToken && (this.httpHeader["PRIVATE-TOKEN"] = this.dataSource.dataSourceToken);
			//console.log(url);
            var config = {
                method: method,
                url: this.apiBaseUrl + url,
                headers: this.httpHeader,
                skipAuthorization: true,  // 跳过插件satellizer认证
				isShowLoading:data.isShowLoading == undefined ? true : data.isShowLoading,
            };


            data = data || {};
            data.per_page = 100;

            if (method == "POST" || method == "PUT") {
                config.data = data;
            } else {
                config.params = data;
            }

            var result = undefined;
            var success = function (response) {
				//console.log(response);
				if (response.status < 200 || response.status >=300) {
					errcb && errcb(response);
					return;
				}

                var headers = (typeof(response.headers) == "function") && response.headers();
                if (headers && headers["x-next-page"] && data.isFetchAll) {
                    data.page = parseInt(headers["x-next-page"]);
                    result = (result || []).concat(response.data);
                    //console.log(result);
                    $http(config).then(success).catch(failed);
                } else {
					//console.log(response);
                    result = result ? (result.concat(response.data)) : response.data;
                    typeof cb == 'function' && cb(result);
                }
            };
            var failed = function (response) {
                //console.log(response);
                typeof errcb == 'function' && errcb(response);
            };

            $http(config).then(success).catch(failed);
        }

		//gitlab.getAuthInfo = function(){
			//return this.dataSource.visibility == "private" ? "private_token=" + this.dataSource.dataSourceToken : "private_token=";
		//}

        gitlab.getLongPath = function (params) {
			return this.rootPath + (params.path || "");

			//if (this.rootPath || this.sitename == "__keepwork__") {
				//return this.rootPath + (params.path || "");
			//}

			//return "/" + this.keepwrokUsername + "/" + this.keepworkSitename + "/" + (params.path || "");
        }

		gitlab.getToken = function() {
			return this.dataSource.dataSourceToken;
		}

        gitlab.getCommitUrlPrefix = function (params) {
			var authStr = this.dataSource.visibility == "private" ? "?private_token=" + (params.token || this.dataSource.dataSourceToken) : "";
            return this.rawBaseUrl + '/' + (params.username || this.username) + '/' + (params.projectName || this.projectName).toLowerCase() + "/commit/" + params.sha + authStr;
        }

        gitlab.getRawContentUrlPrefix = function (params) {
            params = params || {};
			var authStr = this.dataSource.visibility == "private" ? "?private_token=" + (params.token || this.dataSource.dataSourceToken) : "";
            return this.rawBaseUrl + '/' + (params.username || this.username) + '/' + (params.projectName || this.projectName).toLowerCase() + '/raw/' + (params.sha || this.lastCommitId) + this.getLongPath(params) + authStr;
        }

        gitlab.getContentUrlPrefix = function (params) {
            params = params || {};
			var authStr = this.dataSource.visibility == "private" ? "?private_token=" + (params.token || this.dataSource.dataSourceToken) : "";
            return this.rawBaseUrl + '/' + (params.username || this.username) + '/' + (params.projectName || this.projectName).toLowerCase() + '/blob/'+ (params.sha || this.lastCommitId) + this.getLongPath(params) + authStr;
        }

		// groups
		// get group list
		gitlab.getGroupList = function (params, cb, errcb) {
			var self = this;
			var url = '/groups';

			self.httpRequest("GET", url, {owned:true, isFetchAll:true, search:params.search}, function(data){
				for (var i = 0; i < (data || []).length; i++) {
					//data[i].name = data[i].name.substring((self.username+'_group_').length);
					var temp = data[i].name.match(/gitlab_(www|rls|test)_([\w\d]+)_group_([\w\d]+)/);
					data[i].groupUsername = temp[2] || "";
					data[i].name = temp[3] || "";
				}
				cb && cb(data);
			}, function(){
				errcb && errcb();
			});
		}
		// create group
		//gitlab.createGroup = function(params, cb, errcb) {
			//var self = this;
			//var url = '/groups';
			//var groupname = self.username + "_" + params.name;

			//self.getGroupList({search:groupname}, function(data){
				//// 是否存在， 存在就返回
				//for (var i=0; i < (data || []).length; i++)	{
					//if (data[i].name == params.name) {
						//return ;
					//}
				//}

				//self.httpRequest("POST", url, {
					//name:groupname,
					//path:groupname,
					//visibility: "public",
					//request_access_enabled: true,
				//}, cb, errcb)
			//}, errcb);
		//}
		// update group
		gitlab.upsertGroup = function(params, cb, errcb) {
			var self = this;
			var url = '/groups';
			var method = "POST";
			params.path = self.username + "_group_"  + params.name;
			params.name = params.path;
			if (params.id) {
				method = "PUT";
				url += "/" + params.id;
			}

			self.httpRequest(method, url, params, function(data){
				data.name = data.name.substring((self.username+'_group_').length);
				cb && cb(data);
			}, errcb)
		}
		// delete group
		gitlab.deleteGroup = function(params, cb, errcb) {
			var self = this;
			var url = '/groups/' + params.id;

			self.httpRequest("DELETE", url, params, cb, errcb)
		}
		// list all group member
		gitlab.getGroupMemberList = function(params, cb, errcb) {
			var self = this;
			var url = '/groups/' + params.id + '/members';

			self.httpRequest("GET", url, params, function(data){
				for (var i = 0; i < (data || []).length; i++) {
					var user = data[i];
					if (user.username == self.username) {
						user.isDelete = true;
					}
					user.name = user.name.substring(user.name.lastIndexOf('_')+1);
				}
				cb && cb(data);
			}, errcb);
		}
		// create group member
		gitlab.createGroupMember = function(params, cb, errcb) {
			var self = this;
			var url = '/groups/' + params.id + '/members';
			var method = "POST";

			self.httpRequest(method, url, params, cb, errcb);
		}
		// update group member
		gitlab.updateGroupMember = function(params, cb, errcb) {
			var self = this;
			var url = '/groups/' + params.id + '/members/' + params.user_id;
			var method = "PUT";

			self.httpRequest(method, url, params, cb, errcb);
		}
		// delete group member
		gitlab.deleteGroupMember = function(params, cb, errcb) {
			var self = this;
			var url = '/groups/' + params.id + '/members/' + params.user_id;
			var method = "DELETE";
			self.httpRequest(method, url, params, cb, errcb);
		}
		// add group to project
		// {id: group_id, group_access}
		gitlab.addProjectGroup = function(params, cb, errcb) {
			this.httpRequest("POST", "/projects/" + this.projectId + "/share", params, cb, errcb);
		}
		// {group_id, }
		gitlab.deleteProjectGroup = function(params, cb, errcb) {
			this.httpRequest("DELETE","/projects/" + this.projectId + "/share/" + params.group_id, params, cb, errcb);
		}
		gitlab.getProjectGroupList = function(params, cb, errcb) {
			var self = this;
			this.httpRequest("GET", "/projects/" + this.projectId, {}, function(data){
				var groupList = data.shared_with_groups || [];
				for (var i = 0; i < groupList.length; i++) {
					var group = groupList[i];
					//group.group_name = group.group_name.substring((self.username+'_group_').length);
					var temp = group.group_name.match(/gitlab_(www|test|rls)_([\w\d]+)_group_([\w\d]+)/);
					group.groupUsername = temp[2] || "";
					group.group_name = temp[3] || "";
				}
				cb && cb(groupList);
			});
		}
        // 获得文件列表
        gitlab.getTree = function (params, cb, errcb) {
            var self = this;
            var url = '/projects/' + self.projectId + '/repository/tree';
            var path = self.getLongPath(params);
            params.path = path.substring(1);
            params.recursive = params.recursive == undefined ? true : params.recursive;
            params.isFetchAll = params.recursive;
            self.httpRequest("GET", url, params, function (data) {
                var pagelist = [];
                for (var i = 0; i < data.length; i++) {
                    var path = '/' + data[i].path;
                    var page = {pagename: data[i].name};
                    var suffixIndex = path.lastIndexOf(".md");
                    // 不是md文件不编辑
                    if (suffixIndex < 0)
                        continue;

                    page.url = path.substring(self.rootPath.length, path.lastIndexOf('.'));
                    var paths = page.url.split('/');
                    if (paths.length < 3)
                        continue;

                    page.username = paths[1];
                    page.sitename = paths[2];
                    page.pagename = paths[paths.length - 1];
					page.blobId = data[i].id; // 文档sha

                    pagelist.push(page);
                }
                cb && cb(pagelist);
            }, errcb);
        }

		gitlab.getSingleCommit = function(data, cb, errcb) {
            var url = '/projects/' + this.projectId + '/repository/commits/' + data.sha;
			this.httpRequest("GET", url, data, cb, errcb);
		}

        // commit
        gitlab.listCommits = function (data, cb, errcb) {
            //data.ref_name = data.ref_name || 'master';
            var url = '/projects/' + this.projectId + '/repository/commits';
            this.httpRequest('GET', url, data, cb, errcb);
        };

        // 获取文件操作的url prefix
        gitlab.getFileUrlPrefix = function () {
            return '/projects/' + this.projectId + '/repository/files/';
        }
        // 获取调教信息前缀 commit message prefix
        gitlab.getCommitMessagePrefix = function () {
            return "keepwork commit: ";
        }
        // 设置lastCommitId
        gitlab.setLastCommitId = function (lastCommitId) {
            this.lastCommitId = lastCommitId;
        }
        // 获取lastCommitId
        gitlab.getLastCommitId = function (cb, errcb, isShowLoading) {
            var self = this;
            self.listCommits({isShowLoading:isShowLoading}, function (data) {
                if (data && data.length > 0) {
                    self.lastCommitId = data[0].id;
                } else {
                    self.lastCommitId = "master";
                }
                cb && cb(self.lastCommitId);
            }, errcb);
        }

        // 写文件
        gitlab.writeFile = function (params, cb, errcb) {
            var self = this;
            params.path = self.getLongPath(params).substring(1);
            var url = self.getFileUrlPrefix() + _encodeURIComponent(params.path);
            params.commit_message = self.getCommitMessagePrefix() + params.path;
            params.branch = params.branch || "master";
            self.httpRequest("GET", url, {path: params.path, ref: params.branch, isShowLoading:params.isShowLoading}, function (data) {
                // 已存在
				if (data && data.blob_id) {
					self.httpRequest("PUT", url, params, function (data) {
						//console.log(data);
						cb && cb(data);
					}, errcb)
				} else {
					self.httpRequest("POST", url, params, cb, errcb)
				}
            }, function () {
                self.httpRequest("POST", url, params, cb, errcb)
            });
        }

		gitlab.getFile = function(params, cb, errcb) {
            var self = this;
            params.path = self.getLongPath(params).substring(1);
            var url = self.getFileUrlPrefix() + _encodeURIComponent(params.path);
            params.ref = params.ref || self.lastCommitId;
            self.httpRequest("GET", url, params, function (data) {
                data.content = data.content && Base64.decode(data.content);
                cb && cb(data);
            }, errcb);
		}
        // 获取文件
        gitlab.getContent = function (params, cb, errcb) {
            var self = this;
            params.path = self.getLongPath(params).substring(1);
            var url = self.getFileUrlPrefix() + _encodeURIComponent(params.path);
            params.ref = params.ref || self.lastCommitId;
            self.httpRequest("GET", url, params, function (data) {
                data.content = data.content && Base64.decode(data.content);
                cb && cb(data.content);
            }, errcb);

            //gitlab.getRawContent(params, cb, errcb);
        }

        // 获取原始内容
        gitlab.getRawContent = function (params, cb, errcb) {
            var self = this;
			var apiurl = self.getRawContentUrlPrefix(params);
			//console.log(apiurl);
            var _getRawContent = function () {
				if (
          // what the hell is this?
          self.apiBaseUrl.indexOf(".keepwork.com/git/") > 0
        ) {
					$http({
						method: 'GET',
						url: apiurl,
						//url: apiurl + "?private_token=" + self.dataSource.dataSourceToken,
						//headers:self.httpHeader,
						skipAuthorization: true, // this is added by our satellizer module, so disable it for cross site requests.
						isShowLoading:params.isShowLoading,
					}).then(function (response) {
						//storage.indexedDBSetItem(config.pageStoreName, {url:url, content:response.data});
						storage.sessionStorageSetItem(apiurl, response.data);
						cb && cb(response.data);
					}).catch(function (response) {
						errcb && errcb(response);
					});
				} else {
					self.getContent(params, function(content){
						storage.sessionStorageSetItem(apiurl, content);
						cb && cb(content);
					}, errcb);
					//var path = self.getLongPath(params);
					//var path = _encodeURIComponent(path.substring(1));
					//console.log(path);
					////var url = self.apiBaseUrl + "/projects/"+ self.projectId +"/repository/files/"+ path +"/raw你好";
					//var url = self.apiBaseUrl + "/projects/"+ self.projectId +"/repository/files/"+ "xiaoyao%2Ftest%2Findex\%2Emd" +"/raw";
					//util.ajax({
						//url:url,
						//type:"GET",
						//data:{
							//ref:self.lastCommitId,
						//},
						//beforeSend:function(request, statu, xhr) {
							//request.setRequestHeader("PRIVATE-TOKEN", self.dataSourceToken);
						//},
						//success:function(result, statu, xhr) {
							//console.log(result);
						//},
						//error:function(xhr, statu, error) {

						//}
					//})
					//self.httpRequest("GET", url, {ref:self.lastCommitId}, function(data){
						//console.log(data);
					//}, function(data){
						//console.log(data);
					//});
				}
            }
            // _getRawContent();
            // return;
			var content = storage.sessionStorageGetItem(apiurl);
			//content = undefined;
			if (!content) {
				_getRawContent();
			} else {
				cb && cb(content);
			}
			// 由于浏览器会缓存 所以此代码需加上
            //storage.indexedDBGetItem(config.pageStoreName, url, function (page) {
                ////console.log(page, url);
                //if (page) {
                    //cb && cb(page.content);
                //} else {
                    //_getRawContent();
                    ////gitlab.getContent(params, cb, errcb);
                //}
            //}, function () {
                //_getRawContent();
                ////gitlab.getContent(params, cb, errcb);
            //});
        }

        // 删除文件
        gitlab.deleteFile = function (params, cb, errcb) {
            var self = this;
            params.path = self.getLongPath(params).substring(1);
            var url = self.getFileUrlPrefix() + _encodeURIComponent(params.path);
            params.commit_message = self.getCommitMessagePrefix() + params.path;
            params.branch = params.branch || "master";
            self.httpRequest("DELETE", url, params, cb, errcb)
        }

        // 上传图片
        gitlab.uploadImage = function (params, cb, errcb) {
            var self = this;
            //params path, content
            var path = params.path;
            var content = params.content;
            if (!path) {
                path = 'img_' + (new Date()).getTime();
            }
            path = '/'+ self.dataSource.username +'_images/' + path;
            /*data:image/png;base64,iVBORw0KGgoAAAANS*/
            content = content.split(',');
            if (content.length > 1) {
                var imgType = content[0];
                content = content[1];
                imgType = imgType.match(/(image|video)\/([\w]+)/);
                imgType = imgType && imgType[2];
                if (imgType) {
                    path = path + '.' + imgType;
                }
            } else {
                content = content[0];
            }
            console.log(path);
            //console.log(content);
            self.writeFile({
                path: path,
                message: self.getCommitMessagePrefix() + path,
                content: content,
                encoding: 'base64',
				isShowLoading: params.isShowLoading || false,
            }, function (data) {
				//var imgUrl = self.getRawContentUrlPrefix({sha:"master"}) + '/' + data.file_path + (self.dataSource.visibility  == "private" ? ("?private_token=" + self.dataSource.dataSourceToken) : "");
				var imgUrl = self.getRawContentUrlPrefix({sha:"master", path:path, token:"visitortoken"});
                cb && cb(imgUrl);
            }, errcb);
        }

        // 获得文件列表
        gitlab.getImageList = function (cb, errcb) {
            var self = this;
            var url = '/projects/' + self.projectId + '/repository/tree';
            var path = '/'+ self.dataSource.username +'_images'

            var params = {};
            params.path = path.substring(1);
            params.recursive = false
            params.isFetchAll = true;
            self.httpRequest("GET", url, params, function (data) {
                // console.log('gitlab.getImageList: ', data);
                data && data.forEach && data.forEach(function(item) {
                    item.url = self.getRawContentUrlPrefix({sha:"master", path:'/'+item.path, token:"visitortoken"})
                });
                cb && cb(data);
            }, errcb);
        }

        gitlab.removeImage = function (url, cb, errcb) {
            var self = this;
            var path_partials = url.split('/');
            var path = '/' + path_partials.splice(path_partials.length - 2, 2).join('/');
            self.deleteFile({path: path}, cb, errcb);
        }

		gitlab.uploadFile = function(params, cb, errcb) {
			var self = this;
			var path = '/' + self.dataSource.username + '_files/' + params.path;
			var content = params.content || "";
            content = content.split(',');
			//console.log(content);
			content = content.length > 1 ? content[1] : content[0];
			//content = Base64.decode(content);
			//console.log(content);
			self.writeFile({
				path:path,
				content:content,
				encoding: "base64",
                isShowLoading: params.isShowLoading || false,
			},function(){
				var linkUrl = self.getRawContentUrlPrefix({sha:"master", path:path, token:"visitortoken"});
				cb && cb(linkUrl);
				// commit id replace master implement
				//var tempPath = self.getLongPath({path:path}).substring(1);
				//var url = self.getFileUrlPrefix() + _encodeURIComponent(tempPath);
				//params.ref = "master";
				//self.httpRequest("GET", url, {path:tempPath, ref:"master"}, function (data) {
					//var linkUrl = self.getRawContentUrlPrefix({sha:data.last_commit_id, path:path});
					//cb && cb(linkUrl);
				//}, errcb);
			}, errcb);
		}

        // 初始化
        gitlab.init = function (dataSource, cb, errcb) {
            var self = this;
            if (self.inited) {
                cb && cb();
                return;
            }
			//console.log(dataSource);
            self.type = dataSource.type;
            self.username = dataSource.dataSourceUsername;
            self.httpHeader["PRIVATE-TOKEN"] = dataSource.dataSourceToken;
			self.dataSourceToken = dataSource.dataSourceToken;
            //self.apiBaseUrl = dataSource.apiBaseUrl;
            //self.rawBaseUrl = dataSource.rawBaseUrl || getRawBaseUrl();
            // 移到站点中
			self.rootPath = dataSource.rootPath || '';
            self.lastCommitId = dataSource.lastCommitId || "master";
            self.projectName = dataSource.projectName || self.projectName;
            self.projectId = dataSource.projectId || undefined;
			self.visibility = dataSource.visibility || "public";
			self.dataSource = dataSource;

			self.keepwrokUsername = dataSource.username;
			self.keepworkSitename = dataSource.sitename;

            if (!dataSource.dataSourceUsername || !dataSource.dataSourceToken || !dataSource.apiBaseUrl || !dataSource.rawBaseUrl) {
                // console.log("gitlab data source init failed!!!");
                errcb && errcb();
                return;
            }

			if (dataSource.isInited || dataSource.projectId) {
				//self.getLastCommitId(function(lastCommitId){
					//lastCommitId && (self.lastCommitId = lastCommitId);
					//cb && cb();
				//}, errcb);
				self.inited = true;
				cb && cb();
				return;
			}

			self.setDefaultProject({projectName:self.projectName, visibility:self.visibility, lastCommitId:self.lastCommitId}, function() {
				self.inited = true;
				cb && cb();
			}, errcb);

			return;
        };

		// 创建webhook
		gitlab.createWebhook = function (projectId) {
			var self = this;
			var hookUrl = config.apiUrlPrefix + "data_source/gitlabWebhook";
			//var hookUrl = "http://dev.keepwork.com/api/wiki/models/data_source/gitlabWebhook";
			var isExist = false;
			self.httpRequest("GET", "/projects/" + self.projectId + "/hooks", {}, function (data) {
				//console.log(data);
				for (var i = 0; i < data.length; i++) {
					//gitlab.httpRequest("DELETE", "/projects/" + gitlab.projectId + "/hooks/" + data[i].id, {});
					if (data[i].url == hookUrl && data[i].push_events) {
						isExist = true;
					}
				}
				// return;
				// 不存在创建
				if (!isExist) {
					self.httpRequest("POST", "/projects/" + self.projectId + "/hooks", {
						url: hookUrl,
						push_events: true,
						enable_ssl_verification: false,
					}, function () {
						// console.log("webhook create success");
					}, function () {
						// console.log("webhook create failed");
					});
				}
			}, function () {

			});
		};

		// 设置项目可见性
		gitlab.setProjectVisibility = function(params, cb, errcb) {
			var self = this;
			var url = '/projects/' + self.projectId;
			var data = {name:self.projectName, visibility:params.visibility || "public"};

			self.httpRequest("PUT", url, data, cb, errcb);
		}

		// 设置默认项目
		gitlab.setDefaultProject = function(params, cb, errcb) {
			if (!params.projectName) {
				errcb && errcb();
				return;
			}

			var self = this;
			var projectName = params.projectName;
			var visibility = params.visibility;
			self.projectName = projectName;

			var successCallback = function(params) {
				self.projectId = params.projectId;
				self.projectMap[projectName] = {
					projectId:params.projectId,
					lastCommitId:params.lastCommitId || "master",
				};

				self.createWebhook();
				// 更新项目ID
                util.post(config.apiUrlPrefix + 'site_data_source/updateById', {_id:self.dataSource._id, projectId:params.projectId, projectName:projectName});

				self.getLastCommitId(function(lastCommitId){
					self.projectMap[projectName].lastCommitId = lastCommitId;
					self.lastCommitId = lastCommitId;
				});

				cb && cb();
				return;
			}


			//console.log(self.projectMap);
			if (self.projectMap[projectName]) {
				self.projectId = self.projectMap[projectName].projectId;
				self.lastCommitId = self.projectMap[projectName].lastCommitId;
				cb && cb();
				return;
			}

            self.httpRequest("GET", "/projects", {search: projectName, owned: true}, function (projectList) {
				var project = undefined;
				var method = "POST";
				var url = "/projects";
				var data = {name:projectName, visibility: visibility, request_access_enabled:true};
				//var data = {name:projectName, visibility: visibility};

                // 查找项目是否存在
                for (var i = 0; i < projectList.length; i++) {
                    if (projectList[i].name.toLowerCase() == projectName.toLowerCase()) {
                        project = projectList[i];
                        break;
                    }
                }

				// 不存在或需要修改
				if (!project) {
					self.httpRequest(method, url, data, function (project) {
						//console.log(project);
						if (project) {
							successCallback({projectId:project.id, projectName:params.projectName,lastCommitId:params.lastCommitId});
						} else {
							cb && cb();
						}
						//self.getLastCommitId(cb, errcb);
					}, errcb);
				} else if (project.visibility != visibility) {
					//console.log(project);
					method = "PUT";
					url += "/" + project.id;
					data.id = project.id;

					// 不存在则创建项目 存在更新
					self.httpRequest(method, url, data, function (project) {
						//console.log(project);
						successCallback({projectId:project.id, projectName:params.projectName,lastCommitId:params.lastCommitId});
					}, errcb);
				} else {
					successCallback({projectId:project.id, projectName:params.projectName,lastCommitId:params.lastCommitId});
				}
            }, errcb);
		}

        // 是否已经初始化
        gitlab.isInited = function () {
            return this.inited;
        };

        // 获取数据源类型：gitlab
        gitlab.getDataSourceType = function () {
            return this.type;
        };

        // 数据源工厂
        var gitlabFactory = function () {
            return angular.copy(gitlab);
        };

        // 注册数据源构造器
        dataSource.registerDataSourceFactory("gitlab", gitlabFactory);

        return gitlabFactory;
    }]);
});
