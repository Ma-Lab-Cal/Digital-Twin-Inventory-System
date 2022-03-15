import time
import json
import socket

import random

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
    s.send(json.dumps({"func": "set", "params": {"timestamp": time.time(),"temperature": random.random()}}).encode())
    try:
        data = s.recv(1024)
    except ConnectionResetError:
        s = resetConnection()
        continue
    print(data)
