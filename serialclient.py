import time
import json
import socket

import random

import serial

ser = serial.Serial("COM3", baudrate=115200, timeout=0.2)

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
    c = ser.read()
    buf = b""
    while c:
        buf += c
        c = ser.read()
    
    if not buf:
        continue
    
    data = json.loads(buf.decode())
    print(data)

    s.send(json.dumps({"func": "set", "params": {"/node0/timestamp": time.time(), "/node0/temperature": data.get("temp"), "/node0/humidity": data.get("humidity")}}).encode())
    try:
        data = s.recv(1024)
    except ConnectionResetError:
        s = resetConnection()
        continue
    print(data)
