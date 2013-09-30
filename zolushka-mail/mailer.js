$(function(){
	var header=top.frames["NavBannerRight"].document,
		main=top.frames["NavMain"];

	if(header.once)
		return;
	header.once=true;

	$("head",header).append('<style>.Popup { height: 99px; border-bottom: solid 1px #D8D8D8;position: fixed;right: 0;width: 200px;top: 0; z-index:9999; } #openmailer { margin:40px 0 0 10px; }</style>');
	$("body",header).append('<div class="Popup"><input type="button" id="openmailer" value="Открыть рассылку" /></div>');

	$("#openmailer",header).click(function(){
		var w=545,h=450,
			win=window.open('','zolushkamailer','height='+h+',width='+w+',toolbar=no,directories=no,menubar=no,scrollbars=no,status=no,top='+Math.round((screen.height-h)/2)+',left='+Math.round((screen.width-w)/2));

		//$.getJSON("http://zolushka.wmid.com.ua/mailer.php?name="+$("#uxWelcomeTxt",main.document).html().replace("Добро пожаловать ","")+"&window=?",function(r){
		$.get("https://raw.github.com/liginet/free/master/zolushka-mail/mailer.html",function(ses){
			win.document.open('text/html','replace');
			//win.document.ZOLUSHKA={remain:r.remain,date:r.date,name:r.name};
			win.document.write(ses);
			win.document.close();
		});
	});
});