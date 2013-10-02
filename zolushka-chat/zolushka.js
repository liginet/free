$(function(){
$('head').append('<style>.messageBox,.Popup .notify,#help,#select,#run,#info,#black,#bp,#bm,#bpid{position:absolute}.Popup{height:75px;border-bottom:solid 1px #d8d8d8;position:fixed;left:0;right:250px;top:0;z-index:9999;background:#f7f7f7}.messageBox{left:0;top:4px;width:400px;padding:5px;background:#c0d7fd}.messageBox:hover{background:#b2c8ed}#textarea{margin:0;border:solid 1px #d8d8d8;font-family:arial;width:395px;height:100%}#help{top:5px;left:415px;width:30px;height:42px}#select{top:4px;left:450px}#run{top:25px;left:450px}#info{top:30px;left:500px;size:20px;font-weight:bold;display:none}#black{top:4px;left:680px}#bp{top:3px;left:865px}#bm{top:3px;left:840px}#bpid{top:3px;left:800px}.wlogo{position:absolute;right:10px;bottom:10px;font-size:23px;outline:0;text-decoration:none;color:#5685d6}.wlogo span{color:#666}.Popup .notify{border:solid 1px #e89b88;color:#000;background:#ffefe8;padding:3px;font-weight:bold;top:50px}</style>');
	$("body").prepend('<div class="Popup">\
		<a href="http://wmidbot.com" target="_blank" class="wlogo">FREE <span>BOT</span></a>\
		<div class="messageBox">\
			<textarea id="textarea" placeholder="Введите текст сообщения">Hi, {firstname}!</textarea>\
		</div>\
		<input type="button" id="help" value="?">\
		<input type="button" id="run" value="Пуск">\
		<select id="select"><option value="1">По списку онлайн (бесконечно)</option><option value="2">По не ответившим</option><option value="3">По активным диалогам</option></select>\
		<select id="black"><option value="0">Черный список</option></select><input type="button" id="bm" value="&minus;" title="Удалить" /><input type="button" id="bpid" value="+ID" title="Добавить по ID" /><input type="button" id="bp" value="+" title="Добавить" />\
		<span id="info"></span>\
	</div>');

	//BlackList
	var name=$("#myUN").val(),
		key="zolushka-"+name,
		UpdateBL=function()
		{
			var r="";
			$("#black option:gt(0)").each(function(){
				r+=$(this).val()+","+$(this).text()+"|";
			});

			try
			{
				localStorage.setItem(key,r.substring(0,r.length-1));
			}catch(e){}
		},
		blacks=localStorage.getItem(key);

	if(blacks)
		$.each(blacks.split("|"),function(k,v){
			v=v.split(",");
			$("<option>").text(v[1]).val(v[0]).appendTo("#black");
		});

	$("#bm").click(function(){
		$("#black option:selected").filter("[value!=0]").remove();
		UpdateBL();
	});

	$("#bpid").click(function(){
		var id=prompt("Введите ID мужика");
		if(id)
		{
			if($("#black option[value=\""+id+"\"]").size()==0)
				$("<option>").text(id).val(id).appendTo("#black");
			UpdateBL();
		}
	});

	$("#bp").click(function(){
		var text=$("#Chat_ClientPanel_TypeArea_Name").text(),
			m=$("#Chat_ClientPanel_TypeArea_ThumbnailIMG").prop("src").match(/\/(\d+)\//);

		if(text=="")
			alert("Веберите мужика с фоткой для начала чата и только потом жмите эту кнопку");
		else if(m)
		{
			if($("#black option[value="+m[1]+"]").size()==0)
				$("<option>").text(text).val(m[1]).appendTo("#black");
			UpdateBL();
		}
		else
			alert("В черный список возможно добавление мужиков только с фотками");
	});

	var to,//TimeOut object
		text="",//Text to send
		runned=false,//Flag whether spamming is run

		onlineexclude="",//Account numbers, where we have already sent text
		SendOnline=function()
		{
			if(text=="")
				return;

			while($("#Chat_SearchPanel_Pager_Previous").css("visibility")=="visible")
				$("#Chat_SearchPanel_Pager_Previous").click();

			var F=function()
			{
				var added=0;

				$("#Chat_SearchPanel_MemberCards").children().each(function(){
					if(!runned)
						return false;

					var mess=text,
						th=$(this),
						json=$.parseJSON(th.attr("data"));
					if(onlineexclude.indexOf(","+json.AccountNumber+",")==-1)
					{
						$.each(json,function(k,v){
							mess=mess.replace(new RegExp("{"+k+"}","ig"),v);
						});
						mess=mess.replace(/\{(Employment|Age|Country|Height|Weight)\}/ig,"");
						th.find(".membercard-chat").click();
						try
						{
							$("#Chat_ClientPanel_TypeArea_Message").val(mess).trigger("paste");
						}catch(e){};
						$("#Chat_ClientPanel_TypeArea_Submit").click();
						onlineexclude+=json.AccountNumber+",";
						added++;
					}
				});

				if(runned)
					if($("#Chat_SearchPanel_Pager_Next").css("visibility")=="visible")
					{
						$("#Chat_SearchPanel_Pager_Next").click();
						if(added<2)
							F();
						else
							setTimeout(F,2000);
					}
					else
						to=setTimeout(SendOnline,15000);
			};
			F();
		},
		GetOnlineExclude=function()
		{
			onlineexclude=",";
			$("#Chat_RightPanel_ChatList_FemaleRequests,#Chat_RightPanel_ChatList_FemaleSentChats,#Chat_RightPanel_ChatList_MaleSentChats,#Chat_RightPanel_ChatList_MaleRequests").children().each(function(){
				var json=$.parseJSON($(this).attr("data"));
				onlineexclude+=json.AccountNumber+",";
			});

			$("#black option:gt(0)").each(function(){
				onlineexclude+=$(this).val()+",";
			});
		},

		//Отправка по чат-листу
		//type: na - не ответившие, a - ответившие
		SendChatList=function(type)
		{
			var toids=$(type=="na" ? "#Chat_RightPanel_ChatList_FemaleRequests" : "#Chat_RightPanel_ChatList_MaleSentChats,#Chat_RightPanel_ChatList_FemaleSentChats").children(),
				cnt=toids.size(),
				sent=0,
				inf=$("#info"),
				to2,
				EndF=function()
				{
					clearTimeout(to2);
					if(cnt==sent)
					{
						alert("Рассылка завершена!");
						$("#run").click();
					}
					to2=setTimeout(function(){
						inf.hide()
					},2000);
				};

			if(toids.size()>0)
				inf.show().text("0 из "+cnt);
			toids.each(function(i){
				var th=$(this);
				setTimeout(function(){
					if(!runned)
						return false;

					var mess=text,
						json=$.parseJSON(th.attr("data"));
					$.each(json,function(k,v){
						mess=mess.replace(new RegExp("{"+k+"}","ig"),v);
					});
					mess=mess.replace(/\{(Employment|Age|Country|Height|Weight)\}/ig,"");
					th.click();
					$("#Chat_ClientPanel_TypeArea_Message").val(mess).trigger("paste");
					$("#Chat_ClientPanel_TypeArea_Submit").click();
					sent++;
					inf.text(sent+" из "+cnt);
					EndF();
				},i*100);
			});
		};

	$("#run").click(function(){
		var th=$(this),
			ta=$("#textarea");
		if(th.is(".runned"))
		{
			th.removeClass("runned").val("Пуск");
			ta.add("#select").prop("disabled",false);
			runned=false;
			clearTimeout(to);
		}
		else
		{
			text=ta.val();
			if(text=="")
			{
				alert("Введите текст для рассылки!");
				return;
			}
			ta.add("#select").prop("disabled",true);

			runned=true;
			th.addClass("runned").val("Стоп");

			switch($("#select").val())
			{
				case "3":
					SendChatList("a");
				break;
				case "2":
					SendChatList("na");
				break;
				default:
					GetOnlineExclude();
					SendOnline();
			}
		}
	});

	$("#help").click(function(){
		alert("Учетная запись оплачена до "+rdate+".\
Осталось "+remain+".\n\
\n\
Поддерживаются следующие переменные:\n\
{FirstName} - имя пользователя\n\
{Age} - возраст\n\
{Country} - страна\n\
{Employment} - работа\n\
{Height} - рост \n\
{Weight} - вес \n\
\n\
Alexander Sunvas © 2012\n\
E-mail: a@eleanor-cms.ru");
	});
});