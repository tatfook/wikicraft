/**
 * Created by wuxiangan on 2016/10/10.
 */

app.factory('Account', function () {
    return {
        user:{
            _id:1,
            username:'逍遥',
        },
        getUser: function () {
            return this.user;
        },
        
        setUser: function (_user) {
            this.user = _user;
        }
    }
});

app.factory('SelfData', function () {
    return {};
});

app.factory('ProjectStorageProvider', function ($http) {
    // github 数据源
    var github = {
        repoName:'wikicraftDataSource',
    };

    // 获得用户obj
    github.getUser = function(user) {
        return this.github.getUser(user);
    }

    // 获得用户profile  **用户登录执行**
    github.getProfile = function (cb) {
        this.user.getProfile(function (error, result, request) {
            if (!error) {
                github.profile = result;
                github.username = result.login;
                github.repo = github.github.getRepo(github.username, github.repoName);
                console.log(result);
            }

            if (cb) {
                cb(error, result, request);
            }
        });
    }
    // 获得原始github
    github.getGitHub = function () {
        return github.github;
    }

    // 初始化
    github.init = function (auth, cb) {
        github.github = new GitHub(auth); // 创建github对象
        github.user = this.github.getUser();
        github.user.createRepo({
            "name": github.repoName,
            "description": "wikicraft data source repository",
        });

        github.getProfile(cb);
    }

    // 获得库
    github.getRepo = function (repo) {
        return github.github.getRepo(github.username, repo);
    }

    // 上传图片 图片默认都放在根目录下的images目录下
    github.uploadImage = function (filename, content, cb) {
        var repo = github.getRepo("wikicraftDataSource");
        if (filename[0] == '/') {
            filename = 'images' + filename;
        } else {
            filename = "images/" + filename;
        }

        repo.writeFile('master', filename, content, "upload image: " + filename, {}, function (error, result, request) {
            console.log("--------------------");
            cb && cb(error, result, request);
        });
    }

    // 保存文件
    github.saveFile = function (path, content, message, cb) {
        //github.repo.writeFile('master', path, content, message, {}, cb);
        var repo = github.getRepo("wikicraftDataSource");
        repo.writeFile('master', path, content, message, {}, function (error, result, request) {
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
        var repo = github.getRepo("wikicraftDataSource");
        repo.listCommits(options, cb);
    }
    
    github.getSingleCommit = function (sha, cb) {
        var repo = github.getRepo("wikicraftDataSource");
        repo.getSingleCommit(sha, cb);
    }

    // 获得filelist   非递归可能有bug 取决js异步对统一变量访问是否是隔离的
    github.getTree = function (treeSha, recursive, cb, out, level, prefix) {
        var repo = github.getRepo("wikicraftDataSource");
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

        repo.getTree(treeSha, function (error, result, request) {
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
        var repo = github.getRepo("wikicraftDataSource");
        repo.getContents(commitSha, path, true, function (error, result, request) {
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
        var repo = github.getRepo("wikicraftDataSource");
        repo.deleteFile('master', path, function (error, result, request) {
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
