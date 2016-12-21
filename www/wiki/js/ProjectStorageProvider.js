/**
 * Created by karlwu on 2016-11-28.
 */

app.factory('ProjectStorageProvider', function ($http) {
    // github 数据源
    var github = {
        repoName:'wikicraftDataSource'
        //repoName:'NPLRuntime'
    };

    // 获得用户obj
    github.getUser = function(user) {
        return this.github.getUser(user);
    }
    // 获得原始github
    github.getGitHub = function () {
        return github.github;
    }
    // 获得库
    github.getRepo = function (repo) {
        return github.github.getRepo(github.username, repo);
    }


    // 初始化
    //  github.github
    //  github.user
    //  github.profile
    //  github.username
    //  github.repo
    github.init = function (token, cb) {
        // token auth
        github.github = new GitHub({
            token: token.access_token
        });
        github.user = github.getUser();
        github.getUser().getProfile(function (error, result, request) {
            if (!error) {
                github.profile = result;
                github.username = result.login;
            }
        });
        github.getUser().listRepos(function(error, result, request){
            if(!error) {
                var findRepo = 0;
                for(var i=0;i<result.length;i++){
                    if(result[i].permissions.admin && result[i].name == github.repoName){
                        findRepo++;
                    }
                }
                if(findRepo == 0){
                    github.getUser().createRepo({
                        name:github.repoName
                    },function(error,result,request){
                        if(!error) {
                            github.repo = github.github.getRepo(github.username, github.repoName);
                            github.saveFile("README.md","this is a wikicraft project. ","first commit");
                            if(cb){
                                cb();
                            }
                        }
                    });
                }else{
                    github.repo = github.github.getRepo(github.username, github.repoName);
                    if(cb){
                        cb();
                    }
                }
            }
        });
    }

    // 上传图片 图片默认都放在根目录下的images目录下
    github.uploadImage = function (filename, content, options, cb) {
        if (filename[0] == '/') {
            filename = 'images' + filename;
        } else {
            filename = "images/" + filename;
        }

        github.repo.writeFile('master', filename, content, "upload image: " + filename, options, function (error, result, request) {
            //console.log("writeFile");
            //console.log(result);
            cb && cb(error, result, request);
        });
    }

    // 保存文件
    github.saveFile = function (path, content, message, cb) {
        github.repo.writeFile('master', path, content, message, {}, function (error, result, request) {
            if (error) {
                cb && cb(error, result, request);
                return ;
            }
            // 提交到内部服务器  这块可放到外面写
            var websiteName = result.content.path.match(/\/?([^\/]+)/);
            websiteName = websiteName && websiteName[1];
            var page = {
                sha:result.content.sha,
                path:result.content.path,
                name:result.content.name,
                content:content,
                contentType:'html',
                websiteName:websiteName,
            }
            console.log(page);
            util.http($http, 'PUT', config.apiUrlPrefix + 'website_pages/new', page, function (data) {
                console.log(data);
                cb && cb(error, data, request);
            })
        });
    };
    // 列出历史版本
    github.listCommits = function (options, cb) {
        github.repo.listCommits(options, cb);
    }

    github.getSingleCommit = function (sha, cb) {
        github.repo.getSingleCommit(sha, cb);
    }

    // 获得filelist   非递归可能有bug 取决js异步对统一变量访问是否是隔离的
    github.getTree = function (treeSha, recursive, cb, out, level, prefix) {
        level = level || [];
        if (treeSha == undefined) {
            treeSha = 'master';
        }

        if (recursive == undefined) {
            recursive = true;
        }

        if (recursive) {
            treeSha += '?recursive=1';
        }

        github.repo.getTree(treeSha, function (error, result, request) {
            if (error) {
                console.log(error);
                cb(error, out, request);
                return ;
            }

            if (recursive &&  result.truncated) {   // 递归被截断  则手动递归获取
                github.getTree(treeSha, false, cb, out, level);
                return;
            }

            out = out || [];

            for(var i = 0 ; i < result.tree.length; i++) {
                if (prefix) {
                    result.tree[i].path = prefix + '/' + result.tree[i].path;
                }
                out.push(result.tree[i]);

                if (!recursive && result.tree[i].type == 'tree') {
                    level.push(1)
                    github.getTree(result.tree[i].sha, false, cb, out, level, result.tree[i].path)
                }
            }

            if (level.length == 0) {
                cb(error, out, request);
            } else {
                level.pop();
            }
        })
    }

    // 回滚文件
    github.rollbackFile = function (commitSha, path, message, cb) {

        github.repogetContents(commitSha, path, true, function (error, result, request) {
            if (error) {
                cb || cb(error, result, request);
                return;
            }
            console.log(result);
            github.saveFile(path, result, message, cb);
        });
    }

    // 删除文件
    github.deleteFile = function (path, cb) {
        github.repodeleteFile('master', path, function (error, result, request) {
            innerServer.deleteFile(path, function (data) {
                cb && cb(error, data, request);
            })
        });
    }

    // 内部服务器数据
    var innerServer = {};

    innerServer.saveFile = function(websiteName, pageName, path, sha, content, contentType, innerCB) {
        var page = {
            sha:sha,
            path:path,
            name:pageName,
            content:content,
            contentType:contentType,
            websiteName:websiteName,
        }
        util.http($http, 'PUT', config.apiUrlPrefix + 'website_pages/new', page, innerCB);
    }

    innerServer.deleteFile = function (path, innerCB) {
        util.http($http, 'DELETE', config.apiUrlPrefix + 'website_pages',{path:path}, innerCB);
    }

    innerServer.getWebsiteTree = function (websiteName, innerCB) {

    }

    innerServer.getAllWebsiteTree = function (innerCB) {

    }

    // 返回依赖注入
    return {
        storageProvider:{
            "innerServer":innerServer,
            "github":github,
        },

        getDataSource: function (name) {
            return this.storageProvider[name];
        }
    }
});