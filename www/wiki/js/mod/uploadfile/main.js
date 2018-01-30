define([
		'app',
	   	'text!wikimod/uploadfile/uploadfile.html',
	   	'helper/dataSource'
], function (app, htmlContent,dataSource) {
    function uploadController(wikiBlock) {
    	app.registerController("fileControlleraa", function($scope,Account,gitlab) {
            $scope.imgsPath1 = config.wikiModPath + 'uploadfile/';
			//建立连接
			$scope.connect=(function(){
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
					var user = userinfo.username;
					//websocket通信
	                var ws = "ws://121.14.117.219/KnowledgeServer/websocket?username="+user;
	                var websocket = new WebSocket(ws);
	                websocket.onopen = function(evt) {
	                    // console.log("Connected to WebSocket server.");
	                };
	                websocket.onmessage = function(evt) {
	                    // console.log('Retrieved data from server: ' + evt.data);
	                    var content = evt.data;
			            var json = eval('(' + content + ')');//解析成json对象
			            //websocket连接成功
			            if(json.type == 0){
			                uploadFile(json.uid,user,filename1);
			            } 
			            //进度条
			            else if(json.type == 1) {
			            	var per = json.progress;
			            	$("#parent").show();
					        $("#son").html( per +"%" );
					        $("#son").css("width" , per +"%");
					        if(per == 100){
			                   $("#parent").hide();
			                   $('#btn-file').attr('disabled',false); 
			                   $("#btn-file").css("background-color" , "#337ab7");
					        }

			            }
			            //转换进度
	                    else if(json.type == 2) {
	                    	$("#images1").show();
	                    	$(".trip").show();
	                        $("#wait").html("");
	                        if(json.waitqueue == 0){
	                            $("#wait").append(
		                	    "<p style=\"color: red\">" + "正在转换最后一个,请不要关闭浏览器" + "</p>");
	                        } else {
	                            $("#wait").append(
		                	    "<p style=\"color: red\">" + "排队处理中 (前面还有"+ json.waitqueue + "个)：请不要关闭浏览器" + "</p>");
	                        }      
	                    }
	                    //转换完成后显示的内容
	                    else if(json.type == 3){
	                    	$("#wait").html("");
	                    	$("#images1").hide();
	                    	$(".trip").hide();
	                    	$(".select").html("");
	                    	$(".select").append(
	                                "<span class=\"all-select\">" + "全选" + "</span>" + "<input type=\"checkbox\" name=\"all\" id=\"inputCheck\">");
	                        $.each(json.filelist,function(i, item) {
		                    $(".select-file").append(
		                	        "<span class=\"content\">" + item.name + "</span>" + "<input class=\"tag\" type=\"checkbox\" name=\"Checkbox1\">" + 
		                	        "<span class=\"url\" style=\"display:none\">" + item.url + "</span>"+ "</br>");
	                        });

	                        $("#left").on("click",".content",function() {
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
	                }

	                websocket.onclose = function(evt) {
	                    // console.log("Disconnected");
	                };

	                websocket.onerror = function(evt) {
	                //   console.log('Error occured: ' + evt.data);
	                };
	            });
	            }
			});
            
            //上传文件
            function uploadFile(uid,user,filename1){ 
            	$.ajax({
		            url: "http://121.14.117.219/KnowledgeServer/api/fileImportMod/uploadCheck?uid="+uid+"&username="+user+"&filename="+filename1+"",
		            type: 'GET',
		            data: {},
		            processData: false,
		            contentType: false,
		            success: function(res) {
		                // console.log(res);
		                var obj = JSON.parse(res);
		                if (obj.code=="202")
		                    // console.log(obj.msg);
		                if (obj.code=="203")
		                    // console.log(obj.msg);
		                if (obj.code=="204") {
		                	// console.log(obj.msg);
		                    alert(obj.msg);
		                    $('#btn-file').attr('disabled',false); 
			                $("#btn-file").css("background-color","#337ab7");
			            }
		                if (obj.code=="200") {
		                    $.ajax({
		                        url: "http://121.14.117.219/KnowledgeServer/api/fileImportMod/fileUpload?uid="+uid+"&username="+user+"",
		                        type: 'POST',
		                        cache: false,
		                        dataType: "json",
		                        data: new FormData($('#form')[0]),
		                        processData: false,
		                        contentType: false,
		                        success: function(res) {
		                            // console.log(res);
		                        },
		                        error: function(msg) {
                                    alert("出错了，重新加载");
                                }
		                    });
		                } 
		            },
		            error: function(msg) {
                        alert("出错了，重新加载");
                    }
		        });
            }

            //将文件上传到gitlab
            $scope.uploadgitlab=(function(){ 
            	$("#uploadgite").html("");
            	Account.getUser(function(userinfo) {
	            	let count = 0;    //用来统计输出上传位置的个数
	            	let checkNum = 0; //用来统计选中的个数
	                let user = userinfo.username;
	                if (user == null) {
	                    alert("请先登录账户再操作！");
	                }
		            let node = document.getElementsByName("Checkbox1"); 
	                for(let i = 0;i < node.length; i++){
	                 	// console.log(i,node[i].checked);
		                if(node[i].checked){                     //选中的单选框
		                    let URL = node[i].nextSibling.innerHTML;  //获取URL 
		                    let pagename = getDataName(URL);
						 	let type = getFileName(URL); 
						 	let image = 1; 
						 	checkNum =  checkNum + 1;
						 	/*
		                       第一种：md文件的上传
						 	*/
						 	if (type == "md"){
						 	    let text = httpGet(URL);
		                        let filecontent = text;   //文件内容
			                    filecontent = Base64.encode(filecontent);
							    let filename = pagename;  //文件名
							    // console.log("md文件名："+filename);
							    let dsInst = dataSource.getDataSource(user);   //站点名留空
							    // console.log("需要上传的md文件："+dsInst);
							    dsInst.uploadFile({
							        path:filename,
							        content:filecontent,
							    }, function(download_url){
							    	// console.log("文件的下载地址：",download_url);
							  	    $scope.download_url = download_url;					 
									count = count+1;
									// console.log("输出标签的个数： "+count);
									/*$("#uploadgite").append(
				                	    "<li style=\"float :left;\">" + "<a class=\"link\" target=\"_blank\">" + download_url + "</a>" + "</li>");*/
									var num1 = download_url.lastIndexOf("/");
									var url = download_url.substr(0,num1);
									$("#uploadgite").html("");
									$("#uploadgite").append(
										"<li>" + "上传成功" + count + "个文件" + "</li>" +
										"<li>" + "上传位置: " + url);
									sleep(2000);
							    },function(){
							    	//失败重传
									for(let num=0;num<3;num++){
								    	dsInst.uploadFile({
									        path:filename,
									        content:filecontent,
									        }, function(download_url){
									    	    // console.log("这是失败进来的！")
									    	    // console.log("文件的下载地址：",download_url);
									  	        $scope.download_url = download_url;					 
											  	count = count+1;
											  	// console.log("输出标签的个数： "+count);
											  	/*$("#uploadgite").append(
						                	        "<li>" + "<a class=\"link\" target=\"_blank\">" + download_url + "</a>" + "</li>");*/
											  	var num1 = download_url.lastIndexOf("/");
												var url = download_url.substr(0,num1);
												$("#uploadgite").html("");
												$("#uploadgite").append(
													"<li>" + "上传成功" + count + "个文件" + "</li>" +
													"<li>" + "上传位置: " + url);
											  	sleep(2000);
											  	return;    //终止重传
									        },function(){
									        	sleep(1000);
				                                // console.log("重传次数: " + num);
									  	        // console.log("上传失败！");
									        }
									    );
								    } //end for() 循环   失败重传
								  	// console.log("上传失败！");
								});
						    }
		                    
		                    /*
		                       第二种:图像文件的上传
		                    */
						 	else if (type == "png" || type == "jpg" || type == "bmp" || type == "gif" || type == "jpeg" || type == "tiff" ) {
		                        let request = new XMLHttpRequest();
								request.open('GET', URL, true);
								request.responseType = 'blob';
							    request.onload = function() {
								    // console.log('request loaded.');
								    let reader = new FileReader();
								    // console.log('request.response',request.response);
								    reader.readAsDataURL(request.response);
		                            reader.onload =  function(e) {
								 	    // console.log('reader loaded.');
									    let num = e.target.result;
							            image = num;
							            let filecontent = image;   //文件内容
								        let filename = pagename;  //文件名
								        // console.log("图片文件名："+filename);
								        let dsInst = dataSource.getDataSource(user);   //站点名留空
								        // console.log("需要上传的图片："+dsInst);
								        dsInst.uploadFile({
								     		path:filename,
								     		content:filecontent,
								    	}, function(download_url){
								    		// console.log("文件的下载地址：",download_url);
								  	    	$scope.download_url = download_url;
								  	    	count = count+1;
								  	    	// console.log("输出标签的个数： "+count);
								  	        /*	$("#uploadgite").append(
			                	              	"<li>" + "<a class=\"link\" target=\"_blank\">" + download_url + "</a>" + "</li>");*/
								    	    var num1 = download_url.lastIndexOf("/");
											var url = download_url.substr(0,num1);
											$("#uploadgite").html("");
											$("#uploadgite").append(
												"<li>" + "上传成功" + count + "个文件" + "</li>" +
												"<li>" + "上传位置: " + url);
								    	         sleep(2000);
								    	},function(){
									        for(let num=0;num<3;num++){       //文件重传三次
									            dsInst.uploadFile({
										            path:filename,
								     		        content:filecontent,
										        }, function(download_url){
										    	    // console.log("这是失败进来的！")
								    		        // console.log("文件的下载地址：",download_url);
								  	    	        $scope.download_url = download_url;
								  	    	   	    count = count+1;
								  	    		    // console.log("输出标签的个数： "+count);
								  	       		    /*$("#uploadgite").append(
			                	              		    "<li style=\"float :left;\">" + "<a class=\"link\" target=\"_blank\">" + download_url + "</a>" + "</li>");*/
								  	       		    var num1 = download_url.lastIndexOf("/");
													var url = download_url.substr(0,num1);
													$("#uploadgite").html("");
													$("#uploadgite").append(
														"<li>" + "上传成功" + count + "个文件" + "</li>" +
														"<li>" + "上传位置: " + url);
								  	       		    sleep(2000);
								  	       		    return;
										        },function(){
										        	sleep(1000);
					                                // console.log("重传次数: " + num);
										  	        // console.log("上传失败！");
										        });    //end 失败重传
								  	    	    // console.log("上传失败！");
								  	        }        
								        });
		                            };
		                        };
								request.send();
		                    } else{
								// console.log('type err!' + type);
							} 
		                }//end if判断
		            }//end  for 循环
		            if(checkNum == 0){//选择个数为0的处理
		                alert("请先选中要上传的文件！"); //如果没有选中文件则弹出窗口提示
		            }
			    }); // end  getUser()
		    }); //end uploadgitlab()
            
            $(document).on('click','.link',function(){
				let url = $(this).html();
				$(".link").attr("href",url);
			});
			
            //返回获取到的md格式的数据
            function httpGet(theUrl) {
				if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
				    xmlhttp=new XMLHttpRequest();
				} else {// code for IE6, IE5
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

	        function getBase64FromImageUrl(url) {
		        let img = new Image();
		        img.setAttribute('crossOrigin', 'anonymous');
		        img.onload = function() {
		            let canvas = document.createElement("canvas");
		            canvas.width =this.width;
		            canvas.height =this.height;
		            let ctx = canvas.getContext("2d");
		            ctx.drawImage(this, 0, 0);
		            let dataURL = canvas.toDataURL("image/png");
		            // console.log("图像的文件流"+dataURL);
		            alert(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
		        };
		        img.src = url;
		        let output = document.getElementById("right");  
			    output.innerHTML = '<img style="padding: 0 10px;" width="400px" src="'+ img.src +'" />';
		    }

	        function getFileName(fileName){//通过第一种方式获取文件类型
		        let pos=fileName.lastIndexOf(".");//查找最后一个.位置
		        return fileName.substring(pos+1); //截取最后一个.位置到字符长度，也就是截取文件格式
		    }

		    function getDataName(fileName){//通过第一种方式获取文件名
		        let pos=fileName.lastIndexOf("/");//查找最后一个\的位置
		        return fileName.substring(pos+1); //截取最后一个\位置到字符长度，也就是截取文件名 
		    }

		    //线程睡眠
            function sleep(milliseconds) {
			    setTimeout(function(){
			        var start = new Date().getTime(); 
			        while ((new Date().getTime() - start) < milliseconds){
			             // Do nothing
			         //   console.log("我正在睡眠！");
			        }
			    },0);
			}
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


	/*$("#uploadgite").append(
		"<li>" + "<a class=\"link\" target=\"_blank\">" + download_url + "</a>" + "</li>");*/
