var nickname = "";   //global variable for nickname
var chatwith = "";   //global variable for stranger nickname (chatwith)
var time = 5000;   //timeout in ms, same as server variable
var get_msg_last_time = 0;   //last time (millis()) of getting new message - used for handling server fall or unexpected erros

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
function ajax(type, path, data, timeout, func, timeout_func){   //ajax XHR wrapper
	var xhr = new XMLHttpRequest();
 
	xhr.onload = function() {
		//if(this.readyState === 4){
			if(this.status === 200){
				func(this.responseText);   //call gived function
			}
			else if(this.status === 204){   //no data
				timeout_func();   //call timeout function because server closed connection with return code 204 - no conten (data)
			}

			else if(this.status === 0){   //no data
				console.log("Status is 0, error: " + this.statusText);
				//timeout_func();   //call timeout function because server closed connection with return code 204 - no conten (data)
			}

			else{
				console.log(this.status);
				fail("Unknown status: " + this.status);
			}
		//}
		/*
		else{
			fail(this.status + " " + this.responseText);
		}*/
	};
	xhr.open(type, path, true);
	if(timeout > 0){
		xhr.timeout = timeout;   //set timeout if timeout is bigger than 0

		xhr.ontimeout = function (e){
			//console.log(e);
			//console.log("timeout");
			timeout_func();
		};
	}

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
	var send_box = document.getElementById("send-box");   //get index to send-box element
	var msg = send_box.value;   //get mesg from input textbox

	if(msg.length < 1){   //skip blank messages
		send_box.placeholder = "Minimum length is 1 character!";
	}else{
		send_box.placeholder = "";   //remove placeholder from input message text box

		ajax("POST", "submit_msg", msg, -1, nothing, nothing);   //send new message to server without timeout

		var chat_box = document.getElementById("chat-box");   //get index to chat-box element
		var chat_box_content = chat_box.innerHTML;   //get current data from chat box
		chat_box.innerHTML = chat_box_content + "<span><b>You: </b>" + msg + "</span><br>";   //put current data + new data to chat box  
		chat_box.scrollTop = chat_box.scrollHeight;   //scroll into view in chat box

		send_box.value = "";   //clear input message text box value
	}
}


function new_msg(msg){   //function for displaying new message from stranger
	var chat_box = document.getElementById("chat-box");   //get index to chat-box element
	var chat_box_content = chat_box.innerHTML;   //get current data from chat box
	chat_box.innerHTML = chat_box_content + "<span><b>Stranger: </b>" + msg + "</span><br>";   //put current data + new data to chat box
	chat_box.scrollTop = chat_box.scrollHeight;   //scrol into view in chat box

	check_msg();   //call function check_msg to create ajax request with timeout
}


function check_msg(){   //for calling ajax and setting up new interval
	ajax("GET", "get_msg", "", time, new_msg, check_msg);   //send xhr request with timeout
	get_msg_last_time = Date.now();
	//setTimeout(check_msg, time);   //set timeout to call new function (call after timeout)
}

function renew_check_msg_cycle(){
	if(Date.now() - get_msg_last_time > time){
		check_msg();
	}
}
//----------functions for sending and receiving messages (and also displaying)---------



//----------startup----------
set_nickname();
set_chatwith();

check_msg();

setInterval(renew_check_msg_cycle, 5000);   //check for renewing ajax connection every 5 seconds
//----------startup----------