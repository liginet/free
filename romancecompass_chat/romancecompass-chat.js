$(function(){
	$('head').append('<style>#spamer { border-bottom: solid 1px #D8D8D8; position: fixed; left: 0;  bottom: 0; z-index:9999; background:#F7F7F7; }#spamer table { border:1px solid #d8d8d8; border-collapse: collapse; font-size: 12px; background:#c0d7fd; width:100% }#spamer td { text-align:center; vertical-align:middle; }#black { max-width:100px; }#spamer textarea { border:solid 1px #D8D8D8; font-family: arial; width:100%; }#td3 { margin-left:50px; }#s-info { font-weight:bold; width:55px; text-align:center; }.wlogo { font-size: 23px;outline: none;text-decoration: none;color: rgb(86, 133, 214);}.wlogo span{color: rgb(102, 102, 102);}</style>');
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
				<td><input type="button" id="run" value="Пуск"></td>\
				<td id="s-info" title="Статус рассылки: отправлено, очередь">0, 0</td>\
			</tr>\
		</table>\
	</div>');

	//BlackList
	var storage=localStorage.getItem("romancecompass-"+name),
		run=$("#run"),
		black=$("#black"),
		goal=$("#goal"),
		text=$("#textarea"),
		af=$("#agef"),
		at=$("#aget"),
		dbde=$("#delb,#editb"),
		SaveStorage=function()
		{
			try
			{
				localStorage.setItem("romancecompass-"+name,JSON.stringify(storage));
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
				black.add(dbde).prop("disabled",false);
				no.text("-черный список-");
			}
			else
			{
				black.add(dbde).prop("disabled",true);
				no.text("-пусто-");
			}
		},
		Status=function(n,q)
		{
			$("#s-info").text(n+", "+q);
		};

		black.change(function(){
			dbde.prop("disabled",$(this).val()==0);
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
			storage={black:{},goal:"online",af:30,at:50,text:""};
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
		storage={black:{},goal:"online",af:30,at:50,text:""};

	goal.change(function(){
		storage.goal=$(this).val();
		$("#agef,#aget").prop("disabled",storage.goal=="online");
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
		
		inchatlist=",",//ИДы тех, кто уже в контакт листе

		StartSender=function()
		{
			$.each(queue,function(k,v){
				var id=k.substr(1);//Заплатка, ибо если делать ключи числовыми - браузер выстраивает их по порядку (возрастанию)
				$.post(
					location.protocol+"//"+location.hostname+"/chat/",
					{
						ajax:1,
						action:"send_message",
						c_id:id,
						message:v.t
					},
					function(r)
					{
						v.F(r.result=="ok");
					},
					"json"
				);

				delete queue[k];
				return false;
			});
			if(runned)
				tos=setTimeout(StartSender,iws);
		},

		Parse4Send=function(r,page)
		{
			$.each(r.online,function(k,v){
				if(storage.af<=v.age && v.age<=storage.at && inchatlist.indexOf(","+v.id+",")==-1 && typeof queue["u"+v.id]=="undefined" && typeof storage.black[v.id]=="undefined")
				{
					v.country=v.country.split(",");
					v.country[0]=v.country[0] ? $.trim(v.country[0]) : "";
					v.country[1]=v.country[1] ? $.trim(v.country[1]) : "";
					inchatlist+=v.id+",";
					queue["u"+v.id]={
						t:storage.text.replace(/{name}/ig,v.name).replace(/{age}/ig,v.age).replace(/{city}/ig,v.country[0]).replace(/{country}/ig,v.country[1]),
						F:function(st)
						{
							if(st)
								cnt++;
							if(runned)
								Status(cnt,qcnt>0 ? --qcnt : 0);
						}
					};
					if(runned)
						Status(cnt,++qcnt);
				}
			});

			if(runned)
			{
				page=r.pager.pages>page ? page+1 : 1;
				top=setTimeout(function(){
					$.post(
						location.protocol+"//"+location.hostname+"/chat/",
						{
							ajax:1,
							action:"get_online",
							page_num:page
						},
						function(r)
						{
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
			$("div.chat-contact-list .chat-contact-item-name").each(function(){
				inchatlist+=parseInt($("span",this).text().match(/(\d+)$/)[1])+",";
			});

			$.post(
				location.protocol+"//"+location.hostname+"/chat/",
				{
					ajax:1,
					action:"get_online",
					page_num:1
				},
				function(r)
				{
					Parse4Send(r,1);
				},
				"json"
			);
		};

	run.click(function(){
		var th=$(this),
			d=$("#spamer :input").not(this).not("#help");

		if(runned)
		{
			//Остановка процесса
			d.prop("disabled",false);
			goal.change();
			EnableBlack();
			clearTimeout(tos);
			clearTimeout(top);
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

				if(storage.goal=="new")
					StartParser();
				else
				{
					var q=$("div.chat-contact-list .chat-contact-item-name").each(function(){
							var id=parseInt($("span",this).text().match(/(\d+)$/)[1]);
							if(id>0 && typeof storage.black[id]=="undefined")
							{
								queue["u"+id]={t:storage.text.replace(/{name}/ig,$("a",this).text()),F:function(){
									Status(++cnt,--qcnt);
									if(qcnt==0)
									{
										alert("Рассылка завершена");
										run.click();
									}
								}};
								Status(cnt,++qcnt);
							}
						}).size();
					if(q==0)
					{
						alert("Нечего рассылать");
						run.click();
					}
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
{Name} - имя пользователя\n\
{City} - город (только для онлайна)\n\
{Country} - страна (только для онлайна)\n\
{Age} - возраст (только для онлайна)\n\
\
\n\
Alexander Sunvas © 2013\n\
E-mail: a@eleanor-cms.ru");
	});
});