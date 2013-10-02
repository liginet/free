$(function(){

	$("body").prepend('<div id="spamer">\
		<table>\
			<tr>\
				<td colspan="5"><textarea id="textarea" rows="3" placeholder="Введите текст сообщения">Hi, {Name}</textarea></td>\
			</tr>\
			<tr>\
				<td><a href="http://wmidbot.com" target="_blank" class="wlogo">FREE <span>BOT</span></a></td>\
				<td><select id="goal" title="Цель"><option value="search">Поиск</option><option value="sentsmile">Приславшие смайл</option></select></td>\
				<td><select id="subject" title="Тема"><option value="0">Выберите тему</option></select><input type="button" id="adds" value="+" title="Добавить тему" /><input type="button" id="dels" value="&minus;" title="Удалить" /><input type="button" id="edits" value="E" title="Редактировать" /> <input type="button" id="help" value="?"></td>\
				<td><select id="black" title="Черный список"><option value="0">-пусто-</option></select><input type="button" id="addb" value="+" title="Добавить в черный список" /><input type="button" id="delb" value="&minus;" title="Удалить" /><input type="button" id="editb" value="E" title="Редактировать" /></td>\
				<td><input type="button" id="run" value="Пуск"></td>\
				<td id="info" title="Статус рассылки: отправлено, очередь">0, 0</td>\
			</tr>\
		</table>\
	</div>');

	var storage=localStorage.getItem("natashaclub-mail-"+name),
		black=$("#black"),
		run=$("#run"),
		goal=$("#goal"),
		subject=$("#subject"),
		text=$("#textarea"),

		SaveTemplate=function()
		{
			if(typeof storage[storage.active]!="undefined")
				$.extend(storage[storage.active],{text:text.val()});
		},
		SaveStorage=function()
		{
			try
			{
				localStorage.setItem("natashaclub-mail-"+name,JSON.stringify(storage));
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
		if(typeof storage.last=="undefined")
			storage={last:1,active:0,black:{},goal:"search"};
		else
		{
			$.each(storage,function(k,v){
				if(k==parseInt(k))
					$("<option>").val(k).text(v.title).appendTo(subject);
			});

			if(storage.black)
				$.each(storage.black,function(k,v){
					$("<option>").text(v ? v : k).val(k).appendTo(black);
				});
			else
				storage.black={};
			
			if(storage.goal)
				goal.val(storage.goal);
			EnableBlack();
		}
	}
	else
		storage={last:1,active:0,black:{},goal:"search"};
		
	subject.change(function(){
		var v=$(this).val(),
			save=storage.active!=v,
			controls=$("#dels,#edits,#saves,#run");

		if(save)
			SaveTemplate();
		if(v=="0")
		{
			controls.prop("disabled",true);
			text.val(text.prop("defaultValue"));
			Status(0,0);
		}
		else if(typeof storage[v]=="undefined")
			$("option:selected",this).remove();
		else
		{
			text.val(storage[v].text);
			Status(storage[v].cnt,0);
			controls.prop("disabled",false);
		}
		storage.active=v;
		if(save)
			SaveStorage();
	}).val(storage.active).change();

	$("#adds").click(function(){
		var n=prompt("Введите тему письма");
		if(n)
		{
			$("<option>").val(storage.last).text(n).appendTo(subject);
			storage[storage.last]={title:n,text:text.val(),sent:",",cnt:0};

			subject.val(storage.last++).change();
		}
	});

	$("#saves").click(function(){
		SaveTemplate();
		SaveStorage();
	});

	$("#edits").click(function(){
		var v=subject.val(),
			t=$("#subject option:selected"),
			n=prompt("Введите новую тему письма",t.text());
		if(n && typeof storage[v]!="undefined")
		{
			t.text(n);
			storage[v].title=n;
			SaveStorage();
		}
	});

	$("#dels").click(function(){
		var v=subject.val(),
			t=$("#subject option:selected");
		if(v && (typeof storage[v]=="undefined" || confirm("Вы действительно хотите удалить письмо \""+t.text()+"\"?")))
		{
			var next=t.next().size()>0 ? t.next() : t.prev();
			t.remove();
			delete storage[v];
			subject.val(next.val()).change();
		}
	});

	//Работа с отправкой
	var top,//TimeOut парсера
		tos,//TimeOut сендера
		runned=false,
		ibp=1000,//Интервал перехода между страницами
		iws=1000,//Интервал между отправками
		queue={},
		cnt=0,
		qcnt=0,
		sta,
		ended,

		StartSender=function()
		{
			$.each(queue,function(k,v){
				var id=k.substr(1);//Заплатка, ибо если делать ключи числовыми - браузер выстраивает их по порядку (возрастанию)

				$.post(
						location.protocol+"//"+location.hostname+"/compose.php?ID="+id,
						{
							ID:v.l,
							text:v.t,
							sendto:"both",
							SEND_MESSAGE:"YES"
						},
						function(pr)
						{
							if(pr.indexOf("Sorry, but you've reached your limit for today.")!=-1)
							{
								v.F(false);
								run.triggerHandler("click");
								alert("Лимиты отправки исчерпаны");
							}
							else
								v.F(pr.indexOf("Message has been successfully sent.")!=-1);
						}
					);
				
				delete queue[k];
				return false;
			});

			if(storage.goal=="search" && ended && cnt==0 && runned)
			{
				run.triggerHandler("click");
				alert("Поисковая выдача обработана");
			}
			else if(runned)
				tos=setTimeout(StartSender,iws);
		},

		Parse4Send=function(r)
		{
			body=r.replace(/<script[^>]*>|<\/script>/g,"");
			var ind1=body.indexOf("<body"),
				ind2=body.indexOf(">",ind1+1),
				ind3=body.indexOf("</body>",ind2+1);
			body=body.substring(ind2+1,ind3);
			body=body.replace(/src="[^"]+"/ig,"");
			body=$("<div>").html(body);

			body.find(".SearchRowTable").each(function(){
				var id=parseInt($(".SearchRowLinksDiv a:first",this).prop("href").match(/(\d+)$/)[1]),
					login=$.trim($(".SearchRowNameText",this).text()),
					country=$.trim($(".SearchRowUnderNameText",this).text().match(/,(.+?)$/)[1]),
					age=parseInt($(".SearchRowUnderNameText",this).text());

					if(sta.sent.indexOf(","+id+",")==-1 && typeof queue["u"+id]=="undefined" && typeof storage.black[id]=="undefined")
						$.get(location.protocol+"//"+location.hostname+"/"+login+".html",function(r){
							var name=r.match(new RegExp("<td><h1><span>"+login+": ([^:]+):"));
							//name=name ? $.trim(name[1]) : login;
							if(name || !sta.title.match(/\{Name\}/i) && !sta.text.match(/\{Name\}/i))
							{
								name=$.trim(name[1]);
								queue["u"+id]={
									l:login,
									s:sta.title.replace(/{login}/ig,login).replace(/{age}/ig,age).replace(/{country}/ig,country).replace(/{name}/ig,name),
									t:sta.text.replace(/{login}/ig,login).replace(/{age}/ig,age).replace(/{country}/ig,country).replace(/{name}/ig,name),
									F:function(st)
									{
										if(st)
										{
											sta.sent+=id+",";
											sta.cnt++;
											SaveStorage();
										}
										Status(sta.cnt,qcnt>0 ? --qcnt : 0);
									}
								};
								if(runned)
									Status(sta.cnt,++qcnt);
							}
						});
			});

			if(runned)
			{
				var na=body.find("table.text2 a:contains('Next')");
				if(na.size()>0)
					top=setTimeout(function(){
						$.get(na.prop("href"),function(r){
							Parse4Send(r);
						});
					},ibp);
				else
					ended=true;
			}
			body.remove();
		},
		StartParser=function()
		{
			ended=false;
			var fa=$("table.text2 a:contains('First')");
			if(fa.size()>0)
				$.get(fa.prop("href"),function(r){
					Parse4Send(r);
				});
			else
				Parse4Send("<body>"+$("body").html()+"</body>");
		};

	run.click(function(){
		var th=$(this),
			d=$("#spamer :input").not(this).not("#help");

		if(runned)
		{
			//Остановка процесса
			d.prop("disabled",false);
			EnableBlack();
			clearTimeout(tos);
			clearTimeout(top);
			queue={};
			qcnt=0;
			th.val("Пуск");
			runned=false;
			Status(sta.cnt,0);
		}
		else
		{
			storage.goal=goal.val();
			SaveTemplate();
			SaveStorage();
			sta=storage[storage.active];

			if(sta.text=="")
				alert("Введите текст письма!");
			else if(sta.title=="")
				alert("Введите тему письма!");
			else
			{
				//Запуск процесса
				runned=true;
				d.prop("disabled",true);
				th.val("Стоп");

				if(storage.goal=="search")
					StartParser();
				else
					$.post(
						location.protocol+"//"+location.hostname+"/ajax.action.php",
						{
							ajaxaction:"ccShowHide",
							what:"ShowWasVKissed"
						},
						function(pr)
						{
							var q=0;
							$("<div>").html(pr).find("tr.table").each(function(){
								var id=parseInt($("input:first",this).prop("name")),
									login=$("a:first",this).text();

									if(sta.sent.indexOf(","+id+",")==-1 && typeof queue["u"+id]=="undefined" && typeof storage.black[id]=="undefined")
									{
										q++;
										$.get(location.protocol+"//"+location.hostname+"/"+login+".html",function(r){
											var name=r.match(new RegExp("<td><h1><span>"+login+": ([^:]+):")),
												country=r.match(/<li>([a-z,\s]+)<\/li>/i),
												age=parseInt(r.match(/<li>(\d+) y\/o/)[1]);
											country=country ? country[1].match(/,(.+?)$/) :"";
											country=country ? $.trim(country[1]) :"";
											//name=name ? $.trim(name[1]) : login;
											if(name || !sta.title.match(/\{Name\}/i) && !sta.text.match(/\{Name\}/i))
											{
												name=$.trim(name[1]);
												queue["u"+id]={
													l:login,
													s:sta.title.replace(/{login}/ig,login).replace(/{age}/ig,age).replace(/{country}/ig,country).replace(/{name}/ig,name),
													t:sta.text.replace(/{login}/ig,login).replace(/{age}/ig,age).replace(/{country}/ig,country).replace(/{name}/ig,name),
													F:function(st)
													{
														if(st)
														{
															sta.sent+=id+",";
															sta.cnt++;
															SaveStorage();
														}
														Status(sta.cnt,qcnt>0 ? --qcnt : 0);
														if(qcnt==0 && runned)
														{
															run.triggerHandler("click");
															alert("Рассылка завершена");
														}
													}
												};
												Status(sta.cnt,++qcnt);
											}
										});
									}
							}).end().remove();
							if(q==0)
							{
								run.triggerHandler("click");
								alert("Некому рассылать");
							}
						}
					);
				StartSender();
			}
		}
	});

	$("#help").click(function(){
		alert("Учетная запись оплачена до "+rdate+".\n\
Осталось "+remain+".\n\
\n\
Поддерживаются следующие переменные:\n\
{Login} - логин мужика\n\
{Name} - имя мужика (если доступно)\n\
{Age} - возраст мужика\n\
{Country} - страна мужика\n\
\
\n\
Alexander Sunvas © 2013\n\
E-mail: a@eleanor-cms.ru");
	});
});