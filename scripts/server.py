import datetime
import hashlib
import base64
import socket
import struct
import threading
import json
import logging
import time
import sqlite3

# ==========================
ENV_DB_PATH = "C:\\Users\\ma-la\\Documents\\Digital-Twin-Inventory-System\\data\\environmental_data.db"

logging.basicConfig(format="%(asctime)s <%(name)s> [%(levelname)s]: %(message)s", datefmt="%Y-%m-%d_%H:%M:%S", level=logging.DEBUG)


class DataBase:
    def __init__(self, path):
        self.path = path
        
        self._db = sqlite3.connect(self.path, check_same_thread=False)

    def createTable(self, table_name, structure):
        self.table_name = table_name
        self.keys = [entry[0] for entry in structure]
        self.types = [entry[1] for entry in structure]
        
        exec_str = "CREATE TABLE IF NOT EXISTS "
        exec_str += table_name
        exec_str += "("

        entries = []
        for i, key in enumerate(self.keys):
            entries.append("{0} {1}".format(key, self.types[i]))
        exec_str += ",".join(entries)
        
        exec_str += ");"

        self._db.execute(exec_str)

    def insert(self, entry):
        assert len(entry) == len(self.keys)

        entry = ["\"{0}\"".format(elem) if type(elem) == str else str(elem) for elem in entry]

        exec_str = "INSERT INTO EnvironmentalData"
        exec_str += "({0})".format(",".join(self.keys))
        exec_str += "VALUES ("
        exec_str += ",".join(entry)
        exec_str += ");"
        
        cur = self._db.cursor()
        cur.execute(exec_str)

        self._db.commit()

    
    def getData(self, start_time, end_time):
        '''
        cur = self._db.cursor()
        cur.execute("""SELECT * FROM EnvironmentalData WHERE timestamp BETWEEN {start_time} AND {end_time};""".format(start_time=start_time, end_time=end_time))
        data = cur.fetchall()
        processed_data = []
        for entry in data:
            processed_data.append(dict(zip(self.keys, entry)))
        
        return processed_data
        '''
        cur = self._db.cursor()
        cur.execute("""SELECT * FROM EnvironmentalData WHERE timestamp BETWEEN {start_time} AND {end_time};""".format(start_time=start_time, end_time=end_time))
        data = cur.fetchall()
        return data

def getKeyHash(key):
    #id = "dGhlIHNhbXBsZSBub25jZQ=="
    guid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

    key = key + guid
    digest = hashlib.sha1(key.encode()).digest()

    key = base64.b64encode(digest)

    return key


class FlamingoNT:
    def __init__(self, addr=("localhost", 8000), n_connections=8):
        self.addr = addr
        self.n_connections = n_connections
        
        self.db = DataBase(ENV_DB_PATH)
        structure = [
            ["timestamp",   "DATETIME PRIMARY KEY"],
            ["node",        "TINYTEXT NOT NULL"],
            ["temperature", "DOUBLE"], 
            ["humidity",    "DOUBLE"],
            ["pm1_0",       "DOUBLE"],
            ["pm2_5",       "DOUBLE"],
            ["pm10",        "DOUBLE"],
            ["magnetic_x",  "DOUBLE"],
            ["magnetic_y",  "DOUBLE"],
            ["magnetic_z",  "DOUBLE"],
            ["lux",         "DOUBLE"],
            ]

        self.db.createTable("EnvironmentalData", structure)


        self._stop = threading.Event()
        
        self._s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._s.bind(self.addr)
        self._s.listen(self.n_connections)
        self._s.settimeout(1)
    
    def getData(self, start_time, end_time):
        return self.db.getData(start_time, end_time)
        
    def handleConnection(self, conn, addr, _stop):
        logging.debug("Handling connection {addr}".format(addr=addr))
        conn.settimeout(1)
        
        # handle as normal HTTP request
        request = Request(conn)

        # parse HTTP header
        is_HTTP_request = request.parseHTTPRequest()
        
        # handle WS conn
        if is_HTTP_request:
            logging.debug("Handle connection {addr} as HTTP request".format(addr=addr))
            print(request.headers)
            
            # is a websocket upgrade request
            if request.headers.get("Connection") == "Upgrade" and request.headers.get("Upgrade") == "websocket":
                key = request.headers.get("Sec-WebSocket-Key")
                if not key:
                    conn.close()
                    logging.error("Websocket request missing \"Sec-WebSocket-Key\"!")
                    return
                
                key = getKeyHash(key)
            
                upgrade_response = b"HTTP/1.1 101 Switching Protocols\r\n" +\
                        b"Connection: Upgrade\r\n" +\
                        b"Upgrade: websocket\r\n" +\
                        b"Sec-WebSocket-Accept: " + key + b"\r\n\r\n"

                # switch protocol
                conn.send(upgrade_response)

                stream = WebSocketStream(conn)

                buffer = stream.receive()

                data = json.loads(buffer.decode())
                # print(data)

                ret_data = self.getData(data["params"].get("range")[0], data["params"].get("range")[1])
                # print(ret_data)
                buffer = json.dumps({"method": "RET", "data": ret_data}).encode()
                stream.transmit(buffer)

        # handle pure socket conn
        else:
            logging.debug("Handle connection {addr} as socket connection".format(addr=addr))
            

            # we already read from conn for the first package, so handle it directly
            buffer = request._buffer

            while True:

                if not buffer:
                    break

                data = buffer.decode()
                buffer = b""

                try:
                    data = json.loads(data)
                except json.JSONDecodeError:
                    logging.error("JSON decode error: {data}".format(data=data))
                    continue
                    
                logging.debug("received: {data}".format(data=data))
                
                self.addData(data.get("params"))
                
                
                conn.send(json.dumps({"method": "RET", "params": {"message": "ADD OK!"}}).encode())
                
                buffer = Stream.receivePacket(conn, timeout=10)
                

        conn.close()
        logging.info("Socket client session stopped.")
        

    def run(self):
        logging.info("Connection acceptance service started.")
        try:
            while not self._stop.is_set():
                while not self._stop.is_set():
                    try:
                        conn, addr = self._s.accept()
                    except socket.timeout:
                        continue
                    break
                t = threading.Thread(target=self.handleConnection, args=(conn, addr, self._stop))
                t.start()

        except KeyboardInterrupt:
            self.stop()
        
        logging.info("Connection acceptance service stopped.")
    
    def is_stopped(self):
        return self._stop.is_set() 

    def stop(self):
        logging.info("Stopping server...")
        self._stop.set()
    

