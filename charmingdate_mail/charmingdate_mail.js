$(function(){

    $("body").prepend('<div id="sparner">\
        <table>\
            <tr><th>Цель</th><td><select id="goal"><option value="search">Поиск</option><option value="writers">Писатели</option></select></td></tr>\
            <tr><th>Писатели</th><td><select id="writers"><option value="0">-пусто-</option></select><input type="button" id="addw" value="+" title="Добавить" /><input type="button" id="delw" value="&minus;" title="Удалить" /><input type="button" id="editw" value="E" title="Редактировать" /></td></tr>\
            <tr><th>Тема</th><td><select id="subject"><option value="0">Выберите тему</option><input type="button" id="adds" value="+" title="Добавить тему" /><input type="button" id="dels" value="&minus;" title="Удалить" /><input type="button" id="edits" value="E" title="Редактировать" /></select></td></tr>\
            <tr><td colspan="2"><textarea id="textarea" placeholder="Текст">Hi, {name}!</textarea></td></tr>\
            <tr><th>Отправитель</th><td><select id="sender" style="width:100%"><option value="0">Загрузка...</option></select></td></tr>\
            <tr><th>situation</th><td><select id="situation" style="width:100%"><option value="1">Hi [First Name]</option><option value="2">Hello [First Name]</option><option value="3">Dear [First Name]</option><option value="4">Hey [First Name]</option></select></td></tr>\
            <tr><th><input type="button" id="help" value="?"><input type="button" id="run" value="Пуск"></th><td id="info" title="Статус рассылки: отправлено, очередь">0, 0</td></tr>\
        </table>\
    </div>');

    var name=document.body.innerHTML.match(/\( (S\d+) \)/)[1], storage=localStorage.getItem("charmingdate-clagt-"+name), goal = $("#goal"), writers = $("#writers"), subject = $("#subject"), text = $("#textarea"), goal = $("#goal"), run = $("#run"), situation = $("#situation"), sender = $("#sender"), queue = [],
    SaveTemplate = function ()
    {
        if (typeof storage[storage.active] != "undefined") {
            $.extend(storage[storage.active], {
                text : text.val() 
            });
        }
    },
    SaveStorage = function()
    {
        try
        {
            localStorage.setItem("charmingdate-clagt-" + name, JSON.stringify(storage));
        }
        catch (e)
        {
            if (e == QUOTA_EXCEEDED_ERR) {
                alert("Локальное хранилище переполнено");
            }
        }
    },
    EnableWriters = function ()
    {
        var a = $("#writers option:first");
        if (writers.find("option").size() > 1) {
            writers.prop("disabled", false);
            a.text("-писатели-")
        }
        else {
            writers.prop("disabled", true);
            a.text("-нет писателей-")
        }
    },
    Status=function(n)
    {
        $("#info").text(n + ", " + queue.length);
    };

    $("#addw").click(function ()
    {
        var n = prompt("Введите ID писателя(ей)");
        if (n)
        {
            $.each(n.split(/[,; ]+/),function(key,val){
                if (writers.find("[value=" + val + "]").size() == 0) {
                    $("<option>").val(val).text(val).appendTo(writers);
                    writers.val(val).change();
                    storage.writers[val] = "";
                }
            });
            EnableWriters();
            SaveStorage();
        }
    });
    $("#editw").click(function ()
    {
        var v = writers.val(), t = $("#writers option:selected"), n = prompt("Введите новый ID", 
        t.text());
        if (n && typeof storage.writers[n] == "undefined") {
            t.val(n).text(n);
            delete storage.writers[v];
            storage.writers[n] = "";
            SaveStorage()
        }
    });
    $("#delw").click(function ()
    {
        var v = writers.val(), t = $("#writers option:selected");
        if (v && confirm("Вы действительно хотите удалить писателя \"" + t.text() + "\"?")) {
            t.remove();
            delete storage.writers[v];
            writers.change();
            EnableWriters();
            SaveStorage()
        }
    });

    goal.change(function(){
        var trw=writers.closest("tr");

        storage.goal=$(this).val();
        if (storage.goal=="search")
            trw.hide();
        else
            trw.show();
    });

    situation.change(function(){
        situation.goal=$(this).val();
    });

    $("#sparner :input").prop("disabled",true);
    $("<div>").load("/clagt/woman/women_profiles_posted.php?groupshow=4&listnum=1000 #DataGrid1",function(){
        sender.empty();
        $(this).find("tr:gt(0)").find("td:eq(2) a").not(".noprivlink").each(function(){
            var girl=$(this).text();
            $("<option>").val( girl ).text( $(this).closest("tr").find("td:eq(3)").text()+" ("+girl+")" ).appendTo(sender);
        });

        $(this).remove();
        $("#sparner :input").prop("disabled",false);
        
        if (storage)
        {
            storage = jQuery.parseJSON(storage) || {};
            if (typeof storage.last == "undefined") {
                storage = {
                    last : 1, active : 0, writers : {}, goal : "search", sender : "", situation : "1"
                };
            }
            else
            {
                $.each(storage, function (k, v)
                {
                    if (k == parseInt(k)) {
                        $("<option>").val(k).text(v.title).appendTo(subject);
                    }
                });
                if (storage.writers)
                {
                    $.each(storage.writers, function (k, v) 
                    {
                        $("<option>").text(v ? v : k).val(k).appendTo(writers) 
                    });
                }
                else {
                    storage.writers = {};
                }
                if (storage.goal) {
                    goal.val(storage.goal).change();
                }
                if (storage.sender) {
                    sender.val(storage.sender);
                }
                if (storage.situation) {
                    situation.val(storage.situation);
                }
                EnableWriters();
            }
        }
        else {
            storage = {
                last : 1, active : 0, writers : {}, goal : "search", sender : "", situation : "1"
            };
        }
        subject.change(function ()
        {
            var v = $(this).val(), save = storage.active != v, controls = $("#dels,#edits,#saves,#run");
            if (save) {
                SaveTemplate();
            }
            if (v == "0") {
                controls.prop("disabled", true);
                text.val(text.prop("defaultValue"));
                Status(0, 0)
            }
            else if (typeof storage[v] == "undefined") {
                $("option:selected", this).remove();
            }
            else {
                text.val(storage[v].text);
                Status(storage[v].cnt, 0);
                controls.prop("disabled", false)
            }
            storage.active = v;
            if (save) {
                SaveStorage();
            }
        }).val(storage.active).change();

        writers.change(function ()
        {
            $("#delw,#editw").prop("disabled", $(this).val() == 0)
        }).change();
    });

    $("#adds").click(function ()
    {
        var n = prompt("Введите тему письма");
        if (n)
        {
            $("<option>").val(storage.last).text(n).appendTo(subject);
            storage[storage.last] = {
                title : n, text : text.val(), sent : ",", cnt : 0
            };
            subject.val(storage.last++).change()
        }
    });
    $("#saves").click(function ()
    {
        SaveTemplate();
        SaveStorage()
    });
    $("#edits").click(function ()
    {
        var v = subject.val(), t = $("#subject option:selected"), n = prompt("Введите новую тему письма", 
        t.text());
        if (n && typeof storage[v] != "undefined") {
            t.text(n);
            storage[v].title = n;
            SaveStorage()
        }
    });
    $("#dels").click(function ()
    {
        var v = subject.val(), t = $("#subject option:selected");
        if (v && (typeof storage[v] == "undefined" || confirm("Вы действительно хотите удалить письмо \"" + t.text() + "\"?")))
        {
            var a = t.next().size() > 0 ? t.next() : t.prev();
            t.remove();
            delete storage[v];
            subject.val(a.val()).change()
        }
    });

    var top,
        tos,
        runned = false,
        ibp = 1000,
        iws = 1000,
        cnt = 0,
        sta, 
        nextpage = false,

        StartSender = function ()
        {
            if ( queue.length > 0 ) {
                var mess = queue.shift();
                $.post(
                    "/clagt/admire/send_admire_mail2_old.php",
                    {
                        greet : situation.val(),
                        body : mess.t,
                        provision : "Y",
                        hidden : "",
                        title : "",
                        body_cn : "",
                        sendmailsub_save : "Send",
                        sendtimes : 0,
                        womanid : sender.val(),
                        manid : mess.id
                    },
                    function (r)
                    {
                        if ( r.indexOf("Bad Request, Please try later.") != -1 ) {
                            run.click();
                            alert("Видимо, превышен лимит отправки.");
                        }
                        else if ( r.indexOf("Maximum amount of admirer mails sent by one lady in 24") != -1 ) {
                            run.click();
                            alert( "Эта девушка уже достигла лимита отправленных писем. Выберите другую." );
                        }
                        else {
                            mess.F( r.indexOf("Your Admirer Mail has been sent successfully!") != -1 );
                        }
                    }
                ).always(function ()
                {
                    if (runned) {
                        tos=setTimeout(StartSender,iws);
                    }
                });
            }
            else if (runned) {
                tos=setTimeout(StartSender,iws);
            }
        },

        Parse4Send = function (r)
        {
            if (queue.length>0)
            {
                tos=setTimeout(function()
                {
                    Parse4Send(r);
                },1000);
                return;
            }

            var body = r.replace(/<script[^>]*>|<\/script>/g,""),
                ind1 = body.indexOf("<body"),
                ind2 = body.indexOf(">",ind1+1),
                ind3 = body.indexOf("</body>",ind2+1);
            body = body.substring(ind2+1,ind3);
            body = body.replace(/(src="[^"]+")/ig,"data-$1");
            body = $("<div>").html(body);

            body.find("table:eq(21)").find("tr:gt(0)").each(function ()
            {
                var id = $.trim($("td:eq(2)", this).text()),
                    repl = {
                        name:$.trim($("td:eq(3)", this).text()),
                        age:parseInt($("td:eq(4)", this).text())
                    };

                if (sta.sent.indexOf("," + id + ",")==-1 && inprogress.indexOf("," + id + ",") == -1) {
                    inprogress += id + ",";

                    var s=sta.title,
                        t=sta.text;

                    $.each(repl, function (k,v){
                        var R=new RegExp("{"+k+"}","ig");
                        s=s.replace(R,v);
                        t=t.replace(R,v);
                    });
                    queue.push({
                        id : id,
                        s : s,
                        t : t,
                        F : function (success)
                        {
                            if (success) {
                                sta.sent+=id+",";
                                sta.cnt++;
                                SaveStorage();
                            }
                            Status(sta.cnt);
                        }
                    });
                    if (runned) {
                        Status(sta.cnt);
                    }
                }
            });

            if (runned)
            {
                var next=body.find("table:eq(22) img:eq(2)").parent();
                if (next.is("a")) {
                    nextpage=next.attr("href");
                    top=setTimeout(function ()
                    {
                        $.get(nextpage,Parse4Send);
                    },ibp);
                }
            }
            body.remove();
        },
        StartParser = function ()
        {
            if (nextpage) {
                $.get(nextpage,Parse4Send);
            }
            else {
                var first=$("table:eq(22) img:eq(0)").parent();
                if (first.is("a"))
                {
                    nextpage=first.attr("href");
                    $.get(nextpage,Parse4Send);
                }
                else {
                    Parse4Send("<body>"+$("body").html()+"</body>");
                }
            }
        };

    run.click(function ()
    {
        var e = $(this), d = $("#spamer :input").not(this).not("#help");
        if (runned)
        {
            d.prop("disabled", false);
            clearTimeout(tos);
            clearTimeout(top);
            queue = [];
            e.val("Пуск");
            runned = false;
            Status(storage.goal == "search" ? sta.cnt : cnt);
        }
        else
        {
            cnt = 0;
            SaveTemplate();
            SaveStorage();

            sta = storage[storage.active];
            if (sta.text == "") {
                alert("Введите текст письма!");
            }
            else
            {
                runned = true;
                inprogress = ",";
                d.prop("disabled", true);
                e.val("Стоп");
                switch (storage.goal)
                {
                    case "search":
                        StartParser();
                        break;
                    default:
                        var f = writers.find("option");
                        if (f.size() < 2) {
                            alert("Заполните писателей");
                            run.click();
                        }
                        else {
                            Status(0);
                            f.each(function ()
                            {
                                var id = $(this).val();
                                if (id && sta.sent.indexOf("," + id + ",") == -1 && inprogress.indexOf("," + id + ",") == -1)
                                {
                                    inprogress += id + ",";
                                    queue.push({
                                        id : id,
                                        s : sta.title,
                                        t : sta.text,
                                        F : function (success)
                                        {
                                            sta.sent+=id+",";
                                            sta.cnt++;

                                            if (success) {
                                                ++cnt;
                                            }
                                            Status(cnt);

                                            if (queue.length==0) {
                                                run.click();
                                                alert("Рассылка завершена");
                                            }

                                            SaveStorage();
                                        }
                                    });
                                    Status(cnt);
                                }
                            });

                            if (queue.length == 0) {
                                run.click();
                                alert("Некому рассылать");
                            }
                        }
                }
                StartSender();
            }
        }
    });

});