var nickname = "";
var chatwith = "";

function set_nickname(){
	nickname = document.getElementById("nickname").value;
	document.getElementById("info-nickname").innerHTML = nickname;
}

function set_chatwith(){
	chatwith = document.getElementById("chatwith").value;
	document.getElementById("info-chatwith").innerHTML = chatwith;
}

set_nickname();
set_chatwith();

function send_msg(){
	var msg = document.getElementById("send-box").value;

	if(msg.length < 1){
		document.getElementById("send-box").placeholder = "Minimu length is 1 character!"
	}else{
		document.getElementById("send-box").placeholder = ""

		ajax("POST", "submit_msg", msg, -1, nothing)
		var chat_box_content = document.getElementById("chat-box").innerHTML;

		document.getElementById("chat-box").innerHTML = chat_box_content + "<span><b>You: </b>" + msg + "</span><br>";
		document.getElementById("send-box").value = "";

	}
}


function nothing(t){

}

function fail(msg){
	var fail_box_content = document.getElementById("fail-box").innerHTML;
	document.getElementById("fail-box").innerHTML = fail_box_content + "<span>" + msg + "</span><br>";
}



function ajax(type, path, data, timeout, func){
	var xhr = new XMLHttpRequest();
 
	xhr.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200){
			func(this.responseText);
		}
		/*
		else{
			fail(this.status + " " + this.responseText);
		}*/
	};
	xhr.open(type, path, true);
	if(timeout > 0) xhr.timeout = timeout;

	var fin = new Object();
	fin.nick = nickname;
	fin.stranger = chatwith;
	var json= JSON.stringify(fin);

	xhr.setRequestHeader("info", json)
	xhr.send(data);
}


function new_msg(msg){
	var chat_box_content = document.getElementById("chat-box").innerHTML;
	document.getElementById("chat-box").innerHTML = chat_box_content + "<span><b>Stranger: </b>" + msg + "</span><br>";
}


var time = 5000;
function check_msg(){	
	ajax("GET", "get_msg", "", time, new_msg)
	setTimeout(check_msg, time);
}

check_msg();