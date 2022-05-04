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

logging.basicConfig(format="%(asctime)s <%(name)s> [%(levelname)s]: %(message)s", datefmt="%Y-%m-%d_%H:%M:%S", level=logging.DEBUG)

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
        
        self.keys = [
            "timestamp", 
            "node_name", 
            "temperature", 
            "humidity",
            "pm1_0",
            "pm2_5",
            "pm10",
            "particles_0_3_um",
            "particles_1_um",
            "particles_10_um",
            "lux",
            "magnetic_x",
            "magnetic_y",
            "magnetic_z",
            "noise",
        ]
        self.db = sqlite3.connect("C:\\Users\\ma-la\\Documents\\Digital-Twin-Inventory-System\\environmental_data.db", check_same_thread=False)
        self.db.execute("""CREATE TABLE IF NOT EXISTS EnvironmentalData (
                timestamp     DATETIME PRIMARY KEY,
                node_name     TINYTEXT NOT NULL,
                temperature   DOUBLE,
                humidity      DOUBLE,
                pm1_0         DOUBLE,
                pm2_5         DOUBLE,
                pm10          DOUBLE,
                particles_0_3_um  DOUBLE,
                particles_1_um    DOUBLE,
                particles_10_um   DOUBLE,
                lux           DOUBLE,
                magnetic_x    DOUBLE,
                magnetic_y    DOUBLE,
                magnetic_z    DOUBLE,
                noise         DOUBLE
            );""")


        self._stop = threading.Event()
        
        self._s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._s.bind(self.addr)
        self._s.listen(self.n_connections)
        self._s.settimeout(1)
    
    def addData(self, data):
        # data filtering
        timestamp =         data.get("/timestamp")
        node_name =         data.get("/node_name")
        temperature =       data.get("/temperature") if data.get("/temperature") else -1
        humidity =          data.get("/humidity") if data.get("/humidity") else -1
        pm1_0 =             data.get("/pm1_0") if data.get("/pm1_0") else -1
        pm2_5 =             data.get("/pm2_5") if data.get("/pm2_5") else -1
        pm10 =              data.get("/pm10") if data.get("/pm10") else -1
        particles_0_3_um =  data.get("/particles_0_3_um") if data.get("/particles_0_3_um") else -1
        particles_1_um =    data.get("/particles_1_um") if data.get("/particles_1_um") else -1
        particles_10_um =   data.get("/particles_10_um") if data.get("/particles_10_um") else -1
        lux =               data.get("/lux") if data.get("/lux") else -1
        magnetic_x =        data.get("/magnetic_x") if data.get("/magnetic_x") else -1
        magnetic_y =        data.get("/magnetic_y") if data.get("/magnetic_y") else -1
        magnetic_z =        data.get("/magnetic_z") if data.get("/magnetic_z") else -1
        noise =             data.get("/noise") if data.get("/noise") else -1

        exe_str = """INSERT INTO EnvironmentalData ({keys})
            VALUES (
                {timestamp}, "{node_name}", {temperature}, {humidity}, 
                {pm1_0}, {pm2_5}, {pm10}, {particles_0_3_um}, {particles_1_um}, {particles_10_um}, 
                {lux}, {magnetic_x}, {magnetic_y}, {magnetic_z}, {noise}
                );""".format(
                    keys=", ".join(self.keys),
                    timestamp=timestamp,
                    node_name=node_name,
                    temperature=temperature,
                    humidity=humidity,
                    pm1_0=pm1_0,
                    pm2_5=pm2_5,
                    pm10=pm10,
                    particles_0_3_um=particles_0_3_um,
                    particles_1_um=particles_1_um,
                    particles_10_um=particles_10_um,
                    lux=lux,
                    magnetic_x=magnetic_x,
                    magnetic_y=magnetic_y,
                    magnetic_z=magnetic_z,
                    noise=noise,
                )

        # print(exe_str)
        cur = self.db.cursor()
        cur.execute(exe_str)

        self.db.commit()
    
    def getData(self, start_time, end_time):
        cur = self.db.cursor()
        cur.execute("""SELECT * FROM EnvironmentalData WHERE timestamp BETWEEN {start_time} AND {end_time};""".format(start_time=start_time, end_time=end_time))
        data = cur.fetchall()
        processed_data = []
        for entry in data:
            processed_data.append(dict(zip(self.keys, entry)))
        
        return processed_data
        

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