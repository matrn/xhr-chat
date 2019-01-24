Simple chat based on ajax XMLHttpRequest (XHR)
==========

Chat contains python web server and javascript client for chat communication. For communication between client amd server are used XHR requests.

## Getting Started

After downloading this repository run file server.py with python 2.7 (tested with this version). Open your browser, write here your computer IP address and port specified in function main() (default is 8008).

## About

I was thinking about chats in the browser, how can it work effectively withou websockets? One time I got a great idea. If I use simple ajax and set timeout to big number (for example 20 seconds), I can respond on the server side in the moment when I have new message for client. Great idea, so I started work and after +-2 hours I had first working prototype. So I invest few more hours to programming this thing and created this!

After that I was googling about it and I find out that this technique is called <a href="https://en.wikipedia.org/wiki/Push_technology#Long_polling">Long polling</a>. So in this case this is demonstration of well known chat technique.

## Usage

Tested with python2.7
#### Server:
 * ```python server.py```

### Client:
 * Open your browser, write your IP:8008 and start chatting!

## ToDo

 * ~~Documentation~~
 * ~~Add style to website~~
 * ~~Fix high CPU consumption (10%) by python~~
 * ~~fix error: [Errno 32] Broken pipe - probably caused by timeout closed connection from client~~
