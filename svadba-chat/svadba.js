var htmls = '<div id="count_send"></div>'+
	'<div id="chat_act">'+
	'<b>Активные чаты</b>'+
	'<ul><div align="center" style="padding:10px;">Нет чатов</span></div>'+
	'</div>'+
	'<div class="Popup" style="z-index:999">'+
	'<a href="" class="logo" target="_blank">FREE <span>bot</span></a>'+
	'<div class="wt_send">'+
	'Отсылать по:'+
	'<select id="select">'+
	'<option value="1">Men Online</option>'+
	'<option value="2">Contact List</option>'+
	'</select>'+
	'</div>'+
	'<div class="onl_b">В онлайне:<b id="onl_c"></b></div>'+
	'<div class="messageBox">'+
	'<div class="textMessage" id="textMessage">Текст сообщения</div>'+
	'<div class="textarea" id="textarea"><textarea>Hi {name}!</textarea></div>'+
	'<div class="disable"></div>'+
	'</div>'+
	'<input type="button" id="vote" value="?">'+
	'<input type="button" id="start" value="Начать">'+
	'<input type="button" id="stop" value="Остановить">'+
	'<a href="#" id="black_link">Черный список</a>'+
	'<span style="display: block;padding: 12px;">Дней активации <b id="day">Неограниченно</b></span>'+
	'<div class="speed" style="margin-left:78px;">'+
	'Скорость рассылки:'+
	'<select id="speed">'+
	'<option value="1">Медленно</option>'+
	'<option value="2" selected>Нормально</option>'+
	'<option value="3">Турбо</option>'+
	'</select>'+
	'</div>'+
	'<div class="age">Возраст от: '+
	'<select id="age_from"></select>'+
	'до:'+
	'<select id="age_to"></select>'+
	'</div>'+
	'<div class="fake"><label><input type="checkbox" id="fak"> исключать фейки</label></div>'+
	'<div class="clear"></div>'+
	'<div class="BlockP Bleck">'+
	'<div class="border"></div>'+
	'<div class="B_header"><div class="B_border"><h3>Черный список</h3></div></div>'+
	'<div class="B_inner">'+
	'<div id="mess"></div>'+
	'ID: <input type="text" id="black_id" style="width:100px;">'+
	'<a href="#" id="add_blacklist" class="button_1">Добавить в спиcок</a>'+
	'<ul id="list_b"></ul>'+
	'</div>'+
	'<div class="B_footer"><a href="#" id="close_B" class="button_2 fr">Закрыть</a><div class="clear"></div></div>'+
	'</div>'+
	'<div class="shadow"></div>';
