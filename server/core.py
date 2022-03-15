import asyncio
import datetime
import random
#import websockets
import hashlib
import base64

# ==========================


def getKeyHash(key):
    #id = "dGhlIHNhbXBsZSBub25jZQ=="
    guid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

    key = key + guid
    digest = hashlib.sha1(key.encode()).digest()

    key = base64.b64encode(digest)

    #print(key)
    return key

import socket
import struct
import threading

class FlamingoWS:

    @staticmethod
    def receive(conn, frame_size=1024):
        buffer = conn.recv(frame_size)

        if len(buffer) == frame_size:
            # there may be remaining data
            # we then use timeout method to try to receive all the data
            conn.settimeout(.02)
            try:
                b = conn.recv(frame_size)
            except socket.timeout:
                conn.settimeout(0)
                return buffer
        
            while b:
                buffer += b
                try:
                    b = conn.recv(frame_size)
                except socket.timeout:
                    b = b""
            
            conn.settimeout(0)
        return buffer

    def __init__(self, addr=("localhost", 8000), n_connections=8):
        self.addr = addr
        self.n_connections = n_connections

        self.handlers = {}
        
        self._s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

        self._s.bind(self.addr)
        self._s.listen(self.n_connections)

    def addSocketHandler(self, uri, handler):
        # convert to absolute path
        if uri[0] != "/":
            uri = "/" + uri
        
        self.handlers[uri] = handler

    def addRequestHandler(self, uri, handler):
        if uri[0] != "/":
            uri = "/" + uri
        
        self.handlers[uri] = handler

    def handleConnection(self, conn, addr):
        
        # handle as normal HTTP request
        request = Request()
        # receive all data
        buffer = FlamingoWS.receive(conn)

        # parse HTTP header
        request.parseHTTPRequest(buffer)

        
        key = getKeyHash(request.headers["Sec-WebSocket-Key"])
        
        response = b"HTTP/1.1 101 Switching Protocols\r\n" +\
                b"Connection: Upgrade\r\n" +\
                b"Upgrade: websocket\r\n" +\
                b"Sec-WebSocket-Accept: " + key + b"\r\n\r\n"
        response = response

        # switch protocol
        conn.send(response)

        # route to user function    
        self.handlers[request.uri](Comm(conn))

        conn.close()


    def run(self):
        conn, addr = self._s.accept()

        t = threading.Thread(target=self.handleConnection, args=(conn, addr))
        t.start()

class Request:
    def __init__(self):
        self.method = ""
        self.uri = ""
        self.http_version = ""
        self.headers = {}
        self.content = ""
        
        self._conn = None

    def parseHTTPRequest(self, buffer):
        content_splitter = buffer.find(b"\r\n\r\n")
        self.content = buffer[content_splitter:]

        buffer = buffer.decode()
        buffer_split = buffer.split("\r\n")

        self.method, self.uri, self.http_version = buffer_split[0].split(" ")

        self.headers = {}
        for entry in buffer_split[1:]:
            splitter = entry.find(":");
            key = entry[:splitter]
            val = entry[splitter+1:].lstrip()
            self.headers[key] = val


class Comm:
    def __init__(self, conn):
        self.conn = conn
    
    def receive(self):
        frame_header, = struct.unpack(">B", self.conn.recv(1))
        fin = (frame_header >> 7) & 0b1
        opcode = (frame_header >> 0) & 0b1111
        
        frame_header, = struct.unpack(">B", self.conn.recv(1))
        mask = (frame_header >> 7) & 0b1

        # Decoding Payload Length
        payload_len = (frame_header >> 0) & 0b1111111

        if payload_len > 125:
            pass


        #print(fin, opcode, mask, payload_len)
        # Reading and Unmasking the Data
        
        if not mask:
            # server must disconnect from a client if that client sends an unmasked message
            print("not encoded")
            conn.close()
            return

        masking_key = self.conn.recv(4)

        raw_content = self.conn.recv(payload_len)

        content = b""
        for i in range(payload_len):
            content += struct.pack(">B", raw_content[i] ^ masking_key[i % 4])

        print("content:", content)
        return content

    def transmit(self, buffer):
        fin = 1
        opcode = 1
        payload_len = len(buffer)
        frame_header = struct.pack(">BB", (fin << 7) | opcode, payload_len)
        self.conn.send(frame_header)
        self.conn.send(buffer)
        


import time
                
def echoHandler(comm):
    while True:
        print("handle!")
        data = comm.receive()
        print(data)
        comm.transmit(data)
    
print("tes")
app = FlamingoWS(("0.0.0.0", 8000))

app.addSocketHandler("/ws", echoHandler)

app.run()


while True:
    print("main loop")
    time.sleep(2)
    
