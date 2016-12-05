angular.module('MyApp')
.factory('github', function ($http, $auth, Account) {

    var github = {};
    var githubApi = "https://api.github.com";

    return {
        getAccessToken: function () {
            return Account.getUser().github_token;
        },
        getRequestConfig: function () {
            var token = this.getAccessToken();
            if (token) {
                return {
                    headers: { 'Authorization': token.token_type + ' ' + token.access_token , 'Accept': 'application/vnd.github.full+json' },
                    skipAuthorization: true, // skipping satellizer pluggin
                };
            }
        },

        //http interface and Callback function
        getCallback: function ( func,callback){
            $http.get( githubApi + func, this.getRequestConfig()).then(function (response) {
                if (callback) {
                    callback(response.data);
                }
            }).catch(function (response) {
                console.log('github "' + func + '" error:' + JSON.stringify(response));
                callback(response);
            });
        },
        postCallback: function ( func,data,callback){
            $http.post(githubApi + func,data, this.getRequestConfig() ).then(function (response) {
                if(callback){
                    callback(response.data);
                }
            }).catch(function (response) {
                console.log('github "' + func + '" error:' + JSON.stringify(response));
            });
        },
        deleteCallback: function ( func,callback){
            $http.delete(githubApi + func, this.getRequestConfig() ).then(function (response) {
                if(callback){
                    callback(response);
                }
            }).catch(function (response) {
                console.log('github "' + func + '" error:' + JSON.stringify(response));
            });
        },
        putCallback: function ( func,data, callback){
            $http.put(githubApi + func,data, this.getRequestConfig() ).then(function (response) {
                if(callback){
                    callback(response);
                }
            }).catch(function (response) {
                console.log('github "' + func + '" error:' + JSON.stringify(response));
            });
        },

        getUser: function (callback) {this.getCallback('/user',callback);},
        emojis: function (callback) {this.getCallback('/emojis',callback);},

        //Repositories API
        newRepos: function (reposName, reposDesc, callback) {
            this.postCallback("/user/repos",{
                "name": reposName,
                "description": reposDesc,
                "homepage": "https://github.com",
                "private": false,
                "has_issues": true,
                "has_wiki": true,
                "has_downloads": true
            },callback);
        },
		delRepos: function (reposName, callback){this.deleteCallback('/repos/'+reposName,callback);},
        lstRepos: function (callback) {this.getCallback('/user/repos',callback);},

        //Branches API
        lstBranch: function (reposName, callback) {this.getCallback('/repos/'+reposName+'/branches',callback);},
        getBranch: function (reposName,branchName, callback) {this.getCallback('/repos/'+reposName+'/branches/'+branchName,callback);},

        //Contents API
        getContents: function (reposName, callback) {this.getCallback('/repos/'+reposName+'/contents/',callback);},
        newFile: function (reposName, path, message, content, callback ) {
            this.putCallback('/repos/'+reposName+'/contents/'+path,{
                "message":message,
                "content":content
            },callback);
        },
        updFile: function (reposName, path, message, content, sha, callback ) {
            this.putCallback('/repos/'+reposName+'/contents/'+path,{
                "message":message,
                "content":content,
                "sha":sha
            },callback);
        },
        delFile: function (reposName, path, message, sha, callback){this.deleteCallback('/repos/'+reposName+'/contents/'+path,callback);},

		//上传文件，参数为用户数据(json格式)， reposName, fileName, fileContent
		upload: function(user, reposName, fileName, fileContent){
			var owner = user.login;
			var uri = githubApi + 'repos/'+owner+'/'+reposName+'/contents/'+fileName;
			$http({
				method: 'PUT',
				url: uri,
				data: {
					'committer': {'name': user.name, 'email': user.email, },
					'message': 'uploaded file',
					'content': fileContent
				}
			}, this.getRequestConfig()).then(function(response){
                alert(JSON.stringify(response.data));
            }).catch(function (response) {
                alert(JSON.stringify(response));
            });
		}

    };
});
