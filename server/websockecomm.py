import time

from flamingo import FlamingoWS




app = FlamingoWS(("0.0.0.0", 8000))


def echoHandler(stream):
    while not app.is_stopped():
        print("handle!")
        data = stream.receive()
        print(data)
        stream.transmit(data)
    
print("tes")

app.addSocketHandler("/ws", echoHandler)

app.run()

while True:
    try:
        print("main loop")
        time.sleep(2)
    except KeyboardInterrupt:
        app.stop()    
