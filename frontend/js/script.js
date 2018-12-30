var nickname = "";   //global variable for nickname
var chatwith = "";   //global variable for stranger nickname (chatwith)
var time = 5000;   //timeout in ms, same as server variable


//----------settings functions---------
function set_nickname(){   //for setting up new nickname
	nickname = document.getElementById("nickname").value;
	document.getElementById("info-nickname").innerHTML = nickname;
}

function set_chatwith(){   //for settings up new stranger nickname
	chatwith = document.getElementById("chatwith").value;
	document.getElementById("info-chatwith").innerHTML = chatwith;
}
//----------settings functions---------


//----------requests and assitants functions----------
function ajax(type, path, data, timeout, func){   //ajax XHR wrapper
	var xhr = new XMLHttpRequest();
 
	xhr.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200){
			func(this.responseText);   //call gived function
		}
		/*
		else{
			fail(this.status + " " + this.responseText);
		}*/
	};
	xhr.open(type, path, true);
	if(timeout > 0) xhr.timeout = timeout;   //set timeout if timeout is bigger than 0

	var fin = new Object();   //create new object (for JSON)
	fin.nick = nickname;   //save nickname
	fin.stranger = chatwith;   //save stranger nickname
	var json = JSON.stringify(fin);   //create JSON

	xhr.setRequestHeader("info", json);   //add JSON to header
	xhr.send(data);   //send data
}


function fail(msg){   //display fail messages in special box
	var fail_box_content = document.getElementById("fail-box").innerHTML;
	document.getElementById("fail-box").innerHTML = fail_box_content + "<span>" + msg + "</span><br>";
}


function nothing(t){   //useful function, huh?

}
//----------requests and assitants functions----------


//----------functions for sending and receiving messages (and also displaying)---------
function send_msg(){   //for sending new message via ajax and displaying in message box
	var msg = document.getElementById("send-box").value;   //get mesg from input textbox

	if(msg.length < 1){   //skip blank messages
		document.getElementById("send-box").placeholder = "Minimum length is 1 character!";
	}else{
		document.getElementById("send-box").placeholder = "";   //remove placeholder from input message text box

		ajax("POST", "submit_msg", msg, -1, nothing);   //send new message to server without timeout
		var chat_box_content = document.getElementById("chat-box").innerHTML;   //get current data from chat box

		document.getElementById("chat-box").innerHTML = chat_box_content + "<span><b>You: </b>" + msg + "</span><br>";   //put current data + new data to chat box
		document.getElementById("send-box").value = "";   //clear input message text box value
	}
}


function new_msg(msg){   //function for displaying new message from stranger
	var chat_box_content = document.getElementById("chat-box").innerHTML;   //get current data from chat box
	document.getElementById("chat-box").innerHTML = chat_box_content + "<span><b>Stranger: </b>" + msg + "</span><br>";   //put current data + new data to chat box
}


function check_msg(){   //for calling ajax and setting up new interval
	ajax("GET", "get_msg", "", time, new_msg);   //send xhr request with timeout
	setTimeout(check_msg, time);   //set timeout to call new function (call after timeout)
}
//----------functions for sending and receiving messages (and also displaying)---------



//----------startup----------
set_nickname();
set_chatwith();

check_msg();
//----------startup----------