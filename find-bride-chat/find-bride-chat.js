$(function(){
	$('head').append('<style>#spamer {  border-bottom: solid 1px #D8D8D8; position: fixed; left: 0; bottom: 0; z-index:9999; } #spamer table { border:1px solid #d8d8d8; border-collapse: collapse; font-size: 12px; background:#c0d7fd; width:100% }#spamer td { text-align:center; vertical-align:middle; }#black { max-width:100px; }#spamer textarea { border:solid 1px #D8D8D8; font-family: arial; width:100%; }#td3 { margin-left:50px; }#s-info { font-weight:bold; width:55px; text-align:center; }.wlogo { font-size: 23px;outline: none;text-decoration: none;color: rgb(86, 133, 214);}.wlogo span{color: rgb(102, 102, 102);}</style>');
	$("body").prepend('<div id="spamer">\
		<table>\
			<tr>\
				<td colspan="5"><textarea id="textarea" rows="3" placeholder="Введите текст сообщения">Hi, {Name}</textarea></td>\
			</tr>\
			<tr>\
				<td><a href="http://wmidbot.com" target="_blank" class="wlogo">FREE <span>BOT</span></a></td>\
				<td><select id="goal" title="Цель"><option value="new">По списку онлайн</option><option value="contacts">Контакт-листу</option></select> <input type="button" id="help" value="?"></td>\
				<td><select id="black" title="Черный список"><option value="0">-пусто-</option></select><input type="button" id="addb" value="+" title="Добавить в черный список" /><input type="button" id="delb" value="&minus;" title="Удалить" /><input type="button" id="editb" value="E" title="Редактировать" /></td>\
				<td><input type="number" id="agef" min="18" max="90" value="30" title="Возраст от" /> - <input type="number" id="aget" min="18" max="90" value="50" title="Возраст до" /></td>\
				<td><input type="button" id="run" value="Пуск"></td>\
				<td id="s-info" title="Статус рассылки: отправлено, очередь">0, 0</td>\
			</tr>\
		</table>\
	</div>');

	//BlackList
	var storage=localStorage.getItem("bride-forever-"+name),
		black=$("#black"),
		goal=$("#goal"),
		text=$("#textarea"),
		run=$("#run"),
		af=$("#agef"),
		at=$("#aget"),
		SaveStorage=function()
		{
			try
			{
				localStorage.setItem("bride-forever-"+name,JSON.stringify(storage));
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
			storage={black:{},goal:"contacts",af:30,at:50,text:""};
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
		storage={black:{},goal:"contacts",af:30,at:50,text:""};

	goal.change(function(){
		var v=$(this).val();
		$("#agef,#aget").prop("disabled",v=="contacts");
		storage.goal=v;
	}).change();

	//Работа с отправкой
	var top,//TimeOut парсера
		tos,//TimeOut сендера
		runned=false,
		ibp=1000,//Интервал перехода между страницами
		queue={},
		cnt=0,
		qcnt=0,

		inchatlist=",",//ИДы тех, кто уже в контакт листе

		StartSender=function()
		{
			$.each(queue,function(k,v){
				var id=k.substr(1),//Заплатка, ибо если делать ключи числовыми - браузер выстраивает их по порядку (возрастанию)
					Send=function()
					{
						$.post(
							location.protocol+"//"+location.hostname+"/ichat_set_mess.php",
							{
								correct_user:id,
								text:v.t
							},
							function(r)
							{
								v.F(r.status=="OK");
							},
							"json"
						).fail(function(){ v.F(false) });
					};

				$.get(location.protocol+"//"+location.hostname+"/search/man_profile/all/"+id,function(r){
					r=r.replace(/<img[^>]+>/ig,"");
					var name= r.match(/<td> First name <\/td>\r\n\s+<td><strong>([^<]+)<\/strong>/);
					v.t=v.t.replace(/{name}/ig,name ? $.trim(name[1]) : login);
					
					if(storage.goal=="contacts")
						Send();
					else
						$.post(
							location.protocol+"//"+location.hostname+"/ichat_set_contacts.php",
							{
								correct_user:id,
								action:"Add to contacts"
							},
							Send
						).fail(function(){ v.F(false) });

				}).fail(function(){ v.F(false) });

				delete queue[k];
				return false;
			});
			if(runned)
				tos=setTimeout(StartSender,parseInt(Math.random()*6000)+4000);
		},

		Parse4Send=function(r,page)
		{
			$("<div>").html(r.replace(/<img[^>]+>/ig,"")).find(".search_result").each(function(){
				var a=$("a:first",this),
					id=parseInt(a.prop("href").match(/\/(\d+)/)[1]),
					login=a.text(),
					age=$(this).html().match(/>(\d+) y\.o\.<\/td>/i)[1];

				if(storage.af<=age && age<=storage.at && inchatlist.indexOf(","+id+",")==-1 && typeof queue["u"+id]=="undefined" && typeof storage.black[id]=="undefined")
				{
					inchatlist+=id+",";
					queue["u"+id]={
						t:storage.text.replace(/{login}/ig,login).replace(/{age}/ig,age),
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
			}).end().remove();

			if(runned)
			{
				page=r.indexOf(">next &gt;&gt;<")==-1 ? 1 : page+1;
				top=setTimeout(function(){
					$.post(
						location.protocol+"//"+location.hostname+"/ichat_get_online.php",
						{
							page:page
						},
						function(r)
						{
							Parse4Send(r,page);
						}
					);
				},ibp);
			}
		},
		StartParser=function()
		{
			inchatlist=",";
			$.post(
				location.protocol+"//"+location.hostname+"/ichat_get_contacts.php",
				{
					correct_user:0
				},
				function(r)
				{
					r=JSON.parse(r);

					$("<div>").html(r.general.data).find(".ichat_loaddata_item").each(function(){
						inchatlist+=parseInt(this.innerHTML.match(/(\d+)/)[1])+",";
					}).end().remove();

					if(runned)
						$.post(
							"/ichat_get_online.php",
							{
								page:1
							},
							function(r2)
							{
								Parse4Send(r2,1);
							},
							"text"
						);
				},
				"text"
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
					$.post(
						location.protocol+"//"+location.hostname+"/ichat_get_contacts.php",
						{
							correct_user:0
						},
						function(r)
						{
							$("<div>").html(r.general.data).find(".ichat_loaddata_item").each(function(){
								var id=parseInt($("span:first",this).prop("onclick").toString().match(/(\d+)/)[1]);
								if(id>0 && typeof storage.black[id]=="undefined")
								{
									queue["u"+id]={t:storage.text.replace(/{login}/ig,$("span span:last",this).html()),F:function(){
										if(qcnt==0 && runned && storage.goal=="new")
										{
											alert("Рассылка завершена!");
											run.click();
										}
										if(runned)
											Status(++cnt,--qcnt);
									}};
									Status(cnt,++qcnt);
								}
							}).end().remove();
						},
						"json"
					);

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
{Login} - логин пользователя\n\
{Name} - имя пользователя (иногда доступно)\n\
{Age} - возраст (только для онлайна)\n\
\
\n\
Alexander Sunvas © 2013\n\
E-mail: a@eleanor-cms.ru");
	});
});
