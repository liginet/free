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