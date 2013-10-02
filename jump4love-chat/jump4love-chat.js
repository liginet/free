$(function(){

	$("body").prepend('<div id="spamer">\
		<table>\
			<tr>\
				<td colspan="5"><textarea id="textarea" rows="3" placeholder="Введите текст сообщения">Hi, {Login}</textarea></td>\
			</tr>\
			<tr>\
				<td><a href="http://wmidbot.com" target="_blank" class="wlogo">FREE <span>BOT</span></a></td>\
				<td><select id="goal" title="Цель"><option value="new">По списку онлайн</option><option value="online">Контакт-листу (онлайн)</option></select> <input type="button" id="help" value="?"></td>\
				<td><select id="black" title="Черный список"><option value="0">-пусто-</option></select><input type="button" id="addb" value="+" title="Добавить в черный список" /><input type="button" id="delb" value="&minus;" title="Удалить" /><input type="button" id="editb" value="E" title="Редактировать" /></td>\
				<td><input type="number" id="agef" min="18" max="90" value="30" title="Возраст от" /> - <input type="number" id="aget" min="18" max="100" value="100" title="Возраст до" /></td>\
				<td><input type="button" id="run" value="Пуск"></td>\
				<td id="info" title="Статус рассылки: отправлено, очередь">0, 0</td>\
			</tr>\
		</table>\
	</div>');

	//BlackList
	var name=document.cookie.match(/ul=([^;]+)/i)[1],
		storage=localStorage.getItem("jump4love-"+name),
		black=$("#black"),
		goal=$("#goal"),
		text=$("#textarea"),
		af=$("#agef"),
		at=$("#aget"),
		run=$("#run"),
		SaveStorage=function()
		{
			try
			{
				localStorage.setItem("jump4love-"+name,JSON.stringify(storage));
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
			$("#info").text(n+", "+q);
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
			storage={black:{},goal:"online",af:30,at:100,text:""};
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
		storage={black:{},goal:"online",af:30,at:100,text:""};

	goal.change(function(){
		$("#agef,#aget").prop("disabled",$(this).val()=="online");
	}).change();

	//Работа с отправкой
	var top,//TimeOut парсера
		tos,//TimeOut сендера
		runned=false,
		ibp=1000,//Интервал перехода между страницами
		iws=1000,//Интервал между отправками
		queue={},
		cnt=0,
		qcnt=0,
		searchtype,
		
		inchatlist=",",//ИДы тех, кто уже в контакт листе

		StartSender=function()
		{
			$.each(queue,function(k,v){
				var id=k.substr(1);//Заплатка, ибо если делать ключи числовыми - браузер выстраивает их по порядку (возрастанию)
				if($.inArray(id,[10397,12266,101389])==-1)
					$.post(
						location.protocol+"//"+location.hostname+"/chat_v2/",
						{
							ajax:1,
							mod:"messages",
							file:"send",
							user_id:id,
							message:v.t
						},
						function(pr)
						{
							v.F(pr.result=="ok");
						},
						"json"
					);
				else
					v.F(false);
				
				delete queue[k];
				return false;
			});
			if(runned)
				tos=setTimeout(StartSender,iws);
		},

		Parse4Send=function(r,page)
		{
			$.each(r.online.list,function(k,v){
				v.user_id=parseInt(v.user_id);
				if(storage.af<=v.user_age && v.user_age<=storage.at && inchatlist.indexOf(","+v.user_id+",")==-1 && typeof queue["u"+v.user_id]=="undefined" && typeof storage.black[v.user_id]=="undefined")
				{
					inchatlist+=v.user_id+",";
					queue["u"+v.user_id]={
						t:storage.text.replace(/{login}/ig,v.user_name).replace(/{age}/ig,v.user_age),
						F:function(st)
						{
							if(st)
								cnt++;
							Status(cnt,qcnt>0 ? --qcnt : 0);
						}
					};
					if(runned)
						Status(cnt,++qcnt);
				}			
			});

			if(runned)
			{
				page=r.result!="ok" || r.online.list.length==0 || r.online.pager.cnt<=r.online.pager.num ? 1 : page+1;
				top=setTimeout(function(){
					$.post(
						location.protocol+"//"+location.hostname+"/chat_v2/",
						{
							ajax:"1",
							mod:"users",
							off:page,
							clear:0
						},
						function(r){
							Parse4Send(r,page);
						},
						"json"
					);
				},ibp);
			}
		},
		StartParser=function()
		{
			inchatlist=",";
			$("#contacts_table tr[id^=\"contact-user-\"]").each(function(){
				inchatlist+=$(this).prop("id").replace("contact-user-","")+",";
			});

			if(runned)
				$.post(
					location.protocol+"//"+location.hostname+"/chat_v2/",
					{
						ajax:"1",
						mod:"users",
						off:1,
						clear:0
					},
					function(r){
						Parse4Send(r,1);
					},
					"json"
				);
		};
		
	run.click(function(){
		var th=$(this),
			d=$("#spamer :input").not(this).not("#help");

		searchtype=goal.val();
		if(runned)
		{
			//Остановка процесса
			d.prop("disabled",false);
			goal.change();
			EnableBlack();
			clearTimeout(tos);
			clearTimeout(top);
			queue={};
			qcnt=0;
			cnt=0;
			th.val("Пуск");
			runned=false;
		}
		else
		{
			storage.text=text.val();
			storage.goal=goal.val();
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

				if(searchtype=="new")
					StartParser();
				else
				{
					$("#contact-list .item-list").children("div").each(function(){
						var id=parseInt($(this).prop("id").replace("contact-user-",""));

						if(id>0 && typeof storage.black[id]=="undefined")
						{
							queue["u"+id]={t:storage.text.replace(/{login}/ig,$("a:first",this).text()),F:function(){
								Status(++cnt,--qcnt);
								if(qcnt==0)
								{
									alert("Рассылка завершена!");
									run.click();
								}
							}};
							Status(cnt,++qcnt);
						}
					});
				}

				StartSender();
			}
		}
	});

	//Рост и вес нельзя сделать, ибо они часто не указаны.
	$("#help").click(function(){
		alert("Учетная запись оплачена до "+rdate+".\n\
Осталось "+remain+".\n\
\n\
Поддерживаются следующие переменные:\n\
{Login} - имя пользователя\n\
{Age} - возраст\n\
\
\n\
Alexander Sunvas © 2013\n\
E-mail: a@eleanor-cms.ru");
	});
});