$('body').prepend(htmls);
$('head').append('<style>body{padding-top:81px;font-family:Arial,Helvetica,sans-serif;padding-top:0!IMPORTANT}.Popup{height:40px;background:#f7f7f7;border-bottom:solid 1px #d8d8d8;position:absolute;left:25%;top:0;z-index:9999;font-size:12px;width:136px;overflow:hidden}.Popup .ms{display:none}.Popup:hover{height:100px;width:100%;left:0;overflow:visible}.Popup:hover .ms{display:block}.logo{margin-top:7px;margin-left:10px;display:inline-block;float:left;margin-right:10px;font-size:23px;text-decoration:none}.logo span{color:#666}.wt_send{float:left;margin-top:8px;margin-right:10px}.messageBox{float:left;margin-top:4px;margin-right:10px;width:207px;padding:5px;background:#b2c8ed}.messageBox:hover{background:#c0d7fd}.textarea{display:none;width:200px;position:absolute}.textarea textarea{margin:0;border:solid 1px #d8d8d8;font-family:arial;width:200px;height:70px}.textMessage{background:#fff;border:solid 1px #d8d8d8;font-family:arial;padding:2px 10px;font-size:12px;cursor:text;white-space:nowrap;overflow:hidden}.messageBox.noact .disable{position:absolute;left:0;top:0;right:0;bottom:0;background:#fff;opacity:.5}#start,#stop{float:left;margin-top:9px;margin-right:10px}#stop{float:left;display:none}#vote{float:left;margin-top:9px;margin-right:5px}#shadow{background:#b2c8ed;opacity:.5;position:fixed;z-index:999;left:0;right:0;top:0;bottom:0}#shadow2{background:#b2c8ed;opacity:.5;position:fixed;z-index:999;left:0;right:0;top:0;bottom:0}#numb{position:fixed;top:45%;left:33%;z-index:9999;font-size:46px;color:black}#black_link{float:left;margin-top:12px;margin-right:10px}.onl_b{float:left;margin-top:13px;margin-right:10px}#up_online{float:left;margin-right:10px;margin-top:10px}.fake{float:left;margin-left:10px;margin-top:13px}#user-info{z-index:9999 !important}#chat_act{position:absolute;background:#FFF;left:0;top:0;width:24%;height:143px;border:solid 1px #CCC;z-index:997;overflow:hidden;font-size:12px}#chat_act b{padding:5px;display:block;background:#f7f7f7}#chat_act ul{overflow:auto;height:118px;padding:0;margin:0}#chat_act ul li{list-style:none;padding:0;margin:0;display:block;border-bottom:solid 1px #CCC;padding:2px 5px}#chat_act ul li:hover{background:#f0f7ff;cursor:pointer}#chat_act ul li.active{background:#069;color:#FFF}#chat_act ul li .ics{width:11px;height:11px;background-image:url("//47ad.itocd.net/chat/i/sv/icons/static.png");background-position:0 -12px;display:inline-block}#chat_act ul li .ics.chat{background-position:0 -24px}#chat_act ul li .ics.video_chat{background-position:0 -99px;height:7px}#chat_act ul li .ics.message{background-image:url("//35ad.itocd.net/chat/i/icons/animate.gif");background-position:0 0;padding:0;margin-right:3px}#count_send{position:absolute;left:334px;top:114px;z-index:99;font-size:22px;color:#333}.speed{margin-left:0;float:left;margin-top:10px}.fone_r{margin-left:10px;float:left;margin-top:10px}.age{margin-left:10px;float:left;margin-top:10px}.country{margin-left:10px;float:left;margin-top:10px}.button_1,.button_01{background:#5685d6;border:solid 1px #5e81be;box-shadow:inset 0 0 2px #d3dcec;-moz-box-shadow:inset 0 0 2px #d3dcec;-webkit-box-shadow:inset 0 0 2px #d3dcec;color:#d3dcec;padding:5px;display:inline-block;margin:0 5px;text-shadow:1px 1px 0 #5e81be;text-decoration:none}.button_1:hover,.button_01:hover{background:#6593e1;text-decoration:none;color:#fff}.button_1:active,.button_1.active{box-shadow:inset 0 0 3px #b6b6b6;-moz-box-shadow:inset 0 0 3px #b6b6b6;-webkit-box-shadow:inset 0 0 3px #b6b6b6;background:#e8e8e8;color:#7c7c7c;border:solid 1px #b6b6b6;text-shadow:1px 1px 0 #FFF}.button_2{box-shadow:inset 0 0 3px white;-moz-box-shadow:inset 0 0 3px #fff;-webkit-box-shadow:inset 0 0 3px white;background:#e9e9e9;color:#7c7c7c;border:solid 1px #CCC;text-shadow:1px 1px 0 white;padding:5px;display:block;margin:0;margin-right:5px}.button_2:hover{background:#f1f1f1;text-decoration:none;color:#7c7c7c}.button_2:active{background:#fff;box-shadow:inset 0 0 3px #ccc;-moz-box-shadow:inset 0 0 3px #ccc;-webkit-box-shadow:inset 0 0 3px #ccc;text-shadow:none}.fr{float:right}.fl{float:left}a{outline:0;text-decoration:none;color:#5685d6}a:hover{text-decoration:underline}.clear{clear:both;height:0;overflow:hidden;display:block}.shadow,.shadow_1{position:fixed;top:0;bottom:0;left:0;right:0;background:#000;opacity:.5;z-index:999;display:none}.error{display:block;border:solid 1px #e89b88;color:#000;background:#ffefe8;padding:3px;font-weight:bold}.success{display:block;border:solid 1px #d1c992;color:#000;background:#eee5b8;padding:3px;font-weight:bold}.BlockP{padding:10px;position:absolute;left:50%;width:300px;margin-left:-150px;top:100px;z-index:9999;display:none}.BlockP .border{background:#5685d6;position:absolute;left:0;right:0;top:0;bottom:0;opacity:.5}.BlockP .B_header{position:relative;z-index:999;background:#5685d6;border:solid 1px #5e81be}.BlockP .B_header .B_border{border-top:solid 1px #80a2dd;border-bottom:solid 1px #517dc9;padding:0 10px;height:30px;overflow:hidden}.BlockP .B_header .B_border h3{font-size:14px;font-weight:bold;color:white;margin-top:6px;display:inline-block}.BlockP .B_inner{background:#FFF;position:relative;z-index:999;padding:10px}.BlockP .B_inner ul,.BlockP .B_inner ul li{padding:0;margin:0;list-style:none}.BlockP .B_inner ul{margin-top:10px;max-height:200px;overflow:auto}.BlockP .B_inner ul li{margin-bottom:5px;background:#EEE;border:solid 1px #CCC;display:block;padding:5px}.BlockP .B_footer{background:#f1f1f1;padding:12px;position:relative;z-index:999;border-top:solid 1px #c4c4c4}.Popup .phone{float:left}.Popup .phone span{display:block;float:left;padding-left:20px}.Popup .phone span img{width:30px;float:left;margin-right:10px}');