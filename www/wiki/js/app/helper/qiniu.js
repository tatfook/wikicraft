
define([
	"helper/util",
	'qiniu',
], function(util){

	var qiniu = {};
	
	qiniu.upload = function(opt) {
		opt = opt || {};

		if (config.wikiConfig.wikiEnv == "rls"){
			opt.domain = "oy41jt2uj.bkt.clouddn.com";
		} else {
			opt.domain = "oy41aju0m.bkt.clouddn.com";
		}
		var uploader = Qiniu.uploader({
			runtimes: opt.runtimes || 'html5,flash,html4',       // 上传模式，依次退化
			container: opt.container /*|| 'container'*/,             // 上传区域DOM ID，默认是browse_button的父元素
			browse_button: opt.browse_button || 'browse_button', // 上传选择的点选按钮，必需
			drop_element: opt.drop_element /* || 'drop_element'*/,    // 拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
			                                                     // uptoken:"LYZsjH0681n9sWZqCM4E2KmU6DsJOE7CAM4O3eJq:zIm-Yrq9OnJP4PaiIIjR6h-TUIk=:eyJzY29wZSI6ImtlZXB3b3JrIiwiZGVhZGxpbmUiOjE1MDQ1NjU4MjF9",
			uptoken_url: opt.uptoken_url || '/api/wiki/models/qiniu/uploadToken',
			get_new_uptoken: opt.get_new_uptoken || false,     // 设置上传文件的时候是否每次都重新获取新的uptoken
			                                                   // downtoken_url: '/downtoken',
			                                                   // Ajax请求downToken的Url，私有空间时使用，JS-SDK将向该地址POST文件的key和domain，服务端返回的JSON必须包含url字段，url值为该文件的下载地址
			unique_names: true,                                                                        // 默认false，key为文件名。若开启该选项，JS-SDK会为每个文件自动生成key（文件名）
			                                                   // save_key: true,                                                                            // 默认false。若在服务端生成uptoken的上传策略中指定了sava_key，则开启，SDK在前端将不对key进行任何处理
			domain: opt.domain,                                // bucket域名，下载资源时用到，必需
			max_file_size: opt.max_file_size || '100mb',       // 最大文件体积限制
			                                                   // flash_swf_url: 'path/of/plupload/Moxie.swf',                                               // 引入flash，相对路径
			max_retries: opt.max_retries || 3,                 // 上传失败最大重试次数
			dragdrop: opt.dragdrop || true,                    // 开启可拖曳上传
			chunk_size: opt.chunk_size || '4mb',               // 分块上传时，每块的体积
			auto_start: opt.auto_start,                // 选择文件后自动上传，若关闭需要自己绑定事件触发上传
			init: {
				'FilesAdded': function(up, files) {
					var self = this;
					// console.log(up);
					// console.log(files);
					var filelist = [];
					for (var i = 0; i < files.length; i++) {
						filelist.push(files[i].name)
					}
					util.post(config.apiUrlPrefix + "bigfile/getByFilenameList", {filelist:filelist}, function(data){
						// console.log(data);
						if (data.length) {
							// console.log("存在同名文件是否覆盖");
							return ;
						}
						self.start();
					});
				},
				'BeforeUpload': function(up, file) {
					// 每个文件上传前，处理相关的事情
				},
				'UploadProgress': function(up, file) {
					// 每个文件上传时，处理相关的事情
					//if (file.percent == 100) {
						//$scope.filelist[file.name] = file.name;
						//util.$apply();
					//}
				},
				'FileUploaded': function(up, file, response) {
					// console.log(response);
					// console.log(up);
					// console.log(file);

					var domain = up.getOption('domain');
					var info = JSON.parse(response.response);
					//var sourceLink = domain +"/"+ info.key; //获取上传成功后的文件的Url
					var hash = info.hash;

					var params = {
						filename:file.name,
						domain:domain,
						key:file.target_name,
						size:file.size,
						type:file.type,
						hash:info.hash,
						channel:"qiniu",
					}
	
					// console.log(params);
					//result.filename = info.key.replace(/\s/g, "");
					//console.log(sourceLink);
					util.post(config.apiUrlPrefix + 'bigfile/upload', params,	function(data){
						data = data || {};
						data.filename = params.filename;
						// console.log(data);
						opt.success && opt.success(data);
					}, function(){
						util.post(config.apiUrlPrefix + "qiniu/deleteFile", {
							key:params.key,
						});
					});
				},
				'Error': function(up, err, errTip) {
					//上传出错时，处理相关的事情
					opt.failed && opt.failed();
				},
				'UploadComplete': function() {
					//队列文件处理完毕后，处理相关的事情
				},
			}
		});

	}


	return qiniu;
});

