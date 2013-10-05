function GetHighest(obj)
{
	var a=[],k;
	for(k in obj)
		a.push([ k, obj[k] ]);
	a.sort(function(a,b){
		return a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0;
	});

	return [a[0][0],a[0][1]];
}

function OCR(img)
{
	var canvas=document.createElement("canvas"),
		ctx,idata,pix;

	canvas.width=img.prop("naturalWidth"),258;
	canvas.height=img.prop("naturalHeight"),258;

	ctx=canvas.getContext("2d");
	ctx.drawImage(img.get(0),0,0);
	idata=ctx.getImageData(0,0,canvas.width,canvas.height);

	//Ширина каждой буквы 26 на 22
	var FillNear=function(letter,x,y,fill)//Поиск символов точек, относящихся к букве
		{
			var coord=(x<<8)+y;
			if(fill && (typeof letter[coord]!="undefined" || x>25 || y>21 || x<0 || y<0) || !fill && typeof letter[coord]=="undefined")
				return;

			if(fill)
				letter[coord]=true;
			else
				delete letter[coord];

			FillNear(letter,x-1,y-1,fill);
			FillNear(letter,x-1,y,fill);
			FillNear(letter,x-1,y+1,fill);
			FillNear(letter,x,y-1,fill);
			FillNear(letter,x,y+1,fill);
			FillNear(letter,x+1,y-1,fill);
			FillNear(letter,x+1,y,fill);
			FillNear(letter,x+1,y+1,fill);
		},
		GetLetters=function()
		{
			var x,y,
				binarr={},//Картинка в бинарном виде, где ключи - это координаты, h числа, где 0xFF000 - x, 0xFF - y
				colour,percent;

			for(x=0;x<canvas.width;x++)
				for(y=0;y<canvas.height;y++)
				{
					pix=(canvas.width*y+x)*4;
					colour=[idata.data[pix],idata.data[pix+1],idata.data[pix+2]];//Запись цвета пикселя RGB
					isletter=255>colour[0] && 255>colour[1] && 255>colour[2];
					if(isletter)
						binarr[(x<<12)+y]=true;
				};

			var i,xx,yy,
				minh=0,
				minw=8,
				maxw=minw+30,
				crystal={},//Очищенные буквы
				letters={};//Массив букв pos => массив чисел, где ключи, h числа, где 0xFF00 - x, 0xFF - y

			//Ширина каждой буквы 26 на 22
			for(i=1;i<6;i++)
			{
				for(y=canvas.height;y>=minh;y--)
					for(x=minw;x<=maxw;x++)
					{
						if(minh>0)
						{
							if(typeof binarr[ (x<<12)+y ]!="undefined")
							{
								xx=x-minw;
								yy=y-minh;
								if(xx>10 && xx<37)//Еще точнее обрезаем буквы
								{
									xx-=11;
									letters[i][ (xx<<8)+yy ]=true;
								}
							}
						}
						else if(typeof binarr[ (x<<12)+y ]!="undefined")
						{
							xx=x-1;
							while(typeof binarr[ (xx<<12)+y ]!="undefined")
								xx--;
							x=xx+1;
							y-=15;//15 - расстояние от левой нижней границы до минимальной нижней точки буквы
							minh=y-22;//22 - расстояние от минимальной нижней точки буквы до максимальной верхней точки буквы
							minw=x-3;//3 - расстояние от левой нижней границы тени до левой крайней точки ШАРА (не тени)
							maxw=x+47;//47 - расстояние от левой нижней границы до правой границы тени
							letters[i]={};
							break;
						}
					}
				minh=0;
				minw=maxw;
				maxw+=30;
				
				if(typeof letters[i][5]=="undefined")
				{
					FillNear(letters[i],0,0,false);
					FillNear(letters[i],23,0,false);
				}
				else
					FillNear(letters[i],23,0,true);
					
				xx=-1;
				yy=-1;
				crystal={ black:typeof letters[i][0]=="undefined",coords:[] };

				for(x=0;x<26;x++)
					for(y=0;y<22;y++)
						if(crystal.black && typeof letters[i][ (x<<8)+y ]!="undefined" || !crystal.black && typeof letters[i][ (x<<8)+y ]=="undefined")
						{
							xx=x;
							x=100;//Выход из цикла
							y=100;
						}

				for(y=0;y<22;y++)
					for(x=0;x<26;x++)
						if(crystal.black && typeof letters[i][ (x<<8)+y ]!="undefined" || !crystal.black && typeof letters[i][ (x<<8)+y ]=="undefined")
						{
							yy=y;
							x=100;//Выход из цикла
							y=100;
						}

				for(x=0;x<26;x++)
					for(y=0;y<22;y++)
						if(crystal.black && typeof letters[i][ (x<<8)+y ]!="undefined" || !crystal.black && typeof letters[i][ (x<<8)+y ]=="undefined")
							crystal.coords.push( ((x-xx)<<8)+y-yy );

				crystal.coords=crystal.coords.sort(function(a,b){
					return a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0;
				});
				letters[i]=crystal;
			};
		return letters;
	};
	
	var letters=GetLetters(),
		db={
			"1":[[1,257,268,512,524,768,780,1024,1025,1026,1027,1028,1029,1030,1031,1032,1033,1034,1035,1036,1284,1285,1286,1287,1288,1289,1290,1291,1292,1548,1804,2060,2315,2316]],
			"3":[[9,10,11,12,268,269,525,526,782,1025,1026,1038,1281,1294,1536,1550,1792,1806,2048,2054,2062,2304,2310,2311,2317,2318,2560,2566,2567,2573,2817,2821,2824,2825,2826,2827,2828,3073,3074,3075,3076,3077,3081,3082,3083,3330,3331,3332]],
			"4":[[9,10,266,518,522,773,777,778,1028,1033,1034,1289,1294,1537,1545,1550,1792,1793,1794,1795,1796,1801,1806,2049,2050,2051,2052,2053,2054,2055,2056,2057,2058,2059,2060,2061,2062,2313,2314,2315,2316,2317,2318,2569,2573,2574,2825,2829,2830,3081,3085]],
			"6":[[8,9,10,11,12,262,263,264,265,267,268,269,516,517,519,526,771,772,775,782,783,1026,1039,1286,1295,1537,1542,1551,1798,1806,2048,2054,2062,2304,2310,2311,2317,2560,2567,2568,2569,2570,2571,2572,2573,2817,2824,2825,2826,2827,3073,3074,3331]],
			"7":[[2,3,257,258,513,769,1025,1280,1281,1536,1537,1543,1544,1545,1546,1547,1548,1549,1792,1796,1797,1798,1799,1800,1801,1802,1803,1804,1805,2048,2051,2304,2305]],
			"8":[[10,264,265,266,267,268,520,524,525,775,781,782,1026,1027,1028,1031,1038,1281,1282,1284,1285,1286,1294,1537,1542,1550,1792,1798,1806,2048,2054,2062,2304,2310,2318,2560,2566,2567,2573,2574,2816,2822,2823,2829,3072,3073,3077,3080,3081,3082,3083,3084,3085,3329,3330,3331,3332,3333,3337,3338,3339,3586,3587]],
			D:[[13,269,523,524,525,778,779,780,781,1032,1033,1034,1037,1286,1287,1288,1293,1541,1542,1549,1792,1796,1797,1806,2048,2050,2051,2062,2304,2305,2306,2318,2560,2561,2573,2574,2816,2829,3072,3085,3328,3340,3341,3595,3596,3841,3851,3852,4097,4105,4106,4107,4353,4354,4359,4360,4361,4362,4610,4611,4612,4613,4614,4615,4616,4868,4869]],
			F:[[13,269,270,525,526,779,780,781,782,1033,1034,1035,1038,1287,1288,1289,1294,1295,1541,1542,1543,1792,1796,1797,1798,1799,2048,2049,2050,2051,2055,2304,2305,2306,2311,2567,2823,3073,3079,3329,3585,3841,4097,4353,4354,4355]],
			G:[[7,8,9,10,11,12,13,261,262,263,264,265,267,268,269,270,516,517,518,526,771,772,782,783,1026,1027,1038,1039,1282,1295,1537,1551,1793,1806,1807,2049,2062,2304,2305,2313,2318,2560,2561,2569,2573,2574,2575,2576,2817,2825,2826,2827,2828,2829,2830,3073,3082,3083,3330,3587,3588,3589,3843,3844,4097,4098]],
			I:[[0,12,13,256,268,269,512,524,768,769,770,771,772,773,774,775,776,777,778,779,780,1024,1032,1033,1034,1035,1036,1280,1292,1536,1548,1804]],
			J:[[11,12,265,266,267,268,269,525,526,781,782,1038,1294,1549,1550,1804,1805,2059,2060,2313,2314,2315,2560,2567,2568,2569,2816,2821,2822,2823,3073,3075,3076,3077,3329,3330,3331,3585,3586,3841,4097]],
			L:[[13,269,525,779,780,781,1033,1034,1035,1037,1038,1288,1289,1294,1542,1543,1544,1550,1792,1796,1797,1798,1806,2048,2051,2052,2062,2304,2305,2306,2318,2319,2561,2575,2817,2831,3073,3085,3086,3340]],
			N:[[1,257,270,513,525,526,769,770,771,772,773,774,775,776,777,778,779,780,781,1025,1026,1027,1028,1029,1030,1031,1032,1033,1034,1035,1036,1037,1282,1283,1293,1539,1540,1549,1796,1797,1805,2053,2054,2310,2311,2560,2567,2568,2816,2824,2825,3072,3081,3082,3328,3329,3330,3331,3338,3339,3584,3586,3587,3588,3589,3590,3591,3592,3593,3594,3595,3596,3840,3848,3849,3850,3851,3852]],
			Q:[[7,8,9,10,11,12,261,262,263,264,265,266,267,268,269,516,517,524,525,526,771,772,781,782,1026,1027,1038,1282,1294,1537,1550,1793,1806,2048,2059,2060,2061,2062,2304,2317,2318,2319,2320,2560,2573,2575,2576,2816,2828,3072,3073,3083,3084,3329,3337,3338,3339,3585,3586,3587,3591,3592,3593,3594,3842,3843,3844,3845,3846,3847,3848]],
			R:[[0,14,256,269,270,512,513,514,515,516,517,518,519,520,521,522,523,524,525,526,768,769,770,771,772,773,774,775,776,777,778,779,780,781,1024,1031,1037,1280,1286,1293,1536,1542,1549,1792,1798,1799,2048,2054,2055,2056,2304,2310,2313,2314,2560,2561,2565,2566,2570,2571,2817,2818,2819,2820,2821,2827,2828,3084,3085,3341,3597]],
			S:[[3,4,12,13,14,15,258,259,260,261,268,269,270,271,513,518,525,769,774,782,1025,1030,1038,1286,1287,1294,1295,1543,1550,1551,1793,1799,1806,1807,2049,2055,2062,2304,2305,2306,2311,2318,2561,2562,2568,2573,2574,2824,2825,2826,2827,2828,2829,3081,3082,3083,3084]],
			U:[[1,257,513,514,515,516,517,518,519,520,521,769,770,771,772,773,774,775,776,777,778,779,1025,1035,1036,1281,1292,1293,1549,1805,2061,2062,2304,2317,2560,2573,2816,2828,2829,3072,3073,3074,3075,3076,3083,3084,3328,3329,3330,3331,3332,3333,3334,3335,3336,3337,3338,3339,3584,3590,3591,3592,3593,3594,3840]],
			V:[[4,5,6,7,8,9,10,11,12,13,14,256,257,258,259,260,261,262,263,264,265,266,267,268,269,512,513,523,524,768,779,1024,1034,1289,1543,1544,1798,1799,2054,2309,2561,2564,2817,2818,2819,3073,3074,3329,3585,3841]],
			W:[[11,12,13,263,264,265,266,267,268,512,515,516,517,518,519,520,522,523,768,769,770,771,772,778,1024,1025,1280,1536,1806,1807,2052,2053,2056,2057,2058,2059,2060,2061,2062,2307,2308,2309,2310,2311,2312,2315,2316,2317,2571,2572,2826,3081,3335,3336,3590,3591,3845,3846,4100,4354,4355,4610,4866,5122]],
			Y:[[1,2,257,258,259,513,515,516,769,772,773,1029,1037,1286,1293,1543,1544,1545,1546,1547,1548,1549,1798,1799,1801,1802,1803,1804,1805,2049,2053,2061,2305,2307,2308,2317,2561,2562,2817,3072]],
			Z:[[12,267,268,522,523,524,778,780,781,1033,1037,1281,1282,1288,1293,1536,1537,1543,1544,1549,1792,1799,1805,2048,2054,2304,2309,2318,2560,2565,2574,2816,2820,2829,2830,3072,3075,3083,3084,3331,3585,3586,3841,3842,4097]]},
		dblack={
			"2":[[14,15,269,270,271,272,524,525,526,527,528,779,780,781,782,783,784,1034,1035,1036,1037,1038,1039,1040,1290,1291,1292,1293,1294,1295,1296,1539,1540,1545,1546,1547,1548,1550,1551,1552,1553,1794,1795,1796,1801,1802,1803,1806,1807,1808,1809,2049,2050,2051,2052,2056,2057,2058,2059,2062,2063,2064,2065,2305,2306,2307,2308,2312,2313,2314,2315,2318,2319,2320,2321,2561,2562,2563,2568,2569,2570,2575,2576,2577,2816,2817,2818,2823,2824,2825,2826,2831,2832,2833,2834,3072,3073,3074,3079,3080,3081,3085,3086,3087,3088,3089,3090,3328,3329,3330,3334,3335,3336,3337,3341,3342,3343,3344,3345,3346,3584,3585,3586,3587,3589,3590,3591,3592,3593,3597,3598,3599,3600,3841,3842,3843,3844,3845,3846,3847,3848,4097,4098,4099,4100,4101,4102,4103,4104,4354,4355,4356,4357,4358,4359,4612,4613]],
			"5":[[2,3,4,5,6,7,8,9,10,14,15,258,259,260,261,262,263,264,265,266,269,270,271,272,514,515,516,517,518,519,520,521,522,523,525,526,527,528,529,770,771,772,776,777,778,779,782,783,784,785,786,1026,1027,1028,1031,1032,1033,1034,1039,1040,1041,1042,1281,1282,1283,1284,1287,1288,1289,1296,1297,1298,1537,1538,1539,1543,1544,1545,1552,1553,1554,1792,1793,1794,1795,1799,1800,1801,1808,1809,1810,2048,2049,2050,2051,2055,2056,2057,2063,2064,2065,2066,2305,2306,2307,2311,2312,2313,2314,2318,2319,2320,2321,2322,2567,2568,2569,2570,2571,2572,2573,2574,2575,2576,2577,2824,2825,2826,2827,2828,2829,2830,2831,2832,3081,3082,3083,3084,3085,3086,3087]],
			"9":[[2,3,4,5,6,7,8,13,257,258,259,260,261,262,263,264,265,269,270,513,514,515,516,517,518,519,520,521,524,525,526,527,768,769,770,771,775,776,777,778,780,781,782,783,784,1024,1025,1026,1031,1032,1033,1034,1037,1038,1039,1040,1280,1281,1282,1288,1289,1290,1294,1295,1296,1536,1537,1538,1544,1545,1546,1550,1551,1552,1792,1793,1794,1799,1800,1801,1802,1806,1807,1808,2048,2049,2050,2051,2055,2056,2057,2061,2062,2063,2064,2304,2305,2306,2307,2308,2309,2310,2311,2312,2313,2316,2317,2318,2319,2320,2561,2562,2563,2564,2565,2566,2567,2568,2569,2570,2571,2572,2573,2574,2575,2818,2819,2820,2821,2822,2823,2824,2825,2826,2827,2828,2829,2830,3076,3077,3078,3079,3080,3081,3082,3083,3084,3085]]
			},
		i,x,y,relsymbols,s="";

	for(i=1;i<6;i++)
	{
		relsymbols={};//Массив символов, формата: символ=>релевантность
		
		$.each(letters[i].black ? dblack : db,function(symbol,fonts){
			var rel=0;//Релевантность "шрифта"

			$.each(fonts,function(fn,coords){
				var matches=0;//Число совпадений

				for(x=0;x<coords.length;x++)
					if($.inArray(coords[x],letters[i].coords)>-1)
						matches++;
				
				rel=Math.max( matches/Math.max(coords.length,letters[i].coords.length) , rel);
			});
		
			relsymbols[symbol]=rel;
		});

		
		relsymbols=GetHighest(relsymbols);
		if(relsymbols[1]>0.7)
			s+=relsymbols[0];
	}
	return s;
}

