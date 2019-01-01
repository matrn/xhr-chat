#!/usr/bin/env python

from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler
from SocketServer import ThreadingMixIn
import threading
from optparse import OptionParser
from subprocess import call
import os
import json
import time

mimetypes = {
	'html':'text/html',
	'css':'text/css',
	'js':'application/javascript',

	'py':'text/plain',
	'sh':'text/plain',
	'c':'text/plain',
	'cpp':'text/plain',
	'h':'text/plain',
	'':'text/plain',

	'png':'image/png',
	'jpg':'image/jpg',
	'jpeg':'image/jpeg',
	'gif':'image/gif',
	'ico':'image/ico',
}

PROGRAM_DIR = os.path.dirname(os.path.realpath(__file__))

msgs = []   #variable for saving received messages
timeout = 5000   #timeout - same as in script.js

millis = lambda: int(round(time.time() * 1000))   #function for getting current millis (unix time)



class RequestHandler(BaseHTTPRequestHandler):   #function for handling requests
	def do_GET(self):   #handle GET request	
		request_path = self.path   #request path
		
		print("GET request, path >" + request_path + "<")

		#remove security dangerous characters - handle path traversal possibility, or is it already handled in library? idk
		request_path = request_path.replace("../", "/")


		if request_path == "/":   #ROOT PATH
			send_file(self, "frontend/html/index.html")


		elif request_path.startswith("/html/") and request_path.endswith(".html"):   #HTML
			filename = os.path.basename(request_path)
			send_file(self, "frontend/html/" + filename)


		elif request_path.startswith("/css/") and request_path.endswith(".css"):   #CSS
			filename = os.path.basename(request_path)
			send_file(self, "frontend/css/" + filename)


		elif request_path.startswith("/js/") and request_path.endswith(".js"):   #JS
			filename = os.path.basename(request_path)
			send_file(self, "frontend/js/" + filename)


		elif request_path.startswith("/img/") and (request_path.endswith(".png") or request_path.endswith(".jpg") or request_path.endswith(".jpeg") or request_path.endswith(".gif") or request_path.endswith(".ico")):   #IMG
			filename = os.path.basename(request_path)
			send_file(self, "frontend/img/" + filename)


		elif request_path == "/get_msg":   #for sending messages to client
			'''
			content_length = self.headers.getheaders('content-length')   #get length of request body
			length = int(content_length[0]) if content_length else 0
		
			request_body = self.rfile.read(length)   #get request body
			'''
			request_info = self.headers.getheaders('info')[0]   #get json data from header saved under info

			print("info JSON: >" + request_info + "<")
			
			info = parse_info(request_info)   #parse nickname and stranger nickname from JSON
			nick = info[0]
			stranger = info[1]

			start = millis()   #actual millis (unix time)
			leave = 0

			while leave != 1 and millis() - start < timeout - 100:   #timeout is without 100ms because we want to avoid getting error: [Errno 32] Broken pipe
 
				for a in msgs:
					if(a[0] == stranger and a[1] == nick):
						self.send_response(200)
						self.send_header("Content-type", "text/html")
						self.end_headers()
						self.wfile.write(a[2])
						self.wfile.write('\n')

						msgs.remove(a)   #remove this msg from list because we found correct client

						leave = 1   #leave while loop
						print("data sent, leaving")
						break   #leave this for loop

				time.sleep(0.1)   #for lowering CPU consumption

			if leave == 0:   #no data for client
				print("leaving because timeout")

				self.send_response(204)
				self.send_header("Content-type", "text/plain")
				self.end_headers()
				self.wfile.write("No data")


		else:   #ERROR 404
			send_404(self)


	def do_POST(self):   #handle POST request		
		request_path = self.path   #request path
		
		print("POST request, path >" + request_path + "<")
		
		if request_path == "/submit_msg":   #new message from client
			content_length = self.headers.getheaders('content-length')   #get length of request body
			length = int(content_length[0]) if content_length else 0
		
			request_body = self.rfile.read(length)   #get request body
			request_info = self.headers.getheaders('info')[0]   #get info JSON from header

			print("info JSON >" + request_info + "<")

			info = parse_info(request_info)   #parse nickname and stranger nickname from JSON

			msgs.append((info[0], info[1], request_body))   #add this msg to msgs list

			self.send_response(200)
			self.send_header("Content-type", "text/html")
			self.end_headers()
			self.wfile.write("OK")


		else:   #ERROR 404
			send_404(self)


	do_PUT = do_POST
	do_DELETE = do_GET



def parse_info(msg):   #function for parsing nickname and stranger nickname from JSON
	data = json.loads(msg)
	return data["nick"], data["stranger"]



def send_file(self, filename):   #for sending file to client
	try:
		mimetype = get_mimetype(filename)   #get filename with path and mimetype
			
		if filename != None and mimetype != None:   #check if convert file path was successful
			full_path = PROGRAM_DIR + os.sep + filename   #get full path to file
			print("FULL PATH:%s" % full_path)
			try:
				f = open(full_path)  #try to open file
	
				self.send_response(200)
				self.send_header('Content-type', mimetype)
				self.end_headers()					
				self.wfile.write(f.read())   #read file and write it to the client	
				f.close()   #close file

			except:
				print("Error: Unable to open file")
				send_404(self)

		else:
			send_404(self)

	except IOError:
		print("Error: Unknown error")
		send_404(self)


def send_404(self):   #for sending ERROR 404
	self.send_error(404,'File Not Found: %s' % self.path)   #send 404 error


def get_mimetype(filename):   #function for getting mimetype
	mimetype = ""

	try:
		name, ext = os.path.splitext(filename)   #get extension

		try:
			return mimetypes[ext.replace('.', '')]   #try get mimetype
		except:
			return mimetypes['']

	except:
		return 'text/plain'




class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):   #used for forking requests - because /get_msg is waiting for new message and it will block other request without threading
	daemon_threads = True
	"""Handle requests in a separate thread."""


def main():
	try:
		port = 8008
		print('Listening on localhost:%s' % port)

		server = ThreadedHTTPServer(('', port), RequestHandler)
		server.serve_forever()

	except KeyboardInterrupt:   #handle CTRL+C
		print('^C received, shutting down server')
		server.shutdown()
		print("Closing server")
   		server.server_close()



if __name__ == "__main__":  
	main()