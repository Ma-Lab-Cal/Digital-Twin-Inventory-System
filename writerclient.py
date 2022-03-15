import json
import socket
import time
import datetime


def resetConnection():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    is_connected = False

    while not is_connected:
        try:
            s.connect(("127.0.0.1", 8000))
        except ConnectionRefusedError:
            print("retrying...")
            continue
        is_connected = True
    
    return s

s = resetConnection()

while True:
    s.send(json.dumps({"func": "getAll", "params": {}}).encode())
    try:
        buffer = s.recv(1024)
    except (ConnectionResetError, ConnectionAbortedError):
        s = resetConnection()
        continue
    
    if not buffer:
        continue
    
    data = json.loads(buffer.decode())
    with open("data/{0}.csv".format(datetime.datetime.now().strftime("%Y-%m-%d")), "a", encoding="utf-8") as f:
        entry = data.get("params")
        csv_entry = "{timestamp},{temperature},{humidity}".format(
            timestamp=entry.get("/node0/timestamp"), 
            temperature=entry.get("/node0/temperature"),
            humidity=entry.get("/node0/humidity"),
            )
        f.write(csv_entry + "\n")

    time.sleep(5)
    print(data)