$(function(){
	$('head').append('<style>#spamer { border-bottom: solid 1px #D8D8D8; position: fixed; left: 0; bottom: 0; z-index:9999; }#spamer table { border:1px solid #d8d8d8; border-collapse: collapse; font-size: 12px; background:#c0d7fd; width:100% }#spamer td { text-align:center; }#black { max-width:100px; }#spamer textarea { border:solid 1px #D8D8D8; font-family: arial; width:100%; }#td3 { margin-left:50px; }#info { font-weight:bold; width:65px; text-align:center; }.wlogo { font-size: 23px;outline: none;text-decoration: none;color: rgb(86, 133, 214);}.wlogo span{color: rgb(102, 102, 102);}</style>');
	$("body").prepend('<div id="spamer">\
		<table>\
			<tr>\
				<td colspan="7"><textarea id="textarea" rows="3" placeholder="Введите текст сообщения">Hi, {Name}</textarea></td>\
			</tr>\
			<tr>\
				<td><a href="http://wmidbot.com" target="_blank" class="wlogo">FREE <span>BOT</span></a></td>\
				<td><select id="goal" title="Цель"><option value="search">Поиск</option><option value="admirers">Admirers</option><option value="writers">Writers</option></select> <input type="button" id="help" value="?"></td>\
				<td><select id="subject" title="Тема"><option value="0">Выберите тему</option></select><input type="button" id="adds" value="+" title="Добавить тему" /><input type="button" id="dels" value="&minus;" title="Удалить" /><input type="button" id="edits" value="E" title="Редактировать" /></td>\
				<td style="display:none"><select id="writers" title="Писатели"><option value="0">-пусто-</option></select><input type="button" id="addw" value="+" title="Добавить" /><input type="button" id="delw" value="&minus;" title="Удалить" /><input type="button" id="editw" value="E" title="Редактировать" /></td>\
				<td><select id="black" title="Черный список"><option value="0">-пусто-</option></select><input type="button" id="addb" value="+" title="Добавить в черный список" /><input type="button" id="delb" value="&minus;" title="Удалить" /><input type="button" id="editb" value="E" title="Редактировать" /></td>\
				<td><select id="photos" disabled><option value="0">-нет фотки-</option></select><input type="button" id="viewphoto" title="Просмотр" value="П" disabled></td>\
				<td><input type="button" id="run" value="Пуск"></td>\
				<td id="info" title="Статус рассылки: отправлено, очередь">0, 0</td>\
			</tr>\
		</table>\
	</div>');

	var storage=localStorage.getItem("find-bride-mail-"+name),
		black=$("#black"),
		goal=$("#goal"),
		run=$("#run"),
		writers=$("#writers"),
		subject=$("#subject"),
		photos=$("#photos"),
		vph=$("#viewphoto"),
		text=$("#textarea"),
		info=$("#info"),

		SaveTemplate=function()
		{
			if(typeof storage[storage.active]!="undefined")
				$.extend(storage[storage.active],{text:text.val()});
		},
		SaveStorage=function()
		{
			try
			{
				localStorage.setItem("find-bride-mail-"+name,JSON.stringify(storage));
				var q=localStorage.getItem("find-bride-mail-"+name);
			}
			catch(e)
			{
				if(e==QUOTA_EXCEEDED_ERR)
					alert("Локальное хранилище переполнено");
			}
		},
		EnableWriters=function()
		{
			var no=$("#writers option:first");
			if(writers.find("option").size()>1)
			{
				writers.prop("disabled",false);
				no.text("-писатели-");
			}
			else
			{
				writers.prop("disabled",true);
				no.text("-нет писателей-");
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
			info.text(n+", "+q);
		},
		
	//Лимит отправки 500 писем
	N=name,
	D=new Date();

	D.setHours( D.getTimezoneOffset()/60-3 );
	D=D.getFullYear()+"-"+(D.getMonth()+1)+"-"+D.getDate();
	
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

	//Управление писателями
	writers.change(function(){
		$("#delw,#editw").prop("disabled",$(this).val()==0);
	}).change();

	$("#addw").click(function(){
		var n=prompt("Введите ID писателя");
		if(n && writers.find("[value="+n+"]").size()==0)
		{
			$("<option>").val(n).text(n).appendTo(writers);
			writers.val(n).change();
			storage.writers[n]="";
			EnableWriters();
			SaveStorage();
		}
	});

	$("#editw").click(function(){
		var v=writers.val(),
			t=$("#writers option:selected"),
			n=prompt("Введите новый ID",t.text());
		if(n && typeof storage.writers[n]=="undefined")
		{
			t.val(n).text(n);
			delete storage.writers[v];
			storage.writers[n]="";
			SaveStorage();
		}
	});

	$("#delw").click(function(){
		var v=writers.val(),
			t=$("#writers option:selected");
		if(v && confirm("Вы действительно хотите удалить писателя \""+t.text()+"\"?"))
		{
			t.remove();
			delete storage.writers[v];
			writers.change();
			EnableWriters();
			SaveStorage();
		}
	});

	if(storage)
	{
		storage=$.parseJSON(storage)||{};
		if(typeof storage.last=="undefined")
			storage={last:1,active:0,black:{},writers:{},goal:"search"};
		else
		{
			$.each(storage,function(k,v){
				if(k==parseInt(k))
				{
					$("<option>").val(k).text(v.title).appendTo(subject);
					if(typeof v.photo=="undefined")//Удалить потом
						storage[k].photo=0;
				}
			});

			if(storage.black)
				$.each(storage.black,function(k,v){
					$("<option>").text(v ? v : k).val(k).appendTo(black);
				});
			else
				storage.black={};

			if(storage.writers)
				$.each(storage.writers,function(k,v){
					$("<option>").text(v ? v : k).val(k).appendTo(writers);
				});
			else
				storage.writers={};

			if(storage.goal)
				goal.val(storage.goal);
			
			EnableWriters();
			EnableBlack();
		}
	}
	else
		storage={last:1,active:0,black:{},writers:{},goal:"search"};
		
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
	
	//Лимит
	if(typeof storage["-"+N]=="undefined" || typeof storage["-"+N][D]=="undefined")
	{
		storage["-"+N]={};
		storage["-"+N][D]=500;
	}

	$("#adds").click(function(){
		var n=prompt("Введите тему письма");
		if(n)
		{
			$("<option>").val(storage.last).text(n).appendTo(subject);
			storage[storage.last]={title:n,text:text.val(),sent:",",cnt:0,photo:0};

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
	
	//Фотки
	photos.change(function(){
		var v=$(this).val();
		vph.prop("disabled",v==0);
		if(storage.active>0)
			storage[storage.active].photo=v;
	});
	
	$.get(location.protocol+"//"+location.hostname+"/mess/photo/",function(body){
		body=body.replace(/<script[^>]*>|<\/script>/g,"");
		var ind1=body.indexOf("<body"),
			ind2=body.indexOf(">",ind1+1),
			ind3=body.indexOf("</body>",ind2+1);
		body=body.substring(ind2+1,ind3);
		body=body.replace(/src=/ig,"data-src=");
		body=$("<div>").html(body);
		
		body.find("#girl_gallery div > img").each(function(){
			var id=$(this).parent().find("a").prop("href").match(/(\d+)$/)[1];
			$("<option>").val(id).text(id).data("src",$(this).data("src").replace("/icon/","/full/")).appendTo(photos);
		}).end().remove();
		
		if(photos.find("option").size()>0)
			photos.prop("disabled",false).val(storage.active>0 ? storage[storage.active].photo : 0);
		photos.change();
	});
	
	vph.click(function(){
		if(photos.val()>0)
			window.open(photos.find(":selected").data("src"));
	});
	//[E] Фотки

	//Работа с отправкой
	var top,//TimeOut парсера
		tos,//TimeOut сендера
		runned=false,
		ibp=1000,//Интервал перехода между страницами
		queue={},
		favourites="",
		inwork="",
		cnt,
		qcnt,
		sta,
		ended,
		
		StartSender=function()
		{
			$.each(queue,function(k,v){
				var id=k.substr(1);//Заплатка, ибо если делать ключи числовыми - браузер выстраивает их по порядку (возрастанию)
				console.log(id);
				if(sta.sent.indexOf(","+id+",")==-1)
					$.get(
						location.protocol+"//"+location.hostname+"/mess/send/all/"+id,
						function(r)
						{
							if(r.indexOf("id=\"imgCaptcha\"")>-1)
							{
								var img=$("<img>").load(function(){
									var ocr=OCR($(this));
									if(ocr && sta.sent.indexOf(","+id+",")==-1)
										$.post(
												location.protocol+"//"+location.hostname+"/mess/send/all/"+id,
												{
													"form[value3]":v.s,
													"form[value4]":v.t,
													"form[value36]":photos.val(),
													"form[value40]":r.match(/<input type="hidden" name="form\[value40\]" value="(\d+)" \/>/)[1],
													"form[value37]":ocr,
													"form[value33]":"key",
													go:"Send"
												},
												function(pr)
												{
													v.F(pr.indexOf("Message has been sent!")!=-1);
													img.remove();
												}
										).fail(function(){ v.F(false); img.remove(); });
									else
									{
										v.F(false);
										img.remove();
									}
								}).prop("src",location.protocol+"//"+location.hostname+"/kcaptcha/index.php?id="+id);
							}
							else if(sta.sent.indexOf(","+id+",")==-1)
								$.post(
									location.protocol+"//"+location.hostname+"/mess/send/full/"+id,
									{
										"form[value3]":v.s,
										"form[value4]":v.t,
										"form[value33]":"key",
										go:"Send!"
									},
									function(pr)
									{
										v.F(pr.indexOf("Your message has been successfully sent!")!=-1);
									}
								).fail(function(){ v.F(false); });
						}
					).fail(function(){ v.F(false); });

				delete queue[k];
				return false;
			});

			if(ended && $.isEmptyObject(queue))
			{
				run.triggerHandler("click");
				alert("Поисковая выдача обработана");
			}
			else if(runned)
				tos=setTimeout(StartSender,parseInt(Math.random()*10000)+13000);//Интервал между отправками
		},

		Parse4Send=function(body)
		{
			body=body.replace(/<script[^>]*>|<\/script>/g,"");
			var ind1=body.indexOf("<body"),
				ind2=body.indexOf(">",ind1+1),
				ind3=body.indexOf("</body>",ind2+1);
			body=body.substring(ind2+1,ind3);
			body=body.replace(/src="[^"]+"/ig,"");
			body=$("<div>").html(body);

			body.find(".search_result").each(function(){
				var a=$("td:eq(1) a:first",this),
					id=parseInt(a.prop("href").match(/\/(\d+)$/)[1]),
					login=a.text(),
					age=$(this).html().match(/<td>(\d+) y/i)[1];

					if(inwork.indexOf(","+id+",")==-1 && favourites.indexOf(","+id+",")==-1 && sta.sent.indexOf(","+id+",")==-1 && typeof queue["u"+id]=="undefined" && typeof storage.black[id]=="undefined")
					{
						inwork+=id+",";//Топорная защита от дублей
						$.get(a.prop("href"),function(r)
						{
							var name=r.match(/<td> First name <\/td>\r\n\s+<td><strong>([^<]+)<\/strong>/);
							if(name)
							{
								name=name ? $.trim(name[1]) : false;
								login=login.replace(/ \([^\)]+\)/,"");

								queue["u"+id]={
									s:sta.title.replace(/{login}/ig,login).replace(/{name}/ig,name).replace(/{age}/ig,age),
									t:sta.text.replace(/{login}/ig,login).replace(/{name}/ig,name).replace(/{age}/ig,age),
									F:function(st)
									{
										sta.sent+=id+",";//Эта строка здесь потому что иногда скрипт ведет себе так, буд-то сообщение не отправлено, а на самом деле - отправлено
										if(st)
										{
											sta.cnt++;
											SaveStorage();

											if(--storage["-"+N][D]<=0)
											{
												alert("Достингнут лимит рассылки в 500 писем на сегодня");
												run.click();
											}
										}
										if(runned)
											Status(sta.cnt,qcnt>0 ? --qcnt : 0);
									}
								};
								if(runned)
									Status(sta.cnt,++qcnt);
							}
						});
					}
			});

			if(runned)
			{
				var na=body.find("span.IRB_paginator_active:first").next();
				if(na.is("span.IRB_paginator:has(a)"))
					top=setTimeout(function(){
						$.get(na.find("a").prop("href"),Parse4Send);
					},ibp);
				else if(na.size()==0)
					ended=true;
			}
			body.remove();
		},
		StartParser=function()
		{
			ended=false;
			favourites=",";
			inwork=",";
			
			//Исключаем рассылку по фаворитам
			$("<div>").load(location.protocol+"//"+location.hostname+"/profile/showall/favorites #inp_requests_img",function(){
				$("td",this).each(function(){
					favourites+=$("a:last",this).prop("href").match(/(\d+)$/)[1]+",";
				});
				
				$("<div>").load(location.protocol+"//"+location.hostname+"/profile/showall/matches #inp_requests_img",function(){
					$("td",this).each(function(){
						favourites+=$("a:last",this).prop("href").match(/(\d+)$/)[1]+",";
					});
					
					var pa=$("span.IRB_paginator_active:first").prev();
					if(pa.is("span.IRB_paginator:has(a)"))
						$.get($("span.IRB_paginator:first a:first").prop("href"),Parse4Send);
					else
						Parse4Send("<body>"+$("body").html()+"</body>");
				}).remove();
			}).remove();
		};

	goal.change(function(){
		var tdb=black.closest("td"),
			tdw=writers.closest("td");

		storage.goal=$(this).val();
		if(storage.goal=="writers")
		{
			tdw.show();
			tdb.hide();
		}
		else
		{
			tdw.hide();
			tdb.show();
		}
	}).change();
		
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
			th.val("Пуск");
			runned=false;
			Status(storage.goal=="search" ? sta.cnt : cnt,0);
		}
		else
		{
			cnt=0;
			qcnt=0;
			SaveTemplate();
			SaveStorage();
			sta=storage[storage.active];

			if(storage["-"+N][D]<=0)
				alert("На сегодня лимит рассылки исчерпан (500 писем). Приходите завтра.");
			else if(sta.text=="")
				alert("Введите текст письма!");
			else if(sta.title=="")
				alert("Введите тему письма!");
			else
			{
				//Запуск процесса
				runned=true;
				d.prop("disabled",true);
				th.val("Стоп");
				switch(storage.goal)
				{
					case "search":
						StartParser();
					break;
					case "writers":
						var wrs=writers.find("option");
						if(wrs.size()<2)
						{
							alert("Заполните писателей");
							run.click();
							return;
						}

						Status(0,0);
						wrs.each(function(){
							var id=$(this).val();
							if(id!=0)
							{
								$.get(location.protocol+"//"+location.hostname+"/search/man_profile/20/"+id,function(r){
									var name=r.match(/<td> First name <\/td>\r\n\s+<td><strong>([^<]+)<\/strong>/),
										login=r.match(/<td width="320"><strong>([^<]*)<\/strong><\/td>/)[1];
									name=name ? $.trim(name[1]) : false;
									if(name)
									{
										queue["u"+id]={
											l:login,
											s:sta.title.replace(/{login}/ig,login).replace(/{name}/ig,name),
											t:sta.text.replace(/{login}/ig,login).replace(/{name}/ig,name),
											F:function(){
												Status(++cnt,--qcnt);

												if(qcnt==0)
												{
													alert("Рассылка завершена!");
													run.click();
												}
												
												if(--storage["-"+N][D]<=0)
												{
													alert("Достингнут лимит рассылки в 500 писем на сегодня");
													run.click();
												}

												SaveStorage();//Только для учета отправленных
											}
										};
										Status(cnt,++qcnt);
									}
								});
							}
						});
					break;
					default:
						$("<div>").load(location.protocol+"//"+location.hostname+"/profile/showall/adrirers #inp_requests_img",function(){
							var q=0;

							$("td",this).each(function(){

								var a=$("a:last",this),
									id=a.prop("href").match(/(\d+)$/)[1],
									login=a.text();

								if(sta.sent.indexOf(","+id+",")==-1 && typeof queue["u"+id]=="undefined" && typeof storage.black[id]=="undefined")
								{
									q++;
									$.get(a.prop("href"),function(r){
										var name=r.match(/<td> First name <\/td>\r\n\s+<td><strong>([^<]+)<\/strong>/);
										name=name ? $.trim(name[1]) : false;
										if(name)
										{
											queue["u"+id]={
												l:login,
												s:sta.title.replace(/{login}/ig,login).replace(/{name}/ig,name),
												t:sta.text.replace(/{login}/ig,login).replace(/{name}/ig,name),
												F:function(st)
												{
													if(st)
													{
														sta.sent+=id+",";
														sta.cnt++;
														SaveStorage();
													}
													if(runned)
														Status(sta.cnt,qcnt>0 ? --qcnt : 0);
													if(qcnt==0 && runned)
													{
														run.triggerHandler("click");
														alert("Рассылка завершена");
													}
													if(--storage["-"+N][D]<=0)
													{
														alert("Достингнут лимит рассылки в 500 писем на сегодня");
														run.click();
													}
												}
											};
											Status(sta.cnt,++qcnt);
										}
									});
								}
							}).remove();

							if(q==0)
							{
								run.triggerHandler("click");
								alert("Некому рассылать");
							}

						});
				}

				StartSender();
			}
		}
	});

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