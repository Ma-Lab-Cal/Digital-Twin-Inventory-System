# Echo server program
import socket
import threading

class SimpleServer:
    @staticmethod
    def receive(conn):
        c = b""
        buffer = b""

        while c != b"\x0A":
            buffer += c
            try:
                c = conn.recv(1)
            except (socket.timeout, ConnectionResetError, ConnectionAbortedError):
                print("<handler> recv() timeout")
                return buffer
            
            # if remote closes connection, we will not get timeout, but empty data
            if c == b"":
                return buffer
        
        return buffer

    def __init__(self, addr, n_connections=10):
        self.addr = addr
        self.n_connections = n_connections
        
        self._stop = threading.Event()

        self._s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)        
        self._s.bind(self.addr)
        self._s.listen(self.n_connections)

        self._s.settimeout(1)

    def connectionHandler(self, conn, addr, _stop):
        print("<handler> started with addr:", addr)
        conn.settimeout(1)
        while not _stop.is_set():
            data = SimpleServer.receive(conn)
            
            print(data)
            if not data:
                break
            
            conn.sendall(data+b"\n")
        conn.close()
        print("<handler> stopped with addr:", addr)

    def run(self):
        print("<server> started")
        try:
            while not self._stop.is_set():
                while not self._stop.is_set():
                    try:
                        conn, addr = self._s.accept()
                    except socket.timeout as e:
                        # print("<server> accept() timeout")
                        continue
                    break

                t = threading.Thread(target=self.connectionHandler, args=(conn, addr, self._stop))
                t.start()

        except KeyboardInterrupt as e:
            self._stop.set()
            print("<server> stop signal received")

        print("<server> stopped")


server = SimpleServer(("0.0.0.0", 6000))
server.run()