class Stream:
    @staticmethod
    def receive(conn, size, timeout=60):
        target_timeout = time.time() + timeout
        conn.settimeout(.5)
        
        while True:
            try:
                buffer = conn.recv(size)
            except (socket.timeout, ConnectionResetError, ConnectionAbortedError):
                if time.time() < target_timeout:
                    continue
                return b""
            
            if buffer == b"":
                if time.time() < target_timeout:
                    continue
                return b""

            return buffer
           
    @staticmethod 
    def transmit(conn, data):
        conn.settimeout(.5)

        try:
            conn.sendall(data)
        except (ConnectionResetError, ConnectionAbortedError):
            return False
        return True
        
    @staticmethod
    def receivePacket(conn, timeout=60):
        c = b""
        buffer = b""

        while c != b"\x0A":
            buffer += c
            c = Stream.receive(conn, 1, timeout)
            
            # if remote closes connection, we will not get timeout, but empty data
            if c == b"":
                return buffer
        
        return buffer

    @staticmethod
    def transmitPacket(conn, data):
        Stream.transmit(conn, data + b"\n")


class Request:
    def __init__(self, conn):
        self.method = ""
        self.uri = ""
        self.http_version = ""
        self.headers = {}
        self.content = ""
        
        self._conn = conn
        self._buffer = b""
    
    def receive(self, frame_size=1024):
        buffer = b""
        while True:
            try:
                buf = self._conn.recv(frame_size)
            except (socket.timeout, ConnectionResetError, ConnectionAbortedError):
                return buffer

            if buf == b"":
                return buffer

            buffer += buf

            if len(buf) < frame_size:
                return buffer

    def parseHTTPRequest(self):
        # receive all data
        buffer = self.receive()
        self._buffer = buffer

        # detect if this is really a HTTP request
        nl_pos = buffer.find(b"\r\n")
        if nl_pos == -1 or buffer[nl_pos-8:nl_pos] != b"HTTP/1.1":
            return False
        
        content_splitter = buffer.find(b"\r\n\r\n")
        self.content = buffer[content_splitter:]

        buffer = buffer.decode()
        buffer_split = buffer.split("\r\n")

        self.method, self.uri, self.http_version = buffer_split[0].split(" ")

        self.headers = {}
        for entry in buffer_split[1:]:
            splitter = entry.find(":")
            key = entry[:splitter]
            val = entry[splitter+1:].lstrip()
            self.headers[key] = val

        return True

class WebSocketStream:
    def __init__(self, conn, timeout=60):
        self.conn = conn
        self.conn.settimeout(1)
        self.timeout = timeout

    def receive(self, timeout=10):
        frame_header, = struct.unpack(">B", Stream.receive(self.conn, 1, timeout=timeout))
        fin = (frame_header >> 7) & 0b1
        opcode = (frame_header >> 0) & 0b1111
        
        frame_header, = struct.unpack(">B", Stream.receive(self.conn, 1, timeout=timeout))
        mask = (frame_header >> 7) & 0b1

        # Decoding Payload Length
        payload_len = (frame_header >> 0) & 0b1111111

        if payload_len == 126:
            payload_len, = struct.unpack(">H", Stream.receive(self.conn, 2, timeout=timeout))
        elif payload_len == 127:
            payload_len, = struct.unpack(">Q", Stream.receive(self.conn, 8, timeout=timeout))

        #print(fin, opcode, mask, payload_len)
        # Reading and Unmasking the Data
        
        if not mask:
            # server must disconnect from a client if that client sends an unmasked message
            print("not encoded")
            conn.close()
            return

        masking_key = Stream.receive(self.conn, 4, timeout=timeout)

        raw_content = Stream.receive(self.conn, payload_len, timeout=timeout)

        content = b""
        for i in range(payload_len):
            content += struct.pack(">B", raw_content[i] ^ masking_key[i % 4])

        # print("content:", content)
        return content

    def transmit(self, buffer):
        fin = 1
        opcode = 1
        payload_len = len(buffer)
        if payload_len <= 125:
            frame_header = struct.pack(">BB", (fin << 7) | opcode, payload_len)
        elif payload_len <= 65535:
            frame_header = struct.pack(">BBH", (fin << 7) | opcode, 126, payload_len)
        else:
            frame_header = struct.pack(">BBQ", (fin << 7) | opcode, 127, payload_len)
        Stream.transmit(self.conn, frame_header)
        Stream.transmit(self.conn, buffer)
        
app = FlamingoNT()
app.run()
