import time
import json

from flamingo import FlamingoNT




app = FlamingoNT(("0.0.0.0", 8000))


def echoHandler(stream):
    while not app.is_stopped():
        data = stream.receive()
        print("ws conn:", data)
        resp_data = app.getNT()
        print("ws resp:", resp_data)
        stream.transmit(json.dumps(resp_data).encode())


# add websocket handler interface
app.addSocketHandler("/ws", echoHandler)

app.run()

print("App quit.")
