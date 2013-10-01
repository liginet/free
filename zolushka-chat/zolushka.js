﻿$(function(){

	$("body").prepend('<div class="Popup">\
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

			try
			{
			}catch(e){}
		blacks=localStorage.getItem(key);

	if(blacks)
		$.each(blacks.split("|"),function(k,v){
	$("#bm").click(function(){
		$("#black option:selected").filter("[value!=0]").remove();
		UpdateBL();
	});

	$("#bpid").click(function(){
		if(id)
		{
			if($("#black option[value=\""+id+"\"]").size()==0)
				$("<option>").text(id).val(id).appendTo("#black");
			UpdateBL();
		}
	});

	$("#bp").click(function(){
			m=$("#Chat_ClientPanel_TypeArea_ThumbnailIMG").prop("src").match(/\/(\d+)\//);

		if(text=="")
			alert("Веберите мужика с фоткой для начала чата и только потом жмите эту кнопку");
		else if(m)
		{
				$("<option>").text(text).val(m[1]).appendTo("#black");
		}
		else
			alert("В черный список возможно добавление мужиков только с фотками");

	var to,//TimeOut object
		text="",//Text to send
		runned=false,//Flag whether spamming is run

		onlineexclude="",//Account numbers, where we have already sent text
		SendOnline=function()
		{
				return;

			while($("#Chat_SearchPanel_Pager_Previous").css("visibility")=="visible")
				$("#Chat_SearchPanel_Pager_Previous").click();

			var F=function()
			{

				$("#Chat_SearchPanel_MemberCards").children().each(function(){
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
				onlineexclude+=json.AccountNumber+",";

			$("#black option:gt(0)").each(function(){
			});
		},

		//Отправка по чат-листу
		//type: na - не ответившие, a - ответившие
		SendChatList=function(type)
		{
				cnt=toids.size(),
				sent=0,
				inf=$("#info"),
				to2,
				EndF=function()
				{
					{
						alert("Рассылка завершена!");
						$("#run").click();
					}
					to2=setTimeout(function(){
				};

			if(toids.size()>0)
				inf.show().text("0 из "+cnt);
			toids.each(function(i){
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