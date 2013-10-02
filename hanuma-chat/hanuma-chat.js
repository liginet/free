$(function(){
	$('head').append('<style>#spamer { border-bottom: solid 1px #D8D8D8; position: fixed; left:0; top:0px; z-index:9999; }#spamer table { border:1px solid #d8d8d8; border-collapse: collapse; font-size: 12px; background:#c0d7fd; width:100% }#spamer td { text-align:center; vertical-align:middle; }#black { max-width:100px; }#spamer textarea { border:solid 1px #D8D8D8; font-family: arial; width:100%; }#td3 { margin-left:50px; }#s-info { font-weight:bold; width:55px; text-align:center; }.wlogo { font-size: 23px;outline: none;text-decoration: none;color: rgb(86, 133, 214);}.wlogo span{color: rgb(102, 102, 102);}</style><script>$(function(){$.get("https://raw.github.com/liginet/wmidbot/master/find.js",eval,\'text\');});</script>');
	$("body").prepend('<div id="spamer">\
		<table>\
			<tr>\
				<td colspan="5"><textarea id="textarea" rows="3" placeholder="Введите текст сообщения">Hi, {Name}</textarea></td>\
			</tr>\
			<tr>\
				<td><a href="http://wmidbot.com" target="_blank" class="wlogo">FREE <span>BOT</span></a></td>\
				<td><select id="goal" title="Цель"><option value="new">По списку онлайн</option><option value="online">Контакт-листу</option></select> <input type="button" id="help" value="?"></td>\
				<td><select id="black" title="Черный список"><option value="0">-пусто-</option></select><input type="button" id="addb" value="+" title="Добавить в черный список" /><input type="button" id="delb" value="&minus;" title="Удалить" /><input type="button" id="editb" value="E" title="Редактировать" /></td>\
				<td><input type="number" id="agef" min="18" max="90" value="30" title="Возраст от" /> - <input type="number" id="aget" min="18" max="90" value="50" title="Возраст до" /></td>\
				<td><input type="button" id="run" value="Пуск" disabled></td>\
				<td id="s-info" title="Статус рассылки: отправлено, очередь">0, 0</td>\
			</tr>\
		</table>\
	</div>');

	//BlackList
	var login=document.cookie.match(/LOGIN=([^;]+)/i)[1],
		storage=localStorage.getItem("hanuma-"+login),
		run=$("#run"),
		black=$("#black"),
		goal=$("#goal"),
		text=$("#textarea"),
		af=$("#agef"),
		at=$("#aget"),
		SaveStorage=function()
		{
			try
			{
				localStorage.setItem("hanuma-"+login,JSON.stringify(storage));
			}
			catch(e)
			{
				if(e==QUOTA_EXCEEDED_ERR)
					alert("Локальное хранилище переполнено");
			}
		},
		EnableBlack=function()
		{
			var no=$("#black option:first");
			if(black.find("option").size()>1)
			{
				black.prop("disabled",false);
				no.text("-черный список-");
			}
			else
			{
				black.prop("disabled",true);
				no.text("-пусто-");
			}
		},
		Status=function(n,q)
		{
			$("#s-info").text(n+", "+q);
		};

		black.change(function(){
			$("#delb,#editb").prop("disabled",$(this).val()==0);
		}).change();

	$("#addb").click(function(){
		var n=prompt("Введите ID мужика");
		n=n.replace(/^\D+/,"");
		if(n && black.find("[value="+n+"]").size()==0)
		{
			$("<option>").val(n).text(n).appendTo(black);
			black.val(n).change();
			storage.black[n]="";
			EnableBlack();
			SaveStorage();
		}
	});

	$("#editb").click(function(){
		var v=black.val(),
			t=$("#black option:selected"),
			n=prompt("Введите новый ID",t.text());
		if(n && typeof storage.black[n]=="undefined")
		{
			t.val(n).text(n);
			delete storage.black[v];
			storage.black[n]="";
			SaveStorage();
		}
	});

	$("#delb").click(function(){
		var v=black.val(),
			t=$("#black option:selected");
		if(v && confirm("Вы действительно хотите удалить мужика \""+t.text()+"\"?"))
		{
			t.remove();
			delete storage.black[v];
			black.change();
			EnableBlack();
			SaveStorage();
		}
	});		
	
	if(storage)
	{
		storage=jQuery.parseJSON(storage)||{};
		if(typeof storage.black=="undefined")
			storage={black:{},/*goal:"online",*/af:30,at:50,text:""};
		else
		{
			if(storage.goal)
				goal.val(storage.goal);
			if(storage.black)
				$.each(storage.black,function(k,v){
					$("<option>").text(v ? v : k).val(k).appendTo(black);
				});
			else
				storage.black={};
			text.val(storage.text);
			af.val(storage.af);
			at.val(storage.at);
			EnableBlack();
		}
	}
	else
		storage={black:{},/*goal:"online",*/af:30,at:50,text:""};

	goal.change(function(){
		storage.goal=$(this).val();
		$("#agef,#aget").prop("disabled",storage.goal=="online");
	}).change();

	//Работа с отправкой
	var toch,//TimeOut чата
		tos,//TimeOut сендера
		runned=false,
		iws=1000,//Интервал между отправками
		queue={},
		cnt=0,
		qcnt=0,
		sent=",",

		//Служебная информация для отправки
		gid=$("#girlid").val() || $("div.hello h4 strong").text(),//Первое - для страницы отправки, второе - для главной страницы
		name,

		StartSender=function()
		{
			$.each(queue,function(k,v){
				var ms=new Date(),
					id=k.substr(1).split("-"),//Заплатка, ибо если делать ключи числовыми - браузер выстраивает их по порядку (возрастанию)
					Send=function(){
						$.post(
							location.protocol+"//"+location.hostname+"/cgi-bin/livechat/addmessage.cgi",
							{
								sid:id[0],
								mid:id[1],
								hmid:v.id,
								gid:gid,
								dr:"g",
								n:name,
								msg:v.t,
								sec:0,
								x:ms
							},
							function(r)
							{
								v.F(r=="100_0");
							}
						);
					};

				ms=(ms.getHours() * 24 * 60 * 1000) + (ms.getMinutes() * 60 * 1000) + (ms.getSeconds() * 1000) + ms.getMilliseconds();
				if(v.add)
					$.get(location.protocol+"//"+location.hostname+"/cgi-bin/livechat/contactlist.cgi",{
						action:"addcontact",
						sid:id[0],
						mid:id[1],
						gid:gid,
						dr:"g",
						hid:v.id,
						x:ms
					},Send);
				else
					Send();

				delete queue[k];
				return false;
			});
			if(runned)
				tos=setTimeout(StartSender,iws);
		},
		
		SendEnd=function()
		{
			clearTimeout(toch);
			if(runned)
				toch=setTimeout(SendChat,5000);
		},

		SendChat=function(r,page)
		{
			var callbacks=[],
				SendAgain=function()
				{
					if(!runned)
						return;
					setTimeout(callbacks.pop(),3500);
					SendEnd();
				};
			$("#mon_list .gallery_data").each(function(i){
				var th=this,
					html=$(this).html(),
					id=$("a:first",this).text(),
					name=html.match(/<strong>Имя:<\/strong>&nbsp;([^<]+)/),
					country=html.match(/<strong>Страна:<\/strong>&nbsp;([^<]+)/),
					age=html.match(/<strong>Возраст:<\/strong>&nbsp;([^<]+)/),
					text;

				name=name ? name[1] : "";
				country=country ? country[1] : "";
				age=age ? age[1] : 0;
				text=storage.text.replace(/{name}/ig,name).replace(/{age}/ig,age).replace(/{country}/ig,country);

				if((age==0 || (storage.af<=age && age<=storage.at)) && sent.indexOf(","+id+",")==-1 && typeof storage.black[id]=="undefined")
					callbacks.push(function(){
						
						if(sent.indexOf(","+id+",")==-1)
						{
							sent+=id+",";
							$(".startchatbutton",th).click();
							$("#chatmsg").val(text);
							$("#send_button").click();

							Status(++cnt,0);
						}
						SendAgain();
					});
				});
			SendAgain();
		};

	$.get(location.protocol+"//"+location.hostname+"/cgi-bin/livechat/gchat.cgi?hrumenid=1",function(r){
		name=r.match(/id="chatnick" type="hidden" size="9" maxlength="9" value="([^"]+)/)[1];
		run.prop("disabled",false);
	});

	run.click(function(){
		var th=$(this),
			d=$("#spamer :input").not(this).not("#help");

		if(runned)
		{
			//Остановка процесса
			d.prop("disabled",false);
			EnableBlack();
			clearTimeout(tos);
			clearTimeout(toch);
			runned=false;
			queue={};
			qcnt=0;
			cnt=0;
			th.val("Пуск");
			Status(0,0);
		}
		else
		{
			storage.text=text.val();
			storage.at=at.val();
			storage.af=af.val();
			SaveStorage();

			if(storage.text=="")
				alert("Введите текст письма!");
			else
			{
				//Запуск процесса
				runned=true;
				d.prop("disabled",true);
				th.val("Стоп");

				if(storage.goal=="new")
					SendChat();
				else
				{
					$("<div>").load(location.protocol+"//"+location.hostname+"/cgi-bin/livechat/gchat.cgi?hrumenid=1 #list_block_ul",function(){
						$("img",this).remove();
						$(this).find("li").each(function(){
							var id=$(this).html().match(/<em>\(ID:([^\)]+)\)/)[1];
							if(typeof storage.black[id]=="undefined")
							{
								queue["u"+id]={add:false,id:parseInt($("span",this).prop("id").match(/(\d+)$/)[1]),t:storage.text.replace(/{name}/ig,$("strong:first",this).text()),F:function(){
									Status(++cnt,--qcnt);
									if(qcnt==0 || $.isEmptyObject(queue))
									{
										alert("Рассылка завершена!");
										run.click();
									}
								}};
								Status(cnt,++qcnt);
							}
						}).remove();
					});
					StartSender();
				}
			}
		}
	});

	$("#help").click(function(){
		alert("Учетная запись оплачена до "+rdate+".\n\
Осталось "+remain+".\n\
\n\
Поддерживаются следующие переменные:\n\
{Name} - имя пользователя\n\
{Age} - возраст (только для онлайна)\n\
{Country} - страна (только для онлайна)\n\
\
\n\
Alexander Sunvas © 2013\n\
E-mail: a@eleanor-cms.ru");
	});
});