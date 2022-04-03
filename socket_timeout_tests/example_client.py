# Echo client program
import socket
import time


class SimpleClient:
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
    
    @staticmethod
    def transmit(conn, data):
        try:
            conn.sendall(data)
        except (ConnectionResetError, ConnectionAbortedError):
            return False
        return True

    def __init__(self, addr):
        self.addr = addr

    def connect(self):
        print("<client> connecting to server")
        while True:
            try:
                self._s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                self._s.settimeout(1)
                self._s.connect(("127.0.0.1", 6000))
            except OSError:
                time.sleep(1)
                print("<client> connect() timeout")
                continue
            return


    def run(self):
        while True:
            self.connect()

            while True:
                success = SimpleClient.transmit(self._s, b"hello world\n")
                if not success:
                    break

                data = SimpleClient.receive(self._s)

                print("Received", data)

            self._s.close()

client = SimpleClient(("127.0.0.1", 6000))
client.run()
