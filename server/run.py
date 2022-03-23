import json
import socket
import threading

class FlamingoSocket:
    def __init__(self, addr=("localhost", 8000), n_connections=8):
        self.addr = addr
        self.n_connections = n_connections

        self.handlers = {
            "set": self.default_set,
            "getall": self.default_getAll,
        }

        self.nt = {}

        self._killed = False

        self._s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self._s.bind(self.addr)
        self._s.listen(self.n_connections)
        self._s.settimeout(1)
    
    def run(self):
        while True:
            try:
                try:
                    conn, addr = self._s.accept()
                except TimeoutError:
                    continue

                print(addr)
                t = threading.Thread(target=self.handle, args=(conn,))
                t.start()
            except KeyboardInterrupt:
                self._killed = True
                print("server killed")
                return

    def handle(self, conn):
        while not self._killed:
            try:
                buffer = conn.recv(1024)
            except ConnectionResetError:
                print("client gone")
                #return
                break
            
            if not buffer:
                print("empty response")
                break
            
            data = json.loads(buffer.decode())
            func = self.handlers.get(data.get("func").lower())

            if not func:
                conn.send(b"NACK")
                continue

            ret = func(data.get("params"))

            conn.send(json.dumps({"func": "ret", "params": ret}).encode())
                
            print("nt:", self.nt)
            
        
        print("handler killed")
    
    def default_set(self, params):
        for key in params:
            self.nt[key] = params[key]
        return ""
    
    def default_getAll(self, params):
        return self.nt



app = FlamingoSocket(("0.0.0.0", 8000))

app.run()

print("end")
