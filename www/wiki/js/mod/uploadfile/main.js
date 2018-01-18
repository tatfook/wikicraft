define([
		'app',
	   	'text!wikimod/uploadfile/uploadfile.html',
	   	'helper/dataSource'
], function (app, htmlContent,dataSource) {
    function uploadController(wikiBlock) {
        app.registerController("fileUploadController", function($scope,Account,gitlab) {
            $scope.imgsPath1 = config.wikiModPath + 'uploadfile/';
            
            var server_host = "120.132.120.168";
            var server_port = 80;
            var server_name = "ConverterServer";

            $scope.fileCheckAndUpload = (function(){
                var file = $('#file')[0].files[0];
                var fileReader = new FileReader(),   
                blobSlice = File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice,  
                chunkSize = 2097152,  
                // read in chunks of 2MB  
                chunks = Math.ceil(file.size / chunkSize),  
                currentChunk = 0,  
                spark = new SparkMD5();  
              
                fileReader.onload = function(e) {
                    console.log("read chunk nr", currentChunk + 1, "of", chunks);  
                    spark.appendBinary(e.target.result); // append binary string  
                    currentChunk++;  
              
                    if (currentChunk < chunks) {  
                        loadNext();  
                    }  
                    else {  
                        var md5 = spark.end();
                        console.log("finished loading");   
                        console.info("computed hash", md5); // compute hash
                        
                        checkAndUpload(md5);
                    }  
                };  
              
                function loadNext() {  
                    var start = currentChunk * chunkSize,  
                        end = start + chunkSize >= file.size ? file.size : start + chunkSize;  

                    fileReader.readAsBinaryString(blobSlice.call(file, start, end));  
                };  
              
                loadNext(); 
            });
            
            /**
             * 文档检查及上传
             */
            function checkAndUpload(md5) {
                Account.getUser(function(userinfo) {
                    var username = userinfo.username;
                    $.ajax({
                        url: 'http://'+server_host+':'+server_port+'/'+server_name+'/file/check',
                        type: 'GET',
                        data: {
                            username: username,
                            md5: md5
                        },
                        contentType: false,
                        dataType: 'json',
                        success: function(res) {
                            switch(res.code) {
                                case 103:  //原始文件已存在，直接返回结果
                                    getResult(md5);
                                    break;
                                case 104:  //原始文件不存在，开始上传
                                    fileUpload(md5);
                                    break;
                                case 105:  //用户文件已存在
                                    alert("您已上传过此文档");
                                    break;
                            }
                        }
                    });
                });
            }
            
            /**
             * 获取已存在文档转换结果
             */
            function getResult(md5) {
                Account.getUser(function(userinfo) {
                    var username = userinfo.username;
                    var filename = $('#file')[0].files[0].name;
                    $.ajax({
                        url: 'http://'+server_host+':'+server_port+'/'+server_name+'/file/result',
                        type: 'GET',
                        data: {
                            username: username,
                            filename: filename,
                            md5: md5,
                            usersource: 'keepwork',
                            cate_id: 0
                        },
                        contentType: false,
                        dataType: 'json',
                        success: function(res) {
                            console.log(res);
                            switch(res.code) {
                                case 106:
                                    break;
                                case 200:
                                    showResult(res.imgList, res.mdList);
                                    break;
                            }
                        }
                    });
                    $("#images1").show();
                    $(".trip").show();
                    $("#wait").html("");
                });
                
            }
            
            /**
             * 建立websocket连接并上传文档
             */
            function fileUpload(md5) {
                var file = $("#file").val();
                var pos=file.lastIndexOf("\\");
                var filename1 = file.substring(pos+1); 
                var type1 = file.lastIndexOf(".");
                var type2 = file.substring(type1+1);
                if(file == "") {
                    alert("请选择要转换的文件");
                    return;
                } else if(type2 !="doc" && type2 !="docx" && type2 !="ppt" && type2 !="pptx" && type2 !="pdf" && type2 !="html" && type2 !="htm" && type2 !="txt") {
                    alert("当前只支持.doc/.docx/.ppt/.pptx/.pdf/.html/.htm/.txt类型文件！");
                    return;
                } else {
                    Account.getUser(function(userinfo) {
                        $('#btn-file').attr('disabled',true); 
                        $("#btn-file").css("background-color" , "#ccc");
                        var username = userinfo.username;
                        var wsServer = 'ws://'+server_host+':'+server_port+'/'+server_name+'/websocket?username='+username;
                        var websocket = new WebSocket(wsServer);
                        websocket.onopen = function (evt) { onOpen(evt) };
                        websocket.onclose = function (evt) { onClose(evt) };
                        websocket.onmessage = function (evt) { onMessage(evt) };
                        websocket.onerror = function (evt) { onError(evt) };
                        function onOpen(evt) {
                            console.log("WebSocket: Connected");
                        }
                        function onClose(evt) {
                            console.log("WebSocket: Disconnected");
                        }
                        function onMessage(evt) {
                            console.log('WebSocket recv: ' + evt.data);
                            var obj = JSON.parse(evt.data);
                            switch (obj.code) {
                                case 0:  // websocket连接成功
                                    uploadFile(md5, obj.uid);
                                    break;
                                case 1:  // 进度
                                    var per = obj.progress;
                                    $("#parent").show();
                                    $("#son").html( per +"%" );
                                    $("#son").css("width" , per +"%");
                                    if(per == 100){
                                       $("#parent").hide();
                                       $('#btn-file').attr('disabled',false); 
                                       $("#btn-file").css("background-color" , "#337ab7");
                                    }
                                    break;
                                case 2:  // 速度
                                    break;
                                case 3:  // 排队
                                    $("#images1").show();
                                    $(".trip").show();
                                    $("#wait").html("");
                                    if(obj.waitqueue == 0){
                                        $("#wait").append(
                                        "<p style=\"color: red\">" + "正在转换最后一个,请不要关闭浏览器" + "</p>");
                                    } else {
                                        $("#wait").append(
                                        "<p style=\"color: red\">" + "排队处理中 (前面还有"+ obj.waitqueue + "个)：请不要关闭浏览器" + "</p>");
                                    } 
                                    break;
                                case 4:  // 开始转换
                                    break;
                                case 5:  // 转换成功
                                    showResult(obj.imgList, obj.mdList);
                                    break;
                                case 6:  // 转换失败
                                    break;
                                case 7:  // 保存成功
                                    break;
                            }
                        }
                        function onError(evt) {
                            console.log('WebSocket Error: ' + evt.data);
                        }
                    });
                }
            }
            
            /**
             * ajax文档上传
             */
            function uploadFile(md5, uid) {
                Account.getUser(function(userinfo) {
                    var username = userinfo.username;
                    $.ajax({
                        url: 'http://'+server_host+':'+server_port+'/'+server_name+'/file/upload?username='+username+'&md5='+md5+'&uid='+uid+'&cate_id=0',
                        type: 'POST',
                        dataType: 'json',
                        cache: false,
                        data: new FormData($('#form')[0]),
                        processData: false,
                        contentType: false,
                        success: function(res) {
                            console.log(res);
                        },
                        error: function(msg) {
                            alert("出错了，重新加载");
                        }
                    });
                });
            }
            
            function showResult(imgList, mdList) {
                $("#wait").html("");
                $("#images1").hide();
                $(".trip").hide();
                $(".select").html("");
                $(".select").append(
                        "<span class=\"all-select\">" + "全选" + "</span>" + "<input type=\"checkbox\" name=\"all\" id=\"inputCheck\">");
                //转换后的图片添加到左侧列表
                $.each(imgList,function(i, item) {
                $(".select-file").append(
                        "<span class=\"contentName\">" + item.name + "</span>" + "<input class=\"tag\" type=\"checkbox\" name=\"Checkbox1\">" + 
                        "<span class=\"url\" style=\"display:none\">" + item.url + "</span>"+ "</br>");
                });

                var lenPage=mdList.length;

                //转换后的md文件添加到左侧列表
                $.each(mdList,function(i, item) {
                $(".select-file").append(
                        "<span class=\"contentName\">" + item.name + "</span>" + "<input class=\"tag\" type=\"checkbox\" name=\"Checkbox1\">" + 
                        "<span class=\"url\" style=\"display:none\">" + item.url + "</span>"+ "<span style=\"display:none\">" + lenPage + "</span>"  + "<span style=\"display:none\">" + item.page + "</span>" + "</br>");
                });

                //点击左侧列表，在右侧渲染
                $("#left").on("click",".contentName",function() {
                    $(this).addClass("current").siblings().removeClass("current");
                    var url=$(this).next().next().html();
                    $('#iframe').attr("src",url);
                });	

                $(".select").on("click","#inputCheck",function() {
                    $("input[name='Checkbox1']").prop("checked", this.checked);
                });

                $("#left").on("click","input[name='Checkbox1']",function(){
                    var $subs = $("input[name='Checkbox1']");  
                    $("#inputCheck").prop("checked" , $subs.length == $subs.filter(":checked").length ? true :false);  
                });
            }

            //将文件上传到gitlab
            let count = 0;//上传成功的个数
            $scope.uploadgitlab=(function(){ 
                count=0;
            	$("#uploadgite").html("");
            	Account.getUser(function(userinfo) {
	            	//用来统计选中的个数  
	            	let checkNum = 0;
	                let user = userinfo.username;
	                if (user == null) {
	                    alert("请先登录账户再操作！");
	                }
		            let node = document.getElementsByName("Checkbox1"); 
	                for(let i = 0;i < node.length; i++){
	                	//选中的单选框
		                if(node[i].checked){  
		                    //获取URL                   
		                    let URL = node[i].nextSibling.innerHTML; 
		                    let pagename = getDataName(URL);
						 	let type = getFileName(URL); 
						 	let image = 1; 
						 	checkNum =  checkNum + 1;
						 	/*
		                       第一种：md文件的上传
						 	*/
						 	if (type == "md"){
						 	    let text = httpGet(URL); 
                                var pageTotal = node[i].nextSibling.nextSibling.innerHTML; 
                                var page=node[i].nextSibling.nextSibling.nextSibling.innerHTML; 
                                var pageContent="<br/><br/><hr/>";  
                                var posIndex=pagename.indexOf("（");
                                var pages=pagename.substring(0,posIndex); 
                                //添加分页到gitlab
                                for(var m=1; m<=pageTotal; m++) {
                                    url="http://git.keepwork.com/gitlab_www_" + user + "/keepworkdatasource/blob/master/" + user +"_files/" + pages + "（第" + m + "页）.md";
                                    if(page == m) {
                                        continue;
                                    }
                                    pageContent += '[第' + m + '页](' + url + ')   ';
                                }                           
                                //文件内容
		                        let filecontent = text + pageContent; 
			                    filecontent = Base64.encode(filecontent);
			                    //文件名
							    let filename = pagename; 
							    //站点名留空
							    let dsInst = dataSource.getDataSource(user);
	                            uploading(filecontent,dsInst,filename);
						    }
		                    
		                    /*
		                       第二种:图像文件的上传
		                    */
						 	else if (type == "png" || type == "jpg" || type == "bmp" || type == "gif" || type == "jpeg" || type == "tiff" ) {
		                        let request = new XMLHttpRequest();
								request.open('GET', URL, true);
								request.responseType = 'blob';
							    request.onload = function() {
								    let reader = new FileReader();
								    reader.readAsDataURL(request.response);
		                            reader.onload =  function(e) {
									    let num = e.target.result;
							            image = num;
							            let filecontent = image;   
								        let filename = pagename;  
								        let dsInst = dataSource.getDataSource(user);  
								        uploading(filecontent,dsInst,filename);
		                            };
		                        };
								request.send();
		                    } else{
								//console.log('type err!' + type);
							} 
		                }
		            }
		            if(checkNum == 0){
		            	//如果没有选中文件则弹出窗口提示
		                alert("请先选中要上传的文件！");
		            }
			    });              
		    });           

			//获取md格式的数据
            function httpGet(theUrl) {
				if (window.XMLHttpRequest) {
					// code for IE7+, Firefox, Chrome, Opera, Safari
				    xmlhttp=new XMLHttpRequest();
				} else {
					// code for IE6, IE5
				    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
				}
				xmlhttp.onreadystatechange=function() {
				    if (xmlhttp.readyState==4 && xmlhttp.status==200) {
				    	returnHtml = xmlhttp.responseText;
				        return xmlhttp.responseText;
				    }
				}
				xmlhttp.open("GET", theUrl, false );
				xmlhttp.send(); 
				return returnHtml; 
			}

            //上传文件到gitlab函数
			function uploading(filecontent,dsInst,filename) {
                dsInst.uploadFile({
		            path:filename,
		            content:filecontent,
		        }, function(download_url) {
		    	    console.log("文件的下载地址：",download_url);
		  	        $scope.download_url = download_url;
				    count = count+1;
				    console.log("上传成功个数： "+count);
				    var num1 = download_url.lastIndexOf("/");
				    var url = download_url.substr(0,num1);
				    $("#uploadgite").html("");
				    $("#uploadgite").append(
					    "<li>" + "上传成功" + count + "个文件" + "</li>" +
					    "<li>" + "上传位置: " + url);
		        },function(){
			  	    uploading(filecontent,dsInst,filename);
			    });
			}

            //获取文件类型
	        function getFileName(fileName){
		        let pos=fileName.lastIndexOf(".");//查找最后一个.位置
		        return fileName.substring(pos+1); //截取最后一个.位置到字符长度，也就是截取文件格式
		    }

            //获取文件名
		    function getDataName(fileName){
		        let pos=fileName.lastIndexOf("/");//查找最后一个\的位置
		        return fileName.substring(pos+1); //截取最后一个\位置到字符长度，也就是截取文件名 
		    }
            

            /*
             * Fastest md5 implementation around (JKM md5).
             * Credits: Joseph Myers
             *
             * @see http://www.myersdaily.org/joseph/javascript/md5-text.html
             * @see http://jsperf.com/md5-shootout/7
             */

            /* this function is much faster,
              so if possible we use it. Some IEs
              are the only ones I know of that
              need the idiotic second function,
              generated by an if clause.  */
            var add32 = function (a, b) {
                return (a + b) & 0xFFFFFFFF;
            },
                hex_chr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];


            function cmn(q, a, b, x, s, t) {
                a = add32(add32(a, q), add32(x, t));
                return add32((a << s) | (a >>> (32 - s)), b);
            }

            function md5cycle(x, k) {
                var a = x[0],
                    b = x[1],
                    c = x[2],
                    d = x[3];

                a += (b & c | ~b & d) + k[0] - 680876936 | 0;
                a  = (a << 7 | a >>> 25) + b | 0;
                d += (a & b | ~a & c) + k[1] - 389564586 | 0;
                d  = (d << 12 | d >>> 20) + a | 0;
                c += (d & a | ~d & b) + k[2] + 606105819 | 0;
                c  = (c << 17 | c >>> 15) + d | 0;
                b += (c & d | ~c & a) + k[3] - 1044525330 | 0;
                b  = (b << 22 | b >>> 10) + c | 0;
                a += (b & c | ~b & d) + k[4] - 176418897 | 0;
                a  = (a << 7 | a >>> 25) + b | 0;
                d += (a & b | ~a & c) + k[5] + 1200080426 | 0;
                d  = (d << 12 | d >>> 20) + a | 0;
                c += (d & a | ~d & b) + k[6] - 1473231341 | 0;
                c  = (c << 17 | c >>> 15) + d | 0;
                b += (c & d | ~c & a) + k[7] - 45705983 | 0;
                b  = (b << 22 | b >>> 10) + c | 0;
                a += (b & c | ~b & d) + k[8] + 1770035416 | 0;
                a  = (a << 7 | a >>> 25) + b | 0;
                d += (a & b | ~a & c) + k[9] - 1958414417 | 0;
                d  = (d << 12 | d >>> 20) + a | 0;
                c += (d & a | ~d & b) + k[10] - 42063 | 0;
                c  = (c << 17 | c >>> 15) + d | 0;
                b += (c & d | ~c & a) + k[11] - 1990404162 | 0;
                b  = (b << 22 | b >>> 10) + c | 0;
                a += (b & c | ~b & d) + k[12] + 1804603682 | 0;
                a  = (a << 7 | a >>> 25) + b | 0;
                d += (a & b | ~a & c) + k[13] - 40341101 | 0;
                d  = (d << 12 | d >>> 20) + a | 0;
                c += (d & a | ~d & b) + k[14] - 1502002290 | 0;
                c  = (c << 17 | c >>> 15) + d | 0;
                b += (c & d | ~c & a) + k[15] + 1236535329 | 0;
                b  = (b << 22 | b >>> 10) + c | 0;

                a += (b & d | c & ~d) + k[1] - 165796510 | 0;
                a  = (a << 5 | a >>> 27) + b | 0;
                d += (a & c | b & ~c) + k[6] - 1069501632 | 0;
                d  = (d << 9 | d >>> 23) + a | 0;
                c += (d & b | a & ~b) + k[11] + 643717713 | 0;
                c  = (c << 14 | c >>> 18) + d | 0;
                b += (c & a | d & ~a) + k[0] - 373897302 | 0;
                b  = (b << 20 | b >>> 12) + c | 0;
                a += (b & d | c & ~d) + k[5] - 701558691 | 0;
                a  = (a << 5 | a >>> 27) + b | 0;
                d += (a & c | b & ~c) + k[10] + 38016083 | 0;
                d  = (d << 9 | d >>> 23) + a | 0;
                c += (d & b | a & ~b) + k[15] - 660478335 | 0;
                c  = (c << 14 | c >>> 18) + d | 0;
                b += (c & a | d & ~a) + k[4] - 405537848 | 0;
                b  = (b << 20 | b >>> 12) + c | 0;
                a += (b & d | c & ~d) + k[9] + 568446438 | 0;
                a  = (a << 5 | a >>> 27) + b | 0;
                d += (a & c | b & ~c) + k[14] - 1019803690 | 0;
                d  = (d << 9 | d >>> 23) + a | 0;
                c += (d & b | a & ~b) + k[3] - 187363961 | 0;
                c  = (c << 14 | c >>> 18) + d | 0;
                b += (c & a | d & ~a) + k[8] + 1163531501 | 0;
                b  = (b << 20 | b >>> 12) + c | 0;
                a += (b & d | c & ~d) + k[13] - 1444681467 | 0;
                a  = (a << 5 | a >>> 27) + b | 0;
                d += (a & c | b & ~c) + k[2] - 51403784 | 0;
                d  = (d << 9 | d >>> 23) + a | 0;
                c += (d & b | a & ~b) + k[7] + 1735328473 | 0;
                c  = (c << 14 | c >>> 18) + d | 0;
                b += (c & a | d & ~a) + k[12] - 1926607734 | 0;
                b  = (b << 20 | b >>> 12) + c | 0;

                a += (b ^ c ^ d) + k[5] - 378558 | 0;
                a  = (a << 4 | a >>> 28) + b | 0;
                d += (a ^ b ^ c) + k[8] - 2022574463 | 0;
                d  = (d << 11 | d >>> 21) + a | 0;
                c += (d ^ a ^ b) + k[11] + 1839030562 | 0;
                c  = (c << 16 | c >>> 16) + d | 0;
                b += (c ^ d ^ a) + k[14] - 35309556 | 0;
                b  = (b << 23 | b >>> 9) + c | 0;
                a += (b ^ c ^ d) + k[1] - 1530992060 | 0;
                a  = (a << 4 | a >>> 28) + b | 0;
                d += (a ^ b ^ c) + k[4] + 1272893353 | 0;
                d  = (d << 11 | d >>> 21) + a | 0;
                c += (d ^ a ^ b) + k[7] - 155497632 | 0;
                c  = (c << 16 | c >>> 16) + d | 0;
                b += (c ^ d ^ a) + k[10] - 1094730640 | 0;
                b  = (b << 23 | b >>> 9) + c | 0;
                a += (b ^ c ^ d) + k[13] + 681279174 | 0;
                a  = (a << 4 | a >>> 28) + b | 0;
                d += (a ^ b ^ c) + k[0] - 358537222 | 0;
                d  = (d << 11 | d >>> 21) + a | 0;
                c += (d ^ a ^ b) + k[3] - 722521979 | 0;
                c  = (c << 16 | c >>> 16) + d | 0;
                b += (c ^ d ^ a) + k[6] + 76029189 | 0;
                b  = (b << 23 | b >>> 9) + c | 0;
                a += (b ^ c ^ d) + k[9] - 640364487 | 0;
                a  = (a << 4 | a >>> 28) + b | 0;
                d += (a ^ b ^ c) + k[12] - 421815835 | 0;
                d  = (d << 11 | d >>> 21) + a | 0;
                c += (d ^ a ^ b) + k[15] + 530742520 | 0;
                c  = (c << 16 | c >>> 16) + d | 0;
                b += (c ^ d ^ a) + k[2] - 995338651 | 0;
                b  = (b << 23 | b >>> 9) + c | 0;

                a += (c ^ (b | ~d)) + k[0] - 198630844 | 0;
                a  = (a << 6 | a >>> 26) + b | 0;
                d += (b ^ (a | ~c)) + k[7] + 1126891415 | 0;
                d  = (d << 10 | d >>> 22) + a | 0;
                c += (a ^ (d | ~b)) + k[14] - 1416354905 | 0;
                c  = (c << 15 | c >>> 17) + d | 0;
                b += (d ^ (c | ~a)) + k[5] - 57434055 | 0;
                b  = (b << 21 |b >>> 11) + c | 0;
                a += (c ^ (b | ~d)) + k[12] + 1700485571 | 0;
                a  = (a << 6 | a >>> 26) + b | 0;
                d += (b ^ (a | ~c)) + k[3] - 1894986606 | 0;
                d  = (d << 10 | d >>> 22) + a | 0;
                c += (a ^ (d | ~b)) + k[10] - 1051523 | 0;
                c  = (c << 15 | c >>> 17) + d | 0;
                b += (d ^ (c | ~a)) + k[1] - 2054922799 | 0;
                b  = (b << 21 |b >>> 11) + c | 0;
                a += (c ^ (b | ~d)) + k[8] + 1873313359 | 0;
                a  = (a << 6 | a >>> 26) + b | 0;
                d += (b ^ (a | ~c)) + k[15] - 30611744 | 0;
                d  = (d << 10 | d >>> 22) + a | 0;
                c += (a ^ (d | ~b)) + k[6] - 1560198380 | 0;
                c  = (c << 15 | c >>> 17) + d | 0;
                b += (d ^ (c | ~a)) + k[13] + 1309151649 | 0;
                b  = (b << 21 |b >>> 11) + c | 0;
                a += (c ^ (b | ~d)) + k[4] - 145523070 | 0;
                a  = (a << 6 | a >>> 26) + b | 0;
                d += (b ^ (a | ~c)) + k[11] - 1120210379 | 0;
                d  = (d << 10 | d >>> 22) + a | 0;
                c += (a ^ (d | ~b)) + k[2] + 718787259 | 0;
                c  = (c << 15 | c >>> 17) + d | 0;
                b += (d ^ (c | ~a)) + k[9] - 343485551 | 0;
                b  = (b << 21 | b >>> 11) + c | 0;

                x[0] = a + x[0] | 0;
                x[1] = b + x[1] | 0;
                x[2] = c + x[2] | 0;
                x[3] = d + x[3] | 0;
            }

            function md5blk(s) {
                var md5blks = [],
                    i; /* Andy King said do it this way. */

                for (i = 0; i < 64; i += 4) {
                    md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
                }
                return md5blks;
            }

            function md5blk_array(a) {
                var md5blks = [],
                    i; /* Andy King said do it this way. */

                for (i = 0; i < 64; i += 4) {
                    md5blks[i >> 2] = a[i] + (a[i + 1] << 8) + (a[i + 2] << 16) + (a[i + 3] << 24);
                }
                return md5blks;
            }

            function md51(s) {
                var n = s.length,
                    state = [1732584193, -271733879, -1732584194, 271733878],
                    i,
                    length,
                    tail,
                    tmp,
                    lo,
                    hi;

                for (i = 64; i <= n; i += 64) {
                    md5cycle(state, md5blk(s.substring(i - 64, i)));
                }
                s = s.substring(i - 64);
                length = s.length;
                tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                for (i = 0; i < length; i += 1) {
                    tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
                }
                tail[i >> 2] |= 0x80 << ((i % 4) << 3);
                if (i > 55) {
                    md5cycle(state, tail);
                    for (i = 0; i < 16; i += 1) {
                        tail[i] = 0;
                    }
                }

                // Beware that the final length might not fit in 32 bits so we take care of that
                tmp = n * 8;
                tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
                lo = parseInt(tmp[2], 16);
                hi = parseInt(tmp[1], 16) || 0;

                tail[14] = lo;
                tail[15] = hi;

                md5cycle(state, tail);
                return state;
            }

            function md51_array(a) {
                var n = a.length,
                    state = [1732584193, -271733879, -1732584194, 271733878],
                    i,
                    length,
                    tail,
                    tmp,
                    lo,
                    hi;

                for (i = 64; i <= n; i += 64) {
                    md5cycle(state, md5blk_array(a.subarray(i - 64, i)));
                }

                // Not sure if it is a bug, however IE10 will always produce a sub array of length 1
                // containing the last element of the parent array if the sub array specified starts
                // beyond the length of the parent array - weird.
                // https://connect.microsoft.com/IE/feedback/details/771452/typed-array-subarray-issue
                a = (i - 64) < n ? a.subarray(i - 64) : new Uint8Array(0);

                length = a.length;
                tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                for (i = 0; i < length; i += 1) {
                    tail[i >> 2] |= a[i] << ((i % 4) << 3);
                }

                tail[i >> 2] |= 0x80 << ((i % 4) << 3);
                if (i > 55) {
                    md5cycle(state, tail);
                    for (i = 0; i < 16; i += 1) {
                        tail[i] = 0;
                    }
                }

                // Beware that the final length might not fit in 32 bits so we take care of that
                tmp = n * 8;
                tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
                lo = parseInt(tmp[2], 16);
                hi = parseInt(tmp[1], 16) || 0;

                tail[14] = lo;
                tail[15] = hi;

                md5cycle(state, tail);

                return state;
            }

            function rhex(n) {
                var s = '',
                    j;
                for (j = 0; j < 4; j += 1) {
                    s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
                }
                return s;
            }

            function hex(x) {
                var i;
                for (i = 0; i < x.length; i += 1) {
                    x[i] = rhex(x[i]);
                }
                return x.join('');
            }

            // In some cases the fast add32 function cannot be used..
            if (hex(md51('hello')) !== '5d41402abc4b2a76b9719d911017c592') {
                add32 = function (x, y) {
                    var lsw = (x & 0xFFFF) + (y & 0xFFFF),
                        msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                    return (msw << 16) | (lsw & 0xFFFF);
                };
            }

            // ---------------------------------------------------

            /**
             * ArrayBuffer slice polyfill.
             *
             * @see https://github.com/ttaubert/node-arraybuffer-slice
             */

            if (typeof ArrayBuffer !== 'undefined' && !ArrayBuffer.prototype.slice) {
                (function () {
                    function clamp(val, length) {
                        val = (val | 0) || 0;

                        if (val < 0) {
                            return Math.max(val + length, 0);
                        }

                        return Math.min(val, length);
                    }

                    ArrayBuffer.prototype.slice = function (from, to) {
                        var length = this.byteLength,
                            begin = clamp(from, length),
                            end = length,
                            num,
                            target,
                            targetArray,
                            sourceArray;

                        if (to !== undefined) {
                            end = clamp(to, length);
                        }

                        if (begin > end) {
                            return new ArrayBuffer(0);
                        }

                        num = end - begin;
                        target = new ArrayBuffer(num);
                        targetArray = new Uint8Array(target);

                        sourceArray = new Uint8Array(this, begin, num);
                        targetArray.set(sourceArray);

                        return target;
                    };
                })();
            }

            // ---------------------------------------------------

            /**
             * Helpers.
             */

            function toUtf8(str) {
                if (/[\u0080-\uFFFF]/.test(str)) {
                    str = unescape(encodeURIComponent(str));
                }

                return str;
            }

            function utf8Str2ArrayBuffer(str, returnUInt8Array) {
                var length = str.length,
                   buff = new ArrayBuffer(length),
                   arr = new Uint8Array(buff),
                   i;

                for (i = 0; i < length; i += 1) {
                    arr[i] = str.charCodeAt(i);
                }

                return returnUInt8Array ? arr : buff;
            }

            function arrayBuffer2Utf8Str(buff) {
                return String.fromCharCode.apply(null, new Uint8Array(buff));
            }

            function concatenateArrayBuffers(first, second, returnUInt8Array) {
                var result = new Uint8Array(first.byteLength + second.byteLength);

                result.set(new Uint8Array(first));
                result.set(new Uint8Array(second), first.byteLength);

                return returnUInt8Array ? result : result.buffer;
            }

            function hexToBinaryString(hex) {
                var bytes = [],
                    length = hex.length,
                    x;

                for (x = 0; x < length - 1; x += 2) {
                    bytes.push(parseInt(hex.substr(x, 2), 16));
                }

                return String.fromCharCode.apply(String, bytes);
            }

            // ---------------------------------------------------

            /**
             * SparkMD5 OOP implementation.
             *
             * Use this class to perform an incremental md5, otherwise use the
             * static methods instead.
             */

            function SparkMD5() {
                // call reset to init the instance
                this.reset();
            }

            /**
             * Appends a string.
             * A conversion will be applied if an utf8 string is detected.
             *
             * @param {String} str The string to be appended
             *
             * @return {SparkMD5} The instance itself
             */
            SparkMD5.prototype.append = function (str) {
                // Converts the string to utf8 bytes if necessary
                // Then append as binary
                this.appendBinary(toUtf8(str));

                return this;
            };

            /**
             * Appends a binary string.
             *
             * @param {String} contents The binary string to be appended
             *
             * @return {SparkMD5} The instance itself
             */
            SparkMD5.prototype.appendBinary = function (contents) {
                this._buff += contents;
                this._length += contents.length;

                var length = this._buff.length,
                    i;

                for (i = 64; i <= length; i += 64) {
                    md5cycle(this._hash, md5blk(this._buff.substring(i - 64, i)));
                }

                this._buff = this._buff.substring(i - 64);

                return this;
            };

            /**
             * Finishes the incremental computation, reseting the internal state and
             * returning the result.
             *
             * @param {Boolean} raw True to get the raw string, false to get the hex string
             *
             * @return {String} The result
             */
            SparkMD5.prototype.end = function (raw) {
                var buff = this._buff,
                    length = buff.length,
                    i,
                    tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    ret;

                for (i = 0; i < length; i += 1) {
                    tail[i >> 2] |= buff.charCodeAt(i) << ((i % 4) << 3);
                }

                this._finish(tail, length);
                ret = hex(this._hash);

                if (raw) {
                    ret = hexToBinaryString(ret);
                }

                this.reset();

                return ret;
            };

            /**
             * Resets the internal state of the computation.
             *
             * @return {SparkMD5} The instance itself
             */
            SparkMD5.prototype.reset = function () {
                this._buff = '';
                this._length = 0;
                this._hash = [1732584193, -271733879, -1732584194, 271733878];

                return this;
            };

            /**
             * Gets the internal state of the computation.
             *
             * @return {Object} The state
             */
            SparkMD5.prototype.getState = function () {
                return {
                    buff: this._buff,
                    length: this._length,
                    hash: this._hash
                };
            };

            /**
             * Gets the internal state of the computation.
             *
             * @param {Object} state The state
             *
             * @return {SparkMD5} The instance itself
             */
            SparkMD5.prototype.setState = function (state) {
                this._buff = state.buff;
                this._length = state.length;
                this._hash = state.hash;

                return this;
            };

            /**
             * Releases memory used by the incremental buffer and other additional
             * resources. If you plan to use the instance again, use reset instead.
             */
            SparkMD5.prototype.destroy = function () {
                delete this._hash;
                delete this._buff;
                delete this._length;
            };

            /**
             * Finish the final calculation based on the tail.
             *
             * @param {Array}  tail   The tail (will be modified)
             * @param {Number} length The length of the remaining buffer
             */
            SparkMD5.prototype._finish = function (tail, length) {
                var i = length,
                    tmp,
                    lo,
                    hi;

                tail[i >> 2] |= 0x80 << ((i % 4) << 3);
                if (i > 55) {
                    md5cycle(this._hash, tail);
                    for (i = 0; i < 16; i += 1) {
                        tail[i] = 0;
                    }
                }

                // Do the final computation based on the tail and length
                // Beware that the final length may not fit in 32 bits so we take care of that
                tmp = this._length * 8;
                tmp = tmp.toString(16).match(/(.*?)(.{0,8})$/);
                lo = parseInt(tmp[2], 16);
                hi = parseInt(tmp[1], 16) || 0;

                tail[14] = lo;
                tail[15] = hi;
                md5cycle(this._hash, tail);
            };

            /**
             * Performs the md5 hash on a string.
             * A conversion will be applied if utf8 string is detected.
             *
             * @param {String}  str The string
             * @param {Boolean} [raw] True to get the raw string, false to get the hex string
             *
             * @return {String} The result
             */
            SparkMD5.hash = function (str, raw) {
                // Converts the string to utf8 bytes if necessary
                // Then compute it using the binary function
                return SparkMD5.hashBinary(toUtf8(str), raw);
            };

            /**
             * Performs the md5 hash on a binary string.
             *
             * @param {String}  content The binary string
             * @param {Boolean} [raw]     True to get the raw string, false to get the hex string
             *
             * @return {String} The result
             */
            SparkMD5.hashBinary = function (content, raw) {
                var hash = md51(content),
                    ret = hex(hash);

                return raw ? hexToBinaryString(ret) : ret;
            };

            // ---------------------------------------------------

            /**
             * SparkMD5 OOP implementation for array buffers.
             *
             * Use this class to perform an incremental md5 ONLY for array buffers.
             */
            SparkMD5.ArrayBuffer = function () {
                // call reset to init the instance
                this.reset();
            };

            /**
             * Appends an array buffer.
             *
             * @param {ArrayBuffer} arr The array to be appended
             *
             * @return {SparkMD5.ArrayBuffer} The instance itself
             */
            SparkMD5.ArrayBuffer.prototype.append = function (arr) {
                var buff = concatenateArrayBuffers(this._buff.buffer, arr, true),
                    length = buff.length,
                    i;

                this._length += arr.byteLength;

                for (i = 64; i <= length; i += 64) {
                    md5cycle(this._hash, md5blk_array(buff.subarray(i - 64, i)));
                }

                this._buff = (i - 64) < length ? new Uint8Array(buff.buffer.slice(i - 64)) : new Uint8Array(0);

                return this;
            };

            /**
             * Finishes the incremental computation, reseting the internal state and
             * returning the result.
             *
             * @param {Boolean} raw True to get the raw string, false to get the hex string
             *
             * @return {String} The result
             */
            SparkMD5.ArrayBuffer.prototype.end = function (raw) {
                var buff = this._buff,
                    length = buff.length,
                    tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    i,
                    ret;

                for (i = 0; i < length; i += 1) {
                    tail[i >> 2] |= buff[i] << ((i % 4) << 3);
                }

                this._finish(tail, length);
                ret = hex(this._hash);

                if (raw) {
                    ret = hexToBinaryString(ret);
                }

                this.reset();

                return ret;
            };

            /**
             * Resets the internal state of the computation.
             *
             * @return {SparkMD5.ArrayBuffer} The instance itself
             */
            SparkMD5.ArrayBuffer.prototype.reset = function () {
                this._buff = new Uint8Array(0);
                this._length = 0;
                this._hash = [1732584193, -271733879, -1732584194, 271733878];

                return this;
            };

            /**
             * Gets the internal state of the computation.
             *
             * @return {Object} The state
             */
            SparkMD5.ArrayBuffer.prototype.getState = function () {
                var state = SparkMD5.prototype.getState.call(this);

                // Convert buffer to a string
                state.buff = arrayBuffer2Utf8Str(state.buff);

                return state;
            };

            /**
             * Gets the internal state of the computation.
             *
             * @param {Object} state The state
             *
             * @return {SparkMD5.ArrayBuffer} The instance itself
             */
            SparkMD5.ArrayBuffer.prototype.setState = function (state) {
                // Convert string to buffer
                state.buff = utf8Str2ArrayBuffer(state.buff, true);

                return SparkMD5.prototype.setState.call(this, state);
            };

            SparkMD5.ArrayBuffer.prototype.destroy = SparkMD5.prototype.destroy;

            SparkMD5.ArrayBuffer.prototype._finish = SparkMD5.prototype._finish;

            /**
             * Performs the md5 hash on an array buffer.
             *
             * @param {ArrayBuffer} arr The array buffer
             * @param {Boolean}     [raw] True to get the raw string, false to get the hex one
             *
             * @return {String} The result
             */
            SparkMD5.ArrayBuffer.hash = function (arr, raw) {
                var hash = md51_array(new Uint8Array(arr)),
                    ret = hex(hash);

                return raw ? hexToBinaryString(ret) : ret;
            };
        });
    }
    
    // 返回模块对象
    return {
        render: function (wikiBlock) {
            uploadController(wikiBlock);
            return  htmlContent;       
        }
    };
});

